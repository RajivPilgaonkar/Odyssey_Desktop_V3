import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, saveReordedListToDB, getReorderedList } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetPreferredRoutesData";
import { canDelete, getNextSrNo } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getBusinessCities} from "../../common/GetOrgListing";
import {getAdmLevelLocation, getTrainName} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';
import DropDownGrid from "../../common/DropDownGrid";

import '../../common/MasterGrid.css'

let compVar = {};

function PreferredRoutes() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [rowDragging, setRowDragging] = useState(false);  
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
      userLookup: [], cityLookup: [], mainData: [],      
      clonedMainData: [],
      fromCities_id: -1, fromCity: '', toCities_id: -1, toCity: '',  
      tableName: 'PreferredRoutes', keyField: 'PreferredRoutes_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Preferrered Routes', title: 'New Route',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 560,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      rowDragging: false, onReorder: onReorder,  
      admLevel: 1,
      dbLookup: [       
        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

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
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.cityLookup = await getBusinessCities();   
      compVar.dbLookup[0].dataSource = compVar.cityLookup;
      compVar.dbLookup[1].dataSource = compVar.cityLookup;
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Preferred Routes'});   
      compVar.dbLookup[2].dataSource = compVar.userLookup;
  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    let whereStr = 'RouteFromCities_id = ' + compVar.fromCities_id.toString() + " " +
      'AND RouteToCities_id = ' + compVar.toCities_id.toString();    
    try {
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['OrderNo'], table: 'PreferredRoutes', where: whereStr, x_uid: _g_users_id, x_module: 'Preferred Routes'});   
      compVar.clonedMainData =  [...compVar.mainData];     
    } catch(err) {
      alert(err);
    }

    // use for-of loops for async code -- not forEach
    for (const rec of compVar.mainData) {
      const trainObj = await getTrainName(rec.TrainNo,null);      
      rec.TrainName = trainObj.trainName;
    }

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

    const whereStr = 'RouteFromCities_id = ' + compVar.fromCities_id.toString() + " " +
      "AND RouteToCities_id = " + compVar.toCities_id.toString();
    const nextObj = await getNextSrNo('PreferredRoutes','OrderNo',whereStr);
    const nextSrNo = (nextObj.length > 0) ? nextObj[0].OrderNo+1 : 1;

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      RouteFromCities_id: compVar.fromCities_id,
      RouteToCities_id: compVar.toCities_id,
      OrderNo: nextSrNo
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

    let condition = "WHERE RouteFromCities_id = " + compVar.formData.RouteFromCities_id.toString() + " " +
      "AND RouteToCities_id = " + compVar.formData.RouteToCities_id.toString() + " " +
      "AND FromCities_id = " + compVar.formData.FromCities_id.toString() + " " +
      "AND ToCities_id = " + compVar.formData.ToCities_id.toString() + " " + 
      "AND TrainNo = '" + compVar.formData.TrainNo + "' ";
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : " ";

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
  const getSelectedFromCity = (e) => {
    compVar.formData.FromCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedToCity = (e) => {
    compVar.formData.ToCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearFromCityLookup = () => {
    compVar.formData.FromCities_id = null;
  }

  //**********************************************************/
  const clearToCityLookup = () => {
    compVar.formData.ToCities_id = null;
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
  const onFormFieldDataChanged = async (e) => {

    if (e.dataField === 'TrainNo') {
      const trainObj = await getTrainName(compVar.formData.TrainNo,null);      
      compVar.formData.TrainName = trainObj.trainName;
      forceRender();
    }
      
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    // For row dragging forms  
    compVar.rowDragging = rowDragging;

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
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialFromCityLookupValues = getLookupValues(
      clearFromCityLookupValues,compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.FromCities_id);

    const initialToCityLookupValues = getLookupValues(
      clearToCityLookupValues,compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.ToCities_id);
  
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
      clearLookup: [clearFromCityLookup, clearToCityLookup, clearUserLookup],
      getSelectedRecord: [getSelectedFromCity, getSelectedToCity, getSelectedUser],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues, initialUserLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues, clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.fromCities_id > 0 && compVar.toCities_id > 0) ? compVar.canAdd : false;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: !rowDragging && canAdd, options: {icon: "orderedlist", onClick: rowDraggingToggle, hint: 'Reorder using drag & drop'}},
        {visible: rowDragging, options: {icon: "save", onClick: saveListToDb, hint: 'Save reordered list to DB'}},  
        {visible: rowDragging, options: {icon: "revert", onClick: rowDraggingToggle, hint: 'Cancel reordering'}},  
        
      ],
      boxContainerStyle: {borderBottom: '1px solid #b5b5b5'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createStateParams = () => {

    return (
      <>
        <DropDownGrid
          listArray={compVar.cityLookup}
          fieldList={['city']}
          valueExpr="cities_id"
          displayExpr="city"
          label="From"
          placeholder="Select a city..."
          getSelectedRecord={onFromCitySelect}
          showColumnHeaders={false}
          value={compVar.fromCities_id}
          labelStyle={{width: 50}}
          dropDownStyle={{width: 60}}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
        <DropDownGrid
          listArray={compVar.cityLookup}
          fieldList={['city']}
          valueExpr="cities_id"
          displayExpr="city"
          label="To"
          placeholder="Select a city..."
          getSelectedRecord={onToCitySelect}
          showColumnHeaders={false}
          value={compVar.toCities_id}
          labelStyle={{width: 30}}
          dropDownStyle={{width: 60}}
        />
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
    
  //*********************************************************/
  const onFromCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.fromCities_id = e[0].cities_id;
      compVar.fromCity = e[0].city;  
      await filterData();
    }
  }

  //*********************************************************/
  const onToCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.toCities_id = e[0].cities_id;
      compVar.toCity = e[0].city;  
      await filterData();
    }
  }

  //**********************************************************/
  const rowDraggingToggle = () => {
    setRowDragging((rowDragging) => {return !rowDragging});
  }

  //**********************************************************/
  const saveListToDb = async () => {

    await saveReordedListToDB (compVar.clonedMainData, 
      compVar.tableName, 'OrderNo', compVar.keyField);

    rowDraggingToggle();
    await filterData();

  }  

  //**********************************************************/
  const onReorder = (e) => {
    const reorderedList = getReorderedList(e, compVar.clonedMainData, '', null);
    compVar.clonedMainData = reorderedList;
    forceRender();
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

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
            <div className="master-grid-params-container"></div>
            <div style={{flex: 1}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container">
              {createStateParams()}
            </div>
          </div>        

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

export default PreferredRoutes;
