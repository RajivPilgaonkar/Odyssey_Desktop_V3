import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetTrainElementSectorsData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation, getTrainName} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';

import '../../common/MasterGrid.css'

let compVar = {};

function TrainElementSectors() {

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
      cityLookup: [], stationLookup: [],
      tableName: 'TrainTrackSectors', keyField: 'TrainTrackSectors_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Trains to import into Elements', title: 'New Train',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 510,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: true, displayHeaderFilter: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [       
        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},
  
        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},
  
        {keyField: 'trainstations_id', dataSource: compVar.stationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},
  
        {keyField: 'trainstations_id', dataSource: compVar.stationLookup, 
        displayExpr: 'station', valueExpr: 'trainstations_id', fieldList: ['station']},
  
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
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      let whereStr = 'cities_id IN (SELECT cities_id FROM trainstations)'
      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr, x_uid: _g_users_id, x_module: 'Train Element Sectors'});   
      compVar.dbLookup[0].dataSource = compVar.cityLookup;  
      compVar.dbLookup[1].dataSource = compVar.cityLookup;  
  
      compVar.stationLookup = await dbGetRecord({fields: ['trainstations_id', 'station', 'cities_id'], orders: ['COALESCE(DefaultOrder,100)'], table: 'trainstations', x_uid: _g_users_id, x_module: 'Train Element Sectors'});   
      compVar.dbLookup[2].dataSource = compVar.stationLookup;  
      compVar.dbLookup[3].dataSource = compVar.stationLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Train Element Sectors'});   
      compVar.dbLookup[4].dataSource = compVar.userLookup;  
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

      // this is done since the query to retrieve data is a join
      // prefix table alias to eahc field
      fieldArray = fieldArray.map((rec) => `ts.${rec}`);    
      fieldArray.push ('s1.cities_id AS FromCities_id');
      fieldArray.push ('s2.cities_id AS ToCities_id');
      fieldArray.push ('t.trainname AS TrainName');

      const wef = convert_DbDate_To_MDY();
      let whereStr = "t.Wef <= '" + wef + "' AND ((t.Wet IS NULL) OR (t.Wet >= '" + wef + "')) ";

      const tableStr = "TrainTrackSectors ts " + 
        "LEFT JOIN trainstations s1 ON ts.FromTrainStations_id = s1.trainstations_id " +
        "LEFT JOIN trainstations s2 ON ts.ToTrainStations_id = s2.trainstations_id " +
        "LEFT JOIN trains t ON ts.TrainNo = t.TrainNo ";

      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['TrainNo'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Train Element Sectors'});   
        
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

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }
    
    let tmpFormData = {...compVar.formData};

    let condition = "WHERE TrainNo = '" + compVar.formData.TrainNo + "' " +
      " AND FromTrainStations_id = " + compVar.formData.FromTrainStations_id.toString() + " " +
      " AND ToTrainStations_id  = " + compVar.formData.ToTrainStations_id.toString();
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
  const getSelectedFromCity = async(e) => {
    compVar.formData.FromCities_id = e[0].cities_id;
    // This will then display on stations for the city
    forceRender();      
  }

  //**********************************************************/
  const getSelectedToCity = async(e) => {
    compVar.formData.ToCities_id = e[0].cities_id;
    // This will then display on stations for the city
    forceRender();      
  }

  //**********************************************************/
  const getSelectedFromStation = async(e) => {
    compVar.formData.FromTrainStations_id = e[0].trainstations_id;
  }

  //**********************************************************/
  const getSelectedToStation = async(e) => {
    compVar.formData.ToTrainStations_id = e[0].trainstations_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearFromCityLookup = async(e) => {
    compVar.formData.FromCities_id = null;
  }

  //**********************************************************/
  const clearToCityLookup = async(e) => {
    compVar.formData.ToCities_id = null;
  }

  //**********************************************************/
  const clearFromStationLookup = async(e) => {
    compVar.formData.FromTrainStations_id = null;
  }

  //**********************************************************/
  const clearToStationLookup = async(e) => {
    compVar.formData.ToTrainStations_id = null;
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

    if (e.dataField === 'TrainNo') {
      if (e.value.trim().length > 0) {
        setTrainName();
      }
    }

    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const setTrainName = async () => {
    const trainObj = await getTrainName (compVar.formData.TrainNo, null);
    compVar.formData.TrainName = trainObj.trainName.trim();
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
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};
    const clearFromStationLookupValues = {trainstations_id: null, station: ''};
    const clearToStationLookupValues = {trainstations_id: null, station: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.FromCities_id);

    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.ToCities_id);

    const initialFromStationLookupValues = getLookupValues (
      clearFromStationLookupValues, compVar.stationLookup, 
      ['trainstations_id','station'], compVar.formData.FromTrainStations_id);
  
    const initialToStationLookupValues = getLookupValues (
      clearToStationLookupValues, compVar.stationLookup, 
      ['trainstations_id','station'], compVar.formData.ToTrainStations_id);

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
      clearLookup: [clearFromCityLookup, clearToCityLookup, clearFromStationLookup, clearToStationLookup, clearUserLookup],
      getSelectedRecord: [getSelectedFromCity, getSelectedToCity, getSelectedFromStation, getSelectedToStation, getSelectedUser],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues, initialFromStationLookupValues, initialToStationLookupValues, initialUserLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues, clearFromStationLookupValues, clearToStationLookupValues, clearUserLookupValues],
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

    /*=== Make station drop downs dependent on city drop downs ===*/
    if (compVar.dbLookup !== undefined && compVar.dbLookup.length) {
      compVar.dbLookup[2].dataSource = (editPopupVisible && compVar.formData.FromCities_id !== undefined && compVar.formData.FromCities_id !== null) ? compVar.stationLookup.filter(rec => rec.cities_id === compVar.formData.FromCities_id) : compVar.stationLookup;
      compVar.dbLookup[3].dataSource = (editPopupVisible && compVar.formData.ToCities_id !== undefined && compVar.formData.ToCities_id !== null) ? compVar.stationLookup.filter(rec => rec.cities_id === compVar.formData.ToCities_id) : compVar.stationLookup;  
    }

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

export default TrainElementSectors;
