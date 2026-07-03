import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, isValidTime, saveReordedListToDB, getReorderedList, escapeSingleQuotes } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetTransferData";
import { canDelete, getNextSrNo } from "../../common/CommonFunctions";
import { getAgentListing } from "../../common/GetOrgListing";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Switch from "react-switch";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';
import DropDownGrid from "../../common/DropDownGrid";

import '../../common/MasterGrid.css'

let compVar = {};

function Transfers() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);    
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [activeServices, setActiveServices] = useState(true);
  const [rowDragging, setRowDragging] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_cities_id = useSelector(state => state.params.cities_id) || -1;

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
      userLookup: [],  mainData: [], agentLookup: [],
      cityLookup: [],  ticketLookup: [], transferTypesLookup:[],
      clonedMainData: [],
      tableName: '[services]', keyField: 'Services_id',
      masterDescField: 'Description',
      selectedCities_id: _g_cities_id, selectedCity: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Transfers', title: 'New Transfer',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Pop Up', index: 1},{title: 'Media', index: 2},{title: 'Maps', index: 3}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 600,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      rowDragging: false, onReorder: onReorder,  
      admLevel: 1,
      dbLookup: [           
        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'transfertypes_id', dataSource: compVar.transferTypeLookup, 
        displayExpr: 'transfer', valueExpr: 'transfertypes_id', fieldList: ['transfer']},

        {keyField: 'tickets_id', dataSource: compVar.ticketLookup, 
        displayExpr: 'details', valueExpr: 'tickets_id', fieldList: ['details']},

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

  }, [activeServices]);
 
  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      const whereStr = "countries_id IN (SELECT countries_id FROM countries WHERE OperateBusiness = 1) ";
      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr, x_uid: _g_users_id, x_module: 'Transfers'});   

      // if selected city is saved, use it
      if (compVar.selectedCities_id > -1)  {
        const idx = compVar.cityLookup.findIndex(rec => rec.cities_id === compVar.selectedCities_id);
        if (idx > -1) {
          compVar.selectedCity = compVar.cityLookup[idx].city;
        }
      }

      compVar.agentLookup = await getAgentListing('5', false);
      compVar.dbLookup[0].dataSource = compVar.agentLookup;

      compVar.transferTypesLookup = await dbGetRecord({fields: ['transfertypes_id', 'transfer'], orders: ['transfertypes_id'], table: 'transfertypes', x_uid: _g_users_id, x_module: 'Transfers'});   
      compVar.dbLookup[1].dataSource = compVar.transferTypesLookup;      

      compVar.ticketLookup = await dbGetRecord({fields: ['tickets_id', 'details'], orders: ['details'], table: 'tickets', x_uid: _g_users_id, x_module: 'Transfers'});   
      compVar.dbLookup[2].dataSource = compVar.ticketLookup;

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Transfers'});   
      compVar.dbLookup[3].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const activeStr = activeServices ? ' AND Active = 1' : '';

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      const whereStr = "Cities_id = " + compVar.selectedCities_id.toString() + " " + 
        activeStr + " " + 
        "AND Transfer = 1";
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['defaultorder, description'], table: '[services]', where: whereStr, x_uid: _g_users_id, x_module: 'Transfers'});   

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

    const nextObj = await getNextSrNo('Services','DefaultOrder','Transfer = 1 AND cities_id = ' + compVar.selectedCities_id.toString());
    const nextSrNo = (nextObj.length > 0) ? nextObj[0].OrderNo+1 : 1;

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      DefaultOrder: nextSrNo,
      Transfer: 1,
      Cities_id: compVar.selectedCities_id
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
      {table: 'AddressServices', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Addressbook Services. Delete the addressbook service details first'},
      {table: 'CostServices', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Cost Services. Delete the cost service details first'},
      {table: 'ElemServices', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Element Services. Delete the element service details first'},
      {table: 'QuoLines', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Tour Costing. Delete the tour costing details first'},
      {table: 'QuoModuleDetails', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Modules. Delete the module details first'},
      {table: 'QuoServices', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Tour Services. Delete the tour service details first'},
      {table: 'VouchersServices', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Voucher Services. Delete the voucher service details first'},
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

    // For Arrival Transfer
    if (compVar.formData.TransferTypes_id === 1) {
      compVar.formData.CheckInDuration = '00:00';
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
      " AND cities_id = " + compVar.selectedCities_id.toString() + " ";
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
      return "Invalid Duration entered";
    }

    if ((formData.CheckInDuration !== null) && !isValidTime(formData.CheckInDuration)) {
      return "Invalid Check In Duration entered";
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
  const getSelectedAgent = (e) => {
    compVar.formData.Addressbook_id = e[0].Addressbook_id;
  }

  //**********************************************************/
  const getSelectedTicket = (e) => {
    compVar.formData.Tickets_id = e[0].tickets_id;
  }

  //**********************************************************/
  const getSelectedTransferType = (e) => {
    compVar.formData.TransferTypes_id = e[0].transfertypes_id;
    forceRender();
  }


  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearAgentLookup = (e) => {
    compVar.formData.Addressbook_id = null;
  }

  //**********************************************************/
  const clearTicketLookup = (e) => {
    compVar.formData.Tickets_id = null;
  }

  //**********************************************************/
  const clearTransferTypeLookup = (e) => {
    compVar.formData.TransferTypes_id = null;    
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
  const onFormFieldDataChanged = (e) => {

    if (e.dataField === 'duration') {
      if (e.value.trim().length < 5) {
        compVar.formData.duration = compVar.formData.duration.slice(0,2) + ':' + compVar.formData.duration.slice(2);
      }
    }

    if (e.dataField === 'CheckInDuration') {
      if (e.value.trim().length < 5) {
        compVar.formData.CheckInDuration = compVar.formData.CheckInDuration.slice(0,2) + ':' + compVar.formData.CheckInDuration.slice(2);
      }
    }
    
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const onActiveSwitchChange = (e) => {
    setActiveServices(e);
  }

  //**********************************************************/
  const onContentReady = () => {
    const targetInput = document.querySelector('.button-read-only-simple-item .dx-texteditor-input-container input');
    if (targetInput) {
      targetInput.readOnly = true;
    }    
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (!e.data.Active) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Inactive Record';
      } 
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
      onRowPrepared: onRowPrepared
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearTransferTypeLookupValues = {transfertypes_id: null, transfer: ''};
    const clearTicketLookupValues = {tickets_id: null, details: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialAgentLookupValues = getLookupValues(
      clearAgentLookupValues,compVar.agentLookup, 
      ['Addressbook_id','OrgCity'], compVar.formData.Addressbook_id);

    const initialTransferTypeLookupValues = getLookupValues(
      clearTransferTypeLookupValues,compVar.transferTypesLookup, 
      ['transfertypes_id','transfer'], compVar.formData.TransferTypes_id);
  
    const initialTicketLookupValues = getLookupValues(
      clearTicketLookupValues,compVar.ticketLookup, 
      ['tickets_id','details'], compVar.formData.Tickets_id);
            
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
      contentReady: onContentReady,
      onToastHiding: onToastHiding,            
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearAgentLookup, clearTransferTypeLookup, clearTicketLookup, clearUserLookup],
      getSelectedRecord: [getSelectedAgent, getSelectedTransferType, getSelectedTicket, getSelectedUser],
      initialLookupValues: [initialAgentLookupValues, initialTransferTypeLookupValues, initialTicketLookupValues, initialUserLookupValues],
      clearLookupValues: [clearAgentLookupValues, clearTransferTypeLookupValues, clearTicketLookupValues, clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    // For row dragging forms  
    const canAdd =  (rowDragging) ? false : compVar.canAdd;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: !rowDragging && canAdd, options: {icon: "orderedlist", onClick: rowDraggingToggle, hint: 'Reorder using drag & drop'}},
        {visible: rowDragging, options: {icon: "save", onClick: saveListToDb, hint: 'Save reordered list to DB'}},  
        {visible: rowDragging, options: {icon: "revert", onClick: rowDraggingToggle, hint: 'Cancel reordering'}},  
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createCityParams = (mode) => {

    if (mode === 1) {
      return (
        <>
          <div className="master-grid-params-switch-container"> 
            <div className="master-grid-params-switch-label">
              Active Transfers
            </div>
            <div style={{height: 20}}>
              <Switch height={20} width={40} onChange={onActiveSwitchChange} checked={activeServices} uncheckedIcon={false}/>
            </div>
          </div>
        </>
    
      );  
    }

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
        value={compVar.selectedCities_id}
        labelStyle={{width: 100}}
        dropDownStyle={{width: 100}}
        dropDownOptions={{width: 300}}
      />
  
    );

  }

  //**********************************************************/
  const changeFormLayout = async () => {

    const idxCheckInDuration = tableHeaderArray.findIndex(rec => rec.field === 'CheckInDuration');
    const idxArrDesc = tableHeaderArray.findIndex(rec => rec.field === 'ArrivalDescription');
    const idxEmptyItem1 = tableHeaderArray.findIndex(rec => rec.field === 'EmptyItem1');

    tableHeaderArray[idxCheckInDuration].visibleInForm = (compVar.formData.TransferTypes_id === 1) ? false : true;
    tableHeaderArray[idxEmptyItem1].visibleInForm = (compVar.formData.TransferTypes_id === 1) ? true : false;
    tableHeaderArray[idxArrDesc].visibleInForm = (compVar.formData.TransferTypes_id === 1) ? true : false;

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

      // Save to redux store hrough params reducer
      dispatch(setParamValues({cities_id: compVar.selectedCities_id}));
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

    // Some fields are visible/invisible based on selections in form
    changeFormLayout();
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>

          {!editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <div className="master-grid-params-container" style={{flex: 1}}>
                {createCityParams(1)}
              </div>
              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container">
                {createCityParams(2)}
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

export default Transfers;
