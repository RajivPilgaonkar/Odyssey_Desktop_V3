import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { dbGetRecordRaw, setVoucherParamValues, dbExecuteSp } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMY_MDY, convert_DbDate_To_MDY } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject} from "../../../common/MasterGridHelpers";
import { Button } from 'devextreme-react/button';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import { getDevExtremeTable } from "./GetGenVoucherData";
import GenVoucherParams from './GenVoucherParams';
import PopupDialogBox from '../../../common/PopupDialogBox';
import LinkForms from "../../../common/LinkForms";
import {getAdmLevelLocation, getVoucherIssueDetails, getVoucherLastTour} from "../../../common/GetDescFromIds";
import { formHelp } from './Help';
import VoucherIssueDetails from '../voucherIssueDetailsPage/VoucherIssueDetails';

import '../../../common/MasterGrid.css'

let compVar = {};

function GenVoucher(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  const _g_userName = useSelector(state => state.dbUser.userName);
  let _g_fromDate = useSelector(state => state.voucherParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.voucherParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);
  const _g_masters_id = useSelector(state => state.voucherParams.masters_id);
  const _g_createdByMe = useSelector(state => state.voucherParams.createdByMe);

  const _g_location = useLocation();
  const _g_navigate = useNavigate();
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], 
      keyField: 'Masters_id',
      fromDate: _g_fromDate, toDate: _g_toDate, voucherDate: _g_toDate,
      masters_id: _g_masters_id, genDataOption: 2, 
      selectedYesNoOption: false, deleteRecordObj: {}, 
      numFutureVouchers: 0, searchPanelOpen: false,
      popupDialogIndex: 0, popupSelectedOptions: [deleteAllVouchersProc],
      voucherIssueDetailsPopup: false,
      canAdd: false,
      wefSwitchValue: _g_createdByMe, focusedRowKey: _g_masters_id
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
        toDate + "', " + compVar.genDataOption.toString();        
      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Vouchers'});
      compVar.mainData.forEach(rec => {
        rec.MasterDepDate = (rec.MasterDepDate !== null) ? rec.MasterDepDate.replace('T', ' ').replace('Z', '') : null;
        rec.BookingDetailsMasterDate = (rec.BookingDetailsMasterDate !== null) ? rec.BookingDetailsMasterDate.replace('T', ' ').replace('Z', '') : null;
        rec.BookingDetailsTourDate = (rec.BookingDetailsTourDate !== null) ? rec.BookingDetailsTourDate.replace('T', ' ').replace('Z', '') : null;
        rec.BookingTourDate = (rec.BookingTourDate !== null) ? rec.BookingTourDate.replace('T', ' ').replace('Z', '') : null;
        rec.QuoArrivalDate = (rec.QuoArrivalDate !== null) ? rec.QuoArrivalDate.replace('T', ' ').replace('Z', '') : null;
        rec.QuoDepDate = (rec.QuoDepDate !== null) ? rec.QuoDepDate.replace('T', ' ').replace('Z', '') : null;
        rec.TourDepDate = (rec.TourDepDate !== null) ? rec.TourDepDate.replace('T', ' ').replace('Z', '') : null;
      });

      if (compVar.wefSwitchValue) {
        compVar.mainData = compVar.mainData.filter(rec => { return rec.AdmUsers_id === _g_users_id});
      }

      // If masters_id from redux was within current dataset
      const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);
      compVar.focusedRowKey = (idx > -1) ? compVar.focusedRowKey : ((compVar.mainData.length > 0) ? compVar.mainData[0].Masters_id : -1);
      
      const count = compVar.mainData.reduce((acc,rec) => {
        if (rec.ErrorNo > 0  && rec.GenVoucher) return acc+1;
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
  const onFocusedRowChanged = (e) => {

    if (e.row !== undefined) {

      // Save to redux store through params reducer
      dispatch(setVoucherParamValues({
        tourCode: e.row.data.MasterCode,
        tourDate: convert_DbDate_To_DMY(e.row.data.MasterDepDate,1),
        paxName: e.row.data.PaxName,
        masters_id: e.row.data.Masters_id,
      }));

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
      if ((e.data.NumVouchers === 0) && (e.data.NumManualVouchers === 0)) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Voucher not yet processed';
      } else if ((e.data.NumVouchers > 0 || e.data.NumManualVouchers > 0) && e.data.SendMail) {
        e.rowElement.style.color = 'green'; 
        e.rowElement.title = 'Emails sent';
      } else {
        e.rowElement.title = 'Emails not yet sent';
      }  
    }

  }


  //**********************************************************/
  const getSelectedParams = async (e) => {

    compVar.fromDate = e.fromDate;
    compVar.toDate = e.toDate;
    compVar.voucherDate = e.voucherDate;
    compVar.numFutureInvoices = e.numFutureInvoices;        
    compVar.wefSwitchValue = e.wefSwitchValue;
    compVar.searchPanelOpen = e.searchPanelOpen;

    const voucherData = compVar.mainData.filter(rec => (rec.Masters_id === compVar.focusedRowKey));
    const itinerariesGenerated = (voucherData.length > 0 && voucherData[0].Itineraries_id !== null) ? true : false;
    
    if (e.dataRefreshMode === 1) {
      await filterData();
    } else if (e.dataRefreshMode === 2) {
      if (itinerariesGenerated) {
        compVar.errorMsg = "Already generated. Please delete first if you need to re-generate";
        forceRender();
        return;
      }
      await generateVouchersForTour();
    } else if (e.dataRefreshMode === 3) {
      if (!itinerariesGenerated) {
        compVar.errorMsg = "Vouchers not yet generated";
        forceRender();
      } else {
        await deleteAllVouchers();
      }
    // Called from a voucher search rather than a date range search  
    } else if (e.dataRefreshMode === 4) {
      compVar.focusedRowKey = e.masters_id;
      compVar.masters_id = e.masters_id;  
      await filterData();
    } 

  }

  //**********************************************************/
  const getSelectedVoucherIssueOption = async(e) => {
    compVar.voucherIssueDetailsPopup = e.open;
    if (e.refresh) {
      await filterData();
      return;
    } 
    forceRender();
  }

  //**********************************************************/
  const displayVoucherSelection = () => {
    _g_navigate('/VoucherSelection', {state: {auth: true, backRoute: true}});

  }

  //**********************************************************/
  const displayVoucherListing = () => {
    _g_navigate('/ListVoucher', {state: {auth: true, backRoute: true}});
  }

  //**********************************************************/
  const displayVoucherMailing = () => {
    _g_navigate('/VoucherMailing', {state: {auth: true, backRoute: true}});
  }

  //**********************************************************/
  const displayUncodedVoucherListing = () => {
    _g_navigate('/ListVoucher', {state: {auth: true, backRoute: true, uncoded: true}});
  }

  //**********************************************************/
  const generateVouchersForTour = async () => {

    const voucherIssueDetailsObj = await getVoucherIssueDetails(compVar.focusedRowKey, _g_userName);

    const voucherData = compVar.mainData.filter(rec => (rec.Masters_id === compVar.focusedRowKey));
  
    const query = "SELECT qbc.countries_id, c.country FROM QuoBookingsClients qbc " + 
                  "LEFT JOIN countries c ON qbc.Countries_id = c.countries_id " + 
                  "LEFT JOIN quotations q ON qbc.Quotations_id = q.Quotations_id " +
                  "WHERE q.TourCode = '" + voucherData[0].MasterCode + "' " +
                  "UNION SELECT countries_id, country " +
                  "FROM countries " +
                  "WHERE countries_id = 200 ";
    const countries = await dbGetRecordRaw({query: query});       
    
    // Save to the REDUX store
    // set as parameters for forms called from this form
    // These will appear in the store in Issue Vouchers
    dispatch(setVoucherParamValues({
      tourCode: voucherData[0].MasterCode,
      tourDate: convert_DbDate_To_DMY(voucherData[0].MasterDepDate,1),
      paxName: voucherData[0].PaxName,
      tourLeader: ((voucherIssueDetailsObj.TourLeader) && (voucherIssueDetailsObj.TourLeader.trim().length > 0)) ? voucherIssueDetailsObj.TourLeader : voucherData[0].PaxName,
      countries_id: voucherIssueDetailsObj.TL_Countries_id,
      issuedOn: convert_DbDate_To_DMY(voucherIssueDetailsObj.VouchersIssuedOn,1),
      issuedBy: voucherIssueDetailsObj.VouchersIssuedBy,
      tourRef: ((voucherIssueDetailsObj.TourRef) && (voucherIssueDetailsObj.TourRef.trim().length > 0)) ? voucherIssueDetailsObj.TourRef : voucherData[0].MasterCode,
      countries: countries
    }));

    compVar.voucherIssueDetailsPopup = true;
    forceRender();
  }

  //**********************************************************/
  const deleteAllVouchers = async () => {

    const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);

    if (idx > -1) {
      const tourCode = compVar.mainData[idx].MasterCode;
      const tourDate = convert_DbDate_To_DMY(compVar.mainData[idx].MasterDepDate,1);

      const numVouchers = compVar.mainData[idx].NumVouchers + compVar.mainData[idx].NumManualVouchers;
      const lastTourObj = await getVoucherLastTour(new Date(convert_DbDate_To_MDY(compVar.mainData[idx].MasterDepDate)));

      if (numVouchers > 0 && lastTourObj.tourCode.length > 0 && lastTourObj.tourCode !== tourCode) {
        compVar.errorMsg = "Vouchers for later tour " + lastTourObj.tourCode + " generated (Last " + lastTourObj.voucherNo.toString() + "). Cannot delete these vouchers now.";
        forceRender();
      } else {
        compVar.popupDialogIndex = 0;
        compVar.dialogMessage1 = `Are you sure you want to delete all the vouchers
          for the tour ${tourCode} dt. ${tourDate} ?`
        compVar.dialogMessage2 = ''; 
        setPopupDialogBoxVisible(() => {return true});          
      }
  
    }

  }

  //**********************************************************/
  const deleteAllVouchersProc = async (e) => {
      
    // if Yes selected
    if (e === 1) {

      compVar.dialogMessage2 = 'Deleting ....';
      forceRender();

      const idx = compVar.mainData.findIndex(rec => rec.Masters_id === compVar.focusedRowKey);

      if (idx > -1) {
        const tourCode = compVar.mainData[idx].MasterCode;
        const tourDate = convert_DbDate_To_DMY(compVar.mainData[idx].MasterDepDate,1);

        const numVouchers = compVar.mainData[idx].NumVouchers + compVar.mainData[idx].NumManualVouchers;
        const lastTourObj = await getVoucherLastTour(new Date(convert_DbDate_To_MDY(compVar.mainData[idx].MasterDepDate)));

        if (numVouchers > 0 && lastTourObj.tourCode.length > 0 && lastTourObj.tourCode !== tourCode) {
          alert("Vouchers for later tour " + lastTourObj.tourCode + " generated (Last " + lastTourObj.voucherNo.toString() + "). Cannot delete these vouchers now.");
        } else {
          const sql = "EXEC [p_DeleteVouchersAndItineraries] '" + 
            tourCode + "', '" + convertDMY_MDY(tourDate) + "'";
  
          const spData = {sql: sql}
          await dbExecuteSp(spData);
  
          await filterData();
        }
          
      }

    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

  }
      

  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const buttonsVisible = (compVar.mainData.length > 0) ? true : false;

    const widths = [35,35,35,35];
    const heights = [35,35,35,35];
    const icons = ['check', 'icons/voucher.png', 'email', 'icons/UncodedVouchers.png'];
    const onClicks = [displayVoucherSelection, displayVoucherListing, displayVoucherMailing, displayUncodedVoucherListing];
    const hints = ['Select Services for Voucher Creation', 'Voucher Listing', 'Email confirmation / cancellation requests', 'Uncoded Voucher Listing'];
    const texts = [null, null, null, null];

    const width = widths[index];
    const height = heights[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    const hint = hints[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        height={height}
        type="normal"
        stylingMode="outlined"
        icon={icon}
        hint={hint}
        text={text}
        onClick={onClick}
        visible={buttonsVisible}
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
      canModify: false,
      canDeleteRow: false,
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

    const additionalPanelHeight = (compVar.searchPanelOpen) ? 80 : 40;

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
    
    const voucherIssueDetailsObj = {
      masters_id: compVar.masters_id, 
      open: compVar.voucherIssueDetailsPopup,
      getSelectedVoucherIssueOption: getSelectedVoucherIssueOption
    }

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          <div style={{ width: '100%'}}>
            <GenVoucherParams
              getSelectedParams={getSelectedParams}          
            />
          </div>

          {!dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched &&
            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

              <div className="master-grid-params-container">
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <LinkForms hideElem={[6]}/>
                </div>
              </div>        

              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>

              <div className="master-grid-params-container">
                {buttonParamsJsx(0)}
                {buttonParamsJsx(1)}
                {buttonParamsJsx(2)}
                {buttonParamsJsx(3)}
              </div>

            </div>          
      
          }

          {dataFetched &&
            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj)}
            </div>
          }

          {dataFetched && compVar.voucherIssueDetailsPopup &&
            <div>
              <VoucherIssueDetails {...voucherIssueDetailsObj} ></VoucherIssueDetails>
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

export default GenVoucher;
