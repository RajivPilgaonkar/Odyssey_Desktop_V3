import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, setDateTimeFormat, convertToMoment_fmt, getNowDate, convert_DbDate_To_DMY, convertDMYtoDate, convertMDY_Hm_toDate, isValidTime } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetVoucherTransportDetailsData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getTransportVoucherDescription} from "../../../../common/VoucherHelpers";
import {getAdmLevelLocation, getAgentName, getVoucherDetails, getVoucherYearRef} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';

import '../../../../common/MasterGrid.css'

let compVar = {};

function VoucherTransportDetails(props) {

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
      fromCityLookup: [], toCityLookup: [], vehicleLookup: [], driveTypeLookup: [], 
      carHireGroupLookup: [], 
      tableName: 'VouchersTransport', keyField: 'VouchersTransport_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Transport Vouchers', title: 'New Transport Vouchers',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 630,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      updateMode: 0, voucherServiceCities_id: null,
      admLevel: 1,
      dbLookup: [       

        {keyField: 'cities_id', dataSource: compVar.fromCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'cities_id', dataSource: compVar.toCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

        {keyField: 'DriveTypes_id', dataSource: compVar.driveTypeLookup, 
        displayExpr: 'DriveType', valueExpr: 'DriveTypes_id', fieldList: ['DriveType']},

        {keyField: 'CarHireGroups_id', dataSource: compVar.carHireGroupLookup, 
        displayExpr: 'CarHireGroup', valueExpr: 'CarHireGroups_id', fieldList: ['CarHireGroup']},

      ]
    }   
        
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

      compVar.fromCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.fromCityLookup;  

      compVar.toCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[1].dataSource = compVar.toCityLookup;  
  
      let whereStr = 'vehicles_id IN ' + 
        '(SELECT vehicles_id FROM carhireagents ' + 
        'WHERE addressbook_id = ' + props.agents_id.toString() + ' )';
      compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles', where: whereStr});    
      compVar.dbLookup[2].dataSource = compVar.vehicleLookup;  

      compVar.driveTypeLookup = await dbGetRecord({fields: ["DriveTypes_id, DriveType"], orders: ['DriveTypes_id'], table: 'DriveTypes'});
      compVar.dbLookup[3].dataSource = compVar.driveTypeLookup;  

      whereStr = 'DefaultAgents_id = ' + props.agents_id.toString();
      compVar.carHireGroupLookup = await dbGetRecord({fields: ['CarHireGroups_id', 'CarHireGroup'], orders: ['CarHireGroup'], table: 'CarHireGroups', where: whereStr});    
      compVar.dbLookup[4].dataSource = compVar.carHireGroupLookup;  
  
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
    fieldArray.push("CONVERT(varchar(5),fromtime,108) AS FromTimeStr");
    fieldArray.push("CONVERT(varchar(5),totime,108) AS ToTimeStr");

    try {
      const whereStr = "vouchers_id = " + props.vouchers_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['vouchers_id'], table: 'voucherstransport', where: whereStr, x_uid: _g_users_id, x_module: 'Voucher Transport'});   

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

    // Remove any previous error messages
    compVar.errorMsg = '';

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }

    const fromTime = convert_DbDate_To_MDY(compVar.formData.FromTime,1) + ' ' + compVar.formData.FromTimeStr;
    compVar.formData.FromTime = convertMDY_Hm_toDate(fromTime);

    const toTime = convert_DbDate_To_MDY(compVar.formData.ToTime,1) + ' ' + compVar.formData.ToTimeStr;
    compVar.formData.ToTime = convertMDY_Hm_toDate(toTime);

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

    if (! isValidTime(formData.FromTimeStr)) {
      return "Invalid 'From Time' entered";
    }

    if (! isValidTime(formData.ToTimeStr)) {
      return "Invalid 'To Time' entered";
    }

    // Check other errors here like is amount < 0, is date less than today ....
    const fromDateTime = convertToMoment_fmt(formData.FromDate,'');
    const toDateTime = convertToMoment_fmt(formData.ToDate,'');

    if (fromDateTime > toDateTime) {
      return "'From Date/Time' cannot exceed 'To Date/Time'";
    }

    if (formData.NoOfVehicles <= 0) {
      return "Please enter the number of vehicles";
    }

    // If drive type is 'city groups', then the Car Hire Group must be selected
    if ((formData.DriveTypes_id === 3) && (formData.CarHireGroups_id === null)) {
      return "If Drive Type is 'City Groups', then the 'City Group' must be specified";
    }

    const voucherDateYearRef = await getVoucherYearRef(convertDMYtoDate(convert_DbDate_To_DMY(props.voucherDate,1)));
    const departureYearRef = await getVoucherYearRef(convertDMYtoDate(convert_DbDate_To_DMY(formData.FromDate,1)));
  
    if (voucherDateYearRef !== departureYearRef) {
      return "Cannot change the 'From Date' to a different year reference";
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
  const getSelectedFromCity = async (e) => {
    compVar.formData.From_Cities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedToCity = async (e) => {
    compVar.formData.To_Cities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedVehicle = async(e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;
  }

  //**********************************************************/
  const getSelectedDriveType = async(e) => {
    compVar.formData.DriveTypes_id = e[0].DriveTypes_id;
  }

  //**********************************************************/
  const getSelectedCarHireGroup = async (e) => {
    compVar.formData.CarHireGroups_id = e[0].CarHireGroups_id;
  }

  //**********************************************************/
  const clearFromCityLookup = async (e) => {
    compVar.formData.From_Cities_id = null;
  }

  //**********************************************************/
  const clearToCityLookup = async (e) => {
    compVar.formData.To_Cities_id = null;
  }

  //**********************************************************/
  const clearVehicleLookup = async(e) => {
    compVar.formData.Vehicles_id = null;
  }

  //**********************************************************/
  const clearDriveTypeLookup = async(e) => {
    compVar.formData.DriveTypes_id = null;
  }

  //**********************************************************/
  const clearCarHireGroupLookup = async (e) => {
    compVar.formData.CarHireGroups_id = null;
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
        mode: compVar.updateMode, descr: compVar.descr, 
        voucherDate: compVar.voucherDate, 
        voucherServiceCities_id: compVar.voucherServiceCities_id
      });
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

    let descr = await getTransportVoucherDescription(props.vouchers_id);
    descr = descr.replace(/'/g, "''");

    const fromDate = convert_DbDate_To_MDY(compVar.formData.FromDate, 1);

    const sql = "UPDATE vouchers SET description = '" + descr + "', " +    
      "voucherdate = '" + fromDate + "', " + 
      "VoucherServiceCities_id = " + compVar.formData.From_Cities_id.toString() + ", " +
      "modified = 1, " + 
      "ModifiedByUsers_id = " + _g_users_id.toString() + ", " +
      "ModifiedOn = '" + getNowDate('MM/DD/YYYY') + "' " +
      "WHERE vouchers_id = " + props.vouchers_id.toString() + " ";

    const spData = {sql: sql}
    await dbExecuteSp(spData);
    
    compVar.descr = descr;
    compVar.voucherDate = convert_DbDate_To_DMY(compVar.formData.FromDate, 1);
    compVar.voucherServiceCities_id = compVar.formData.From_Cities_id;

  };  


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
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    const clearDriveTypeLookupValues = {DriveTypes_id: null, DriveType: ''};
    const clearCarHireGroupLookupValues = {CarHireGroups_id: null, CarHireGroup: ''};

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.fromCityLookup, 
          ['cities_id','city'], compVar.formData.From_Cities_id);
      
    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.toCityLookup, 
          ['cities_id','city'], compVar.formData.To_Cities_id);

    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, compVar.vehicleLookup, 
          ['vehicles_id','vehicle'], compVar.formData.Vehicles_id);
      
    const initialDriveTypeLookupValues = getLookupValues (
      clearDriveTypeLookupValues, compVar.driveTypeLookup, 
          ['DriveTypes_id','DriveType'], compVar.formData.DriveTypes_id);            
        
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
      clearLookup: [clearFromCityLookup, clearToCityLookup, clearVehicleLookup, clearDriveTypeLookup, clearCarHireGroupLookup],
      getSelectedRecord: [getSelectedFromCity, getSelectedToCity, getSelectedVehicle, getSelectedDriveType, getSelectedCarHireGroup],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues, initialVehicleLookupValues, initialDriveTypeLookupValues, initialCarHireGroupLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues, clearVehicleLookupValues, clearDriveTypeLookupValues, clearCarHireGroupLookupValues ],
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

export default VoucherTransportDetails;
