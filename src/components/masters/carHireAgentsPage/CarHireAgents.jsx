import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetCarHireAgentData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import { SERVICE_PER_KM, SERVICE_P2P, SERVICE_CITY_GROUPS, SERVICE_SIGHTSEEING, SERVICE_TRANSFERS } from '../../../actions/types';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAgentServicesListing} from "../../common/GetOrgListing";
import Switch from "react-switch";
import DropDownGrid from "../../common/DropDownGrid";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';

import '../../common/MasterGrid.css'

let compVar = {};

function CarHireAgents() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [activeVehicles, setActiveVehicles] = useState(true);
  const [onlyServiceCities, setOnlyServiceCities] = useState(true);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_agents_id = useSelector(state => state.params.agents_id) || -1;

  let _g_cities_id = useSelector(state => state.params.serviceCities_id) || -1;

  const _g_location = useLocation();

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [], vehicleLookup: [],
      agentLookup: [], serviceCityLookup: [],
      tableName: 'carhireagents', keyField: 'carhireagents_id',
      masterDescField: '',
      selectedAgents_id: _g_agents_id, selectedAgent: '',
      selectedCities_id: _g_cities_id, selectedCity: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Car Hire Agents', title: 'New Car Hire Agent',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 500,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [   
        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ]
    }   
        
    //fetchInitialData();
    //filterData();

    // This is called since filterData depends on fetchInitialData here, so synchronous calls reqd
    initialData();

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
  // This should execute only when the active flag changes
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [activeVehicles]);

  //**********************************************************/
  // This should execute only when the active flag changes
  useEffect (() => {

    updateServiceCity();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [onlyServiceCities]);

  //**********************************************************/
  const initialData = async() => {
    await fetchInitialData();
    await filterData();
  }

  //**********************************************************/
  const fetchInitialData = async() => {
    try {

      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      // Get List of Agents who have cars
      const agentTypes = SERVICE_PER_KM.toString() + ',' + 
        SERVICE_P2P.toString() + ',' + SERVICE_CITY_GROUPS.toString() + ',' +
        SERVICE_SIGHTSEEING.toString() + ',' + SERVICE_TRANSFERS.toString();
      compVar.agentLookup = await getAgentServicesListing(agentTypes, false);

      // if selected city is saved, use it
      if (compVar.selectedAgents_id > -1)  {
        const idx = compVar.agentLookup.findIndex(rec => rec.Addressbook_id === compVar.selectedAgents_id);
        if (idx > -1) {
          compVar.selectedAgent = compVar.agentLookup[idx].OrgCity;
        }
      }

      await updateServiceCityLookup();

      // if selected city is saved, use it
      if (compVar.selectedCities_id > -1)  {
        const idx = compVar.serviceCityLookup.findIndex(rec => rec.cities_id === compVar.selectedCities_id);
        if (idx > -1) {
          compVar.selectedCity = compVar.serviceCityLookup[idx].city;
        }
      }

      compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles', x_uid: _g_users_id, x_module: 'Car Hire Agents'});    
      compVar.dbLookup[0].dataSource = compVar.vehicleLookup;

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Car Hire Agents'});   
      compVar.dbLookup[1].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const activeStr = activeVehicles ? ' AND Active = 1' : '';

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      const whereStr = 'Addressbook_id = ' + compVar.selectedAgents_id.toString() + " " + 
        "AND Cities_id = " + compVar.selectedCities_id.toString() + " " + 
        activeStr;
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['fromPax, toPax'], table: 'carhireagents', where: whereStr, x_uid: _g_users_id, x_module: 'Car Hire Agents'});   
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
      addressbook_id: compVar.selectedAgents_id,
      cities_id: compVar.selectedCities_id
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

    let condition = "WHERE Addressbook_id = " + compVar.formData.addressbook_id.toString() + " " + 
      "AND cities_id = " + compVar.formData.cities_id.toString() + " " +
      "AND vehicles_id = " + compVar.formData.vehicles_id.toString();
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

    if ((formData.fromPax === 0) || (formData.toPax === 0)) {
      return "'From Pax' & 'To Pax' should both be non-zero"
    }

    if (formData.fromPax > formData.toPax) {
      return "'From Pax' cannot be greater than 'To Pax'"
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
  const getSelectedVehicle = (e) => {
    compVar.formData.vehicles_id = e[0].vehicles_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearVehicleLookup = (e) => {
    compVar.formData.vehicles_id = null;
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
  const onFormFieldDataChanged = () => {
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (!e.data.active) {
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
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialVehicleLookupValues = getLookupValues(
      clearVehicleLookupValues,compVar.vehicleLookup, 
      ['vehicles_id','vehicle'], compVar.formData.vehicles_id);

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
      clearLookup: [clearVehicleLookup, clearUserLookup],
      getSelectedRecord: [getSelectedVehicle, getSelectedUser],
      initialLookupValues: [initialVehicleLookupValues, initialUserLookupValues],
      clearLookupValues: [clearVehicleLookupValues, clearUserLookupValues],
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
  const createAgentCityParams = (mode) => {

    if (mode === 1) {
      return (
        <>
          <div className="master-grid-params-switch-container"> 
            <div className="master-grid-params-switch-label">
              Active Vehicles
            </div>
            <div style={{height: 20}}>
              <Switch height={20} width={40} onChange={onActiveVehicleSwitchChange} checked={activeVehicles} uncheckedIcon={false}/>
            </div>
          </div>
        </>
    
      );  
    }

    return (
      <>
        <DropDownGrid
          listArray={compVar.agentLookup}
          fieldList={['Organisation', 'City']}
          valueExpr="Addressbook_id"
          displayExpr="OrgCity"
          label="Agent"
          placeholder="Select an agent..."
          getSelectedRecord={onAgentSelect}
          showColumnHeaders={false}
          value={compVar.selectedAgents_id}
          labelStyle={{width: 65}}
          dropDownStyle={{width: 60}}
          dropDownOptions={{width: 500}}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
        <DropDownGrid
          listArray={compVar.serviceCityLookup}
          fieldList={['city']}
          valueExpr="cities_id"
          displayExpr="city"
          label="City"
          placeholder="Select a city..."
          getSelectedRecord={onCitySelect}
          showColumnHeaders={false}
          value={compVar.selectedCities_id}
          labelStyle={{width: 50}}
          dropDownStyle={{width: 60}}
          dropDownOptions={{width: 300}}
        />
        <Switch height={20} width={40} onChange={onActiveSwitchChange} checked={onlyServiceCities} uncheckedIcon={false}/>

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
  const onActiveSwitchChange = async (e) => {
    setOnlyServiceCities(e);
    forceRender();
  }
    
  //**********************************************************/
  const onActiveVehicleSwitchChange = (e) => {
    setActiveVehicles(e);
  }

  //*********************************************************/
  const updateServiceCity = async () => {
    await updateServiceCityLookup();
    forceRender();
  }

  //*********************************************************/
  const updateServiceCityLookup = async () => {

    const whereStr = onlyServiceCities ? 
      'cities_id IN (SELECT cities_id FROM CarHireAgents WHERE Addressbook_id = ' + compVar.selectedAgents_id.toString() + ')' :
      '(1=1)';
    compVar.serviceCityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr});   

    const idx = compVar.serviceCityLookup.findIndex(rec => rec.cities_id === compVar.selectedCities_id);
    if (idx > -1) {
      compVar.selectedCities_id = compVar.serviceCityLookup[idx].cities_id;
      compVar.selectedCity = compVar.serviceCityLookup[idx].city;
    } else if (compVar.serviceCityLookup.length > 0) {
      compVar.selectedCities_id = compVar.serviceCityLookup[0].cities_id;
      compVar.selectedCity = compVar.serviceCityLookup[0].city;
    } else {
      compVar.selectedCities_id = -1;
      compVar.selectedCity = '';
    }

  }

  //*********************************************************/
  const onAgentSelect = async(e) => {
    if (e.length > 0) {
      compVar.selectedAgents_id = e[0].Addressbook_id;
      compVar.selectedAgent = e[0].OrgCity;  
  
      // Save to redux store through params reducer
      dispatch(setParamValues({agents_id: compVar.selectedAgents_id}));

      await updateServiceCityLookup();

      filterData();
    }
  }

  //*********************************************************/
  const onCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.selectedCities_id = e[0].cities_id;
      compVar.selectedCity = e[0].city;  

      // Save to redux store hrough params reducer
      dispatch(setParamValues({serviceCities_id: compVar.selectedCities_id}));

      filterData();
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
        <div className="master-grid-container" style={{height: containerHeight}}>

          {!editPopupVisible &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <div className="master-grid-params-container" style={{flex: 1}}>
                {createAgentCityParams(1)}
              </div>
              <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, flex: 1}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>        
              <div className="master-grid-params-container" style={{justifyContent: 'flex-end', flex: 2.5}}>
                {createAgentCityParams(2)}
              </div>
            </div>
          }          

          {!editPopupVisible &&
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

export default CarHireAgents;
