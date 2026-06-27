import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray,isValidTime } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetTrainDetailsData";
import { canDelete } from "../../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getTimeFromDbDate, getCityForStation}  from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';
import {/*getTrainStationCities,*/ getBusinessCities} from '../../../../common/GetOrgListing';

import '../../../../common/MasterGrid.css'

let compVar = {};

function TrainDetails(props) {

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

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      trainStationLookup: [], cityLookup: [],
      tableName: 'TrainDetails', keyField: 'TrainDetails_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Stations', title: 'New Station',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 510,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: props.admLevel,
      dbLookup: [       
        {keyField: 'trainstations_id', dataSource: compVar.trainStationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},

        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

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
  const fetchInitialData = async() => {
    try {
      const whereStr = 'station IS NOT NULL';
      compVar.trainStationLookup = await dbGetRecord({fields: ['trainstations_id', 'station'], orders: ['station'], table: 'trainstations', where: whereStr});   
      compVar.dbLookup[0].dataSource = compVar.trainStationLookup;  

      compVar.cityLookup = await getBusinessCities();
      //compVar.cityLookup = await getTrainStationCities();
      compVar.dbLookup[1].dataSource = compVar.cityLookup;    

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
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
    try {
      const whereStr = 'trains_id = ' + props.trains_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['kms'], table: 'TrainDetails', where: whereStr});   

      // Get departure time as a string
      for (const rec of compVar.mainData) {
        const timing = (rec.Departure !== null) ? getTimeFromDbDate(rec.Departure) : ''; 
        rec.DepartureTime = timing;
      }

      // Get arrival time as a string
      for (const rec of compVar.mainData) {
        const timing = (rec.Arrival !== null) ? getTimeFromDbDate(rec.Arrival) : ''; 
        rec.ArrivalTime = timing;
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
      Trains_id: props.trains_id
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

    if (compVar.formData.DepartureTime === "" || compVar.formData.DepartureTime === ":") {
      compVar.formData.Departure = null;
    }

    if (compVar.formData.ArrivalTime === "" || compVar.formData.ArrivalTime === ":") {
      compVar.formData.Arrival = null;
    }

    if ((compVar.formData.DepartureTime !== null && compVar.formData.DepartureTime !== ":") && compVar.formData.DepartureTime > '') {
      compVar.formData.Departure = convert_DbDate_To_MDY() + ' ' + compVar.formData.DepartureTime;
    }

    if ((compVar.formData.ArrivalTime !== null && compVar.formData.ArrivalTime !== ":") && compVar.formData.ArrivalTime > '') {
      compVar.formData.Arrival = convert_DbDate_To_MDY() + ' ' + compVar.formData.ArrivalTime;
    }

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }
    
    let tmpFormData = {...compVar.formData};

    let condition = "WHERE TrainStations_id = " + compVar.formData.TrainStations_id.toString() + " AND " +
      "Trains_id = " + props.trains_id.toString();
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
    if ((formData.DepartureTime !== null) && (formData.DepartureTime !== ':') && (formData.DepartureTime.trim().length > 0) && !isValidTime(formData.DepartureTime)) {
      return "Invalid Departure entered";
    }

    // form validation errors
    if ((formData.ArrivalTime !== null) && (formData.ArrivalTime !== ':') && (formData.ArrivalTime.trim().length > 0) && !isValidTime(formData.ArrivalTime)) {
      return "Invalid Arrival entered";
    }
    
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
  const getSelectedTrainStation = (e) => {
    compVar.formData.TrainStations_id = e[0].trainstations_id;
    if (compVar.formData.TrainStations_id !== null) {
      setCityForStation();
    }
  }

  //**********************************************************/
  const getSelectedCity = (e) => {
    compVar.formData.Cities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearTrainStationLookup = (e) => {
    compVar.formData.TrainStations_id = null;
  }

  //**********************************************************/
  const clearCityLookup = (e) => {
    compVar.formData.Cities_id = null;
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
        forceRender();
      }

    }

  }

  //**********************************************************/
  const onFormFieldDataChanged = (e) => {

    if (e.dataField === 'DepartureTime') {
      if (e.value.trim().length < 5) {
        compVar.formData.DepartureTime = compVar.formData.DepartureTime.slice(0,2) + ':' + compVar.formData.DepartureTime.slice(2);
      }
    }

    if (e.dataField === 'ArrivalTime') {
      if (e.value.trim().length < 5) {
        compVar.formData.ArrivalTime = compVar.formData.ArrivalTime.slice(0,2) + ':' + compVar.formData.ArrivalTime.slice(2);
      }
    }
    
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const updateTrainStations = async () => {

    const idx = compVar.mainData.findIndex(rec => rec.TrainDetails_id === compVar.focusedRowKey);

    if (idx > -1) {
      let sql = 'EXEC p_UpdateStationsWithCity ' + compVar.mainData[idx].TrainStations_id.toString() + ', ' + compVar.mainData[idx].Cities_id.toString();
      const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Train Details'}
      try {
        await dbExecuteSp(spData);  
      } catch (err) {
        alert(err);
      }  
    }

  }

  //**********************************************************/
  const setCityForStation = async () => {
    if (compVar.formData.TrainStations_id !== null) {
      const stationObj = await getCityForStation (compVar.formData.TrainStations_id);
      compVar.formData.Cities_id = stationObj.cities_id;
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
    const clearTrainStationLookupValues = {trainstations_id: null, station: ''};
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialTrainStationLookupValues = getLookupValues(
      clearTrainStationLookupValues,compVar.trainStationLookup, 
      ['trainstations_id','station'], compVar.formData.TrainStations_id);

    const initialCityLookupValues = getLookupValues(
      clearCityLookupValues,compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.Cities_id);
    
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
      clearLookup: [clearTrainStationLookup, clearCityLookup, clearUserLookup],
      getSelectedRecord: [getSelectedTrainStation, getSelectedCity, getSelectedUser],
      initialLookupValues: [initialTrainStationLookupValues, initialCityLookupValues, initialUserLookupValues],
      clearLookupValues: [clearTrainStationLookupValues, clearCityLookupValues, clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const idx = compVar.mainData.findIndex(rec => rec.TrainDetails_id === compVar.focusedRowKey);

    const updateButtonVisible = (idx > -1 && compVar.mainData[idx].Cities_id > 0) ? true : false;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: updateButtonVisible, options: {icon: "icons/updateSectors.png", onClick: updateTrainStations, hint: 'Update train stations (other routes) with this city'}},
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

    // Reduce by top panel height containing the train name
    const viewHeight = heights.viewHeight-40;

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

export default TrainDetails;
