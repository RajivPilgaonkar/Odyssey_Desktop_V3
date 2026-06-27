import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setInvoiceParamValues } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMY_MDY, convert_DbDate_To_MDY, getFieldsArray, beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, convertToMoment, convertToMoment_fmt } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd} from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { getAgentSubCatListing } from "../../../common/GetOrgListing";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import { tableHeaderArray, getDevExtremeTable, getDevExtremePopupForm } from "./GetInvoiceData";
import {placeOfSupplyHome, gstValid, updateGstValues, setGstFieldEnable, computeInvoiceAmountWithGst, updateInvoiceAmount, getInvoiceYearRef, getNextInvoiceNo, getNextDivInvoiceNo} from "../../../common/InvoiceHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import InvoiceListingParams from './InvoiceListingParams';
import PopupDialogBox from '../../../common/PopupDialogBox';
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function InvoiceListing() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [panelDataFetched, setPanelDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_fromDate = useSelector(state => state.invoiceParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.invoiceParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_companies_id = useSelector(state => state.invoiceParams.companies_id) || 4;
  let _g_divisions_id = useSelector(state => state.invoiceParams.divisions_id) || 0;
  let _g_invoices_id = useSelector(state => state.invoiceParams.invoices_id) || -1;

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
      mainData: [], 
      tableName: 'invoices', keyField: 'Invoices_id',
      masterDescField: '',
      fromDate: _g_fromDate, toDate: _g_toDate, 
      companies_id: _g_companies_id, divisions_id: _g_divisions_id,
      invoices_id: _g_invoices_id,
      offices_id: 2, invoiceTypes_id: 1, 
      customerLookup: [], currencyLookup: [], placeOfSupplyLookup: [], stateLookup: [],
      rcmLookup: [], userLookup: [],
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Invoices', title: 'New Invoice',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'GST', index: 1},{title: 'Additional', index: 2}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 580,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      topPanelHeight: 50, placeOfSupplyHome: false,
      formDisplayType: 1, 
      dbLookup: [       
        {keyField: 'Addressbook_id', dataSource: compVar.customerLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'PlaceOfSupply', dataSource: compVar.placeOfSupplyLookup, 
        displayExpr: 'PlaceOfSupply', valueExpr: 'PlaceOfSupply', fieldList: ['PlaceOfSupply']},

        {keyField: 'states_id', dataSource: compVar.stateLookup, 
        displayExpr: 'state', valueExpr: 'states_id', fieldList: ['state']},

        {keyField: 'yesNo', dataSource: compVar.rcmLookup, 
        displayExpr: 'yesNo', valueExpr: 'yesNo', fieldList: ['yesNo']},

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

      const customerLookup = await getAgentSubCatListing ('1', false);
      compVar.customerLookup = customerLookup.map(rec => {
        return {Addressbook_id: rec.Addressbook_id, OrgCity: rec.OrgCity};
      });    
      compVar.dbLookup[0].dataSource = compVar.customerLookup;  
  
      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Exch Rates'}); 
      compVar.dbLookup[1].dataSource = compVar.currencyLookup;  

      compVar.placeOfSupplyLookup = await dbGetRecord({fields: ['PlaceOfSupply, Home'], orders: ['PlaceOfSupply'], table: 'PlaceOfSupply'});   
      compVar.dbLookup[2].dataSource = compVar.placeOfSupplyLookup;  

      compVar.stateLookup = await dbGetRecord({fields: ['states_id', 'state'], orders: ['state'], table: 'states', x_uid: _g_users_id, x_module: 'Cities'});   
      compVar.dbLookup[3].dataSource = compVar.stateLookup;  

      compVar.rcmLookup = [{yesNo: 'Yes'}, {yesNo: 'No'}];
      compVar.dbLookup[4].dataSource = compVar.rcmLookup;  
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.dbLookup[5].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }


  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const fromDate = convertDMY_MDY(compVar.fromDate);
    const toDate = convertDMY_MDY(compVar.toDate);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map((rec) => `i.${rec}`);
    fieldArray.push ('CASE WHEN i.addressbook_id IS NOT NULL THEN a.organisation ELSE i.party END AS CustomerParty');
    
    const whereStr = `i.invoicetypes_id = ${compVar.invoiceTypes_id.toString()} 
      AND i.companies_id = ${compVar.companies_id.toString()} 
      AND i.divisions_id = ${compVar.divisions_id.toString()} 
      AND i.invoicedate between '${fromDate}' AND '${toDate}'`;

    const tableStr = 'invoices i LEFT JOIN addressbook a ON i.addressbook_id = a.addressbook_id ';

    try {
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['invoiceDate, invoiceNo'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Invoices'});   
      const idx = compVar.mainData.findIndex(rec => rec.Invoices_id === compVar.invoices_id);
      if (idx > -1) {
        compVar.focusedRowKey = compVar.mainData[idx].Invoices_id;
      }
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const editRow = async (e) => {
    afterEdit(compVar, e);
    compVar.placeOfSupplyHome = await placeOfSupplyHome(compVar.formData.PlaceOfSupply);
    await setGstFieldEnable(tableHeaderArray, compVar.placeOfSupplyHome);

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

    const invoiceDate = new Date(convertDMY_MDY(compVar.toDate));

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      Companies_id: compVar.companies_id,
      Divisions_id: compVar.divisions_id,
      Offices_id: compVar.offices_id,
      InvoiceTypes_id: compVar.invoiceTypes_id,
      InvoiceDate: invoiceDate
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
      {table: 'invoicedetails', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Invoice Details. Delete the invoice details first'}
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

    // year ref 
    const invoiceDate = new Date(convert_DbDate_To_MDY(compVar.formData.InvoiceDate));
    compVar.formData.YearRef = await getInvoiceYearRef(invoiceDate);
    // In add mode -- get the next invoice number for the company and division
    if (compVar.formMode === 1) {
      const invObj = await getNextInvoiceNo(compVar.formData.YearRef, compVar.formData.Companies_id, compVar.formData.InvoiceTypes_id);
      compVar.formData.InvoiceNo = invObj.nextInvoiceNo;
      const divInvObj = await getNextDivInvoiceNo (compVar.formData.YearRef, compVar.formData.Companies_id, compVar.formData.Divisions_id, compVar.formData.InvoiceTypes_id);
      compVar.formData.DivInvoiceNo = divInvObj.nextInvoiceNo;
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

    let condition = "WHERE InvoiceNo = " + compVar.formData.InvoiceNo + " " + 
      "AND YearRef = " + compVar.formData.YearRef.toString() + " " + 
      "AND Companies_id = " + compVar.formData.Companies_id.toString() + " ";
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField + " <> " + compVar.formData[compVar.keyField].toString() : "";

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

    // update for details -- only in edit mode
    if (compVar.formMode === 2) {
      await updateInvoiceAmount(saveData.formData.Invoices_id);
    }

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
    const fromDate = convertToMoment_fmt(compVar.fromDate,'DD/MM/YYYY');
    const toDate = convertToMoment_fmt(compVar.toDate,'DD/MM/YYYY');
    const invoiceDate = convertToMoment(formData.InvoiceDate);
    if ((invoiceDate < fromDate) || (invoiceDate > toDate)) {
      return '"Invoice Date" has to lie within selected date range';
    }

    // customer has to be entered
    if ((formData.Addressbook_id === null) && ((formData.Party === null) || (formData.Party.trim() === ''))) {
      return 'Customer has to be selected in the drop down or entered in the Customer Tab';
    }

    // valid gst entries for selected 'Place Of Supply'
    const gstValidObj = await gstValid(compVar.placeOfSupplyHome, formData);
    if (gstValidObj.errorDesc > '') {
      return gstValidObj.errorDesc;
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
  const getSelectedCustomer = (e) => {
    compVar.formData.Addressbook_id = e[0].Addressbook_id;
  }

  //**********************************************************/
  const getSelectedCurrency = async (e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;

    // Update GST Values based on Exch Rate
    if (compVar.formData.Currencies_id !== null && compVar.formMode === 2) {
      await updateGstValues(compVar.formData.Invoices_id, compVar.formData.Currencies_id, compVar.formData);
      forceRender();
    }

  }

  //**********************************************************/
  const getSelectedPlaceOfSupply = (e) => {
    compVar.formData.PlaceOfSupply = e[0].PlaceOfSupply;
    compVar.placeOfSupplyHome = e[0].Home;

    // enable / disable GST perc fields depending on home state
    setGstFieldEnable(tableHeaderArray, compVar.placeOfSupplyHome);
    forceRender();

  }

  //**********************************************************/
  const getSelectedState = (e) => {
    compVar.formData.SupplyStates_id = e[0].states_id;
  }

  //**********************************************************/
  const getSelectedRcm = (e) => {
    compVar.formData.TaxPayableRcm = e[0].yesNo;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearCustomerLookup = () => {
    compVar.formData.Addressbook_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = () => {
    compVar.formData.Currencies_id = null;
  }

  //**********************************************************/
  const clearPlaceOfSupplyLookup = () => {
    compVar.formData.PlaceOfSupply = null;
  }

  //**********************************************************/
  const clearStateLookup = () => {
    compVar.formData.SupplyStates_id = null;
  }

  //**********************************************************/
  const clearRcmLookup = () => {
    compVar.formData.Rcm = null;
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
    compVar.formDisplayType = 1;

    if (compVar.invDetailsModified) {
      await filterData();
      compVar.invDetailsModified = false;     
    }
  };  

  //**********************************************************/
  const onDisplayTypeClick = async (e) => {
    compVar.formDisplayType = e;
    // if invoice details modified, let is reflect in the form
    if (compVar.invDetailsModified) {
      await filterData();
      let obj = compVar.mainData.find(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      compVar.formData = {...obj};
      compVar.invDetailsModified = false;     
    }
    forceRender();
  }  

  //**********************************************************/
  const onInvDetailsModified = async (e) => {
    compVar.invDetailsModified = e;
  }
  
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
        dispatch(setInvoiceParamValues({invoices_id: id}));
        forceRender();
      }

    }

  }

  //**********************************************************/
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const getSelectedParams = async (e) => {
    compVar.fromDate = e.fromDate;
    compVar.toDate = e.toDate;
    compVar.companies_id = e.companies_id;
    compVar.divisions_id = e.divisions_id;
    compVar.numFutureInvoices = e.numFutureInvoices;        
    compVar.popupDialogIndex = e.popupDialogIndex;

    if (e.refresh) {
      await filterData();
    } 
  }

  //**********************************************************/
  const onFormFieldDataChanged = async (e) => {
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 

    // Invoice Date change, change yearref
    if ((compVar.formMode === 2) &&
          ((e.dataField === 'I_Gst_Perc') || 
           (e.dataField === 'C_Gst_Perc') ||
           (e.dataField === 'S_Gst_Perc'))) { 
      const changedObj = await computeInvoiceAmountWithGst(compVar.formData, e);
      compVar.formData = {...compVar.formData,...changedObj};          
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
    const clearCustomerLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearPlaceOfSupplyLookupValues = {PlaceOfSupply: null, Home: ''};
    const clearStateLookupValues = {states_id: null, state: ''};
    const clearRcmLookupValues = {yesNo: null};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialCutomerLookupValues = getLookupValues(
      clearCustomerLookupValues,compVar.customerLookup, 
      ['Addressbook_id', 'OrgCity'], compVar.formData.Addressbook_id);

    const initialCurrencyLookupValues = getLookupValues(
      clearCurrencyLookupValues,compVar.currencyLookup, 
      ['currencies_id', 'currencycode'], compVar.formData.Currencies_id);

    const initialPlaceOfSupplyLookupValues = getLookupValues(
      clearPlaceOfSupplyLookupValues,compVar.placeOfSupplyLookup, 
      ['PlaceOfSupply', 'Home'], compVar.formData.PlaceOfSupply);      

    const initialStateLookupValues = getLookupValues(
      clearStateLookupValues,compVar.stateLookup, 
      ['states_id', 'state'], compVar.formData.SupplyStates_id);      

    const initialRcmLookupValues = getLookupValues(
      clearRcmLookupValues,compVar.rcmLookup, 
      ['yesNo'], compVar.formData.TaxPayableRcm);      
                          
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      onDisplayTypeClick: onDisplayTypeClick,
      onInvDetailsModified: onInvDetailsModified,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearCustomerLookup, clearCurrencyLookup, clearPlaceOfSupplyLookup, clearStateLookup, clearRcmLookup, clearUserLookup],
      getSelectedRecord: [getSelectedCustomer, getSelectedCurrency, getSelectedPlaceOfSupply, getSelectedState, getSelectedRcm, getSelectedUser],
      initialLookupValues: [initialCutomerLookupValues, initialCurrencyLookupValues, initialPlaceOfSupplyLookupValues, initialStateLookupValues, initialRcmLookupValues, initialUserLookupValues],
      clearLookupValues: [clearCustomerLookupValues, clearCurrencyLookupValues, clearPlaceOfSupplyLookupValues, clearStateLookupValues, clearRcmLookupValues, clearUserLookupValues],
      onTabOptionChanged: onTabOptionChanged,
      tabIndex: compVar.tabIndex,
      formDisplayType: compVar.formDisplayType,
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

    const additionalPanelHeight = 50;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    let dataObj = null;
    let formObj = null;
    let elementProps = null;  
    if (dataFetched) {
      dataObj = createDataObject(viewHeight);
      formObj = createFormObject();
      elementProps = createElementProps();  
    }
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          {!editPopupVisible &&
            <div style={{ width: '100%', display: 'flex', alignItems: 'center'}}>
              <InvoiceListingParams
                getSelectedParams={getSelectedParams}          
                onPanelLoad={onPanelLoad}
              />
            </div>
          }

          {panelDataFetched && !dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {!editPopupVisible && dataFetched &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>                
          }

          {!editPopupVisible && dataFetched &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}

            </div>
          }

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {dataFetched && popupDialogBoxVisible && 
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
    renderContent()
  )


};

export default InvoiceListing;
