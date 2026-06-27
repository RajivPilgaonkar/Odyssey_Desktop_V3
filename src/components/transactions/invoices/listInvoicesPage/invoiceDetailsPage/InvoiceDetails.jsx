import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord } from '../../../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, escapeSingleQuotes, saveReordedListToDB, getReorderedList } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetInvoiceDetailsData";
import { canDelete } from "../../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import {updateInvoiceAmount, getDefaultGstDetails, updateLineTotals, workBackwardsFieldsSet, getInvoiceTotal, invoiceChangePlaceOfSupply} from "../../../../common/InvoiceHelpers";
import PopupDialogBox from '../../../../common/PopupDialogBox';

import '../../../../common/MasterGrid.css'

let compVar = {};

function InvoiceDetails(props) {

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
      placeOfSupplyLookup: [], 
      tableName: 'InvoiceDetails', keyField: 'InvoiceDetails_id',
      masterDescField: 'Details',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Invoice Line Items', title: 'New Line Item',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 530,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, workBackwardsProc, changePlaceOfSupplyProc],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      rowDragging: false, onReorder: onReorder,  
      admLevel: 1,
      topPanelHeight: 40, showAll: false, invoiceTotalStr: '',
      posChoice: 1,
      dbLookup: [       
        {keyField: 'PlaceOfSupply', dataSource: compVar.placeOfSupplyLookup, 
        displayExpr: 'PlaceOfSupply', valueExpr: 'PlaceOfSupply', fieldList: ['PlaceOfSupply']},

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

      compVar.placeOfSupplyLookup = await dbGetRecord({fields: ['PlaceOfSupply, Home'], orders: ['PlaceOfSupply'], table: 'PlaceOfSupply'});   
      compVar.dbLookup[0].dataSource = compVar.placeOfSupplyLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Addressbook Contacts'});   
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
      const whereStr = 'Invoices_id = ' + props.invoices_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['ItemNo, SubOrderNo'], table: 'InvoiceDetails', where: whereStr, x_uid: _g_users_id, x_module: 'Invoice Details'});   
      compVar.clonedMainData =  [...compVar.mainData];     
      compVar.invoiceTotalStr = await getInvoiceTotal(compVar.mainData,2);      
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

    // get defaults
    const defaults = await getDefaultGstDetails(props.invoices_id);

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      Invoices_id: props.invoices_id,
      ServiceTaxPerc: defaults.gstPerc,
      PlaceOfSupplyLine: defaults.placeOfSupply,
      SacCode: defaults.sacCode,
      SubOrderNo: defaults.subOrderNo
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

    let condition = "WHERE Details = '" + escapeSingleQuotes(compVar.formData.Details.trim()) + "' " + 
       " AND Invoices_id = " + props.invoices_id;
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

    // update inv amount in DB
    await updateInvoiceAmount(saveData.formData.Invoices_id);

    // Flag as Invoice Details Modified, but make sure you don't refresh ...
    // ... as that will reset the focusedRow back to the first rec ...
    // ... and not to the last added rec
    if (props.onInvDetailsModified !== undefined) {
      props.onInvDetailsModified(true);
    }

    // refresh data after save
    await filterData();

    // get the new invoice total
    compVar.invoiceTotalStr = await getInvoiceTotal(compVar.mainData,2);

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
    if ((formData.Quantity === null) || (formData.Quantity === 0)) {
      return 'Place specify the qty';
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
  const getSelectedPlaceOfSupply = (e) => {
    compVar.formData.PlaceOfSupplyLine = e[0].PlaceOfSupply;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearPlaceOfSupplyLookup = () => {
    compVar.formData.PlaceOfSupplyLine = null;
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
    compVar.tabIndex = 0;  
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
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 

    // Invoice Date change, change yearref
    if ((e.dataField === 'UnitPrice') || 
        (e.dataField === 'Quantity') ||
        (e.dataField === 'ServiceTaxPerc')) {
        await updateLineTotals (compVar.formData);
        forceRender();
      }

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
  const workBackwards = async (e) => {
    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = 'Are you sure you want work backwards from the final figure?'
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const workBackwardsProc = async (e) => {
    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {
      workBackwardsFieldsSet(compVar.formData);
      forceRender();
    }

  }

  //**********************************************************/
  const changePlaceOfSupply = async (e) => {
    compVar.popupDialogIndex = 2;
    compVar.dialogMessage1 = 'Are you sure you want to change the Place of Supply for all records in this invoice?'
    compVar.posChoice = e;
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const changePlaceOfSupplyProc = async (e) => {
    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {
      await invoiceChangePlaceOfSupply(props.invoices_id, compVar.posChoice);
      await filterData();
    }
  }

  //**********************************************************/
  const showAllToggle = async() => {
    compVar.showAll = !compVar.showAll;
    forceRender();
  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    // For row dragging forms  
    compVar.rowDragging = rowDragging;

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight - compVar.topPanelHeight, 
        gridRef: gridRef
      });

    const pageFooterEnabled = (compVar.showAll) ? false : true;

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      enabled: pageFooterEnabled
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearPlaceOfSupplyLookupValues = {PlaceOfSupply: null, Home: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialPlaceOfSupplyLookupValues = getLookupValues(
      clearPlaceOfSupplyLookupValues,compVar.placeOfSupplyLookup, 
      ['PlaceOfSupply', 'Home'], compVar.formData.PlaceOfSupplyLine);      

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
      formHelp: null,
      clearLookup: [clearPlaceOfSupplyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedPlaceOfSupply, getSelectedUser],
      initialLookupValues: [initialPlaceOfSupplyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearPlaceOfSupplyLookupValues, clearUserLookupValues],
      onTabOptionChanged: onTabOptionChanged,
      tabIndex: compVar.tabIndex,
      onWorkBackwards: workBackwards
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
        {visible: true, options: {icon: "icons/size.png", onClick: showAllToggle, hint: 'Show All/Few '}},
        {visible: true, options: {icon: "icons/changePlaceOfSupply1.png", onClick: () => {changePlaceOfSupply(1)}, hint: 'Change POS for all to Goa'}},
        {visible: true, options: {icon: "icons/changePlaceOfSupply2.png", onClick: () => {changePlaceOfSupply(2)}, hint: 'Restore POS from Modules'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    const recObj = {table: compVar.tableName, keyField: compVar.keyField, keyValue: compVar.focusedRowKey}
    setPopupDialogBoxVisible(() => {return false});

    if (e===1) {
      const idx = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      const invoices_id = (idx > -1) ? compVar.mainData[idx].Invoices_id : -1;  
      await dbDeleteRecord(recObj);      
      await filterData();

      // get the new invoice total
      compVar.invoiceTotalStr = await getInvoiceTotal(compVar.mainData,2);

      // update for details
      await updateInvoiceAmount(invoices_id);

      // Flag as Invoice Details Modified, but make sure you don't refresh ...
      // ... as that will reset the focusedRow back to the first rec ...
      // ... and not to the last added rec
      if (props.onInvDetailsModified !== undefined) {
        props.onInvDetailsModified(true);
      }

    }
  }
    
  //**********************************************************/
  const rowDraggingToggle = () => {
    setRowDragging((rowDragging) => {return !rowDragging});
  }

  //**********************************************************/
  const saveListToDb = async () => {

    await saveReordedListToDB (compVar.clonedMainData, 
      compVar.tableName, 'SubOrderNo', compVar.keyField);

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

    const invoiceTotal = 'Inv. Total ' + compVar.invoiceTotalStr;
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container"></div>
            <div className="master-grid-params-container">
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container" style={{color: 'blue', fontSize: 18}}>
              {invoiceTotal}
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

export default InvoiceDetails;
