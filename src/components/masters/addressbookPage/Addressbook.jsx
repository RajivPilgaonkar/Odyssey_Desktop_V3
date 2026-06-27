import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Switch from "react-switch";
import { dbGetRecord, dbDeleteRecord } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, escapeSingleQuotes } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetAddressbookData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle, toast } from "../../common/HelperComponents";
import {popupTitleContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";
import { getAgentSubCatListing } from "../../common/GetOrgListing";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation, getDataForCity, isHotel, getAgentName, getHotelRankingString} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';

import '../../common/MasterGrid.css'

let compVar = {};

function Addressbook(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [activeOrg, setActiveOrg] = useState(true);
  const [coded, setCoded] = useState(true);
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
      categoryLookup: [], cityLookup: [], stateLookup: [],
      countryLookup: [], currencyLookup: [], 
      agentLookup: [], paymentTermsLookup: [],
      contacts: [], subCategories: [], services: [], searchTags: [],
      tableName: 'Addressbook', keyField: 'Addressbook_id',
      masterDescField: 'Organisation',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Organisation', title: 'New Organisation',
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
      admLevel: 1,
      formDisplayType: 1, addressbookDetailsModified: false,
      isHotel: false,
      dbLookup: [       

        {keyField: 'countries_id', dataSource: compVar.countryLookup, 
        displayExpr: 'country', valueExpr: 'countries_id', fieldList: ['country']},

        {keyField: 'ContactCategories_id', dataSource: compVar.categoryLookup, 
        displayExpr: 'ContactCategory', valueExpr: 'ContactCategories_id', fieldList: ['ContactCategory']},

        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'states_id', dataSource: compVar.stateLookup, 
        displayExpr: 'state', valueExpr: 'states_id', fieldList: ['state']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'VendorPaymentTerms_id', dataSource: compVar.paymentTermsLookup, 
        displayExpr: 'VendorPaymentTerm', valueExpr: 'VendorPaymentTerms_id', fieldList: ['VendorPaymentTerm']},

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
  // This should execute only when the active flag / coded changes
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [activeOrg, coded]);

  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.countryLookup = await dbGetRecord({fields: ['countries_id', 'country'], orders: ['country'], table: 'countries', x_uid: _g_users_id, x_module: 'Currencies'});   
      compVar.dbLookup[0].dataSource = compVar.countryLookup;

      compVar.categoryLookup = await dbGetRecord({fields: ['ContactCategories_id', 'ContactCategory'], orders: ['OrderNo'], table: 'ContactCategories', x_uid: _g_users_id, x_module: 'Addressbook'});   
      compVar.dbLookup[1].dataSource = compVar.categoryLookup;

      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', x_uid: _g_users_id, x_module: 'Addressbook'});   
      compVar.dbLookup[2].dataSource = compVar.cityLookup;

      compVar.stateLookup = await dbGetRecord({fields: ['states_id', 'state'], orders: ['state'], table: 'states', x_uid: _g_users_id, x_module: 'Car Hire Default Per Km'});   
      compVar.dbLookup[3].dataSource = compVar.stateLookup;

      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Addressbook'}); 
      compVar.dbLookup[4].dataSource = compVar.currencyLookup;

      compVar.agentLookup = await getAgentSubCatListing('11', true); 
      compVar.dbLookup[5].dataSource = compVar.agentLookup;

      compVar.paymentTermsLookup = await dbGetRecord({fields: ['VendorPaymentTerms_id', 'VendorPaymentTerm'], orders: ['OrderNo'], table: 'VendorPaymentTerms', x_uid: _g_users_id, x_module: 'Addressbook'});   
      compVar.dbLookup[6].dataSource = compVar.paymentTermsLookup;
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Cities'});   
      compVar.dbLookup[7].dataSource = compVar.userLookup;    
    } catch(err) {
      alert(err);
    }
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const active = activeOrg ? 1 : 0;
    let activeStr = (activeOrg) ? "Active = " + active.toString() : "(1=1)";

    activeStr += (coded) ? " AND ContactCategories_id IS NOT NULL " : " AND ContactCategories_id IS NULL";

    let fieldArray = getFieldsArray(tableHeaderArray);

    // Add calculated field
    fieldArray.push("'' AS Contacts");
    fieldArray.push("'' AS SubCategories");
    fieldArray.push("'' AS Services");
    fieldArray.push("'' AS SearchTags");

    const tableStr = 'Addressbook ';
    
    let whereStr = activeStr;
    try {
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['organisation'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Addressbook'});   
    } catch(err) {
      alert(err);
    }    

    compVar.contacts = await dbGetRecord({fields: ["addressbook_id, COALESCE(firstname,'') + ' ' + COALESCE(lastname,'') as name"], orders: ['OrderNo'], table: 'AddressDetails', x_uid: _g_users_id, x_module: 'Addressbook'});
    compVar.subCategories = await dbGetRecord({fields: ["ads.addressbook_id, ads.ContactSubCategories_id, sc.ContactSubCategory"], orders: ['OrderNo'], table: 'AddressbookSubcategories ads LEFT JOIN ContactSubCategories sc ON ads.ContactSubCategories_id = sc.ContactSubCategories_id'});   
    compVar.services = await dbGetRecord({fields: ["acs.addressbook_id, acs.AddressbookServices_id, as1.AddressbookService"], orders: ['OrderNo'], table: 'AddressbookCategoryServices acs LEFT JOIN AddressbookServices as1 ON acs.AddressbookServices_id = as1.AddressbookServices_id'});   
    compVar.searchTags = await dbGetRecord({fields: ["ast.addressbook_id, ast.SearchTags_id, st.SearchTag"], orders: ['OrderNo'], table: 'AddressbookSearchTags ast LEFT JOIN SearchTags st ON ast.SearchTags_id = st.SearchTags_id'});   

    // Contacts
    compVar.mainData.forEach((rec) => {
      let filteredContacts = compVar.contacts.filter((array) => array.addressbook_id === rec.Addressbook_id);
      rec.Contacts = filteredContacts.map(array => array.name).join(", ");      
    });  

    // SubCategories
    compVar.mainData.forEach((rec) => {
      let filteredContacts = compVar.subCategories.filter((array) => array.addressbook_id === rec.Addressbook_id);
      rec.SubCategories = filteredContacts.map(array => array.ContactSubCategory).join(", ");      
    });  

    // Services
    compVar.mainData.forEach((rec) => {
      let filteredContacts = compVar.services.filter((array) => array.addressbook_id === rec.Addressbook_id);
      rec.Services = filteredContacts.map(array => array.AddressbookService).join(", ");      
    });  

    // Search Tags
    compVar.mainData.forEach((rec) => {
      let filteredContacts = compVar.searchTags.filter((array) => array.addressbook_id === rec.Addressbook_id);
      rec.SearchTags = filteredContacts.map(array => array.SearchTag).join(", ");      
    });  


    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {

    // reset to modified = false
    compVar.addressbookDetailsModified = false;

    afterEdit(compVar, e);
    compVar.isHotel = await isHotel(compVar.formData.Addressbook_id);
    const agentObj = await getAgentName(compVar.formData.Addressbook_id);    
    compVar.formTitle = agentObj.Organisation;
    const rankingObj = await getHotelRankingString(compVar.formData.Addressbook_id);
    compVar.formTitle += (rankingObj.rankingStr.trim().length > 0) ? ' -- Ranking -- ' + rankingObj.rankingStr : '';
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
      {table: 'addressdetails', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Contacts. Delete the contacts first'},
      {table: 'AddressbookCategoryServices', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Services. Delete the services first'},
      {table: 'AddressbookSubcategories', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Sub-categories. Delete the sub-categories first'},
      {table: 'AddressbookSearchTags', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Search Tags. Delete the search tags first'},
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

    // check duplicate
    let condition = ' WHERE (1=2) '; // will return false for duplicate record in non-categorized mode
    if ((coded) && (compVar.formData.ContactCategories_id > 0)) {
      condition = "WHERE organisation = '" + escapeSingleQuotes(compVar.formData.Organisation) + "' ";  
      if (compVar.formData.Cities_id !== null) {
        condition += " AND cities_id = " + compVar.formData.Cities_id.toString() + " ";
      }
      condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : "";
    }

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

    // refresh data after save
    await filterData();

    compVar.formData = {...saveData.formData}; 
    compVar.formOldData = {...saveData.formData};

    if (compVar.formMode === 1) {
      compVar.toastIsVisible = true;
      compVar.toastMessage = "Please enter the contacts / sub-caterories / services";
      forceRender();
    }
  
  }

  //**********************************************************/
  const checkFormErrors = async (formData) => {

    // required data errors
    const checkNullError = await checkNullErrors(tableHeaderArray, formData);
    if (checkNullError.errorNo === -1) {
      return checkNullError.errorDesc;
    }

    // form validation errors
    if (coded) {
      if (formData.Organisation === null) {
        return '"Name" has to be entered';
      }
      if (formData.Cities_id === null) {
        return '"City" has to be entered';
      }
      if (formData.Countries_id === null) {
        return '"Country" has to be entered';
      }
    } 

    // Check other errors here like is amount < 0, is date less than today ....
        
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
  const getSelectedCountry = async(e) => {
    compVar.formData.Countries_id = e[0].countries_id;
  }

  //**********************************************************/
  const getSelectedCategory = async(e) => {
    compVar.formData.ContactCategories_id = e[0].ContactCategories_id;
  }

  //**********************************************************/
  const getSelectedCity = async(e) => {
    compVar.formData.Cities_id = e[0].cities_id;

    // update exchange rate for invoicing
    const dataQry = await getDataForCity(e[0].cities_id);
    compVar.formData.States_id = dataQry.states_id;
    compVar.formData.Countries_id = dataQry.countries_id;

    forceRender();
  }

  //**********************************************************/
  const getSelectedState = async(e) => {
    compVar.formData.States_id = e[0].states_id;
  }

  //**********************************************************/
  const getSelectedCurrency = async(e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedAgent = async(e) => {
    compVar.formData.Through_addressbook_id = e[0].Addressbook_id;
  }

  //**********************************************************/
  const getSelectedPymtTerms = async(e) => {
    compVar.formData.VendorPaymentTerms_id = e[0].VendorPaymentTerms_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearCountryLookup = async(e) => {
    compVar.formData.Countries_id = null;
  }

  //**********************************************************/
  const clearCategoryLookup = async(e) => {
    compVar.formData.ContactCategories_id = null;
  }

  //**********************************************************/
  const clearCityLookup = async(e) => {
    compVar.formData.Cities_id = null;
  }

  //**********************************************************/
  const clearStateLookup = async(e) => {
    compVar.formData.States_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = async(e) => {
    compVar.formData.Currencies_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = async(e) => {
    compVar.formData.Through_addressbook_id = null;
  }

  //**********************************************************/
  const clearPymtTermsLookup = async(e) => {
    compVar.formData.VendorPaymentTerms_id = null;
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
    compVar.tabIndex = 0;  
    compVar.formDisplayType = 1;
       
    if (compVar.isEdited) {
      await filterData();
    }

    // update only that addressbook entry in mainData
    if (compVar.addressbookDetailsModified) {
      compVar.isHotel = await isHotel(compVar.formData.Addressbook_id);
      await filterData();
    }

  };  

  //**********************************************************/
  const onDisplayTypeClick = async (e) => {
    compVar.formDisplayType = e;
    forceRender();
  }

  //**********************************************************/
  const onAddrDetailsModified = async (e) => {
    compVar.addressbookDetailsModified = e;
  }
  
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
  const onActiveSwitchChange = (e) => {
    setActiveOrg(e);
  }

  //**********************************************************/
  const onCodedSwitchChange = (e) => {
    setCoded(e);
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
      if (!e.data.Active) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Inactive Record';
      } 
    }
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
      onRowPrepared: onRowPrepared
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearCountryLookupValues = {countries_id: null, country: ''};
    const clearCategoryLookupValues = {ContactCategories_id: null, ContactCategory: ''};
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearStateLookupValues = {states_id: null, state: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearPymtTermsLookupValues = {VendorPaymentTerms_id: null, VendorPaymentTerm: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialCountryLookupValues = getLookupValues (
      clearCountryLookupValues, compVar.countryLookup, 
      ['countries_id','country'], compVar.formData.Countries_id);
  
    const initialCategoryLookupValues = getLookupValues(
      clearCategoryLookupValues,compVar.categoryLookup, 
      ['ContactCategories_id', 'ContactCategory'], compVar.formData.ContactCategories_id);

    const initialCityLookupValues = getLookupValues(
      clearCityLookupValues,compVar.cityLookup, 
      ['cities_id', 'city'], compVar.formData.Cities_id);

    const initialStateLookupValues = getLookupValues(
      clearStateLookupValues,compVar.stateLookup, 
      ['states_id', 'state'], compVar.formData.States_id);
  
    const initialCurrencyLookupValues = getLookupValues(
      clearCurrencyLookupValues,compVar.currencyLookup, 
      ['currencies_id', 'currencycode'], compVar.formData.Currencies_id);
    
    const initialAgentLookupValues = getLookupValues(
      clearAgentLookupValues,compVar.agentLookup, 
      ['Addressbook_id', 'OrgCity'], compVar.formData.Through_addressbook_id);
      
    const initialPymtTermsLookupValues = getLookupValues (
      clearPymtTermsLookupValues, compVar.paymentTermsLookup, 
      ['VendorPaymentTerms_id','VendorPaymentTerm'], compVar.formData.VendorPaymentTerms_id);
  
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      onDisplayTypeClick: onDisplayTypeClick,
      onAddrDetailsModified: onAddrDetailsModified,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearCountryLookup, clearCategoryLookup, clearCityLookup, clearStateLookup,  clearCurrencyLookup, clearAgentLookup, clearPymtTermsLookup, clearUserLookup],
      getSelectedRecord: [getSelectedCountry, getSelectedCategory, getSelectedCity, getSelectedState, getSelectedCurrency, getSelectedAgent, getSelectedPymtTerms, getSelectedUser],
      initialLookupValues: [initialCountryLookupValues, initialCategoryLookupValues, initialCityLookupValues, initialStateLookupValues, initialCurrencyLookupValues, initialAgentLookupValues, initialPymtTermsLookupValues, initialUserLookupValues],
      clearLookupValues: [clearCountryLookupValues, clearCategoryLookupValues, clearCityLookupValues, clearStateLookupValues, clearCurrencyLookupValues, clearAgentLookupValues, clearPymtTermsLookupValues, clearUserLookupValues],
      labelLocation: "top",
      onTabOptionChanged: onTabOptionChanged,
      tabIndex: compVar.tabIndex,
      formDisplayType: compVar.formDisplayType,
      isHotel: compVar.isHotel
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
  const createStateParams = () => {

    return (
      <>
        <div className="master-grid-params-switch-container">         
          <div className="master-grid-params-switch-label" style={{paddingLeft: 20}}>
            Coded
          </div>
          <div style={{height: 20}}>
            <Switch height={20} width={40} onChange={onCodedSwitchChange} checked={coded} uncheckedIcon={false}/>
          </div>

          <div className="master-grid-params-switch-label" style={{paddingLeft: 20}}>
            Active
          </div>
          <div style={{height: 20}}>
            <Switch height={20} width={40} onChange={onActiveSwitchChange} checked={activeOrg} uncheckedIcon={false}/>
          </div>
        </div>
      </>
  
    );

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
        <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>

          {!editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <div className="master-grid-params-container"></div>
              <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, flex: 1}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>        
              <div className="master-grid-params-container" style={{justifyContent: 'flex-end'}}>
                {createStateParams()}
              </div>
            </div>
          }          

          {!editPopupVisible &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
              {toast(formObj, toastContainerStyle, {})}
            </div>
          }

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

export default Addressbook;
