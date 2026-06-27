import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, setDateTimeFormat, convertToMoment_fmt, convert_DbDate_To_DMY, beforeInsert, isValidTime, convert_DbDate_To_DMY_day, dateDiff_DMY, stripTime } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetPrestoAccommodationData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import { getAgentSubCatListing } from "../../../../common/GetOrgListing";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights, afterAdd} from "../../../../common/MasterGridHelpers";
import { canDelete } from "../../../../common/CommonFunctions";
import {getAdmLevelLocation, getRoomTypesForHotel} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';

import '../../../../common/MasterGrid.css'

let compVar = {};

function PrestoAccommodation(props) {

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

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      dummyNum: 0,
      userLookup: [],  mainData: [],
      cityLookup: [], hotelLookup: [],
      roomTypeLookup: [], roomTypeAllLookup: [], mealPlanLookup: [],  
      tableName: 'QuoAccommodation', keyField: 'QuoAccommodation_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Accommodation', title: 'New Accommodation',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '', isDeleted: false, isAdded: false,
      formHeight: 570,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      activeHotelSwitchValue: true,
      updateMode: 0, doesPaxChange: false, firstPass: true,
      admLevel: 1,
      dbLookup: [       

        {keyField: 'Addressbook_id', dataSource: compVar.hotelLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity', 'Category']},

        {keyField: 'roomtypes_id', dataSource: compVar.roomTypeLookup, 
        displayExpr: 'roomtype', valueExpr: 'roomtypes_id', fieldList: ['roomtype']},

        {keyField: 'mealplans_id', dataSource: compVar.mealPlanLookup, 
        displayExpr: 'mp', valueExpr: 'mealplans_id', fieldList: ['mp']},
    
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

      compVar.hotelLookup = await getAgentSubCatListing('4',false);   
      compVar.hotelLookup = compVar.hotelLookup.filter(rec => rec.Cities_id === props.cities_id);
      // Add classification category (standard/top of the line/...)
      await addServiceType();
      compVar.dbLookup[0].dataSource = compVar.hotelLookup;  
        
      compVar.roomTypeLookup = await dbGetRecord({fields: ['roomtypes_id', 'roomtype','ac'], orders: ['roomtype'], table: 'roomtypes'});   
      compVar.dbLookup[1].dataSource = compVar.roomTypeLookup;  

      compVar.mealPlanLookup = await dbGetRecord({fields: ['mealplans_id', '[plan] AS mp'], orders: ['[plan]'], table: 'mealplans'});   
      compVar.dbLookup[2].dataSource = compVar.mealPlanLookup;  

      let whereStr = "Quotations_id = " + props.quotations_id.toString();
      compVar.paxChange = await dbGetRecord({fields: ["QuoPax_id"], orders: ['QuoPax_id'], table: "QuoPax", where: whereStr});   
      compVar.doesPaxChange = (compVar.paxChange.length > 0) ? true : false;
  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map(e => 'qa.' + e);
    fieldArray.push("CONVERT(varchar(5),DateIn,108) AS DateIn_Time");
    fieldArray.push("CONVERT(varchar(5),DateOut,108) AS DateOut_Time");

    try {

      const whereStr = "qa.QuoCities_id = " + props.quoCities_id.toString();
  
      const tableStr = "QuoAccommodation qa";
  
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['qa.DateIn'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Presto Accommodation'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

console.log('AA');      
      await setMinMaxDates();
console.log('BB');      
  
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

    // Directly move to Edit, Mimic as if clicked on grid... so you write e.row.data
    //await editRow({row: {data: compVar.mainData[0]}});

    // If this is executed using menu 'Add Accmmodation' & is the first pass
    // So if filterData is called by any other event in this form, the form will not open up in the ADD mode
    if (props.accommodationFormType === 2 && compVar.firstPass) {
      await addRow();
      compVar.firstPass = false;
    }
  }

  //**********************************************************/
  const editRow = async (e) => {
  
    afterEdit(compVar, e);
    compVar.formTitle = props.city + ' from ' + convert_DbDate_To_DMY(compVar.minDate,1) + ' to ' + convert_DbDate_To_DMY(compVar.maxDate,1);

    // check if vouchers created
    await checkVouchersCreated();

    // somehow gives problems firing the async in editRow ... without the forceRender following
    await getRoomTypes();
    forceRender();
    
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
      DateIn: compVar.minDate,
      DateOut: compVar.maxDate,
      Cities_id: props.cities_id,
      Quotations_id: props.quotations_id,
      QuoCities_id: props.quoCities_id
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

    setDateInDateOut();

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

    // Always save
    let condition = "WHERE Quotations_id = " + compVar.formData.Quotations_id.toString() + " "  +
      "AND QuoCities_id = " + compVar.formData.QuoCities_id.toString() + " "  +
      "AND HotelAddressbook_id = " + compVar.formData.HotelAddressbook_id.toString() + " "  +
      "AND RoomTypes_id = " + compVar.formData.RoomTypes_id.toString() + " "  +
      "AND MealPlans_id = " + compVar.formData.MealPlans_id.toString() + " "  +
      "AND dbo.[fn_GetDateWithoutTime](DateIn) = '" + convert_DbDate_To_MDY(compVar.formData.DateIn,1) + "' " + 
      "AND dbo.[fn_GetDateWithoutTime](DateOut) = '" + convert_DbDate_To_MDY(compVar.formData.DateOut,1) + "' ";
    condition += (compVar.formMode === 2) ? "AND QuoAccommodation_id <> " + compVar.formData.QuoAccommodation_id.toString() : "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        //ModifiedByUsers_id: _g_users_id,
        //ModifiedOn: convert_DbDate_To_MDY()
      },
      afterPost: afterPost
    }
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    /*=== Update Confirmation number ... all the way upto Vouchers ===*/
    await updateValuesInVoucher();    

    /*=== Update Emailing String for Accommodation ===*/
    await updateEmailString();    

    /*=== Update ReserveOvernightHotel in QuoTickets ===*/
    await updateTicketsOvernight();

    // reset focused row
    compVar.focusedRowKey = saveData.formData[compVar.keyField];

    // refresh data after save
    //await filterData();

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

    // form validation errors
    if ((formData.DateIn_Time !== null) && !isValidTime(formData.DateIn_Time)) {
      return "Invalid 'Date In' time entered";
    }

    if ((formData.DateOut_Time !== null) && !isValidTime(formData.DateOut_Time)) {
      return "Invalid 'Date Out' time entered";
    }

    let nights = -1;
    if ((formData.DateIn !== null) && (formData.DateOut !== null)) {
      const fromDate = convertToMoment_fmt(stripTime(formData.DateIn),'');    
      const toDate = convertToMoment_fmt(stripTime(formData.DateOut),'');
      if (fromDate > toDate) {
        return "'From Date' cannot exceed 'To Date'";
      }
      nights = dateDiff_DMY(toDate,fromDate,'days');
    }
    if (nights < -1) {
      return "Invalid number of nights. Check 'Date In' and 'Date Out'";
    }
    compVar.formData.Nights = nights;

    if (compVar.minDate !== undefined) {
      const minDate = convertToMoment_fmt(compVar.minDate,'');    
      const dateIn = convertToMoment_fmt(formData.DateIn,'');
      if (!formData.ReserveHotelOvernight && (dateIn < minDate)) {
        return "Date In cannot be less than " + convert_DbDate_To_DMY(compVar.minDate,1);
      }  
    }

    if (compVar.maxDate !== undefined) {
      const maxDate = convertToMoment_fmt(compVar.maxDate,'');    
      const dateOut = convertToMoment_fmt(formData.DateOut,'');
      if (!formData.LateCheckOut && (dateOut > maxDate)) {
        return "Date Out cannot be greater than " + convert_DbDate_To_DMY(compVar.maxDate,1);
      }
    }
    
    return '';

  }

  //**********************************************************/
  const afterPost = async() => {

    // mark as edited
    compVar.isEdited = true;

    if ((compVar.formMode === 1) || (compVar.formMode === 2)) {
      await closePopup();
    }
       
    // refresh data
    //await filterData();

  }

  //**********************************************************/
  const getSelectedHotel = async (e) => {
    compVar.formData.HotelAddressbook_id = e[0].Addressbook_id;

    compVar.roomTypeLookup = await getRoomTypesForHotel(compVar.formData.HotelAddressbook_id, props.activityDate);
    compVar.dbLookup[1].dataSource = compVar.roomTypeLookup;  

    forceRender();
  }

  //**********************************************************/
  const getSelectedRoomType = async(e) => {
    compVar.formData.RoomTypes_id = e[0].roomtypes_id;
  }

  //**********************************************************/
  const getSelectedMealPlan = async(e) => {
    compVar.formData.MealPlans_id = e[0].mealplans_id;
  }

  //**********************************************************/
  const clearHotelLookup = (e) => {
    compVar.formData.HotelAddressbook_id = null;
  }

  //**********************************************************/
  const clearRoomTypeLookup = async(e) => {
    compVar.formData.RoomTypes_id = null;
  }

  //**********************************************************/
  const clearMealPlanLookup = async(e) => {
    compVar.formData.MealPlans_id = null;
  }

  //**********************************************************/
  const getRoomTypes = async (e) => {
  
   // await setRoomTypes();
    compVar.roomTypeLookup = await getRoomTypesForHotel(compVar.formData.HotelAddressbook_id, convert_DbDate_To_DMY_day(compVar.formData.DateIn,1));
    compVar.dbLookup[1].dataSource = compVar.roomTypeLookup;  
    
  }

  //**********************************************************/
  const checkVouchersCreated = async () => {

    // don't check for inserts
    if (compVar.formMode === 1)
      return;

    const query = 'SELECT * FROM VouchersAccommodation ' + 
      'WHERE QuoAccommodation_id = ' + compVar.formData.QuoAccommodation_id.toString();
    const vouArray = await dbGetRecordRaw({query: query});   
    if (vouArray.length > 0) {
      alert('Voucher has been created. Any changes to this form will overwrite the voucher description. ' + 
        'Please add any extra comments to the "Added Voucher Desc."');
    }
    
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    //setEditPopupVisible(() => {return !editPopupVisible});
    setEditPopupVisible(!editPopupVisible);
    forceRender();
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    if (editPopupVisible) {
      toggleEditPopup();
    }
    compVar.errorMsg = '';

    if (compVar.isEdited) {
      await filterData();
      let isAdded = (compVar.formMode === 1 || compVar.isDeleted);
      if (props.onAddAccommodation !== undefined) {
        await props.onAddAccommodation({save: true, addNew: isAdded});
      }  
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
  const activeHotelSwitchValueChanged = (e) => {
    compVar.activeHotelSwitchValue = e;
    forceRender();
  }

  //**********************************************************/
  const addServiceType = async () => {

    // Add new property for category (standard/top of the line/...)
    compVar.hotelLookup = compVar.hotelLookup.map(rec => ({ ...rec, Category: '' }));

    for (const rec of compVar.hotelLookup) {

      const query = "select a.organisation, as1.AddressbookService, acs.Ranking " +
        "from AddressbookCategoryServices acs " +
        "left join addressbook a on acs.Addressbook_id = a.addressbook_id " +
        "left join AddressbookServices as1 on acs.AddressbookServices_id = as1.AddressbookServices_id " +
        "where acs.AddressbookServices_id in (7,8,9,10) " +
        "and acs.Addressbook_id = " + rec.Addressbook_id.toString();

      const categoryArr = await dbGetRecordRaw({query: query });
      if (categoryArr.length > 0) {
        rec.Category = categoryArr[0].AddressbookService;
      }
  
    }
      
  }

  //**********************************************************/
  const setMinMaxDates = async () => {

    const query = "SELECT DateIn, DateOut FROM QuoCities " + 
      "WHERE QuoCities_id = " + props.quoCities_id.toString();

    const dateRange = await dbGetRecordRaw({query: query});

    if (dateRange.length > 0 && dateRange[0].DateIn !== null) {
      compVar.minDate = dateRange[0].DateIn;
      compVar.minDate = compVar.minDate.replace('T', ' ').replace('Z', '');
    }

    if (dateRange.length > 0 && dateRange[0].DateOut !== null) {
      compVar.maxDate = dateRange[0].DateOut;
      compVar.maxDate = compVar.maxDate.replace('T', ' ').replace('Z', '');
    }
        
  }

  //**********************************************************/
  const setDateInDateOut = async () => {

    let timing = '';

    if (compVar.formData.DateIn !== null && compVar.formData.DateIn_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateIn,1) + ' ' + compVar.formData.DateIn_Time;
      compVar.formData.DateIn = timing;  
    } else if (compVar.formData.DateIn_Time === null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateIn,1) + ' 00:00';
      compVar.formData.DateIn = timing;  
    }

    if (compVar.formData.DateOut !== null && compVar.formData.DateOut_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOut,1) + ' ' + compVar.formData.DateOut_Time;
      compVar.formData.DateOut = timing;  
    } else if (compVar.formData.DateOut_Time === null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOut,1) + ' 00:00';
      compVar.formData.DateOut = timing;  
    }

  }

  //**********************************************************/
  const updateValuesInVoucher = async () => {
    if (compVar.formMode === 2) {
      let sql = "EXEC p_UpdateAccommodationInVouchers " + 
        compVar.formData.QuoAccommodation_id.toString() + " ";
      let spData = {sql: sql};
      await dbExecuteSp(spData);
    }
  }

  //**********************************************************/
  const updateEmailString = async() => {
    if (compVar.formMode === 2) {  
      let sql = "EXEC p_Quo_UpdateSingleEmailString " + 
        props.quotations_id.toString() + ", " +
        compVar.formData.QuoAccommodation_id.toString() + ", 2";
      let spData = {sql: sql};
      await dbExecuteSp(spData);
    }

  }

  //**********************************************************/
  const updateTicketsOvernight = async() => {
    if (compVar.formMode === 2) {  
      let sql = "EXEC p_Quo_UpdateTicketsOvernight " + 
        props.quotations_id.toString() + ", " +
        compVar.formData.QuoAccommodation_id.toString();
      let spData = {sql: sql};
      await dbExecuteSp(spData);
    }

  }

  //**********************************************************/
  const changeLayout = () => {

    // Display these fields only if Pax change during the tour
    const fieldsVisibleArray = ['Singles', 'Doubles', 'Triples', 'Twins'];

    const display = compVar.doesPaxChange;    
    
    fieldsVisibleArray.forEach (elem => {      
      const index = tableHeaderArray.findIndex(rec => rec.field === elem);
      tableHeaderArray[index].visible = display;
    });
    
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

    // Display certain fields like Singles, Doubles, ... only if Pax change during the tour
    changeLayout();

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    const hotelLookup = (compVar.activeHotelSwitchValue) ? compVar.hotelLookup.filter(rec => rec.Active) : compVar.hotelLookup;
    compVar.dbLookup[0].dataSource = hotelLookup;        

    // *** CASE SENSITIVE override formData properties
    const clearHotelLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearRoomTypeLookupValues = {roomtypes_id: null, roomtype: ''};
    const clearMealPlanLookupValues = {mealplans_id: null, mp: ''};

    const initialHotelLookupValues = getLookupValues(
      clearHotelLookupValues,hotelLookup, 
      ['Addressbook_id','OrgCity'], compVar.formData.HotelAddressbook_id);
  
    const initialRoomTypeLookupValues = getLookupValues (
      clearRoomTypeLookupValues, compVar.roomTypeLookup, 
      ['roomtypes_id','roomtype'], compVar.formData.RoomTypes_id);
    
    const initialMealPlanLookupValues = getLookupValues (
      clearMealPlanLookupValues, compVar.mealPlanLookup, 
      ['mealplans_id','mp'], compVar.formData.MealPlans_id);
  
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
      clearLookup: [clearHotelLookup, clearRoomTypeLookup , clearMealPlanLookup],
      getSelectedRecord: [getSelectedHotel, getSelectedRoomType, getSelectedMealPlan],
      initialLookupValues: [initialHotelLookupValues, initialRoomTypeLookupValues, initialMealPlanLookupValues],
      clearLookupValues: [clearHotelLookupValues, clearRoomTypeLookupValues, clearMealPlanLookupValues],
      activeHotelSwitchValue: compVar.activeHotelSwitchValue,
      activeHotelSwitchValueChanged: activeHotelSwitchValueChanged,
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc', background: '#f3e5d8'},
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

      //filter data is called in closePopup
      //await filterData();

      // mark as edited / deleted
      compVar.isEdited = true;
      compVar.isDeleted = true;
      await closePopup();
      compVar.isDeleted = false;
    }
  }
    

  //**********************************************************/
  const renderContent = () => {
  
    const heights = getViewContainerHeights(compVar);
    //const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: 40}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();
    const elementProps = createElementProps();
    
    return (
      <>
        <div className="master-grid-container" style={{/*height: containerHeight*/}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
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

export default PrestoAccommodation;
