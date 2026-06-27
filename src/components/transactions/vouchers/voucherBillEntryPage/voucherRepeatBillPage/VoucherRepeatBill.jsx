import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbExecuteSp } from '../../../../../actions';
import { getFieldsArray } from "../../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, tableHeaderArray } from "./GetVoucherRepeatBillData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import ToolbarOptions from "../../../../common/ToolbarOptions";
import {getDefaultDataObject, setFocusedRow, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import CostQuickEntry from "../../../../common/CostQuickEntry";

import '../../../../common/MasterGrid.css'

let compVar = {};

function VoucherRepeatBill(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
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
      tableName: 'Vouchers', keyField: 'Vouchers_id',
      masterDescField: '',
      mainTitle: 'Vouchers', title: 'New Voucher',
      errorMsg: '', focusedRowKey: -1,
      canAdd: true, canModify: true, 
      isEdited: false, condition: '',
      admLevel: 1,
      displayQuickCost: false, quickEntryData: [], quickEntryHeaderData:[],
      sqlTotal: '', auditString: '', 
      tourCode: '', addressbook_id: -1,
      dbLookup: [       
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
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

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

      let query = "SELECT v.MasterTourCode, v.Addressbook_id, COALESCE(a.CombineVouchersExp,0) AS CombineVouchersExp " + 
        "FROM Vouchers v " + 
        "LEFT JOIN Addressbook a ON v.addressbook_id = a.addressbook_id " +
        "WHERE v.Vouchers_id = " + props.vouchers_id.toString() + " ";

      const vouchersArr = await dbGetRecordRaw({query: query});   

      const tourCode = vouchersArr[0].MasterTourCode;
      const addressbook_id = vouchersArr[0].Addressbook_id;
      const selected = vouchersArr[0].CombineVouchersExp;

      compVar.tourCode = tourCode; 
      compVar.addressbook_id = addressbook_id;

      const whereStr = "MasterTourCode = '" + tourCode + "' " +
        "AND Addressbook_id = " + addressbook_id.toString() + " " + 
        "AND Vouchers_id <> " + props.vouchers_id.toString() + " ";

      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['VoucherNo'], table: 'Vouchers v', where: whereStr, x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.mainData = compVar.mainData.map(rec => {return {...rec, Selected: selected}});

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
  const onCellClick = (e) => {    
    if (e.rowType === 'data' && e.column.dataField === 'Selected') {      
      const vouchers_id = e.data.Vouchers_id;

      const idx = compVar.mainData.findIndex(o => o.Vouchers_id === vouchers_id);

      if (idx >= 0) {
        compVar.mainData[idx].Selected = !compVar.mainData[idx].Selected;
        // otherwise even a render may not change the data as it would think the array data has not changed
        compVar.mainData = [...compVar.mainData];
      }

      forceRender();
    }
  }


  //**********************************************************/
  const quickCostEntry = async () => {

    const query = "SELECT vb.VoucherBillings_id, v.Vouchers_id, " + 
      "v.VoucherNo, v.Description, vb.BillNo, vb.Remarks, v.ExpectedCost, vb.BillAmount " +
      "FROM Vouchers v " +
      "INNER JOIN VoucherBillings vb ON v.Vouchers_id = vb.Vouchers_id " +
      "WHERE MasterTourCode = '" + compVar.tourCode + "' " +
      "AND Addressbook_id = " + compVar.addressbook_id.toString();
    
    compVar.quickEntryData = await dbGetRecordRaw({query: query});

    compVar.quickEntryHeaderData = [
      {field: 'VoucherBillings_id', caption: 'ID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'Vouchers_id', caption: 'VouchersID', allowEditing: false, width: 60, visible: false, dataType: 'number'},
      {field: 'VoucherNo', caption: 'Voucher No', allowEditing: false, width: 120, visible: true, dataType: 'number'},
      {field: 'Description', caption: 'Description', allowEditing: false, width: 300, visible: true, dataType: 'string'},
      {field: 'BillNo', caption: 'Bill No', allowEditing: false, width: 120, visible: true, dataType: 'number'},
      {field: 'Remarks', caption: 'Remarks', allowEditing: false, width: 200, visible: true, dataType: 'string'},
      {field: 'ExpectedCost', caption: 'Exp. Cost', allowEditing: false, width: 100, visible: true, dataType: 'number'},
      {field: 'BillAmount', caption: 'Bill Amt', allowEditing: true, width: 100, visible: true, dataType: 'number'},
    ];

    compVar.sqlTotal = "";
    compVar.auditString = "";

    compVar.displayQuickCost = true;
    forceRender();

  }

  //**********************************************************/
  const onQuickClose = async () => {
    compVar.displayQuickCost = false;
    await updateBillsSummary();
    await filterData();
    forceRender();
  }

  //**********************************************************/
  const updateBillsSummary = async () => {

    for (const rec of compVar.quickEntryData) {

      const sql = 'UPDATE Vouchers SET AmountBilled = (' + 
        'SELECT SUM(COALESCE(BillAmount,0.0)) FROM VoucherBillings vb WHERE vb.vouchers_id = Vouchers.vouchers_id) ' +
        'WHERE Vouchers_id = ' + rec.Vouchers_id.toString();
        
      const spData = {sql: sql}

      await dbExecuteSp(spData);      
      
    }
    await filterData();
      
  }


  //**********************************************************/
  const updateBills = async () => {

    for (const rec of compVar.mainData.filter(rec => rec.Selected)) {
      const sql = 'EXEC [p_UpdateVoucherBills] ' + 
        props.vouchers_id.toString() + ', ' + rec.Vouchers_id.toString();
      
      const spData = {sql: sql}

      await dbExecuteSp(spData);      
      
    }
    await filterData();
      
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
      onCellClick: onCellClick,
    }

  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: true, options: {icon: "icons/updateDetails.png", onClick: updateBills, hint: 'Update Bill Details for these vouchers'}},
        {visible: true, options: {icon: "icons/quickEntry.png", onClick: quickCostEntry, hint: 'Quick Bill Entries'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

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
    const elementProps = createElementProps();
    
    return (
      <>
        <div className="master-grid-container" style={{height: 250}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
          </div>        

          <div className="master-grid-content-box">
            {getDevExtremeTable(dataObj, true)}
          </div>

        </div>

        {compVar.displayQuickCost &&
          <CostQuickEntry
            data={compVar.quickEntryData}
            headerData={compVar.quickEntryHeaderData}
            tableName={'VoucherBillings'}
            keyField={'VoucherBillings_id'}
            sqlTotal={compVar.sqlTotal}
            auditString={compVar.auditString}
            onClose={onQuickClose}
          />            
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

export default VoucherRepeatBill;
