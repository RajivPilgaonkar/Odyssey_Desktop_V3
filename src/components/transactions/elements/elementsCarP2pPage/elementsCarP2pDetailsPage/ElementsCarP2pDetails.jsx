import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord } from '../../../../../actions';
import { convert_DbDate_To_MDY, beforeInsert, saveEditedInsertedData, checkNullErrors, getFieldsArray, getLookupValues, convertDMY_MDY } from "../../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterAdd, afterEdit} from "../../../../common/MasterGridHelpers";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import { getDevExtremeTable, tableHeaderArray, getDevExtremePopupForm } from "./GetElementsCarP2pDetailsData";
import PopupDialogBox from '../../../../common/PopupDialogBox';
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import {getNavButtonsJsx, navPrevRecordClick, navNextRecordClick, setStopNav} from "../../../../common/NavigationHelpers";
import { formHelp } from './Help';

import '../../../../common/MasterGrid.css'

let compVar = {};

function ElementsCarP2pDetails(props) {

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
      vehicleLookup: [], 
      tableName: 'ElemInterCitiesCosts', keyField: 'ElemInterCitiesCosts_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Car Costs', title: 'New Car Costs',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Setup', index: 0},{title: 'Addn. Details', index: 1},{title: 'Contacts', index: 2},{title: 'Categories', index: 3},{title: 'Search Tags', index: 4},{title: 'Hotel Info', index: 5}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 570,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, setStopNavigation],
      displayGridFilterRow: false, displayHeaderFilter: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      navigationButtonList: [
        {id: "formPrevButton", text: "", type: "normal", visible: true, icon: "chevronleft", onClick: navigatePrevRecordClick, hint: "Previous Voucher"},
        {id: "formNextButton", text: "", type: "normal", visible: true, icon: "chevronright", onClick: navigateNextRecordClick, hint: "Next Voucher"},
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: true, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ], 
      formChanged: false, saveLeaveOpen: false, afterSaveType: 0, 
      dbLookup: [       

        {keyField: 'vehicles_id', dataSource: compVar.vehicleLookup, 
        displayExpr: 'vehicle', valueExpr: 'vehicles_id', fieldList: ['vehicle']},

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
  // This should execute only when the filterDate params change
  useEffect (() => {
    
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.elements_id, props.counter]);  

  //**********************************************************/
  const fetchInitialData = async() => {

    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      const wef = convertDMY_MDY(props.wef);

      let whereStr = "vehicles_id IN " + 
        "(SELECT vehicles_id FROM carhireP2P ch " + 
        "WHERE addressbook_id = " + props.agents_id.toString() + " " + 
        "AND wef <= '" + wef + "' " +
        "AND wef >= DATEADD(year, -3, '" + wef + "') " + 
        "UNION " + 
        "SELECT vehicles_id FROM carhireagents " +
        "WHERE addressbook_id = " + props.agents_id.toString() + " " +
        "AND Active = 1) ";

      compVar.vehicleLookup = await dbGetRecord({fields: ['vehicles_id', 'vehicle'], orders: ['vehicle'], table: 'vehicles', where: whereStr});    
      compVar.dbLookup[0].dataSource = compVar.vehicleLookup;  
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   
      compVar.dbLookup[1].dataSource = compVar.userLookup;  
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

      const whereStr = "(ElemInterCities_id = " + props.elements_id + ") ";

      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['NumPax'], table: compVar.tableName, where: whereStr, x_uid: _g_users_id, x_module: 'Elements Car Hire'});   
        
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const editRow = async (e) => {
    afterEdit(compVar, e);
    compVar.saveLeaveOpen = false;
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
      ElemInterCities_id: props.elements_id
    }

    afterAdd(compVar, defaultObj);
    compVar.formTitle = compVar.title;

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    /*=== Do not allow a delete ===*/
    alert('Cannot Delete');
    return;
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

    /*=== Always Allow ===*/
    let condition = "WHERE (1=2) "; 
    condition += (compVar.formMode === 2) ? "AND ElemInterCitiesCosts_id <> " + compVar.formData.ElemInterCitiesCosts_id : "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        ElemInterCities_id: props.elements_id,
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

    // only in navigation forms
    compVar.formChanged = false;

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

    // To Date can be null
    if ((formData.Cost === null) || (formData.Cost === 0)) {
      return 'Place specify the Cost';
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
    if (!compVar.saveLeaveOpen) {
      await filterData();
    }

  }

  //**********************************************************/
  const getSelectedVehicle = async(e) => {
    compVar.formData.Vehicles_id = e[0].vehicles_id;
  } 

  //**********************************************************/
  const getSelectedUser = async(e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearVehicleLookup = async(e) => {
    compVar.formData.Vehicles_id = null;
  } 

  //**********************************************************/
  const clearUserLookup = async() => {
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
    compVar.formChanged = true;

    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 

    // Invoice Date change, change yearref
    if ((e.dataField === 'TransportCost') || 
        (e.dataField === 'RepCost') ||
        (e.dataField === 'GuideCost')) {
        const changedObj = computeLineTotals();

        compVar.formData = {...compVar.formData,...changedObj};          
        forceRender();
    }

  }

  //**********************************************************/
  const computeLineTotals = () => {

    const transportCost = (compVar.formData.TransportCost !== null) ? compVar.formData.TransportCost : 0;
    const repCost = (compVar.formData.RepCost !== null) ? compVar.formData.RepCost : 0;
    const guideCost = (compVar.formData.GuideCost !== null) ? compVar.formData.GuideCost : 0;

    const total = transportCost + repCost + guideCost;

    let changedObj = {Cost: total};
    
    return changedObj;

  }

  //**********************************************************/
  const getNavigationButtonsJsx = () => {
    return getNavButtonsJsx(compVar,null);
  }

  //**********************************************************/
  const saveFormDataLeaveOpen = async () => {
    compVar.saveLeaveOpen = true;
    await saveFormData();
  }

  //**********************************************************/
  const navigatePrevRecordClick = async () => {

    navPrevRecordClick(compVar,-1);
    if (compVar.afterSaveType === -1) {
      setPopupDialogBoxVisible(true);
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const navigateNextRecordClick = async () => {

    navNextRecordClick(compVar,1);
    if (compVar.afterSaveType === 1) {
      setPopupDialogBoxVisible(true);
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const setStopNavigation  = async (e) => {

    await setStopNav (e, compVar, saveFormData);
    setPopupDialogBoxVisible(false);
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

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    // *** CASE SENSITIVE override formData properties
    const clearVehicleLookupValues = {vehicles_id: null, vehicle: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialVehicleLookupValues = getLookupValues (
      clearVehicleLookupValues, compVar.vehicleLookup, 
          ['vehicles_id','vehicle'], compVar.formData.Vehicles_id);

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
      formHelp: formHelp,
      clearLookup: [clearVehicleLookup, clearUserLookup],
      getSelectedRecord: [getSelectedVehicle, getSelectedUser],
      initialLookupValues: [initialVehicleLookupValues, initialUserLookupValues],
      clearLookupValues: [clearVehicleLookupValues, clearUserLookupValues],
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,
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
        <div className="master-grid-container" style={{height: containerHeight}}>

        {!editPopupVisible && !initDataFetched && elementProps !== null &&
          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
          </div>        
        }

        {!editPopupVisible && initDataFetched && dataFetched &&
          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {!editPopupVisible && getDevExtremeTable(dataObj, true)}
          </div>
        }

        {editPopupVisible && dataFetched &&
          getDevExtremePopupForm(formObj,dataObj)
        }

        {popupDialogBoxVisible && !editPopupVisible &&
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
    renderContent()
  )


};

export default ElementsCarP2pDetails;
