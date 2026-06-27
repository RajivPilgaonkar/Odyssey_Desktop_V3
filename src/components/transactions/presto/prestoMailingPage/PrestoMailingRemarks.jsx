import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMYtoDate, convertDMY_MDY, isValidDate } from "../../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import ScrollView from 'devextreme-react/scroll-view';
import Switch from "react-switch";
import {setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import DateBox from 'devextreme-react/date-box';
import TextArea from 'devextreme-react/text-area';

import '../../../common/MasterGrid.css'
import './PrestoMailing.css';

let compVar = {};

function PrestoMailingRemarks(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [emailSwitch, setEmailSwitch] = useState(false);  
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
      boxWidth: 630, boxHeight: 320,
      remarks: '', remarksReservation: '', remarksCancellation: '', 
      saveRecord: false, remarksChanged: false, 
      confirmedOnChanged: false, cancelledOnChanged: false,
      cancelledOn: null, confirmedOn: null, 
      recTypesArr: [
        {voucherTypes_id: 2, tableName: 'QuoTickets', fieldName: 'QuoTickets_id', remarksFieldName: 'Remarks', remarksReservationFieldName: 'RemarksAgent', remarksCancellationFieldName: 'RemarksAgentCancel'},
        {voucherTypes_id: 3, tableName: 'QuoAccommodation', fieldName: 'QuoAccommodation_id', remarksFieldName: 'Remarks', remarksReservationFieldName: 'RemarksHotel', remarksCancellationFieldName: 'RemarksHotelCancel'},
        {voucherTypes_id: 4, tableName: 'QuoServices', fieldName: 'QuoServices_id', remarksFieldName: 'Remarks', remarksReservationFieldName: 'RemarksHotel', remarksCancellationFieldName: 'RemarksHotelCancel'},
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
  const fetchInitialData = async() => {
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const recTypeArr = compVar.recTypesArr.filter(rec => rec.voucherTypes_id === props.prestoObj.VoucherTypes_id);
    const recType = recTypeArr[0];

    const query = "SELECT " + recType.remarksFieldName + " AS Remarks, ConfirmedOn, CancelledOn, " + 
      recType.remarksReservationFieldName + " AS RemarksReservation, " +
      recType.remarksCancellationFieldName + " AS RemarksCancellation " +
      " FROM " + recType.tableName + " " +
      "WHERE " + recType.fieldName + " = " + props.prestoObj[recType.fieldName] + " ";

    try {
      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Presto Mailing Records'});

      compVar.remarks = (compVar.mainData.length > 0) ? compVar.mainData[0].Remarks : '';
      compVar.remarksReservation = (compVar.mainData.length > 0) ? compVar.mainData[0].RemarksReservation : '';
      compVar.remarksCancellation = (compVar.mainData.length > 0) ? compVar.mainData[0].RemarksCancellation : '';
  
      compVar.confirmedOn = (compVar.mainData.length > 0 && compVar.mainData[0].ConfirmedOn !== null) ? convert_DbDate_To_DMY(compVar.mainData[0].ConfirmedOn.replace('T', ' ').replace('Z', ''),1) : null;
      compVar.cancelledOn = (compVar.mainData.length > 0 && compVar.mainData[0].CancelledOn !== null) ? convert_DbDate_To_DMY(compVar.mainData[0].CancelledOn.replace('T', ' ').replace('Z', ''),1) : null;
        
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }
  
  //**********************************************************/
  const closePopover = async () => {
    const refresh = (compVar.saveRecord) ? true : false;

    if (props.getSelectedPrestoMailingOption !== undefined) {
      await props.getSelectedPrestoMailingOption({open: false, refresh: refresh});
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
  const onConfirmedDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.confirmedOn = convert_DbDate_To_DMY(e.value,1);
    } else {
      compVar.confirmedOn = null;
    }
    compVar.confirmedOnChanged = true;
    forceRender();
}

  //**********************************************************/
  const onCancelledDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.cancelledOn = convert_DbDate_To_DMY(e.value,1);
      compVar.cancelledOnChanged = true;
      forceRender();
    }
  }

  //**********************************************************/
  const onRemarksChange = async (e) => {    
    compVar.remarks = e.value;
    compVar.remarksChanged = true;
    forceRender();
  }

  //**********************************************************/
  const onRemarksReservationChange = async (e) => {    
    compVar.remarksReservation = e.value;
    compVar.remarksReservationChanged = true;
    forceRender();
  }

  //**********************************************************/
  const onRemarksCancellationChange = async (e) => {    
    compVar.remarksCancellation = e.value;
    compVar.remarksCancellationChanged = true;
    forceRender();
  }

  //**********************************************************/
  const emailSwitchValueChanged = (e) => {
    setEmailSwitch(e);
  }

  //**********************************************************/
  const saveVoucherRemarks = async () => {

    let changed = false;

    const recTypeArr = compVar.recTypesArr.filter(rec => rec.voucherTypes_id === props.prestoObj.VoucherTypes_id);
    const recType = recTypeArr[0];

    let sql = '';
    let spData = {};

    if (compVar.remarksChanged) {
  
      sql = "UPDATE " + recType.tableName + " " + 
        "SET " + recType.remarksFieldName + " = '" + compVar.remarks.replace(/'/g, "''") + "' " +
        "WHERE " + recType.fieldName + " = " + props.prestoObj[recType.fieldName] + " ";

      spData = {sql: sql};
      await dbExecuteSp(spData);
  
      changed = true; 
          
    }

    if (compVar.remarksReservationChanged) {
  
      sql = "UPDATE " + recType.tableName + " " + 
        "SET " + recType.remarksReservationFieldName + " = '" + compVar.remarksReservation.replace(/'/g, "''") + "' " +
        "WHERE " + recType.fieldName + " = " + props.prestoObj[recType.fieldName] + " ";

      spData = {sql: sql};
      await dbExecuteSp(spData);
  
      changed = true; 
          
    }

    if (compVar.remarksCancellationChanged) {
  
      sql = "UPDATE " + recType.tableName + " " + 
        "SET " + recType.remarksCancellationFieldName + " = '" + compVar.remarksCancellation.replace(/'/g, "''") + "' " +
        "WHERE " + recType.fieldName + " = " + props.prestoObj[recType.fieldName] + " ";

      spData = {sql: sql};
      await dbExecuteSp(spData);
  
      changed = true; 
          
    }

    if (compVar.confirmedOnChanged) {
  
      const confirmedOn = (compVar.confirmedOn === null) ? 'null' : "'" + convertDMY_MDY(compVar.confirmedOn) + "'";
  
      sql = "UPDATE " + recType.tableName + " " +
        "SET ConfirmedOn = " + confirmedOn + " " +
        "WHERE " + recType.fieldName + " = " + props.prestoObj[recType.fieldName] + " ";

      spData = {sql: sql};
      await dbExecuteSp(spData);
  
      changed = true; 
        
    }

    if (compVar.cancelledOnChanged) {
  
      const cancelledOn = (compVar.cancelledOn === null) ? 'null' : "'" + convertDMY_MDY(compVar.cancelledOn) + "'";
  
      sql = "UPDATE " + recType.tableName + " " +
        "SET CancelledOn = " + cancelledOn + " " +
        "WHERE " + recType.fieldName + " = " + props.prestoObj[recType.fieldName];

      spData = {sql: sql};
      await dbExecuteSp(spData);
  
      changed = true; 
    }

    if (changed) {
  
      compVar.saveRecord = true;
      await closePopover();
  
    }

  };  

  //**********************************************************/
  const textAreaJsx = (index) => {

    const values = [compVar.remarks, compVar.remarksReservation, compVar.remarksCancellation];
    const widths = [650, 650, 650]
    const heights = [200, 100, 100]
    const styles = [{fontSize: 18},{fontSize: 18},{fontSize: 18}]
    const onValuesChanged = [onRemarksChange, onRemarksReservationChange, onRemarksCancellationChange];
    const maxLengths = [200, 200, 200];

    const value = values[index];
    const width = widths[index];
    const height = heights[index];
    const style = styles[index];
    const onValueChanged = onValuesChanged[index];
    const maxLength = maxLengths[index];
    
    return (
      <>
        <TextArea 
          value={value}
          width={width}
          height={height}
          style={style}
          onValueChanged={onValueChanged}
          maxLength={maxLength}
        />

      </>
    )

  }

  //**********************************************************/
  const switchJsx = (index) => {

    const labels = ['Remarks for Email'];
    const heights = [20];
    const widths = [40];
    const onSwitchChanges = [emailSwitchValueChanged];
    const onChecks = [emailSwitch];

    const label = labels[index];
    const height = heights[index];
    const width = widths[index];
    const onSwitchChange = onSwitchChanges[index];
    const onCheck = onChecks[index];

    return (
      <>
        <div style={{paddingRight: 10, fontSize: 16}}>
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

    const confirmedOn = (compVar.confirmedOn !== null) ? convertDMYtoDate(compVar.confirmedOn) : null; 
    const cancelledOn = (compVar.cancelledOn !== null) ? convertDMYtoDate(compVar.cancelledOn) : null; 

    const labels = ['Confirmed On:', 'Cancelled On:'];
    const dates = [confirmedOn, cancelledOn];
    const onValuesChanged = [onConfirmedDateChanged, onCancelledDateChanged];

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
        compVar.confirmedOn = null;
      } else if (index === 1) {
        compVar.cancelledOn = null;
      }
    }
    
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
            />
          </div>
        </div>
      </>
    )

  }
    
  //**********************************************************/
  const buttonsJsx = () => {

    const disabled = !(compVar.remarksChanged || 
      compVar.remarksReservationChanged || compVar.remarksCancellationChanged || 
      compVar.confirmedOnChanged || compVar.cancelledOnChanged);

    /*=== Called from tickets in DTD ===*/
    return (
      <>
        <div style={{height: 60, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', flex: 1}}>
          </div>

          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Cancel" type="default" onClick={closePopover}/>
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text={"Save"} disabled={disabled} type="success" onClick={saveVoucherRemarks}/>
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
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }
    
    const open = (props.open === undefined) ? true : props.open;

    return (
      <>

        <Popup visible={open} height={650} width={900} onHiding={closePopover}>

          <ScrollView width='100%' height='100%' useNative={false}>

            <div style={{display: 'flex', flexDirection: 'column'}}>

              <div className="presto-mail-text">
                {`Requests for Tour: ${props.tourCode}`}  &nbsp; &nbsp; &nbsp; {`Departure: ${props.tourDate}` }
              </div>

              <div className="presto-mail-text" style={{fontSize: 18, color: 'blue', paddingTop: 20}}>
                {props.prestoObj.Organisation} -- [in {props.prestoObj.City}]
              </div>
              <div className="presto-mail-text" style={{fontSize: 18, color: 'green', paddingTop: 20, paddingBottom: 20}}>
                {props.prestoObj.ServiceString}
              </div>

              <div className="master-grid-params-container" style={{flex: 1, background: '#ffefcc', paddingBottom: 5}}>
                {switchJsx(0)}
              </div>

              {!emailSwitch &&
                <div style={{width: '100%', height: compVar.boxHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, background: '#f5f5f0', border: '0.5px solid rgba(0, 0, 0, .5)', borderRadius: 15 }}>
                  <div style={{height: compVar.boxHeight, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>

                    <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                      <div className="presto-mail-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                        Remarks for Hotel/Agent for this request (max char 200)
                      </div>
                      <div className="presto-mail-text" style={{flex: 5, fontSize: 16, color: '#000000'}}>
                        {textAreaJsx(0)}
                      </div>
                      <div className="presto-mail-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                        {compVar.errorMsg}
                      </div>
                    </div>

                    <div style={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10}}>
                      <div className="presto-mail-date" style={{flex: 0.4}}></div>
                      <div className="presto-mail-date" style={{flex: 1}}>
                        {dateParamsJsx(0)}
                      </div>
                      <div className="presto-mail-date" style={{flex: 1}}>
                        {dateParamsJsx(1)}
                      </div>
                      <div className="presto-mail-date" style={{flex: 0.4}}></div>
                    </div>

                  </div>
                </div>
              }

              {emailSwitch &&
                <div style={{width: '100%', height: compVar.boxHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, background: '#f5f5f0', border: '0.5px solid rgba(0, 0, 0, .5)', borderRadius: 15 }}>
                  <div style={{height: compVar.boxHeight, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>

                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <div className="presto-mail-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                        Add this remark in the RESERVATION request email (max char 200)
                      </div>
                      <div className="presto-mail-text" style={{flex: 5, fontSize: 16, color: '#000000'}}>
                        {textAreaJsx(1)}
                      </div>
                      <hr style={{width: '90%'}}/>
                      <div className="presto-mail-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                        Add this remark in the CANCELLATION request email (max char 200)
                      </div>
                      <div className="presto-mail-text" style={{flex: 5, fontSize: 16, color: '#000000'}}>
                        {textAreaJsx(2)}
                      </div>
                    </div>

                  </div>
                </div>
              }

              {buttonsJsx()}

            </div>

          </ScrollView>

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

export default PrestoMailingRemarks;
