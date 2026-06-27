import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, waitFor } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetTrainsData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getAgentSubCatListing} from "../../common/GetOrgListing";
import {getDaysOfOperation, getTrainName}  from "../../common/GetDescFromIds";
import SelectBox from 'devextreme-react/select-box';
import { Button } from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';
import DaysOfOperation from "../../common/DaysOfOperation";
import TrainListing from "./TrainListing";
import TrainContainer from "./trainContainerPage/TrainContainer";

import '../../common/MasterGrid.css'

let compVar = {};

function Trains() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [daysOperationVisible, setDaysOperationVisible] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_trainNo = useSelector(state => state.params.trainNo) || '-1';				
  
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
      trainCategoriesLookup: [], agentLookup: [],
      tableName: 'Trains', keyField: 'Trains_id',
      masterDescField: '',
      activeTrainNo: _g_trainNo, activeTrains_id: -1, activeTrainName: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Trains', title: 'New Train',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 600,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      searchByArray: [{type: 1, text: 'By Train No'}, {type: 2, text: 'By Train Name'}],
      searchType: 1, searchText: '',
      displayTrainListing: false, displayTrainDetailsContainer: false,
      admLevel: 1,
      dbLookup: [       
        {keyField: 'traincategories_id', dataSource: compVar.trainCategoriesLookup, 
        displayExpr: 'category', valueExpr: 'traincategories_id', fieldList: ['category']},

        {keyField: 'Addressbook_id', dataSource: compVar.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity', 'City']},

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
  
      compVar.trainCategoriesLookup = await dbGetRecord({fields: ['traincategories_id', 'category'], orders: ['category'], table: 'traincategories', x_uid: _g_users_id, x_module: 'Trains'});         
      compVar.dbLookup[0].dataSource = compVar.trainCategoriesLookup;  

      compVar.agentLookup = await getAgentSubCatListing('8', false); 
      compVar.dbLookup[1].dataSource = compVar.agentLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Trains'});   
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
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      const whereStr = "TrainNo = '" + compVar.activeTrainNo + "' ";
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['wef DESC'], table: 'trains', where: whereStr, x_uid: _g_users_id, x_module: 'Trains'});   

      // Update days of operation as a string (stored as a bit)
      for (const rec of compVar.mainData) {
        const dayObj = await getDaysOfOperation(rec.DayOfOperation); 
        rec.DayString = dayObj.daysOfOperation;
      }

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);

    // If train no found in redux store, set activeTrainNo ...
    setActiveValues();

    setDataFetched(true);
  }

  //**********************************************************/
  const setActiveValues = () => {

    // If train no found in redux store, set activeTrainNo ...
    if (compVar.focusedRowKey > 0) {
      const idx = compVar.mainData.findIndex(rec => rec.Trains_id === compVar.focusedRowKey);
      if (idx > -1) {
        compVar.activeTrains_id = compVar.mainData[idx].Trains_id;
        compVar.activeTrainNo = compVar.mainData[idx].TrainNo;
        compVar.activeTrainName = compVar.mainData[idx].TrainName;
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
    const idx = compVar.mainData.findIndex(rec => rec.Trains_id === compVar.focusedRowKey);
    if (idx > -1) {
      compVar.formData.TrainNo = compVar.mainData[idx].TrainNo.trim();
      compVar.formData.TrainName = compVar.mainData[idx].TrainName;
      compVar.formData.TrainCategories_id = compVar.mainData[idx].TrainCategories_id;
      compVar.formData.DayOfOperation = compVar.mainData[idx].DayOfOperation;
      compVar.formData.Addressbook_id = compVar.mainData[idx].Addressbook_id;
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
      {table: 'ElemTickets', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Elements. Delete the element details first'},
      {table: 'TrainAvailableClass', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Available Classes. Delete the class details first'},
      {table: 'TrainDetails', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Train Details. Delete the train details first'},
      {table: 'QuoTickets', condition: "WHERE TrainNo = '" + e.row.data.TrainNo + "'", existsIn: 'Tour Tickets. Delete the tour ticket details first'},
      {table: 'VouchersTickets', condition: "WHERE TrainNo = '" + e.row.data.TrainNo + "'", existsIn: 'Voucher Tickets. Delete the voucher ticket details first'},
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

    let condition = "WHERE TrainNo = '" + compVar.formData.TrainNo + "' " + 
      "AND Wef = '" + wef + "' ";
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

    // If Train No / Train Name had chaged, set as active ...
    compVar.activeTrains_id = saveData.formData.Trains_id;
    compVar.activeTrainNo = saveData.formData.TrainNo;
    compVar.activeTrainName = saveData.formData.TrainName;

    // save to redux as well
    dispatch(setParamValues({trainNo: compVar.activeTrainNo}));

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
  const getSelectedCategory = (e) => {
    compVar.formData.TrainCategories_id = e[0].traincategories_id;
  }

  //**********************************************************/
  const getSelectedAgent = (e) => {
    compVar.formData.Addressbook_id = e[0].Addressbook_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearCategoryLookup = (e) => {
    compVar.formData.TrainCategories_id = null;
  }

  //**********************************************************/
  const clearAgentLookup = (e) => {
    compVar.formData.Addressbook_id = null;
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
        setActiveValues();
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
  const onContentReady = async () => {

    // Kludge -- 2 sec delay waiting for the DOM to load ...
    // ... otherwise at times the target input is null    
    await waitFor(2000);

    const targetInput = document.querySelector('.button-read-only-simple-item .dx-texteditor-input-container input');
    if (targetInput) {
      targetInput.readOnly = true;
    }    
    
  }

  //**********************************************************/
  const selectDaysOfOperation = () => {
    setDaysOperationVisible(true);
  }

  //**********************************************************/
  const onDaysOfOperationHide = () => {
    setDaysOperationVisible(false);
  }

  //**********************************************************/
  const onSearchTypeValueChanged = (e) => {    
    compVar.searchType = e.value;
    forceRender();
  }

  //**********************************************************/
  const onTrainSearchTextChange = async (e) => {
    compVar.searchText = e.value;
    forceRender();
  }

  //**********************************************************/
  const onSelectedDaysOfOperation = (e) => {
    compVar.formData.DayOfOperation = e.dayBit;
    compVar.formData.DayString = e.dayStr;
    setDaysOperationVisible(false);
    forceRender();
  }

  //**********************************************************/
  const searchTrain = async () => {
    compVar.displayTrainListing = true;
    forceRender();
  }

  //**********************************************************/
  const onGetSelectedTrain = async (e) => {
    compVar.displayTrainListing = false;
    if (e.refresh) {
      compVar.activeTrainNo = e.trainNo.trim();
      compVar.activeTrains_id = e.trains_id;
      compVar.activeTrainName = e.trainName;

      // save trainNo to the redux store
      dispatch(setParamValues({trainNo: compVar.activeTrainNo}));

      await filterData();
    }   
    forceRender();

  }

  //**********************************************************/
  const displayTrainStations = async () => {
    compVar.displayTrainDetailsContainer = true;
    forceRender();
  }

  //**********************************************************/
  const onHidingTrainStations = async () => {
    compVar.displayTrainDetailsContainer = false;
    forceRender();
  }

  //**********************************************************/
  const setTrainName = async () => {
    const trainObj = await getTrainName (compVar.formData.TrainNo, null);
    compVar.formData.TrainName = trainObj.trainName.trim();
    compVar.formData.TrainCategories_id = trainObj.trainCategories_id;
    compVar.formData.DayOfOperation = trainObj.operatesOn;
    compVar.formData.DayString = trainObj.dayString;
    compVar.formData.Addressbook_id = trainObj.agents_id;
    compVar.formData.SF = trainObj.sf;
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
    const clearCategoryLookupValues = {traincategories_id: null, category: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialCategoryLookupValues = getLookupValues(
      clearCategoryLookupValues,compVar.trainCategoriesLookup,
      ['traincategories_id','category'], compVar.formData.TrainCategories_id);

    const initialAgentLookupValues = getLookupValues(
      clearAgentLookupValues,compVar.agentLookup,
      ['Addressbook_id','OrgCity'], compVar.formData.Addressbook_id);
  
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
      onSelectDaysOfOperation: selectDaysOfOperation,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [clearCategoryLookup, clearAgentLookup, clearUserLookup],
      getSelectedRecord: [getSelectedCategory, getSelectedAgent, getSelectedUser],
      initialLookupValues: [initialCategoryLookupValues, initialAgentLookupValues, initialUserLookupValues],
      clearLookupValues: [clearCategoryLookupValues, clearAgentLookupValues, clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const stationButtonVisible = (compVar.activeTrains_id > 0) ? true : false;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: stationButtonVisible, options: {icon: "icons/trainStations.png", onClick: displayTrainStations, hint: 'Display Train Stations / Available Classes'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createTrainParams = () => {

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
                onValueChanged={onTrainSearchTextChange}
                onEnterKey={searchTrain}
                maxLength={30}
                height={35}
              />
              <Button
                width={35}
                type="normal"
                stylingMode="outlined"
                icon="find"
                onClick={searchTrain}
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

          {!compVar.displayTrainDetailsContainer &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
              <div className="master-grid-params-container">
              </div>
              <div style={{flex: 1}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container">
                {createTrainParams()}
              </div>
            </div>        
          }

          {!compVar.displayTrainDetailsContainer &&
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

          {daysOperationVisible &&
            <DaysOfOperation
              daysOfOperation={compVar.formData.DayOfOperation}
              onDaysOfOperationHide={onDaysOfOperationHide}
              onSelectedDaysOfOperation={onSelectedDaysOfOperation}
            >
            </DaysOfOperation>
          }

          {compVar.displayTrainListing && compVar.searchText &&
            <TrainListing
              trainSearchStr={compVar.searchText}
              searchType={compVar.searchType}
              getSelectedTrain={onGetSelectedTrain}
              users_id={_g_users_id}
            >
            </TrainListing>
          }

          {compVar.displayTrainDetailsContainer &&
            <TrainContainer
              trains_id={compVar.activeTrains_id}  
              trainNo={compVar.activeTrainNo}  
              trainName={compVar.activeTrainName}  
              onHiding={onHidingTrainStations}
              admLevel={compVar.admLevel}
            >
            </TrainContainer>
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

export default Trains;
