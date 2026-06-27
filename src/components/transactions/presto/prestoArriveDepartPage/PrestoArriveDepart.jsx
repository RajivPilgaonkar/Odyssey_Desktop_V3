import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord } from '../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, getFieldsArray, setDateTimeFormat, isValidTime, convertToMoment_fmt, convert_DbDate_To_MDY } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetPrestoArriveDepartData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import PopupDialogBox from '../../../common/PopupDialogBox';

import '../../../common/MasterGrid.css'

let compVar = {};

function PrestoArriveDepart(props) {

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
      fromCityLookup: [], toCityLookup: [],
      tableName: 'Quotations', keyField: 'Quotations_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Quotations', title: 'New Quotations',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 500,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [ 
        {keyField: 'cities_id', dataSource: compVar.fromCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'cities_id', dataSource: compVar.toCityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

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

      compVar.fromCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.fromCityLookup;  

      compVar.toCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[1].dataSource = compVar.toCityLookup;  

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map(e => 'q.' + e);
    fieldArray.push("CONVERT(varchar(5),ETA,108) AS ETA_Time");
    fieldArray.push("CONVERT(varchar(5),ETD,108) AS ETD_Time");
    fieldArray.push("u.uid AS  UserName");

    try {
      const whereStr = "q.Quotations_id = " + props.quotations_id.toString();
      const tableStr = "Quotations q " + 
        "LEFT JOIN AdmUsers u ON q.AdmUsers_id = u.AdmUsers_id ";
  
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['q.StartDate'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Presto Arrive/Depart'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      // Send a signal to the calling function that the data is ready
      if (props.onPrestoDataReady !== null) {
        await props.onPrestoDataReady();
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

    manipulateDataBeforeSave();

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

    let condition = "WHERE 1=2 " ;

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
    if ((formData.ETA_Time !== null) && !isValidTime(formData.ETA_Time)) {
      return "Invalid ETA entered";
    }

    if ((formData.ETD_Time !== null) && !isValidTime(formData.ETD_Time)) {
      return "Invalid ETD entered";
    }

    // Remove time from the Date of Arrival & Departure
    compVar.formData.DateOfArrival = convert_DbDate_To_MDY(compVar.formData.DateOfArrival,1);
    compVar.formData.DateOfDeparture = convert_DbDate_To_MDY(compVar.formData.DateOfDeparture,1);
    formData.EndDate = formData.DateOfDeparture;
    
    if ((formData.DateOfDeparture !== null) && (formData.DateOfArrival !== null)) {
      const dateOfDeparture = convertToMoment_fmt(formData.DateOfDeparture,'');
      const dateOfArrival = convertToMoment_fmt(formData.DateOfArrival,'');
      if (dateOfDeparture < dateOfArrival) {
        return "Date of Depature has to be later than Date of Arrival";
      }
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
  const getSelectedFromCity = async(e) => {
    compVar.formData.StartCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedToCity = async(e) => {
    compVar.formData.EndCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const clearFromCityLookup = () => {
    compVar.formData.StartCities_id = null;
  }

  //**********************************************************/
  const clearToCityLookup = () => {
    compVar.formData.EndCities_id = null;
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
  const onFormFieldDataChanged = () => {
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const manipulateDataBeforeSave = () => {

    let timing = '';

    if (compVar.formData.DateOfArrival !== null && compVar.formData.ETA_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfArrival,1) + ' ' + compVar.formData.ETA_Time;
      compVar.formData.ETA = timing;  
    } else if (compVar.formData.DateOfArrival !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfArrival,1) + ' 00:00';
      compVar.formData.ETA = timing;  
    }

    if (compVar.formData.DateOfDeparture !== null && compVar.formData.ETD_Time !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfDeparture,1) + ' ' + compVar.formData.ETD_Time;
      compVar.formData.ETD = timing;  
    } else if (compVar.formData.DateOfDeparture !== null) {
      timing = convert_DbDate_To_MDY(compVar.formData.DateOfDeparture,1) + ' 00:00';
      compVar.formData.ETD = timing;  
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
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearFromCityLookupValues = {cities_id: null, city: ''};
    const clearToCityLookupValues = {cities_id: null, city: ''};

    const initialFromCityLookupValues = getLookupValues (
      clearFromCityLookupValues, compVar.fromCityLookup, 
      ['cities_id','city'], compVar.formData.StartCities_id);

    const initialToCityLookupValues = getLookupValues (
      clearToCityLookupValues, compVar.toCityLookup, 
      ['cities_id','city'], compVar.formData.EndCities_id);      

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
      clearLookup: [clearFromCityLookup, clearToCityLookup],
      getSelectedRecord: [getSelectedFromCity, getSelectedToCity],
      initialLookupValues: [initialFromCityLookupValues, initialToCityLookupValues],
      clearLookupValues: [clearFromCityLookupValues, clearToCityLookupValues],
    }
  
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

    const additionalPanelHeight = 50;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = 80; //heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

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
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

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

export default PrestoArriveDepart;
