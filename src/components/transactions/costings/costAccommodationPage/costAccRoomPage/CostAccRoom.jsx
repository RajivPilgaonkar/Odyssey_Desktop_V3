import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { convert_DbDate_To_MDY, getFieldsArray, beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues } from "../../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd } from "../../../../common/MasterGridHelpers";
import { canDelete } from "../../../../common/CommonFunctions";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import { setDefaultRoom, getDefaultRoom, getHotelLabel } from "../../../../common/CostingHelpers";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetAccRoomData";
import PopupDialogBox from '../../../../common/PopupDialogBox';
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";

import '../../../../common/MasterGrid.css'

let compVar = {};

function CostAccRoom(props) {

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
      hotelLookup: [], roomTypeLookup: [], mealPlanLookup: [], currencyLookup: [],  
      tableName: 'HotelTariffsIndia', keyField: 'HotelTariffs_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Room Tariffs', title: 'New Room Tariff',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 580,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [
        {keyField: 'roomtypes_id', dataSource: compVar.roomTypeLookup, 
        displayExpr: 'roomtype', valueExpr: 'roomtypes_id', fieldList: ['roomtype']},

        {keyField: 'currencies_id', dataSource: compVar.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'mealplans_id', dataSource: compVar.mealPlanLookup, 
        displayExpr: 'mp', valueExpr: 'mealplans_id', fieldList: ['mp']},

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
  // This should execute when props change
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.seasons_id]);
  
  //**********************************************************/
  const fetchInitialData = async() => {

    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.roomTypeLookup = await dbGetRecord({fields: ['roomtypes_id', 'roomtype','ac'], orders: ['roomtype'], table: 'roomtypes', x_uid: _g_users_id, x_module: 'Room Tariff'});   
      compVar.dbLookup[0].dataSource = compVar.roomTypeLookup;  

      compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Room Tariff'});   
      compVar.dbLookup[1].dataSource = compVar.currencyLookup;  

      compVar.mealPlanLookup = await dbGetRecord({fields: ['mealplans_id', '[plan] AS mp'], orders: ['[plan]'], table: 'mealplans', x_uid: _g_users_id, x_module: 'Room Tariff'});   
      compVar.dbLookup[2].dataSource = compVar.mealPlanLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
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
    fieldArray.push("0 AS DefaultRoom");

    try {
      const whereStr = `Seasons_id = ${props.seasons_id.toString()} `;
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['HotelTariffs_id'], table: 'HotelTariffsIndia', where: whereStr, x_uid: _g_users_id, x_module: 'Cost Accommodation'});   

      const getDefaultRoomObj = await getDefaultRoom(props.seasons_id);
      const defaultRoomTypes_id = getDefaultRoomObj.defaultRoomTypes_id;

      const idx = compVar.mainData.findIndex(rec => rec.RoomTypes_id === defaultRoomTypes_id);
      if (idx > -1) {
        compVar.mainData[idx].DefaultRoom = 1;
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
    const title = await getHotelLabel(props.hotels_id, props.wef);
    compVar.formTitle = title;
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
      Seasons_id: props.seasons_id
    }

    afterAdd(compVar, defaultObj);
    const title = await getHotelLabel(props.hotels_id, props.wef);
    compVar.formTitle = 'New ... ' + title;

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
      compVar.roomTypes_id = e.row.data.RoomTypes_id;
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

    let condition = "WHERE Seasons_id = " + props.seasons_id.toString() + " " + 
      "AND roomtypes_id = " + compVar.formData.RoomTypes_id.toString() + " " + 
      "AND currencies_id = " + compVar.formData.Currencies_id.toString() + " ";
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

    // If marked as default, save it
    await setDefaultRoom (saveData.formData, compVar.mainData);

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
  const getSelectedRoomType = async(e) => {
    compVar.formData.RoomTypes_id = e[0].roomtypes_id;
  }

  //**********************************************************/
  const getSelectedCurrency = async(e) => {
    compVar.formData.Currencies_id = e[0].currencies_id;
  }

  //**********************************************************/
  const getSelectedMealPlan = async(e) => {
    compVar.formData.MealPlans_id = e[0].mealplans_id;
  }

  //**********************************************************/
  const getSelectedUser = async(e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearRoomTypeLookup = async() => {
    compVar.formData.RoomTypes_id = null;
  }

  //**********************************************************/
  const clearCurrencyLookup = async() => {
    compVar.formData.Currencies_id = null;
  }

  //**********************************************************/
  const clearMealPlanLookup = async() => {
    compVar.formData.MealPlans_id = null;
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
    const clearRoomTypeLookupValues = {roomtypes_id: null, roomtype: ''};
    const clearMealPlanLookupValues = {mealplans_id: null, mp: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialRoomTypeLookupValues = getLookupValues (
      clearRoomTypeLookupValues, compVar.roomTypeLookup, 
      ['roomtypes_id','roomtype'], compVar.formData.RoomTypes_id);
  
    const initialMealPlanLookupValues = getLookupValues (
      clearMealPlanLookupValues, compVar.mealPlanLookup, 
      ['mealplans_id','mp'], compVar.formData.MealPlans_id);
  
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
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      //formHelp: formHelp,
      clearLookup: [clearRoomTypeLookup, clearCurrencyLookup, clearMealPlanLookup, clearUserLookup],
      getSelectedRecord: [getSelectedRoomType, getSelectedCurrency, getSelectedMealPlan, getSelectedUser],
      initialLookupValues: [initialRoomTypeLookupValues, initialCurrencyLookupValues, initialMealPlanLookupValues, initialUserLookupValues],
      clearLookupValues: [clearRoomTypeLookupValues, clearCurrencyLookupValues, clearMealPlanLookupValues, clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (props.seasons_id !== undefined && props.seasons_id !== null && props.seasons_id > 0);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
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

      /*=== set default room in seasons table to null if deleting default room type ===*/
      const sql = `UPDATE Seasons SET Default_RoomTypes_id = null 
        WHERE Seasons_id = ${props.seasons_id.toString()}
        AND Default_RoomTypes_id = ${compVar.roomTypes_id}`
   
      const spData = {sql: sql}
      await dbExecuteSp(spData);  

      await filterData();

    }
  }
    

  //**********************************************************/
  const renderContent = () => {

    const additionalPanelHeight = 40;

    const heights = getViewContainerHeights(compVar);
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
        <div className="master-grid-container" style={{}}>

          {(!initDataFetched || !dataFetched) &&
            null
          }

          {!editPopupVisible && dataFetched &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

              <div className="master-grid-params-container">
              </div>        

              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>

              <div className="master-grid-params-container">
              </div>

            </div>                
          }

          {!editPopupVisible && dataFetched &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
            </div>
          }

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {dataFetched && popupDialogBoxVisible && 
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

export default CostAccRoom;
