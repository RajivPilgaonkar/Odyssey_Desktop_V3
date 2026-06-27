import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setVoucherParamValues, dbVoucherReports } from '../../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, convertDMY_toDate, getFieldsArray, convertDMY_MDY, convertToMoment_fmt, getStartOfFinancialYear, getEndOfFinancialYear, getNowDate, setDateTimeFormat } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetListVoucherData";
import {getAgentSubCatListing } from "../../../common/GetOrgListing";
import { canDelete } from "../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getTourRef, getNextVoucherDetails, isValidVoucherQuotationLine, deleteVoucherDetails, recomputeVoucherCost, getExpectedCost} from "../../../common/VoucherHelpers";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation, getVoucherYearRef, getCountryFromCity} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../common/PopupDialogBox';
import {getNavButtonsJsx, navPrevRecordClick, navNextRecordClick, setStopNav} from "../../../common/NavigationHelpers";
import DropDownButton from 'devextreme-react/drop-down-button';
import VoucherAccommodationDetails from '../voucherDetailsPage/voucherAccommodationDetailsPage/VoucherAccommodationDetails';
import VoucherServiceDetails from '../voucherDetailsPage/voucherServicesDetailsPage/VoucherServicesDetails';
import VoucherTransportDetails from '../voucherDetailsPage/voucherTransportDetailsPage/VoucherTransportDetails';
import VoucherTicketDetails from '../voucherDetailsPage/voucherTicketDetailsPage/VoucherTicketDetails';
import VoucherReportRange from '../voucherReportRangePage/VoucherReportRange';
import VoucherSelectRemarks from '../voucherSelectRemarksPage/VoucherSelectRemarks';
import ListVoucherParams from './ListVoucherParams';
import ListUncodedVoucherParams from './ListUncodedVoucherParams';
import { setupReport } from "./ReportSetup";

import '../../../common/MasterGrid.css'

let compVar = {};

function ListVoucher(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  let _g_tourCode = useSelector(state => state.voucherParams.tourCode) || '';
  let _g_tourDate = useSelector(state => state.voucherParams.tourDate) || null;
  let _g_tourLeader = useSelector(state => state.voucherParams.paxName) || '';
  let _g_tourRef = useSelector(state => state.voucherParams.tourRef) || '';

  const _g_users_id = useSelector(state => state.dbUser.users_id);

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
      voucherTypeLookup: [], agentLookup: [], serviceCityLookup: [],
      cityLookup: [], bookThroughAgentLookup: [], currencyLookup: [], 
      tableName: 'Vouchers', keyField: 'Vouchers_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Vouchers', title: 'New Voucher',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1},{title: 'Cost Breakup', index: 2}], 
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption,setStopNavigation],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      tourCode: _g_tourCode, tourDate: _g_tourDate, tourLeader: (_g_tourLeader !== null) ? _g_tourLeader.substring(0,50) : '',
      tourRef: _g_tourRef, companies_id: 1, offices_id: 2,
      fromVoucherDate: null, toVoucherDate: null,
      voucherReportRangePopup: false, voucherRemarksPopup: false,
      voucherDetailsPopup: false,
      admLevel: 1,
      navigationButtonList: [
        {id: "formPrevButton", text: "", type: "normal", visible: true, icon: "chevronleft", onClick: navigatePrevRecordClick, hint: "Previous Voucher"},
        {id: "formNextButton", text: "", type: "normal", visible: true, icon: "chevronright", onClick: navigateNextRecordClick, hint: "Next Voucher"},
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: true, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ], 
      formChanged: false, saveLeaveOpen: false, afterSaveType: 0, 
      dbLookup: [       
        {keyField: 'vouchertypes_id', dataSource: compVar.voucherTypeLookup, 
        displayExpr: 'descr', valueExpr: 'vouchertypes_id', fieldList: ['descr']},

        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'cities_id', dataSource: compVar.serviceCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'Addressbook_id', dataSource: compVar.bookThroughAgentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ],
      reportsData:
      [
        {id: 1, type: 1, text: 'Half Page Vouchers (PDF)', reportName: 'Voucher_HalfPage_', reportType: 'PDF'},
        {id: 2, type: 2, text: 'Two Per Page (PDF)', reportName: 'Vouchers_Two_PerPage_', reportType: 'PDF'},
        {id: 3, type: 3, text: 'Vouchers with Logo (PDF)', reportName: 'Vouchers_', reportType: 'PDF'},
        {id: 4, type: 4, text: 'Voucher Listing (Excel)', reportName: 'VoucherListing', reportType: 'Excel'},
  
        {id: 20,  type: 50,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          
  
        {id: 5, type: 5, text: 'All LLP Accommodation (PDF)', reportName: 'VouchersAcc_', reportType: 'PDF', onlyAccommodation: true},
        {id: 6, type: 6, text: 'All LLP Vouchers (PDF)', reportName: 'Vouchers_', reportType: 'PDF'},
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

      compVar.fromVoucherDate = getStartOfFinancialYear(new Date());
      compVar.toVoucherDate = getEndOfFinancialYear(compVar.fromVoucherDate,2);
      
      compVar.voucherTypeLookup = await dbGetRecord({fields: ['vouchertypes_id', 'description AS descr'], orders: ['description'], table: 'vouchertypes', where: 'active = 1'});   
      compVar.dbLookup[0].dataSource = compVar.voucherTypeLookup;  

      compVar.agentLookup = await getAgentSubCatListing ('3,4,11', true);
      compVar.dbLookup[1].dataSource = compVar.agentLookup;  

      compVar.serviceCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[2].dataSource = compVar.serviceCityLookup;  

      compVar.cityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[3].dataSource = compVar.cityLookup;  

      compVar.bookThroughAgentLookup = await getAgentSubCatListing ('3,4,11', true);
      compVar.dbLookup[4].dataSource = compVar.bookThroughAgentLookup;  

      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
      compVar.dbLookup[5].dataSource = compVar.currencyLookup;  
    
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.dbLookup[6].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const tourDate = convertDMY_MDY(compVar.tourDate);

    const fromDate = convertDMY_MDY(compVar.fromVoucherDate);
    const toDate = convertDMY_MDY(compVar.toVoucherDate);

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      let whereStr = '';
      if (props.uncoded !== undefined && props.uncoded) {
        if (fromDate !== null && toDate !== null) {
          whereStr =  "voucherdate BETWEEN '" + fromDate + "' AND '" + toDate + "' " + 
          "AND LTRIM(RTRIM(COALESCE(mastertourcode,''))) = ''";  
        } else {
          whereStr =  "1=2";  
        }
        
      } else {
        whereStr = "(v.masterTourCode = '" + compVar.tourCode + "') " +
        " AND (v.masterTourDate = '" + tourDate + "') ";
      }
  
      const tableStr = "vouchers v ";

      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['yearref, voucherno'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Voucher Listing'});   

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

    if (props.uncoded !== undefined && props.uncoded) {
      compVar.formTitle = 'Edit Uncoded Voucher ...';
    } else {
      compVar.formTitle = compVar.tourCode + " " + compVar.tourDate + " -- [" + compVar.tourLeader + "]";
    }

    compVar.saveLeaveOpen = false;
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

    const tourDate = (props.uncoded !== undefined && props.uncoded) ? getNowDate('DD/MM/YYYY') : compVar.tourDate;
    await getNextVoucherDetails (props.uncoded, compVar.tourCode, tourDate, compVar.companies_id, defaultObj);

    /*=== There was a bug where tourRef in manual vouchers was not being picked correctly ... ===*/
    /*=== Force it from the tour code and tour date info ===*/
    if (!props.uncoded) {
      const tourRefObj = await getTourRef (compVar.tourCode, compVar.tourDate);
      compVar.tourRef = tourRefObj.tourRef;  
    }

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      Companies_id: compVar.companies_id, 
      Offices_id: compVar.offices_id,
      MasterTourCode: (!props.uncoded) ? compVar.tourCode : null,
      MasterTourDate: (!props.uncoded) ? convertDMY_MDY(tourDate) : null,
      TourLeader: compVar.tourLeader,
      TourRef: compVar.tourRef,
      IncludeInBalanceSheet: true        
    }

    afterAdd(compVar, defaultObj);

    console.log('afterAdd',compVar, defaultObj);    

    if (props.uncoded !== undefined && props.uncoded) {
      compVar.formTitle = 'New Uncoded Voucher ...';
    } else {
      compVar.formTitle = 'New Voucher for ' + compVar.tourCode + " " + compVar.tourDate + " -- [" + compVar.tourLeader + "]";
    }

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      //{table: 'flights', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Flights. Delete the flight details first'},
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

    /*=== yearRef based on voucher date ===*/
    const yearRef = getVoucherYearRef(new Date(compVar.formData.VoucherDate));
    const countriesObj = await getCountryFromCity(compVar.formData.Cities_id);

    /*=== Add the yearRef before saving ===*/
    compVar.formData.YearRef = yearRef;
    compVar.formData.Countries_id = countriesObj.countries_id;
    
    let tmpFormData = {...compVar.formData};

    let condition = "WHERE voucherno = " + compVar.formData.VoucherNo.toString() + " "  +
      "AND yearref = " + compVar.formData.YearRef + " ";
      condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: _g_users_id,
        ModifiedOn: convert_DbDate_To_MDY(),
        Modified: 1
      },
      afterPost: afterPost
    }
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    // only in navigation forms
    compVar.formChanged = false;

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
     
    if ((props.uncoded === undefined || !props.uncoded) && formData.QuoLines_LineNum !== null) {
      const isValidQuoLine = await isValidVoucherQuotationLine (
        compVar.tourCode, compVar.tourDate, formData.QuoLines_LineNum);  
      if (! isValidQuoLine) {
        return 'Invalid Linking Quotation Line number';
      }
    }

    if (props.uncoded) {
      const voucherDate = convertToMoment_fmt(formData.VoucherDate.replace('T', ' ').replace('Z', ''),'');
      const fromVoucherDate = convertToMoment_fmt(compVar.fromVoucherDate,'DD/MM/YYYY');
      if (voucherDate < fromVoucherDate) {
        return 'Voucher Date has to lie in selected Date Range';
      }
      const toVoucherDate = convertToMoment_fmt(compVar.toVoucherDate,'DD/MM/YYYY');
      if (voucherDate > toVoucherDate) {
        return 'Voucher Date has to lie in selected Date Range';
      }
    }

    // form validation errors
    if ((formData.Pax === null) || (formData.Pax <= 0)) {
      return 'Please enter the number of pax';
    }
    
    return '';

  }

  //**********************************************************/
  const afterPost = async() => {

    if ((compVar.formMode === 1) || (compVar.formMode === 2)) {
      if (!compVar.saveLeaveOpen) {
        await closePopup();
      }
    }
       
    // refresh data
    if (!compVar.saveLeaveOpen) {
      await filterData();
    }

  }

  //**********************************************************/
  const getSelectedVoucherType = async(e) => {
    compVar.formData.VoucherTypes_id = e[0].vouchertypes_id;
  }

  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.Addressbook_id = e[0].Addressbook_id;
    compVar.formData.Cities_id = e[0].Cities_id;
    compVar.formData.VoucherServiceCities_id = e[0].Cities_id;
    forceRender();
  }

  //**********************************************************/
  const getSelectedServiceCity = async(e) => {
    compVar.formData.VoucherServiceCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedCity = async(e) => {
    compVar.formData.Cities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedBookThroughAgent = async(e) => {
    compVar.formData.Through_Addressbook_id = e[0].Addressbook_id;
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
  const clearVoucherTypeLookup = async(e) => {
    compVar.formData.VoucherTypes_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async(e) => {
    compVar.formData.Addressbook_id = null;
  }

  //**********************************************************/
  const clearServiceCityLookup = async(e) => {
    compVar.formData.VoucherServiceCities_id = null;
  }

  //**********************************************************/
  const clearCityLookup = async(e) => {
    compVar.formData.Cities_id = null;
  }

  //**********************************************************/
  const clearBookThroughAgentLookup = async(e) => {
    compVar.formData.Through_Addressbook_id = null;
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
    compVar.formChanged = true;

    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.Manual) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.title = 'This voucher was prepeared manually';
      }  
    }
  }

  //**********************************************************/
  const getSelectedParams = async (e) => {

    compVar.tourCode = e.tourCode;
    compVar.tourDate = e.tourDate;
    compVar.tourLeader = e.paxName;
    compVar.tourRef = e.tourRef;

    if (e.searchId !== undefined && e.searchId !== null && e.searchId > 0) {
      compVar.focusedRowKey = e.searchId;
    }
    
    // Save to the REDUX store
    dispatch(setVoucherParamValues({
      tourCode: e.tourCode, 
      tourDate: e.tourDate, 
      paxName: e.paxName, 
      tourLeader: e.paxName,
      tourRef: e.tourRef,
      vouchers_id: compVar.focusedRowKey
    }));


    // this will also render
    await filterData();
    
  }

  //**********************************************************/
  const getUncodedSelectedParams = async (e) => {

    compVar.tourCode = null;
    compVar.tourDate = null;
    compVar.tourLeader = null;
    compVar.tourRef = null;
    
    compVar.fromVoucherDate = e.fromDate;
    compVar.toVoucherDate = e.toDate;

    // this will also render
    if (e.dataRefreshMode === 1) {
      await filterData();
    }

    forceRender();
    
  }

  //**********************************************************/
  const getSelectedReportRangeOption = async (e) => {
    compVar.voucherReportRangePopup = e.open;

    if (e.refresh) {
      setDataFetched(false);
      await setupReport({...compVar.reportObj, fromDate: e.fromDate, toDate: e.toDate});
      setDataFetched(true);
    } else {
      forceRender();
    }

  }


  //**********************************************************/
  const getPdfFileName = (data) => {

    /*=== pdf file name ===*/    
    let addressbookSuffix = '';
    if (data.addressbook_id !== null) {
      addressbookSuffix = '_' + data.addressbook_id.toString();
    }      

    const pdfFileName = data.reportName + data.tourCode + addressbookSuffix + '.pdf';

    return(pdfFileName);

  }

  //**********************************************************/
  const editDescription = () => {
    compVar.voucherDetailsPopup = true;
    forceRender();
  }

  //**********************************************************/
  const addInstructions = () => {
    compVar.voucherRemarksPopup = true;
    forceRender();
  }

  //**********************************************************/
  const getSelectedVoucherRemarks = async(e) => {

    compVar.voucherRemarksPopup = e.open;
    
    let remarksArr = [];
    if (e.remarks !== undefined && e.remarks !== null && e.remarks > '') {
      remarksArr = e.remarks.split('\n');
      for (let rec of remarksArr) {
        // Otherwise code which follows will give problems if Remarks1 is null  
        if (compVar.formData.Remarks1 === null) {
          compVar.formData.Remarks1 = '';
        }
        if (!compVar.formData.Remarks1.includes(rec)) {
          compVar.formData.Remarks1 += (compVar.formData.Remarks1 > '') ? '\n' : '';
          compVar.formData.Remarks1 += rec;
        }
      }
    }

    forceRender();

  }

  //**********************************************************/
  const onReportClick = async (e) => {

    setDataFetched(false);

    /*=== Obtain the filename to save the pdf as ====*/
    const tourDate = convertDMY_MDY(compVar.tourDate);

    let data = {tourCode: compVar.tourCode, tourDate: tourDate, 
      voucherRange: null, yearRef: null, reportType: e.itemData.type, 
      addressbook_id: null, vouchers: null, reportName: e.itemData.reportName, 
      openReport: false,
      onlyAccommodation: (e.itemData.onlyAccommodation === undefined ? false : e.itemData.onlyAccommodation)
    };      

    const fileName = getPdfFileName(data);
    data.fileName = fileName;

    compVar.errorMsg = '';
    if (e.itemData.reportType === 'PDF') {
      /*=== Obtain the filename to save the pdf as ====*/
      const result = await dbVoucherReports({data: data});
      if ((result.error !== undefined) && (result.error !== null)) {
        compVar.errorMsg = result.error;
      }
    } else {
      compVar.reportObj = {...e.itemData}
      compVar.voucherReportRangePopup = true;
      forceRender();
    }

    setDataFetched(true);

  }

  //**********************************************************/
  const updateDescription = async (e) => {

    // update description if 'SAVE' clicked
    if (e.mode === 1) {
      compVar.formData.Description = e.descr;
      if (e.voucherDate !== undefined) {
        compVar.formData.VoucherDate = convertDMY_toDate(e.voucherDate);
      }
      if (e.voucherServiceCities_id !== undefined) {
        compVar.formData.VoucherServiceCities_id = e.voucherServiceCities_id;
      }
      await recomputeVoucherCost(compVar.formData.Vouchers_id, compVar.formData.VoucherTypes_id);
      compVar.formData.ExpectedCost = await getExpectedCost(compVar.formData.Vouchers_id);
    }

    compVar.voucherDetailsPopup = e.open;
    forceRender();

  }



  //**********************************************************/
  const getNavigationButtonsJsx = () => {
    return getNavButtonsJsx(compVar,null);
  }

  //**********************************************************/
  const saveFormDataLeaveOpen = async () => {
    compVar.saveLeaveOpen = true;
    await saveFormData();
  }

  //**********************************************************/
  const navigatePrevRecordClick = async () => {

    navPrevRecordClick(compVar,-1);
    if (compVar.afterSaveType === -1) {
      setPopupDialogBoxVisible(true);
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const navigateNextRecordClick = async () => {

    navNextRecordClick(compVar,1);
    if (compVar.afterSaveType === 1) {
      setPopupDialogBoxVisible(true);
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const setStopNavigation  = async (e) => {

    await setStopNav (e, compVar, saveFormData);
    setPopupDialogBoxVisible(false);
    forceRender();

  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = ['Reports'];
    const icons = ['exportxlsx']
    const widths = [150];
    const dropDownOptions = [{width: 200}];
    const items = [compVar.reportsData];
    const onItemClicks = [onReportClick];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={"id"}
        displayExpr={"text"}
        onItemClick={onItemClick}
      />
    )

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    if (Object.keys(compVar).length === 0) {
      return {}
    }

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

    if (Object.keys(compVar).length === 0) {
      return {}
    }

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    // *** CASE SENSITIVE override formData properties
    const clearVoucherTypeLookupValues = {vouchertypes_id: null, descr: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearServiceCityLookupValues = {cities_id: null, city: ''};
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearBookThroughAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialVoucherTypeLookupValues = getLookupValues (
      clearVoucherTypeLookupValues, compVar.voucherTypeLookup, 
       ['vouchertypes_id','descr'], compVar.formData.VoucherTypes_id);

    const initialAgentLookupValues = getLookupValues (
      clearAgentLookupValues, compVar.agentLookup, 
      ['Addressbook_id','OrgCity','Cities_id'], compVar.formData.Addressbook_id);

    const initialServiceCityLookupValues = getLookupValues (
      clearServiceCityLookupValues, compVar.serviceCityLookup, 
      ['cities_id','city'], compVar.formData.VoucherServiceCities_id);
        
    const initialCityLookupValues = getLookupValues (
      clearCityLookupValues, compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.Cities_id);
      
    const initialBookThroughAgentLookupValues = getLookupValues (
      clearBookThroughAgentLookupValues, compVar.bookThroughAgentLookup, 
      ['Addressbook_id','OrgCity','Cities_id'], compVar.formData.Through_Addressbook_id);
  
    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, compVar.currencyLookup, 
      ['currencies_id','currencycode'], compVar.formData.Currencies_id);

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
      clearLookup: [clearVoucherTypeLookup, clearAgentLookup, clearServiceCityLookup, clearCityLookup, clearBookThroughAgentLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedVoucherType, getSelectedAgent, getSelectedServiceCity, getSelectedCity, getSelectedBookThroughAgent, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialVoucherTypeLookupValues, initialAgentLookupValues, initialServiceCityLookupValues, initialCityLookupValues, initialBookThroughAgentLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearVoucherTypeLookupValues, clearAgentLookupValues, clearServiceCityLookupValues, clearCityLookupValues, clearBookThroughAgentLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,
      additionalButtonActions: [editDescription, addInstructions],
      formMode: compVar.formMode
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
      if (compVar.focusedRowKey !== null) {
        await deleteVoucherDetails(compVar.focusedRowKey);
      }
      await dbDeleteRecord(recObj);
      await filterData();
    }
  }
    

  //**********************************************************/
  const renderContent = () => {

    const paramsPanelHeight = 30;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-paramsPanelHeight;
    const viewHeight = heights.viewHeight-paramsPanelHeight;

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();
    const elementProps = createElementProps();
    
    return (
      <>

        {(props.uncoded === undefined || !props.uncoded) && 
          <ListVoucherParams
            getSelectedParams={getSelectedParams}          
            //onPanelLoad={onPanelLoad}
          />
        }

        {props.uncoded !== undefined && props.uncoded &&
          <ListUncodedVoucherParams
            getUncodedSelectedParams={getUncodedSelectedParams}          
            //onPanelLoad={onPanelLoad}
          />
        }

        {(!initDataFetched || !dataFetched) &&
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        }

        {initDataFetched && dataFetched &&
          <div className="master-grid-container" style={{height: containerHeight}}>

            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
              <div className="master-grid-params-container" style={{flex: 2}}>
              </div>
              <div style={{flex: 5}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container" style={{flex: 1.3}}>
                {dropDownButtonJsx(0)}
              </div>
            </div>        

            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
            </div>

            {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

            {compVar.voucherReportRangePopup &&
              <VoucherReportRange 
                getSelectedReportRangeOption={getSelectedReportRangeOption}    
                dateRangeType={1}
                formType={1}
              />          
            }

            {compVar.voucherDetailsPopup && compVar.formData.VoucherTypes_id===3 &&
              <VoucherAccommodationDetails 
                vouchers_id={compVar.formData.Vouchers_id} 
                agents_id={compVar.formData.Addressbook_id} 
                voucherDate={compVar.formData.VoucherDate}
                onClose={updateDescription} 
              />              
            }

            {compVar.voucherDetailsPopup && compVar.formData.VoucherTypes_id===4 &&
              <VoucherServiceDetails 
                vouchers_id={compVar.formData.Vouchers_id} 
                agents_id={compVar.formData.Addressbook_id} 
                voucherDate={compVar.formData.VoucherDate}
                serviceCities_id={compVar.formData.VoucherServiceCities_id} 
                onClose={updateDescription} 
              />              
            }

            {compVar.voucherDetailsPopup && compVar.formData.VoucherTypes_id===5 &&
              <VoucherTransportDetails 
                vouchers_id={compVar.formData.Vouchers_id} 
                agents_id={compVar.formData.Addressbook_id} 
                voucherDate={compVar.formData.VoucherDate}
                serviceCities_id={compVar.formData.VoucherServiceCities_id} 
                onClose={updateDescription} 
              />              
            }

            {compVar.voucherDetailsPopup && compVar.formData.VoucherTypes_id===2 &&
              <VoucherTicketDetails 
                vouchers_id={compVar.formData.Vouchers_id} 
                agents_id={compVar.formData.Addressbook_id} 
                voucherDate={compVar.formData.VoucherDate}
                onClose={updateDescription} 
              />              
            }

            {compVar.voucherRemarksPopup &&
              <VoucherSelectRemarks
                vouchers_id={compVar.formData.Vouchers_id}
                description={compVar.formData.Description}
                getSelectedVoucherRemarks={getSelectedVoucherRemarks}    
              />            
            }

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
        }

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default ListVoucher;
