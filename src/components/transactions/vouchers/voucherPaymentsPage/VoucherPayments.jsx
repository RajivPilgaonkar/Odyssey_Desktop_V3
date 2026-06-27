import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbGetRecordRaw } from '../../../../actions';
import { getLookupValues } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable } from "./GetVoucherPaymentsData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import TextBox from 'devextreme-react/text-box';
import { Button } from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import {Popup} from 'devextreme-react/popup';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getAgentSubCatListing } from "../../../common/GetOrgListing";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../../common/PopupDialogBox';
import VoucherBillsEntry from '../voucherBillEntryPage/VoucherBillsEntry';
import VoucherPymtEntry from '../voucherPymtEntryPage/VoucherPymtEntry';
import VoucherReportRange from '../voucherReportRangePage/VoucherReportRange';
import { setupReport } from "./ReportSetup";

import '../../../common/MasterGrid.css'

let compVar = {};

function VoucherPayments() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
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
      agentLookup: [], serviceCityLookup: [],
      tableName: '', keyField: 'Vouchers_id',
      masterDescField: '',
      tourCode: '', addressbook_id: null, focusedRowKey: -1,
      isVoucherDataReady: false, 
      billEntryMode: false, pymtEntryMode: false,
      voucherReportRangePopup: false,
      activeVoucherRec: {}, dateFormType: 1,
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Voucher Bills/Pymt', title: '',
      errorMsg: '', 
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      voucherMailRemarksPopup: false,
      dbLookup: [       
        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ],
      reportsData:
        [
          {id: 5, type: 5, text: 'Export To Tally (Excel)', reportName: 'VoucherExpTally', reportType: 'Excel'},
          {id: 6, type: 6, text: 'Export To Tally (XML)', reportName: 'VoucherExpTally', reportType: 'XML'},
          {id: 20,  type: 50,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          
          {id: 7, type: 7, text: 'Outstanding Vouchers (Excel)', reportName: 'OutstandingVouchers', reportType: 'Excel'},  
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

      compVar.agentLookup = await getAgentSubCatListing ('3,4,11', true);
      compVar.serviceCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.dbLookup[0].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const tourCode = (compVar.tourCode.trim().length > 3) ? compVar.tourCode : '#@$';
    const addressbook_id = (compVar.addressbook_id !== null) ? compVar.addressbook_id : -1;

    const addrStr = (compVar.addressbook_id !== null) ? 
      "AND v.Addressbook_id = " + addressbook_id.toString() + " " : '';

    let query = "SELECT v.Vouchers_id, v.MasterTourCode, v.MasterTourDate, v.VoucherNo, " + 
      "v.VoucherDate, v.Description, v.ExpectedCost, v.AmountBilled, v.AmountPaid, " +
      "a.Organisation, c.City " + 
      "FROM Vouchers v " + 
      "LEFT JOIN Addressbook a ON v.addressbook_id = a.addressbook_id " +
      "LEFT JOIN Cities c ON v.VoucherServiceCities_id = c.Cities_id " + 
      "WHERE ExpectedCost > 0 " + 
      "AND MasterTourCode LIKE '%" + tourCode + "%' " +
      addrStr + 
      "ORDER BY MasterTourCode, VoucherNo"

    compVar.mainData = await dbGetRecordRaw({query: query});   

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
  const saveFormData = async () => {

  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
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
  const onTourCodeChange = async(e) => {
    if (e.value.trim().length > 0) {
      compVar.tourCode = e.value.trim();
    }
    forceRender();
  }

  //**********************************************************/
  const searchTourCode = async(e) => {
    await filterData();
  }

  //**********************************************************/
  const enterClicked = async(e) => {
    if (compVar.tourCode.trim().length > 0) {
      await filterData();
    }
  }

  //**********************************************************/
  const billEntry = async (e) => {

    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    if (idx < 0) {return};

    compVar.activeVoucherRec = compVar.mainData[idx];
    compVar.billEntryMode = true;

    forceRender();

  }

  //**********************************************************/
  const paymentEntry = async (e) => {

    const idx = compVar.mainData.findIndex(rec => rec.Vouchers_id === compVar.focusedRowKey);
    if (idx < 0) {return};

    compVar.activeVoucherRec = compVar.mainData[idx];
    compVar.pymtEntryMode = true;

    forceRender();

  }

  //**********************************************************/
  const onReportClick = async (e) => {

    compVar.isVoucherDataReady = false;
    forceRender();

    compVar.dateFormType = (e.itemData.type === 7) ? 2 : 1;

    compVar.errorMsg = '';
    compVar.reportObj = {...e.itemData}

    compVar.isVoucherDataReady = true;
    compVar.voucherReportRangePopup = true;
    forceRender();

  }

  //**********************************************************/
  const onBillEntryHiding = async (e) => {
    compVar.activeVoucherRec = {};
    compVar.billEntryMode = false;

    await filterData();
  }

  //**********************************************************/
  const onPymtEntryHiding = async (e) => {
    compVar.activeVoucherRec = {};
    compVar.pymtEntryMode = false;

    await filterData();
  }

  //**********************************************************/
  const getSelectedReportRangeOption = async (e) => {
    compVar.voucherReportRangePopup = e.open;

    if (e.refresh) {
      await setupReport({...compVar.reportObj, fromDate: e.fromDate, toDate: e.toDate, tourCode: e.tourCode, reportCategory: e.reportCategory});
      forceRender();
    }

  }


  //**********************************************************/
  const createBookingParams = () => {

    const labelStyle = {
      //flex: 1,
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 16,
      color: '#000000',
      padding: '0px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    };

    const dateBoxStyle = {
      //flex: 4,
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 16,
      color: '#000000',
      padding: '0px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    };    

      return (
        <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center'}}>

          <div style={labelStyle}>
            Tour Code: (Enter more than 3 char)
          </div>

          <div style={{...dateBoxStyle, paddingLeft: '10px'}}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <TextBox 
                value={compVar.tourCode}
                width={150}
                style={{fontSize: 18}}
                onValueChanged={onTourCodeChange}
                onEnterKey={enterClicked}
                maxLength={30}
                height={35}
              />
              {buttonsJsx(0)}

            </div>
          </div>

        </div>

      )

  }

  //**********************************************************/
  const buttonsJsx = (index) => {

    const widths = [35,35,35];
    const types = ['normal','normal','normal'];
    const stylingModes = ['outlined','outlined','outlined'];
    const icons = ['find','icons/bills.png','icons/payments.png'];
    const hints = ['Search by Tour Code','Bill Entry','Payment Entry'];
    const clicks = [searchTourCode, billEntry, paymentEntry];

    const width = widths[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];

    return (
      <Button
        width={width}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        hint={hint}
        onClick={click}
      />
    );
  }

  //**********************************************************/
  const dropDownButtonsJsx = (index) => {

    const texts = ['Reports'];
    const icons = ['exportxlsx'];
    const widths = [150];
    const dropDownOptions=[{width: 200}];
    const items=[compVar.reportsData];
    const keyExprs=['id'];
    const displayExprs=['text'];
    const clicks=[onReportClick]

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const keyExpr = keyExprs[index];
    const displayExpr = displayExprs[index];
    const click = clicks[index];

    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={keyExpr}
        displayExpr={displayExpr}
        onItemClick={click}
      />                                
    );
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
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
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

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();
    const elementProps = createElementProps();
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 1.3}}>
              {createBookingParams()}
            </div>
            <div style={{flex: 1}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container" style={{flex: 1.3}}>
              {compVar.focusedRowKey >= 0 && buttonsJsx(1)}
              {compVar.focusedRowKey >= 0 && buttonsJsx(2)}
              {dropDownButtonsJsx(0)}
            </div>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

          {compVar.billEntryMode && compVar.focusedRowKey !== null &&
            <Popup
              //ref={'ABC'}
              visible={compVar.billEntryMode}
              hideOnOutsideClick={false}
              onHiding={onBillEntryHiding}
              height={600}
              width={1200}
              title={formObj.formTitle}
              showTitle={true}          
            >
              <VoucherBillsEntry
                vouchers_id={compVar.focusedRowKey}
                activeVoucher={compVar.activeVoucherRec}
              >
              </VoucherBillsEntry>
            </Popup>
          }

          {compVar.pymtEntryMode && compVar.focusedRowKey !== null &&
            <Popup
              //ref={'ABC'}
              visible={compVar.pymtEntryMode}
              hideOnOutsideClick={false}
              onHiding={onPymtEntryHiding}
              height={600}
              width={1200}
              title={formObj.formTitle}
              showTitle={true}          
            >
              <VoucherPymtEntry
                vouchers_id={compVar.focusedRowKey}
                activeVoucher={compVar.activeVoucherRec}
              >
              </VoucherPymtEntry>
            </Popup>
          }

          {compVar.voucherReportRangePopup &&
            <VoucherReportRange 
              getSelectedReportRangeOption={getSelectedReportRangeOption}    
              dateRangeType={1}
              formType={compVar.dateFormType}
              reportType={2}
            >          
            </VoucherReportRange>
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

export default VoucherPayments;
