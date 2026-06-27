import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { dbGetRecord, dbExecuteSp } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMYtoDate, convertDMY_MDY, isValidDate, getNowDate } from "../../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import DateBox from 'devextreme-react/date-box';
import TextBox from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';

import '../../../common/MasterGrid.css'
import './VoucherIssueDetails.css';

let compVar = {};

function VoucherIssueDetails(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  const _g_tourCode = useSelector(state => state.voucherParams.tourCode);
  const _g_tourDate = useSelector(state => state.voucherParams.tourDate);
  const _g_tourLeader = useSelector(state => state.voucherParams.tourLeader);
  const _g_countries_id = useSelector(state => state.voucherParams.countries_id);
  const _g_issuedOn = useSelector(state => state.voucherParams.issuedOn) || getNowDate('DD/MM/YYYY');
  const _g_issuedBy = useSelector(state => state.voucherParams.issuedBy);
  const _g_tourRef = useSelector(state => state.voucherParams.tourRef);
  const _g_paxName = useSelector(state => state.voucherParams.paxName);
  const _g_countries = useSelector(state => state.voucherParams.countries);

  const _g_location = useLocation();
  const _g_navigate = useNavigate();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      tourLeader: _g_tourLeader, countries_id: _g_countries_id || 200, 
      issuedOn: _g_issuedOn, issuedBy: _g_issuedBy, 
      tourRef: _g_tourRef, paxName: _g_paxName, 
      countries: _g_countries, companies_id: 1,  
      boxWidth: 620, boxHeight: 250, 
      spInProgress: false
    }   
        
    fetchInitialData();

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

    if (compVar.countries.length > 0) {
      if (compVar.countries.filter(e => e.countries_id === compVar.countries_id).length === 0) {
        compVar.countries_id = compVar.countries[0].countries_id;
      }  
    }

    let whereStr = " q.TourCode = '" + _g_tourCode + "' AND qb.Countries_id IS NOT NULL" ;
    let tableStr = "Quotations q LEFT JOIN QuoBookingsClients qb ON q.quotations_id = qb.quotations_id ";

    const quotations = await dbGetRecord({fields: ['qb.Countries_id'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Voucher Issue Details'});   
    if ((quotations.length > 0) && (quotations['Countries_id'] !== null)) {
      compVar.countries_id = quotations[0]['Countries_id'];
    }

    setInitDataFetched(true);
  }

  
  //**********************************************************/
  const closePopover = async () => {
    if (props.getSelectedVoucherIssueOption !== undefined) {
      props.getSelectedVoucherIssueOption({open: false, refresh: false});
    }    
    await updateMasters();
    forceRender();
  };  
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const createVouchers = async () => {

    compVar.message = "Generating vouchers ......";
    compVar.spInProgress = true;
    forceRender();

    await updateMasters();

    const tourCode = _g_tourCode;
    const tourDate = convertDMY_MDY(_g_tourDate);
    
    let spData = '';

    spData = {sql: "EXEC [p_MastersToVouchers] '" + tourCode + "', '" + 
              tourDate + "'"}

    await dbExecuteSp(spData);

    if (props.getSelectedVoucherIssueOption !== undefined) {
      await props.getSelectedVoucherIssueOption({refresh: true});
    }    

    compVar.message = "Vouchers GENERATED ......";
    compVar.spInProgress = false;
    forceRender();

  };  

  //**********************************************************/
  const updateMasters = async () => {
    
    let tourLeader = (compVar.tourLeader) ? compVar.tourLeader : '';
    const countries_id = (compVar.countries_id) ? compVar.countries_id.toString() : 'null';
    const issuedOn = (compVar.issuedOn) ? convertDMY_MDY(compVar.issuedOn) : getNowDate('MM/DD/YYYY');
    let issuedBy = (compVar.issuedBy) ? compVar.issuedBy : '';
    let tourRef = (compVar.tourRef) ? compVar.tourRef : '';

    // escape any single quotes in the text strings
    tourLeader = tourLeader.replace(/'/g, "''").substring(0,49);
    issuedBy = issuedBy.replace(/'/g, "''").substring(0,29);
    tourRef = tourRef.replace(/'/g, "''").substring(0,9);

    const spData = {sql: "UPDATE Masters SET " + 
      "TourLeader = '" + tourLeader + "', " +
      "TL_Countries_id = " + countries_id + ", " +
      "VouchersIssuedOn = '" + issuedOn + "', " +
      "VouchersIssuedBy = '" + issuedBy + "', " +
      "TourRef = '" + tourRef + "' " +
      "WHERE masters_id = " + props.masters_id.toString() + " " +
      "AND mastercode = '" + _g_tourCode + "' "};
    await dbExecuteSp(spData);  

  }


  //**********************************************************/
  const onTourLeaderChange = async (e) => {    
    compVar.tourLeader = e.value;
    forceRender();
  }

  //**********************************************************/
  const onIssueDateChange = (e) => {
    if (e !== undefined && e !== null) {
      compVar.issuedOn = convert_DbDate_To_DMY(e.value,1);
    } else {
      compVar.issuedOn = null;
    }
    compVar.issuedOnChanged = true;
    forceRender();
  }

  //**********************************************************/
  const onIssuedByChange = async (e) => {    
    compVar.issuedBy = e.value;
    compVar.issuedByChanged = true;
    forceRender();
  }

  //**********************************************************/
  const onTourRefChange = async (e) => {
    compVar.tourRef = e.value;
    forceRender();
  }

  //**********************************************************/
  const onCountryChange = async (e) => {
    compVar.countries_id = e.value;
    forceRender();
  }

  //**********************************************************/
  const displayVoucherSelection = async (e) => {
    _g_navigate('/VoucherSelection', {state: {auth: true, backRoute: true}});

  }

  //**********************************************************/
  const textParamsJsx = (index) => {

    const labels = ['Tour Leader', 'Issued By', 'Tour Ref'];
    const values = [compVar.tourLeader, compVar.issuedBy, compVar.tourRef];
    const widths = [400, 400, 400];
    const styles = [{fontSize: 18},{fontSize: 18},{fontSize: 18}];
    const onValueChanges = [onTourLeaderChange, onIssuedByChange, onTourRefChange];
    const maxLengths = [50, 30, 10];

    const label = labels[index];
    const value = values[index];
    const width = widths[index];
    const style = styles[index];
    const onValueChange = onValueChanges[index];
    const maxLength = maxLengths[index];

    return (
      <>
        <div className="voucher-issue-text-item" style={{flex: 1, paddingLeft: 10}}>
          {label}
        </div>
        <div className="voucher-issue-text-item" style={{flex: 2.2}}>
          <TextBox 
            value={value}
            width={width}
            style={style}
            onValueChanged={onValueChange}
            maxLength={maxLength}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const selectBoxParamsJsx = (index) => {

    if (compVar.countries === undefined) {
      return (<></>)
    }

    const labels = ['Country'];
    const dataSources = [compVar.countries];
    const displayExprs = ['country'];
    const valueExprs = ['countries_id'];
    const values = [compVar.countries_id];
    const widths = [400];
    const styles = [{fontSize: 18}];
    const onValueChanges = [onCountryChange];

    const label = labels[index];
    const dataSource = dataSources[index];
    const displayExpr = displayExprs[index];
    const valueExpr = valueExprs[index];
    const value = values[index];
    const width = widths[index];
    const style = styles[index];
    const onValueChange = onValueChanges[index];

    return (
      <>
        <div className="voucher-issue-text-item" style={{flex: 1, paddingLeft: 10}}>
          {label}
        </div>
        <div className="voucher-issue-text-item" style={{flex: 2.2}}>
          <SelectBox 
            dataSource={dataSource}
            displayExpr={displayExpr}
            valueExpr={valueExpr}
            value={value} 
            width={width}
            style={style}
            onValueChanged={onValueChange}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const issuedOn = (compVar.issuedOn !== null) ? convertDMYtoDate(compVar.issuedOn) : null; 

    const labels = ['Issued On:'];
    const dates = [issuedOn];
    const onValuesChanged = [onIssueDateChange];
    const showClearButtons = [false];

    const label = labels[index];
    const type = "date";
    const height = 35;
    const width = 180;
    let displayFormat = 'dd/MM/yyyy';
    let value = (dates[index] !== 'Invalid Date') ? dates[index] : null;
    const onValueChanged = onValuesChanged[index];
    const showClearButton = showClearButtons[index];

    if (!isValidDate(value)) {
      value = null;
      displayFormat = null;
      if (index === 0) {
        compVar.issuedOn = null;
      } 
    }
    
    return (
      <>
        <div className="voucher-issue-text-item" style={{flex: 1, paddingLeft: 10}}>
          {label}
        </div>
        <div className="voucher-issue-text-item" style={{flex: 2.2}}>
          <DateBox 
            type={type}
            height={height}
            width={width}
            displayFormat={displayFormat}
            value={value} 
            onValueChanged={onValueChanged}
            style={{fontSize: 18}}
            acceptCustomValue={false}
            showClearButton={showClearButton}
          />
        </div>
      </>
    )

  }
    
  //**********************************************************/
  const buttonsJsx = () => {

    const disabled = (compVar.spInProgress);

    /*=== Called from tickets in DTD ===*/
    return (
      <>
        <div className="voucher-issue-button-outer-container">

          <div className="voucher-issue-button-container">
          </div>

          <div className="voucher-issue-button-container">
            <Button text="Cancel" type="default" onClick={closePopover}/>
          </div>

          <div className="voucher-issue-button-container">
            {!compVar.spInProgress && <Button text={"Generate"} disabled={disabled} type="success" onClick={createVouchers}/>}
            {compVar.spInProgress && <LoadIndicator id="small-indicator" height={60} width={60} />}
          </div>

          <div className="voucher-issue-button-container">
          </div>

        </div>
        </>
      )
    
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-100;

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }
    
    const open = (props.open === undefined) ? true : props.open;    

    const btnSaveProps = {id: "voucherSelectButton", text: "Check Voucher Selection", 
      type: "default", visible: true, stylingMode: 'text',
      onClick: displayVoucherSelection, style: {fontSize: 16, width: 250}};

    return (
      <>

        <Popup visible={open} height={600} width={900} onHiding={closePopover}>

          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

            <div className="voucher-issue-text">
              <span style={{paddingRight: 20}}>{`Vouchers for Tour: ${_g_tourCode}`}</span>  <span>{`Departure: ${_g_tourDate}`}</span>
            </div>

            <div className="voucher-issue-text" style={{fontSize: 18, color: 'green', paddingTop: 20}}>
              {(compVar.paxName !== undefined) ? compVar.paxName : _g_paxName}
            </div>
            <div className="voucher-issue-text" style={{fontSize: 18, color: 'blue', paddingTop: 20, paddingBottom: 20}}>
              <Button {...btnSaveProps} />
            </div>

            <div className="voucher-issue-box-container" style={{width: compVar.boxWidth, height: compVar.boxHeight }}>
            
              <div className="voucher-issue-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                {textParamsJsx(0)}
              </div>
              <div className="voucher-issue-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                {selectBoxParamsJsx(0)}
              </div>
              <div className="voucher-issue-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                {dateParamsJsx(0)}
              </div>
              <div className="voucher-issue-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                {textParamsJsx(1)}
              </div>
              <div className="voucher-issue-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                {textParamsJsx(2)}
              </div>

            </div>

            {buttonsJsx()}

            <div className="voucher-issue-message">
              {compVar.message}
            </div>

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

export default VoucherIssueDetails;
