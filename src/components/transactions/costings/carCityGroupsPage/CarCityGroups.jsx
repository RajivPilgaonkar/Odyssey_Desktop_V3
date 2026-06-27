import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues, dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { convertDMY_MDY, convert_DbDate_To_DMY, convert_DbDate_To_MDY, getFieldsArray, beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, convertDMYtoDate, getEndOfFinancialYear, convertToMoment_fmt, getNowDate, dateDiff_DMY, convertMDY_DMY } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd } from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import { checkCarCgDatesOverLap, getAgentCgLabel, getGridHeight, filterActiveVehicles } from "../../../common/CostingHelpers";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import LinkForms from "../../../common/LinkForms";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetCarCityGroupsData";
import CarCityGroupsParams from './CarCityGroupsParams';
import PopupDialogBox from '../../../common/PopupDialogBox';
import {getAdmLevelLocation, getFromToPaxForVehicle, getAgentName} from "../../../common/GetDescFromIds";
import CopyCostings from '../copyCostingsPage/CopyCostings';
import {getNavButtonsJsx, navPrevRecordClick, navNextRecordClick, setStopNav} from "../../../common/NavigationHelpers";
import CostQuickEntry from "../CostQuickEntry";
import List from 'devextreme-react/list';
import { Tooltip } from 'devextreme-react/tooltip';
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function CarCityGroups() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [panelDataFetched, setPanelDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_agents_id = useSelector(state => state.params.carCgAgents_id) || -1;
  let _g_carHireGroups_id = useSelector(state => state.params.carCgCarHireGroups_id) || -1;
  let _g_wef = useSelector(state => state.params.carCgWef) || convert_DbDate_To_DMY (new Date(), 1);

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
      userLookup: [],  mainData: [],
      vehicleLookup: [], currencyLookup: [], vehicleActiveLookup: [], 
      routeData: [],
      tableName: 'CarHireGroupCosts', keyField: 'CarHireGroupCosts_id',
      masterDescField: '',
      agents_id: _g_agents_id, carHireGroups_id: _g_carHireGroups_id, wef: _g_wef,
      dateRange: '', carHireGroupCosts_id: -1, 
      route: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'City Groups', title: 'New City Groups',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 630,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, setStopNavigation],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      displayQuickCost: false, quickEntryData: [], quickEntryHeaderData:[],
      sqlTotal: '', auditString: '', 
      admLevel: 1, displayCopyCosting: false, 
      gridHeight: 100, 
      navigationButtonList: [
        {id: "formPrevButton", text: "", type: "normal", visible: true, icon: "chevronleft", onClick: navigatePrevRecordClick, hint: "Previous Voucher"},
        {id: "formNextButton", text: "", type: "normal", visible: true, icon: "chevronright", onClick: navigateNextRecordClick, hint: "Next Voucher"},
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: true, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ], 
      formChanged: false, saveLeaveOpen: false, afterSaveType: 0, 
      vehicleSwitchValue: true,
      dbLookup: [      
        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},
        
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
  // This should execute only when the agent changes ... get new routes
  useEffect (() => {

    getRoutesData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.agents_id]);
  
  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      //let query = 'SELECT DISTINCT ch.vehicles_id, v.vehicle, cha.Active FROM CarHireGroupCosts ch ' + 
      //  'LEFT JOIN CarHireAgents cha ON ch.Addressbook_id = cha.Addressbook_id AND ch.vehicles_id = cha.vehicles_id ' +
      //  'LEFT JOIN Vehicles v ON ch.Vehicles_id = v.Vehicles_id ' + 
      //  'WHERE ch.Addressbook_id = ' + compVar.agents_id.toString() + ' ' + 
      //  'ORDER BY v.vehicle';
      let query = 'SELECT DISTINCT cha.vehicles_id, v.vehicle, cha.Active ' +
        'FROM CarHireAgents cha ' +
        'LEFT JOIN vehicles v ON cha.vehicles_id = v.vehicles_id ' +
        'WHERE cha.Addressbook_id = ' + compVar.agents_id.toString() + ' ' + 
        'ORDER BY v.vehicle'; 
      // The same car could be repeated in this query as active & inactive ..
      // ... Give precedence to active
      const vehicleArr = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Entry Taxes'});    
      compVar.vehicleLookup = filterActiveVehicles(vehicleArr);
      //compVar.vehicleLookup = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Entry Taxes'});    
      compVar.dbLookup[0].dataSource = compVar.vehicleLookup;
  
      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Addressbook'}); 
      compVar.dbLookup[1].dataSource = compVar.currencyLookup;

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.dbLookup[2].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map((rec) => `ch.${rec}`);	
    fieldArray.push("RTRIM(LTRIM(CAST(CAST(ch.FromPax AS INT) AS VARCHAR(2)))) + ' to ' + LTRIM(RTRIM(CAST(CAST(ch.ToPax AS INT) AS VARCHAR(2)))) AS NumPax");
    fieldArray.push ('v.Vehicle');

    let condition = ' AND (1=2) ';
    try {

      if (compVar.wef !== undefined && compVar.wef !== null && compVar.wef.trim().length > 0) {
        const wef = convertDMY_MDY(compVar.wef); 
        condition = ` AND Wef = '${wef}'`;
      }

      const whereStr = `ch.Addressbook_id = ${compVar.agents_id.toString()} 
        AND ch.CarHireGroups_id = ${compVar.carHireGroups_id.toString()}
        ${condition} `;       

      const tableStr = 'CarHireGroupCosts ch LEFT JOIN Vehicles v ON ch.vehicles_id = v.vehicles_id ';
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['FromPax, ToPax'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Cost City Groups'});         
      if (compVar.mainData.length > 0) {
        compVar.carHireGroups_id = compVar.mainData[0].CarHireGroups_id;
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
    const title = await getAgentCgLabel(compVar.agents_id, compVar.carHireGroups_id, compVar.wef);
    compVar.formTitle = title;
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

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      Wef: (compVar.wef !== null && compVar.wef.trim().length > 0) ? convertDMYtoDate(compVar.wef) : convertDMYtoDate(getNowDate('DD/MM/YYYY')),
      Addressbook_id: compVar.agents_id,
      CarHireGroups_id: compVar.carHireGroups_id,
    }

    afterAdd(compVar, defaultObj);
    const title = await getAgentCgLabel(compVar.agents_id, compVar.carHireGroups_id, compVar.wef);
    compVar.formTitle = 'New ... ' + title;

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

    const wef = convert_DbDate_To_MDY(compVar.formData.Wef,1);

    let condition = "WHERE Addressbook_id = " + compVar.formData.Addressbook_id.toString() + " " + 
      "AND CarHireGroups_id = " + compVar.formData.CarHireGroups_id.toString() + " " +
      "AND Vehicles_id = " + compVar.formData.Vehicles_id.toString() + " " +
      "AND Wef = '" + wef + "' ";
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

    // only in navigation forms
    compVar.formChanged = false;

    // reset focused row
    compVar.focusedRowKey = saveData.formData[compVar.keyField];

    // Only for new records
    if (compVar.formMode === 1) {
      compVar.carHireGroupCosts_id = compVar.focusedRowKey;

      // In saveData, the wef will be of type string in MDY format
      if (convertMDY_DMY(saveData.formData['Wef']) !== compVar.wef) {
        compVar.toastIsVisible = true;
        compVar.toastMessage = "Please toggle the Wef DropDown for new dates";  
      }
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

    // form validation errors
    if (formData.FromPax > formData.ToPax) {
      return '"From Pax" cannot exceed "To Pax"';
    }

    // Check other errors here like is amount < 0, is date less than today ....        
    if (formData.Wef !== null) {
      const wef = convertToMoment_fmt(formData.Wef,'');
      const wet = convertToMoment_fmt(formData.Wet,'');
      if (wef > wet) {
        return '"Wef" cannot exceed "Wet"';
      }  
    }

    //Check Dates overlap
    const errorStr = await checkCarCgDatesOverLap(formData.CarHireGroupCosts_id, formData.Addressbook_id, formData.Vehicles_id, formData.CarHireGroups_id, formData.Wef, formData.Wet);
    if (errorStr > '') {
      return errorStr;
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
  const getRoutesData = async (e) => {

    const xDate1 = getNowDate('DD/MM/YYYY');
    const xDate2 = compVar.wef;

    let numYears = 1;
    if (xDate2 !== undefined && xDate2 !== null && xDate2.trim().length > 0) {
      numYears = dateDiff_DMY(xDate1, xDate2, 'years');
      numYears++;
    }
    numYears = (numYears <= 0) ? 1 : numYears;    
    numYears *= -1;

    const sql = "EXEC [p_CarCityGroupRoutes] " + 
      compVar.agents_id.toString() + ',' + numYears.toString();
  
    const spData = {sql: sql}

    const routeData = await dbExecuteSp(spData);

    setRoutesGrouping(routeData);

    forceRender();
  }

  //**********************************************************/
  const setRoutesGrouping = async (routeData) => {

    compVar.routeData = [];
     
    // get unique option numbers 
    const uniqueCitiesData = [...new Set(routeData.map(item => item.StartCity))]; 

    compVar.routeData = [];
    for (const rec of uniqueCitiesData) {
      let idx = compVar.routeData.findIndex(o => o.key === rec); 
      if (idx < 0) {
        compVar.routeData.push({key: rec, items: []});
        idx = compVar.routeData.length-1;
      }
      for (const rec2 of routeData.filter(o2 => o2.StartCity === rec)) {
        compVar.routeData[idx].items.push ({
          //key: rec2.key,
          text: rec2.CityRoute,
          carHireGroups_id: rec2.CarHireGroups_id,
          startCities_id: rec2.StartCities_id,
          startCity: rec2.StartCity
        })
      }
    }

  }

  //**********************************************************/
  const routeClick = async (e) => {

    compVar.route = e.itemData.text;
    
    // Save to redux store through params reducer
    dispatch(setParamValues({
      carCgCarHireGroups_id: e.itemData.carHireGroups_id,
    }));

  }

  //**********************************************************/
  const getSelectedVehicle = async (e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;

    // only in the add mode
    if (compVar.formMode === 1 && e[0].vehicles_id !== null) {
      const fromToObj = await getFromToPaxForVehicle(compVar.agents_id, null, e[0].vehicles_id);
      compVar.formData.FromPax = fromToObj.fromPax;
      compVar.formData.ToPax = fromToObj.toPax;
      forceRender();
    }

  }

  //**********************************************************/
  const getSelectedCurrency = (e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearVehicleLookup = () => {
    compVar.formData.Vehicles_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = () => {
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
        compVar.carHireGroupCosts_id = id;
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
  const quickCostEntry = async () => {

    const query = "SELECT ch.CarHireGroupCosts_id, v.Vehicle, " + 
      "COALESCE(ch.CostAc,0.0) AS CostAc, COALESCE(ch.CostNightHalt,0) AS CostNightHalt, " +
      "COALESCE(ch.TollTax,0.0) AS TollTax, COALESCE(ch.CostEscort,0.0) AS CostEscort, " +
      "COALESCE(ch.Commission,0.0) AS Commission " +
      "FROM CarHireGroupCosts ch LEFT JOIN Vehicles v ON ch.vehicles_id = v.vehicles_id " +
      "WHERE Addressbook_id = " + compVar.agents_id.toString() + " " +
      "AND CarHireGroups_id = " + compVar.carHireGroups_id.toString() + " " +
      "AND wef = '" + convertDMY_MDY(compVar.wef) + "' " +
      "ORDER BY ch.FromPax, ch.ToPax ";
    
    compVar.quickEntryData = await dbGetRecordRaw({query: query});

    compVar.quickEntryHeaderData = [
      {field: 'CarHireGroupCosts_id', caption: 'ID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'Vehicle', caption: 'Vehicle', allowEditing: false, width: 120, visible: true, dataType: 'string'},
      {field: 'CostAc', caption: 'Cost', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'CostNightHalt', caption: 'Night Halt', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'TollTax', caption: 'Toll Tax', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'CostEscort', caption: 'Escort', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'Commission', caption: 'Commission', allowEditing: true, width: 120, visible: true, dataType: 'number'},
    ];

    compVar.sqlTotal = "";
    compVar.auditString = " ModifiedByUsers_id = " + _g_users_id.toString() + ", " + 
      "ModifiedOn = '" + convert_DbDate_To_MDY() + "' ";

    compVar.displayQuickCost = true;
    forceRender();

  }

  //**********************************************************/
  const onQuickClose = async () => {
    compVar.displayQuickCost = false;
    await filterData();
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
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const getSelectedParams = async (e) => {

    const agentModified = (compVar.agents_id !== e.agents_id);

    compVar.agents_id = e.agents_id;
    compVar.carHireGroups_id = e.carHireGroups_id;
    compVar.wef = e.wef;
    compVar.dateRange = e.dateRange;    

    if (e.refresh) {
      if (agentModified) {
        await fetchInitialData();
      }
      await filterData();
    } 
  }


  //**********************************************************/
  const copyData = async () => {

    const idx = compVar.mainData.findIndex(rec => rec.CarHireGroupCosts_id === compVar.carHireGroupCosts_id);
    if (idx > -1) {

      const agentObj = await getAgentName(compVar.agents_id);
      let fromDate = convert_DbDate_To_DMY(compVar.mainData[idx].Wef, 1);
      let toDate = getEndOfFinancialYear(compVar.mainData[idx].Wef, 1);

      // Save to redux store through params reducer
      dispatch(setParamValues({
        costService: agentObj.Organisation + ',[Car City Group Cost]',
        costFromDate: fromDate,
        costToDate: toDate,
      }));

      compVar.displayCopyCosting = true;
      forceRender();
    }

  }

  //**********************************************************/
  const getSelectedCopyCostingOption = async(e) => {

    compVar.displayCopyCosting = false;
    // If data was copied, give toast message
    if (e.copiedData) {
      compVar.toastIsVisible = true;
      compVar.toastMessage = "Please toggle the Wef DropDown";
    }

    forceRender();      

  }

  //**********************************************************/
  const onActiveSwitchValueChanged = async (e) => {
    compVar.vehicleSwitchValue = e;
    forceRender();
  }

  //**********************************************************/
  const routeDataItemRender = (e) => {

    /*=== This calls 'routeDataOnHover' on MouseEnter and that renders so calls this again ===*/
    /*=== Before the render, an id is assigned to the hovered row ===*/
    /*=== This id is then used to assign the tooptip ===*/

    const id = (e.id !== undefined) ? e.id : null;
    compVar.routeHint = (id !== null) ? e.text : '';

    /*=== Set the id so that tooltip can be assigned to the hovered row ===*/
    return (
      <div id={id} onMouseEnter={() => routeDataOnHover(e)} style={{width: '100%', height: '100%'}}>
        {id !== null && toolTipJsx(0)}
        {e.text}
      </div>
    )

  }

  //**********************************************************/
  const routeDataOnHover = (e) => {

    const len = compVar.routeData.length;

    /*=== Go through all the groups and the items in each group, and set id to null ===*/
    for (let i=0; i<len; i++) {
      for (const rec of compVar.routeData[i].items) {
        rec.id = null;
      }  
    }

    /*=== In the grouped array, find where the text in the array matches with the hovered item text ===*/
    for (let i=0; i<len; i++) {
      const idx = compVar.routeData[i].items.findIndex(rec => rec.text === e.text);
      if (idx > -1) {
        /*=== Assign the id ===*/
        compVar.routeData[i].items[idx].id = "cglistitem";
        forceRender();
        break;
      }
    }

  }

  //**********************************************************/
  const toolTipJsx = (index) => {

    /*=== set the target with the id ===*/

    const targets = ['#cglistitem'];
    const showEvents = ['dxhoverstart'];
    const hideEvents = ['dxhoverend'];
    const hideOnOutsideClicks = [false];
    const captions = [compVar.routeHint];

    const target = targets[index];
    const showEvent = showEvents[index];
    const hideEvent = hideEvents[index];
    const hideOnOutsideClick = hideOnOutsideClicks[index];
    const caption = captions[index];

    return (
      <Tooltip
        target={target}
        showEvent={showEvent}
        hideEvent={hideEvent}
        hideOnOutsideClick={hideOnOutsideClick}
      >              
        <div>{caption}</div>
      </Tooltip>
    )

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const idx = compVar.mainData.findIndex(rec => rec.CarHireGroupCosts_id === compVar.carHireGroupCosts_id);
    compVar.carHireGroupCosts_id = (idx > -1) ? compVar.carHireGroupCosts_id : -1;

    compVar.gridHeight = (compVar.mainData.length > 0) ? getGridHeight(compVar.mainData.length) : 140;    

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    // In form, show vehicles (active or inactive), depending on switch
    const dbLookup = compVar.dbLookup.map(rec => Object.assign({}, rec));
    if (dbLookup.length > 0 && dbLookup[0].dataSource !== undefined) {
      dbLookup[0].dataSource = (!compVar.vehicleSwitchValue) ? dbLookup[0].dataSource : dbLookup[0].dataSource.filter(rec => rec.Active);
    }

    return {...defaultDataObject,
      dbLookup: dbLookup,
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

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    // *** CASE SENSITIVE override formData properties
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, compVar.vehicleLookup, 
        ['vehicles_id','vehicle'], compVar.formData.Vehicles_id);

    const initialCurrencyLookupValues = getLookupValues(
      clearCurrencyLookupValues,compVar.currencyLookup, 
        ['currencies_id', 'currencycode'], compVar.formData.Currencies_id);
    
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
      clearLookup: [clearVehicleLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedVehicle, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialVehicleLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearVehicleLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,
      onActiveSwitchValueChanged: onActiveSwitchValueChanged
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.agents_id !== null && compVar.agents_id > 0) ? true : false;
    const quickEntryVisible = (compVar.mainData.length > 1);
    const canCopy = (canAdd && compVar.mainData.length > 0);    

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: quickEntryVisible, options: {icon: "icons/quickEntry.png", onClick: quickCostEntry, hint: 'Quick Cost Entry'}},
        {visible: canCopy, options: {icon: "copy", onClick: copyData, hint: 'Copy Costing to next FY'}},
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

    const additionalPanelHeight = 40;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

    let dataObj = null;
    let formObj = null;
    let elementProps = null;  
    if (dataFetched) {
      dataObj = createDataObject(viewHeight);
      formObj = createFormObject();
      elementProps = createElementProps();  
    }

    const copyCostings = {
      id: compVar.carHireGroupCosts_id, open: compVar.displayCopyCosting,
      serviceType: 7,
      getSelectedCopyCostingOption: getSelectedCopyCostingOption
    }

    const maxHeight = (compVar.carHireGroupCosts_id !== undefined && compVar.carHireGroupCosts_id > 0) ? compVar.gridHeight : null;
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          <div style={{ width: '100%'}}>
            <CarCityGroupsParams
              getSelectedParams={getSelectedParams}          
              onPanelLoad={onPanelLoad}
            />
          </div>

          {panelDataFetched && (!initDataFetched || !dataFetched) &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          <div style={{display: 'flex', flexDirection: 'row'}}>

            <div className="carCityGroups_routes" style={{flex: 1, height: viewHeight+30}}>
              {/*List background color set in CarCityGroups.css*/}
              <List
                dataSource={compVar.routeData}
                keyExpr="key"
                onItemClick={routeClick}
                grouped={true}
                collapsibleGroups={true}
                itemRender={routeDataItemRender}           
                hoverStateEnabled={true}
                onItemHover={routeDataOnHover}
              />
            </div>

            <div style={{flex: 3}}>
              {!editPopupVisible && dataFetched &&
                <>
                  <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

                    <div className="master-grid-params-container">
                      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <LinkForms hideElem={[6]}/>
                      </div>
                    </div>        

                    <div style={{flex: 2}}>
                      <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
                    </div>

                    <div className="master-grid-params-container">
                    </div>

                  </div>                

                  <div style={{height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {compVar.route}
                  </div>

                  <div className="master-grid-content-box" style={{maxHeight: maxHeight-20}}>
                    {(compVar.errorMsg > '') &&
                      popupTitle(formObj, popupTitleContainerStyle)
                    }
                    {getDevExtremeTable(dataObj, true)}
                  </div>

                </>
              }              
            </div>

          </div>

          {!editPopupVisible && dataFetched &&
            toast(formObj, toastContainerStyle, {})
          }          

          {editPopupVisible && dataFetched && getDevExtremePopupForm(formObj,dataObj,compVar)}

          {compVar.displayQuickCost &&
            <CostQuickEntry
              data={compVar.quickEntryData}
              headerData={compVar.quickEntryHeaderData}
              tableName={'CarHireGroupCosts'}
              keyField={'CarHireGroupCosts_id'}
              sqlTotal={compVar.sqlTotal}
              auditString={compVar.auditString}
              onClose={onQuickClose}
            />            
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

          {compVar.displayCopyCosting &&
            <div>
              <CopyCostings {...copyCostings} ></CopyCostings>
            </div>
          }        

        </div>

      </>

    );

  }


  return (
    renderContent()
  )


};

export default CarCityGroups;
