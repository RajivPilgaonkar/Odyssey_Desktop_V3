import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbExecuteSp } from '../../../../actions';
import { getNowDate, addMonth, getFieldsArray, convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, tableHeaderArray } from "./GetVoucherSelectionData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Switch from "react-switch";
import {Button} from 'devextreme-react/button';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import {getDefaultDataObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {toast } from "../../../common/HelperComponents";
import {toastContainerStyle} from "../../../common/ComponentStyles";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";

import '../../../common/MasterGrid.css'

let compVar = {};

function VoucherSelection() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [refreshDataFetched, setRefreshDataFetched] = useState(true);
  const [sightseeing, setSightseeing] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  const _g_tourCode = useSelector(state => state.voucherParams.tourCode);
  const _g_tourDate = useSelector(state => state.voucherParams.tourDate);
  const _g_paxName = useSelector(state => state.voucherParams.paxName);

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      tableName: 'QuoLines', keyField: 'QuoLines_id',
      masterDescField: '',
      fromDate: addMonth(getNowDate('DD/MM/YYYY'),6,'DD/MM/YYYY'),
      vouchers_id: -1,
      numRows: 0, numSelectedRows: 0,
      focusedRowKey: -1,
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Voucher Mail Status', title: '',
      errorMsg: '', 
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      voucherMailRemarksPopup: false,
      dbLookup: [       
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

    try {
      const quotationsObj = await getQuotationDetails();
      const quotations_id = quotationsObj.quotations_id;

      const fieldArray = getFieldsArray(tableHeaderArray);
      fieldArray.push("CASE WHEN FromCities_id IS NOT NULL THEN c1.city ELSE c2.city END AS City ");
      const whereStr = "ql.Quotations_id = " + quotations_id.toString() + " " +
        "AND ((TrsType <> 5) OR (NewCar=1)) ";
      const tableStr = "QuoLines ql " + 
        "LEFT JOIN cities c1 ON ql.FromCities_id = c1.cities_id " +
        "LEFT JOIN cities c2 ON ql.Cities_id = c2.cities_id ";
  
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['LineNum'], table: tableStr, where: whereStr});   
      /*=== add a field for selected record ===*/
      compVar.mainData = compVar.mainData.map(rec => ({ ...rec, Selected: rec.GenerateVoucher }));

      compVar.numRows = compVar.mainData.length;
      compVar.numSelectedRows = compVar.mainData.filter(rec => rec.Selected).length;

    } catch (err) {
      throw new Error('There was a problem in getting the record');
    }

    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const getQuotationDetails = async () => {

    const whereStr = " TourCode = '" + _g_tourCode + "' AND Trial = 0";
    const tableStr = "Quotations ";
    const quotations = await dbGetRecord({fields: ['Quotations_id'], table: tableStr, where: whereStr});   
    const quotations_id = (quotations.length > 0) ? quotations[0].Quotations_id : -1;

    return {quotations_id: quotations_id};

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
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (((e.data.TrsType === 3) || (e.data.TrsType === 3)) && (e.data.QuoteCost === 0)) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.title = 'Zero Cost Line';
      }  
      if (!e.data.Selected) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.style.fontWeight = 500; 
      }
    }
  }

  //**********************************************************/
  const onCellClick = (e) => {
    if (e.rowType === 'data' && e.column.dataField === 'Selected') {      
      const quoLines_id = e.data.QuoLines_id;

      const idx = compVar.mainData.findIndex(o => o.QuoLines_id === quoLines_id);
      if (idx >= 0) {
        compVar.mainData[idx].Selected = !compVar.mainData[idx].Selected;
      }
      compVar.numSelectedRows = compVar.mainData.filter(rec => rec.Selected).length;

      // You do not call filterData here, so render thinks data has not changed, so force a change
      compVar.mainData = [...compVar.mainData];

      compVar.isEdited = true;
      
      forceRender();
    }
  }

  //**********************************************************/
  const saveSelection = async () => {

    const infoObj = await getVoucherInfo();

    // if vouchers already generated
    if (infoObj.vouchersGenerated) {
      compVar.toastMessage = 'Vouchers already generated. Cannot change this now.';
      compVar.toastIsVisible = true;
      forceRender();
    // Check if Quotation exists 
    } else if (infoObj.quotations_id === -1) {
      compVar.toastMessage = 'Quotation does not exist for this tour code';
      compVar.toastIsVisible = true;
      forceRender();
      return;
    } 

    setRefreshDataFetched(false);

    let changedRecords = compVar.mainData.filter(rec => rec.GenerateVoucher !== rec.Selected);
    let sql = '';
    let spData = {};
  
    for (const rec of changedRecords) {
      const genVoucher = (rec.Selected) ? 1 : 0;
  
      sql = "UPDATE QuoLines SET GenerateVoucher = " + genVoucher.toString() + " " +    
            "WHERE QuoLines_id = " + rec.QuoLines_id.toString(); 
      spData = {sql: sql};
      await dbExecuteSp(spData);
  
    }
        
    // delete the master and recreate the master
    sql = "EXEC p_QuoDeleteConvertToMasters " + infoObj.quotations_id.toString() + " ";
    spData = {sql: sql};
    await dbExecuteSp(spData);
  
    sql = "EXEC p_QuoConvertToMasters " + infoObj.quotations_id.toString() + " ";
    spData = {sql: sql};
    await dbExecuteSp(spData);
  
    compVar.toastMessage = 'Changes Saved';
    compVar.toastIsVisible = true;
  
    setRefreshDataFetched(true);
    
  }

  //**********************************************************/
  const sightseeingSwitchValueChanged = (e) => {
    setSightseeing(e);
  }

  //**********************************************************/
  const getVoucherInfo = async () => {

    // Obtain Quotations_id
    const quotationsObj = await getQuotationDetails();
    const quotations_id = quotationsObj.quotations_id;

    // Check if vouchers generated
    const whereStr = " mastertourcode = '" + _g_tourCode + "' " + 
      "AND mastertourdate = '" + convertDMY_MDY(_g_tourDate) + "' " +
      "AND manual = 0";
    const tableStr = "Vouchers ";
    const vouchers = await dbGetRecord({fields: ['Vouchers_id'], table: tableStr, where: whereStr});   
    const vouchersGenerated = (vouchers.length > 0) ? true : false;

    const infoObj = {vouchersGenerated: vouchersGenerated, quotations_id: quotations_id}

    return infoObj;

  }

  //**********************************************************/
  const switchJsx = (index) => {

    const labels = ['Only Sightseeing'];
    const heights = [20];
    const widths = [40];
    const onSwitchChanges = [sightseeingSwitchValueChanged];
    const onChecks = [sightseeing];

    const label = labels[index];
    const height = heights[index];
    const width = widths[index];
    const onSwitchChange = onSwitchChanges[index];
    const onCheck = onChecks[index];

    return (
      <>
        <div style={{paddingRight: 10, fontSize: 16}}>
          {label}
        </div>            
        <Switch 
          height={height} 
          width={width} 
          onChange={onSwitchChange} 
          checked={onCheck} 
          uncheckedIcon={false}
        />
      </>      
    )
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
      data: (!sightseeing) ? compVar.mainData : compVar.mainData.filter(rec => rec.TrsType === 3),
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onRowPrepared: onRowPrepared,
      onCellClick: onCellClick,
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
    const toastObj = {toastIsVisible: compVar.toastIsVisible, toastMessage: compVar.toastMessage, onToastHiding: onToastHiding}

    const numDeselected = compVar.numRows - compVar.numSelectedRows;      
    const numDeselectedStr = (numDeselected > 0) ? numDeselected.toString() + " deselected" : "";

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 1, fontSize: 16}}>
              {`${_g_tourCode} ${_g_tourDate}`}
            </div>
            <div className="master-grid-params-container" style={{flex: 1, fontSize: 16, color: 'red'}}>
              {numDeselectedStr}
            </div>
            <div className="master-grid-params-container" style={{flex: 1}}>
              {switchJsx(0)}
            </div>
            <div className="master-grid-params-container" style={{flex: 1}}>
              {!refreshDataFetched &&
                <LoadIndicator id="small-indicator" height={30} width={30} />
              }
              {refreshDataFetched &&
                <Button text="Save Changes" disabled={!compVar.isEdited} type="default" onClick={async() => {saveSelection()}}/>
              }
            </div>
            <div className="master-grid-params-container" style={{flex: 2, fontSize: 16}}>
              {_g_paxName}
            </div>
          </div>        

          <div className="master-grid-content-box">
            {getDevExtremeTable(dataObj, true)}
            {toast(toastObj, toastContainerStyle, {})}
          </div>

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

export default VoucherSelection;
