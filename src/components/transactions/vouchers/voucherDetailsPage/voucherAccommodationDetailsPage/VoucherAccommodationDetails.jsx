import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, setDateTimeFormat, convertToMoment_fmt, getNowDate, convert_DbDate_To_DMY, convertDMYtoDate } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetVoucherAccommodationDetailsData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getAccVoucherDescription} from "../../../../common/VoucherHelpers";
import {getAdmLevelLocation, getAgentName, getVoucherDetails, getRoomTypeIdsForHotel, getVoucherYearRef} from "../../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../../common/PopupDialogBox';

import '../../../../common/MasterGrid.css'

let compVar = {};

function VoucherAccommodationDetails(props) {

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
      roomTypeLookup: [], roomTypeAllLookup: [], mealPlanLookup: [],  
      tableName: 'VouchersAccommodation', keyField: 'VouchersAccommodation_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Acommodation Vouchers', title: 'New Accommodation Vouchers',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 500,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      updateMode: 0,
      admLevel: 1,
      dbLookup: [       

        {keyField: 'roomtypes_id', dataSource: compVar.roomTypeLookup, 
        displayExpr: 'roomtype', valueExpr: 'roomtypes_id', fieldList: ['roomtype']},

        {keyField: 'mealplans_id', dataSource: compVar.mealPlanLookup, 
        displayExpr: 'mp', valueExpr: 'mealplans_id', fieldList: ['mp']},
    
      ]
    }   
        
    fetchInitialData();
    //filterData();

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

      const roomTypesIds = await getRoomTypeIdsForHotel(props.agents_id, props.voucherDate);
      let roomTypesIdsStr = roomTypesIds.join();      
      let whereStr = 'roomTypes_id IN (' + roomTypesIdsStr + ')';
  
      compVar.roomTypeLookup = await dbGetRecord({fields: ['roomtypes_id', 'roomtype','ac'], orders: ['roomtype'], table: 'roomtypes', where: whereStr});   
      compVar.dbLookup[0].dataSource = compVar.roomTypeLookup;  

      compVar.mealPlanLookup = await dbGetRecord({fields: ['mealplans_id', '[plan] AS mp'], orders: ['[plan]'], table: 'mealplans'});   
      compVar.dbLookup[1].dataSource = compVar.mealPlanLookup;  

      /*=== Insert a record in case one does not already exist ===*/
      const sql = "EXEC [p_InsertVoucherDetails] " + props.vouchers_id.toString();
      const spData = {sql: sql};
      await dbExecuteSp(spData);

      await filterData();

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
      const whereStr = "vouchers_id = " + props.vouchers_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['vouchers_id'], table: 'vouchersaccommodation', where: whereStr, x_uid: _g_users_id, x_module: 'Voucher Accommodation'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      const agentObj = await getAgentName(props.agents_id);
      const voucherObj = await getVoucherDetails(props.vouchers_id);
      compVar.formTitle = voucherObj[0].mastertourcode + ' -- ' + agentObj.Organisation;
  
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

    // Directly move to Edit, Mimic as if clicked on grid... so you write e.row.data
    await editRow({row: {data: compVar.mainData[0]}});
  }

  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);

    /*=== yearRef based on voucher date ===*/
    const voucherObj = await getVoucherDetails(props.vouchers_id);
  
    /*=== Add the invisible fields before saving ===*/
    compVar.formData.Addressbook_id = voucherObj[0].addressbook_id;
    if (voucherObj[0].through_addressbook_id) {
      compVar.formData.Agent_Addressbook_id = voucherObj[0].through_addressbook_id;
    }
    compVar.formData.MasterTourCode = voucherObj[0].mastertourcode;
    compVar.formData.MasterTourDate = voucherObj[0].mastertourdate;

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

    // Always save
    let condition = "WHERE 1=2 ";

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

    // Flag as edited... Important for descr to change in previous screen
    compVar.updateMode = 1;
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    // reset focused row
    //compVar.focusedRowKey = saveData.formData[compVar.keyField];

    // refresh data after save
    //await filterData();

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
    const fromDate = convertToMoment_fmt(formData.DateIn,'');
    const toDate = convertToMoment_fmt(formData.DateOut,'');
    if (fromDate > toDate) {
      return "'From Date' cannot exceed 'To Date'";
    }

    const voucherDateYearRef = await getVoucherYearRef(convertDMYtoDate(convert_DbDate_To_DMY(props.voucherDate,1)));
    const fromDateYearRef = await getVoucherYearRef(convertDMYtoDate(convert_DbDate_To_DMY(formData.DateIn,1)));
  
    if (voucherDateYearRef !== fromDateYearRef) {
      return "Cannot change the 'From Date' to a different year reference";
    }

    if ((formData.NoOfSingles === 0) && (formData.NoOfDoubles === 0) && (formData.NoOfTriples === 0) && (formData.NoOfTwins === 0)) {
      return "Singles, Doubles, Triples, Twins -- all cannot be zero";
    }
        
    return '';

  }

  //**********************************************************/
  const afterPost = async() => {

    if ((compVar.formMode === 1) || (compVar.formMode === 2)) {
      await updateVoucherDescription();
      await closePopup();
    }

  }

  //**********************************************************/
  const getSelectedRoomType = async(e) => {
    compVar.formData.RoomTypes_id = e[0].roomtypes_id;
  }

  //**********************************************************/
  const getSelectedMealPlan = async(e) => {
    compVar.formData.MealPlans_id = e[0].mealplans_id;
  }

  //**********************************************************/
  const clearRoomTypeLookup = async(e) => {
    compVar.formData.RoomTypes_id = null;
  }

  //**********************************************************/
  const clearMealPlanLookup = async(e) => {
    compVar.formData.MealPlans_id = null;
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.errorMsg = '';

    /*=== callback to handle description update ===*/
    if (props.onClose !== undefined) {
      props.onClose({open: false, refresh: false, 
        mode: compVar.updateMode, descr: compVar.descr, 
        voucherDate: compVar.voucherDate});
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
  const updateVoucherDescription = async () => {

    let descr = await getAccVoucherDescription(props.vouchers_id);
    descr = descr.replace(/'/g, "''");

    const fromDate = convert_DbDate_To_MDY(compVar.formData.DateIn, 1);

    const sql = "UPDATE vouchers SET description = '" + descr + "', " +    
      "voucherdate = '" + fromDate + "', " + 
      "modified = 1, " + 
      "ModifiedByUsers_id = " + _g_users_id.toString() + ", " +
      "ModifiedOn = '" + getNowDate('MM/DD/YYYY') + "' " +
      "WHERE vouchers_id = " + props.vouchers_id.toString() + " ";

    const spData = {sql: sql}
    await dbExecuteSp(spData);
    
    compVar.descr = descr;
    compVar.voucherDate = convert_DbDate_To_DMY(compVar.formData.DateIn,1);

  };  


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

    const initialRoomTypeLookupValues = getLookupValues (
      clearRoomTypeLookupValues, compVar.roomTypeLookup, 
      ['roomtypes_id','roomtype'], compVar.formData.RoomTypes_id);
    
    const initialMealPlanLookupValues = getLookupValues (
      clearMealPlanLookupValues, compVar.mealPlanLookup, 
      ['mealplans_id','mp'], compVar.formData.MealPlans_id);
  
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
      clearLookup: [clearRoomTypeLookup , clearMealPlanLookup],
      getSelectedRecord: [getSelectedRoomType, getSelectedMealPlan],
      initialLookupValues: [initialRoomTypeLookupValues, initialMealPlanLookupValues],
      clearLookupValues: [clearRoomTypeLookupValues, clearMealPlanLookupValues],
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

export default VoucherAccommodationDetails;
