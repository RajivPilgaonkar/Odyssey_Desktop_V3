import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbExecuteSp, sendMail } from '../../../../actions';
import { getNowDate, waitFor } from "../../../common/CommonTransactionFunctions";
import { getVoucherRecipentObj } from "../../../common/VoucherHelpers";
import { getPrestoBodyObj } from "../../../common/PrestoHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import { ProgressBar } from 'devextreme-react/progress-bar';
import { Toast } from 'devextreme-react/toast';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import {toastContainerStyle, popupTitleContainerStyle} from "../../../common/ComponentStyles";

import '../../../common/MasterGrid.css'
import './PrestoMailing.css';

let compVar = {};

function PrestoSendMails(props) {

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
      boxWidth: 650, boxHeight: 300,
      sendClicked: false, numMails: 0, sentMails: 0,
      inProgress: false, toastIsVisible: false, toastMessageType: 'info',
      toastMessage: 'Mails Sent. Please check your Drafts folder', 
      voucherTypesArr: [
        {voucherTypes_id: 2, tableName: 'QuoTickets', fieldName: 'QuoTickets_id'},
        {voucherTypes_id: 3, tableName: 'QuoAccommodation', fieldName: 'QuoAccommodation_id'},
        {voucherTypes_id: 4, tableName: 'QuoServices', fieldName: 'QuoServices_id'},
      ],
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
  const closePopover = async () => {
    const refresh = (compVar.sendClicked) ? true : false;

    if (props.getSelectedPrestoSendMailOption !== undefined) {
      await props.getSelectedPrestoSendMailOption({open: false, refresh: refresh});
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
  const getUniqueAgentsVoucherTypes = (mainData) => {
    let data = [...mainData];
    data = data.map(obj => ({ ...obj, uniqueField: obj.Addressbook_id.toString() + '_' + obj.VoucherTypes_id.toString() }))    
    const unique = [...new Set(data.map(item => item.uniqueField))]; 
    return unique;
  }

  //**********************************************************/
  const updateDb = async (mailRec) => {

    const updateField = (props.confirmation) ? 'RequestedOn' : 'CancelledOn';
    const today = getNowDate('MM/DD/YYYY');

    const recType = compVar.voucherTypesArr.filter(rec => rec.voucherTypes_id === mailRec.VoucherTypes_id);
    
    const sql = "UPDATE " + recType[0].tableName +  " " + 
      "SET " + updateField + " = '" + today + "' " + 
      "WHERE " + recType[0].fieldName + " = " + mailRec[recType[0].fieldName] + " ";

    let spData = {sql: sql};
    await dbExecuteSp(spData);      

  }

  //**********************************************************/
  const sendNewEmails = async () => {

    const uniqueAgents = getUniqueAgentsVoucherTypes(props.mailData);
    compVar.numMails = uniqueAgents.length;

    compVar.sentMails = 0;
    compVar.inProgress = true;
    compVar.errorMsg = '';
    forceRender();

    compVar.sendClicked = true;

    /*=== for each unique agent ===*/
    /*=== use a FOR loop (instead of forEach) to break out in case of an error ===*/
    for (let i=0; i<props.mailData.length; i++) {

      let addressbook_id = props.mailData[i].Addressbook_id;

      const throughAddressbookId = props.mailData[i].Through_Addressbook_id;
      const mailAddresbook_id = (throughAddressbookId !== null) ? throughAddressbookId : addressbook_id;
  
      const recipientObj = await getVoucherRecipentObj (mailAddresbook_id, _g_users_id);

      const bodyObj = await getPrestoBodyObj (recipientObj, props.mailData[i], props.tourCode, props.paxName, props.numPax, props.confirmation, _g_users_id);

      // this will save it to the drafts folder
      bodyObj.isDraft = true;

      // this has to be set for the backend endpoint to work correctly
      bodyObj.reportName = '';
      bodyObj.subject = (props.confirmation) ? 'Request for Reservation -- ' : 'Request for Cancellation -- ';
      bodyObj.subject += (recipientObj.organisation !== null) ? recipientObj.organisation.trim() + ' -- ' : '';
      bodyObj.subject += (props.tourCode !== null) ? props.tourCode : '';

      const getSendMailStatus = await sendMail(bodyObj);

      // Wait for 1000ms -- Checking if concurrent error would be resolved
      await waitFor(1000);

      if ((getSendMailStatus.success !== undefined) && (getSendMailStatus.success)) {
        compVar.sentMails++;

        if (compVar.sentMails === compVar.numMails) {
          compVar.sentMails = 0;
          compVar.inProgress = false;          
          compVar.toastIsVisible = true;
        } 

        forceRender();
  
      } else {
        compVar.sentMails = 0;
        compVar.inProgress = false;          
        compVar.errorMsg = 'Error sending mail. Please check your internet connection or gmail credentials';
        break;
      }

      // update database 
      await updateDb(props.mailData[i]);

    };

  };  

  //**********************************************************/
  const onToastHiding = async () => {
    compVar.toastIsVisible = false;
    forceRender();
  }  
    
  //**********************************************************/
  const buttonsJsx = () => {

    let buttonText = (props.confirmation === null) ? 'Create PDFs' : 'Send Emails';

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
            <Button text={buttonText+" (Solita LLP)"} type="success" onClick={sendNewEmails}/>
          </div>

          <div style={{display: 'flex', flex: 1}}>
          </div>
        </div>
        </>
      )
    
  }

  //**********************************************************/
  const ProgressBarJsx = () => {

    return (
      <>
        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
          <ProgressBar
            id="progress-bar-status"
            className={compVar.numMails-compVar.sentMails === 0 ? 'complete' : '' }
            width="200"
            min={0}
            max={compVar.numMails}
            value={compVar.sentMails}
          />        
        </div>

      </>
      )
    
  }

  //**********************************************************/
  const ToastJsx = () => {

    let toastMessage = (props.confirmation === null) ? 'Please check your Downloads folder' : compVar.toastMessage;

    return (
      <>
        <div style={toastContainerStyle}>
          <Toast
            visible={compVar.toastIsVisible}
            message={toastMessage}
            type={compVar.toastMessageType}
            onHiding={onToastHiding}
            displayTime={3000}
            maxWidth={300}
            position={'center'}
          />
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

    const requestStr = (props.numSelectedRec > 1) ? ' requests' : ' request';

    let confirmationString = (props.confirmation) ? 
      props.numSelectedRec.toString() + requestStr + ' for confirmation' :
      props.numSelectedRec.toString() + requestStr + ' for cancellation';

    if (props.confirmation === null) {
      confirmationString = props.numSelectedRec.toString() + requestStr + ' to PDF';
    }

    let confirmationColor = (props.confirmation) ? 'green' : 'red';

    if (props.confirmation === null) {
      confirmationColor = 'blue';
    }

    // No voucher selected
    if (props.numSelectedRec === 0) {
      confirmationString = 'You have not selected any vouchers !';
      confirmationColor = 'red';
    }

    return (
      <>

        <Popup visible={open} height={400} width={900} onHiding={closePopover}>

          <div style={{display: 'flex', flexDirection: 'column'}}>

            <div className="voucher-mail-text">
              {`Tour: ${props.tourCode}`} &nbsp; &nbsp; &nbsp; {`Departure: ${props.tourDate}` }
            </div>

            <div className="voucher-mail-text" style={{fontSize: 18, color: 'blue', paddingTop: 20}}>
              {props.paxName}
            </div>

            <hr style={{width: 700, height: 3}} />

            <div className="voucher-mail-text" style={{color: confirmationColor}}>
              {confirmationString}
            </div>

            <hr style={{width: 700, height: 3}} />

            {compVar.errorMsg.length > 0 &&
              <div style={popupTitleContainerStyle}>
                {compVar.errorMsg}
              </div>
            }

            {buttonsJsx()}

            {compVar.inProgress &&
              ProgressBarJsx()
            }

            {ToastJsx()}

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

export default PrestoSendMails;
