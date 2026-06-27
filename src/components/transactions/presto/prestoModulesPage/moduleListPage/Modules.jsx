import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp, setModuleParamValues } from '../../../../../actions';
import { convert_DbDate_To_DMY, convertDMY_MDY, convert_DbDate_To_MDY, convertDMY_toDate,  getFieldsArray, setDateTimeFormat, beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, getNowDate, convertToMoment_fmt } from "../../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd} from "../../../../common/MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DropDownButton from 'devextreme-react/drop-down-button';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getAgentByCategoryListing } from "../../../../common/GetOrgListing";
import {getNextModuleNo, doesTourExist} from "../../../../common/ModuleHelpers";
import { canDelete } from "../../../../common/CommonFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray  } from "./GetModuleData";
import ModuleParams from './ModuleParams';
import ModuleCancellation from './ModuleCancellation';
import PopupDialogBox from '../../../../common/PopupDialogBox';
import LinkForms from "../../../../common/LinkForms";
import {getAdmLevelLocation, getCurrencyForAgent, getVoucherYearRef, getTourCodeFromModules} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import { setupReport } from "./ReportSetup";

import '../../../../common/MasterGrid.css'

let compVar = {};

function Modules() {

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
  let _g_fromDate = useSelector(state => state.moduleParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.moduleParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_tourCode = useSelector(state => state.moduleParams.tourCode) || '';
  let _g_createdByMe = useSelector(state => state.moduleParams.createdByMe) || false; 
  let _g_trial = useSelector(state => state.moduleParams.trial) || 0; 

  // use this to write to the redux store
  const dispatch = useDispatch();

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], 
      agentLookup: [], currencyLookup: [], userLookup: [],
      tableName: 'QuoModules', keyField: 'QuoModules_id',
      fromDate: _g_fromDate, toDate: _g_toDate, 
      createdByMe: _g_createdByMe, trial: _g_trial, tourCode: _g_tourCode,
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Modules', title: 'New Module',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, canCancel: false,
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',      
      isEdited: false, condition: '', reportInProgress: false,
      formHeight: 500,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption,deleteFullModuleProc],
      displayGridFilterRow: false, searchPanelOpen: false,
      cancelModuleOpen: false, formDisplayType: 1,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [     
        
        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},
        
        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ],
      reportsData:
        [
          {id: 1, type: 1, text: 'Module Quotation (Excel)', reportName: 'ModuleQuotation', reportType: 'Excel'},
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
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    compVar.agentLookup = await getAgentByCategoryListing ('2');
    compVar.dbLookup[0].dataSource = compVar.agentLookup;

    compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
    compVar.dbLookup[1].dataSource = compVar.currencyLookup;

    compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
    compVar.dbLookup[2].dataSource = compVar.userLookup;

    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);
    
    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map(e => 'q.' + e);
    fieldArray.push("COALESCE((SELECT SUM(TotalAmt) FROM QuoModuleDetails qmd WHERE qmd.QuoModules_id = q.QuoModules_id),0.0) AS TotalAmt");
    fieldArray.push("i.Invoices_id");
    fieldArray.push("u.uid AS UserName");

    let createdByStr = "";
    if (compVar.createdByMe) {
      createdByStr = " AND u.AdmUsers_id = " + _g_users_id.toString();
    }

    try {

      const fromDate = convertDMY_MDY(compVar.fromDate);
      const toDate = convertDMY_MDY(compVar.toDate);

      const whereStr = "q.TourDate BETWEEN '" + fromDate + "' AND '" + toDate + "' AND q.Trial = " + compVar.trial.toString() + createdByStr;

      const tableStr = "QuoModules q LEFT JOIN Invoices i ON q.QuoModules_id = i.QuoModules_id " + 
        "LEFT JOIN Quotations q2 ON q.TourCode = q2.TourCode AND q.TourDate = q2.StartDate " + 
        "LEFT JOIN AdmUsers u ON q2.AdmUsers_id = u.AdmUsers_id ";
  
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['q.QuotationNo'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Module Quotations'});   

      // check if tour present      
      if (compVar.tourCode.length > 0) {
        const idx = compVar.mainData.findIndex(rec => rec.TourCode === compVar.tourCode);
        compVar.focusedRowKey = (idx > -1) ? compVar.mainData[idx][compVar.keyField] : compVar.focusedRowKey;
      }

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);
   
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

    // You can set focus on the tour last edited
    compVar.tourCode = e.row.data.TourCode;
    await saveToReduxStore();
  }

  //**********************************************************/
  const addRow = async () => {
    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    const moduleDate = getNowDate('DD/MM/YYYY');
    const yearRef = getVoucherYearRef(convertDMY_toDate(moduleDate));

    // next voucher number for the company
    const moduleObj = await getNextModuleNo (yearRef, compVar.trial);
    const nextModuleNo = moduleObj.nextQuoteNo;

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      QuotationDate: convertDMY_toDate(moduleDate),
      QuotationYearRef: yearRef,
      QuotationNo: nextModuleNo, 
      Trial: compVar.trial
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
      {table: 'QuoModuleDetails', condition: 'WHERE QuoModules_id = ' + e.row.data.QuoModules_id, existsIn: 'Module Quotation Details. Delete the module quotation details first'},
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

    let condition = "WHERE QuotationNo = " + compVar.formData.QuotationNo.toString() + " "  +
      "AND QuotationYearRef = " + compVar.formData.QuotationYearRef.toString() + " " + 
      "AND Trial = " + compVar.formData.Trial.toString();
    condition += (compVar.formMode === 2) ? "AND QuoModules_id <> " + compVar.formData.QuoModules_id: "";

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
    compVar.tourCode = saveData.formData['TourCode'];
    compVar.focusedRowKey = saveData.formData[compVar.keyField];
    await saveToReduxStore();

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

    // Check if same Tour Code / Tour Date exists 
    const tourExists = await doesTourExist(compVar.formMode, formData.QuoModules_id, formData.TourCode);
    if (tourExists) {
      return 'This Tour Code already exists in Module Quotations';
    }

    // form validation errors
    if ((formData.NumPax === null) || (formData.NumPax <= 0)) {
      return 'Please enter the number of pax';
    }

    // form validation errors
    if ((formData.NumPax === null) || (formData.NumPax <= 0)) {
      return 'Please enter the number of pax';
    }

    const tourDate = convertToMoment_fmt(formData.TourDate,'');
    const fromDate = convertToMoment_fmt(compVar.fromDate,'DD/MM/YYYY');
    const toDate = convertToMoment_fmt(compVar.toDate,'DD/MM/YYYY');
    // form validation errors
    if ((tourDate < fromDate) || (tourDate > toDate)) {
      return 'Tour Date has to be within the Date Range specified';
    }

    if ((formData.NumSingles === 0) && (formData.NumDoubles === 0) && (formData.NumTriples === 0) && (formData.NumTwins === 0)) {
      return "Singles, Doubles, Triples, Twins -- all cannot be zero";
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
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.PrincipalAgents_id = e[0].Addressbook_id;

    // update exchange rate for invoicing
    const currencies_id = await getCurrencyForAgent(e[0].Addressbook_id);
    compVar.formData.Currencies_id = currencies_id;

    forceRender();

  }

  //**********************************************************/
  const getSelectedCurrency = async(e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearAgentLookup = async(e) => {
    compVar.formData.PrincipalAgents_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = async(e) => {
    compVar.formData.Currencies_id = null;
  }

  //**********************************************************/
  const clearUserLookup = () => {
    compVar.formData.ModifiedByUsers_id = null;
  }

  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.formDisplayType = 1;
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
  const deleteModuleDetails = async () => {
    let sql = "DELETE FROM QuoModuleDetails WHERE QuoModules_id = " + 
        compVar.focusedRowKey.toString();      
    let spData = {sql: sql}
    await dbExecuteSp(spData);
  }


  //**********************************************************/
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    

    if (e.rowType === 'data') {
      if (e.data.Invoices_id) {
        e.rowElement.style.color = 'green'; 
        e.rowElement.title = 'This quotation was invoiced';
        if (e.data.Cancelled) {
          e.rowElement.style.textDecorationLine = 'line-through';
          e.rowElement.title = 'This quotation was invoiced for cancellation';
        }
      } else if (e.data.Cancelled) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.style.textDecorationLine = 'line-through';
        e.rowElement.title = 'This quotation was cancelled';
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
  const onReportClick = async (e) => {

    compVar.reportInProgress = true;
    forceRender();

    const quoModules_id = compVar.focusedRowKey;

    let data = {quoModules_id: quoModules_id, 
      reportType: e.itemData.type, reportName: e.itemData.reportName, 
      openReport: false};  
      
    const tourCodeObj = await getTourCodeFromModules(quoModules_id);  
    const reportName = e.itemData.reportName + '_' + tourCodeObj.tourCode;

    const reportObj = {...e.itemData, reportName: reportName};
    await setupReport({...reportObj, data: data});

    compVar.reportInProgress = false;
    forceRender();

  }


  //**********************************************************/
  const getSelectedParams = async (e) => {

    if (e.dataRefreshMode > 0) {
      compVar.fromDate = e.fromDate;
      compVar.toDate = e.toDate;
      compVar.createdByMe = e.createdByMe;
      compVar.trial = e.trial;
      compVar.tourCode = e.tourCode;
      if (e.searchId !== undefined && e.searchId > 0) {
        compVar.focusedRowKey = e.searchId;
      }
      await filterData();
    } 
    compVar.searchPanelOpen = e.searchPanelOpen;
    forceRender();

  }

  //**********************************************************/
  const saveToReduxStore = async () => {
    
    // Save to redux store through params reducer
    dispatch(setModuleParamValues({
      tourCode: compVar.tourCode,
      fromDate: compVar.fromDate,
      toDate: compVar.toDate
    }));

  }

  //**********************************************************/
  const changeLayout = () => {

    const arr = [
      {fieldName: 'TourCode', matchValue: true},
      {fieldName: 'TourDate', matchValue: true},
      {fieldName: 'EmptyItem', matchValue: false},
    ];

    for (const item of arr) {
      const idx = tableHeaderArray.findIndex(rec => rec.field === item.fieldName);
      if (idx >= 0) {
        const value = item.matchValue;
        tableHeaderArray[idx].visibleInForm = (compVar.formMode === 1) ? value : !value;
      }  
    }
      
  }

  //**********************************************************/
  const onLineItemsHiding = () => {
    compVar.formDisplayType = 1;
    setEditPopupVisible(false);    
  }

  //**********************************************************/
  const deleteFullModule = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = `Are you sure you want to delete this entire module 
      along this the line items for the tour ${compVar.tourCode}?`
    compVar.dialogMessage2 = ''; 
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const deleteFullModuleProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    compVar.popupDialogIndex = 1;
    setPopupDialogBoxVisible(false);

    // close form & line items
    setEditPopupVisible(false);

    // if Yes selected
    if (e===1) {

      setDataFetched(false);

      const quoModules_id = compVar.formData.QuoModules_id;

      /*=== Delete the Module Details ===*/
      let sql = "DELETE FROM QuoModuleDetails " + 
        "WHERE QuoModules_id = " + quoModules_id.toString();

      let spData = {sql: sql, x_uid: _g_users_id, x_module: 'Modules'};
      await dbExecuteSp(spData);

      /*=== Delete the Modules ===*/
      sql = "DELETE FROM QuoModules " + 
      "WHERE QuoModules_id = " + quoModules_id.toString();

      spData = {sql: sql, x_uid: _g_users_id, x_module: 'Modules'};
      await dbExecuteSp(spData);

      await filterData();

    }

  }


  //**********************************************************/
  const cancelModule = async () => {
    compVar.cancelModuleOpen = true;
    forceRender();
  }

  //**********************************************************/
  const formDisplayTypeClick = async () => {
    compVar.formDisplayType = 1;
    forceRender();
  }

  //**********************************************************/
  const tableDisplayTypeClick = async () => {
    compVar.formDisplayType = 2;
    forceRender();
  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const changeInHeight = compVar.searchPanelOpen ? 40 : 0;

    //let gridHeight = (compVar.mainData.length > 11) ? viewHeight : null;
    //if (changeInHeight > 0 && gridHeight !== null) {
    //  gridHeight -= changeInHeight;
    //}

    const idx = (compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey));
    if (idx > -1) {
      compVar.canCancel = (compVar.mainData[idx].Invoices_id !== null) ? false : true;
    }

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight-changeInHeight, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onRowPrepared: onRowPrepared,
      //gridHeight: gridHeight
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    if (compVar.formData === undefined) {
      return defaultFormObject;
    }

    changeLayout();
    
    // disable Save button, if module cancelled
    const disabled = (compVar.formData !== undefined && compVar.formData.Invoices_id > 0);
    const navObj = [
      {disabled: disabled},
      {},
      {}
    ];
  
    // *** CASE SENSITIVE override formData properties
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialAgentLookupValues = getLookupValues(
      clearAgentLookupValues,compVar.agentLookup, 
      ['Addressbook_id', 'OrgCity'], compVar.formData.PrincipalAgents_id);

    const initialCurrencyLookupValues = getLookupValues(
      clearCurrencyLookupValues,compVar.currencyLookup, 
      ['currencies_id', 'currencycode'], compVar.formData.Currencies_id);
    
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);
  
    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      onLineItemsHiding: onLineItemsHiding,
      deleteFullModule: deleteFullModule,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearAgentLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedAgent, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialAgentLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearAgentLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
      formDisplayType: compVar.formDisplayType,
      formDisplayTypeClick: formDisplayTypeClick,
      tableDisplayTypeClick: tableDisplayTypeClick,
      navObj: navObj
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: compVar.canCancel, options: {icon: "remove", onClick: cancelModule, hint: 'Cancel this module'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const dropDownParamsJsx = () => {

    return (
        <DropDownButton
          text="Reports"
          icon="exportxlsx"
          dropDownOptions={{width: 230}}
          dataSource={compVar.reportsData}
          displayExpr="text"
          onItemClick={onReportClick}
        />                                
    );

  }

  //**********************************************************/
  const getSelectedModuleCancelOption = async (e) => {
    compVar.cancelModuleOpen = false;
    if (e.refresh) {
      await filterData();
    } else {
      forceRender();
    }
  }


  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    const recObj = {table: compVar.tableName, keyField: compVar.keyField, keyValue: compVar.focusedRowKey}
    setPopupDialogBoxVisible(() => {return false});

    if (e===1) {
      const idx = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      compVar.focusedRowKey = (idx > 0) ? compVar.mainData[idx-1][compVar.keyField] : null;  

      // delete module details
      await deleteModuleDetails();

      await dbDeleteRecord(recObj);
      await filterData();
    }
  }


  //**********************************************************/
  const renderContent = () => {

    const additionalPanelHeight = 40;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

    let dataObj = null;
    let formObj = null;
    let elementProps = null;  
    if (initDataFetched && dataFetched) {
      dataObj = createDataObject(viewHeight);
      formObj = createFormObject();
      elementProps = createElementProps();  
    }

    if (compVar.mainData === undefined) {
      return <></>
    }

    const moduleParamsObj = {
      tourCode: null, tourDate: null, pax: null, principalAgents_id: null
    }
    
    const idx = (compVar.mainData.findIndex(rec => rec.QuoModules_id === compVar.focusedRowKey));
    if (idx > -1) {      
      moduleParamsObj.tourCode = compVar.mainData[idx].TourCode;
      moduleParamsObj.tourDate = convert_DbDate_To_DMY(compVar.mainData[idx].TourDate,1);
      moduleParamsObj.pax = compVar.mainData[idx].PaxName;
      moduleParamsObj.principalAgents_id = compVar.mainData[idx].PrincipalAgents_id;
    }
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          {!editPopupVisible && 
            <div style={{ width: '100%'}}>
              <ModuleParams
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

          {initDataFetched && dataFetched && !editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

              <div className="master-grid-params-container">
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <LinkForms hideElem={[2]}/>
                </div>
              </div>        

              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>

              <div className="master-grid-params-container">
                {dropDownParamsJsx()}
                {compVar.reportInProgress &&
                  <LoadIndicator id="small-indicator" height={30} width={30} />
                }
              </div>

            </div>          
      
          }

          {initDataFetched && dataFetched && !editPopupVisible &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
            </div>
          }

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj,moduleParamsObj)}

          {compVar.cancelModuleOpen &&
            <ModuleCancellation {...moduleParamsObj} 
              getSelectedModuleCancelOption={getSelectedModuleCancelOption}
            >
            </ModuleCancellation>
          }

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

export default Modules;
