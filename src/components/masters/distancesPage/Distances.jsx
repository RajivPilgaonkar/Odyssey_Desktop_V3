import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbExecuteSp, setParamValues } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, isValidTime } from "../../common/CommonTransactionFunctions";
import { markSqlKeywordsObject} from "../../common/CommonFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetDistanceData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button as Btn} from 'devextreme-react/button';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getCityCrossings, getStateCrossings} from "../../common/GetDescFromIds";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';
import DropDownGrid from "../../common/DropDownGrid";

import '../../common/MasterGrid.css'

let compVar = {};

function Distances() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_cities_id = useSelector(state => state.params.cities_id);
  _g_cities_id = _g_cities_id || -1;

  const _g_location = useLocation();

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      cityLookup: [], 
      selectedCities_id: _g_cities_id, selectedCity: '',  
      tableName: 'distances', keyField: 'distances_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Distances', title: 'New Distance',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: true,
      toastIsVisible: false, toastMessage: '',
      navigationButtonList: [
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: true, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ],      
      admLevel: 1,
      dbLookup: [      
        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ],
      reverseRequired: false, createSectorsReqd: false
    }   
        
    fetchInitialData();
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);

  //**********************************************************/
  // This should execute only when the errorMsg changes
  // Ensure that 2nd argument is [errorMsg]
  // After 5 sec, the error message is auto-closed
  useEffect (() => {
    if (compVar.errorMsg > '') {
      setTimeout(() => {
        compVar.errorMsg = '';
        forceRender();
      }, 5000)
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.errorMsg]);
 

  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      const whereStr = " countries_id IN (SELECT countries_id FROM countries WHERE OperateBusiness = 1) ";
      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr, x_uid: _g_users_id, x_module: 'Distances'});   
      compVar.dbLookup[0].dataSource = compVar.cityLookup;  

      // if selected city is saved, use it
      if (compVar.selectedCities_id > -1)  {
        const idx = compVar.cityLookup.findIndex(rec => rec.cities_id === compVar.selectedCities_id);
        if (idx > -1) {
          compVar.selectedCity = compVar.cityLookup[idx].city;
        }
      }

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Distances'});   
      compVar.dbLookup[1].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      fieldArray = fieldArray.map((rec) => `d.${rec}`);    
      let whereStr = 'from_cities_id = ' + compVar.selectedCities_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['c.city'], table: 'distances d LEFT JOIN cities c ON d.to_cities_id = c.cities_id', where: whereStr, x_uid: _g_users_id, x_module: 'Distances'});   

      // this is done because time is a reserved SQL keyword and later causes problems in checkFormErrors ...
      compVar.mainData = compVar.mainData.map(rec => {return {...rec, duration: rec.time} })

      // Combine City Crossings - use for-of loops for async code -- not forEach      
      for (const rec of compVar.mainData) {
        const cityCrossingsObj = await getCityCrossings(rec.distances_id);
        rec.CityCrossings = cityCrossingsObj.cityList;
      }

      // Combine State Crossings - use for-of loops for async code -- not forEach      
      for (const rec of compVar.mainData) {
        const stateCrossingsObj = await getStateCrossings(rec.distances_id);
        rec.StateCrossings = stateCrossingsObj.stateList;
      }

      // check reverse required 
      const filterArr = compVar.mainData.filter(rec => rec.edited);      
      compVar.reverseRequired = (filterArr.length > 0);

      // check create sectors
      const sectorsArr =  await dbGetRecordRaw({query: "SELECT COUNT(*) AS x_count FROM Distances WHERE COALESCE(CreateSectors,0) = 1", x_uid: _g_users_id, x_module: 'Distances'});   
      compVar.createSectorsReqd = (sectorsArr[0].x_count > 0);

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);
    compVar.formTitle = 'From: ' + compVar.selectedCity;
    toggleEditPopup();    

  }

  //**********************************************************/
  const addRow = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      from_cities_id: compVar.selectedCities_id,
    }

    afterAdd(compVar, defaultObj);
    compVar.formTitle = 'From: ' + compVar.selectedCity;

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      {table: 'CityCrossings', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'City Crossings. Delete the city crossing details first'},
      {table: 'StateCrossings', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'State Crossings. Delete the state crossing details first'},
    ]);    

    if (error.errorMsg === '') {
      compVar.dialogMessage1 = 'Are you sure you want to delete this record?';
      compVar.popupDialogIndex = 0;
      setPopupDialogBoxVisible(true);
    } else {
      compVar.errorMsg = error.errorMsg;      
      forceRender();
    }

  }

  //**********************************************************/
  const saveFormData = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // This table has fields which are SQL keywords in square brackets [plan]
    markSqlKeywordsObject (tableHeaderArray, compVar.formData);    

    compVar.reverseRequired = true; 
    compVar.createSectorsReqd = true;

    // Remove any previous error messages
    compVar.errorMsg = '';

    // always mark as edited
    compVar.formData.edited = true;
    compVar.formData.CreateSectors = true;
    compVar.formData['[time]'] = compVar.formData.duration;

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }
    
    let tmpFormData = {...compVar.formData};

    let condition = "WHERE from_cities_id = " + compVar.formData.from_cities_id.toString() + " " + 
      "AND to_cities_id = " + compVar.formData.to_cities_id.toString();
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: _g_users_id,
        ModifiedOn: convert_DbDate_To_MDY()
      },
      afterPost: afterPost
    }
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    // reset focused row
    compVar.focusedRowKey = saveData.formData[compVar.keyField];

    // refresh data after save
    await filterData();

    compVar.formData = {...saveData.formData}; 
    compVar.formOldData = {...saveData.formData};
  
  }

  //**********************************************************/
  const checkFormErrors = async (formData) => {

    // required data errors
    const checkNullError = await checkNullErrors(tableHeaderArray, formData);
    if (checkNullError.errorNo === -1) {
      return checkNullError.errorDesc;
    }

    // Check other errors here like is amount < 0, is date less than today ....        
    if ((formData.duration !== null) && !isValidTime(formData.duration)) {
      return "Invalid 'Duration' entered";
    }


    return '';

  }

  //**********************************************************/
  const afterPost = async() => {

    if ((compVar.formMode === 1) || (compVar.formMode === 2)) {
      await closePopup();
    }
       
    // refresh data
    await filterData();

  }

  //**********************************************************/
  const getSelectedCity = (e) => {
    compVar.formData.to_cities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearCityLookup = () => {
    compVar.formData.to_cities_id = null;
  }

  //**********************************************************/
  const clearUserLookup = () => {
    compVar.formData.ModifiedByUsers_id = null;
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.errorMsg = '';

    // Here, always refresh as child city & state tables might be updated
    //if (compVar.isEdited) {
      await filterData();
    //}
  };  
  
  //**********************************************************/
  const toggleHelp = () => {
    setHelpVisible(() => {return !helpVisible});
  }; 
  
  //**********************************************************/
  const toggleHint = () => {
    setHintVisible(() => {return !hintVisible});
  }; 
  
  //**********************************************************/
  const onToastHiding = () => {
    compVar.toastIsVisible = false;
    forceRender();
  }

  //**********************************************************/
  const customizeText = (cellInfo) => {
    if (!cellInfo.value) 
      return ''
    else
      return String(cellInfo.valueText);
  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const onFocusedRowChanged = (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data[compVar.keyField];

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;
        forceRender();
      }

    }

  }

  //**********************************************************/
  const onFormFieldDataChanged = () => {
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.edited) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Edited Record. Please generate the reverse for this';
      } 
    }
  }

  //**********************************************************/
  const updateReverseRoutes = async(e) => {

    setDataFetched(false);

    // fill reverse distances where records where edited = 1
    const sql = "EXEC [p_AutoFillCityDistance] " + compVar.selectedCities_id.toString();
    let spData = {sql: sql, x_uid: _g_users_id, x_module: 'Distances'};
    try {
      await dbExecuteSp(spData);  
    } catch (err) {
      alert(err);
    }

    await filterData();

  }

  //**********************************************************/
  const deleteReverseRoute = async(distances_id) => {

    setDataFetched(false);

    // fill reverse distances where records where edited = 1
    const sql = "EXEC [p_AutoDeleteCityDistance] " + distances_id.toString();
    let spData = {sql: sql, x_uid: _g_users_id, x_module: 'Distances'};
    try {
      await dbExecuteSp(spData);  
    } catch (err) {
      alert(err);
    }

  }

  //**********************************************************/
  const updateSectors = async(e) => {

    setDataFetched(false);

    const today = convert_DbDate_To_MDY(null,2);

    // fill sectors for use in route finder
    const sql = "EXEC [p_CreateSectors] '" + today + "'";
    let spData = {sql: sql, x_uid: _g_users_id, x_module: 'Distances'};
    try {
      await dbExecuteSp(spData);  
    } catch (err) {
      alert(err);
    }

    await filterData();

  }

  //**********************************************************/
  const saveFormDataLeaveOpen = async () => {
    compVar.saveLeaveOpen = true;
    await saveFormData();
  }

  //**********************************************************/
  const getNavigationButtonsJsx = () => {

    if (compVar.tabIndex !== undefined && compVar.tabIndex > 1) {
      return (<div></div>);
    }

    return (
      <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
        <Btn {...compVar.navigationButtonList[0]} />
      </div>
    );

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onRowPrepared: onRowPrepared
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    // Make the to_cities_id read-only during edit as that would otherwise mess with the reverse
    const idx = tableHeaderArray.findIndex(rec => rec.field === 'to_cities_id');
    if (idx > -1) {
      tableHeaderArray[idx].editorOptions.readOnly = (compVar.formMode === 2) ? true : false;
    }

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialCityLookupValues = getLookupValues(
      clearCityLookupValues,compVar.cityLookup, 
      ['cities_id', 'city'], compVar.formData.to_cities_id);

    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearCityLookup, clearUserLookup],
      getSelectedRecord: [getSelectedCity, getSelectedUser],
      initialLookupValues: [initialCityLookupValues, initialUserLookupValues],
      clearLookupValues: [clearCityLookupValues, clearUserLookupValues],
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,
      refreshFormData: forceRender,
      formTitle: compVar.formTitle,
      admLevel: compVar.admLevel
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.selectedCities_id > 0) ? compVar.canAdd : false;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createCityParams = () => {

    return (
      <DropDownGrid
        listArray={compVar.cityLookup}
        fieldList={['city']}
        valueExpr="cities_id"
        displayExpr="city"
        label="From City"
        placeholder="Select a city..."
        getSelectedRecord={onCitySelect}
        showColumnHeaders={false}
        value={compVar.selectedCity}
        labelStyle={{width: 100}}
        dropDownStyle={{width: 100}}
        dropDownOptions={{width: 300}}
      />
  
    );

  }

  //**********************************************************/
  const createUpdateButtons = () => {

    const reverseReqdButtonType = (compVar.reverseRequired) ? "danger" : "normal";
    const reverseReqdButtonStylingMode = (compVar.reverseRequired) ? "contained" : "outlined";

    const createSectorsButtonType = (compVar.createSectorsReqd) ? "danger" : "normal";
    const createSectorsButtonStylingMode = (compVar.createSectorsReqd) ? "contained" : "outlined";

    const hintReverseReqd = "Update Reverse Route (only edited 'To Cities')" + ((compVar.selectedCity.trim().length > 0) ? ' from ' + compVar.selectedCity : '');

    return (
      <>
        <Btn
          width={35}
          height={35}
          type={createSectorsButtonType}
          stylingMode={createSectorsButtonStylingMode}
          icon={"icons/routeFinder.png"}
          hint={'Update data for Route Finder (Create Sectors)'}
          onClick={updateSectors}
        />

        <div style={{width: 30}}></div>

        {compVar.selectedCities_id > 0 &&
          <Btn
            width={35}
            height={35}
            type={reverseReqdButtonType}
            stylingMode={reverseReqdButtonStylingMode}
            icon={"icons/reverse.png"}
            hint={hintReverseReqd}
            background={'red'}
            onClick={updateReverseRoutes}
          />
        }
      </>
  
    );

  }

  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    //const recObj = {table: compVar.tableName, keyField: compVar.keyField, keyValue: compVar.focusedRowKey}
    setPopupDialogBoxVisible(() => {return false});

    if (e===1) {
      const idx = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      compVar.focusedRowKey = (idx > 0) ? compVar.mainData[idx-1][compVar.keyField] : null;  
      const distances_id = compVar.mainData[idx][compVar.keyField];
      //await dbDeleteRecord(recObj);
      // Here the record gets deleted in the SP so do not execute the dbDeleteRecord in the prev line
      deleteReverseRoute(distances_id);
      await filterData();
    }
  }
    
  //*********************************************************/
  const onCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.selectedCities_id = e[0].cities_id;
      compVar.selectedCity = e[0].city;  

      // Save to redux store hrough params reducer
      dispatch(setParamValues({cities_id: compVar.selectedCities_id}));
      filterData();
    }
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();
    const elementProps = createElementProps();
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>

          {!editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <div className="master-grid-params-container">
                {createUpdateButtons()}
              </div>
              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container">
                {createCityParams()}
              </div>
            </div>        
          }          

          {!editPopupVisible &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }
              {getDevExtremeTable(dataObj, true)}
            </div>
          }

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {popupDialogBoxVisible && 
            <PopupDialogBox
              open={true}
              message1={compVar.dialogMessage1}
              message2={compVar.dialogMessage2}
              getSelectedOption={compVar.popupSelectedOptions[compVar.popupDialogIndex]}
            >
            </PopupDialogBox>
          }

        </div>

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default Distances;
