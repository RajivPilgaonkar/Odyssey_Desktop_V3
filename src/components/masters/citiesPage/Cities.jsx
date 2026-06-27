import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Switch from "react-switch";
import { dbGetRecord, dbDeleteRecord } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, escapeSingleQuotes } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetCityData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';

import '../../common/MasterGrid.css'

let compVar = {};

function Cities() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [activeCity, setActiveCity] = useState(true);
  const [activeBusinessCity, setActiveBusinessCity] = useState(true);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      stateLookup: [], countryLookup: [],
      tableName: 'cities', keyField: 'cities_id',
      masterDescField: 'city',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Cities', title: 'New City',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Description', index: 1},{title: 'Media', index: 2},{title: 'Maps', index: 3}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 510,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: true, displayHeaderFilter: true,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [       
        {keyField: 'states_id', dataSource: compVar.stateLookup, 
        displayExpr: 'state', valueExpr: 'states_id', fieldList: ['state']},

        {keyField: 'countries_id', dataSource: compVar.countryLookup, 
        displayExpr: 'country', valueExpr: 'countries_id', fieldList: ['country']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ]
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
  // This should execute only when the active flag changes
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [activeCity, activeBusinessCity]);

  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.stateLookup = await dbGetRecord({fields: ['states_id', 'state'], orders: ['state'], table: 'states', x_uid: _g_users_id, x_module: 'Cities'});   
      compVar.dbLookup[0].dataSource = compVar.stateLookup;
  
      compVar.countryLookup = await dbGetRecord({fields: ['countries_id', 'country'], orders: ['country'], table: 'countries', x_uid: _g_users_id, x_module: 'Cities'});   
      compVar.dbLookup[1].dataSource = compVar.countryLookup;
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Cities'});   
      compVar.dbLookup[2].dataSource = compVar.userLookup;    
    } catch(err) {
      alert(err);
    }
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const active = activeCity ? 1 : 0;
    const activeStr = (activeCity) ? "Active = " + active.toString() : "(1=1)";

    const activeBusiness = activeBusinessCity ? 1 : 0;
    const activeBusinessStr = (activeBusiness) ? " AND Countries_id IN " +
     "(SELECT Countries_id FROM Countries WHERE OperateBusiness = 1) " : "";

    let fieldArray = getFieldsArray(tableHeaderArray);
    let whereStr = activeStr + ' ' + activeBusinessStr;
    try {
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['city'], table: 'cities', where: whereStr, x_uid: _g_users_id, x_module: 'Cities'});   
    } catch(err) {
      alert(err);
    }
    compVar.mainData = compVar.mainData.map(rec => {return {...rec,Alias: rec.city + ' ' + ((rec.cityAlias !== null) ? rec.cityAlias : '')} });

    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);
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
    }

    afterAdd(compVar, defaultObj);

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      {table: 'addressbook', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Addressbook. Delete the addressbook details first'},
      {table: 'QuoCities', condition: 'WHERE FromCities_id = ' + e.row.data[compVar.keyField], existsIn: 'Tour Cities. Delete the tour city details first'},
      {table: 'QuoCities', condition: 'WHERE ToCities_id = ' + e.row.data[compVar.keyField], existsIn: 'Tour Cities. Delete the tour city details first'},
      {table: 'vouchers', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Vouchers. Delete the voucher details first'},
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

    // Remove any previous error messages
    compVar.errorMsg = '';

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }

    let tmpFormData = {...compVar.formData};

    let condition = "WHERE " + compVar.masterDescField + " = '" + escapeSingleQuotes(compVar.formData[compVar.masterDescField]) + "' " + 
      "AND Countries_id = " + compVar.formData.countries_id.toString() + " ";
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

    // form validation errors
    if ((formData.countries_id === 200) && (formData.states_id === null)) {
      return '"State" has to be entered when the country is India';
    }

    // form validation errors
    if ((formData.countries_id === null) && (formData.states_id !== null)) {
      return '"State" can be entered only when the country is India';
    }

    // form validation errors
    if (formData.nighthalt && ((formData.DefaultDays === null) || (formData.DefaultDays === 0))) {
      return 'If Night Halt, the Recommended Nights have to be entered';
    }

    // form validation errors
    if (((formData.DefaultDays !== null) && (formData.DefaultDays > 0)) && !formData.nighthalt) {
      return 'If Recommended Nights are entered, the Night Halt must be ticked';
    }

    // Check other errors here like is amount < 0, is date less than today ....
        
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
  const getSelectedState = (e) => {
    compVar.formData.states_id = e[0].states_id;
  }

  //**********************************************************/
  const getSelectedCountry = (e) => {
    compVar.formData.countries_id = e[0].countries_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearStateLookup = () => {
    compVar.formData.states_id = null;
  }

  //**********************************************************/
  const clearCountryLookup = () => {
    compVar.formData.countries_id = null;
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
    compVar.tabIndex = 0;  
   
    if (compVar.isEdited) {
      await filterData();
    }
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
  const onActiveSwitchChange = (e) => {
    setActiveCity(e);
  }

  //**********************************************************/
  const onActiveBusinessCitySwitchChange = (e) => {
    setActiveBusinessCity(e);
  }

  //**********************************************************/
  const onTabOptionChanged = (e) => {
    if ((e.addedItems !== undefined) && (e.addedItems.length > 0)) {
      const selectedTab = e.addedItems[0].title;
      let obj = compVar.tabs.find(o => o.title === selectedTab);
      let selectedTabIndex = obj.index;
      compVar.tabIndex = selectedTabIndex;  
    }
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
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearStateLookupValues = {states_id: null, state: ''};
    const clearCountryLookupValues = {countries_id: null, country: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialStateLookupValues = getLookupValues(
      clearStateLookupValues,compVar.stateLookup, 
      ['states_id', 'state'], compVar.formData.states_id);

    const initialCountryLookupValues = getLookupValues (
      clearCountryLookupValues, compVar.countryLookup, 
      ['countries_id','country'], compVar.formData.countries_id);
  
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

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
      clearLookup: [clearStateLookup, clearCountryLookup, clearUserLookup],
      getSelectedRecord: [getSelectedState, getSelectedCountry, getSelectedUser],
      initialLookupValues: [initialStateLookupValues, initialCountryLookupValues, initialUserLookupValues],
      clearLookupValues: [clearStateLookupValues, clearCountryLookupValues, clearUserLookupValues],
      labelLocation: "top",
      onTabOptionChanged: onTabOptionChanged,
      tabIndex: compVar.tabIndex,
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createStateParams = () => {

    return (
      <>
        <div className="master-grid-params-switch-container">         
          <div className="master-grid-params-switch-label">
            Business Cities
          </div>
          <div style={{height: 20}}>
            <Switch height={20} width={40} onChange={onActiveBusinessCitySwitchChange} checked={activeBusinessCity} uncheckedIcon={false}/>
          </div>
          <div className="master-grid-params-switch-label" style={{paddingLeft: 20}}>
            Active Cities
          </div>
          <div style={{height: 20}}>
            <Switch height={20} width={40} onChange={onActiveSwitchChange} checked={activeCity} uncheckedIcon={false}/>
          </div>
        </div>
      </>
  
    );

  }

  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    const recObj = {table: compVar.tableName, keyField: compVar.keyField, keyValue: compVar.focusedRowKey}
    setPopupDialogBoxVisible(() => {return false});

    if (e===1) {
      const idx = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      compVar.focusedRowKey = (idx > 0) ? compVar.mainData[idx-1][compVar.keyField] : null;  
      await dbDeleteRecord(recObj);
      await filterData();
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
        <div className="master-grid-container" style={{height: containerHeight}}>

          {!editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <div className="master-grid-params-container"></div>
              <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, flex: 1}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>        
              <div className="master-grid-params-container" style={{justifyContent: 'flex-end'}}>
                {createStateParams()}
              </div>
            </div>
          }          

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

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

export default Cities;
