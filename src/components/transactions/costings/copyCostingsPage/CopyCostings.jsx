import React, { useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import DateBox from 'devextreme-react/date-box';
import { CheckBox } from 'devextreme-react/check-box';
import { addMonth, convertDMY_MDY, convert_DbDate_To_DMY, convertDMY_toDate } from '../../../common/CommonTransactionFunctions';

import '../../../common/ButtonsPanel.css'
import './CopyCostings.css';

let compVar = {};

function CopyCostings(props) {

  const [renderToggle, setRenderToggle] = useState(false);  

  const _g_users_id = useSelector(state => state.dbUser.users_id);

  let _g_fromDate = useSelector(state => state.params.costFromDate);
  let _g_toDate = useSelector(state => state.params.costToDate);
  let _g_agents_id = useSelector(state => state.params.agents_id);
  let _g_packages_id = useSelector(state => state.params.packages_id);
  let _g_carPerKmAgents_id = useSelector(state => state.params.carPerKmAgents_id);
  let _g_carPerKmServiceCities_id = useSelector(state => state.params.carPerKmServiceCities_id);
  let _g_carP2pAgents_id = useSelector(state => state.params.carP2pAgents_id);
  let _g_carP2pFromCities_id = useSelector(state => state.params.carP2pFromCities_id);
  let _g_carP2pToCities_id = useSelector(state => state.params.carP2pToCities_id);
  let _g_carCgAgents_id = useSelector(state => state.params.carCgAgents_id);
  let _g_carCgCarHireGroups_id = useSelector(state => state.params.carCgCarHireGroups_id);
  let _g_title = useSelector(state => state.params.costService);

//**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      message: '', allServices: false, 
      fromDate: addMonth(_g_fromDate, 12, 2),
      toDate: addMonth(_g_toDate, 12, 2),
      copiedData: false, isPresent: false,
      copyInProgress: false
    } 
    
    forceRender();
        
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
  const closePopup = async () => {
    if (props.getSelectedCopyCostingOption !== undefined) {
      props.getSelectedCopyCostingOption({open: false, copiedData: compVar.copiedData});
    }    
  };  

  //**********************************************************/
  const executeSP = async () => {

    /*=== date from where you copy (used in Packages) ===*/
    const fromDate2 = convertDMY_MDY(_g_fromDate);

    const fromDate = convertDMY_MDY(compVar.fromDate);
    
    let spData = '';
    // Accommodation
    if (props.serviceType === 1) {
      const toDate = convertDMY_MDY(compVar.toDate);
      spData = {sql: "EXEC [p_CopyCostAccommodation] " + props.id + ", '" + 
        fromDate + "', '" + toDate + "', " + _g_users_id}
    // Sightseeing / Transfers    
    } else if (((props.serviceType === 2) || (props.serviceType === 3)) && (!compVar.allServices)) {
      spData = {sql: "EXEC [p_CopyCost_SS_Transfers] " + props.id + ", '" + 
        fromDate + "', " + _g_users_id}
    // Packages    
    } else if (props.serviceType === 4) {
      spData = {sql: "EXEC [p_CopyCostPackages] " + _g_agents_id + ", " +
        _g_packages_id + ", '" + 
        fromDate2 + "', '" + fromDate + "', " + _g_users_id}
    // Car Per Km
    } else if (props.serviceType === 5) {
      spData = {sql: "EXEC [p_CopyCostCarPerKm] " + _g_carPerKmAgents_id + ", " + 
        _g_carPerKmServiceCities_id + ", '" + 
        fromDate2 + "', '" + fromDate + "', " + _g_users_id}
    // Car P2P
    } else if (props.serviceType === 6) {
      spData = {sql: "EXEC [p_CopyCostCarP2P] " + _g_carP2pAgents_id + ", " + 
        _g_carP2pFromCities_id + ", " + _g_carP2pToCities_id + ", '" + 
        fromDate2 + "', '" + fromDate + "', " + _g_users_id}
    // Car Hire Groups
    } else if (props.serviceType === 7) {
      spData = {sql: "EXEC [p_CopyCostCarCityGroups] " + _g_carCgAgents_id + ", " +
      _g_carCgCarHireGroups_id + ", '" +
        fromDate2 + "', '" + fromDate + "', " + _g_users_id}
    } else if (((props.serviceType === 2) || (props.serviceType === 3)) && (compVar.allServices)) {
        // loop through for each service
        for (let i=0; i<props.id_arr.length; i++) {
          spData = {sql: "EXEC [p_CopyCost_SS_Transfers] " + props.id_arr[i] + ", '" + 
          fromDate + "', " + _g_users_id}
          await dbExecuteSp(spData);  
        }
        for (const rec of props.id_arr) {
          spData = {sql: "EXEC [p_CopyCost_SS_Transfers] " + rec + ", '" + 
            fromDate + "', " + _g_users_id}
          await dbExecuteSp(spData);  
        }          
    }

    if (!compVar.allServices) {
      await dbExecuteSp(spData);
    }

  }

  //**********************************************************/
  const checkData = async () => {

    compVar.isPresent = false;

    const fromDate = convertDMY_MDY(compVar.fromDate);
    let query = '';

    // Accommodation
    if (props.serviceType === 1) {
      const toDate = convertDMY_MDY(compVar.toDate);
      query = "SELECT [dbo].[fn_IsAccommodationCostingDatePresent](" + 
        props.id.toString() + ", '" + fromDate + "', '" + toDate + "') AS isPresent";
      const isPresentQry = await dbGetRecordRaw({query: query });
      compVar.isPresent = isPresentQry[0].isPresent;
    }

  };  

  //**********************************************************/
  const copyCostings = async () => {

    await checkData();

    if (compVar.isPresent) {
      compVar.message = "Costing date is overlapping with existing data";
      forceRender();
    } else {
      compVar.message = "Copying data ......";
      compVar.copyInProgress = true;
      forceRender();

      await executeSP();

      compVar.copyInProgress = false;
      compVar.copiedData = true;
      compVar.message = "Data copied ......";
      forceRender();
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
  const onFromValueChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromDate = convert_DbDate_To_DMY(e.value,1);
      compVar.message = '';
      forceRender();
    }
  }
  
  //**********************************************************/
  const onToValueChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.toDate = convert_DbDate_To_DMY(e.value,1);
      compVar.message = '';
      forceRender();
    }
  }

  //**********************************************************/
  const allServicesValueChanged = async (e) => {
    compVar.allServices = e.value;
    forceRender();
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
            <Button text="Close" type="default" onClick={closePopup}/>
          </div>
          <div className="buttons-container">
            <Button text="Select" disabled={disabled} type="success" onClick={copyCostings}/>
          </div>
          <div className="buttons-container">
          </div>
        </div>
      </>
    )

  }

  //**********************************************************/
  const dateRangeJsx = () => {

    const fromStr = (props.serviceType === 1) ? 'From' : 'To Date:';

    return (
      <>
        <div className='copy-costings-date-range-container'>

          <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
            <div className="copy-costings-date-section" style={{flex: 1}}>
              {fromStr}
            </div>
            <div className="copy-costings-date-section" style={{flex: 2}}>
              <DateBox 
                value={convertDMY_toDate(compVar.fromDate)}
                type="date"
                displayFormat="dd/MM/yyyy"
                onValueChanged={onFromValueChanged}
                style={{fontSize: 18}}
              />
            </div>
          </div>

          {(props.serviceType === 1) &&
            <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
              <div className="copy-costings-date-section" style={{flex: 1}}>
                To
              </div>
              <div className="copy-costings-date-section" style={{flex: 2}}>
                <DateBox 
                  value={convertDMY_toDate(compVar.toDate)}
                  type="date"
                  displayFormat="dd/MM/yyyy"
                  onValueChanged={onToValueChanged}
                  style={{fontSize: 18}}
                />
              </div>
            </div>
          }

        </div>

      </>
    )

  }

  //**********************************************************/
  const copyAllServicesJsx = () => {

    let subTitle = (props.serviceType === 2) ? 'Copy all Sighseeings in one go' : 'Copy all Transfers in one go';

    return (
      <>
        {
          (props.serviceType === 2 || props.serviceType === 3) &&
           <div className="copy-costings-checkbox-container">
            <div style={{display: 'flex', flex: 0.7}}>
            </div>
            <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', paddingRight: 5}}>
              {subTitle}
            </div>
            <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start'}}>
              <CheckBox value={compVar.allServices} onValueChanged={allServicesValueChanged}/>
            </div>
          </div>
        } 
      </> 
    )

  }

  //**********************************************************/
  const renderContent = () => {

    const open = (props.open === undefined) ? true : props.open;

    let title = _g_title;
    if (props.serviceType === 2 && compVar.allServices) {
      title = 'All Sightseeings';
    } else if (props.serviceType === 3 && compVar.allServices) {
      title = 'All Transfers';
    }    
    
    const period = (props.serviceType === 1) ? 'Copy to the below period' : 'Copy to the below date';

    return (
      <>
        <Popup visible={open} height={500} width={900} onHiding={closePopup}>

          <div className="copy-costings-outer-container">

            <div className="copy-costings-section" style={{flex: 1, fontSize: 20}}>
              {`Copy costings from ${_g_fromDate}`}
            </div>
            <div className="copy-costings-section" style={{flex: 1, fontSize: 20, color: 'blue'}}>
              {title}
            </div>
            <div className="copy-costings-section" style={{flex: 0.5}}>
              {period}
            </div>
            <div className="copy-costings-section" style={{flex: 2}}>
              {dateRangeJsx()}
            </div>
            <div className="copy-costings-section" style={{flex: 0.5}}>
              {copyAllServicesJsx()}
            </div>
            <div className="copy-costings-section" style={{flex: 1}}>
              {compVar.copyInProgress ? 
                <LoadIndicator id="large-indicator" height={60} width={60} /> : 
                buttonsJsx()
              }
            </div>
            <div className="copy-costings-section" style={{flex: 0.5, color: 'red'}}>
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

export default CopyCostings;
