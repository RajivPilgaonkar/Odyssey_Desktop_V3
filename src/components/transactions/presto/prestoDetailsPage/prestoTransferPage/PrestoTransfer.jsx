import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, setDateTimeFormat, convertToMoment_fmt, convert_DbDate_To_DMY, beforeInsert, isValidTime, convertDMY_toDate } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetPrestoTransferData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import { getAgentServicesListingInCity } from "../../../../common/GetOrgListing";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights, afterAdd} from "../../../../common/MasterGridHelpers";
import { canDelete } from "../../../../common/CommonFunctions";
import {Button} from 'devextreme-react/button';
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';
import PrestoCityTransferList from './PrestoCityTransferList';

import '../../../../common/MasterGrid.css'

const HEADER_BACKGROUND_COLOR = '#f3e5d8';

let compVar = {};

function PrestoTransfer(props) {

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
      cityLookup: [], agentLookup: [], serviceLookup: [],
      agentVehicleLookup: [], transferTypeLookup: [], vehicleLookup: [],
      tableName: 'QuoServices', keyField: 'QuoServices_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Transfer', title: 'New Transfer',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '', isDeleted: false, isAdded: false,
      formHeight: 640,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption,deleteCityTransfersProc],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      activeTransfersSwitchValue: true, vouchersCreated: true,
      activeVehiclesSwitchValue: true,
      serviceFilter: true, firstPass: true, displayTransferCostList: false,
      admLevel: 1,
      dbLookup: [       

        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'services_id', dataSource: compVar.serviceLookup, 
        displayExpr: 'service', valueExpr: 'services_id', fieldList: ['service']},

        {keyField: 'transfertypes_id', dataSource: compVar.transferTypeLookup, 
        displayExpr: 'transfer', valueExpr: 'transfertypes_id', fieldList: ['transfer']},
    
        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},
    
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

      compVar.cityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.cityLookup;  

      let whereStr = 'transfer = 1';
      compVar.serviceLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id, transfertypes_id, addressbook_id, active, COALESCE(guide,0) AS guide'], orders: ['[service]'], table: '[services]', where: whereStr});    
      compVar.serviceLookup = compVar.serviceLookup.filter(rec => rec.cities_id === props.cities_id);
      compVar.dbLookup[1].dataSource = compVar.serviceLookup;  

      whereStr = 'transfertypes_id <> 0';
      compVar.transferTypeLookup = await dbGetRecord({fields: ['transfertypes_id', 'transfer'], orders: ['transfertypes_id'], table: 'transfertypes', where: whereStr}); 
      compVar.dbLookup[2].dataSource = compVar.transferTypeLookup;  

      compVar.agentLookup = await getAgentServicesListingInCity ('5', props.cities_id, 0, true);
      compVar.dbLookup[3].dataSource = compVar.agentLookup;  
  
      compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles'});    
      compVar.dbLookup[4].dataSource = compVar.vehicleLookup;  
      
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
    fieldArray = fieldArray.map(e => 'qs.' + e);
    fieldArray.push("CONVERT(varchar(5),StartTime,108) AS StartTime_Time");
    fieldArray.push("CONVERT(varchar(5),FlightDepTime,108) AS FlightDepTime_Time");

    try {

      const whereStr = "qs.QuoCities_id = " + props.quoCities_id.toString() + " " + 
        "AND Sightseeing = 0";
  
      const tableStr = "QuoServices qs";
  
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['qs.ServiceDate, qs.StartTime'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Presto Services'});   

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

    // If this is executed using menu 'Add Sightseeing' & is the first pass
    // So if filterData is called by any other event in this form, the form will not open up in the ADD mode
    if (props.transferFormType === 2 && compVar.firstPass) {      
      compVar.firstPass = false;
      await addRow();
    }

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

    await getAgentVehicles(compVar.formData.AgentAddressbook_id);
    
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
      Sightseeing: false,
      ServiceDate: convertDMY_toDate(props.activityDate),
      Cities_id: props.cities_id,
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
    let condition = "WHERE Quotations_id = " + compVar.formData.Quotations_id.toString() + " "  +
      "AND QuoCities_id = " + compVar.formData.QuoCities_id.toString() + " "  +
      "AND AgentAddressbook_id = " + compVar.formData.AgentAddressbook_id.toString() + " "  +
      "AND Sightseeing = 0 " +
      "AND Services_id = " + compVar.formData.Services_id.toString() + " "  +
      "AND dbo.[fn_GetDateWithoutTime](ServiceDate) = '" + convert_DbDate_To_MDY(compVar.formData.ServiceDate,1) + "' "; 
    condition += (compVar.formMode === 2) ? "AND QuoServices_id <> " + compVar.formData.QuoServices_id.toString() : "";

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

    /*=== Update Service Details ... all the way upto Vouchers ===*/
    await updateServiceDetails();    

    /*=== Update Emailing String for Accommodation ===*/
    await updateEmailString();    

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

    // form validation errors
    if ((formData.StartTime_Time !== null) && !isValidTime(formData.StartTime_Time)) {
      return "Invalid 'Start Time' time entered";
    }

    if ((formData.FlightDepTime_Time !== null) && !isValidTime(formData.FlightDepTime_Time)) {
      return "Invalid 'Flight/Train At' time entered";
    }

    const minDate = convertToMoment_fmt(compVar.minDate,'');    
    const serviceDate = convertToMoment_fmt(formData.ServiceDate,'');
    if (serviceDate < minDate) {
      return "Service Date cannot be less than " + convert_DbDate_To_DMY(compVar.minDate,1);
    }

    const maxDate = convertToMoment_fmt(compVar.maxDate,'');    
    if (serviceDate > maxDate) {
      return "Service Date cannot be greater than " + convert_DbDate_To_DMY(compVar.maxDate,1);
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
  const getSelectedCity = async(e) => {
    compVar.formData.Cities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedService = async(e) => {
    compVar.formData.Services_id = e[0].services_id;

    if (compVar.formData.Services_id !== null) {
      const idx = compVar.serviceLookup.findIndex(rec => rec.services_id === compVar.formData.Services_id);
      if (idx !== -1) {
        compVar.formData.AgentAddressbook_id = compVar.serviceLookup[idx].addressbook_id;      
        compVar.formData.TransferTypes_id = e[0].transfertypes_id;
        // Get vehicle list for agent
        if (compVar.formData.AgentAddressbook_id !== null) {
          await getAgentVehicles(compVar.formData.AgentAddressbook_id);
        }
      }
    }

    forceRender();

  }

  //**********************************************************/
  const getSelectedTransferType = async(e) => {
    compVar.formData.TransferTypes_id = e[0].transfertypes_id;
  }

  //**********************************************************/
  const getSelectedAgent = async (e) => {
    compVar.formData.AgentAddressbook_id = e[0].Addressbook_id;

    // get vehicle list for agent
    await getAgentVehicles(compVar.formData.AgentAddressbook_id);
    forceRender();
  }

  //**********************************************************/
  const getSelectedVehicle = async(e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;
    forceRender();
  }
  

  //**********************************************************/
  const clearCityLookup = async(e) => {
    compVar.formData.Cities_id = null;
  }

  //**********************************************************/
  const clearServiceLookup = async(e) => {
    compVar.formData.Services_id = null;
  }

  //**********************************************************/
  const clearTransferTypeLookup = async(e) => {
    compVar.formData.TransferTypes_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async(e) => {
    compVar.formData.AgentAddressbook_id = null;
  }

  //**********************************************************/
  const clearVehicleLookup = async(e) => {
    compVar.formData.Vehicles_id = null;
  }

  //**********************************************************/
  const checkVouchersCreated = async () => {
    compVar.vouchersCreated = false;

    const query = 'SELECT * FROM VouchersServices ' + 
      'WHERE QuoServices_id IN ' + 
      '(SELECT QuoServices_id FROM QuoServices WHERE Quotations_id = ' + props.quotations_id.toString() + ')';

    const vouArray = await dbGetRecordRaw({query: query});   
    if (vouArray.length > 0) {
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
      if (props.onAddTransfer !== undefined) {
        await props.onAddTransfer({save: true, addNew: isAdded});
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
  const onFormFieldDataChanged = (e) => {
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 

  }

  //**********************************************************/
  const activeTransferSwitchValueChanged = (e) => {
    compVar.activeTransfersSwitchValue = e;
    forceRender();
  }

  //**********************************************************/
  const activeVehiclesSwitchValueChanged = (e) => {
    compVar.activeVehiclesSwitchValue = e;
    forceRender();
  }

  //**********************************************************/
  const getAgentVehicles = async (addressbook_id) => {
    compVar.agentVehicleLookup = [];

    if (addressbook_id !== null) {
     const query = 'SELECT DISTINCT ch.vehicles_id, v.vehicle, ch.active ' + 
       'FROM CarHireAgents ch ' + 
       'LEFT JOIN Vehicles v ON ch.Vehicles_id = v.Vehicles_id ' + 
       'WHERE ch.addressbook_id = ' +  + addressbook_id.toString() + ' ' + 
       'AND ch.active = 1';
     compVar.agentVehicleLookup = await dbGetRecordRaw({query: query});     
    }

  }

  //**********************************************************/
  const setMinMaxDates = async () => {
    const query = "SELECT DateIn, DateOut, TimeIn, TimeOut FROM QuoCities " + 
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

    if (dateRange.length > 0 && dateRange[0].TimeIn !== null) {
      compVar.minDateTime = dateRange[0].TimeIn;
      compVar.minDateTime = compVar.minDateTime.replace('T', ' ').replace('Z', '');
    }

    if (dateRange.length > 0 && dateRange[0].TimeOut !== null) {
      compVar.maxDateTime = dateRange[0].TimeOut;
      compVar.maxDateTime = compVar.maxDateTime.replace('T', ' ').replace('Z', '');
    }
    
  }

  //**********************************************************/
  const setDateInDateOut = async () => {
    let timing = '';

    if (compVar.formData.ServiceDate !== null && compVar.formData.StartTime_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ServiceDate,1) + ' ' + compVar.formData.StartTime_Time;
      compVar.formData.StartTime = timing;  
    } 

    if (compVar.formData.ServiceDate !== null && compVar.formData.FlightDepTime_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ServiceDate,1) + ' ' + compVar.formData.FlightDepTime_Time;
      compVar.formData.FlightDepTime = timing;  
    } else if (compVar.formData.ServiceDate !== null && compVar.formData.FlightDepTime_Time === null) {
      timing = convert_DbDate_To_MDY(compVar.formData.ServiceDate,1) + ' 00:00';
      compVar.formData.FlightDepTime = timing;  
    }

    // adjust flight time if there is a problem in the timings ... like transfer late night and flight early next morning
    // ... only for departures
    if (compVar.formData.TransferTypes_id === 2) {
      const query = "SELECT [dbo].[fn_AdjustFlightTime]  (" + 
        compVar.formData.TransferTypes_id.toString() + ", '" +
        compVar.formData.StartTime + "', '" + 
        compVar.formData.FlightDepTime + "') AS FlightDepTime";

      const flightDepObj = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Presto Transfers'});   

      if (flightDepObj.length > 0) {
        compVar.formData.FlightDepTime = flightDepObj[0].FlightDepTime;

        if (compVar.formData.FlightDepTime !== null) {
          compVar.formData.FlightDepTime = compVar.formData.FlightDepTime.replace('T', ' ').replace('Z', '');
        }
      }

    }
     
    /*=== If Vehicle Entered but NoOfVehicles not entered ===*/
    if (compVar.formData.Vehicles_id !== null && compVar.formData.NoOfVehicles === null) {
      compVar.formData.NoOfVehicles = 1;
    }

    /*=== If Vehicle Not Entered but NoOfVehicles is entered ===*/
    compVar.formData.Transport = (compVar.formData.Vehicles_id !== null) ? true : false;
    compVar.formData.AC = (compVar.formData.Transport) ? true : false;

  }

  //**********************************************************/
  const updateServiceDetails = async () => {
    if (compVar.formMode === 2) {
      const sql = "EXEC p_UpdateServicesInVouchers " + 
        compVar.formData.QuoServices_id.toString() + " ";
      const spData = {sql: sql};
      await dbExecuteSp(spData);
    }
  }

  //**********************************************************/
  const updateEmailString = async() => {

    if (compVar.formMode === 2) {  
      let sql = "EXEC p_Quo_UpdateSingleEmailString " + 
        props.quotations_id.toString() + ", " +
        compVar.formData.QuoServices_id.toString() + ", 4";
      let spData = {sql: sql};
      await dbExecuteSp(spData);
    }

  }

  //**********************************************************/
  const toggleFilter = async () => {
    compVar.serviceFilter = !compVar.serviceFilter;
    forceRender();
  }

  //**********************************************************/
  const deleteCityTransfers = (e) => {
    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = 'This will delete all transfers in the city. Are you sure?'; 
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const deleteCityTransfersProc = async(e) => {

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);
      forceRender();
  
      let sql = "DELETE FROM QuoServices " +
        "WHERE Quotations_id = " + props.quotations_id.toString() + " " +
        "AND QuoCities_id = " + props.quoCities_id.toString() + " " + 
        "AND Sightseeing = 0";
  
      let spData = {sql: sql};
      await dbExecuteSp(spData);
  
      await filterData();  

    }

  }

  //**********************************************************/
  const transferCostListing = () => {
    compVar.displayTransferCostList = true;
    forceRender();
  }

  //**********************************************************/
  const getSelectedTransferFromListing = async (e) => {
    compVar.displayTransferCostList = false;
    forceRender();
  }

  //**********************************************************/
  const buttonsJsx = (index) => {    

    const widths = [35];
    const heights = [35];
    const types = ['normal'];
    const stylingModes = ['outlined'];
    const icons = ['clear'];
    const hints = ['Delete all Transfers in City'];
    const clicks = [deleteCityTransfers];
    const disabledArr = [false];
    const texts = [null];

    const width = widths[index];
    const height = heights[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];
    const disabled = disabledArr[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        height={height}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        hint={hint}
        onClick={click}
        disabled={disabled}
        text={text}
      />
    );
  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    defaultDataObject.data = (compVar.serviceFilter) ? compVar.mainData.filter(rec => rec.QuoServices_id === props.quoServices_id) : compVar.mainData;

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

    const serviceLookup = (compVar.activeTransfersSwitchValue) ? compVar.serviceLookup.filter(rec => rec.active) : compVar.serviceLookup;
    compVar.dbLookup[1].dataSource = serviceLookup;        

    const vehicleLookup = (compVar.activeVehiclesSwitchValue) ? compVar.agentVehicleLookup.filter(rec => rec.active) : compVar.vehicleLookup;    
    compVar.dbLookup[4].dataSource = vehicleLookup;  

    // *** CASE SENSITIVE override formData properties
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearServiceLookupValues = {services_id: null, service: ''};
    const clearTransferTypeLookupValues = {transfertypes_id: null, transfer: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    
    const initialCityLookupValues = getLookupValues(
      clearCityLookupValues,compVar.cityLookup, 
      ['cities_id', 'city'], compVar.formData.Cities_id);

    const initialServiceLookupValues = getLookupValues (
      clearServiceLookupValues, serviceLookup, 
      ['services_id','service'], compVar.formData.Services_id);
  
    const initialTransferTypeLookupValues = getLookupValues (
      clearTransferTypeLookupValues, compVar.transferTypeLookup, 
        ['transfertypes_id','transfer'], compVar.formData.TransferTypes_id);
  
    const initialAgentLookupValues = getLookupValues(
      clearAgentLookupValues,compVar.agentLookup, 
      ['Addressbook_id', 'OrgCity'], compVar.formData.AgentAddressbook_id);
  
    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, vehicleLookup, 
        ['vehicles_id','vehicle'], compVar.formData.Vehicles_id);
          
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
      clearLookup: [clearCityLookup, clearServiceLookup, clearTransferTypeLookup, clearAgentLookup, clearVehicleLookup],
      getSelectedRecord: [getSelectedCity, getSelectedService, getSelectedTransferType, getSelectedAgent, getSelectedVehicle],
      initialLookupValues: [initialCityLookupValues, initialServiceLookupValues, initialTransferTypeLookupValues, initialAgentLookupValues, initialVehicleLookupValues],
      clearLookupValues: [clearCityLookupValues, clearServiceLookupValues, clearTransferTypeLookupValues, clearAgentLookupValues, clearVehicleLookupValues],
      activeTransfersSwitchValue: compVar.activeTransfersSwitchValue,
      activeTransferSwitchValueChanged: activeTransferSwitchValueChanged,
      activeVehiclesSwitchValue: compVar.activeVehiclesSwitchValue,
      activeVehiclesSwitchValueChanged: activeVehiclesSwitchValueChanged,
      transferCostListing: transferCostListing
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const filterButtonVisible = (compVar.mainData.length > 1 && props.transferFormType === 1);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: filterButtonVisible, options: {icon: "filter", onClick: toggleFilter, hint: 'Toggle filter on date / city'}},
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

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
            <div style={{display: 'flex', flex: 0.5, backgroundColor: HEADER_BACKGROUND_COLOR }}>            
              {buttonsJsx(0)}
            </div>
            <div style={{display: 'flex', flex: 1 }}>            
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div style={{display: 'flex', flex: 0.5, backgroundColor: HEADER_BACKGROUND_COLOR, height: '100%' }}>            
            </div>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {compVar.displayTransferCostList && compVar.formData.Cities_id !== null &&
            compVar.formData.ServiceDate !== null &&
            <div style={{height: 150}}>
              <PrestoCityTransferList
                services_id={compVar.formData.Services_id}
                serviceDate={convert_DbDate_To_DMY(compVar.formData.ServiceDate,1)}
                open={true}
                getSelectedService={getSelectedTransferFromListing}
              >
              </PrestoCityTransferList>
            </div>
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

export default PrestoTransfer;
