import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp, setRouteFinderParamValues } from '../../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, setDateTimeFormat, convertToMoment_fmt, convert_DbDate_To_DMY, beforeInsert, isValidTime, dateDayDiffIgnoreTime, deepClone, addMinutesToDateTime, dateFormat } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetPrestoTravelData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {isSectorDrivable, getDriveDetails, getQuoTicketDriveDetails} from "../../../../common/PrestoHelpers";
import {getDefaultFlightAgents_id, getDefaultTrainAgents_id, getAgentServicesListing, getAgentSubCatListing, getCurrentAgent} from "../../../../common/GetOrgListing";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights, afterAdd} from "../../../../common/MasterGridHelpers";
import { canDelete } from "../../../../common/CommonFunctions";
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';
import RouteFinder from '../../../routeFinder/routeFinderPage/RouteFinder';
import PrestoTrainsList from '../../prestoTrainsListPage/PrestoTrainsList';
import PrestoDriveViaList from './PrestoDriveViaList';
import PrestoTravelCityList from './PrestoTravelCityList';

import '../../../../common/MasterGrid.css'

const HEADER_BACKGROUND_COLOR = '#f3e5d8';

let compVar = {};

function PrestoTravel(props) {

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

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {

    // Object for component variables
    compVar = {
      dummyNum: 0,
      userLookup: [],  mainData: [],
      fromCityLookup: [], toCityLookup: [], ticketLookup: [],
      classLookup: [], driveTypeLookup: [], fromStationLookup: [],
      toStationLookup: [], vehicleLookup: [], agentVehicleLookup: [],
      agentLookup: [], ticketAgentLookup: [], carHireGroupLookup: [],
      carAgentLookup: [],
      tableName: 'QuoTickets', keyField: 'QuoTickets_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Travel', title: 'New Travel',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '', isDeleted: false, isAdded: false,
      formHeight: 640,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      activeSightseeingSwitchValue: true, vouchersCreated: true,
      activeVehiclesSwitchValue: true,
      travelFilter: true, firstPass: true, displaySightseeingList: false,
      preferences: {},
      fromCities_id: -1, toCities_id: -1, displayRouteFinder: false,
      displayTrainList: false, 
      displayDriveViaList: false, displayCarReportRelease: false,
      isSectorDrivable: false, kms: 0, durationMin: 0, remarks: '',
      targetTravelFieldsChanged: false,
      admLevel: 1,
      dbLookup: [       

        {keyField: 'cities_id', dataSource: compVar.fromCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'cities_id', dataSource: compVar.toCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'tickets_id', dataSource: compVar.ticketLookup, 
        displayExpr: 'details', valueExpr: 'tickets_id', fieldList: ['details']},

        {keyField: 'class_id', dataSource: compVar.classLookup, 
        displayExpr: 'classCode', valueExpr: 'class_id', fieldList: ['classCode']},

        {keyField: 'DriveTypes_id', dataSource: compVar.driveTypeLookup, 
        displayExpr: 'DriveType', valueExpr: 'DriveTypes_id', fieldList: ['DriveType']},

        {keyField: 'trainstations_id', dataSource: compVar.fromStationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},

        {keyField: 'trainstations_id', dataSource: compVar.toStationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},

        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

        {keyField: 'CarHireGroups_id', dataSource: compVar.carHireGroupLookup, 
        displayExpr: 'CarHireGroup', valueExpr: 'CarHireGroups_id', fieldList: ['CarHireGroup']},
    
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

      compVar.fromCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.fromCityLookup;  

      compVar.toCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[1].dataSource = compVar.toCityLookup;  
  
      let whereStr = 'tickets_id > 0';
      compVar.ticketLookup = await dbGetRecord({fields: ["tickets_id, details"], orders: ['tickets_id'], table: 'tickets', where: whereStr });   
      compVar.dbLookup[2].dataSource = compVar.ticketLookup;  

      compVar.classLookup = await dbGetRecord({fields: ["class_id", "[class] + ' ' + COALESCE(code,'') AS classCode", "tickets_id"], orders: ['[class]'], table: 'class'});   
      compVar.dbLookup[3].dataSource = compVar.classLookup;  

      compVar.driveTypeLookup = await dbGetRecord({fields: ["DriveTypes_id, DriveType"], orders: ['DriveTypes_id'], table: 'DriveTypes'});
      compVar.dbLookup[4].dataSource = compVar.driveTypeLookup;  
  
      compVar.fromStationLookup = await dbGetRecord({fields: ["trainstations_id", "station", "cities_id"], orders: ['COALESCE(DefaultOrder,100)'], table: 'trainstations'});   
      compVar.dbLookup[5].dataSource = compVar.fromStationLookup;  

      compVar.toStationLookup = await dbGetRecord({fields: ["trainstations_id", "station", "cities_id"], orders: ['COALESCE(DefaultOrder,100)'], table: 'trainstations'});   
      compVar.dbLookup[6].dataSource = compVar.toStationLookup;  

      compVar.agentLookup = await getAgentServicesListing('1,2,3', false);
      compVar.dbLookup[7].dataSource = compVar.agentLookup;  

      compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles'});    
      compVar.dbLookup[8].dataSource = compVar.vehicleLookup;  

      whereStr = 'DefaultAgents_id = 2170';
      compVar.carHireGroupLookup = await dbGetRecord({fields: ['CarHireGroups_id', 'CarHireGroup'], orders: ['CarHireGroup'], table: 'CarHireGroups', where: whereStr});    
      compVar.dbLookup[9].dataSource = compVar.carHireGroupLookup;  

      compVar.carAgentLookup = deepClone(compVar.agentLookup);
      compVar.ticketAgentLookup = await getAgentSubCatListing('12', false);
  
      // check of vouchers already created
      await checkVouchersCreated();
      
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map(e => 'qt.' + e);
    fieldArray.push("CONVERT(varchar(5),ETA,108) AS ETA_Time");
    fieldArray.push("CONVERT(varchar(5),ETD,108) AS ETD_Time");
    fieldArray.push("CONVERT(varchar(5),ETA,101) + ' ' + CONVERT(varchar(5),ETA,108) AS ETA2");
    fieldArray.push("CONVERT(varchar(5),ETD,101) + ' ' + CONVERT(varchar(5),ETD,108) AS ETD2");
    fieldArray.push("CONVERT(varchar(5),CarReportDate,108) AS CarReport_Time");
    fieldArray.push("CONVERT(varchar(5),CarReleaseDate,108) AS CarRelease_Time");

    try {

      const whereStr = "qt.QuoCities_id = " + props.quoCities_id.toString();
  
      const tableStr = "QuoTickets qt";
  
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['qt.ETD'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Presto Travel'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      await setMinMaxDates();
  
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

    // Directly move to Edit, Mimic as if clicked on grid... so you write e.row.data
    //await editRow({row: {data: compVar.mainData[0]}});

  }

  //**********************************************************/
  const editRow = async (e) => {
  
    afterEdit(compVar, e);
    compVar.formTitle = props.city + ' from ' + convert_DbDate_To_DMY(compVar.minDate,1) + ' to ' + convert_DbDate_To_DMY(compVar.maxDate,1);
    
    // check if vouchers created
    if (compVar.vouchersCreated) {
      alert('Voucher has been created. Any changes to this form will overwrite the voucher description. ' + 
        'Please add any extra comments to the "Added Voucher Desc."');
    }

    compVar.oldFlightNo = (compVar.formData.FlightNo !== null) ? compVar.formData.FlightNo : '';
    compVar.oldTrainNo = (compVar.formData.TrainNo !== null) ? compVar.formData.TrainNo : '';
    compVar.oldEtd = (compVar.formData.ETD !== null) ? "'" + dateFormat(compVar.formData.ETD, null, 'MM/DD/YYYY HH:mm') + "'" : 'null';
    compVar.oldEta = (compVar.formData.ETA !== null) ? "'" + dateFormat(compVar.formData.ETA, null, 'MM/DD/YYYY HH:mm') + "'" : 'null';

    compVar.targetTravelFieldsChanged = false;

    await setAgentLookup();
    await getAgentVehicles(compVar.formData.AgentAddressbook_id);
  
    await setDriveRemarks();

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

    let travelObj = await getDefaultTravelObj();

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      ETD: travelObj.travelDate,
      ETA: travelObj.travelDate,
      From_Cities_id: travelObj.fromCities_id,
      To_Cities_id: travelObj.toCities_id,
      Quotations_id: props.quotations_id,
      QuoCities_id: props.quoCities_id,
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

    await setDateInDateOut();

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
    let condition = "WHERE (1=2) ";
    condition += (compVar.formMode === 2) ? "AND QuoTickets_id <> " + compVar.formData.QuoTickets_id.toString() : "";

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

    /*=== Update City Crossings ===*/
    compVar.formData = {...saveData.formData}; 
    if (compVar.targetTravelFieldsChanged) {
      await arrangeCarTravel();
    }
    await updateCityCrossings();    

    /*=== Update Service Details ... all the way upto Vouchers ===*/
    if (compVar.formData.Tickets_id === 5) {
      await updateTransportDetails();    
    } else {
      await updateTicketDetails();    
    }

    /*=== Update Emailing String for Accommodation ===*/
    await updateEmailString();    

    /*=== Update ReserveOvernightHotel in QuoAccommodation ===*/
    await updateAccommodationOvernight();

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

    if ((formData.ETA_Time !== null) && !isValidTime(formData.ETA_Time)) {
      return "Invalid ETA entered";
    }

    if ((formData.ETD_Time !== null) && !isValidTime(formData.ETD_Time)) {
      return "Invalid ETD entered";
    }

    const etd = convertToMoment_fmt(formData.ETD,'');    
    const eta = convertToMoment_fmt(formData.ETA,'');    
    if ((formData.ETD !== null) && (formData.ETA !== null) && (etd > eta)) {
      return "ETA has to be later than ETD";
    }

    if ((formData.Tickets_id === 5) && (formData.DriveTypes_id === null)) {
      return "If Car, the 'Drive Type' must be specified";
    }

    // If drive type is 'city groups', then the Car Hire Group must be selected
    if ((formData.Tickets_id === 5) && (formData.DriveTypes_id === 3) && (formData.CarHireGroups_id === null)) {
      return "If Drive Type is 'City Groups', then the 'City Group' must be specified";
    }

    if (formData.Tickets_id === 5 && formData.LocalCarHire !== true) {      
      const canDrive = await isSectorDrivable(formData.From_Cities_id,formData.To_Cities_id);
      if (!canDrive) {        
        return "Sector is not driveable";
      } 
    }

    // If drive, check car report / release times
    if (formData.CarReportDate !== null) {
      const carReportDate = convertToMoment_fmt(formData.CarReportDate,'');    
      if ((formData.Tickets_id === 5) && (carReportDate > etd)) {
        return "The car cannot report later than the ETD";
      }  
    }

    // If drive, check car report / release times
    if (formData.CarReleaseDate !== null) {
      const carReleaseDate = convertToMoment_fmt(formData.CarReleaseDate,'');    
      if ((formData.Tickets_id === 5) && (carReleaseDate < eta)) {
        return "The car cannot be released earlier than the ETA";
      }  
    }

    // If train, enter train name & number
    if ((formData.Tickets_id === 2) && ((formData.FlightNo === null) || (formData.FlightNo.trim() === ''))) {
      return "Train name must be entered";
    }

    // If train, enter train name & number
    if ((formData.Tickets_id === 1) && ((formData.FlightNo === null) || (formData.FlightNo.trim() === ''))) {
      return "Flight name must be entered";
    }

    // If train, enter train name & number
    if ((formData.Tickets_id === 2) && ((formData.TrainNo === null) || (formData.TrainNo.trim() === ''))) {
      return "Train number must be entered";
    }

    // If train, enter train name & number
    if ((formData.Tickets_id === 2) && (formData.From_TrainStations_id === null)) {
      return "From Station must be entered";
    }

    // If train, enter train name & number
    if ((formData.Tickets_id === 2) && (formData.To_TrainStations_id === null)) {
      return "To Station must be entered";
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
  const getSelectedFromCity = async(e) => {
    compVar.formData.From_Cities_id = e[0].cities_id;
    forceRender();
  }

  //**********************************************************/
  const getSelectedToCity = async(e) => {
    compVar.formData.To_Cities_id = e[0].cities_id;
    forceRender();
  }

  //**********************************************************/
  const getSelectedTicket = async(e) => {

    //if in edit mode, get current agent in db
    const quoTicketsObj = await getCurrentAgent(compVar.formData.QuoTickets_id);
    const currentAgents_id = quoTicketsObj.agents_id;
    const currentClass_id = quoTicketsObj.class_id;

    // If mode of travel changes, blank out agent
    if (compVar.formData.Tickets_id !== e[0].tickets_id) {
      compVar.formData.AgentAddressbook_id = null;
    }

    compVar.formData.Tickets_id = e[0].tickets_id;

    let agentObj = {};

    if (compVar.formData.Tickets_id === 1 || compVar.formData.Tickets_id === 2) {
      compVar.agentLookup = compVar.ticketAgentLookup;
      compVar.dbLookup[7].dataSource = compVar.agentLookup;  
    } else if (compVar.formData.Tickets_id === 5) {
      compVar.agentLookup = compVar.carAgentLookup;
      compVar.dbLookup[7].dataSource = compVar.agentLookup;  
    }

    if (compVar.formData.Tickets_id === 1) {

      // Check if current agent is in the list of selected agents
      let idx = compVar.agentLookup.findIndex(rec => rec.Addressbook_id === currentAgents_id);
      if (idx > -1) {
        compVar.formData.AgentAddressbook_id = currentAgents_id;
      } else {
        agentObj = await getDefaultFlightAgents_id();
        compVar.formData.AgentAddressbook_id = agentObj.agents_id;
      }

      // Check if current class is in the list of selected classes
      idx = compVar.classLookup.findIndex(rec => rec.tickets_id === compVar.formData.Tickets_id && rec.class_id === currentClass_id);
      compVar.formData.Class_id = (idx > -1) ? currentClass_id : 10;

    } else if (compVar.formData.Tickets_id === 2) {

      // Check if current agent is in the list of selected agents
      let idx = compVar.agentLookup.findIndex(rec => rec.Addressbook_id === currentAgents_id);
      if (idx > -1) {
        compVar.formData.AgentAddressbook_id = currentAgents_id;
      } else {
        agentObj = await getDefaultTrainAgents_id();
        compVar.formData.AgentAddressbook_id = agentObj.agents_id;
      }

      // Check if current class is in the list of selected classes
      idx = compVar.classLookup.findIndex(rec => rec.tickets_id === compVar.formData.Tickets_id && rec.class_id === currentClass_id);
      compVar.formData.Class_id = (idx > -1) ? currentClass_id : 6;

    } else if (compVar.formData.Tickets_id === 5) {
      // Check if current agent is in the list of selected agents
      let idx = compVar.agentLookup.findIndex(rec => rec.Addressbook_id === currentAgents_id);
      if (idx > -1) {
        compVar.formData.AgentAddressbook_id = currentAgents_id;
      } 

      await setCarTimings();

    }

    forceRender();
  }

  //**********************************************************/
  const getSelectedClass = async(e) => {
    compVar.formData.Class_id = e[0].class_id;
  }

  //**********************************************************/
  const getSelectedDriveType = async (e) => {
    compVar.formData.DriveTypes_id = e[0].DriveTypes_id;
    if (compVar.formData.DriveTypes_id !== null) {
      compVar.agentLookup = await getAgentServicesListing(compVar.formData.DriveTypes_id.toString(), false);
      compVar.dbLookup[7].dataSource = compVar.agentLookup;  
    }
    forceRender();
  }

  //**********************************************************/
  const getSelectedFromStation = async (e) => {
    compVar.formData.From_TrainStations_id = e[0].trainstations_id;
  }

  //**********************************************************/
  const getSelectedToStation = async (e) => {
    compVar.formData.To_TrainStations_id = e[0].trainstations_id;
  }

  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.AgentAddressbook_id = e[0].Addressbook_id;

    if (compVar.formData.AgentAddressbook_id !== null) {
      let whereStr = 'vehicles_id IN ' + 
        '(SELECT vehicles_id FROM carhireagents ' + 
        'WHERE addressbook_id = ' + compVar.formData.AgentAddressbook_id.toString() + ' ' + 
        'AND Active = 1) ';    
      compVar.agentVehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles', where: whereStr});    
      compVar.dbLookup[8].dataSource = compVar.agentVehicleLookup;  
 
      whereStr = 'DefaultAgents_id = ' + compVar.formData.AgentAddressbook_id.toString();
      compVar.carHireGroupLookup = await dbGetRecord({fields: ['CarHireGroups_id', 'CarHireGroup'], orders: ['CarHireGroup'], table: 'CarHireGroups', where: whereStr});    
      compVar.dbLookup[9].dataSource = compVar.carHireGroupLookup;  

    }
    forceRender();
  }

  //**********************************************************/
  const getSelectedVehicle = async(e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;
  }

  //**********************************************************/
  const getSelectedCarHireGroup = async (e) => {
    compVar.formData.CarHireGroups_id = e[0].CarHireGroups_id;
  }


  //**********************************************************/
  const clearFromCityLookup = async(e) => {
    compVar.formData.From_Cities_id = null;
  }

  //**********************************************************/
  const clearToCityLookup = async(e) => {
    compVar.formData.To_Cities_id = null;
  }

  //**********************************************************/
  const clearTicketLookup = async() => {
    compVar.formData.Tickets_id = null;
  }

  //**********************************************************/
  const clearClassLookup = async() => {
    compVar.formData.Class_id = null;
  }

  //**********************************************************/
  const clearDriveTypeLookup = async() => {
    compVar.formData.DriveTypes_id = null;
  }

  //**********************************************************/
  const clearFromStationLookup = async() => {
    compVar.formData.From_TrainStations_id = null;
  }

  //**********************************************************/
  const clearToStationLookup = async() => {
    compVar.formData.To_TrainStations_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async() => {
    compVar.formData.AgentAddressbook_id = null;
  }

  //**********************************************************/
  const clearVehicleLookup = async() => {
    compVar.formData.Vehicles_id = null;
  }

  //**********************************************************/
  const clearCarHireGroupLookup = async() => {
    compVar.formData.CarHireGroups_id = null;
  }

  //**********************************************************/
  const checkVouchersCreated = async () => {
    compVar.vouchersCreated = false;

    let query = 'SELECT * FROM VouchersTickets ' + 
      'WHERE QuoTickets_id IN ' + 
      '(SELECT QuoTickets_id FROM QuoTickets WHERE Quotations_id = ' + props.quotations_id.toString() + ')';
    const vouArray1 = await dbGetRecordRaw({query: query});   

    query = 'SELECT * FROM VouchersTransport ' + 
      'WHERE QuoTickets_id IN ' + 
      '(SELECT QuoTickets_id FROM QuoTickets WHERE Quotations_id = ' + props.quotations_id.toString() + ')';
    const vouArray2 = await dbGetRecordRaw({query: query});   
    
    if (vouArray1.length > 0 || vouArray2.length > 0) {
      compVar.vouchersCreated = true;
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
      if (props.onAddTravel !== undefined) {
        await props.onAddTravel({save: true, addNew: isAdded});
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
  const onFormFieldDataChanged = async (e) => {

    const targettedFields = ['ETD','ETD_Time','ETA','ETA_Time','Tickets_id','CarReportDate','CarReport_Time','CarReleaseDate','CarRelease_Time'];

    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 

    /*=== check if key fields were changed ... */
    /*=== if changed then some procedure to adjust timings has to be called ===*/
    const idx = targettedFields.findIndex(rec => rec === e.dataField);
    if (idx > -1) {
      compVar.targetTravelFieldsChanged = true;      
    }

    if (e.dataField === 'ETD_Time' && compVar.formData.ETD !== null &&
        compVar.formData.Tickets_id === 5 && 
        compVar.formData.From_Cities_id !== null && compVar.formData.To_Cities_id !== null) {
      await setCarTimings();
      forceRender();
    }

  }

  //**********************************************************/
  const setCarTimings = async () => {

    // Only for cars
    if (compVar.formData.Tickets_id !== 5) {
      return;
    }

    let fromTime = '09:00';
    if (compVar.formData.ETD_Time !== null && isValidTime(compVar.formData.ETD_Time)) {
      fromTime = compVar.formData.ETD_Time;
    }

    if (compVar.formData.From_Cities_id !== compVar.formData.To_Cities_id) {

      const driveObj = await getDriveDetails(compVar.formData.From_Cities_id, compVar.formData.To_Cities_id);

      if (driveObj.isSectorDrivable && driveObj.durationMin > 0) {
        let etd = convert_DbDate_To_MDY(compVar.formData.ETD,1) + ' ' + fromTime; 
        compVar.formData.ETA_Time = addMinutesToDateTime(etd, driveObj.durationMin, 3);        
      }
  
    }

  };     

  //**********************************************************/
  const setCarTimingsBasedOnTickets = async () => {

    let fromTime = '09:00';
    if (compVar.formData.ETD_Time !== null && isValidTime(compVar.formData.ETD_Time)) {
      fromTime = compVar.formData.ETD_Time;
    }

    const driveObj = await getQuoTicketDriveDetails (compVar.formData.QuoTickets_id);

    if (driveObj.isSectorDrivable && driveObj.durationMin > 0) {
      const etd = convert_DbDate_To_MDY(compVar.formData.ETD,1) + ' ' + fromTime; 
      compVar.formData.ETA_Time = addMinutesToDateTime(etd, driveObj.durationMin, 3);            

      compVar.isSectorDrivable = driveObj.isSectorDrivable; 
      compVar.kms = driveObj.kms; 
      compVar.durationMin = driveObj.durationMin;
      compVar.remarks = driveObj.remarks;    
  
    }

  };     


  //**********************************************************/
  const setAgentLookup = async () => {

    if (compVar.formData.DriveTypes_id !== null && compVar.formData.Tickets_id === 5) {
      compVar.agentLookup = await getAgentServicesListing(compVar.formData.DriveTypes_id.toString(), false);
      compVar.dbLookup[7].dataSource = compVar.agentLookup;  
    } else if (compVar.formData.Tickets_id === 1 || compVar.formData.Tickets_id === 2) {
      compVar.agentLookup = compVar.ticketAgentLookup;
      compVar.dbLookup[7].dataSource = compVar.agentLookup;  
    }

  }

  //**********************************************************/
  const getAgentVehicles = async (addressbook_id) => {

    if (addressbook_id !== null) {
     const query = 'SELECT DISTINCT ch.vehicles_id, v.vehicle, ch.active ' + 
       'FROM CarHireAgents ch ' + 
       'LEFT JOIN Vehicles v ON ch.Vehicles_id = v.Vehicles_id ' + 
       'WHERE ch.addressbook_id = ' +  + addressbook_id.toString() + ' ' + 
       'AND ch.active = 1';
     compVar.agentVehicleLookup = await dbGetRecordRaw({query: query});          
     compVar.dbLookup[8].dataSource = compVar.agentVehicleLookup;  

     const whereStr = 'DefaultAgents_id = ' + addressbook_id.toString();
     compVar.carHireGroupLookup = await dbGetRecord({fields: ['CarHireGroups_id', 'CarHireGroup'], orders: ['CarHireGroup'], table: 'CarHireGroups', where: whereStr});    
     compVar.dbLookup[9].dataSource = compVar.carHireGroupLookup;  

    }

  }

  //**********************************************************/
  const setMinMaxDates = async () => {
    let query = "SELECT DateIn, DateOut, TimeIn, TimeOut FROM QuoCities " + 
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

    query = "SELECT FromCities_id, ToCities_id " + 
      "FROM QuoCities "  + 
      "WHERE QuoCities_id = " + props.quoCities_id.toString();
    const quoCitiesArr = await dbGetRecordRaw({query: query});
    if (quoCitiesArr.length > 0) {
      compVar.fromCities_id = quoCitiesArr[0].FromCities_id;
      compVar.toCities_id = quoCitiesArr[0].ToCities_id;  
    }
    
  }

  //**********************************************************/
  const getDefaultTravelObj = async () => {

    let travelDate = null;
    let orderStr = '';
    let fromCities_id = null;
    let toCities_id = null;

    let whereStr = 'QuoCities_id = ' + props.quoCities_id.toString();
    let quoCitiesArr = await dbGetRecord({fields: ["FromCities_id, ToCities_id, DateIn"], table: 'QuoCities', where: whereStr});

    const numRec = compVar.mainData.length;
    if (numRec === 0) {
      if (quoCitiesArr.length > 0) {
        travelDate = convert_DbDate_To_MDY(quoCitiesArr[0].DateIn,1);
        fromCities_id = quoCitiesArr[0].FromCities_id;
        toCities_id = quoCitiesArr[0].ToCities_id;
      }
    } else {
      whereStr = 'QuoCities_id = ' + props.quoCities_id.toString();
      orderStr = 'ETA DESC';
      const quoTicketsArr = await dbGetRecord({fields: ["To_Cities_id, ETA"], table: 'QuoTickets', orders: [orderStr], where: whereStr});
      if (quoTicketsArr.length > 0) {
        travelDate = convert_DbDate_To_MDY(quoTicketsArr[0].ETA,1);
        fromCities_id = quoTicketsArr[0].To_Cities_id;
      }
    }

    return ({travelDate: travelDate, fromCities_id: fromCities_id, toCities_id: toCities_id})

  }


  //**********************************************************/
  const setDateInDateOut = async () => {
    let timing = '';

    // For cars, If arrival time kept blank, auto fill it based on duration in distances table
    await setCarTimings();

    // If not trains, set TrainStations_id to null
    if (compVar.formData.Tickets_id !== 2) {
      compVar.formData.From_TrainStations_id = null;
      compVar.formData.To_TrainStations_id = null;
      compVar.formData.TrainNo = null;
    }

    // If car selected, blank off Flight & TrainNo
    if (compVar.formData.Tickets_id === 5) {
      compVar.formData.FlightNo = null;
    }

    // If Air, enter the default flight agent
    if (compVar.formData.Tickets_id === 1 && compVar.formData.AgentAddressbook_id === null) {
      const agentObj = await getDefaultFlightAgents_id();
      compVar.formData.AgentAddressbook_id = agentObj.agents_id;
    }

    // If Train, enter the default train agent
    if (compVar.formData.Tickets_id === 2 && compVar.formData.AgentAddressbook_id === null) {
      const agentObj = await getDefaultTrainAgents_id();
      compVar.formData.AgentAddressbook_id = agentObj.agents_id;
    }

    if (compVar.formData.ETA !== null && compVar.formData.ETA_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ETA,1) + ' ' + compVar.formData.ETA_Time;
      compVar.formData.ETA = timing;  
    } else if (compVar.formData.ETA !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ETA,1) + ' 00:00';
      compVar.formData.ETA = timing;  
    }

    if (compVar.formData.ETD !== null && compVar.formData.ETD_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ETD,1) + ' ' + compVar.formData.ETD_Time;
      compVar.formData.ETD = timing;
      compVar.formData.TravelDate = convert_DbDate_To_MDY(compVar.formData.ETD,1);
    } else if (compVar.formData.ETD !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ETD,1) + ' 00:00';
      compVar.formData.ETD = timing;
      compVar.formData.TravelDate = convert_DbDate_To_MDY(compVar.formData.ETD,1);
    }

    if (compVar.formData.CarReportDate !== null && compVar.formData.CarReport_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.CarReportDate,1) + ' ' + compVar.formData.CarReport_Time;
      compVar.formData.CarReportDate = timing;  
    } else if (compVar.formData.CarReportDate !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.CarReportDate,1) + ' 00:00';
      compVar.formData.CarReportDate = timing;  
    }

    if (compVar.formData.CarReleaseDate !== null && compVar.formData.CarRelease_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.CarReleaseDate,1) + ' ' + compVar.formData.CarRelease_Time;
      compVar.formData.CarReleaseDate = timing;  
    } else if (compVar.formData.CarReleaseDate !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.CarReleaseDate,1) + ' 00:00';
      compVar.formData.CarReleaseDate = timing;  
    }

    // No of Tickets - 1 for Car, NUmPax otherwise
    if (compVar.formData.Tickets_id !== null) {
      compVar.formData.NoOfTickets = props.numPax;
    }

    // Overnight, Nights
    if (compVar.formData.ETA !== null && compVar.formData.ETD !== null) {
      compVar.formData.Nights = dateDayDiffIgnoreTime(compVar.formData.ETA,compVar.formData.ETD);
      compVar.formData.Overnight = (compVar.formData.Nights > 0) ? true : false;
    }

  }

  //**********************************************************/
  const updateCityCrossings = async() => {
    if (compVar.formData.QuoTickets_id !== null) {
      const sql = "EXEC p_QuoInsertCityCrossings " + 
        compVar.formData.QuoTickets_id.toString() + " ";
      const spData = {sql: sql};
      await dbExecuteSp(spData);
    }
  }

  //**********************************************************/
  const updateTransportDetails = async () => {
    if (compVar.formMode === 2) {
      const sql = "EXEC [p_UpdateTransportInVouchers] " + 
        compVar.formData.QuoTickets_id.toString() + " ";
      const spData = {sql: sql};
      await dbExecuteSp(spData);
    }
  }
  
  //**********************************************************/
  const updateTicketDetails = async () => {    

    const newFlightNo = (compVar.formData.FlightNo !== null) ? compVar.formData.FlightNo : '';
    const newTrainNo = (compVar.formData.TrainNo !== null) ? compVar.formData.TrainNo : '';
    const newEtd = (compVar.formData.ETD !== null) ? "'" + dateFormat(compVar.formData.ETD, null, 'MM/DD/YYYY HH:mm') + "'" : 'null';
    const newEta = (compVar.formData.ETA !== null) ? "'" + dateFormat(compVar.formData.ETA, null, 'MM/DD/YYYY HH:mm') + "'" : 'null';

    //if (compVar.formMode === 2) {
    //  const sql = "EXEC [p_UpdateTicketsInVouchers] " + 
    //    compVar.formData.QuoTickets_id.toString() + " ";
    //  let spData = {sql: sql};
    //  await dbExecuteSp(spData);
    //}

    // Same procedure that is called to change flights in the 'Update Flights form'
    if (compVar.formMode === 2) {
      const sql = "EXEC p_UpdateFlightDetails " + 
        props.quoTickets_id.toString() + ", '" + 
        compVar.oldFlightNo + "', '" +
        compVar.oldTrainNo + "', " +
        compVar.oldEtd + ", " +
        compVar.oldEta + ", '" +
        newFlightNo + "', '" +
        newTrainNo + "', " +
        newEtd + ", " +
        newEta + " ";
      const spData = {sql: sql};
      await dbExecuteSp(spData);
      
    }

  }

  //**********************************************************/
  const updateAccommodationOvernight = async() => {
    if (compVar.formMode === 2) {  
      const sql = "EXEC p_Quo_UpdateAccommodationOvernight " + 
        props.quotations_id.toString() + ", " +
        compVar.formData.QuoTickets_id.toString();
      const spData = {sql: sql};
      await dbExecuteSp(spData);
    }
  }


  //**********************************************************/
  const updateEmailString = async() => {
    if (compVar.formMode === 2) {  
      let sql = "EXEC p_Quo_UpdateSingleEmailString " + 
        props.quotations_id.toString() + ", " +
        compVar.formData.QuoTickets_id.toString() + ", 1";
      let spData = {sql: sql};
      await dbExecuteSp(spData);
    }
  }

  //**********************************************************/
  const arrangeCarTravel = async () => {

    /*=== Rearrange QuoCities timings ====*/
    let sql = 'EXEC p_QuoRearrangeCitiesTimings ' + props.quotations_id.toString();
    let spData = {sql: sql};
    await dbExecuteSp(spData);  

    if (compVar.formData.Tickets_id === 5) {

      /*=== Arrange Car Travel Details (Per Km, P2P, CarGroup) ====*/
      sql = 'EXEC p_QuoTicketsSetChangeCar ' + props.quotations_id.toString();
      spData = {sql: sql};
      await dbExecuteSp(spData);  

      /*=== Set car Agent & Vehicle ====*/
      sql = 'EXEC p_QuoSetCarAgent ' + props.quotations_id.toString();
      spData = {sql: sql};
      await dbExecuteSp(spData);  

    }


  }



  //**********************************************************/
  const toggleFilter = async () => {
    compVar.travelFilter = !compVar.travelFilter;
    forceRender();
  }

  //**********************************************************/
  const routeFinder = async () => {

    compVar.displayRouteFinder = true;

    let query = "SELECT FromCities_id, ToCities_id, DateIn FROM QuoCities " +  
      "WHERE QuoCities_id = " + props.quoCities_id.toString() + " ";

    const citiesData = await dbGetRecordRaw({query: query});

    if (citiesData.length > 0) {
      // Save to the REDUX store
      dispatch(setRouteFinderParamValues({
        fromCities_id: citiesData[0].FromCities_id, 
        toCities_id: citiesData[0].ToCities_id, 
        wef: convert_DbDate_To_DMY(citiesData[0].DateIn,1)
      }));
    }

    forceRender();
  }  

  //**********************************************************/
  const getSelectedRoute = async (e) => {

    compVar.displayRouteFinder = e.open;

    /*=== Delete current QuoTickets records ===*/
    let sql = "DELETE FROM QuoTickets " + 
      "WHERE QuoCities_id = " + props.quoCities_id.toString() + " ";
    let spData = {sql: sql};
    await dbExecuteSp(spData);

    for (const rec of e.data) {
      const trainNo = (rec.TrainNo !== null) ? "'" + rec.TrainNo.trim() + "'" : 'null';
      const modeNo = (rec.ModeNo !== null) ? "'" + rec.ModeNo.trim() + "'" : 'null';

      /*=== Add new records ===*/
      sql = "EXEC [p_QuoTicketsInsertData] " + 
        props.quoCities_id.toString() + ", " +
        rec.FromCities_id.toString() + ", " +
        rec.ToCities_id.toString() + ", " +
        rec.Mode + ", " +
        modeNo + ", " +
        rec.ModePreference.toString() + ", " +
        "'" + dateFormat(rec.Departure, null, 'MM/DD/YYYY HH:mm') + "', " +
        "'" + dateFormat(rec.Arrival, null, 'MM/DD/YYYY HH:mm') + "', " +
        rec.Hops.toString() + ", " + 
        trainNo + ", " +
        _g_users_id.toString();

      spData = {sql: sql};
      await dbExecuteSp(spData);

    }
      
    // Do the error checking in the Presto Cities form
    if (props.onModifyTravel !== undefined) {
      await props.onModifyTravel();
    }

    await filterData();

  }

  //**********************************************************/
  const onCloseRouteFinder = async (e) => {
    compVar.displayRouteFinder = e.open;
    forceRender();
  }

  //**********************************************************/
  const trainListing = async () => {
    compVar.displayTrainList = true;
    forceRender();
  }  

  //**********************************************************/
  const getSelectedTrain = async (e) => {

    compVar.displayTrainList = e.open;
    
    if (e.refresh) {
      if (e.data.TrainName !== undefined && e.data.TrainName !== null) {
        compVar.formData.FlightNo = e.data.TrainNo.trim() + ' ' + e.data.TrainName;
      }
      if (e.data.TrainNo !== undefined && e.data.TrainNo !== null) {
        compVar.formData.TrainNo = e.data.TrainNo.trim();
      }
      if (e.data.From_TrainStations_id !== undefined && e.data.From_TrainStations_id !== null) {
        compVar.formData.From_TrainStations_id = e.data.From_TrainStations_id;
      }
      if (e.data.To_TrainStations_id !== undefined && e.data.To_TrainStations_id !== null) {
        compVar.formData.To_TrainStations_id = e.data.To_TrainStations_id;
      }
      if (e.data.Class_id !== undefined && e.data.Class_id !== null) {
        compVar.formData.Class_id = e.data.Class_id;
      }
      if (e.data.Timings !== undefined && e.data.Timings !== null) {
        if (e.data.Timings.trim().length === 11) {
          compVar.formData.ETD_Time = e.data.Timings.trim().substr(0,5);
          compVar.formData.ETA_Time = e.data.Timings.trim().substr(6,5);

          compVar.formData.ETA = convert_DbDate_To_MDY(compVar.formData.ETA,1) + ' ' + compVar.formData.ETA_Time;
          compVar.formData.ETD = convert_DbDate_To_MDY(compVar.formData.ETD,1) + ' ' + compVar.formData.ETD_Time;          
        }
      }
    }

    forceRender();

  }

  //**********************************************************/
  const driveViaListing = async () => {
    compVar.displayDriveViaList = true;
    forceRender();
  }  


  //**********************************************************/
  const getSelectedDriveVia = async (e) => {

    compVar.displayDriveViaList = false;    

    // Refresh the driveable sector string
    if (e.refresh) {
      // This should be used when Travel form is not in edit/insert mode...., 
      // ... otherwise use setCarTimings when FromCities_id & ToCities_id are modified
      await setCarTimingsBasedOnTickets();
      //this.var.refreshDriveableSector++;

      // Set the top band for drives .... Drive Via ...
      await setDriveRemarks();
    }
    forceRender();
  }

  //**********************************************************/
  const carReportReleaseListing = async () => {
    compVar.displayCarReportReleaseList = true;
    forceRender();
  }  

  //**********************************************************/
  const getSelectedReportRelease = async (e) => {

    compVar.displayCarReportReleaseList = e.open;

    if (e.refresh && e.carReportDate !== undefined && e.carReportDate !== null) {
      compVar.formData.CarReportDate = e.carReportDate;
      compVar.formData.CarReport_Time = dateFormat(e.carReportDate, null, 'HH:mm');
    }
    if (e.refresh && e.carReleaseDate !== undefined && e.carReleaseDate !== null) {
      compVar.formData.CarReleaseDate = e.carReleaseDate;
      compVar.formData.CarRelease_Time = dateFormat(e.carReleaseDate, null, 'HH:mm');
    }

    forceRender();
    
  }

  //**********************************************************/
  const shiftCarReportRelease = async () => {

    if (compVar.formMode === 2) {  
      const sql = "EXEC p_QuoShiftCarReportReleaseDates " + 
        props.quotations_id.toString() + ", " +
        compVar.formData.QuoTickets_id.toString();
      const spData = {sql: sql};
      await dbExecuteSp(spData);

      await filterData();
    }

  }

  //**********************************************************/
  const setDriveRemarks = async () => {

    const driveObj = await getQuoTicketDriveDetails(compVar.formData.QuoTickets_id);
    compVar.isSectorDrivable = driveObj.isSectorDrivable; 
    compVar.kms = driveObj.kms; 
    compVar.durationMin = driveObj.durationMin;
    compVar.remarks = driveObj.remarks;    
    
  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    // if called from PrestoCities
    if (props.formMode === 0) {
      defaultDataObject.data = (compVar.travelFilter) ? compVar.mainData.filter(rec => rec.QuoCities_id === props.quoCities_id) : compVar.mainData;
    // if called from PrestoDtd
    } else {
      defaultDataObject.data = (compVar.travelFilter) ? compVar.mainData.filter(rec => rec.QuoTickets_id === props.quoTickets_id) : compVar.mainData;
    }

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

    const vehicleLookup = (editPopupVisible) ? compVar.agentVehicleLookup : compVar.vehicleLookup;

    const classLookup = compVar.classLookup.filter(rec => rec.tickets_id === compVar.formData.Tickets_id);
    compVar.dbLookup[3].dataSource = classLookup;  

    const fromStationLookup = compVar.fromStationLookup.filter(rec => rec.cities_id === compVar.formData.From_Cities_id);
    compVar.dbLookup[5].dataSource = fromStationLookup;  

    const toStationLookup = compVar.toStationLookup.filter(rec => rec.cities_id === compVar.formData.To_Cities_id);
    compVar.dbLookup[6].dataSource = toStationLookup;  

    // *** CASE SENSITIVE override formData properties
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearTicketLookupValues = {tickets_id: null, details: ''};
    const clearClassLookupValues = {class_id: null, classCode: ''};
    const clearDriveTypeLookupValues = {DriveTypes_id: null, DriveType: ''};
    const clearFromStationLookupValues = {trainstations_id: null, station: ''};
    const clearToStationLookupValues = {trainstations_id: null, station: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    const clearCarHireGroupLookupValues = {CarHireGroups_id: null, CarHireGroup: ''};

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.fromCityLookup, 
      ['cities_id','city'], compVar.formData.From_Cities_id);

    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.toCityLookup, 
      ['cities_id','city'], compVar.formData.To_Cities_id);      

    const initialTicketLookupValues = getLookupValues (
      clearTicketLookupValues, compVar.ticketLookup, 
      ['tickets_id','details'], compVar.formData.Tickets_id);
     
    const initialClassLookupValues = getLookupValues (
      clearClassLookupValues, classLookup, 
      ['class_id','classCode'], compVar.formData.Class_id);

    const initialDriveTypeLookupValues = getLookupValues (
      clearDriveTypeLookupValues, compVar.driveTypeLookup, 
      ['DriveTypes_id','DriveType'], compVar.formData.DriveTypes_id);            
    
    const initialFromStationLookupValues = getLookupValues (
      clearFromStationLookupValues, fromStationLookup, 
      ['trainstations_id','station'], compVar.formData.From_TrainStations_id);
        
    const initialToStationLookupValues = getLookupValues (
      clearToStationLookupValues, toStationLookup, 
      ['trainstations_id','station'], compVar.formData.To_TrainStations_id);

    const initialAgentLookupValues = getLookupValues (
      clearAgentLookupValues, compVar.agentLookup, 
      ['Addressbook_id','OrgCity'], compVar.formData.AgentAddressbook_id);
          
    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, vehicleLookup, 
      ['vehicles_id','vehicle'], compVar.formData.Vehicles_id);          
            
    const initialCarHireGroupLookupValues = getLookupValues (
      clearCarHireGroupLookupValues, compVar.carHireGroupLookup, 
      ['CarHireGroups_id','CarHireGroup'], compVar.formData.CarHireGroups_id);                              
        
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
      clearLookup: [clearFromCityLookup, clearToCityLookup, clearTicketLookup, clearClassLookup, clearDriveTypeLookup, clearFromStationLookup, clearToStationLookup, clearAgentLookup, clearVehicleLookup, clearCarHireGroupLookup],
      getSelectedRecord: [getSelectedFromCity,  getSelectedToCity, getSelectedTicket, getSelectedClass, getSelectedDriveType, getSelectedFromStation, getSelectedToStation, getSelectedAgent, getSelectedVehicle, getSelectedCarHireGroup],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues, initialTicketLookupValues, initialClassLookupValues, initialDriveTypeLookupValues, initialFromStationLookupValues, initialToStationLookupValues, initialAgentLookupValues, initialVehicleLookupValues, initialCarHireGroupLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues, clearTicketLookupValues, clearClassLookupValues, clearDriveTypeLookupValues, clearFromStationLookupValues, clearToStationLookupValues, clearAgentLookupValues, clearVehicleLookupValues, clearCarHireGroupLookupValues],
      driveObj: {remarks: (compVar.remarks !== undefined) ? compVar.remarks : '', 
        isSectorDrivable: (compVar.isSectorDrivable !== undefined) ? compVar.isSectorDrivable : false},
      trainListing: trainListing,
      driveViaListing: driveViaListing,
      carReportReleaseListing: carReportReleaseListing,
      shiftCarReportRelease: shiftCarReportRelease
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.toCities_id !== null) && (compVar.fromCities_id !== compVar.toCities_id) ? true : false;

    const filterButtonVisible = (compVar.mainData.length > 1);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: filterButtonVisible, options: {icon: "filter", onClick: toggleFilter, hint: 'Toggle filter on date / city'}},
        {visible: canAdd, options: {icon: "icons/routeFinder.png", onClick: routeFinder, hint: 'Route Finder'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc', background: HEADER_BACKGROUND_COLOR},
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
      compVar.focusedRowKey = (idx > 0 && compVar.mainData.length > 1) ? compVar.mainData[idx-1][compVar.keyField] : null;  
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
    
    const etd = (compVar.formData.ETD !== null) ? convert_DbDate_To_MDY(compVar.formData.ETD,1) : null;

    return (
      <>
        <div className="master-grid-container" style={{/*height: containerHeight*/}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {compVar.displayRouteFinder &&
            <RouteFinder 
              formType={2}
              routeFinderType={2}
              onClose={onCloseRouteFinder}
              getSelectedRoute={getSelectedRoute}
              numCities={compVar.mainData.length}
            />
          }

          {compVar.displayTrainList &&
            <PrestoTrainsList
              quoTickets_id={compVar.formData.QuoTickets_id}
              fromCities_id={compVar.formData.From_Cities_id}
              toCities_id={compVar.formData.To_Cities_id}
              wef={etd}
              getSelectedTrain={getSelectedTrain}
            >
            </PrestoTrainsList>
          }

          {compVar.displayDriveViaList && compVar.formMode !== 1 &&
            <PrestoDriveViaList
              quotations_id={props.quotations_id}
              quoTickets_id={compVar.formData.QuoTickets_id}
              getSelectedDriveVia={getSelectedDriveVia}
            >
            </PrestoDriveViaList>
          }        

          {compVar.displayCarReportReleaseList && compVar.formMode !== 1 &&
            <PrestoTravelCityList
              quotations_id={props.quotations_id}
              quoTickets_id={compVar.formData.QuoTickets_id}
              getSelectedReportRelease={getSelectedReportRelease}
            >
            </PrestoTravelCityList>
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

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default PrestoTravel;
