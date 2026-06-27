import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbDeleteRecord, dbExecuteSp, setVoucherParamValues } from '../../../../actions';
import { convertDMY_MDY, getNowDate} from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm } from "./GetVoucherMailingData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {deleteVoucherDetails} from "../../../common/VoucherHelpers";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../common/PopupDialogBox';
import DropDownButton from 'devextreme-react/drop-down-button';
import {Button} from 'devextreme-react/button';
import VoucherMailingParams from './VoucherMailingParams';
import VoucherMailingRemarks from './VoucherMailingRemarks';
import VoucherSendMail from './VoucherSendMails';

import '../../../common/MasterGrid.css'

let compVar = {};

function VoucherMailing(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  let _g_tourCode = useSelector(state => state.voucherParams.tourCode) || '';
  let _g_tourDate = useSelector(state => state.voucherParams.tourDate) || null;
  let _g_tourLeader = useSelector(state => state.voucherParams.paxName) || '';
  let _g_tourRef = useSelector(state => state.voucherParams.tourRef) || '';

  const _g_users_id = useSelector(state => state.dbUser.users_id);

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
      userLookup: [],  mainData: [],
      tableName: 'Vouchers', keyField: 'Vouchers_id',
      masterDescField: '',
      mainTitle: 'Select Vouchers for Mailing', title: 'New Voucher',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}], 
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      tourCode: _g_tourCode, tourDate: _g_tourDate, tourLeader: _g_tourLeader,
      paxName: _g_tourLeader,
      tourRef: _g_tourRef, companies_id: 1, offices_id: 2,
      admLevel: 1,
      formChanged: false, 
      numRows: 0, numSelectedVouchers: 0, numRequestedRows: 0,
      numConfirmedRows: 0, numCancelledRows: 0, statusPendingStr: '',
      confirmation: false, voucherSendMailPopup: false,
      voucherMailRemarksPopup: false,
      dbLookup: [       
      ],
      actionList: [
        {key2: 1, text: 'Mail Service Requests'}, 
        {key2: 2, text: 'Mail Cancellation Requests'}, 
        {key2: 3, text: 'Create PDFs for Selected'}, 
      ],
      selectionDataSource : [
        {key2: 1, text: 'Select UnRequested'}, 
        {key2: 2, text: 'Select All'}, 
        {key2: 3, text: 'Clear All Selections'}, 
      ],
  
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

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const tourDate = convertDMY_MDY(compVar.tourDate);

    try {  
      const query = "EXEC p_VoucherMailingList '" + compVar.tourCode + "', '" + tourDate + "'";
      compVar.mainData = await dbGetRecordRaw({query: query});

      /*=== add a field for selected record ===*/
      /*=== by default, select records where RequestedOn is null ===*/
      if (compVar.mainData.length > 0) {
        compVar.mainData = compVar.mainData.map(obj => ({ ...obj, Selected: (obj.RequestedOn !== null) ? false : true }));
      }

      compVar.numRows = compVar.mainData.length;
      setStatusLabel();
      compVar.numSelectedVouchers = compVar.mainData.filter(rec => rec.Selected === true).length;
        
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {
    compVar.voucherMailRemarksPopup = true;
    forceRender();
  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {
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
      forceRender();
    } 
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.CancelledOn !== null) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.style.textDecorationLine = 'line-through';
      }  
    }
  }

  //**********************************************************/
  const onContextMenuPreparing = (e) => {

    if (compVar.admLevel < 3) {
      return;
    }

    if (e.target === 'content') {
  
      if (!e.items) e.items = []; 

      let caption = [];

      if (e.row.data.RequestedOn === null) {
        caption.push({text: "Set Requested On", action: async () => {setRequestedOn(e.row.data)}, display: true});
      }

      if ((e.row.data.RequestedOn !== null) && (e.row.data.ConfirmedOn === null)) {
        caption.push({text: "Set Confirmed On", action: async () => {setConfirmedOn(e.row.data)}, display: true});
      }

      if ((e.row.data.RequestedOn !== null) && (e.row.data.CancelledOn === null)) {
        caption.push({text: "Set Cancelled On", action: async () => {setCancelledOn(e.row.data)}, display: true});
      }

      if ((e.row.data.RequestedOn !== null) && (e.row.data.ConfirmedOn === null) && (e.row.data.CancelledOn === null)) {
        caption.push({text: "Undo Request", action: async () => {undoRequestedOn(e.row.data)}, display: true});
      }

      if ((e.row.data.ConfirmedOn !== null) && (e.row.data.CancelledOn === null)) {
        caption.push({text: "Undo Confirmation", action: async () => {undoConfirmedOn(e.row.data)}, display: true});
      }

      if (e.row.data.CancelledOn !== null) {
        caption.push({text: "Undo Cancellation", action: async () => {undoCancelledOn(e.row.data)}, display: true});
      }
            
      for (let i=0; i<caption.length; i++) {
        if (caption[i].display) {
          e.items.push({
            text: caption[i].text,
            onItemClick: async () => {
              await caption[i].action();
              forceRender();
            }
          });        
        }
      }
  
    }

  }

  //**********************************************************/
  const setStatusLabel = async() => {

    compVar.numRequestedRows = compVar.mainData.filter(rec => (rec.RequestedOn !== null)).length;
    compVar.numConfirmedRows = compVar.mainData.filter(rec => (rec.RequestedOn !== null && rec.ConfirmedOn !== null)).length;
    compVar.numCancelledRows = compVar.mainData.filter(rec => (rec.RequestedOn !== null && rec.CancelledOn !== null)).length;

    const numRequestedPending = compVar.numRows - compVar.numRequestedRows;
    const numConfirmedPending = compVar.numRequestedRows - compVar.numConfirmedRows;

    compVar.statusPendingStr = '';
    if (numRequestedPending > 0) {
      compVar.statusPendingStr += numRequestedPending.toString() + ' pending request' + ((numRequestedPending > 1) ? 's' : '');
    }
    if (numConfirmedPending > 0) {
      if (compVar.statusPendingStr > '') {
        compVar.statusPendingStr += ', ';
      }
      compVar.statusPendingStr += numConfirmedPending.toString() + ' pending confirmation' + ((numConfirmedPending > 1) ? 's' : '');
    }
    if (compVar.numCancelledRows > 0) {
      if (compVar.statusPendingStr > '') {
        compVar.statusPendingStr += ', ';
      }
      compVar.statusPendingStr += compVar.numCancelledRows.toString() + ' cancellation' + ((compVar.numCancelledRows > 1) ? 's' : '');
    }
  }

  //**********************************************************/
  const onActionDropDownClick = async(e) => {
    if (e.itemData.key2 === 1) {      
      compVar.confirmation = true;
      compVar.voucherSendMailPopup = true;
    } else if (e.itemData.key2 === 2) {
      compVar.confirmation = false;
      compVar.voucherSendMailPopup = true;
    } else if (e.itemData.key2 === 3) {
      compVar.confirmation = null;
      compVar.voucherSendMailPopup = true;
    } 
    forceRender();
  }


  //**********************************************************/
  const onSelectionActionDropDownClick = async(e) => {
    if (e.itemData.key2 === 1) {
      compVar.mainData = compVar.mainData.map(rec => ({...rec, Selected: (rec.RequestedOn !== null) ? false : true }));      
    } else if (e.itemData.key2 === 2) {
      compVar.mainData = compVar.mainData.map(rec => ({...rec, Selected: true}));      
    } else if (e.itemData.key2 === 3) {
      compVar.mainData = compVar.mainData.map(rec => ({...rec, Selected: false}));      
    } 
    setStatusLabel();
    compVar.numSelectedVouchers = compVar.mainData.filter(rec => rec.Selected === true).length;
    forceRender();
  }

  //**********************************************************/
  const onCellClick = (e) => {    
    if (e.rowType === 'data' && e.column.dataField === 'Selected') {      
      const vouchers_id = e.data.Vouchers_id;

      const index = compVar.mainData.findIndex(o => o.Vouchers_id === vouchers_id);

      if (index >= 0) {
        compVar.mainData[index].Selected = !compVar.mainData[index].Selected;
        // otherwise even a render may not change the data as it would think the array data has not changed
        compVar.mainData = [...compVar.mainData];
      }
      compVar.numSelectedVouchers = compVar.mainData.filter(rec => rec.Selected === true).length;

      setStatusLabel();
      forceRender();
    }
  }

  //**********************************************************/
  const getSelectedParams = async (e) => {

    compVar.tourCode = e.tourCode;
    compVar.tourDate = e.tourDate;
    compVar.tourLeader = e.paxName;
    compVar.paxName = e.paxName;
    compVar.tourRef = e.tourRef;
    
    // Save to the REDUX store
    dispatch(setVoucherParamValues({
      tourCode: e.tourCode, 
      tourDate: e.tourDate, 
      paxName: e.paxName, 
      tourLeader: e.paxName,
      tourRef: e.tourRef
    }));

    // Only when 'Refresh' button is clicked in Params
    if (e.dataRefreshMode === 1) {
      compVar.isVoucherDataReady = false; 
      forceRender();
    }

    // this will also render
    await filterData();
    
  }

  //**********************************************************/
  const getSelectedVoucherMailingOption = async (e) => {
    compVar.voucherMailRemarksPopup = e.open;    

    // call this later otherwise the Mail Remarks popup will open again
    if (e.refresh) {
      await filterData();
    } else {
      forceRender();
    }
  }

  //**********************************************************/
  const getSelectedVoucherSendMailOption = async (e) => {
    compVar.voucherSendMailPopup = e.open;    

    // call this 2nd otherwise voucher send mail screen will popup again
    if (e.refresh) {
      await filterData();
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const setRequestedOn = async (e) => {
    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    const obj = (e !== null && e.VoucherDetails_id !== undefined) ? e : compVar.mainData[idx];
    await setStatusDate(obj, 1, true);
  }

  //**********************************************************/
  const setConfirmedOn = async (e) => {
    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    const obj = (e !== null && e.VoucherDetails_id !== undefined) ? e : compVar.mainData[idx];
    await setStatusDate(obj, 2, true);
  }

  //**********************************************************/
  const setCancelledOn = async (e) => {
    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    const obj = (e !== null && e.VoucherDetails_id !== undefined) ? e : compVar.mainData[idx];
    await setStatusDate(obj, 3, true);
  }

  //**********************************************************/
  const undoRequestedOn = async (e) => {
    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    const obj = (e !== null && e.VoucherDetails_id !== undefined) ? e : compVar.mainData[idx];
    await setStatusDate(obj, 1, false);
  }

  //**********************************************************/
  const undoConfirmedOn = async (e) => {
    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    const obj = (e !== null && e.VoucherDetails_id !== undefined) ? e : compVar.mainData[idx];
    await setStatusDate(obj, 2, false);
  }

  //**********************************************************/
  const undoCancelledOn = async (e) => {
    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    const obj = (e !== null && e.VoucherDetails_id !== undefined) ? e : compVar.mainData[idx];
    await setStatusDate(obj, 3, false);
  }

  //**********************************************************/
  const setStatusDate = async (obj, type, value) => {

    const voucherTypesArr = [
      {voucherTypes_id: 2, tableName: 'VouchersTickets', fieldName: 'VouchersTickets_id'},
      {voucherTypes_id: 3, tableName: 'VouchersAccommodation', fieldName: 'VouchersAccommodation_id'},
      {voucherTypes_id: 4, tableName: 'VouchersServices', fieldName: 'VouchersServices_id'},
      {voucherTypes_id: 5, tableName: 'VouchersTransport', fieldName: 'VouchersTransport_id'},
    ];

    const statusTypesArr = [
      {statusTypes_id: 1, fieldName: 'RequestedOn'},
      {statusTypes_id: 2, fieldName: 'ConfirmedOn'},
      {statusTypes_id: 3, fieldName: 'CancelledOn'},
    ];

    const val = value ? "'" + getNowDate('MM/DD/YYYY') + "'" : 'null';

    const voucherType = voucherTypesArr.filter(rec => rec.voucherTypes_id === obj.VoucherTypes_id);
    const statusType = statusTypesArr.filter(rec => rec.statusTypes_id === type);

    const sql = "UPDATE " + voucherType[0].tableName + " " +
      "SET " + statusType[0].fieldName + " = " + val + " " +
      "WHERE " + voucherType[0].fieldName + " = " + obj.VoucherDetails_id.toString();

    const spData = {sql: sql}
    await dbExecuteSp(spData);

    await filterData();

  }


  //**********************************************************/
  const buttonsJsx = (index) => {

    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);

    let hintRequested = '';
    let hintConfirmed = '';
    let hintCancelled = '';
    let clickRequested = null;
    let clickConfirmed = null;
    let clickCancelled = null;
    let disabledRequested = true;
    let disabledConfirmed = true;
    let disabledCancelled = true;
    if (idx > -1) {
      clickRequested = (compVar.mainData[idx].RequestedOn === null) ? setRequestedOn : undoRequestedOn;
      clickConfirmed = (compVar.mainData[idx].RequestedOn !== null && compVar.mainData[idx].ConfirmedOn === null) ? setConfirmedOn : undoConfirmedOn;
      clickCancelled = (compVar.mainData[idx].RequestedOn !== null && compVar.mainData[idx].CancelledOn === null) ? setCancelledOn : undoCancelledOn;

      hintRequested = (compVar.mainData[idx].RequestedOn === null) ? 'Set Requested On' : 'Undo Request';
      hintConfirmed = (compVar.mainData[idx].ConfirmedOn === null) ? 'Set Confirmed On' : 'Undo Confirmation';
      hintCancelled = (compVar.mainData[idx].CancelledOn === null) ? 'Set Cancelled On' : 'Undo Cancellation';

      disabledRequested = (compVar.mainData[idx].ConfirmedOn !== null || compVar.mainData[idx].CancelledOn !== null) ? true : false;
      disabledConfirmed = (compVar.mainData[idx].RequestedOn === null || compVar.mainData[idx].CancelledOn !== null) ? true : false;
      disabledCancelled = (compVar.mainData[idx].RequestedOn === null) ? true : false;

    } 

    const widths = [35,35,35];
    const types = ['normal','normal','normal'];
    const stylingModes = ['outlined','outlined','outlined'];
    const icons = ['icons/rank.png','icons/allow.png','icons/disallow.png'];
    const hints = [hintRequested, hintConfirmed, hintCancelled];
    const clicks = [clickRequested, clickConfirmed, clickCancelled];
    const disabledArr = [disabledRequested, disabledConfirmed, disabledCancelled];

    const width = widths[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];
    const disabled = disabledArr[index];

    return (
      <Button
        width={width}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        hint={hint}
        onClick={click}
        disabled={disabled}
      />
    );
  }


  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = ['Actions for Selected', 'Selections'];
    const icons = ['bulletlist','bulletlist']
    const widths = [200,160];
    const dropDownOptions = [{width: 230},{width: 230}];
    const items = [compVar.actionList,compVar.selectionDataSource];
    const onItemClicks = [onActionDropDownClick,onSelectionActionDropDownClick];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={"id"}
        displayExpr={"text"}
        onItemClick={onItemClick}
      />
    )

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    if (Object.keys(compVar).length === 0) {
      return {}
    }

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
      onRowPrepared: onRowPrepared,
      onCellClick: onCellClick,
      onContextMenuPreparing: onContextMenuPreparing, /*=== Right click menu ===*/
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    if (Object.keys(compVar).length === 0) {
      return {}
    }

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: []
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
      if (compVar.focusedRowKey !== null) {
        await deleteVoucherDetails(compVar.focusedRowKey);
      }
      await dbDeleteRecord(recObj);
      await filterData();
    }
  }
    

  //**********************************************************/
  const renderContent = () => {

    const paramsPanelHeight = 30;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-paramsPanelHeight;
    const viewHeight = heights.viewHeight-paramsPanelHeight;

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();
    const elementProps = createElementProps();

    let voucherObj = {}
    if (compVar.mainData !== undefined) {
      voucherObj = compVar.mainData.find(o => o[compVar.keyField] === compVar.focusedRowKey);
    }

    return (
      <>

        <VoucherMailingParams
          //height={panelHeight}
          getSelectedParams={getSelectedParams}          
          //onPanelLoad={onPanelLoad}
        />

        {(!initDataFetched || !dataFetched) &&
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        }

        {initDataFetched && dataFetched &&
          <div className="master-grid-container" style={{height: containerHeight}}>

            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
              <div className="master-grid-params-container" style={{flex: 1}}>
                <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: 'blue', fontSize: 16}}>
                  {compVar.statusPendingStr}
                </div>
              </div>
              <div style={{flex: 1}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container" style={{flex: 0.8}}>
                {dropDownButtonJsx(0)}
                {dropDownButtonJsx(1)}
              </div>
              <div className="master-grid-params-container" style={{flex: 0.5}}>
                {buttonsJsx(0)}
                {buttonsJsx(1)}
                {buttonsJsx(2)}
              </div>
            </div>        

            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
            </div>

            <div>
              {compVar.isPanelDataReady && getDevExtremePopupForm(formObj,dataObj)}
            </div>

            {compVar.voucherMailRemarksPopup && compVar.mainData.length > 0 &&
              <VoucherMailingRemarks 
                tourCode={compVar.tourCode} 
                tourDate={compVar.tourDate} 
                voucherObj={voucherObj}
                getSelectedVoucherMailingOption={getSelectedVoucherMailingOption}
              >
              </VoucherMailingRemarks>
            }

            {compVar.voucherSendMailPopup && compVar.mainData.length > 0 &&
              <VoucherSendMail 
                tourCode={compVar.tourCode} 
                tourDate={compVar.tourDate} 
                paxName={compVar.paxName}
                numSelectedVouchers={compVar.numSelectedVouchers}
                confirmation={compVar.confirmation}
                getSelectedVoucherSendMailOption={getSelectedVoucherSendMailOption}
                voucherData={compVar.mainData.filter(rec => rec.Selected === true)}
              >
              </VoucherSendMail>
            }

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
        }

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default VoucherMailing;
