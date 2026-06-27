import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord } from '../../../../actions';
import { getFieldsArray } from "../../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import {tableHeaderArray, getDevExtremeTable} from './GetVoucherSelectRemarksData';
import {getDefaultDataObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";

import '../../../common/MasterGrid.css'
import '../../../common/ButtonsPanel.css'

let compVar = {};

function VoucherSelectRemarks(props) {

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
      tableName: 'VoucherRemarks', keyField: 'VoucherRemarks_id',
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
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['VoucherRemarks'], table: 'VoucherRemarks', x_uid: _g_users_id, x_module: 'Voucher Remarks'});   
      compVar.mainData = compVar.mainData.map(obj => ({ ...obj, Select: false }));
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
  const closePopup = async () => {

    if (props.getSelectedVoucherRemarks !== undefined) {
      await props.getSelectedVoucherRemarks({open: false});
    }

  };  

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
  const insertRemarks = async (e) => {

    let remarks = '';

    for (let rec of compVar.mainData.filter(rec => rec.Select===true)) {
      remarks += (remarks > '') ? '\n' : '';
      remarks += rec.VoucherRemarks;
    }

    if (props.getSelectedVoucherRemarks !== undefined) {
      await props.getSelectedVoucherRemarks({open: false, remarks: remarks});
    }
  }

  //**********************************************************/
  const buttonsJsx = () => {

    const disabled = false;

    return (
      <>
        <div className="buttons-panel-container">
          <div className="buttons-container">
          </div>
          <div className="buttons-container">
            <Button text="Cancel" type="default" onClick={closePopup}/>
          </div>
          <div className="buttons-container">
            <Button text="OK" disabled={disabled} type="success" onClick={insertRemarks}/>
          </div>
          <div className="buttons-container">
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
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onCellClick: onCellClick,
    }

  }    

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-100;
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
        <Popup visible={true} height={580} width={810} onHiding={closePopup}>                

          <div className="master-grid-container" style={{height: containerHeight, background: '#ffefcc'}}>

            <div style={{display: 'flex', height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', fontSize: 18, color: 'blue'}}>
              {props.description}
            </div>

            <div className="master-grid-content-box" style={{border: '1px solid #d1e0e0'}}>
              {getDevExtremeTable(dataObj, true)}
            </div>

            <div style={{width: '90%'}}>
              <hr/>
            </div>

            {buttonsJsx()}

          </div>

        </Popup>

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default VoucherSelectRemarks;
