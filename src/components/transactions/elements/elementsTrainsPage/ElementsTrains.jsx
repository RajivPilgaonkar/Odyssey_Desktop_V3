import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../actions';
import { convertMDY_DMY, convertDMY_MDY, convert_DbDate_To_MDY, addMonth, addDay, beforeInsert, saveEditedInsertedData, checkNullErrors, convertToMoment_fmt, getFieldsArray, setDateTimeFormat, getLookupValues } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterAdd, afterEdit} from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import { getDevExtremeTable, tableHeaderArray, getDevExtremePopupForm } from "./GetElementsTrainsData";
import PopupDialogBox from '../../../common/PopupDialogBox';
import LinkForms from "../../../common/LinkForms";
import {getAdmLevelLocation, getSectorFromCities, getTrainDetails} from "../../../common/GetDescFromIds";
import CostQuickEntry from "../../../common/CostQuickEntry";
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function ElementsTrains(props) {

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
      fromCityLookup: [], toCityLookup: [], fromStationLookup: [], toStationLookup: [], currencyLookup: [], 
      wef: props.wef, elementType: props.elementType, elementLabel: props.elementLabel,
      tableName: 'ElemTickets', keyField: 'ElemTickets_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Trains', title: 'New Train',
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

        {keyField: 'cities_id', dataSource: compVar.fromCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'cities_id', dataSource: compVar.toCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'trainstations_id', dataSource: compVar.fromStationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},

        {keyField: 'trainstations_id', dataSource: compVar.toStationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},

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

  }, [props.wef, props.quoted, props.counter]);  

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

      compVar.fromCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.fromCityLookup;  

      compVar.toCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[1].dataSource = compVar.toCityLookup;  

      compVar.fromStationLookup = await dbGetRecord({fields: ['trainstations_id', 'station', 'cities_id'], orders: ['COALESCE(DefaultOrder,100)'], table: 'trainstations'});   
      compVar.dbLookup[2].dataSource = compVar.fromStationLookup;  

      compVar.toStationLookup = await dbGetRecord({fields: ['trainstations_id', 'station', 'cities_id'], orders: ['COALESCE(DefaultOrder,100)'], table: 'trainstations'});   
      compVar.dbLookup[3].dataSource = compVar.toStationLookup;    
      
      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
      compVar.dbLookup[4].dataSource = compVar.currencyLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
      compVar.dbLookup[5].dataSource = compVar.userLookup;  
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
    fieldArray = fieldArray.map((rec) => `ec.${rec}`);    
    fieldArray.push ('c.City AS FromCity');
    fieldArray.push ('c2.City AS ToCity');
    fieldArray.push ('s2.State');
    fieldArray.push ('c.City');
    fieldArray.push ('dbo.f_DaysToStr (t.DayOfOperation) AS DaysOfOperation');
    fieldArray.push ('t.TrainName');
    fieldArray.push ("CASE WHEN ec.Overnight = 0 THEN 'Day' ELSE 'Overnight' END AS TrainType");        

    try {

      let whereStr = `ec.Tickets_id = 2 AND ec.Wef >=  '${fromDate}'  
        AND ec.Wef <= '${toDate}' `;

      if (props.quoted) {
        whereStr += ' AND Quoted = 1 ';
      }

      const tableStr = "ElemTickets ec " + 
        "LEFT JOIN Trains t ON ec.Trains_id = t.Trains_id " +
        "LEFT JOIN Class cl ON ec.Class_id = cl.Class_id " +
        "LEFT JOIN Cities c ON ec.From_Cities_id = c.Cities_id " +
        "LEFT JOIN Cities c2 ON ec.To_Cities_id = c2.Cities_id " +
        "LEFT JOIN States s2 ON c.States_id = s2.States_id ";

      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['c.city,s2.state'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Elements Trains'});   

      // the train no in the database is not declared as a varchar....so it has trailing spaces
      // ... trim off the trailing spaces
      compVar.mainData = compVar.mainData.map(rec => {return {...rec, TrainNo: rec.TrainNo.trim()}});   

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
    
    // get room types only for the hotel
    compVar.formTitle = await getSectorFromCities(compVar.formData.From_Cities_id, compVar.formData.To_Cities_id);

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
      Wet: convertDMY_MDY(addDay(addMonth(props.wef, 12, 2),-1,2))
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
      //{table: 'ElemAccommodationCosts', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Element Acc Costings. Delete that first'},
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

    const wef = convert_DbDate_To_MDY(compVar.formData.FromDate,1);

    let condition = "WHERE TrainNo = '" + compVar.formData.TrainNo.trim() + "' "  +
      "AND Wef = '" + wef + "' " + 
      "AND From_Cities_id = " + compVar.formData.From_Cities_id.toString() + ' ' + 
      "AND Currencies_id = " + compVar.formData.To_Cities_id.toString() + " ";

    condition += (compVar.formMode === 2) ? "AND ElemTickets_id <> " + compVar.formData.ElemTickets_id: "";

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

    compVar.formData = {...saveData.formData}; 
    compVar.formOldData = {...saveData.formData};

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

    //const fromDate = convertToMoment_fmt(formData.FromDate,'');
    const fromDate = convertToMoment_fmt(formData.Wef,'');
    //const toDate = convertToMoment_fmt(formData.Wef,'');
    const wef = convertToMoment_fmt(props.wef,'DD/MM/YYYY');
    //const wet = convertToMoment_fmt(addMonth(wef, 12, 2),'DD/MM/YYYY');

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
  const getSelectedFromCity = async(e) => {
    compVar.formData.From_Cities_id = e[0].cities_id;
    await setTrainDetails();

    forceRender();
  }

  //**********************************************************/
  const getSelectedToCity = async(e) => {
    compVar.formData.To_Cities_id = e[0].cities_id;
    await setTrainDetails();

    forceRender();
  }

  //**********************************************************/
  const getSelectedFromStation = async(e) => {
    compVar.formData.From_TrainStations_id = e[0].trainstations_id;
  }

  //**********************************************************/
  const getSelectedToStation = async(e) => {
    compVar.formData.To_TrainStations_id = e[0].trainstations_id;
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
  const clearFromCityLookup = async(e) => {
    compVar.formData.From_Cities_id = e[0].trainstations_id;
  }

  //**********************************************************/
  const clearToCityLookup = async(e) => {
    compVar.formData.To_Cities_id = e[0].trainstations_id;
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
  const setTrainDetails = async() => {
    const trainsObj = await getTrainDetails(compVar.formData.TrainNo, 
      compVar.wef, compVar.formData.From_Cities_id, compVar.formData.To_Cities_id);
    if (trainsObj.trains_id !== null) {
      compVar.formData.Trains_id = trainsObj.trains_id;
      compVar.formData.TrainName = trainsObj.trainName;
      compVar.formData.DaysOfOperation = trainsObj.daysOfOperation;  
      compVar.formData.Timings = trainsObj.trainTimings;  
      compVar.formData.Overnight = trainsObj.overnight;  
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
    compVar.tabIndex = 0;  

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
  const onTabOptionChanged = (e) => {
    if ((e.addedItems !== undefined) && (e.addedItems.length > 0)) {
      const selectedTab = e.addedItems[0].title;
      let obj = compVar.tabs.find(o => o.title === selectedTab);
      let selectedTabIndex = obj.index;
      compVar.tabIndex = selectedTabIndex;  
    }
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
  const onFormFieldDataChanged = () => {
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

    let sql = "UPDATE ElemTickets SET Quoted = " + quoted + " " +
      "WHERE ElemTickets_id = " + e.ElemTickets_id.toString();      
    let spData = {sql: sql}
    await dbExecuteSp(spData);

    await filterData();
  }


  //**********************************************************/
  const quickCostEntry = async () => {

    const wef = convertDMY_MDY(props.wef);

    const query = "SELECT et.ElemTickets_id,  " + 
      "c1.City AS FromCity, c1.City AS ToCity, et.TrainNo,  " +
      "et.ac_cc_cost, et.ac_2t_cost, et.ac_3t_cost, et.ac_ecc_cost, et.ac_1a_cost " +
      "FROM ElemTickets et " +
      "LEFT JOIN Cities c1 ON et.From_Cities_id = c1.Cities_id " +
      "LEFT JOIN Cities c2 ON et.To_Cities_id = c2.Cities_id " +
      "WHERE et.wef = '" + wef + "' " +
      "ORDER BY c1.City, c2.City ";
    
    compVar.quickEntryData = await dbGetRecordRaw({query: query});

    compVar.quickEntryHeaderData = [
      {field: 'ElemTickets_id', caption: 'ID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'FromCity', caption: 'From', allowEditing: false, width: 100, visible: true, dataType: 'string'},
      {field: 'ToCity', caption: 'To', allowEditing: false, width: 100, visible: true, dataType: 'string'},
      {field: 'TrainNo', caption: 'Train', allowEditing: false, width: 100, visible: true, dataType: 'string', allowFilter: true},
      {field: 'ac_1a_cost', caption: '1A', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'ac_2t_cost', caption: '2T', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'ac_3t_cost', caption: '3T', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'ac_cc_cost', caption: 'CC', allowEditing: true, width: 100, visible: true, dataType: 'number'},
      {field: 'ac_ecc_cost', caption: 'ECC', allowEditing: true, width: 100, visible: true, dataType: 'number'},
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

    // same pattern as PrestoTravel.js's createFormObject: filter once here and
    // feed the SAME filtered array to both the dropdown's dataSource and the
    // getLookupValues() call below, so the displayed station always matches
    // an entry in the list the dropdown is actually bound to
    const fromStationLookup = compVar.fromStationLookup.filter(rec => rec.cities_id === compVar.formData.From_Cities_id);
    compVar.dbLookup[2].dataSource = fromStationLookup;

    const toStationLookup = compVar.toStationLookup.filter(rec => rec.cities_id === compVar.formData.To_Cities_id);
    compVar.dbLookup[3].dataSource = toStationLookup;

    // *** CASE SENSITIVE override formData properties
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearFromStationLookupValues = {trainstations_id: null, station: ''};
    const clearToStationLookupValues = {trainstations_id: null, station: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.fromCityLookup,
      ['cities_id','city'], compVar.formData.From_Cities_id);

    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.toCityLookup,
      ['cities_id','city'], compVar.formData.To_Cities_id);

    const initialFromStationLookupValues = getLookupValues (
      clearFromStationLookupValues, fromStationLookup,
      ['trainstations_id','station'], compVar.formData.From_TrainStations_id);

    const initialToStationLookupValues = getLookupValues (
      clearToStationLookupValues, toStationLookup,
      ['trainstations_id','station'], compVar.formData.To_TrainStations_id);
                  
    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, compVar.currencyLookup, 
      ['currencies_id','currencycode'], compVar.formData.Currencies_id);
      
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
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
      clearLookup: [clearFromCityLookup, clearToCityLookup, clearFromStationLookup, clearToStationLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedFromCity, getSelectedToCity, getSelectedFromStation, getSelectedToStation, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues, initialFromStationLookupValues, initialToStationLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues, clearFromStationLookupValues, clearToStationLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
      onTabOptionChanged: onTabOptionChanged,
      tabIndex: compVar.tabIndex,
      quickCostEntry: quickCostEntry      
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const quickEntryVisible = (compVar.mainData.length > 1);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
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
                <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                </div>
                <div style={{flex: 2}}>
                  <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
                </div>
                <div style={{flex: 2}}>
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
              tableName={'ElemTickets'}
              keyField={'ElemTickets_id'}
              sqlTotal={compVar.sqlTotal}
              auditString={compVar.auditString}
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

export default ElementsTrains;
