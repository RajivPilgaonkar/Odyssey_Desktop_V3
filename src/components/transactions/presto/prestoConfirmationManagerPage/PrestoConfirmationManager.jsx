import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import PrestoAccommodationConfirmation from "./confirmation/PrestoAccommodationConfirmation";
import PrestoFitStatus from "./fitStatus/PrestoFitStatus";
import PrestoFutureBookings from "./futureBookings/PrestoFutureBookings";

import '../../../common/MasterGrid.css'

let compVar = {};

function PrestoConfirmationManager() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_asOf = useSelector(state => state.confirmationParams.asOf) || null;
  let _g_fromDate = useSelector(state => state.confirmationParams.fromDate) || null;
  let _g_toDate = useSelector(state => state.confirmationParams.toDate) || null;
  let _g_createdByMe = useSelector(state => state.confirmationParams.createdByMe) || false; 
  let _g_includeRequests = useSelector(state => state.confirmationParams.includeRequests) || true; 
  let _g_addressbook_id = useSelector(state => state.confirmationParams.hotelAddressbook_id) || -1;
  let _g_onlyPending = useSelector(state => state.confirmationParams.onlyPending) || false;

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainTitle: 'Confirmation Manager', title: 'ABC',
      errorMsg: '', 
      isEdited: false, condition: '',
      admLevel: 1, 

      asOf: _g_asOf, fromDate: _g_fromDate, toDate: _g_toDate,
      option: 1, createdByMe: _g_createdByMe, includeRequests: _g_includeRequests,
      addressbook_id: _g_addressbook_id, onlyPending: _g_onlyPending,
      viewType: 1,
      captions: ['Accommodation Confirmation', 'Ticket Confirmation', 'Fit Status', 'Future Bookings'],
      activeData: [],
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

    setInitDataFetched(true);
  }
      
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const displayAccommodationConfirmationForm = () => {
    compVar.viewType = 1;
    compVar.title = 'Accommodation Confirmation';
    forceRender();
  }

  //**********************************************************/
  const displayTicketConfirmationForm = () => {
    compVar.viewType = 2;
    compVar.title = 'Ticket Confirmation';
    forceRender();
  }

  //**********************************************************/
  const displayFitConfirmationForm = () => {
    compVar.viewType = 3;
    compVar.title = 'Fit Status';
    forceRender();
  }

  //**********************************************************/
  const displayFutureBookingsForm = () => {
    compVar.viewType = 4;
    compVar.title = 'Future Bookings';
    forceRender();
  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: true, options: {icon: "icons/accommodation.png", onClick: displayAccommodationConfirmationForm, hint: 'Accommodation Confirmation'}},
        {visible: true, options: {icon: "airplane", onClick: displayTicketConfirmationForm, hint: 'Ticket Confirmation'}},
        {visible: true, options: {icon: "icons/fit.png", onClick: displayFitConfirmationForm, hint: 'FIT Confirmation Status'}},
        {visible: true, options: {icon: "icons/futurebookings.png", onClick: displayFutureBookingsForm, hint: 'Future Bookings'}},
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

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const elementProps = createElementProps();

    const title = (compVar.captions !== undefined) ? compVar.captions[compVar.viewType-1] : '';
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start', background: '#e6f2ff'}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, border: '1px solid #d1e0e0', }}>
            <div style={{display: 'flex', flex: 1, background: 'rgb(245,245,240)', height: '100%', justifyContent: 'center', alignItems: 'center', fontSize: 18, color: 'blue'}}>
              {title}
            </div>  
            <div style={{display: 'flex', flex: 1}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>  
            <div style={{display: 'flex', flex: 1, background: 'rgb(245,245,240)', height: '100%'}}></div>  
          </div>        

          {compVar.viewType === 1 &&
            <PrestoAccommodationConfirmation
              option={1}
            />              
          }

          {compVar.viewType === 2 &&
            <PrestoAccommodationConfirmation
              option={2}
            />              
          }

          {compVar.viewType === 3 &&
            <PrestoFitStatus/>              
          }

          {compVar.viewType === 4 &&
            <PrestoFutureBookings/>              
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

export default PrestoConfirmationManager;
