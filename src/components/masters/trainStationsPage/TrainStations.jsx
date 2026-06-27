import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, saveReordedListToDB, getReorderedList, escapeSingleQuotes } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetTrainStationData";
import { canDelete, getNextSrNo } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getBusinessCities} from "../../common/GetOrgListing";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';
import DropDownGrid from "../../common/DropDownGrid";

import '../../common/MasterGrid.css'

let compVar = {};

function TrainStations() {

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
      userLookup: [],  mainData: [],
      clonedMainData: [],
      cityLookup: [],
      selectedCities_id: -1, selectedCity: '',  
      tableName: 'trainstations', keyField: 'trainstations_id',
      masterDescField: 'station',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Train Stations', title: 'New Train Stations',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 500,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      rowDragging: false, onReorder: onReorder,  
      admLevel: 1,
      dbLookup: [       
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

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Train Stations'});   
      compVar.dbLookup[0].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    let whereStr = 'cities_id = ' + compVar.selectedCities_id.toString();
    try {
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['DefaultOrder'], table: 'TrainStations', where: whereStr, x_uid: _g_users_id, x_module: 'Train Stations'});   
      compVar.clonedMainData =  [...compVar.mainData];     
    } catch(err) {
      alert(err);
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

    const nextObj = await getNextSrNo('TrainStations','DefaultOrder','cities_id = ' + compVar.selectedCities_id.toString());
    const nextSrNo = (nextObj.length > 0) ? nextObj[0].OrderNo+1 : 1;

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      cities_id: compVar.selectedCities_id,
      DefaultOrder: nextSrNo
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
      {table: 'ElemTickets', condition: 'WHERE From_TrainStations_id = ' + e.row.data[compVar.keyField], existsIn: 'Element Tickets. Delete the Element Tickets details first'},
      {table: 'ElemTickets', condition: 'WHERE To_TrainStations_id = ' + e.row.data[compVar.keyField], existsIn: 'Element Tickets. Delete the Element Tickets details first'},
      {table: 'QuoTickets', condition: 'WHERE From_TrainStations_id = ' + e.row.data[compVar.keyField], existsIn: 'Tour Tickets. Delete the Tour Tickets details first'},
      {table: 'QuoTickets', condition: 'WHERE To_TrainStations_id = ' + e.row.data[compVar.keyField], existsIn: 'Tour Tickets. Delete the Tour Tickets details first'},
      {table: 'traindetails', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Train Details. Delete the Train Details first'},
      {table: 'voucherstickets', condition: 'WHERE From_TrainStations_id = ' + e.row.data[compVar.keyField], existsIn: 'Vouchers. Delete the Vouchers first'},
      {table: 'voucherstickets', condition: 'WHERE To_TrainStations_id = ' + e.row.data[compVar.keyField], existsIn: 'Vouchers. Delete the Vouchers first'},
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

    let condition = "WHERE " + compVar.masterDescField + " = '" + escapeSingleQuotes(compVar.formData[compVar.masterDescField]) + "' ";
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
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
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
  const onFormFieldDataChanged = () => {
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
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

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
      clearLookup: [clearUserLookup],
      getSelectedRecord: [getSelectedUser],
      initialLookupValues: [initialUserLookupValues],
      clearLookupValues: [clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.selectedCities_id > 0) ? compVar.canAdd : false;

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
  const createCityParams = () => {

    return (
      <DropDownGrid
        listArray={compVar.cityLookup}
        fieldList={['city']}
        valueExpr="cities_id"
        displayExpr="city"
        label="City"
        placeholder="Select a city..."
        getSelectedRecord={onCitySelect}
        showColumnHeaders={false}
        value={compVar.selectedCity}
        labelStyle={{width: 60}}
        dropDownStyle={{width: 60}}
      />
  
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
  const onCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.selectedCities_id = e[0].cities_id;
      compVar.selectedCity = e[0].city;  
      filterData();
    }
  }

  //**********************************************************/
  const rowDraggingToggle = () => {
    setRowDragging((rowDragging) => {return !rowDragging});
  }

  //**********************************************************/
  const saveListToDb = async () => {

    await saveReordedListToDB (compVar.clonedMainData, 
      compVar.tableName, 'DefaultOrder', compVar.keyField);

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
            <div style={{flex: 2}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container">
              {createCityParams()}
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

export default TrainStations;
