import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../actions';
import { convertMDY_DMY, convertDMY_MDY, convert_DbDate_To_MDY, addMonth, addDay, beforeInsert, saveEditedInsertedData, checkNullErrors, convertToMoment_fmt, getFieldsArray, setDateTimeFormat, getLookupValues, convert_DbDate_To_DMY } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterAdd, afterEdit} from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { getAgentListing } from "../../../common/GetOrgListing";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import { getDevExtremeTable, tableHeaderArray, getDevExtremePopupForm } from "./GetElementsTransferData";
import PopupDialogBox from '../../../common/PopupDialogBox';
import LinkForms from "../../../common/LinkForms";
import {getAdmLevelLocation, getAgentIdsForServices, getExchRate} from "../../../common/GetDescFromIds";
import CostQuickEntry from "../../../common/CostQuickEntry";
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function ElementsTransfer(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
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
      mainData: [], userLookup: [],
      serviceCityLookup: [], agentLookup: [], agentAllLookup: [], serviceLookup: [], serviceAllLookup: [], currencyLookup: [], 
      wef: props.wef, elementType: props.elementType, elementLabel: props.elementLabel,
      tableName: 'ElemServices', keyField: 'ElemServices_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Transfer', title: 'New Transfer',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Setup', index: 0},{title: 'Addn. Details', index: 1},{title: 'Contacts', index: 2},{title: 'Categories', index: 3},{title: 'Search Tags', index: 4},{title: 'Hotel Info', index: 5}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 670,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: true, displayHeaderFilter: true,
      toastIsVisible: false, toastMessage: '',
      displayQuickCost: false, quickEntryData: [], quickEntryHeaderData:[],
      admLevel: 1, counter: 0, saveLeaveOpen: false,
      formDisplayType: 1, addressbookDetailsModified: false,
      isHotel: false,
      dbLookup: [       

        {keyField: 'cities_id', dataSource: compVar.serviceCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'services_id', dataSource: compVar.serviceLookup, 
        displayExpr: 'service', valueExpr: 'services_id', fieldList: ['service']},

        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity', 'City']},

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
  // This should execute only when the editing popup opens (edit/insert)
  useEffect (() => {

    getSelectedParams()

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [editPopupVisible]);


  //**********************************************************/
  // This should execute only when the filterDate params change
  useEffect (() => {
    
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.wef, props.quoted]);  

  //**********************************************************/
  // This should execute only when the filterDate params change
  useEffect (() => {

    if (props.counter > 0) {
      displayRefreshToggleMsg();
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.counter]);  

  //**********************************************************/
  const fetchInitialData = async() => {

    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      let whereStr = 'cities_id IN (SELECT s.cities_id FROM services s WHERE s.transfer = 1)';
      compVar.serviceCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr, x_uid: _g_users_id, x_module: 'Addressbook'});   
      compVar.dbLookup[0].dataSource = compVar.serviceCityLookup;

      whereStr = 'transfer = 1';
      compVar.serviceAllLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id, addressbook_id'], orders: ['[service]'], table: '[services]', where: whereStr});
      compVar.serviceLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id, addressbook_id'], orders: ['[service]'], table: '[services]', where: whereStr});
      compVar.dbLookup[1].dataSource = compVar.serviceLookup;  

      compVar.agentAllLookup = await getAgentListing('4',false);   
      compVar.agentLookup = await getAgentListing('4',false);   
      compVar.dbLookup[2].dataSource = compVar.agentLookup;  

      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
      compVar.dbLookup[3].dataSource = compVar.currencyLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
      compVar.dbLookup[4].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);

  }
  

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const fromDate = convertDMY_MDY(props.wef);
    const toDate = convertDMY_MDY(addDay(addMonth(props.wef, 12, 2),-1,2));

    let fieldArray = getFieldsArray(tableHeaderArray);
    // this is done since the query to retrieve data is a join
    // prefix table alias to each field
    fieldArray = fieldArray.map((rec) => `es.${rec}`);    
    fieldArray.push ('s.[Description] AS Service');
    fieldArray.push ('s2.State');
    fieldArray.push ('c.City');
    fieldArray.push ('s.cities_id AS ServiceCities_id');

    try {

      let whereStr = `es.Wef >= '${fromDate}' AND es.Wef <= '${toDate}' 
        AND Sightseeing = 0`;
      if (props.quoted) {
        whereStr += ' AND Quoted = 1 ';
      }

      const tableStr = "ElemServices es " + 
        "LEFT JOIN Addressbook a ON es.AgentAddressbook_id = a.Addressbook_id " +
        "LEFT JOIN Services s ON es.Services_id = s.Services_id " +
        "LEFT JOIN Cities c ON s.Cities_id = c.Cities_id " +
        "LEFT JOIN States s2 ON c.States_id = s2.States_id ";

      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['c.city,s2.state'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Elements Services'});   

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
  const displayRefreshToggleMsg = async() => {
    compVar.toastMessage = 'Please toggle to see the latest wef dates';
    compVar.toastIsVisible = true;
    forceRender();
  }

  //**********************************************************/
  const editRow = async (e) => {
    afterEdit(compVar, e);

    // get services only for the selected city
    compVar.serviceLookup = compVar.serviceAllLookup.filter(rec => rec.cities_id === compVar.formData.ServiceCities_id);
    compVar.dbLookup[1].dataSource = compVar.serviceLookup;  

    // Get agents for the service
    const agentsArr = await getAgentIdsForServices(compVar.formData.Services_id);
    compVar.agentLookup = compVar.agentAllLookup.filter(rec => agentsArr.includes(rec.Addressbook_id));
    compVar.dbLookup[2].dataSource = compVar.agentLookup;  

    //const title = await getHotelLabel(compVar.formData.Addressbook_id, compVar.formData.FromDate);
    //compVar.formTitle = title;
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
      Wef: convertMDY_DMY(convert_DbDate_To_MDY(props.wef,1)),
      Sightseeing: false,
    }

    afterAdd(compVar, defaultObj);
    compVar.formTitle = compVar.title;

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      //{table: 'ElemServicesCosts', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Element Services Costings. Delete that first'},
    ]);    

    if (error.errorMsg === '') {
      compVar.dialogMessage1 = 'Are you sure you want to delete this record & the corresponding 1-10 costs?';
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

    compVar.saveLeaveOpen = true;

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

    let condition = "WHERE AgentAddressbook_id = " + compVar.formData.AgentAddressbook_id + " "  +
      "AND Wef = '" + wef + "' " + 
      "AND Services_id = " + compVar.formData.Services_id + " " + 
      "AND Currencies_id = " + compVar.formData.Currencies_id + " "; 
    condition += (compVar.formMode === 2) ? "AND ElemServices_id <> " + compVar.formData.ElemServices_id: "";

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

    // update the 1-10 costs
    await elementOneToTenCosts();
    // Just a dummy to force the one to ten costs to refresh
    compVar.counter++;

    compVar.formData = {...saveData.formData}; 
    compVar.formOldData = {...saveData.formData};
    if (compVar.formMode === 1)
      compVar.formMode = 2;

    // refresh data after save
    await filterData();
  
  }

  //**********************************************************/
  const checkFormErrors = async (formData) => {

    // required data errors
    const checkNullError = await checkNullErrors(tableHeaderArray, formData);
    if (checkNullError.errorNo === -1) {
      return checkNullError.errorDesc;
    }

    // form validation errors

    const fromDate = convertToMoment_fmt(formData.FromDate,'');
    const wef = convertToMoment_fmt(props.wef,'DD/MM/YYYY');

    if (fromDate < wef) {
      return '"From Date" cannot be less than ' + props.wef;
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
    await filterData();

  }

  //**********************************************************/
  const getSelectedServiceCity = async(e) => {
    compVar.formData.ServiceCities_id = e[0].cities_id;

    // Get services for the city
    compVar.serviceLookup = compVar.serviceAllLookup.filter(rec => rec.cities_id === compVar.formData.ServiceCities_id);
    compVar.dbLookup[1].dataSource = compVar.serviceLookup;  

    forceRender();      
  }

  //**********************************************************/
  const getSelectedService = async(e) => {
    compVar.formData.Services_id = e[0].services_id;

    // Get services for the city
    const agentsArr = await getAgentIdsForServices(compVar.formData.Services_id);
    compVar.agentLookup = compVar.agentAllLookup.filter(rec => agentsArr.includes(rec.Addressbook_id));
    compVar.dbLookup[2].dataSource = compVar.agentLookup;  

    forceRender();      
  }

  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.AgentAddressbook_id = e[0].Addressbook_id;
  }

  //**********************************************************/
  const getSelectedCurrency = async(e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedUser = async(e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearServiceCityLookup = async(e) => {
    compVar.formData.ServiceCities_id = null;
  }

  //**********************************************************/
  const clearServiceLookup = async(e) => {
    compVar.formData.Services_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async() => {
    compVar.formData.AgentAddressbook_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = async(e) => {
    compVar.formData.Currencies_id = null;
  }

  //**********************************************************/
  const clearUserLookup = async() => {
    compVar.formData.ModifiedByUsers_id = null;
  }

  //**********************************************************/
  const getSelectedParams = async() => {
    if (props.getActivitySelectedParams !== undefined) {
      await props.getActivitySelectedParams({inEditMode: editPopupVisible});
    }
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.errorMsg = '';

    // get services only for the selected city
    compVar.serviceLookup = [...compVar.serviceAllLookup];
    compVar.dbLookup[1].dataSource = compVar.serviceLookup;  

    // Get agents for the service
    compVar.agentLookup = [...compVar.agentAllLookup];
    compVar.dbLookup[2].dataSource = compVar.agentLookup;  

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
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.Quoted) {
        e.rowElement.style.color = 'green'; 
        e.rowElement.title = 'This is the quoted cost';
        e.rowElement.style.fontWeight = 500; 
      } 
    }
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
  const onContextMenuPreparing = async(e) => {

    if (e.target === 'content') {
  
      if (!e.items) e.items = []; 

      let caption = [];

      if (e.row.data.Quoted !== true) {
        caption.push({text: "Set As Quoted", action: async () => {setAsQuoted(e.row.data)}, display: true});
      } else {
        caption.push({text: "Set As Not Quoted", action: async () => {setAsQuoted(e.row.data)}, display: true});
      }

      for (const rec of caption) {
        e.items.push({
          text: rec.text,
          onItemClick: async () => {
            await rec.action();
            forceRender();            
          }
        }); 
      }
          
    }

  }

  //**********************************************************/
  const setAsQuoted = async (e) => {
    const quoted = (e.Quoted === true) ? '0' : '1';

    let sql = "UPDATE ElemServices SET Quoted = " + quoted + " " +
      "WHERE ElemServices_id = " + e.ElemServices_id.toString();      
    let spData = {sql: sql}
    await dbExecuteSp(spData);

    await filterData();
  }

  //**********************************************************/
  const quickCostEntry = async () => {

    const query = "SELECT es.ElemServicesCosts_id, v.Vehicle, " + 
      "es.NumPax, es.TransportCost, es.MiscCost, es.GuideCost, es.EntranceFees " +
      "FROM ElemServicesCosts es " +
      "LEFT JOIN Vehicles v ON es.Vehicles_id = v.Vehicles_id " +
      "WHERE es.ElemServices_id = " + compVar.focusedRowKey.toString() + " " +
      "ORDER BY es.NumPax ";
    
    compVar.quickEntryData = await dbGetRecordRaw({query: query});

    compVar.quickEntryHeaderData = [
      {field: 'ElemServicesCosts_id', caption: 'ID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'NumPax', caption: 'Num Pax', allowEditing: false, width: 100, visible: true, dataType: 'number'},
      {field: 'Vehicle', caption: 'Vehicle', allowEditing: false, width: 150, visible: true, dataType: 'string'},
      {field: 'TransportCost', caption: 'Transport', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'MiscCost', caption: 'Misc', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'GuideCost', caption: 'Guide', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'EntranceFees', caption: 'Entrance', allowEditing: true, width: 100, visible: true, dataType: 'number'},
    ];

    compVar.sqlTotal = "UPDATE ElemServicesCosts SET Cost = COALESCE(TransportCost,0) + COALESCE(MiscCost,0) + COALESCE(GuideCost,0) + COALESCE(EntranceFees,0) ";

    compVar.auditString = " ModifiedByUsers_id = " + _g_users_id.toString() + ", " + 
      "ModifiedOn = '" + convert_DbDate_To_MDY() + "' ";

    const idx = compVar.mainData.findIndex(rec => rec.ElemServices_id === compVar.focusedRowKey);  
    compVar.title = (idx > -1) ? compVar.mainData[idx].Service : '';

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
  const elementOneToTenCosts = async () => {

    const wef = convert_DbDate_To_DMY(compVar.formData.Wef, 1);
    const exchRate = await getExchRate(compVar.formData.Currencies_id, wef);

    let sql = "EXEC [p_ElemSightFillCost] " + compVar.focusedRowKey.toString() + ", 1, " +
      compVar.formData.Currencies_id.toString() + ", " + exchRate.toString();

    let spData = {sql: sql}
    await dbExecuteSp(spData);

  }

  //**********************************************************/
  const elementDeleteOneToTenCosts = async (elemServices_id) => {

    let sql = "DELETE FROM ElemServicesCosts WHERE ElemServices_id = " + 
      elemServices_id.toString();
    let spData = {sql: sql}
    await dbExecuteSp(spData);

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
      onRowPrepared: onRowPrepared,
      onContextMenuPreparing: onContextMenuPreparing, /*=== Right click menu ===*/
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearServiceCityLookupValues = {cities_id: null, city: ''};
    const clearServiceLookupValues = {services_id: null, service: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialServiceCityLookupValues = getLookupValues (
      clearServiceCityLookupValues, compVar.serviceCityLookup, 
      ['cities_id','city'], compVar.formData.ServiceCities_id);
    
    const initialServiceLookupValues = getLookupValues (
      clearServiceLookupValues, compVar.serviceLookup, 
      ['services_id','service'], compVar.formData.Services_id);

    const initialAgentLookupValues = getLookupValues (
      clearAgentLookupValues, compVar.agentLookup, 
      ['Addressbook_id','OrgCity'], compVar.formData.AgentAddressbook_id);
    
    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, compVar.currencyLookup, 
      ['currencies_id','currencycode'], compVar.formData.Currencies_id);
      
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues, compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

    return {...defaultFormObject,
      visible: false,
      onHiding: closePopup,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      formHelp: formHelp,
      clearLookup: [clearServiceCityLookup, clearServiceLookup , clearAgentLookup, clearCurrencyLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedServiceCity, getSelectedService, getSelectedAgent, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialServiceCityLookupValues, initialServiceLookupValues, initialAgentLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearServiceCityLookupValues, clearServiceLookupValues, clearAgentLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
      quickCostEntry: quickCostEntry
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const quickEntryVisible = (compVar.mainData.length > 1);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: false, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: quickEntryVisible, options: {icon: "icons/quickEntry.png", onClick: quickCostEntry, hint: 'Quick Cost Entry'}},
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
      await elementDeleteOneToTenCosts(compVar.focusedRowKey);
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
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          {(!initDataFetched || !dataFetched) &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {initDataFetched && dataFetched && !editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

              <div className="master-grid-params-container">
                <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <LinkForms hideElem={[6]}/>
                </div>
                <div style={{flex: 2}}>
                  <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
                </div>
                <div style={{flex: 1}}>
                </div>
              </div>        

            </div>          
      
          }

          {initDataFetched && dataFetched && !editPopupVisible &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
              {toast(formObj, toastContainerStyle, {})}
            </div>
          }

          {editPopupVisible && dataFetched && getDevExtremePopupForm(formObj,dataObj,compVar)}

          {initDataFetched && dataFetched && popupDialogBoxVisible && 
            <PopupDialogBox
              open={true}
              message1={compVar.dialogMessage1}
              message2={compVar.dialogMessage2}
              getSelectedOption={compVar.popupSelectedOptions[compVar.popupDialogIndex]}
            >
            </PopupDialogBox>
          }

          {compVar.displayQuickCost &&
            <CostQuickEntry
              data={compVar.quickEntryData}
              headerData={compVar.quickEntryHeaderData}
              tableName={'ElemServicesCosts'}
              keyField={'ElemServicesCosts_id'}
              sqlTotal={compVar.sqlTotal}
              auditString={compVar.auditString}
              title={compVar.title}
              onClose={onQuickClose}
            />            
          }


        </div>

      </>

    );

  }


  return (
    renderContent()
  )


};

export default ElementsTransfer;
