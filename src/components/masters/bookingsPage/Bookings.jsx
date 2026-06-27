import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetBookingsData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getAgentSubCatListing} from "../../common/GetOrgListing";
import { getBookingPaxNames, getBookingTourCodes}  from "../../common/GetDescFromIds";
import SelectBox from 'devextreme-react/select-box';
import { Button } from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';
import BookingListing from "./BookingListing";
//import TrainContainer from "./trainContainerPage/TrainContainer";

import '../../common/MasterGrid.css'

let compVar = {};

function Bookings() {

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
  let _g_tourCode = useSelector(state => state.params.tourCode) || '-1';				
  const _g_bookings_id = useSelector(state => state.params.bookings_id) || -1;
  
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
      agentLookup: [], countryLookup: [], currencyLookup: [],
      tableName: 'Bookings', keyField: 'Bookings_id',
      masterDescField: '',
      activeTourCode: _g_tourCode, activeBookings_id: _g_bookings_id, 
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Bookings', title: 'New Bookings',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 600,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      searchByArray: [{type: 1, text: 'By Tour Code'}, {type: 2, text: 'By Pax Name'}, {type: 3, text: 'By Reference No'}],
      searchType: 1, searchText: '',
      displayBookingListing: false, displayBookingDetailsContainer: false,
      admLevel: 1,
      dbLookup: [       
        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'countries_id', dataSource: compVar.countryLookup, 
        displayExpr: 'country', valueExpr: 'countries_id', fieldList: ['country']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']},
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
      compVar.agentLookup = await getAgentSubCatListing('1', false);
      compVar.dbLookup[0].dataSource = compVar.agentLookup;

      compVar.countryLookup = await dbGetRecord({fields: ['countries_id', 'country'], orders: ['country'], table: 'countries', x_uid: _g_users_id, x_module: 'Bookings'});   
      compVar.dbLookup[1].dataSource = compVar.countryLookup;

      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Bookings'}); 
      compVar.dbLookup[2].dataSource = compVar.currencyLookup;

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Bookings'});   
      compVar.dbLookup[3].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      const whereStr = "Bookings_id = " + compVar.activeBookings_id + " ";
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['Bookings_id'], table: 'Bookings', where: whereStr, x_uid: _g_users_id, x_module: 'Bookings'});   

      // Get all the pax names for the bookings_id
      if (compVar.mainData.length > 0) {
        const paxObj = await getBookingPaxNames(compVar.activeBookings_id);
        compVar.mainData[0].PaxNames = paxObj.clients;

        const toursObj = await getBookingTourCodes(compVar.activeBookings_id);
        compVar.mainData[0].Tours = toursObj.tours;
      }

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);

    // If booking no found in redux store, set activeBookingNo ...
    setActiveValues();

    setDataFetched(true);
  }

  //**********************************************************/
  const setActiveValues = () => {

    // If bookings_id found in redux store, set activeBookings_id ...
    if (compVar.focusedRowKey > 0) {
      const idx = compVar.mainData.findIndex(rec => rec.Bookings_id === compVar.focusedRowKey);
      if (idx > -1) {
        compVar.activeBookings_id = compVar.mainData[idx].Bookings_id;
      }
    }

  }


  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);
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

    // copy from active index
    const idx = compVar.mainData.findIndex(rec => rec.Bookings_id === compVar.focusedRowKey);
    if (idx > -1) {
      compVar.formData.Bookings_id = compVar.mainData[idx].Bookings_id;
    }

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      {table: 'BookingsTours', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Booking Tours. Delete the booking tours first'},
      {table: 'BookingsClients', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Booking Clients. Delete the booking clients first'},
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

    let condition = "WHERE Reference = '" + compVar.formData.Reference + "' "; 
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : "";

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

    // If Bookings_id had changed, set as active ...
    compVar.activeBookings_id = saveData.formData.Bookings_id;

    // save to redux as well
    dispatch(setParamValues({bookings_id: compVar.activeBookings_id}));

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
  const getSelectedAgent = (e) => {
    compVar.formData.Addressbook_id = e[0].Addressbook_id;
  }

  //**********************************************************/
  const getSelectedCountry = (e) => {
    compVar.formData.Countries_id = e[0].countries_id;
  }

  //**********************************************************/
  const getSelectedCurrency = async(e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearAgentLookup = (e) => {
    compVar.formData.Addressbook_id = null;
  }

  //**********************************************************/
  const clearCountryLookup = (e) => {
    compVar.formData.countries_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = (e) => {
    compVar.formData.currencies_id = null;
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

    //if (compVar.isEdited) {
    //  await filterData();
    //}

    // always update data on closing
    await filterData();

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

  }

  //**********************************************************/
  const onContentReady = async () => {
    
  }

  //**********************************************************/
  const onSearchTypeValueChanged = (e) => {    
    compVar.searchType = e.value;
    forceRender();
  }

  //**********************************************************/
  const onSearchTextChange = async (e) => {
    compVar.searchText = e.value;
    forceRender();
  }

  //**********************************************************/
  const searchBookings = async () => {
    compVar.displayBookingListing = true;
    forceRender();
  }

  //**********************************************************/
  const onGetSelectedBooking = async (e) => {
    compVar.displayBookingListing = false;
    if (e.refresh) {
      compVar.activeBookings_id = e.bookings_id;

      // save bookings_id to the redux store
      dispatch(setParamValues({bookings_id: compVar.activeBookings_id}));

      await filterData();
    }   
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

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCountryLookupValues = {countries_id: null, country: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialAgentLookupValues = getLookupValues(
      clearAgentLookupValues,compVar.agentLookup, 
      ['Addressbook_id', 'OrgCity'], compVar.formData.Addressbook_id);

    const initialCountryLookupValues = getLookupValues (
      clearCountryLookupValues, compVar.countryLookup, 
      ['countries_id','country'], compVar.formData.Countries_id);

    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, compVar.currencyLookup, 
      ['currencies_id','currencycode'], compVar.formData.Currencies_id);
        
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
      contentReady: onContentReady,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearAgentLookup, clearCountryLookup, clearCurrencyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedAgent, getSelectedCountry, getSelectedCurrency, getSelectedUser],
      initialLookupValues: [initialAgentLookupValues, initialCountryLookupValues, initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearAgentLookupValues, clearCountryLookupValues, clearCurrencyLookupValues, clearUserLookupValues],
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
  const createBookingParams = () => {

    const labelStyle = {
      //flex: 1,
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 16,
      color: '#000000',
      padding: '0px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    };

    const dateBoxStyle = {
      //flex: 4,
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 16,
      color: '#000000',
      padding: '0px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    };    

      return (
        <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>

          <div style={labelStyle}>
            Search
          </div>

          <div style={{...dateBoxStyle, paddingLeft: '10px'}}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <TextBox 
                value={compVar.searchText}
                width={150}
                style={{fontSize: 18}}
                onValueChanged={onSearchTextChange}
                onEnterKey={searchBookings}
                maxLength={30}
                height={35}
              />
              <Button
                width={35}
                type="normal"
                stylingMode="outlined"
                icon="find"
                onClick={searchBookings}
              />
              <div>
                <SelectBox 
                  dataSource={compVar.searchByArray}
                  displayExpr="text"
                  valueExpr="type"
                  value={compVar.searchType} 
                  width={150}
                  onValueChanged={onSearchTypeValueChanged}
                />
              </div>

            </div>
          </div>

        </div>

      )

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

          {!compVar.displayBookingDetailsContainer && !editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
              <div className="master-grid-params-container">
              </div>
              <div style={{flex: 1}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container">
                {createBookingParams()}
              </div>
            </div>        
          }

          {!compVar.displayBookingDetailsContainer && !editPopupVisible &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }
              {getDevExtremeTable(dataObj, true)}
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

          {compVar.displayBookingListing && compVar.searchText &&
            <BookingListing
              bookingSearchStr={compVar.searchText}
              searchType={compVar.searchType}
              getSelectedBooking={onGetSelectedBooking}
              users_id={_g_users_id}
            >
            </BookingListing>
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

export default Bookings;
