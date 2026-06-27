import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../actions';
import { convertMDY_DMY, convertDMY_MDY, convert_DbDate_To_MDY, addMonth, addDay, beforeInsert, saveEditedInsertedData, checkNullErrors, convertToMoment_fmt, getFieldsArray, setDateTimeFormat, getLookupValues } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterAdd, afterEdit} from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { getAgentServicesListing } from "../../../common/GetOrgListing";
import { getSectorFromCities } from "../../../common/GetDescFromIds";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import { getDevExtremeTable, tableHeaderArray, getDevExtremePopupForm } from "./GetElementsCarHireData";
import PopupDialogBox from '../../../common/PopupDialogBox';
import LinkForms from "../../../common/LinkForms";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import CostQuickEntry from "../../../common/CostQuickEntry";
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function ElementsCarHire(props) {

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
      fromCityLookup: [], toCityLookup: [], agentLookup: [], currencyLookup: [], 
      wef: props.wef, elementType: props.elementType, elementLabel: props.elementLabel,
      tableName: 'ElemCars', keyField: 'ElemCars_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Car Per Km', title: 'New Car Per Km',
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

      compVar.fromCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.fromCityLookup;  

      compVar.toCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[1].dataSource = compVar.toCityLookup;  
  
      compVar.agentLookup = await getAgentServicesListing('1', false);
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
    fieldArray = fieldArray.map((rec) => `ec.${rec}`);    
    fieldArray.push ('s2.State');
    fieldArray.push ('c.City');

    try {

      let whereStr = `ec.Wef >= '${fromDate}' AND ec.Wef <= '${toDate}'`;
      if (props.quoted) {
        whereStr += ' AND Quoted = 1 ';
      }

      const tableStr = "ElemCars ec " + 
        "LEFT JOIN Addressbook a ON ec.Addressbook_id = a.Addressbook_id " +
        "LEFT JOIN Cities c ON ec.FromCities_id = c.Cities_id " +
        "LEFT JOIN States s2 ON c.States_id = s2.States_id ";
  
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['c.city,s2.state'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Elements Car Hire'});   

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
    //compVar.roomTypeLookup = await getRoomTypesForHotel(compVar.formData.Addressbook_id, props.wef);
    //compVar.dbLookup[1].dataSource = compVar.roomTypeLookup;  

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

    let condition = "WHERE Addressbook_id = " + compVar.formData.Addressbook_id + " "  +
      "AND Wef = '" + wef + "' " + 
      "AND FromCities_id = " + compVar.formData.FromCities_id + " " + 
      "AND ToCities_id = " + compVar.formData.ToCities_id + " "; 
    condition += (compVar.formMode === 2) ? "AND ElemCars_id <> " + compVar.formData.ElemCars_id: "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: _g_users_id,
        ModifiedOn: convert_DbDate_To_MDY(),
        ServiceCities_id: compVar.formData.FromCities_id
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

    const fromDate = convertToMoment_fmt(formData.Wef,'');
    const toDate = convertToMoment_fmt(formData.Wet,'');
    const wef = convertToMoment_fmt(props.wef,'DD/MM/YYYY');
    const wet = convertToMoment_fmt(addMonth(wef, 12, 2),'DD/MM/YYYY');

    // To Date can be null
    if (formData.Wet !== null) {
      if (fromDate > toDate) {
        return '"From Date" cannot exceed "To Date"';
      }  
    }

    if (fromDate < wef) {
      return '"From Date" cannot be less than ' + props.wef;
    }  

    if (toDate > wet) {
      return '"To Date" cannot exceed ' + addMonth(wef, 12, 2);
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
    compVar.formData.FromCities_id = e[0].cities_id;
    compVar.formData.Sector = await getSectorFromCities(compVar.formData.FromCities_id, compVar.formData.ToCities_id);
    forceRender();
  }

  //**********************************************************/
  const getSelectedToCity = async(e) => {
    compVar.formData.ToCities_id = e[0].cities_id;
    compVar.formData.Sector = await getSectorFromCities(compVar.formData.FromCities_id, compVar.formData.ToCities_id);
    forceRender();
  }

  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.Addressbook_id = e[0].Addressbook_id;
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
  const clearFromCityLookup = async() => {
    compVar.formData.FromCities_id = null;
  }

  //**********************************************************/
  const clearToCityLookup = async() => {
    compVar.formData.ToCities_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async(e) => {
    compVar.formData.Addressbook_id = null;
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

    // set to all room types in edit view (when edit form closes)
    //compVar.roomTypeLookup = [...compVar.roomTypeAllLookup];   
    //compVar.dbLookup[1].dataSource = compVar.roomTypeLookup;  

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

    let sql = "UPDATE ElemCars SET Quoted = " + quoted + " " +
      "WHERE ElemCars_id = " + e.ElemCars_id.toString();      
    let spData = {sql: sql}
    await dbExecuteSp(spData);

    await filterData();
  }


  //**********************************************************/
  const quickCostEntry = async () => {

    const query = "SELECT ec.ElemCarsCosts_id,  " + 
      "ec.NumPax, ec.Cost, v.Vehicle " +
      "FROM ElemCarsCosts ec " +
      "LEFT JOIN Vehicles v ON ec.Vehicles_id = v.Vehicles_id " +
      "WHERE ec.ElemCars_id = " + compVar.focusedRowKey.toString() + " " +
      "ORDER BY ec.NumPax ";
    
    compVar.quickEntryData = await dbGetRecordRaw({query: query});

    compVar.quickEntryHeaderData = [
      {field: 'ElemCarsCosts_id', caption: 'ID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'NumPax', caption: 'Num Pax', allowEditing: false, width: 100, visible: true, dataType: 'number'},
      {field: 'Vehicle', caption: 'Vehicle', allowEditing: false, width: 200, visible: true, dataType: 'string'},
      {field: 'Cost', caption: 'Cost', allowEditing: true, width: 100, visible: true, dataType: 'number'},
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
  const elementOneToTenCosts = async () => {

    let sql = "EXEC [p_ElemCarsFillZeroCost] " + compVar.focusedRowKey.toString() + ", 1";
    let spData = {sql: sql}
    await dbExecuteSp(spData);

  }

  //**********************************************************/
  const elementDeleteOneToTenCosts = async (elemCars_id) => {

    let sql = "DELETE FROM ElemCarsCosts WHERE ElemCars_id = " + 
      elemCars_id.toString();
    let spData = {sql: sql}
    await dbExecuteSp(spData);

  }

  //**********************************************************/
  const setVisibleInForm = (field, obj) => {

    const propParts = obj.prop.split('.');    

    // change form appearance based on auto entered or manual
    const idx = tableHeaderArray.findIndex(rec => rec[obj.compareField] === field);
    if (idx >= 0) {
      if (propParts.length === 1)
        tableHeaderArray[idx][propParts[0]] = (obj.var) ? obj.value1 : obj.value2;      
      if (propParts.length === 2)
        tableHeaderArray[idx][propParts[0]][propParts[1]] = (obj.var) ? obj.value1 : obj.value2;            
    }

  }

  //**********************************************************/
  const changeFormAppearance = () => {

    // if object not yet assigned
    if ((compVar === undefined) || (Object.keys(compVar).length === 0) ||
        (Object.keys(compVar.formData).length === 0)) {
      return;
    }

    const isAutoFilled = (compVar.formData.QuotationRef !== null) && (compVar.formData.QuotationRef.trim() > '') ? true : false;

    // change form appearance based on auto entered or manual
    setVisibleInForm('FromCities_id',{compareField: 'field', prop: 'visibleInForm', var: isAutoFilled, value1: false, value2: true});
    setVisibleInForm('ToCities_id',{compareField: 'field', prop: 'visibleInForm', var: isAutoFilled, value1: false, value2: true});
    setVisibleInForm('EmptyItem500',{compareField: 'label', prop: 'groupNo', var: isAutoFilled, value1: 500, value2: 0});
    setVisibleInForm('PaxName',{compareField: 'field', prop: 'editorOptions.readOnly', var: isAutoFilled, value1: true, value2: false});

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
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.fromCityLookup, 
      ['cities_id','city'], compVar.formData.FromCities_id);

    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.toCityLookup, 
      ['cities_id','city'], compVar.formData.ToCities_id);

    const initialAgentLookupValues = getLookupValues (
      clearAgentLookupValues, compVar.agentLookup, 
      ['Addressbook_id','OrgCity'], compVar.formData.Addressbook_id);
    
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
      clearLookup: [clearFromCityLookup, clearToCityLookup , clearAgentLookup, clearCurrencyLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedFromCity, getSelectedToCity, getSelectedAgent, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues, initialAgentLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues, clearAgentLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
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

    changeFormAppearance(); 
    
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
              tableName={'ElemCarsCosts'}
              keyField={'ElemCarsCosts_id'}
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

export default ElementsCarHire;
