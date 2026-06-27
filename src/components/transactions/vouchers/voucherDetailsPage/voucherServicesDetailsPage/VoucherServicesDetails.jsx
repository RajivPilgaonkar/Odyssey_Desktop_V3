import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, setDateTimeFormat, getNowDate, convertMDY_Hm_toDate, convertMDY_toDate, isValidTime } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetVoucherServicesDetailsData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getServiceVoucherDescription} from "../../../../common/VoucherHelpers";
import {getAdmLevelLocation, getAgentName, getVoucherDetails, getServicesForAgent} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';

import '../../../../common/MasterGrid.css'

let compVar = {};

function VoucherServiceDetails(props) {

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
      userLookup: [],  mainData: [],
      servicesLookup: [], transferTypeLookup: [], ticketLookup: [], vehicleLookup: [], 
      tableName: 'VouchersServices', keyField: 'VouchersServices_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Service Vouchers', title: 'New Service Vouchers',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 630,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      updateMode: 0, sightseeing: false,
      admLevel: 1,
      dbLookup: [       

        {keyField: 'services_id', dataSource: compVar.servicesLookup, 
        displayExpr: 'description', valueExpr: 'services_id', fieldList: ['description']},

        {keyField: 'transfertypes_id', dataSource: compVar.transferTypeLookup, 
        displayExpr: 'transfer', valueExpr: 'transfertypes_id', fieldList: ['transfer']},

        {keyField: 'tickets_id', dataSource: compVar.ticketLookup, 
        displayExpr: 'details', valueExpr: 'tickets_id', fieldList: ['details']},

        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

      ]
    }   
        
    // Here filterData relies on the data of fetchInitialData, so call it async in fetchInitialData
    fetchInitialData();
    //filterData();

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

      compVar.serviceLookup = await getServicesForAgent(props.agents_id, props.serviceCities_id, false);
      compVar.dbLookup[0].dataSource = compVar.serviceLookup;  

      let whereStr = 'transfertypes_id <> 0';
      compVar.transferTypeLookup = await dbGetRecord({fields: ['transfertypes_id', 'transfer'], orders: ['transfertypes_id'], table: 'transfertypes', where: whereStr}); 
      compVar.dbLookup[1].dataSource = compVar.transferTypeLookup;  
  
      whereStr = 'tickets_id > 0';
      compVar.ticketLookup = await dbGetRecord({fields: ["tickets_id, details"], orders: ['tickets_id'], table: 'tickets', where: whereStr });   
      compVar.dbLookup[2].dataSource = compVar.ticketLookup;  

      whereStr = 'vehicles_id IN ' + 
        '(SELECT vehicles_id FROM carhireagents ' + 
        'WHERE addressbook_id = ' + props.agents_id.toString() + ')';
      compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles', where: whereStr});    
      compVar.dbLookup[3].dataSource = compVar.vehicleLookup;  

      /*=== Insert a record in case one does not already exist ===*/
      const sql = "EXEC [p_InsertVoucherDetails] " + props.vouchers_id.toString();
      const spData = {sql: sql};
      await dbExecuteSp(spData);

      await filterData();

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray.push("CONVERT(varchar(5),timing,108) AS TransferTime");
    fieldArray.push("CONVERT(varchar(5),FlightDepTime,108) AS FlightTime");
    fieldArray.push("CONVERT(varchar(5),timing,108) AS TransferTime");
    
    try {
      const whereStr = "vouchers_id = " + props.vouchers_id.toString();
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['vouchers_id'], table: 'vouchersservices', where: whereStr, x_uid: _g_users_id, x_module: 'Voucher Services'});   
      if (compVar.mainData.length > 0) {
        compVar.sightseeing = compVar.mainData[0].Sightseeing;
      }

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      const agentObj = await getAgentName(props.agents_id);
      const voucherObj = await getVoucherDetails(props.vouchers_id);
      compVar.formTitle = voucherObj[0].mastertourcode + ' -- ' + agentObj.Organisation;
  
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

    // Directly move to Edit, Mimic as if clicked on grid... so you write e.row.data
    await editRow({row: {data: compVar.mainData[0]}});
  }

  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);

    /*=== yearRef based on voucher date ===*/
    const voucherObj = await getVoucherDetails(props.vouchers_id);
  
    /*=== Add the invisible fields before saving ===*/
    compVar.formData.Addressbook_id = voucherObj[0].addressbook_id;
    compVar.formData.MasterTourCode = voucherObj[0].mastertourcode;
    compVar.formData.MasterTourDate = voucherObj[0].mastertourdate;

    toggleEditPopup();    

  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {
  }

  //**********************************************************/
  const saveFormData = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // Saving depending on sightseeing / transfer
    await beforeSaveForm();

    // Remove any previous error messages
    compVar.errorMsg = '';

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }

    let timing = convert_DbDate_To_MDY(props.voucherDate,1) + ' ' + compVar.formData.TransferTime;
    compVar.formData.Timing = convertMDY_Hm_toDate(timing);

    timing = convert_DbDate_To_MDY(props.voucherDate,1);
    compVar.formData.TransferDate = convertMDY_toDate(timing);

    if (!compVar.sightseeing) {
      const flightTiming = convert_DbDate_To_MDY(compVar.formData.FlightDepTime,1) + ' ' + compVar.formData.FlightTime;
      compVar.formData.FlightDepTime = convertMDY_Hm_toDate(flightTiming);  
    }

    let tmpFormData = {...compVar.formData};

    // Always save
    let condition = "WHERE 1=2 ";

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

    // Flag as edited... Important for descr to change in previous screen
    compVar.updateMode = 1;
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    // reset focused row
    //compVar.focusedRowKey = saveData.formData[compVar.keyField];

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

    if (! isValidTime(formData.TransferTime)) {
      return "Invalid service time entered";
    }

    if (!compVar.sightseeing && !isValidTime(formData.FlightTime)) {
      return "Invalid flight time entered";
    }

    if (compVar.formData.Vehicles_id === null && compVar.formData.NoOfVehicles > 0) {
      return "Please choose the vehicle if number of vehicles > 0";
    }

    if (compVar.formData.Vehicles_id !== null && (compVar.formData.NoOfVehicles === 0 || compVar.formData.NoOfVehicles === null)) {
      return "Please enter the number of vehicles, if a vehicle is chosen";
    }
        
    return '';

  }

  //**********************************************************/
  const afterPost = async() => {

    if ((compVar.formMode === 1) || (compVar.formMode === 2)) {
      await updateVoucherDescription();
      await closePopup();
    }

  }

  //**********************************************************/
  const beforeSaveForm = async () => {
    compVar.formData.Sightseeing = compVar.sightseeing;

    if ((compVar.formData.Vehicles_id !== null) || (compVar.formData.NoOfVehicles !== null && compVar.formData.NoOfVehicles > 0)) {
      compVar.formData.Transport = true;
      compVar.formData.Ac = true;
    } else {
      compVar.formData.Transport = false;
      compVar.formData.Ac = false;
    }

  }

  //**********************************************************/
  const changeFormBehaviour = async () => {

    // these fields are mandatory for transfers and not for sightseeing
    const fields = ['FlightDepTime','FlightTime'];
    for (let field of fields) {
      const idx = tableHeaderArray.findIndex(rec => rec.field === field);
      if (idx > -1) {
        tableHeaderArray[idx].required = (!compVar.sightseeing);
      }
    }  

    // change the labels depending upon sightseeing / transfer
    const idx = tableHeaderArray.findIndex(rec => rec.field === 'TransferTime');
    if (idx > -1) {
      tableHeaderArray[idx].label = (compVar.sightseeing) ? 'Sightseeing At' : 'Transfer At';
    }

  }


  //**********************************************************/
  const getSelectedService = async (e) => {
    compVar.formData.Services_id = e[0].services_id;
    if (!compVar.formData.Sightseeing) {
      compVar.formData.TransferTypes_id = e[0].transfertypes_id;
    }
  }

  //**********************************************************/
  const getSelectedTransferType = async (e) => {
    compVar.formData.TransferTypes_id = e[0].transfertypes_id;
  }

  //**********************************************************/
  const getSelectedTicket = async(e) => {
    compVar.formData.Tickets_id = e[0].tickets_id;
  }

  //**********************************************************/
  const getSelectedVehicle = async(e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;
  }

  //**********************************************************/
  const clearServiceLookup = async (e) => {
    compVar.formData.Services_id = null;
  }

  //**********************************************************/
  const clearTransferTypeLookup = async (e) => {
    compVar.formData.TransferTypes_id = null;
  }

  //**********************************************************/
  const clearTicketLookup = async(e) => {
    compVar.formData.Tickets_id = null;
  }

  //**********************************************************/
  const clearVehicleLookup = async(e) => {
    compVar.formData.Vehicles_id = null;
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.errorMsg = '';

    /*=== callback to handle description update ===*/
    if (props.onClose !== undefined) {
      props.onClose({open: false, refresh: false, 
        mode: compVar.updateMode, descr: compVar.descr});
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
  const updateVoucherDescription = async () => {

    let descr = await getServiceVoucherDescription(props.vouchers_id);
    descr = descr.replace(/'/g, "''");

    const sql = "UPDATE vouchers SET description = '" + descr + "', " +    
      "Modified = 1, " + 
      "ModifiedByUsers_id = " + _g_users_id.toString() + ", " +
      "ModifiedOn = '" + getNowDate('MM/DD/YYYY') + "' " +
      "WHERE vouchers_id = " + props.vouchers_id.toString() + " ";

    const spData = {sql: sql}
    await dbExecuteSp(spData);
    
    compVar.descr = descr;

  };  

  //**********************************************************/
  const onTransferCkbChange = (e) => {
    compVar.sightseeing = e;
    compVar.formData.Sightseeing = e;
    compVar.formOldData.Sightseeing = e;
    forceRender();
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

    // change for behaviour depending on Transfer / Sightseeing
    changeFormBehaviour();

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // rec.transfer comes back from SQL as 0/1, not a boolean, so cast both
    // sides before comparing or the strict !== never excludes anything
    const servicesLookup = compVar.serviceLookup.filter(rec => Boolean(rec.transfer) !== Boolean(compVar.sightseeing));

    // the dropdown reads from dbLookup[0].dataSource, not from servicesLookup
    // directly, so it must be kept in sync with the current toggle state
    compVar.dbLookup[0].dataSource = servicesLookup;

    // *** CASE SENSITIVE override formData properties
    const clearServiceLookupValues = {services_id: null, description: ''};
    const clearTransferTypeLookupValues = {transfertypes_id: null, transfer: ''};
    const clearTicketLookupValues = {tickets_id: null, details: ''};
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};

    const initialServiceLookupValues = getLookupValues (
      clearServiceLookupValues, servicesLookup, 
      ['services_id','description'], compVar.formData.Services_id);

    const initialTransferTypeLookupValues = getLookupValues (
      clearTransferTypeLookupValues, compVar.transferTypeLookup, 
      ['transfertypes_id','transfer'], compVar.formData.TransferTypes_id);

    const initialTicketLookupValues = getLookupValues (
      clearTicketLookupValues, compVar.ticketLookup, 
      ['tickets_id','details'], compVar.formData.Tickets_id);
  
    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, compVar.vehicleLookup, 
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
      clearLookup: [clearServiceLookup, clearTransferTypeLookup, clearTicketLookup, clearVehicleLookup],
      getSelectedRecord: [getSelectedService, getSelectedTransferType, getSelectedTicket, getSelectedVehicle],
      initialLookupValues: [initialServiceLookupValues, initialTransferTypeLookupValues, initialTicketLookupValues, initialVehicleLookupValues],
      clearLookupValues: [clearServiceLookupValues, clearTransferTypeLookupValues, clearTicketLookupValues, clearVehicleLookupValues],
      onTransferCkbChange: onTransferCkbChange
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

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj,compVar)}

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

export default VoucherServiceDetails;
