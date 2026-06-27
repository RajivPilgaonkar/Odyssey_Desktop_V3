import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, getFieldsArray, saveReordedListToDB, getReorderedList } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetAddressbookServiceRankingsData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../common/PopupDialogBox';

import '../../../common/MasterGrid.css'

//let compVar = {};

function AddressbookServiceRankings(props) {

  let compVar = useRef({});    

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
    compVar.current = {
      userLookup: [],  mainData: [], allData: [],
      clonedMainData: [],
      cities_id: props.hotelCities_id,
      tableName: 'AddressbookCategoryServices', keyField: 'AddressbookCategoryServices_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: props.addressbookService, title: 'New Ranking',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, rankingProc],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      displayAllMode: false, rankType: 0, numRanked: 0, numUnranked: 0,
      rowDragging: false, onReorder: onReorder,
      dbLookup: [       
        {keyField: 'AdmUsers_id', dataSource: compVar.current.userLookup, 
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
    if (compVar.current.errorMsg > '') {
      setTimeout(() => {
        compVar.current.errorMsg = '';
        forceRender();
      }, 5000)
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.current.errorMsg]);

  //**********************************************************/
  // This should execute everytime props change
  useEffect (() => {
      
    compVar.current.cities_id = props.hotelCities_id;
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, [props.hotelCities_id, props.addressbookServices_id]);
  
  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.current.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.current.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.current.dbLookup[0].dataSource = compVar.current.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);

    fieldArray = fieldArray.map((rec) => `acs.${rec}`);
    fieldArray.push ('a.Organisation');							
        
    try {
      const rankingFilter = (!compVar.current.displayAllMode) ? " AND COALESCE(acs.Ranking,0) > 0 " : '';
      let whereStr = 'acs.Addressbook_id IN (' + 
        "SELECT a2.Addressbook_id FROM Addressbook a2 WHERE Cities_id = " + compVar.current.cities_id.toString() + ") " +
        "AND acs.AddressbookServices_id = " + props.addressbookServices_id.toString() + " ";
      const tableStr = 'AddressbookCategoryServices acs ' + 
        'LEFT JOIN Addressbook a ON acs.Addressbook_id = a.Addressbook_id ';

      compVar.current.allData =  await dbGetRecord({fields: fieldArray, orders: ['COALESCE(acs.Ranking,100)'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      whereStr = 'acs.Addressbook_id IN (' + 
        "SELECT a2.Addressbook_id FROM Addressbook a2 WHERE Cities_id = " + compVar.current.cities_id.toString() + ") " +
        "AND acs.AddressbookServices_id = " + props.addressbookServices_id.toString() + " " +
        rankingFilter;

      compVar.current.mainData =  await dbGetRecord({fields: fieldArray, orders: ['COALESCE(acs.Ranking,100)'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.current.clonedMainData = [...compVar.current.mainData];

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar.current);
    setDataFetched(true);
  }
  

  //**********************************************************/
  const editRow = async (e) => {

    // prevent from deleting
    alert('Editing not allowed');
    return;

  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {

    // prevent from deleting
    alert('Deletion not allowed');
    return;
  }

  //**********************************************************/
  const saveFormData = async () => {

    if (compVar.current.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // Remove any previous error messages
    compVar.current.errorMsg = '';

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.current.formData);
    if (errorMsg > '') {
      compVar.current.errorMsg = errorMsg;
      forceRender();
      return;      
    }
    
    let tmpFormData = {...compVar.current.formData};

    let condition = "WHERE Addressbook_id = '" + compVar.current.formData.Addressbook_id.toString() + " " + 
      "AND AddressbookServices_id = " + compVar.current.formData.AddressbookServices_id.toString() + " ";
    condition += (compVar.current.formMode === 2) ? "AND " + compVar.current.keyField.toString() + " <> " + compVar.current.formData[compVar.current.keyField].toString() : "";

    let obj = {
      formMode: compVar.current.formMode,
      tableName: compVar.current.tableName,
      keyField: compVar.current.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: _g_users_id,
        ModifiedOn: convert_DbDate_To_MDY()
      },
      afterPost: afterPost
    }
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.current.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.current.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    // reset focused row
    compVar.current.focusedRowKey = saveData.formData[compVar.current.keyField];

    // refresh data after save
    await filterData();

    // update old tables for Delphi - let this run asynchronously
    updateOldTables();

    compVar.current.formData = {...saveData.formData}; 
    compVar.current.formOldData = {...saveData.formData};
  
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

    if ((compVar.current.formMode === 1) || (compVar.current.formMode === 2)) {
      await closePopup();
    }
       
    // refresh data
    await filterData();

  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.current.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearUserLookup = () => {
    compVar.current.formData.ModifiedByUsers_id = null;
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.current.errorMsg = '';

    if (compVar.current.isEdited) {
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
    compVar.current.toastIsVisible = false;
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
    compVar.current.renderToggle = renderToggle;

  }

  //**********************************************************/
  const onFocusedRowChanged = (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data[compVar.current.keyField];

      if (compVar.current.mainData.length > 0) {
        compVar.current.focusedRowKey = id;
        forceRender();
      }

    }

  }

  //**********************************************************/
  const onFormFieldDataChanged = () => {
    if (compVar.current.errorMsg > '') {
      compVar.current.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const toggleFilterHotels = () => {
    compVar.current.displayAllMode = !compVar.current.displayAllMode;
    filterData();
    forceRender();
  }

  //**********************************************************/
  const rankClick = async (e) => {

    const idx = compVar.current.mainData.findIndex(rec => rec[compVar.current.keyField] === compVar.current.focusedRowKey);

    if (idx > -1) {
      compVar.current.rankType = e;
      if (e === 2) {
        compVar.current.popupDialogIndex = 1;
        compVar.current.dialogMessage1 = `Are you sure you want to unrank 
          ${compVar.current.mainData[idx].Organisation}`  
        // show dialog box
        setPopupDialogBoxVisible(() => {return true});
      } else {
        await rankOrUnrankHotel();
      }
    }

  }

  //**********************************************************/
  const rankingProc = async (e) => {

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {
      await rankOrUnrankHotel();
    }

  }

  //**********************************************************/
  const rankOrUnrankHotel = async(e) => {

    if (compVar.current.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const idx = compVar.current.mainData.findIndex(rec => rec[compVar.current.keyField] === compVar.current.focusedRowKey);

    const addressbookCategoryServices_id = compVar.current.mainData[idx].AddressbookCategoryServices_id;
    const addressbookServices_id = compVar.current.mainData[idx].AddressbookServices_id;
    const rankType = compVar.current.rankType;
    const cities_id = compVar.current.cities_id;

    const spData = {sql: `EXEC p_UpdateHotelRankings 
      ${addressbookCategoryServices_id.toString()},
      ${cities_id.toString()},
      ${addressbookServices_id.toString()},
      ${rankType.toString()}`, x_uid: _g_users_id, x_module: 'Addressbook Rankings'};

    try {
      await dbExecuteSp(spData);  
    } catch(err) {
      alert(err);
    }
    await filterData();
    //forceRender();    

    // update old tables for Delphi - let this run asynchronously
    updateOldTables();

  }


  //**********************************************************/
  const onRowPrepared = async(e) => { 
    if (e.rowType === 'data') {
      if (e.data.Ranking === null || e.data.Ranking < 1) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Not Ranked';
      } 
    }
  }

  //**********************************************************/
  const updateOldTables = async () => {

    // update ranking in old tables for Delphi
    for (const rec of compVar.current.mainData) {      
      const rank = (rec.Ranking !== null) ? rec.Ranking.toString() : 'null';
      const sql = 'EXEC p_UpdateOldCategories ' + 
        rec.Addressbook_id.toString() + ',' + 
        rec.AddressbookServices_id.toString() + ',' +
        rank;
      const spData = {sql: sql}
      await dbExecuteSp(spData);
    }

    /*=== Update Default Hotels ===*/
    const sql = 'EXEC p_UpdateDefaultHotel_Ranking ' + 
      props.hotelCities_id.toString() + ',' + 
      props.addressbookServices_id.toString();
    const spData = {sql: sql}
    await dbExecuteSp(spData);

  }
  

  //**********************************************************/
  const createDataObject = (viewHeight) => {    

    compVar.current.rowDragging = rowDragging;			

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar.current, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.current.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      gridId: props.id,
      onRowPrepared: onRowPrepared
    }

  }

  //**********************************************************/
  const createFormObject = () => {    

    const defaultFormObject = getDefaultFormObject({compVar: compVar.current});

    // *** CASE SENSITIVE override formData properties
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.current.userLookup, 
      ['AdmUsers_id','uid'], compVar.current.formData.ModifiedByUsers_id);

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
      clearLookup: [clearUserLookup],
      getSelectedRecord: [getSelectedUser],
      initialLookupValues: [initialUserLookupValues],
      clearLookupValues: [clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const data = compVar.current.mainData.filter(rec => rec.Ranking !== null && rec.Ranking > 0);
    const numUnranked = compVar.current.allData.length - data.length;

    // For row dragging forms  
    const canAdd =  (rowDragging || data.length <= 1) ? false : true;

    const displayRankingFilter = (numUnranked > 0);
  
    const hintFilter = (compVar.current.displayAllMode) ? 'Display only Ranked' : 'Display unranked as well';
    const iconFilter = (compVar.current.displayAllMode) ? 'hidepanel' : 'showpanel';

    let isRanked = false;
    if (compVar.current.focusedRowKey != null && compVar.current.focusedRowKey > -1) {
      const idx = compVar.current.mainData.findIndex(rec => rec[compVar.current.keyField] === compVar.current.focusedRowKey);
      if (idx > -1) {
        isRanked = (compVar.current.mainData[idx].Ranking !== null && compVar.current.mainData[idx].Ranking > 0) ? true : false;
      }
    }
    const displayRankingButton =  ((isRanked && compVar.current.mainData.length > 0) || (!isRanked && numUnranked > 0)) ? true : false;

    const iconRankIcon = (isRanked) ? 'icons/unrank.png' : 'icons/rank.png';
    const hintRank = (isRanked) ? 'Unrank this hotel' : 'Rank this hotel';
    const rankMode = (isRanked) ? 2 : 1;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: false, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: !rowDragging && canAdd, options: {icon: "orderedlist", onClick: rowDraggingToggle, hint: 'Reorder using drag & drop'}},
        {visible: rowDragging, options: {icon: "save", onClick: saveListToDb, hint: 'Save reordered list to DB'}},  
        {visible: rowDragging, options: {icon: "revert", onClick: rowDraggingToggle, hint: 'Cancel reordering'}},  
        {visible: displayRankingFilter, options: {icon: iconFilter, onClick: toggleFilterHotels, hint: hintFilter}},
        {visible: displayRankingButton, options: {icon: iconRankIcon, onClick: () => {rankClick(rankMode)}, hint: hintRank}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    const recObj = {table: compVar.current.tableName, keyField: compVar.current.keyField, keyValue: compVar.current.focusedRowKey}
    setPopupDialogBoxVisible(() => {return false});

    if (e===1) {
      const idx = compVar.current.mainData.findIndex(rec => rec[compVar.current.keyField] === compVar.current.focusedRowKey);
      compVar.current.focusedRowKey = (idx > 0) ? compVar.current.mainData[idx-1][compVar.current.keyField] : null;  
      await dbDeleteRecord(recObj);
      await filterData();
    }
  }
    
  //**********************************************************/
  const rowDraggingToggle = () => {

    if (compVar.current.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    setRowDragging((rowDragging) => {return !rowDragging});
  }

  //**********************************************************/
  const saveListToDb = async () => {

    await saveReordedListToDB (compVar.current.clonedMainData, 
      compVar.current.tableName, 'Ranking', compVar.current.keyField);

    rowDraggingToggle();
    await filterData();

    // update old tables for Delphi - let this run asynchronously
    updateOldTables();

  }  

  //**********************************************************/
  const onReorder = (e) => {
    const reorderedList = getReorderedList(e, compVar.current.clonedMainData, '', null);
    compVar.current.clonedMainData = reorderedList;
    forceRender();
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar.current);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id={"large-indicator"+props.key} height={60} width={60} />
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
            <ToolbarOptions id={'tool'+props.id} text={compVar.current.mainTitle} {...elementProps}></ToolbarOptions>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.current.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {popupDialogBoxVisible && 
            <PopupDialogBox
              open={true}
              message1={compVar.current.dialogMessage1}
              message2={compVar.current.dialogMessage2}
              getSelectedOption={compVar.current.popupSelectedOptions[compVar.current.popupDialogIndex]}
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

export default AddressbookServiceRankings;
