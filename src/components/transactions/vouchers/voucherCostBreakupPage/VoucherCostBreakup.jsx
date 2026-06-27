import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbExecuteSp } from '../../../../actions';
import { getFieldsArray } from "../../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import Switch from "react-switch";
import {tableHeaderArray, getDevExtremeTable} from './GetVoucherCostBreakupData';
import {getDefaultDataObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";

import '../../../common/MasterGrid.css'

let compVar = {};

function VoucherCostBreakup(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [displayDetails, setDisplayDetails] = useState(false);  
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
      tableName: 'CostingTrace', keyField: 'CostingTrace_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: '',
      mainTitle: 'Voucher Remarks', title: 'New Voucher Remarks',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1, displayRepeatEntry: false,
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
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    setInitDataFetched(true);
  }

  //**********************************************************/
  // This should execute only when the errorMsg changes
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.costModified]);


  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let filteredTableHeaderArray = filterTableHeaderArray(tableHeaderArray, props.voucherTypes_id);
    let fieldArray = getFieldsArray(filteredTableHeaderArray);

    try {
      const whereStr = "ct.vouchers_id = " + props.vouchers_id.toString() + " ";

      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['CostingCode'], table: 'CostingTrace ct', where: whereStr, x_uid: _g_users_id, x_module: 'Voucher Remarks'});   
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
      if (e.data.RecordType === 1) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.title = 'This voucher was prepeared manually';
      }  
    }
  }

  //**********************************************************/
  const customizeText = (cellInfo) => {
    if (!cellInfo.value) 
      return ''
    else
      return String(cellInfo.valueText);
  }

  //**********************************************************/ 
  const filterTableHeaderArray = (tableArray, voucherTypes_id) => {

    let filteredTableHeaderArray = [];    

    if (voucherTypes_id === 3) {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined || rec.specialCol === 2});    
    } else if (voucherTypes_id === 4) {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined || rec.specialCol === 1});    
    } else {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined});    
    }

    return filteredTableHeaderArray;
  }


  //**********************************************************/
  const onCellClick = async (e) => {    

    if (e.rowType === 'data' && e.column.dataField === 'Select') {      
      const voucherRemarks_id = e.data.VoucherRemarks_id;

      const idx = compVar.mainData.findIndex(o => o.VoucherRemarks_id === voucherRemarks_id);

      if (idx >= 0) {
        compVar.mainData[idx].Select = !compVar.mainData[idx].Select;
        // otherwise even a render may not change the data as it would think the array data has not changed
        compVar.mainData = [...compVar.mainData];

      }

      forceRender();

    }
  }

  //**********************************************************/
  const recomputeVoucherCost = async () => {

    let sql = "";

    if (props.voucherTypes_id === 3) {
      sql = "EXEC [p_CostComputeAccommodation] " + props.vouchers_id.toString();
    } else if (props.voucherTypes_id === 4) {
      sql = "EXEC [p_CostComputeServices] " + props.vouchers_id.toString();
    } else if (props.voucherTypes_id === 5) {
      sql = "EXEC [p_CostComputeCoach] " + props.vouchers_id.toString();
    } else if (props.voucherTypes_id === 2) {
      sql = "EXEC [p_CostComputeTickets] " + props.vouchers_id.toString();
    }

    if (sql > '') {
      setDataFetched(false);
      const spData = {sql: sql};
      await dbExecuteSp(spData);  
      await filterData();
    }

  }

  //**********************************************************/
  const displayDetailsSwitchValueChanged = (e) => {
    setDisplayDetails(e);
  }

  //**********************************************************/
  const headerJsx = () => {

    const btnRecomputeProps = {id: "recomputeButton", text: "Recompute", 
        type: "default", visible: true, stylingMode: 'text',
        onClick: recomputeVoucherCost, style: {fontSize: 16}};


    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', height: 50}}>

          <div style={{flex: 1}}>     
          </div>

          <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button {...btnRecomputeProps} />
          </div>

          <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{paddingRight: 10}}>
              Show Details
            </div>            
            <Switch 
              height={20} 
              width={40} 
              onChange={displayDetailsSwitchValueChanged} 
              checked={displayDetails} 
              uncheckedIcon={false}
            />
          </div>

        </div>

      </>

    )

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight - 160, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      data: (displayDetails) ? compVar.mainData : compVar.mainData.filter(rec => rec.RecordType !== 1),
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onCellClick: onCellClick,
      onRowPrepared: onRowPrepared,
      customizeText: customizeText,
    }

  }    

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-200;
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
    
    return (
      <>

        {headerJsx()}

        <div className="master-grid-container" style={{height: containerHeight, background: '#ffefcc'}}>

          <div className="master-grid-content-box" style={{border: '1px solid #d1e0e0'}}>
            {getDevExtremeTable(dataObj, true)}
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

export default VoucherCostBreakup;
