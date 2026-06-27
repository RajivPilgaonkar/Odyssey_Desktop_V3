import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import {convertDMY_MDY, convert_DbDate_To_DMY, convertDMYtoDate, isValidDate} from "../../../../common/CommonTransactionFunctions";
import {getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../../common/GetDescFromIds";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";

import '../../../../common/MasterGrid.css'
import './Modules.css';

let compVar = {};

function ModuleCancellation(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

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
      mainData: [],
      errorMsg: '',
      admLevel: 1, 
      boxWidth: 650, boxHeight: 100,
      moduleUpdated: false, 
      cancelledOn: null, cancelledOnChanged: false,
      inProgress: false, toastIsVisible: false, toastMessageType: 'info',
      toastMessage: ''
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

    const tourDate = convertDMY_MDY(props.tourDate);

    const query = "SELECT CancelledOn FROM Quotations " + 
      "WHERE TourCode = '" + props.tourCode + "' " +
      "AND StartDate = '" + tourDate + "'";    
    const cancelQry = await dbGetRecordRaw({query: query });    
    if (cancelQry.length > 0 && cancelQry[0].CancelledOn !== null) {
      compVar.cancelledOn = cancelQry[0].CancelledOn;
      compVar.cancelledOn = compVar.cancelledOn.replace('T', ' ').replace('Z', '');
      compVar.cancelledOn = convert_DbDate_To_DMY(compVar.cancelledOn,1);
    }

    setInitDataFetched(true);
  }
  
  //**********************************************************/
  const closePopover = async () => {
    const refresh = (compVar.moduleUpdated) ? true : false;

    if (props.getSelectedModuleCancelOption !== undefined) {
      await props.getSelectedModuleCancelOption({open: false, refresh: refresh});
    }    

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
  const saveModuleCancellation = async () => {

    if (compVar.cancelledOnChanged) {
  
      const cancelStr = (compVar.cancelledOn === null) ? 'null' : "'" + convertDMY_MDY(compVar.cancelledOn) + "'";
      const tourDate = convertDMY_MDY(props.tourDate);
      
      let sql = "UPDATE BookingsTours " +
        "SET CancelledOn = " + cancelStr + " " +
        "WHERE TourCode = '" + props.tourCode + "' " + 
        "AND TourDate = '" + tourDate + "' ";
  
      let spData = {sql: sql};
      await dbExecuteSp(spData);

      sql = "EXEC [p_CancelQuoModule] " +
        "'" + props.tourCode + "', " +
        "'" + tourDate + "', " + 
        "" + cancelStr + ", " +
        props.principalAgents_id.toString();
  
      spData = {sql: sql};
      await dbExecuteSp(spData);
      
      compVar.moduleUpdated = true;
      await closePopover();
        
    }

  };  

  //**********************************************************/
  const onCancelledDateChange = async (e) => {    

    if (e !== undefined && e !== null) {
      compVar.cancelledOn = convert_DbDate_To_DMY(e.value,1);
    } else {
      compVar.cancelledOn = null;
    }
    compVar.cancelledOnChanged = true;
    forceRender();

  }
    
  //**********************************************************/
  const dateParamsJsx = (index) => {

    const cancelledOn = (compVar.cancelledOn !== null) ? convertDMYtoDate(compVar.cancelledOn) : null; 

    const labels = ['Cancelled On:'];
    const dates = [cancelledOn];
    const onValuesChanged = [onCancelledDateChange];                             

    const label = labels[index];
    const type = "date";
    const height = 35;
    const width = 180;
    let displayFormat = 'dd/MM/yyyy';
    let value = (dates[index] !== 'Invalid Date') ? dates[index] : null;
    const onValueChanged = onValuesChanged[index];

    if (!isValidDate(value)) {
      value = null;
      displayFormat = null;
      if (index === 0) {
        compVar.cancelledOn = null;
      }
    }

    const readOnly = (compVar.cancelledOn === null) ? false : true;
    
    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row'}}>
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
              showClearButton={true}
              readOnly={readOnly}
            />
          </div>
        </div>
      </>
    )

  }

  //**********************************************************/
  const buttonsJsx = () => {

    const disabled = !(compVar.cancelledOnChanged);

    /*=== Called from tickets in DTD ===*/
    return (
      <>
        <div style={{height: 60, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', flex: 1}}>
          </div>

          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Close" type="default" onClick={closePopover}/>
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text={"Cancel this tour"} disabled={disabled} type="success" onClick={saveModuleCancellation}/>
          </div>

          <div style={{display: 'flex', flex: 1}}>
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

    return (
      <>

        <Popup visible={open} height={400} width={700} onHiding={closePopover}>

          <div style={{display: 'flex', flexDirection: 'column'}}>

            <div className="modules-cancel-text">
              {`Tour: ${props.tourCode}`} &nbsp; &nbsp; &nbsp; {`Departure: ${props.tourDate}` }
            </div>

            <div className="modules-cancel-text" style={{fontSize: 18, color: 'green', paddingTop: 20}}>
              {props.pax}
            </div>

            <div style={{width: '100%', height: compVar.boxHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, background: '#f5f5f0', border: '0.5px solid rgba(0, 0, 0, .5)', borderRadius: 15 }}>
              <div style={{height: compVar.boxHeight, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                {dateParamsJsx(0)}
              </div>
            </div>

            {compVar.errorMsg.length > 0 &&
              <div style={popupTitleContainerStyle}>
                {compVar.errorMsg}
              </div>
            }

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

export default ModuleCancellation;
