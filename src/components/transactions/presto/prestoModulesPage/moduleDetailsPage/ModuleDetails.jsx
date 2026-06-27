import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { beforeInsert, getLookupValues, saveEditedInsertedData, checkNullErrors, convert_DbDate_To_MDY, convert_DbDate_To_DMY, getFieldsArray, saveReordedListToDB, getReorderedList, setDateTimeFormat, convertDMYtoDate, dateDiff, convertToMoment_fmt } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetModuleDetailsData";
import { canDelete } from "../../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { popupTitle } from "../../../../common/HelperComponents";
import {defaultTourOperatorGst, getSubOrderNo, hasLinkedItems, getClonedData} from "../../../../common/ModuleHelpers";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getAdmLevelLocation, getQuotationFromModules} from "../../../../common/GetDescFromIds";
import {updateLineTotals, workBackwardsFieldsSet} from "../../../../common/ModuleHelpers";
import {getNavButtonsJsx, navPrevRecordClick, navNextRecordClick, setStopNav} from "../../../../common/NavigationHelpers";
import PopupDialogBox from '../../../../common/PopupDialogBox';
import CostQuickEntry from "../../../../common/CostQuickEntry";
import DropDownButton from 'devextreme-react/drop-down-button';
import ElementsSearchResults from '../../../elements/elementsSearchResultsPage/ElementsSearchResults';

import '../../../../common/MasterGrid.css'

let compVar = {};

function ModuleDetails(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [rowDragging, setRowDragging] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);

  const gridRef = useRef(null);
  const handledRow = useRef(false);

  // onRowPrepared only fires once per row (when devextreme first renders it),
  // not on every click/forceRender, so it can't keep the highlight in sync by
  // itself - re-apply it directly via the grid instance API on every render
  useEffect(() => {
    if (!gridRef.current) return;
    const instance = gridRef.current.instance;
    const visibleRows = instance.getVisibleRows();
    visibleRows.forEach((row) => {
      if (row.rowType !== 'data') return;
      const rowElement = instance.getRowElement(row.rowIndex)[0];
      if (!rowElement) return;
      if (row.key === compVar.focusedRowKey) {
        rowElement.style.backgroundColor = '#cce5ff';
        rowElement.classList.add('dx-row-focused');
      } else {
        // restore the grouping color from onRowPrepared instead of leaving
        // a stale highlight color behind
        const mainOrderNo = row.data.MainOrderNo !== null ? row.data.MainOrderNo : 0;
        const index = mainOrderNo % 5;
        if ((row.data.FixedItin_id === null || row.data.FixedItin_id === 0) && (row.data.ParentFixedItin_id === null || row.data.ParentFixedItin_id === 0)) {
          rowElement.style.backgroundColor = compVar.backgroundColors[0];
        } else {
          rowElement.style.backgroundColor = compVar.backgroundColors[index + 1];
        }
        rowElement.classList.remove('dx-row-focused');
      }
    });
  }, [renderToggle]);

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
      clonedMainData: [], placeOfSupplyLookup: [], 
      moduleDataSource: [],
      tableName: 'QuoModuleDetails', keyField: 'QuoModuleDetails_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: `${props.tourCode}`,
      mainTitle: 'Module Line Items', title: `${props.tourCode}`,
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 590,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, setStopNavigation, workBackwardsProc],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      rowDragging: false, onReorder: onReorder,  
      importElementMode: false, actionList: [],
      admLevel: 1,
      topPanelHeight: 40, showAll: true, isModuleReorder: false, 
      quickEntryData: false, quickEntryHeaderData:[], sqlTotal: '', auditString: '', 
      navigationButtonList: [
        {id: "formPrevButton", text: "", type: "normal", visible: true, icon: "chevronleft", onClick: navigatePrevRecordClick, hint: "Previous Voucher"},
        {id: "formNextButton", text: "", type: "normal", visible: true, icon: "chevronright", onClick: navigateNextRecordClick, hint: "Next Voucher"},
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: true, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ], 
      formChanged: false, saveLeaveOpen: false, afterSaveType: 0,         
      backgroundColors: ['#ffffb3', '#d9ffb3', '#ccffee', '#ffe0cc', '#cce6ff', '#ffecb3'],
      dbLookup: [       
        {keyField: 'PlaceOfSupply', dataSource: compVar.placeOfSupplyLookup, 
        displayExpr: 'PlaceOfSupply', valueExpr: 'PlaceOfSupply', fieldList: ['PlaceOfSupply']},

        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
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
  // This is done to overcome a bug in datagrid where summaries are displayed twice
  // This happens only on the initial display of the grid. Goes away as you interact wih it
  // ... Simulate moving to lower row and back to first row, which shows only a single summary thereafter
  // disabled: this effect has no dependency array, so it re-runs on every render
  // (including every row-click re-render) and was resetting focusedRowKey back
  // to row 0 each time, which is why clicking a row appeared to do nothing
  //useEffect(() => {

    // if already handled, return
  //  if (handledRow.current) return;

    // Simulate focusing on the second row after a delay
  //  setTimeout(() => {
  //    handleRowClick(1); // Focusing on the second row (index 1)
  //  }, 10); // Delay in milliseconds

  //});
  
  //**********************************************************/
  const handleRowClick = (index) => {
    // Focus on the row when it is clicked
    if (gridRef.current && gridRef.current.props.children.length > index && compVar.mainData.length > 1) {
      gridRef.current.instance.option('focusedRowKey', compVar.mainData[index].QuoModuleDetails_id);
      gridRef.current.instance.option('focusedRowKey', compVar.mainData[index-1].QuoModuleDetails_id);

      // Flag as handled
      handledRow.current = true;
    }    
  };  
  
  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.placeOfSupplyLookup = await dbGetRecord({fields: ['PlaceOfSupply, Home'], orders: ['PlaceOfSupply'], table: 'PlaceOfSupply'});   
      compVar.dbLookup[0].dataSource = compVar.placeOfSupplyLookup;  

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Addressbook Contacts'});   
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
      const whereStr = 'QuoModules_id = ' + props.quoModules_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['COALESCE(MainOrderNo,0), SubOrderNo, COALESCE(ParentFixedItin_id,0)'], table: 'QuoModuleDetails', where: whereStr, x_uid: _g_users_id, x_module: 'Invoice Details'});   

      computeInvoiceAmt();

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      compVar.clonedMainData =  [...compVar.mainData];     

      const moduleObj = await getQuotationFromModules(props.quoModules_id);    
      compVar.quotations_id = moduleObj.quotations_id;

      // Create list of actions based on groups like 'Authentic Starter Pack',... and add 'Clear Link'
      compVar.moduleDataSource = [];
      compVar.moduleDataSource = compVar.mainData.filter(rec => rec.FixedItin_id !== null).map(item => ({key2: item.FixedItin_id, text: 'Link to - ' + item.QuoModuleDetails, display: true, mainOrderNo: item.MainOrderNo, clear: false}) );
      compVar.moduleDataSource.push({key2: -1, text: 'Clear Link', display: true, mainOrderNo: null, clear: true});

      // Set menu based on first record
      if (compVar.mainData.length > 0) {
        setMenu(compVar.mainData[0], null);
      }
  
    } catch(err) {
      alert(err);
    }

    setFocusedRow(compVar);

    // Flag as unhandled, so that it again simulates moving down one row and back again
    handledRow.current = false;

    setDataFetched(true);

  }

  //**********************************************************/
  const editRow = async (e) => {

    if (props.invoices_id > 0) {
      compVar.errorMsg = 'Cannot edit - Module invoiced';
      forceRender();
      return;
    }

    afterEdit(compVar, e);
    compVar.formTitle = `${props.tourCode} ${props.tourDate}`;

    // Change Layout depending on what is being edited
    const fixedItin_id = e.row.data['FixedItin_id'];
    if (fixedItin_id !== null && fixedItin_id > 0) {
      changeLayout(false, false);
    } else {
      changeLayout(true, true);
    }

    compVar.saveLeaveOpen = false;
    toggleEditPopup();    

  }

  //**********************************************************/
  const addRow = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    if (props.invoices_id > 0) {
      compVar.errorMsg = 'Cannot add - Module invoiced';
      forceRender();
      return;
    }

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    let xDate = convertDMYtoDate(props.tourDate);

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      QuoModules_id: props.quoModules_id, 
      DateIn: xDate,
      DateOut: xDate,
      ServTaxPerc: await defaultTourOperatorGst(xDate)
    }

    afterAdd(compVar, defaultObj);

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (props.invoices_id > 0) {
      compVar.errorMsg = 'Cannot delete - Module invoiced';
      forceRender();
      return;
    }

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

    // Always allow
    let condition = "WHERE  1=2";

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

    await manipulateDataBeforeSave (compVar.formMode, compVar.formData);    
    
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

    if (formData.DateIn !== null && formData.DateOut !== null) {

      const fromDate = convertToMoment_fmt(formData.DateIn,'');
      const toDate = convertToMoment_fmt(formData.DateOut,'');

      // Check other errors here like is amount < 0, is date less than today ....
      if (fromDate > toDate) {
        return "'To Date' has to be greater than 'From Date'";
      }
    }

    // module date has to lie in date range
    //if ((formData.Qty === null || formData.Qty === 0) && (formData.FixedItin === null)) {
    //  return 'Place specify the qty';
    //}
    if (formData.Qty === null) {
      formData.Qty = 0;
    }

    // Cost should be Qty* Rate
    if ((Math.abs(formData.Cost - formData.Qty*formData.Rate) > 1) && (formData.FixedItin === null)) {
      return 'Item Amount should be Qty*Rate';
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
  const getSelectedPlaceOfSupply = (e) => {
    compVar.formData.PlaceOfSupplyLine = e[0].PlaceOfSupply;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearPlaceOfSupplyLookup = () => {
    compVar.formData.PlaceOfSupplyLine = null;
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
    compVar.tabIndex = 0;  
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
  // Row highlighting on this grid is driven entirely by app state (see
  // focusedRowEnabled: false in createDataObject, and the highlight effect
  // above) rather than devextreme's own focusedRowKey mechanism, which was
  // unreliable here. onRowClick is used instead of onFocusedRowChanged since
  // it's a more direct event. Crucially, forceRender() is deferred via
  // setTimeout: calling it synchronously from inside devextreme's own click
  // handling raced with devextreme's internal post-click bookkeeping and
  // caused the focus state to immediately revert.
  const onRowClick = (e) => {

    if (e.data !== undefined) {

      const id = e.data[compVar.keyField];

      setMenu(e.data, null);

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;
        setTimeout(() => forceRender(), 0);
      }

    }

  }

  //**********************************************************/
  const onFormFieldDataChanged = async (e) => {
    compVar.formChanged = true;
    
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 

    // Invoice Date change, change yearref
    if ((e.dataField === 'Rate') || 
        (e.dataField === 'Qty') ||
        (e.dataField === 'ServTaxPerc')) {
        await updateLineTotals (compVar.formData);
        forceRender();
      }

  }

  //**********************************************************/
  const onRowPrepared = async(e) => {        

    if (e.rowType === 'data') {
      const mainOrderNo = e.data.MainOrderNo !== null ? e.data.MainOrderNo : 0;
      const index = mainOrderNo%5;

      // If Main Module item (under which items are grouped)
      if ((e.data.FixedItin_id !== null) && (e.data.FixedItin_id > 0)) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.style.fontWeight = 500; 
      } 
      
      if ((e.data.TotalAmt !== null) && (e.data.TotalAmt < 0)) {
        e.rowElement.style.color = 'red'; 
      }

      // Background color yellow if orphaned (1st in color array)
      if ((e.data.FixedItin_id === null || e.data.FixedItin_id === 0) && (e.data.ParentFixedItin_id === null || e.data.ParentFixedItin_id === 0)) {
        e.rowElement.style.backgroundColor = compVar.backgroundColors[0];
      } else {
        e.rowElement.style.backgroundColor = compVar.backgroundColors[index+1];
      }

      // App-driven row highlight (focusedRowEnabled is off on this grid - see
      // dataObj construction below for why), applied last so it always wins
      // over the grouping background color above
      if (e.data[compVar.keyField] === compVar.focusedRowKey) {
        e.rowElement.style.backgroundColor = '#cce5ff';
        e.rowElement.classList.add('dx-row-focused');
      } else {
        e.rowElement.classList.remove('dx-row-focused');
      }

    }
  }

  //**********************************************************/
  const onContextMenuPreparing = async(e) => {

    if (e.target === 'content') {
  
      if (!e.items) e.items = [];       

      setMenu(e.row.data, e);

    }

  }

  //**********************************************************/
  const linkModuleTo = async(rowObj, id, type) => {

    let idStr = (type === 1) ? id.toString() : 'null';

    let sql = "EXEC p_ModulesSetOrderNo " + rowObj.QuoModuleDetails_id.toString() + ", " +
            idStr + ", " + _g_users_id.toString();

    let  spData = {sql: sql};
    await dbExecuteSp(spData);

    await filterData();

  }


  //**********************************************************/
  const setMenu = (rowData, e) => {

    let filteredModuleDataSource = [];
    
    if (rowData.FixedItin_id === null) {
      if (rowData.ParentFixedItin_id !== null && rowData.ParentFixedItin_id > 0) {
        filteredModuleDataSource = compVar.moduleDataSource.filter(rec => rec.key2 !== rowData.ParentFixedItin_id);
      } else {
        filteredModuleDataSource = compVar.moduleDataSource.filter(rec => rec.clear === false);
      }
    }

    for (const rec of filteredModuleDataSource) {
      if (rec.key2 > 0) {
        rec.action = () => {linkModuleTo(rowData, rec.key2, 1)}
      } else {
        rec.action = () => {linkModuleTo(rowData, null, 2)}
      }    
    }
      
    compVar.actionList = filteredModuleDataSource.map(rec => {
      return {text: rec.text, onItemClick: async () => {await rec.action()}}
    });

    // For right clicks, e is not null
    if (e !== undefined && e !== null) {
      e.items = [...compVar.actionList];      
    }

    forceRender();

  }


  //**********************************************************/
  const onTabOptionChanged = (e) => {
    if ((e.addedItems !== undefined) && (e.addedItems.length > 0)) {
      const selectedTab = e.addedItems[0].title;
      let obj = compVar.tabs.find(o => o.title === selectedTab);
      let selectedTabIndex = obj.index;
      compVar.tabIndex = selectedTabIndex;  
    }
  }

  //**********************************************************/
  const onActionDropDownClick = async(e) => {
    if (e.itemData.onItemClick !== undefined) {
      e.itemData.onItemClick();
    }
  }

  //**********************************************************/
  const manipulateDataBeforeSave = async (formMode, formData) => {

    // SubOrderNo in add mode
    if (formMode === 1) {
      const subOrderNo = await getSubOrderNo (formData.QuoModules_id, formData.MainOrderNo);
      formData.SubOrderNo = subOrderNo;
    }

    // RecType
    if (formData.FixedItin_id !== null && formData.FixedItin_id > 0) {
      formData.RecType = 1;
    } else if (formData.ParentFixedItin_id > 0 && formData.Rate > 0) {
      formData.RecType = 2;
    } else if (formData.ParentFixedItin_id > 0 && formData.Rate < 0) {
      formData.RecType = 3;
    } else {
      formData.RecType = 4;
    }

    // DayNo from DateIn
    if (formData.DateIn !== null && props.tourDate !== null) {
      formData.DayNo = dateDiff(formData.DateIn, convert_DbDate_To_DMY(props.tourDate,1), 'days');
    } else {
      formData.DayNo = null;
    }

    // Nights
    if (formData.DateIn !== null && formData.DateOut !== null) {
      formData.Nights = dateDiff(formData.DateOut, formData.DateIn, 'days');
    } else {
      formData.Nights = null;
    }

    // Accommodation Records
    if (formData.TrsType === 2) {

      let qtyChanged = false;

      // Check if accommodation record using Singles, Doubles, Triples, Twins
      if (formData.QuoModuleDetails.includes('single') || formData.QuoModuleDetails.includes('Single')) {
        if (formData.Qty !== formData.Nights * props.numSingles) {
          formData.Qty = formData.Nights * props.numSingles;
          qtyChanged = true;
        } 
      }
      if (formData.QuoModuleDetails.includes('double') || formData.QuoModuleDetails.includes('Double')) {
        if (formData.Qty !== formData.Nights * props.numDoubles) {
          formData.Qty = formData.Nights * props.numDoubles;
          qtyChanged = true;
        }
      }
      if (formData.QuoModuleDetails.includes('triple') || formData.QuoModuleDetails.includes('Triple')) {
        if (formData.Qty !== formData.Nights * props.numTriples) {
          formData.Qty = formData.Nights * props.numTriples;
          qtyChanged = true;
        }
      }
      if (formData.QuoModuleDetails.includes('twin') || formData.QuoModuleDetails.includes('Twin')) {
        if (formData.Qty !== formData.Nights * props.numTwins) {
          formData.Qty = formData.Nights * props.numTwins;
          qtyChanged = true;
        }
      }

      if (qtyChanged) {
        compVar.formData = {...formData}
        const changedObj = await this.computeLineTotals();    
        formData = {...formData,...changedObj};              
      }

    }

    // Add: & Less: comments
    if (formData.QuoModuleDetails.includes('Add:') && formData.TotalAmt < 0) {
      formData.QuoModuleDetails = formData.QuoModuleDetails.replace('Add:','Less:');
    } else if (formData.QuoModuleDetails.includes('Less:') && formData.TotalAmt > 0) {
      formData.QuoModuleDetails = formData.QuoModuleDetails.replace('Less:','Add:');
    } 

  }

  //**********************************************************/
  const workBackwards = async (e) => {
    compVar.popupDialogIndex = 2;
    compVar.dialogMessage1 = 'Are you sure you want work backwards from the final figure?'
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const workBackwardsProc = async (e) => {

    // close dialog box
    compVar.popupDialogIndex = 0;
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {
      workBackwardsFieldsSet(compVar.formData);
      forceRender();
    }

  }
 
  //**********************************************************/
  const insertRec = async () => {
    compVar.importElementMode = true;
    forceRender();
  }

  //**********************************************************/
  const getSelectedElementSearchOption = async (e) => {
    compVar.importElementMode = false;
    forceRender();
    if (e.refresh !== undefined && e.refresh) {
      await filterData();
    }
  }


  //**********************************************************/
  const moveToTop = async(e) => {

    let sql = "EXEC p_ModulesMoveTopBottom " + compVar.focusedRowKey.toString() + ", " +
              "1, " + _g_users_id.toString();

    let spData = {sql: sql};
    await dbExecuteSp(spData);

    await filterData();

  }

  //**********************************************************/
  const moveToBottom = async(e) => {

    let sql = "EXEC p_ModulesMoveTopBottom " + compVar.focusedRowKey.toString() + ", " +
              "2, " + _g_users_id.toString();

    let spData = {sql: sql};
    await dbExecuteSp(spData);

    await filterData();

  }

  //**********************************************************/
  const showAllToggle = async() => {
    compVar.showAll = !compVar.showAll;
    forceRender();
  }

  //**********************************************************/
  const quickCancelEntry = async() => {

    const query = "SELECT QuoModuleDetails_id, CONVERT(VARCHAR(10),DateIn,103) AS DateIn, " + 
      "QuoModuleDetails, CancelPerc from QuoModuleDetails " +
      "WHERE QuoModules_id = " + props.quoModules_id.toString() + " " +
      "AND TrsType in (1,2,3,4,5) " +
      "ORDER BY COALESCE(MainOrderNo,0), SubOrderNo, COALESCE(ParentFixedItin_id,0)";
    
    compVar.quickEntryData = await dbGetRecordRaw({query: query});

    compVar.quickEntryHeaderData = [
      {field: 'QuoModuleDetails_id', caption: 'ID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'DateIn', caption: 'Date', allowEditing: false, width: 100, visible: true, dataType: 'string'},
      {field: 'QuoModuleDetails', caption: 'Details', allowEditing: false, width: 350, visible: true, dataType: 'string'},
      {field: 'CancelPerc', caption: 'Cancel(%)', allowEditing: true, width: 100, visible: true, dataType: 'number'},
    ];

    compVar.sqlTotal = "";
    compVar.auditString = "";

    compVar.displayQuickCost = true;
    forceRender();

  }

  //**********************************************************/
  const onQuickClose = async () => {
    compVar.displayQuickCost = false;
    await filterData();
    forceRender();
  }

  //**********************************************************/
  const changeLayout = (display, required) => {

    const fieldsVisibleArray = ['DateIn', 'DateOut', 'EmptyItem', 'Rate', 'Qty', 'Cost'];
    
    fieldsVisibleArray.forEach (elem => {      
      const index = tableHeaderArray.findIndex(rec => rec.field === elem && rec.groupNo === 0);
      tableHeaderArray[index].visibleInForm = display;
    })

    const fieldsReqdArray = ['Rate', 'Qty', 'Cost', 'ServTaxPerc', 'PlaceOfSupplyLine'];
    fieldsReqdArray.forEach (elem => {      
      const index = tableHeaderArray.findIndex(rec => rec.field === elem);
      tableHeaderArray[index].required = required;
    })
    
  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const actionsDisabled = (rowDragging || props.invoices_id);

    const texts = ['Actions for Selected'];
    const icons = ['bulletlist']
    const widths = [200];
    const dropDownOptions = [{width: 350}];
    const items = [compVar.actionList];
    const onItemClicks = [onActionDropDownClick];
    const disableds = [actionsDisabled];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    const disabled = disableds[index];
    
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
        disabled={disabled}
      />
    )

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
  const computeInvoiceAmt = () => {
    const cancelledArray = compVar.mainData.filter(rec => rec.CancelPerc !== null && rec.CancelPerc !== 0);
    const isCancelled = (cancelledArray.length > 0) || (props.cancelled);

    for (const rec of compVar.mainData) {
      rec.InvAmt = (isCancelled && rec.CancelPerc > 0) ? (rec.CancelPerc/100)*rec.TotalAmt : rec.TotalAmt;
    }
      
  }

  //**********************************************************/
  const modifyColumnLayout = () => {

    const fields = ['CancelPerc','InvAmt'];

    if (compVar.mainData === undefined) return;

    const cancelledArray = compVar.mainData.filter(rec => rec.CancelPerc !== null && rec.CancelPerc !== 0);
    const isCancelled = (cancelledArray.length > 0) || (props.cancelled);

    for (const rec of fields) {
      const idx = tableHeaderArray.findIndex(elem => elem.field === rec);
      if (idx > -1) {
        tableHeaderArray[idx].visible = (isCancelled);
      } 
    }

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    compVar.rowDragging = rowDragging;

    // For showAll, set scroll, else pager (set page size > data length ... so that it scrolls)
    let defaultPageSize = (compVar.showAll) ? compVar.mainData.length+1 : 11;
    let gridHeight = (compVar.mainData.length > 11) ? viewHeight : null;

    if (Object.keys(compVar).length === 0) {
      return {}
    }

    // For row dragging forms  
    compVar.rowDragging = rowDragging;

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight - compVar.topPanelHeight, 
        gridRef: gridRef
      });

    const pageFooterEnabled = (compVar.showAll) ? false : true;

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onRowClick: onRowClick,
      onRowPrepared: onRowPrepared,
      onContextMenuPreparing: onContextMenuPreparing, /*=== Right click menu ===*/
      // devextreme's own focusedRowKey/focusedRowEnabled mechanism resets
      // itself on this grid for reasons that don't reproduce in isolation -
      // drive the highlight entirely from onRowClick/onRowPrepared instead
      focusedRowEnabled: false,
      rowAlternationEnabled: false,
      enabled: pageFooterEnabled,
      defaultPageSize: defaultPageSize,
      gridHeight: gridHeight
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    // *** CASE SENSITIVE override formData properties
    const clearPlaceOfSupplyLookupValues = {PlaceOfSupply: null, Home: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialPlaceOfSupplyLookupValues = getLookupValues(
      clearPlaceOfSupplyLookupValues,compVar.placeOfSupplyLookup, 
      ['PlaceOfSupply', 'Home'], compVar.formData.PlaceOfSupplyLine);      

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
      formHelp: null,
      clearLookup: [clearPlaceOfSupplyLookup, clearUserLookup],
      getSelectedRecord: [getSelectedPlaceOfSupply, getSelectedUser],
      initialLookupValues: [initialPlaceOfSupplyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearPlaceOfSupplyLookupValues, clearUserLookupValues],
      onTabOptionChanged: onTabOptionChanged,
      tabIndex: compVar.tabIndex,
      onWorkBackwards: workBackwards,
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    // For row dragging forms  
    const canAdd = (rowDragging || props.invoices_id > 0) ? false : compVar.canAdd;
    const canModify = !rowDragging && props.quoModules_id > 0 && props.invoices_id === null;

    const idx = compVar.mainData.findIndex(rec => rec.QuoModuleDetails_id === compVar.focusedRowKey);      
    const parentFixedItin_id = (idx > -1) ? compVar.mainData[idx].ParentFixedItin_id : null;
    const fixedItin_id = (idx > -1) ? compVar.mainData[idx].FixedItin_id : null;
    const mainOrderNo = (idx > -1) ? compVar.mainData[idx].MainOrderNo : null;

    const maxMainOrderNo = Math.max(...compVar.mainData.map(rec => rec.MainOrderNo));

    const moveTopVisible = (!rowDragging && !props.invoices_id) > 0 && ((fixedItin_id === null && parentFixedItin_id === null) || parentFixedItin_id === 0) && (mainOrderNo !== null && mainOrderNo !== 0);    
    const moveButtomVisible = (!rowDragging && !props.invoices_id) > 0 && ((fixedItin_id === null && parentFixedItin_id === null) || parentFixedItin_id === 0) && (mainOrderNo < maxMainOrderNo);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: !rowDragging && canModify, options: {icon: "upload", onClick: insertRec, hint: 'Insert a new item from Elements'}},  

        {visible: !rowDragging && canAdd, options: {icon: "orderedlist", onClick: rowDraggingToggle, hint: 'Reorder using drag & drop'}},
        {visible: rowDragging, options: {icon: "save", onClick: saveListToDb, hint: 'Save reordered list to DB'}}, 
        {visible: rowDragging, options: {icon: "revert", onClick: rowDraggingToggle, hint: 'Cancel reordering'}},
        
        {visible: moveTopVisible, options: {icon: "chevronup", onClick: moveToTop, hint: 'Move to the top of the list'}},  
        {visible: moveButtomVisible, options: {icon: "chevrondown", onClick: moveToBottom, hint: 'Move to the bottom of the list'}},  
        {visible: !rowDragging, options: {icon: "icons/size.png", onClick: showAllToggle, hint: 'Show All/Few '}},
        {visible: !rowDragging && canModify, options: {icon: "icons/quickEntry.png", onClick: quickCancelEntry, hint: 'Quick Cancel Entry'}},

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

      // Check if line has linked items
      const numLinked = await hasLinkedItems(compVar.focusedRowKey);

      if (numLinked > 0) {
        compVar.errorMsg = 'Cannot delete a Group with linked items';
        forceRender();
        return;
      }

      const idx = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      compVar.focusedRowKey = (idx > 0) ? compVar.mainData[idx-1][compVar.keyField] : null;  
      await dbDeleteRecord(recObj);
      await filterData();

    }
  }
    
  //**********************************************************/
  const rowDraggingToggle = () => {
    const clonedObj = getClonedData(compVar.mainData,compVar.focusedRowKey);
    compVar.clonedMainData = clonedObj.clonedData;
    compVar.isModuleReorder = clonedObj.isModuleReorder;

    setRowDragging((rowDragging) => {return !rowDragging});
  }

  //**********************************************************/
  const saveListToDb = async () => {

    const orderStr = (compVar.isModuleReorder) ? 'MainOrderNo' : 'SubOrderNo';
    await saveReordedListToDB (compVar.clonedMainData, 
      compVar.tableName, orderStr, compVar.keyField);

    if (compVar.isModuleReorder) {
      const sql = "EXEC p_QuoModulesDetailsReorder " + props.quoModules_id.toString();
      const spData = {sql: sql};
      await dbExecuteSp(spData);
    }

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
  const renderContent = () => {

    modifyColumnLayout();

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight-40;

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
        <div className="master-grid-container" style={{height: containerHeight-40}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container"></div>
            <div className="master-grid-params-container">
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container" style={{color: 'blue', fontSize: 18}}>
              {dropDownButtonJsx(0)}
            </div>
          </div>        

          <div className="master-grid-content-box" style={{height: containerHeight - 40 - MASTER_GRID_TITLE_HEIGHT}}>
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            <div style={{width: '100%'/*, height: '100%'*/, display: 'flex', justifyContent: 'center', /*alignItems: 'center'*/}}>
              {getDevExtremeTable(dataObj, true)}
            </div>

          </div>

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {compVar.importElementMode &&
            <ElementsSearchResults
              tourDate={props.tourDate}
              numPax={props.numPax}
              quoModules_id={props.quoModules_id}
              quotations_id={compVar.quotations_id}
              getSelectedElementSearchOption={getSelectedElementSearchOption}
            />
          }        

          {compVar.displayQuickCost &&
            <CostQuickEntry
              data={compVar.quickEntryData}
              headerData={compVar.quickEntryHeaderData}
              tableName={'QuoModuleDetails'}
              keyField={'QuoModuleDetails_id'}
              sqlTotal={compVar.sqlTotal}
              auditString={compVar.auditString}
              gridHeight={410}
              defaultPageSize={9}
              onClose={onQuickClose}
            />            
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

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default ModuleDetails;

