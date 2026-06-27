import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbExecuteSp, dbDeleteRecord } from '../../../../../actions';
import { beforeInsert, saveEditedInsertedData, checkNullErrors, saveReordedListToDB, getReorderedList, getFieldsArray } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetExclusionData";
import { canDelete } from "../../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import PopupDialogBox from '../../../../common/PopupDialogBox';
import { getNextSrNo } from '../../../../common/CommonFunctions';
import {getNavButtonsJsx, navPrevRecordClick, navNextRecordClick, setStopNav} from "../../../../common/NavigationHelpers";
import DropDownGrid from "../../../../common/DropDownGrid";

import '../../../../common/MasterGrid.css'

let compVar = {};

function Exclusions(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [rowDragging, setRowDragging] = useState(false);  
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
      clonedMainData: [], exclLookup: [],
      tableName: 'QuoExclDetails', keyField: 'QuoExclDetails_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Exclusions', title: 'New Item',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption,setStopNavigation],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      rowDragging: false, onReorder: onReorder,  
      quoExcl_id: -1, quoExcl: '',
      admLevel: 1, 
      navigationButtonList: [
        {id: "formPrevButton", text: "", type: "normal", visible: true, icon: "chevronleft", onClick: navigatePrevRecordClick, hint: "Previous Voucher"},
        {id: "formNextButton", text: "", type: "normal", visible: true, icon: "chevronright", onClick: navigateNextRecordClick, hint: "Next Voucher"},
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: true, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ], 
      formChanged: false, saveLeaveOpen: false, afterSaveType: 0, 
      dbLookup: [       
        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']},

      ],
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

      let query = "SELECT QuoExcl_id, Quotations_id, QuoExclusions_id, " +
        "SrNo, QuoExclusion " +
        "FROM QuoExcl " + 
        "WHERE Quotations_id = " + props.quotations_id.toString() + " " +
        "ORDER BY SrNo";

      compVar.exclLookup = await dbGetRecordRaw({query: query});   
      compVar.quoExcl_id = (compVar.exclLookup.length > 0) ? compVar.exclLookup[0].QuoExcl_id : -1;
      compVar.quoExcl = (compVar.exclLookup.length > 0) ? compVar.exclLookup[0].QuoExclusion : '';

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Composite Report Exclusions'});   
      compVar.dbLookup[0].dataSource = compVar.userLookup;  

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

      const query = "SELECT " + fieldArray.toString() + " FROM QuoExclDetails WHERE QuoExcl_id IN (SELECT QuoExcl_id FROM QuoExcl WHERE Quotations_id = " + props.quotations_id.toString() + ") ORDER BY SrNo";
      compVar.mainData =  await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Presto Composite Report Exclusions'});   

      compVar.clonedMainData =  [...compVar.mainData];     
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

    const nextObj = await getNextSrNo('QuoExclDetails','SrNo','QuoExcl_id = ' + compVar.quoExcl_id.toString());
    const nextSrNo = (nextObj.length > 0) ? nextObj[0].OrderNo+1 : 1;

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      QuoExcl_id: compVar.quoExcl_id,
      SrNo: nextSrNo,
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
      //{table: 'flights', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data[compVar.keyField], existsIn: 'Flights. Delete the flight details first'},
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

    // Only in add mode get SrNo based on OrderNo 
    if (compVar.formMode === 1) {
      await getNextSrOrderNo();
    }

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }
    
    let tmpFormData = {...compVar.formData};

    // Always save
    let condition = "WHERE (1=2) ";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        //: _g_users_id,
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

    // only in navigation forms
    compVar.formChanged = false;

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
  const getSelectedExcl = async (e) => {
    compVar.quoExcl_id = e[0].QuoExcl_id;
    compVar.quoExcl = e[0].QuoExclusion;
    forceRender();
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

    compVar.formChanged = true;

    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
    } 

    forceRender();

  }

  //**********************************************************/
  const onCellClick = async (e) => { 
    
    if (e.rowType === 'data' && e.column.dataField === 'Display') {      
      const quoExclDetails_id = e.data.QuoExclDetails_id;

      const idx = compVar.mainData.findIndex(rec => rec.QuoExclDetails_id === quoExclDetails_id);

      if (idx >= 0) {
        compVar.mainData[idx].Display = !compVar.mainData[idx].Display;
        // otherwise even a render may not change the data as it would think the array data has not changed
        compVar.mainData = [...compVar.mainData];

        const spData = {sql: "UPDATE QuoExclDetails " + 
          "SET Display = " + ((compVar.mainData[idx].Selected === true) ? "1 " : "0 ") +
          "WHERE QuoExclDetails_id = " + quoExclDetails_id.toString() + " "}

        await dbExecuteSp(spData);  

      }

      forceRender();
    }

  }

  //**********************************************************/
  const refreshExclusions = async () => {
    setDataFetched(false);
    const spData = {sql: "EXEC p_AddQuoExclusions " + props.quotations_id.toString() + " "}
    await dbExecuteSp(spData);  

    await filterData();

  }

  //**********************************************************/
  const getNextSrOrderNo = async () => {

    const nextObj = await getNextSrNo('QuoExclDetails','SrNo','QuoExcl_id = ' + compVar.quoExcl_id.toString());
    const nextSrNo = (nextObj.length > 0) ? nextObj[0].OrderNo+1 : 1;
    compVar.formData.SrNo = nextSrNo;  

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
  const rowDraggingToggle = () => {
    setRowDragging((rowDragging) => {return !rowDragging});
  }

  //**********************************************************/
  const saveListToDb = async () => {

    await saveReordedListToDB (compVar.clonedMainData, 
      compVar.tableName, 'SrNo', compVar.keyField);

    rowDraggingToggle();
    await filterData();

  }  

  //**********************************************************/
  const onReorder = (e) => {
    const reorderedList = getReorderedList(e, compVar.clonedMainData, '', null);
    compVar.clonedMainData = reorderedList;
    forceRender();
  }

  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.exclLookup];
    const fieldLists = [['QuoExclusion']];
    const valueExprs = ['QuoExcl_id'];
    const displayExprs = ['QuoExclusion'];
    const labels = ['Exclusion Type'];
    const placeholders = ["Select an Exclusion Type..."];
    const getSelectedRecs = [getSelectedExcl];
    const values = [compVar.quoExcl];
    const componentWidths = [150];
    const dropDownWidths = [200];
    const labelStyles = [{width: 100, flex: 1}] 

    const lookup = lookups[index];
    const fieldList = fieldLists[index];
    const valueExpr = valueExprs[index];
    const displayExpr = displayExprs[index];
    const label = labels[index];
    const placeholder = placeholders[index];
    const getSelectedRec = getSelectedRecs[index];
    const value = values[index];
    const componentWidth = componentWidths[index];
    const dropDownWidth = dropDownWidths[index];
    const labelStyle = labelStyles[index]; 
    
    return (
        <DropDownGrid
          listArray={lookup}
          fieldList={fieldList}
          valueExpr={valueExpr}
          displayExpr={displayExpr}
          label={label}
          placeholder={placeholder}
          getSelectedRecord={getSelectedRec}
          showColumnHeaders={false}
          value={value}
          labelStyle={labelStyle}
          dropDownStyle={{width: componentWidth, height: 35}}
          dropDownOptions={{width: dropDownWidth}}
        />  
    );

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    // For row dragging forms  
    compVar.rowDragging = rowDragging;

    const defaultPageSize = compVar.mainData.length+1;
    const gridHeight = (compVar.mainData.length > 10) ? viewHeight-20 : undefined;

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    // filter data based on QuoExcl_id
    const data = defaultDataObject.data.filter(rec => rec.QuoExcl_id === compVar.quoExcl_id);
    compVar.clonedMainData =  [...data];     

    return {...defaultDataObject,
      data: data,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      defaultPageSize: defaultPageSize,
      gridHeight: gridHeight,
      wordWrapEnabled: true,
      onCellClick: onCellClick,
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    // *** CASE SENSITIVE override formData properties

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
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: [],
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd =  (rowDragging) ? false : compVar.canAdd;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: !rowDragging && canAdd, options: {icon: "orderedlist", onClick: rowDraggingToggle, hint: 'Reorder using drag & drop'}},
        {visible: rowDragging, options: {icon: "save", onClick: saveListToDb, hint: 'Save reordered list to DB'}},  
        {visible: rowDragging, options: {icon: "revert", onClick: rowDraggingToggle, hint: 'Cancel reordering'}},  
        {visible: !rowDragging, options: {icon: "refresh", onClick: refreshExclusions, hint: 'Add Missing Exclusions'}},
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

    const dataObj = createDataObject(viewHeight-80);
    const formObj = createFormObject();
    const elementProps = createElementProps();

    const contentHeight = heights.viewHeight;
    
    return (
      <>
        <div className="master-grid-container" style={{height: contentHeight-80}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 1}}>
              {dropDownParamsJsx(0)}
            </div>
            <div className="master-grid-params-container" style={{flex: 1}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container" style={{flex: 1}}>
            </div>
          </div>        

          <div className="master-grid-content-box"  style={{height: contentHeight-80-MASTER_GRID_TITLE_HEIGHT}}>
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

export default Exclusions;
