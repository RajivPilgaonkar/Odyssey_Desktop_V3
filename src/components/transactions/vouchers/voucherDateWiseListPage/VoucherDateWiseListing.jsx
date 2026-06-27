import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, setVoucherParamValues } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMY_MDY, convertDMYtoDate, convertMDY_DMY, getFirstOfMonth_DMY, getLastOfMonth_DMY, isValidDateString } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { getDevExtremeTable } from "./GetVoucherDateWiseData";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';

import '../../../common/MasterGrid.css'

let compVar = {};

function VoucherDateWiseListing() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_fromDate = useSelector(state => state.voucherParams.fromDateRange) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.voucherParams.toDateRange) || convert_DbDate_To_DMY (new Date(), 1);

  if (!isValidDateString(convertDMY_MDY(_g_fromDate))) {
    _g_fromDate = convertMDY_DMY(_g_fromDate)
  }

  if (!isValidDateString(convertDMY_MDY(_g_toDate))) {
    _g_toDate = convertMDY_DMY(_g_toDate)
  }  

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
      mainData: [], 
      tableName: 'Vouchers', keyField: 'Vouchers_id',
      masterDescField: '',
      fromDate: _g_fromDate, toDate: _g_toDate, 
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Vouchers', title: 'New Voucher',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'GST', index: 1},{title: 'Additional', index: 2}],
      tabIndex: 0,
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 580,
      popupDialogIndex: 0, popupSelectedOptions: [],
      displayGridFilterRow: true,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      topPanelHeight: 50, 
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

    const fromDate = convertDMY_MDY(compVar.fromDate);
    const toDate = convertDMY_MDY(compVar.toDate);
    
    const query = `SELECT v.Vouchers_id,v.VoucherNo,v.VoucherDate,
      v.MasterTourCode,v.MasterTourDate, v.Description, 
      a.Organisation, vt.Description AS VoucherType 
      FROM vouchers v 
      LEFT JOIN addressbook a ON v.addressbook_id = a.addressbook_id 
      LEFT JOIN vouchertypes vt on v.vouchertypes_id = vt.vouchertypes_id
      WHERE v.VoucherDate BETWEEN '${fromDate}' AND '${toDate}'  
      ORDER BY VoucherDate, VoucherNo`;

    try {
      //compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['VoucherDate, VoucherNo'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Vouchers Date Range'});   
      compVar.mainData =  await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Vouchers Date Range'});   
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
  const refreshVoucherData = async () => {
    
    // Save to redux store through params reducer
    dispatch(setVoucherParamValues({
      fromDateRange: compVar.fromDate,
      toDateRange: compVar.toDate,
    }));

    await filterData();

  }

  //**********************************************************/
  const setDates = async (mode) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    /*=== fromDate was changed ===*/
    if (mode === 1) {
      if (fromDate.getTime() > toDate.getTime() || fromDate.getMonth() !== toDate.getMonth()) {
        compVar.toDate = getLastOfMonth_DMY(fromDate,0);
      }
    } else if (mode === 2) {
      if (toDate.getTime() < fromDate.getTime() || fromDate.getMonth() !== toDate.getMonth()) {
        compVar.fromDate = getFirstOfMonth_DMY(toDate,0);
      }
    }

  }

  //**********************************************************/
  const onFromDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromDate = convert_DbDate_To_DMY(e.value,1);
      setDates(1);
      forceRender();
    }
  }

  //**********************************************************/
  const onToDateChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.toDate = convert_DbDate_To_DMY(e.value,1);
      setDates(2);
      forceRender();
    }
  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    const labels = ['Between', 'and'];
    const dates = [fromDate, toDate];
    const onValuesChanged = [onFromDateChanged, onToDateChanged];

    const label = labels[index];
    const type = "date";
    const height = 35;
    const width = 150;
    const displayFormat = "dd/MM/yyyy";
    const value = dates[index];
    const onValueChanged = onValuesChanged[index];
    
    return (
      <>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          {label}
        </div>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          <DateBox 
            type={type}
            height={height}
            width={width}
            displayFormat={displayFormat}
            value={value} 
            onValueChanged={onValueChanged}
            style={{fontSize: 18}}
            acceptCustomValue={false}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const widths = [90];
    const icons = [null];
    const onClicks = [refreshVoucherData];
    const hints = ['Refresh Data'];
    const texts = ['Refresh'];

    const width = widths[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    const hint = hints[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        height={35}
        type="normal"
        stylingMode="outlined"
        icon={icon}
        hint={hint}
        text={text}
        onClick={onClick}
      />

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
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
    }

  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: false, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
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

    let dataObj = null;
    let elementProps = null;  
    if (dataFetched) {
      dataObj = createDataObject(viewHeight);
      elementProps = createElementProps();  
    }
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          {!dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
              <div className="master-grid-params-container" style={{flex: 3}}></div>
              <div className="master-grid-title-box" style={{flex: 1, height: MASTER_GRID_TITLE_HEIGHT}}>            
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>                
              <div className="master-grid-params-container" style={{flex: 3, justifyContent: 'flex-end'}}>
                <div className="panelparams-city-container">
                  {dateParamsJsx(0)}
                </div>
                <div className="panelparams-city-container">
                  {dateParamsJsx(1)}
                </div>
                <div className="panelparams-city-container">
                  {buttonParamsJsx(0)}
                </div>
              </div>
            </div>
          }

          {dataFetched &&
            <div className="master-grid-content-box">
              {getDevExtremeTable(dataObj, true)}

            </div>
          }

        </div>

      </>

    );

  }

  return (
    renderContent()
  )


};

export default VoucherDateWiseListing;
