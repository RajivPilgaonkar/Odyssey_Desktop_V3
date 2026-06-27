import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbExecuteSp, setPrestoParamValues, dbPrestoReports, dbPrestoDocxReports } from '../../../../actions';
import { convert_DbDate_To_DMY, convert_DbDate_To_MDY, convertDMY_MDY, getFieldsArray, getLookupValues, saveEditedInsertedData, convertToMoment_fmt, checkNullErrors, containsWhitespace, dateDiff, isValidTime, beforeInsert, getNowDate, convertDMY_toDate, setDateTimeFormat, getFirstOfMonth, getLastOfMonth, convertMDY_toDate } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd} from "../../../common/MasterGridHelpers";
import { getAgentByCategoryListing} from "../../../common/GetOrgListing";
import { Button } from 'devextreme-react/button';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import { canDelete } from "../../../common/CommonFunctions";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import PopupDialogBox from '../../../common/PopupDialogBox';
import LinkForms from "../../../common/LinkForms";
import {getAdmLevelLocation, getVoucherYearRef} from "../../../common/GetDescFromIds";
import {setMastersId, getModuleStatus, getTourMasterStatus, getDataForAgent, getDataForConsultant, getQuoPrint, getNextQuotationNo} from "../../../common/PrestoHelpers";
import { getDevExtremeTable, tableHeaderArray, getDevExtremePopupForm } from "./GetPrestoListData";
import DropDownButton from 'devextreme-react/drop-down-button';
import PrestoListParams from './PrestoListParams';
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function PrestoList(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  //const _g_userName = useSelector(state => state.dbUser.userName);
  let _g_fromDate = useSelector(state => state.prestoParams.fromDate);
  let _g_toDate = useSelector(state => state.prestoParams.toDate);
  if (props.dataType === 3) {
    _g_fromDate = useSelector(state => state.prestoParams.riksjaFromDate);
    _g_toDate = useSelector(state => state.prestoParams.riksjaToDate);  
  }

  let nowDate = new Date(); 
  const startEndDateObj = getFirstOfMonth(nowDate,1);

  const fromDate = convert_DbDate_To_DMY(startEndDateObj.startDate,1);
  const toDate = convert_DbDate_To_DMY(startEndDateObj.endDate,1);

  _g_fromDate = (_g_fromDate === 'Invalid date') ? fromDate : _g_fromDate;
  _g_toDate = (_g_toDate === 'Invalid date') ? toDate : _g_toDate;

  const _g_tourCode = useSelector(state => state.prestoParams.tourCode);
  const _g_tourDate = useSelector(state => state.prestoParams.tourDate);
  const _g_pax = useSelector(state => state.prestoParams.pax);
  let _g_trial = useSelector(state => state.prestoParams.trial);
  let _g_quotations_id = useSelector(state => state.prestoParams.quotations_id);
  if (props.dataType === 3) {
    _g_quotations_id = useSelector(state => state.prestoParams.riksjaQuotations_id);
  }
  const _g_createdByMe = useSelector(state => state.prestoParams.createdByMe);

  const _g_location = useLocation();
  const dispatch = useDispatch();

  if (compVar !== undefined && compVar.quotations_id !== _g_quotations_id) {
    compVar.quotations_id = _g_quotations_id;
    compVar.focusedRowKey = _g_quotations_id;
  }

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {

    setTrialFromDataType();

    // Object for component variables
    compVar = {
      mainData: [], 
      fromIntCityLookup: [], fromCityLookup: [], toIntCityLookup: [],   
      toCityLookup: [], agentLookup: [], consultantLookup: [],   
      countryLookup: [], currencyLookup: [], vehicleLookup: [],
      hotelTypeLookup: [], mealPlanLookup: [], createdByLookup: [], 
      userLookup: [], managerLookup: [], 
      tableName: 'Quotations', keyField: 'Quotations_id',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Tours', title: 'New Tour',
      errorMsg: '', 
      tabs: [{title: 'Main', index: 0},{title: 'Preferences', index: 1},{title: 'Pax', index: 2}], 
      canAdd: true, canModify: true, canDelete: true,  canCancel: false,
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',      
      isEdited: false, condition: '', 
      formHeight: 500, tabIndex: 0,
      fromDate: _g_fromDate, toDate: _g_toDate, 
      quotations_id: _g_quotations_id, 
      tourCode: _g_tourCode, tourDate: _g_tourDate, paxName: _g_pax,
      trial: _g_trial, itineraryBuilder: false,
      selectedYesNoOption: false, deleteRecordObj: {}, 
      numFutureVouchers: 0, searchPanelOpen: false,
      popupDialogIndex: 0, popupSelectedOptions: [deleteQuotationProc, deleteMasterProc, quotationCopyProc],
      voucherIssueDetailsPopup: false,
      createdSwitchValue: _g_createdByMe, focusedRowKey: _g_quotations_id,
      formOpen: false, viewType: 1, reportInProgress: false,
      toastIsVisible: false, toastMessage: '',
      dbLookup: [ 

        {keyField: 'city', dataSource: compVar.fromIntCityLookup, 
        displayExpr: 'city', valueExpr: 'city', fieldList: ['city']},
        
        {keyField: 'cities_id', dataSource: compVar.fromCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'city', dataSource: compVar.toIntCityLookup, 
        displayExpr: 'city', valueExpr: 'city', fieldList: ['city']},
        
        {keyField: 'cities_id', dataSource: compVar.toCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'Consultants_id', dataSource: compVar.consultantLookup, 
        displayExpr: 'Consultant', valueExpr: 'Consultants_id', fieldList: ['Consultant']},

        {keyField: 'countries_id', dataSource: compVar.countryLookup, 
        displayExpr: 'country', valueExpr: 'countries_id', fieldList: ['country']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

        {keyField: 'HotelTypes_id', dataSource: compVar.hotelTypeLookup, 
        displayExpr: 'HotelType', valueExpr: 'HotelTypes_id', fieldList: ['HotelType']},

        {keyField: 'mealplans_id', dataSource: compVar.mealPlanLookup, 
        displayExpr: 'mp', valueExpr: 'mealplans_id', fieldList: ['mp']},

        {keyField: 'AdmUsers_id', dataSource: compVar.createdByLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']},

        {keyField: 'AdmUsers_id', dataSource: compVar.managerLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}

      ],
      actionList: [
        {key2: 1, text: 'Create Module Quotation', onItemClick: createModule, itemType: 1, display: 1},
        {key2: 2, template: function() { return "<hr style='margin: unset, height: 5' />"; }, itemType: 1 , display: 1},          
        {key2: 5, text: 'Create Master', onItemClick: createMaster, itemType: 1, display: 1},
        {key2: 6, text: 'Delete Master', onItemClick: deleteMaster, itemType: 1, display: 1},
        {key2: 10, template: function() { return "<hr style='margin: unset, height: 5' />"; } , itemType: 1, display: 2},          
        {key2: 11, text: 'Delete Entire Quotation', onItemClick: deleteQuotation, itemType: 2, display: 2},
        {key2: 20, template: function() { return "<hr style='margin: unset, height: 5' />"; } , itemType: 1, display: 1},          
        {key2: 21, text: 'Create a Copy', onItemClick: createQuotationCopy, itemType: 2, display: 1},
      ],
      reportsData:
        [
          {id: 1, type: 1, text: 'Basic Itinerary', reportName: 'BasicItinerary', reportType: 'PDF', reportEndPoint: '/reports/presto/basicItinerary'},
          {id: 2, type: 1, text: 'Detailed Itinerary', reportName: 'DetailedItinerary', reportType: 'PDF', reportEndPoint: '/reports/presto/detailedItinerary', img: false},
          {id: 3, type: 1, text: 'Detailed Itinerary (Images)', reportName: 'DetailedItinerary', reportType: 'PDF', reportEndPoint: '/reports/presto/detailedItinerary', img: true},
          {id: 4, type: 1, text: 'Inclusions', reportName: 'Inclusions', reportType: 'PDF', reportEndPoint: '/reports/presto/inclusions'},
          {id: 5, type: 1, text: 'Exclusions', reportName: 'Exclusions', reportType: 'PDF', reportEndPoint: '/reports/presto/exclusions'},
          {id: 6, type: 1, text: 'Composite Report (Images)', reportName: 'Composite', reportType: 'PDF', reportEndPoint: '/reports/presto/composite', subType: 1},
          {id: 7, type: 1, text: 'Composite Report', reportName: 'Composite', reportType: 'PDF', reportEndPoint: '/reports/presto/composite', subType: 2},

          {id: 10,  type: 3,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          

          {id: 13, type: 1, text: 'Welcome Letter', reportName: 'WelcomeLetter', reportType: 'PDF', reportEndPoint: '/reports/presto/welcomeLetterPdf'},
          {id: 14, type: 1, text: 'Drivers Itinerary', reportName: 'DriversItinerary', reportType: 'PDF', reportEndPoint: '/reports/presto/driversItineraryPdf'},
          {id: 15, type: 1, text: 'Paging Board', reportName: 'PagingBoard', reportType: 'PDF', reportEndPoint: '/reports/presto/pagingBoard'},

          {id: 20,  type: 3,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          

          {id: 21, type: 1, text: 'List of Services', reportName: 'ListOfServices', reportType: 'PDF', reportEndPoint: '/reports/presto/tourHotelsAgents'},
          {id: 22, type: 1, text: 'Hotels (Images)', reportName: 'HotelListing', reportType: 'PDF', reportEndPoint: '/reports/presto/hotelImages'},

        ],
        buttonList: [
          {id: 1, icon: 'icons/form.png', hint: 'Form'},
          {id: 2, icon: 'icons/city.png', hint: 'City List'},
          {id: 9, icon: 'icons/idle.png', hint: 'Set Idle Period'}, 
          {id: 3, icon: 'icons/calendar.png', hint: 'Day to Day Itinerary'},
          {id: 4, icon: 'icons/costing.png', hint: 'Costing'},
          {id: 5, icon: 'icons/composite.png', hint: 'Composite Report'},
          {id: 6, icon: 'icons/hotel.png', hint: 'Hotels & Agents'},
          {id: 7, icon: 'message', hint: 'Send Emails'},
          {id: 8, icon: 'group', hint: 'Change Pax during Tour'},
          {id: 10, icon: 'icons/modules.png', hint: 'Link to Modules'},
        ]
  
    }   
     
    fetchInitialData();

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

    compVar.fromIntCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
    compVar.dbLookup[0].dataSource = compVar.fromIntCityLookup;

    compVar.fromCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
    compVar.dbLookup[1].dataSource = compVar.fromCityLookup;

    compVar.toIntCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
    compVar.dbLookup[2].dataSource = compVar.toIntCityLookup;

    compVar.toCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
    compVar.dbLookup[3].dataSource = compVar.toCityLookup;

    compVar.agentLookup = await getAgentByCategoryListing ('2');
    compVar.dbLookup[4].dataSource = compVar.agentLookup;

    compVar.consultantLookup = await dbGetRecord({fields: ['Consultants_id', 'Consultant', 'Email', 'Addressbook_id', 'active'], orders: ['Consultant'], table: 'Consultants'});   
    compVar.dbLookup[5].dataSource = compVar.consultantLookup;

    compVar.countryLookup = await dbGetRecord({fields: ['countries_id', 'country'], orders: ['country'], table: 'countries'});   
    compVar.dbLookup[6].dataSource = compVar.countryLookup;

    compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
    compVar.dbLookup[7].dataSource = compVar.currencyLookup;

    compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles'});    
    compVar.dbLookup[8].dataSource = compVar.vehicleLookup;

    compVar.hotelTypeLookup = await dbGetRecord({fields: ['HotelTypes_id', 'HotelType'], orders: ['OrderNo'], table: 'HotelTypes', where: 'OrderNo IS NOT NULL'});    
    compVar.dbLookup[9].dataSource = compVar.hotelTypeLookup;

    compVar.mealPlanLookup = await dbGetRecord({fields: ['mealplans_id', '[plan] AS mp'], orders: ['[plan]'], table: 'mealplans'});   
    compVar.dbLookup[10].dataSource = compVar.mealPlanLookup;

    compVar.createdByLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
    compVar.dbLookup[11].dataSource = compVar.createdByLookup;

    compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
    compVar.dbLookup[12].dataSource = compVar.userLookup;

    compVar.managerLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
    compVar.dbLookup[13].dataSource = compVar.managerLookup;

    setInitDataFetched(true);

    await filterData();

  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    try {

      const fromDate = convertDMY_MDY(compVar.fromDate);
      const toDate = convertDMY_MDY(compVar.toDate);

      let fieldArray = getFieldsArray(tableHeaderArray);
      fieldArray = fieldArray.map(e => 'q.' + e);
      fieldArray.push("CONVERT(varchar(5),ETA,108) AS ETA_Time");
      fieldArray.push("CONVERT(varchar(5),ETD,108) AS ETD_Time");
      fieldArray.push("u.uid AS  UserName");
  
      let createdByStr = "";
      if (compVar.createdSwitchValue) {
        createdByStr = " AND u.AdmUsers_id = " + _g_users_id.toString();
      }
    
      const whereStr = "q.StartDate BETWEEN '" + fromDate + "' AND '" + toDate + "' AND q.Trial = " + compVar.trial.toString() + createdByStr;
  
      const tableStr = "Quotations q " + 
        "LEFT JOIN QuoModules q2 ON q.TourCode = q2.TourCode AND q.StartDate = q2.TourDate " + 
        "LEFT JOIN AdmUsers u ON q.AdmUsers_id = u.AdmUsers_id ";
  
      const orderField = (props.dataType===1) ? 'q.StartDate' : 'q.TourCode';

      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: [orderField], table: tableStr, where: whereStr});   
      compVar.mainData = compVar.mainData.map(rec => ({...rec, Masters_id: null}));
      await setMastersId(compVar.mainData);        

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      // If quotations_id from redux was within current dataset
      const idx = compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.quotations_id);
      compVar.focusedRowKey = (idx > -1) ? compVar.focusedRowKey : ((compVar.mainData.length > 0) ? compVar.mainData[0].Quotations_id : -1);      
         
    } catch(err) {
      alert(err);
    }

    setFocusedRow(compVar);  
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {
    afterEdit(compVar, e);
    //toggleEditPopup();   

    // You can set focus on the tour last edited
    compVar.tourCode = e.row.data.TourCode;
    compVar.tourDate = convert_DbDate_To_DMY(e.row.data.StartDate,1);
    compVar.paxName = e.row.data.PaxName;
    compVar.quotations_id = e.row.data.Quotations_id;
    
    compVar.formOpen = true;
    forceRender();

  }

  //**********************************************************/
  const addRow = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    const quotationDate = getNowDate('DD/MM/YYYY');
    const yearRef = getVoucherYearRef(convertDMY_toDate(quotationDate));

    const today = getNowDate('MM/DD/YYYY');

    // next quotation number for the company
    const quotationObj = await getNextQuotationNo (yearRef, compVar.trial);
    const nextQuotationNo = quotationObj.nextQuoteNo;

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      QuotationDate: convertDMY_toDate(quotationDate),
      QuotationYearRef: yearRef,
      QuotationNo: nextQuotationNo, 
      Trial: compVar.trial,
      BookingEntryDate: today,
      AdmUsers_id: _g_users_id
    }

    afterAdd(compVar, defaultObj);

    compVar.tabIndex = 0;
    compVar.formOpen = true;
    forceRender();

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      {table: 'QuoCities', condition: 'WHERE Quotations_id = ' + e.row.data.Quotations_id, existsIn: 'Quotation City List. Delete the city list first'},
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

    if (compVar.formData.QuotationDate !== null) {
      compVar.formData.BookingRecdDate = compVar.formData.QuotationDate;
    }

    await setDateArrivalDeparture();

    /*=== yearRef based on voucher date ===*/
    const yearRef = getVoucherYearRef(new Date(compVar.formData.QuotationDate));
    compVar.formData.QuotationYearRef = yearRef;

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

    let condition = "WHERE QuotationNo = " + compVar.formData.QuotationNo + " "  +
      "AND QuotationYearRef = " + compVar.formData.QuotationYearRef + " " + 
      "AND Trial = " + compVar.formData.Trial.toString() + ' ';
    condition += (compVar.formMode === 2) ? "AND Quotations_id <> " + compVar.formData.Quotations_id: "";

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
    compVar.tourDate = convert_DbDate_To_DMY(saveData.formData['StartDate'],1);
    compVar.paxName = saveData.formData['PaxName'];

    compVar.focusedRowKey = saveData.formData[compVar.keyField];
    compVar.quotations_id = compVar.focusedRowKey;
    _g_quotations_id = compVar.quotations_id;
    
    compVar.paxName = saveData.formData['PaxName'];

    const tourDate = convertToMoment_fmt(compVar.formData.StartDate,'');
    const fromDate = convertToMoment_fmt(compVar.fromDate,'DD/MM/YYYY');
    const toDate = convertToMoment_fmt(compVar.toDate,'DD/MM/YYYY');

    // If Tour Code does not lie between Param From & To Dates, search for it
    if (tourDate < fromDate || tourDate > toDate) {
      // Make sure you take the start date from the saveData.formData, and not compVar.formData as this would be in the required date format
      // This data is passed to MDY_toDate, and requires format in MM/DD/YYYY
      let startDate = saveData.formData.StartDate;
      if (typeof saveData.formData.StartDate === 'string') {
        startDate = convertMDY_toDate(saveData.formData.StartDate.slice(0,10));
      }

      await setDates(startDate);
    } 

    saveToReduxStore();

    if (compVar.formMode === 1) {
      closeForm();
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

    // Check if same Tour Code has blanks 
    if (containsWhitespace(compVar.formData.TourCode)) {
      return 'The Tour Code should not contain spaces';
    }

    // Check if same Tour Code / Tour Date exists 
    const tourExists = await doesTourExist();
    if (tourExists) {
      return 'This Tour Code already exists in Quotations';
    }

    // form validation errors
    if (formData.DateOfArrival === null) {
      formData.DateOfArrival = formData.StartDate;
    }

    const days = dateDiff(formData.DateOfArrival, formData.StartDate, 'days');
    if (days > 1)  {
      return "Date of Arrival can be at most 1 day after Start/Tour Date";
    }

    formData.EndDate = convert_DbDate_To_MDY(formData.DateOfDeparture, 1);

    // form validation errors
    if ((formData.ETA_Time !== null) && !isValidTime(formData.ETA_Time)) {
      return "Invalid ETA entered";
    }

    if ((formData.ETD_Time !== null) && !isValidTime(formData.ETD_Time)) {
      return "Invalid ETD entered";
    }

    const arrival = convertToMoment_fmt(formData.DateOfArrival,'');
    const departure = convertToMoment_fmt(formData.DateOfDeparture,'');
    if ((formData.DateOfDeparture !== null) && (formData.DateOfArrival !== null) && (departure < arrival)) {
      return "Date of Depature has to be later than Date of Arrival";
    }

    if (formData.NumSingles === null) {
      formData.NumSingles = 0;
    }

    if (formData.NumDoubles === null) {
      formData.NumDoubles = 0;
    }

    if (formData.NumTriples === null) {
      formData.NumTriples = 0;
    }

    if (formData.NumTwins === null) {
      formData.NumTwins = 0;
    }

    if ((formData.NumPax === null) || (formData.NumPax <= 0)) {
      return 'Please enter the number of pax';
    }

    // form validation errors
    if ((formData.NumPax === null) || (formData.NumPax <= 0)) {
      return 'Please enter the number of pax';
    }

    // Standard Car
    if (formData.Vehicles_id === null) {
      formData.Vehicles_id = 36;
    }

    // Standard Hotel
    if (formData.HotelTypes_id === null) {
      formData.HotelTypes_id = 6;
    }

    // Meal Plan CP
    if (formData.MealPlans_id === null) {
      formData.MealPlans_id = 2;
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
  const getSelectedFromIntCity = async(e) => {
    compVar.formData.PlaceFrom = e[0].city;
  }

  //**********************************************************/
  const getSelectedFromCity = async(e) => {
    compVar.formData.StartCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedToIntCity = async(e) => {
    compVar.formData.PlaceTo = e[0].city;
  }

  //**********************************************************/
  const getSelectedToCity = async(e) => {
    compVar.formData.EndCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.PrincipalAgents_id = e[0].Addressbook_id;

    // update exchange rate for invoicing
    const agentQry = await getDataForAgent(e[0].Addressbook_id);
    compVar.formData.Countries_id = agentQry.countries_id;
    compVar.formData.Currencies_id = agentQry.currencies_id;
    compVar.formData.Email = agentQry.email;
    compVar.formData.Consultants_id = null;

    forceRender();

  }

  //**********************************************************/
  const getSelectedConsultant = async(e) => {
    compVar.formData.Consultants_id = e[0].Consultants_id;

    // update exchange rate for invoicing
    const consultantQry = await getDataForConsultant(e[0].Consultants_id, e[0].Addressbook_id);
    compVar.formData.Email = consultantQry.email;

    forceRender();

  }

  //**********************************************************/
  const getSelectedCountry = async(e) => {
    compVar.formData.Countries_id = e[0].countries_id;
  }

  //**********************************************************/
  const getSelectedCurrency = async(e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedVehicle = async(e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;
  }

  //**********************************************************/
  const getSelectedHotelType = async(e) => {
    compVar.formData.HotelTypes_id = e[0].HotelTypes_id;
  }

  //**********************************************************/
  const getSelectedMealPlan = async(e) => {
    compVar.formData.MealPlans_id = e[0].mealplans_id;
  }

  //**********************************************************/
  const getSelectedCreatedByUser = async(e) => {
    compVar.formData.AdmUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const getSelectedUser = async(e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const getSelectedManager = async(e) => {
    compVar.formData.Managers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearFromIntCityLookup = async() => {
    compVar.formData.PlaceFrom = null;
  }

  //**********************************************************/
  const clearFromCityLookup = async() => {
    compVar.formData.StartCities_id = null;
  }

  //**********************************************************/
  const clearToIntCityLookup = async() => {
    compVar.formData.PlaceTo = null;
  }

  //**********************************************************/
  const clearToCityLookup = async() => {
    compVar.formData.EndCities_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async() => {
    compVar.formData.PrincipalAgents_id = null;
  }

  //**********************************************************/
  const clearConsultantLookup = async() => {
    compVar.formData.Consultants_id = null;
  }

  //**********************************************************/
  const clearCountryLookup = async() => {
    compVar.formData.Countries_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = async() => {
    compVar.formData.Currencies_id = null;
  }

  //**********************************************************/
  const clearVehicleLookup = async(e) => {
    compVar.formData.Vehicles_id = null;
  }

  //**********************************************************/
  const clearHotelTypeLookup = async(e) => {
    compVar.formData.HotelTypes_id = null;
  }

  //**********************************************************/
  const clearMealPlanLookup = async(e) => {
    compVar.formData.MealPlans_id = null;
  }

  //**********************************************************/
  const clearCreatedByUserLookup =  async() => {
    compVar.formData.AdmUsers_id = null;
  }

  //**********************************************************/
  const clearUserLookup = async() => {
    compVar.formData.ModifiedByUsers_id = null;
  }

  //**********************************************************/
  const clearManagerLookup = async() => {
    compVar.formData.Managers_id = null;
  }

  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.viewType = 1;
    compVar.errorMsg = '';

    if (compVar.isEdited) {
      await filterData();
    }
  };  

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
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

      // Save to redux store through params reducer
      if (props.dataType !== 3) {
        dispatch(setPrestoParamValues({
          quotations_id: e.row.data.Quotations_id, 
          fromDate: compVar.fromDate,
          toDate: compVar.toDate,
          tourCode: e.row.data.TourCode, 
          tourDate: convert_DbDate_To_DMY(e.row.data.StartDate,1), 
          pax: e.row.data.PaxName,
        }));  
      } else {
        dispatch(setPrestoParamValues({
          riksjaQuotations_id: e.row.data.Quotations_id, 
          riksjaFromDate: compVar.fromDate,
          riksjaToDate: compVar.toDate,
          pax: e.row.data.PaxName,
        }));  
      }

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data[compVar.keyField];

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;

        compVar.quotations_id = id;
        compVar.tourCode = e.row.data.TourCode;
        compVar.tourDate = convert_DbDate_To_DMY(e.row.data.StartDate,1);
        compVar.tabIndex = 0;
        forceRender();
      }
  
    }

  }

  //**********************************************************/
  const formFieldDataChanged = async(e) => {
    // If StartDate entered in 'Add Mode', DateOfArrival = StartDate-1 if not yet entered
    if (compVar.formMode === 1 && e.dataField === 'StartDate') {
      if (e.value !== null && compVar.formData.DateOfArrival === null) {
        compVar.formData.DateOfArrival = new Date(convert_DbDate_To_MDY(e.value,1));
        forceRender();
      }
    }
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    

    if (e.rowType === 'data') {
      if (e.data.Masters_id) {
        e.rowElement.style.color = 'green'; 
        e.rowElement.title = 'Master has been created for this Tour';
      } 
      
      if (e.data.CancelledOn !== null) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.style.textDecorationLine = 'line-through';
        e.rowElement.title = 'This tour was cancelled';
      }
    }

  }

  //**********************************************************/
  const setTrialFromDataType = async () => {
    if (props.dataType === 3) {
      _g_trial = 3;
    } else {
      if (_g_trial !== 0 && _g_trial !== 1) {
        _g_trial = 0;
      }
    }  
  }

  //**********************************************************/
  const setDates = async (xDate) => {

    const fromDate = getFirstOfMonth(xDate, 0);
    const toDate = getLastOfMonth(xDate, 0);

    compVar.fromDate = convert_DbDate_To_DMY(fromDate,1);
    compVar.toDate = convert_DbDate_To_DMY(toDate,1);

    compVar.tourDate = convert_DbDate_To_DMY(xDate,1);

  }

  //**********************************************************/
  const saveToReduxStore = () => {

    // Save to redux store through params reducer
    if (props.dataType !== 3) {
      dispatch(setPrestoParamValues({
        tourCode: compVar.tourCode, 
        tourDate: compVar.tourDate, 
        fromDate: compVar.fromDate,
        toDate: compVar.toDate,
        pax: compVar.paxName,
        quotations_id: _g_quotations_id
      }));  
    } else {
      dispatch(setPrestoParamValues({
        fromDate: compVar.fromDate,
        toDate: compVar.toDate,
        pax: compVar.paxName,
        riksjaQuotations_id: _g_quotations_id
      }));  
    }

  }

  //**********************************************************/
  const getSelectedParams = async (e) => {

    compVar.fromDate = e.fromDate;
    compVar.toDate = e.toDate;

    compVar.trial = e.trial;
    compVar.searchPanelOpen = e.searchPanelOpen;
    compVar.createdSwitchValue = e.createdSwitchValue;

    // Save to the REDUX store only in Live/Trial
    if (props.dataType === 1 || props.dataType === 2) {
      setPrestoParamValues({
        fromDate: e.fromDate, 
        toDate: e.toDate, 
        trial: e.trial,
        createdByMe: e.createdSwitchValue
      });  
    }

    // Only when 'Refresh' button is clicked in Params
    if (e.dataRefreshMode === 1) {
      setDataFetched(false);
      forceRender();

      // this will also render
      await filterData();

    }

    forceRender();

  }

  //**********************************************************/
  const onTabOptionChanged = async (e) => {
    if ((e.addedItems !== undefined) && (e.addedItems.length > 0)) {      

      const selectedTab = e.addedItems[0].title;
      let obj = compVar.tabs.find(o => o.title === selectedTab);
      compVar.tabIndex = obj.index;
      forceRender();
    }
  }

  //**********************************************************/
  const onPanelLoad = async () => {
    forceRender();
  }

  //**********************************************************/
  const onActionDropDownClick = async(e) => {

    if (e.itemData.onItemClick !== undefined && e.itemData.onItemClick !== null) {
      e.itemData.onItemClick();
    }        

  }

  //**********************************************************/
  const setDateArrivalDeparture = async () => {
    let timing = '';

    if (compVar.formData.DateOfArrival !== null && compVar.formData.ETA_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfArrival,1) + ' ' + compVar.formData.ETA_Time;
      compVar.formData.ETA = timing;  
    } else if (compVar.formData.DateOfArrival !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfArrival,1) + ' 00:00';
      compVar.formData.ETA = timing;  
    }

    if (compVar.formData.DateOfDeparture !== null && compVar.formData.ETD_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfDeparture,1) + ' ' + compVar.formData.ETD_Time;
      compVar.formData.ETD = timing;  
    } else if (compVar.formData.DateOfDeparture !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfDeparture,1) + ' 00:00';
      compVar.formData.ETD = timing;  
    }

  }

  //**********************************************************/
  const deleteQuotation = async () => {

    const masterObj = await getTourMasterStatus(compVar.quotations_id);

    if (masterObj.itineraries_id !== null) {
      compVar.toastMessage = 'Itinerary / Vouchers have been created for this tour. Delete them first from the Voucher Manager.';
      compVar.toastIsVisible = true;
      forceRender();
    } else if (masterObj.masters_id !== null) {
      compVar.toastMessage = 'Master created for this tour. Delete it first.';
      compVar.toastIsVisible = true;
      forceRender();
    } else {

      if (compVar.admLevel < 4) {
        alert('Insufficient Permissions for this action');
        return;
      } else {
        compVar.popupDialogIndex = 0;
        compVar.dialogMessage1 = 'This will delete the entire quotation with all the entered details. Are you absolutely sure?';
        compVar.dialogMessage2 = '';
        setPopupDialogBoxVisible(() => {return true});    
      }
  
    }

  }

  //**********************************************************/
  const createQuotationCopy = async () => {

    compVar.popupDialogIndex = 2;
    compVar.dialogMessage1 = 'This will create a copy of this quotation. Are you absolutely sure?';
    compVar.dialogMessage2 = '';
    setPopupDialogBoxVisible(() => {return true});    

  }

  //**********************************************************/
  const quotationCopyProc = async (e) => {

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);

      const sql = `EXEC p_CopyQuotation ${compVar.focusedRowKey}, 1`;
      const spData = {sql: sql};
      await dbExecuteSp(spData);

      await filterData();

    }

  }

  //**********************************************************/
  const deleteQuotationProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);

      const sql = `EXEC p_QuoDeleteQuotation ${compVar.focusedRowKey}`;
      const spData = {sql: sql};
      await dbExecuteSp(spData);

      await filterData();

    }

  }

  //**********************************************************/
  const createModule = async () => {

    const moduleObj = await getModuleStatus(compVar.focusedRowKey);

    if (!moduleObj.exists && moduleObj.tourCode > '') {

      setDataFetched(false);
      forceRender();

      const sql = `EXEC p_QuoModules_AutoInsertElements ${compVar.focusedRowKey}`;
      const spData = {sql: sql};
      await dbExecuteSp(spData);    

      await filterData();

      compVar.toastMessage = 'Module created';
    } else if (!moduleObj.exists && moduleObj.tourCode === '') {
      compVar.toastMessage = 'Tour Code cannot be blank';
    } else {
      compVar.toastMessage = 'Module already exists';
    }

    compVar.toastIsVisible = true;
    forceRender();

  }

  //**********************************************************/
  const createMaster = async () => {

    const moduleObj = await getTourMasterStatus(compVar.focusedRowKey);

    if (moduleObj.tourNo === null || moduleObj.tourNo === 0) {
      compVar.toastMessage = 'Tour No has to be entered';
    } else if (moduleObj.tourCode === null || moduleObj.tourCode === '') {
      compVar.toastMessage = 'Tour Code cannot be blank';
    } else if (moduleObj.reference === null || moduleObj.reference === '') {
      compVar.toastMessage = 'Reference cannot be blank';
    } else if (moduleObj.exists) {
      compVar.toastMessage = 'Master has already been created';
    } else if (moduleObj.numPax === 0) {
      compVar.toastMessage = "Please enter the Pax first under the 'Pax' tab";
    } else {

      setDataFetched(false);
      forceRender();

      const sql = `EXEC p_QuoConvertToMasters ${compVar.focusedRowKey}`;
      const spData = {sql: sql};
      await dbExecuteSp(spData);    

      await filterData();

      compVar.toastMessage = 'Master created';

    } 

    compVar.toastIsVisible = true;
    forceRender();

  }

  //**********************************************************/
  const deleteMaster = async () => {

    const masterObj = await getTourMasterStatus(compVar.focusedRowKey);

    if (masterObj.itineraries_id !== null) {
      compVar.toastMessage = 'Itinerary / Vouchers have been created for this tour. Delete them first from the Voucher Manager.';
      compVar.toastIsVisible = true;
      forceRender();
    } else {
      compVar.popupDialogIndex = 1;
      compVar.dialogMessage1 = 'This will delete the master. Are you sure?';
      compVar.dialogMessage2 = '';
      setPopupDialogBoxVisible(() => {return true});
    }  

  }

  //**********************************************************/
  const deleteMasterProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);
      forceRender();

      const sql = `EXEC p_QuoDeleteConvertToMasters ${compVar.focusedRowKey}`;
      const spData = {sql: sql};
      await dbExecuteSp(spData);

      await filterData();

      compVar.toastMessage = 'Master deleted';
      compVar.toastIsVisible = true;

      forceRender();

    }

  }

  //**********************************************************/
  const executeAllCostings = async(e) => {

    setDataFetched(false);
    forceRender();

    const fromDate = convertDMY_MDY(compVar.fromDate);

    let sql = "EXEC [p_GenerateRiksjaCostings] '" + fromDate + "'";
    let spData = {sql: sql};
    await dbExecuteSp(spData);    

    setDataFetched(true);
    forceRender();

  }

  //**********************************************************/
  const copyAllQuotations = async() => {

    setDataFetched(false);
    forceRender();

    const fromDate = convertDMY_MDY(compVar.fromDate);

    let sql = "EXEC [p_QuotationCopy_AddYear_All] '" + fromDate + "'";
    let spData = {sql: sql};
    await dbExecuteSp(spData);    

    setDataFetched(true);
    forceRender();

  }

  //**********************************************************/
  const moveLiveTrial =  async(e) => {

    const dataIdx = compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.focusedRowKey);
    if (dataIdx !== -1) {

      const trial = (compVar.mainData[dataIdx].Trial === 0) ? 1 : 0;

      /*=== Get the next quotation number for live / trial ===*/
      const quotationObj = await getNextQuotationNo (compVar.mainData[dataIdx].QuotationYearRef, trial);
      const nextQuotationNo = quotationObj.nextQuoteNo;

      setDataFetched(false);
      forceRender();
      
      let sql = 'UPDATE Quotations SET Trial =  ' + trial.toString() + ", " +
        "QuotationNo = " + nextQuotationNo.toString() + " " +
        "WHERE Quotations_id = " + compVar.quotations_id.toString();
      let spData = {sql: sql};
      await dbExecuteSp(spData);    

      // Change the module too!
      sql = 'EXEC p_ModuleModeFromQuotations  ' + compVar.quotations_id.toString();
      spData = {sql: sql};
      await dbExecuteSp(spData);    

      // Save to the REDUX store only in Live/Trial
      if (props.dataType === 1) {
        setPrestoParamValues({
          trial: trial
        });  
      }

      // this will also render
      await filterData();

    }

  }

  //**********************************************************/
  const closeForm = () => {
    compVar.formOpen = false;
    compVar.viewType = 1;
    forceRender();
  }

  //**********************************************************/
  const onReportClick = async (e) => {

    if (e.itemData.type === 1) {
      await createPdfReport(e.itemData);
    } else if (e.itemData.type === 2) {
      await createDocxReport(e.itemData);
    }

  }

  //**********************************************************/
  const createPdfReport = async(reportObj) => {

    compVar.reportInProgress = true;
    forceRender();

    const idx = compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.focusedRowKey);

    const reportName = reportObj.reportName + '_' + compVar.mainData[idx].TourCode + '.pdf';
    const img = (reportObj.img === undefined) ? false : reportObj.img;

    const quoPrint_id = await getQuoPrint(compVar.focusedRowKey);

    const data = {reportType: reportObj.type, fileName: reportName, reportEndPoint: reportObj.reportEndPoint, reportSubType: reportObj.subType, 
      quotations_id: compVar.focusedRowKey, quoPrint_id: quoPrint_id,
      img: img};

    const getReportStatus = await dbPrestoReports({data: data});
    const errorMsg = getReportStatus.error + '. Please check your network / XAMPP Server';
    
    if (getReportStatus.error !== undefined && getReportStatus.error !== null) {
      compVar.errorMsg = errorMsg;
    }

    compVar.reportInProgress = false;
    forceRender();  

  }

  //**********************************************************/
  const createDocxReport = async(reportObj) => {

    compVar.reportInProgress = true;
    forceRender();

    const idx = compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.focusedRowKey);

    const reportName = reportObj.reportName + '_' + compVar.mainData[idx].TourCode + '.docx';

    const quoPrint_id = await getQuoPrint(compVar.focusedRowKey);

    const data = {reportType: reportObj.type, fileName: reportName, reportEndPoint: reportObj.reportEndPoint, 
      quotations_id: compVar.focusedRowKey, quoPrint_id: quoPrint_id};

    const getReportStatus = await dbPrestoDocxReports({data: data});
    const errorMsg = getReportStatus.error;

    if (getReportStatus.error !== undefined && getReportStatus.error !== null) {
      compVar.errorMsg = errorMsg;
    }

    compVar.reportInProgress = false;
    forceRender();  

  }

  //**********************************************************/
  const oldDtd = () => {
    compVar.viewType = 20;
    forceRender();
  }

  //**********************************************************/
  const changeView = (e) => {
    compVar.viewType = e;
    forceRender();
  }

  //**********************************************************/
  const doesTourExist = async () => {

    let isExists = false;

    // if tour code not entered, do not check
    if (compVar.formData.TourCode === null || compVar.formData.TourCode.trim() === '')  {
       return false;
    }

    const idStr = (compVar.formMode === 1) ? "" : "AND Quotations_id <> " + compVar.formData.Quotations_id.toString();
   
    const query = "SELECT Quotations_id FROM Quotations " + 
      "WHERE TourCode = '" + compVar.formData.TourCode + "' " +
      //"AND TourDate = '" + tourDate + "' " +
      idStr;

    const existsQry = await dbGetRecordRaw({query: query });
    if (existsQry.length > 0) {
      isExists = true;
    }

    return isExists;
    
  }

  //**********************************************************/
  const onChangeModeReorder = (e) => {
    compVar.itineraryBuilder = e.mode;
    forceRender();
  }

  //**********************************************************/
  const onMoveDates = async () => {

    // this is called when you move dates. Since data changes, call filterData
    // Then move to the right record and edit it

    compVar.formOpen = false;
    await filterData();

    const idx = compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.focusedRowKey);
    if (idx !== -1) {
      // Default view type of city list after similating edit
      compVar.viewType = 2;
      // Simulate edit of the record
      const e = {row: {data: compVar.mainData[idx]}};
      await editRow(e);
    }

  }
  
  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const dataIdx = compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.focusedRowKey);

    const moveButtonHint = (dataIdx !== -1 && compVar.mainData[dataIdx].Trial === 0) ? 'Move to Trial' : 'Move to Live';
    const moveButtonVisible = (dataIdx !== -1 && compVar.mainData[dataIdx].Masters_id !== null) ? false : true;

    const copyButtonHint = (dataIdx !== -1 && (compVar.mainData[dataIdx].Trial === 1 || compVar.mainData[dataIdx].Trial === 3) ) ? 'Make a copy of this quotation' : '';
    const copyButtonVisible = (dataIdx !== -1 && (compVar.mainData[dataIdx].Trial === 1 || compVar.mainData[dataIdx].Trial === 3));

    const copyAllButtonHint = (dataIdx !== -1 && compVar.mainData[dataIdx].Trial === 3) ? 'Copy All Riksja Quotations to Next Year' : '';
    const copyAllButtonVisible = (dataIdx !== -1 && compVar.mainData[dataIdx].Trial === 3);

    const costingAllButtonHint = (dataIdx !== -1 && compVar.mainData[dataIdx].Trial === 3) ? 'Execute Costings for all below tours' : '';
    const costingAllButtonVisible = (dataIdx !== -1 && compVar.mainData[dataIdx].Trial === 3);

    const widths = [35,35,35,35];
    const heights = [35,35,35,35];
    const icons = ['icons/move.png', 'icons/copy.png', 'icons/copyAll.png', 'icons/costing.png'];
    const onClicks = [moveLiveTrial, null, copyAllQuotations, executeAllCostings];
    const hints = [moveButtonHint, copyButtonHint, copyAllButtonHint, costingAllButtonHint];
    const texts = [null, null, null, null];
    const buttonsVisible = [moveButtonVisible, copyButtonVisible, copyAllButtonVisible, costingAllButtonVisible];

    const width = widths[index];
    const height = heights[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    const hint = hints[index];
    const text = texts[index];
    const buttonVisible = buttonsVisible[index];

    return (
      <Button
        width={width}
        height={height}
        type="normal"
        stylingMode="outlined"
        icon={icon}
        hint={hint}
        text={text}
        onClick={onClick}
        visible={buttonVisible}
      />

    )

  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    let actionList = (props.dataType === 1) ? compVar.actionList : compVar.actionList.filter(e => e.itemType === 2);

    if (compVar.admLevel < 4) {
      actionList = actionList.filter(obj => obj.display === 1);
    }

    const texts = ['Actions for Selected'];
    const icons = ['bulletlist'];
    const widths = [200];
    const dropDownOptions = [{width: 230}];
    const items = [actionList];
    const onItemClicks = [onActionDropDownClick];

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

    const changeInHeight = compVar.searchPanelOpen ? 40 : 0;

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight-changeInHeight, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      canModify: compVar.canModify,
      canDeleteRow: compVar.canDelete,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onRowPrepared: onRowPrepared,
      onTabOptionChanged: onTabOptionChanged,
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    if (compVar.formData === undefined) {
      return defaultFormObject;
    }

    // *** CASE SENSITIVE override formData properties
    const clearFromIntCityLookupValues = {cities_id: null, city: ''};
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToIntCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearConsultantLookupValues = {Consultants_id: null, Consultant: ''};
    const clearCountryLookupValues = {countries_id: null, country: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    const clearHotelTypeLookupValues = {HotelTypes_id: null, HotelType: ''};
    const clearMealPlanLookupValues = {mealplans_id: null, mp: ''};
    const clearCreatedByUserLookupValues = {AdmUsers_id: null, uid: ''};
    const clearManagerLookupValues = {AdmUsers_id: null, uid: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialFromIntCityLookupValues = getLookupValues (
      clearFromIntCityLookupValues, compVar.fromIntCityLookup, 
      ['city','city'], compVar.formData.PlaceFrom);

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.fromCityLookup, 
      ['cities_id','city'], compVar.formData.StartCities_id);

    const initialToIntCityLookupValues = getLookupValues (
      clearToIntCityLookupValues, compVar.toIntCityLookup, 
      ['city','city'], compVar.formData.PlaceTo);
  
    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.toCityLookup, 
      ['cities_id','city'], compVar.formData.EndCities_id);      
        
    const initialAgentLookupValues = getLookupValues (
      clearAgentLookupValues, compVar.agentLookup, 
      ['Addressbook_id','OrgCity','Cities_id'], compVar.formData.PrincipalAgents_id);

    const initialConsultantLookupValues = getLookupValues (
      clearConsultantLookupValues, compVar.consultantLookup, 
      ['Consultants_id','Consultant'], compVar.formData.Consultants_id);
        
    const initialCountryLookupValues = getLookupValues (
      clearCountryLookupValues, compVar.countryLookup, 
      ['countries_id','country'], compVar.formData.Countries_id);
  
    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, compVar.currencyLookup, 
      ['currencies_id','currencycode'], compVar.formData.Currencies_id);
    
    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, compVar.vehicleLookup, 
      ['vehicles_id','vehicle'], compVar.formData.Vehicles_id);
      
    const initialHotelTypeLookupValues = getLookupValues (
      clearHotelTypeLookupValues, compVar.hotelTypeLookup, 
      ['HotelTypes_id','HotelType'], compVar.formData.HotelTypes_id);

    const initialMealPlanLookupValues = getLookupValues (
      clearMealPlanLookupValues, compVar.mealPlanLookup, 
      ['mealplans_id','mp'], compVar.formData.MealPlans_id);      
        
    const initialCreatedByUserLookupValues = getLookupValues(
      clearCreatedByUserLookupValues, compVar.createdByLookup, 
      ['AdmUsers_id','uid'], compVar.formData.AdmUsers_id);

    const initialManagerLookupValues = getLookupValues(
      clearManagerLookupValues, compVar.managerLookup, 
      ['AdmUsers_id','uid'], compVar.formData.Managers_id);
        
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues, compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

    return {...defaultFormObject,
      visible: false,
      tabIndex: compVar.tabIndex,
      formFieldDataChanged: formFieldDataChanged,
      saveFormData: saveFormData,
      onToastHiding: onToastHiding,      
      formHelp: formHelp,
      clearLookup: [clearFromIntCityLookup, clearFromCityLookup, clearToIntCityLookup, clearToCityLookup, clearAgentLookup, clearConsultantLookup, clearCountryLookup, clearCurrencyLookup, clearVehicleLookup, clearHotelTypeLookup, clearMealPlanLookup, clearCreatedByUserLookup, clearManagerLookup, clearUserLookup],
      getSelectedRecord: [getSelectedFromIntCity, getSelectedFromCity, getSelectedToIntCity, getSelectedToCity, getSelectedAgent, getSelectedConsultant, getSelectedCountry, getSelectedCurrency, getSelectedVehicle, getSelectedHotelType, getSelectedMealPlan, getSelectedCreatedByUser, getSelectedManager, getSelectedUser],
      initialLookupValues: [initialFromIntCityLookupValues, initialFromCityLookupValues, initialToIntCityLookupValues, initialToCityLookupValues,  initialAgentLookupValues, initialConsultantLookupValues, initialCountryLookupValues, initialCurrencyLookupValues, initialVehicleLookupValues, initialHotelTypeLookupValues, initialMealPlanLookupValues, initialCreatedByUserLookupValues, initialManagerLookupValues, initialUserLookupValues],
      clearLookupValues: [clearFromIntCityLookupValues, clearFromCityLookupValues, clearToIntCityLookupValues, clearToCityLookupValues, clearAgentLookupValues, clearConsultantLookupValues, clearCountryLookupValues, clearCurrencyLookupValues, clearVehicleLookupValues, clearHotelTypeLookupValues, clearMealPlanLookupValues, clearCreatedByUserLookupValues, clearManagerLookupValues, clearUserLookupValues],
      labelLocation: "top",
      formMode: compVar.formMode,
      viewType: compVar.viewType,
      closeForm: closeForm,
      changeView: changeView,
      oldDtd: oldDtd,
      reportsData: compVar.reportsData,
      onReportClick: onReportClick,
      reportInProgress: compVar.reportInProgress,
      buttonList: compVar.buttonList,
      onChangeModeReorder: onChangeModeReorder,
      itineraryBuilder: compVar.itineraryBuilder,
      onMoveDates: onMoveDates
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

    const prestoParamsObj = {
      tourCode: null, tourDate: null, pax: null
    }
    
    const idx = (compVar.mainData.findIndex(rec => rec.Quotations_id === compVar.focusedRowKey));
    if (idx > -1) {      
      prestoParamsObj.tourCode = compVar.mainData[idx].TourCode;
      prestoParamsObj.tourDate = convert_DbDate_To_DMY(compVar.mainData[idx].StartDate,1);
      prestoParamsObj.pax = compVar.mainData[idx].PaxName;
    }

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          {!compVar.formOpen && 
            <PrestoListParams
              height={40}
              getSelectedParams={getSelectedParams}          
              onPanelLoad={onPanelLoad}
              trial={compVar.trial}
              dataType={props.dataType}
              fromDate={compVar.fromDate}
              toDate={compVar.toDate}
            />
          }

          {!compVar.formOpen && (!initDataFetched || !dataFetched) &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {!compVar.formOpen && initDataFetched && dataFetched &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

              <div className="master-grid-params-container">
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <LinkForms hideElem={[1]}/>
                  {buttonParamsJsx(0)}
                  {buttonParamsJsx(1)}
                  {buttonParamsJsx(2)}
                  {buttonParamsJsx(3)}
                </div>
              </div>        

              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>

              <div className="master-grid-params-container">
                {dropDownButtonJsx(0)}
              </div>

            </div>          
      
          }

          {!compVar.formOpen && initDataFetched && dataFetched &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj)}
              {toast(formObj, toastContainerStyle, {})}
            </div>
          }

          {/*editPopupVisible*/ compVar.formOpen && getDevExtremePopupForm(formObj,dataObj,prestoParamsObj)}

          {!compVar.formOpen && initDataFetched && dataFetched && popupDialogBoxVisible && 
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

export default PrestoList;
