import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMY_MDY, convert_DbDate_To_MDY, getNowDate } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject} from "../../../common/MasterGridHelpers";
import { Button } from 'devextreme-react/button';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DropDownButton from 'devextreme-react/drop-down-button';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import { getDevExtremeTable } from "./GetInvoiceData";
import InvoiceParams from './InvoiceParams';
import PopupDialogBox from '../../../common/PopupDialogBox';
import LinkForms from "../../../common/LinkForms";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import { setupReport } from "./ReportSetup";

import '../../../common/MasterGrid.css'

let compVar = {};

function Invoices(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [panelDataFetched, setPanelDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_fromDate = useSelector(state => state.invoiceParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.invoiceParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_numFutureInvoices = useSelector(state => state.invoiceParams.numFutureInvoices) || 0;

  const _g_companies_id = 4; 
  const _g_divisions_id = 0; 
  const _g_offices_id = 2; 
  const _g_currencies_id = 27; 

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], 
      keyField: 'Masters_id',
      fromDate: _g_fromDate, toDate: _g_toDate, invoiceDate: _g_toDate,
      numFutureInvoices: _g_numFutureInvoices,
      mainTitle: 'Generate Invoices for Tours',
      errorMsg: '', focusedRowKey: -1,
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',      
      displayPopup: (props.formType === 2) ? true : false,      
      popupDialogIndex: 0, popupSelectedOptions: [generateAllInvoicesProc, deleteAllInvoicesProc, updateExchangeRateProc, generateAllInvoicesProc, deleteAllInvoicesProc, autoCorrectDatesProc],
      generateSingleInvoice: false, deleteSingleInvoice: false,
      admLevel: 1,
      reportsData:
        [
          {id: 1, type: 0, text: 'Client (Excel)', reportName: ''},
          {id: 2, type: 0, text: 'Office (Excel)', reportName: 'office'},
          {id: 3, type: 0, text: 'Department (Excel)', reportName: 'department'},
  
          {id: 20,  type: 50,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          
  
          {id: 4, type: 4, text: 'Tours Export To Tally (Excel)', reportName: 'InvoiceExpTally', reportType: 'Excel'},
          {id: 5, type: 5, text: 'Tours Export To Tally (XML)', reportName: 'InvoiceExpTally', reportType: 'XML'},
  
          {id: 21,  type: 50,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          
  
          {id: 6, type: 6, text: 'Sum Export To Tally (Excel)', reportName: 'InvoiceExpTally', reportType: 'Excel'},
          {id: 7, type: 7, text: 'Sum Export To Tally (XML)', reportName: 'InvoiceExpTally', reportType: 'XML'},

          {id: 22,  type: 50,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          

          {id: 8, type: 8, text: 'GSTR1 (Excel)', reportName: 'GSTR1', reportType: 'Excel'},

        ]
    }   
    
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
  const filterData = async() => {
    setDataFetched(false);

    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    try {

      const fromDate = convertDMY_MDY(compVar.fromDate);
      const toDate = convertDMY_MDY(compVar.toDate);

      const query = "EXEC p_GetMasterToursDateRange '" + fromDate + "', '" + 
                  toDate + "', 1";        
      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Invoices'});
      compVar.mainData.forEach(rec => {
        rec.MasterDepDate = (rec.MasterDepDate !== null) ? rec.MasterDepDate.replace('T', ' ').replace('Z', '') : null;
      });

      const count = compVar.mainData.reduce((acc,rec) => {
        if (rec.ErrorNo > 0) return acc+1;
        return acc;
      }, 0);

      if (count > 0) {
        compVar.errorMsg = count.toString() + ' Error'  + ((count > 1) ? 's ' : ' ') + 'Found';
      }
   
    } catch(err) {
      alert(err);
    }

    setFocusedRow(compVar);  
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {
  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {
  }


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
  const generateAllInvoices = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // Get Error records for which invoice has to be generated
    const numErrors = compVar.mainData.filter(rec => rec.ErrorNo > 0 && rec.GenInvoice).length;
    if (numErrors > 0) {
      compVar.errorMsg = "Please fix the error records in red first or mark them as 'Disallow Invoice'";          
      forceRender();
      return;
    }

    compVar.popupDialogIndex = 0;
    compVar.dialogMessage1 = `Are you sure you want to generate all the tour invoices 
      between ${compVar.fromDate} and ${compVar.toDate} ?`
    compVar.dialogMessage2 = ''; 
    compVar.generateSingleInvoice = false;
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const deleteAllInvoices = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = `Are you sure you want to delete all the tour invoices 
      with invoice date ${compVar.invoiceDate} ?`
    compVar.dialogMessage2 = ''; 
    compVar.deleteSingleInvoice = false;
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const updateExchangeRate = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    compVar.popupDialogIndex = 2;
    compVar.dialogMessage1 = `Are you sure you want to update the exchange rates 
      for all the tour invoices 
      between ${compVar.fromDate} and ${compVar.toDate} ?`
    compVar.dialogMessage2 = ''; 
    setPopupDialogBoxVisible(() => {return true});
  }

  //**********************************************************/
  const generateSingleInvoice = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
    if (idx > -1) {
      const tourCode = compVar.mainData[idx].MasterCode;
      compVar.popupDialogIndex = 3;
      compVar.dialogMessage1 = `Are you sure you want create the invoice for tour ${tourCode}`
      compVar.dialogMessage2 = ''; 
      compVar.generateSingleInvoice = true;
      setPopupDialogBoxVisible(() => {return true});
    }

  }

  //**********************************************************/
  const deleteSingleInvoice = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
    if (idx > -1) {
      const tourCode = compVar.mainData[idx].MasterCode;
      compVar.popupDialogIndex = 4;
      compVar.dialogMessage1 = `Are you sure you want delete the invoice for tour ${tourCode}`
      compVar.dialogMessage2 = ''; 
      compVar.deleteSingleInvoice = true;
      setPopupDialogBoxVisible(() => {return true});
    }

  }

  //**********************************************************/
  const autoCorrectDates = async () => {

    const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
    if (idx > -1) {
      const tourCode = compVar.mainData[idx].MasterCode;
      compVar.popupDialogIndex = 5;
      compVar.dialogMessage1 = `Are you sure you want to auto-correct dates for tour ${tourCode}`
      compVar.dialogMessage2 = ''; 
      setPopupDialogBoxVisible(() => {return true});
    }

  }


  //**********************************************************/
  const generateAllInvoicesProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);

      let invData = (compVar.generateSingleInvoice) ?
        compVar.mainData.filter(rec => rec.Masters_id === compVar.focusedRowKey && rec.GenInvoice && rec.ErrorNo === 0) :
        compVar.mainData.filter(rec => rec.Invoices_id === null && rec.GenInvoice && rec.ErrorNo === 0);
  
      for (const rec of invData) {

        const tourDate = convert_DbDate_To_MDY(rec.MasterDepDate, 1);
        const invoiceDate = convertDMY_MDY(compVar.invoiceDate);

        const sql = `EXEC [p_GenerateInvoice] ${rec.Masters_id.toString()},  
          '${tourDate}', '${invoiceDate}', ${_g_companies_id.toString()}, 
          ${_g_divisions_id.toString()}, ${_g_currencies_id.toString()},
          ${_g_offices_id}`
  
        const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'}
        await dbExecuteSp(spData);
          
      }

      await updateModifiedByForGeneratedInvoices();

      await filterData();

    }

  }

  //**********************************************************/
  const deleteAllInvoicesProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);

      let invoiceDate = convertDMY_MDY(compVar.invoiceDate);

      let invoices_id = '-1';
      let deleteOption = -1;
      if (compVar.deleteSingleInvoice) {
        const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
        if (idx > -1) {
          invoices_id = compVar.mainData[idx].Invoices_id;
          invoices_id = invoices_id.toString();
          invoiceDate = convert_DbDate_To_MDY(compVar.mainData[idx].InvoiceDate,1);
          deleteOption = 2;
        }    
      } else {
        invoices_id = 'null';
        deleteOption = 1;
      }

      const sql = `EXEC [p_DeleteInvoices] ${invoices_id.toString()}, 
        '${invoiceDate}', ${_g_companies_id.toString()}, 
        ${_g_divisions_id.toString()}, ${deleteOption.toString()}, 0`;

      const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'}
      await dbExecuteSp(spData);

      await filterData();

    }

  }

  //**********************************************************/
  const updateExchangeRateProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1 && compVar.numFutureInvoices === 0) {

      setDataFetched(false);

      const fromDate = convertDMY_MDY(compVar.fromDate);
      const toDate = convertDMY_MDY(compVar.toDate);

      const sql = `EXEC [p_SetInvExchRate] 
        '${fromDate}', '${toDate}', ${_g_companies_id.toString()}, 
        ${_g_divisions_id.toString()}`;

      const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'}
      await dbExecuteSp(spData);

      await filterData();

    }

  }

  //**********************************************************/
  const autoCorrectDatesProc = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1 && compVar.numFutureInvoices === 0) {

      setDataFetched(false);

      const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
      if (idx > -1) {
        const tourCode = compVar.mainData[idx].MasterCode;
        const sql = `EXEC [p_QuoCorrectDateMismatch] ${tourCode}`;

        const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'}
        await dbExecuteSp(spData);

        await filterData();
      }    

    }

  }


  //**********************************************************/
  const allowToggleInvoice = async () => {

    let masters_id = -1;
    let genInvoice = 0;

    setDataFetched(false);

    const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
    if (idx > -1) {
      masters_id = compVar.mainData[idx].Masters_id;
      const allowMode = (compVar.mainData[idx].GenInvoice) ? 1 : 0;
      genInvoice = (allowMode === 1) ? 0 : 1;
    }

    const sql = `UPDATE masters SET GenInvoice = ${genInvoice.toString()}
      WHERE masters_id = ${masters_id.toString()}`;

    const spData = {sql: sql}
    await dbExecuteSp(spData);

    await filterData();

  }

  //**********************************************************/
  const updateModifiedByForGeneratedInvoices = async () => {

    const fromDate = convertDMY_MDY(compVar.fromDate);
    const toDate = convertDMY_MDY(compVar.toDate);

    const nowDate = getNowDate('MM/DD/YYYY'); 

    // set ModifiedOn, ModifiedBy on newly created invoices
    const sql = `UPDATE Invoices SET ModifiedByUsers_id = 
      ${_g_users_id.toString()}, ModifiedOn = '${nowDate}' 
      WHERE InvoiceDate BETWEEN '${fromDate}' AND '${toDate}' 
      AND ModifiedByUsers_id IS NULL AND Quotations_id IS NOT NULL`;
      
    const spData = {sql: sql}

    await dbExecuteSp(spData);

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
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    

    if (e.rowType === 'data') {
      if (!e.data.GenInvoice) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.style.textDecorationLine = 'line-through';
      } else if ((e.data.ErrorNo !== 0)) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = e.data.ErrorDesc + '.' + ((e.data.ErrorCode !== 103) ? ' Click on Auto-Correct to attempt fix.' : '');
      } else if ((e.data.InvoiceNo !== null && e.data.ErrorNo === 0 && e.data.TotalInvoiceAmount !== e.data.QuoModules_ExpCost) ) {
        e.rowElement.title = 'Invoice Amount does not match with Module Amount. Please check.';
        e.rowElement.style.color = '#6600ff'; 
        e.rowElement.style.fontWeight = 700; 
      }  
    }

  }


  //**********************************************************/
  const getSelectedParams = async (e) => {
    compVar.fromDate = e.fromDate;
    compVar.toDate = e.toDate;
    compVar.invoiceDate = e.invoiceDate;
    compVar.numFutureInvoices = e.numFutureInvoices;        
    compVar.popupDialogIndex = e.popupDialogIndex;

    if (e.refresh) {
      await filterData();
    } else if (e.popup) {
      if (compVar.popupDialogIndex === 0) {
        await generateAllInvoices();
      } else if (compVar.popupDialogIndex === 1) {
        await deleteAllInvoices();
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

    return {...defaultFormObject,
      visible: false,
      onToastHiding: onToastHiding,      
      formHelp: formHelp,
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: [],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    let allowButtonVisible = false;
    let singleInvButtonVisible = false;
    let autoCorrectButtonVisible = false;

    let allowIcon = null;
    let singleInvIcon = null;

    let allowHint = '';    
    let singleInvHint = '';    

    let genDelFn = null; 

    const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
    if (idx > -1) {
      allowButtonVisible = (compVar.mainData[idx].Invoices_id !== null) ? false : true;
      singleInvButtonVisible = (compVar.mainData[idx].GenInvoice && compVar.mainData[idx].ErrorNo === 0) ? true : false;
      autoCorrectButtonVisible = (compVar.numFutureInvoices === 0 && compVar.mainData[idx].ErrorNo > 0) ? true : false;

      allowIcon = (compVar.mainData[idx].GenInvoice) ? "icons/disallow.png" : "icons/allow.png";
      singleInvIcon = (compVar.mainData[idx].Invoices_id !== null) ? "icons/trash.png" : "icons/costing.png";

      allowHint = (compVar.mainData[idx].GenInvoice) ? "Disallow Invoice for this tour" : "Allow Invoice for this tour";
      singleInvHint = (compVar.mainData[idx].Invoices_id !== null) ? 'Delete invoice for only this tour' : 'Generate invoice for only this tour';

      genDelFn = (compVar.mainData[idx].Invoices_id !== null) ? deleteSingleInvoice : generateSingleInvoice;
    }

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: allowButtonVisible, options: {icon: allowIcon, onClick: allowToggleInvoice, hint: allowHint}},
        {visible: singleInvButtonVisible, options: {icon: singleInvIcon, onClick: genDelFn, hint: singleInvHint}},
        {visible: autoCorrectButtonVisible, options: {icon: "icons/updateDetails.png", onClick: autoCorrectDates, hint: 'Auto correct to fix Date Mismatch'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const onActionDropDownClick = async(e) => {

    const reportObj = {...e.itemData, 
      fromDate: compVar.fromDate, toDate: compVar.toDate
    }

    setDataFetched(false);

    const fromDate = convertDMY_MDY(compVar.fromDate);
    const toDate = convertDMY_MDY(compVar.toDate);

    let invData = [];

    // only non error records where invoice has been generated
    if (e.itemData.type === 0) {
      invData = compVar.mainData.filter(rec => (rec.ErrorNo === 0) && (rec.GenInvoice) && (rec.Invoices_id !== null) && (rec.QuoModules_id !== null));
    } else if (e.itemData.type === 4 || e.itemData.type === 5) {
      const sql = "EXEC [p_InvoiceTallyExport] 4, '" + 
        fromDate + "','" + toDate + "'";
      const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'};
      invData = await dbExecuteSp(spData);
    } else if (e.itemData.type === 6 || e.itemData.type === 7) {
      const sql = "EXEC [p_InvoiceTallyExport] 1, '" + 
        fromDate + "','" + toDate + "'";
      const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'};
      invData = await dbExecuteSp(spData);
    } else if (e.itemData.type === 8) {
      const sql = "EXEC [p_Gstr1_AllDiv] '" + 
        fromDate + "','" + toDate + "', " + _g_companies_id.toString() + ", 1";
      const spData = {sql: sql, x_uid: _g_users_id, x_module: 'Invoices'};
      invData = await dbExecuteSp(spData);
    }

    await setupReport(reportObj, invData);

    setDataFetched(true);

  }

  //**********************************************************/
  const dropDownParamsJsx = () => {

    return (
        <DropDownButton
          text="Reports"
          icon="exportxlsx"
          dropDownOptions={{width: 230}}
          dataSource={compVar.reportsData}
          displayExpr="text"
          onItemClick={onActionDropDownClick}
        />                                
    );

  }

  //**********************************************************/
  const renderContent = () => {

    const additionalPanelHeight = 52;

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
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          <div style={{ width: '100%'}}>
            <InvoiceParams
              getSelectedParams={getSelectedParams}          
              onPanelLoad={onPanelLoad}
            />
          </div>

          {panelDataFetched && !dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

              <div className="master-grid-params-container">
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <LinkForms hideElem={[6]}/>
                  {compVar.numFutureInvoices === 0 &&
                    <Button
                      width={35}                    
                      type="normal"
                      stylingMode="outlined"
                      icon="redo"
                      onClick={async () => updateExchangeRate()}
                      hint="Update Exch Rate for all invoices in this period"
                    />
                  }
                </div>
              </div>        

              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>

              <div className="master-grid-params-container">
                {dropDownParamsJsx()}
              </div>

            </div>          
      
          }

          {dataFetched &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
            </div>
          }

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

export default Invoices;
