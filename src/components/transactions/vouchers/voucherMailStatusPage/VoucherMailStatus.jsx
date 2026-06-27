import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw } from '../../../../actions';
import { getNowDate, convertDMY_MDY, convert_DbDate_To_DMY, convertDMYtoDate, addMonth } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable } from "./GetVoucherMailStatusData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DateBox from 'devextreme-react/date-box';
import Switch from "react-switch";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import VoucherMailingRemarks from '../voucherMailingPage/VoucherMailingRemarks';

import '../../../common/MasterGrid.css'

let compVar = {};

function VoucherMailStatus() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [createdByMe, setCreatedByMe] = useState(false);
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
      tableName: '', keyField: 'PendVouchers_id',
      masterDescField: '',
      fromDate: addMonth(getNowDate('DD/MM/YYYY'),6,'DD/MM/YYYY'),
      tourCode: '', tourDate: '01/01/2020', paxName: '', vouchers_id: -1,
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
  // This should execute only when the params change
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.fromDate]);
  
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
      let query = "EXEC p_VouchersPending '" + convertDMY_MDY(compVar.fromDate) + "'";
      compVar.mainData = await dbGetRecordRaw({query: query});     
      setTourDetails();
    } catch (err) {
      throw new Error('There was a problem in getting the record');
    }

    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const setTourDetails = async () => {

    if (compVar.mainData.length > 0) {
      const searchObj = compVar.mainData.find(o => o.PendVouchers_id === compVar.focusedRowKey);

      if (searchObj === undefined) {
        compVar.focusedRowKey = compVar.mainData[0][compVar.keyField];
        compVar.tourCode = compVar.mainData[0].TourCode;
        compVar.tourDate = convert_DbDate_To_DMY(compVar.mainData[0].TourDate,1);
        compVar.paxName = compVar.mainData[0].TourLeader;
        compVar.vouchers_id = compVar.mainData[0].Vouchers_id;
      } else {
        compVar.tourCode = searchObj.TourCode;
        compVar.tourDate = convert_DbDate_To_DMY(searchObj.TourDate,1);
        compVar.paxName = searchObj.TourLeader;
        compVar.vouchers_id = searchObj.Vouchers_id;
      }

    } 

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
        setTourDetails();
        forceRender();
      }

    }

  }

  //**********************************************************/
  const getSelectedVoucherMailingOption = async (e) => {
    compVar.voucherMailRemarksPopup = e.open;    

    // call this later otherwise the Mail Remarks popup will open again
    if (e.refresh) {
      await filterData();
    }
    forceRender();
  }


  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.ImportantFollowup === 1) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Urgent';
      }  
    }
  }

  //**********************************************************/
  const createdByMeSwitchValueChanged = (e) => {
    setCreatedByMe(e);
  }

  //**********************************************************/
  const getVoucherObj = () => {

    const voucherObj = {
      VoucherTypes_id: -1, VoucherDetails_id: -1, 
      city: '', description: '', organisation: ''
    }  
  
    if (compVar.mainData.length > 0) {
      const obj = compVar.mainData.find(o => o.Vouchers_id === compVar.vouchers_id);

      voucherObj.VoucherTypes_id = obj.VoucherTypes_id;
      voucherObj.VoucherDetails_id = obj.VoucherDetails_id;
      voucherObj.city = obj.ServiceCity;
      voucherObj.description = obj.Description;
      voucherObj.organisation = obj.Organisation;

    }

    return voucherObj;

  }

  //**********************************************************/
  const onFromDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromDate = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }


  //**********************************************************/
  const switchJsx = (index) => {

    const labels = ['Created By Me'];
    const heights = [20];
    const widths = [40];
    const onSwitchChanges = [createdByMeSwitchValueChanged];
    const onChecks = [createdByMe];

    const label = labels[index];
    const height = heights[index];
    const width = widths[index];
    const onSwitchChange = onSwitchChanges[index];
    const onCheck = onChecks[index];

    return (
      <>
        <div style={{paddingRight: 10}}>
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
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 

    const labels = ['As Of'];
    const dates = [fromDate];
    const onValuesChanged = [onFromDateChanged];

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
  const createDataObject = (viewHeight) => {

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      data: (!createdByMe) ? compVar.mainData : compVar.mainData.filter(rec => rec.AdmUsers_id === _g_users_id),
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onRowPrepared: onRowPrepared,
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties

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
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: [],
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

    const voucherObj = getVoucherObj();

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 1.3}}>
              {dateParamsJsx(0)}
            </div>
            <div style={{flex: 1}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container" style={{flex: 1.3}}>
              {switchJsx(0)}
            </div>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
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

export default VoucherMailStatus;
