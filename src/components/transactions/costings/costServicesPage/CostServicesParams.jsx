import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { convert_DbDate_To_DMY } from "../../../common/CommonTransactionFunctions";
import { dbGetRecord, setParamValues } from '../../../../actions';
import {getAgentServicesListing, getBusinessCities} from "../../../common/GetOrgListing";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Switch from "react-switch";
import DropDownGrid from "../../../common/DropDownGrid";

import './CostServices.css'

let compVar = {};

function CostServicesParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_agents_id = useSelector(state => state.params.ssAgents_id) || -1;
  let _g_serviceCities_id = useSelector(state => state.params.ssServiceCities_id) || -1;
  let _g_wef = useSelector(state => state.params.ssWef) || convert_DbDate_To_DMY (new Date(), 1);

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      agents_id: _g_agents_id, serviceCities_id: _g_serviceCities_id, wef: _g_wef,
      agent: '', serviceCity: '', dateRange: '', 
      serviceCityLookup: [], agentLookup: [], wefLookup: [],
      serviceCitySwitchValue: false, agentSwitchValue: false, wefSwitchValue: false,
      errorMsg: '',
      popupDialogIndex: 0
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
  // When initDataFetched is changed and set to true, call onPanelLoad
  useEffect (() => {

    if (initDataFetched) {
      onPanelLoad();
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [initDataFetched]);

  //**********************************************************/
  // When params are changed, write to redux, and send to calling parent component
  useEffect (() => {

    getSelectedParams({refresh: true})

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.serviceCities_id, compVar.agents_id, compVar.wef]);

  //**********************************************************/
  const fetchInitialData = async() => {

    await updateAllLookups([1,2,3]);

    setInitDataFetched(true);
  }

  //**********************************************************/
  const setAgentLookup = async() => {
    const services = (props.transfer) ? '5' : '4';
    const active = !compVar.agentSwitchValue;
    compVar.agentLookup = await getAgentServicesListing(services, active);
    setAgent();
  }

  //**********************************************************/
  const setServiceCityLookup = async() => {

    const transfer = (props.transfer) ? 1 : 0;

    let tableStr = 'cities c';

    if (compVar.serviceCitySwitchValue) {
      compVar.serviceCityLookup = await getBusinessCities();
    } else {
      tableStr = "cities c WHERE c.cities_id IN " + 
        "(SELECT cs.cities_id FROM costservices cs LEFT JOIN Services s ON cs.services_id = s.services_id WHERE cs.addressbook_id = " + compVar.agents_id.toString() + " AND s.transfer = " + transfer.toString() +  " )";    
      compVar.serviceCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: tableStr, x_uid: _g_users_id, x_module: 'Cost Services'});   
    } 
    setServiceCity();
  }

  //**********************************************************/
  const setWefLookup = async() => {
    // all wef dates
    let whereStr = 'Addressbook_id = ' + compVar.agents_id.toString() + ' ' +
      'AND Cities_id = ' + compVar.serviceCities_id.toString();

    // only in the last 3 years
    if (!compVar.wefSwitchValue) {
      whereStr = whereStr + ' AND wef > DATEADD(year,-3,GETDATE()) '; 
    }    

    compVar.wefLookup = await dbGetRecord({fields: ["DISTINCT Wef, CONVERT(varchar(10),wef,103) AS DateRange"], orders: ['Wef DESC'], table: 'CostServices', where: whereStr, x_uid: _g_users_id, x_module: 'Cost Services'});   
    compVar.wefLookup = compVar.wefLookup.map(rec => ({...rec, Wef: convert_DbDate_To_DMY(rec.Wef,1)}) );    

    const idx = compVar.wefLookup.findIndex(rec => rec.Wef === compVar.wef);
    if (compVar.wefLookup.length > 0) {
      if (idx < 0) {
        compVar.wef = compVar.wefLookup[0].Wef;
        compVar.dateRange = compVar.wefLookup[0].DateRange;
      } else {
        compVar.dateRange = compVar.wefLookup[idx].DateRange;
      } 
    } else {
      compVar.dateRange = '';
    }
    setWef();
  }

  //**********************************************************/
  const setAgent = async() => {
    const idx = compVar.agentLookup.findIndex(rec => rec.Addressbook_id === compVar.agents_id);
    if (idx < 0) {
      compVar.agents_id = -1;
      compVar.agent = '';
    } else {
      compVar.agent = compVar.agentLookup[idx].OrgCity;
    }
  }

  //**********************************************************/
  const setServiceCity = async() => {
    const idx = compVar.serviceCityLookup.findIndex(rec => rec.cities_id === compVar.serviceCities_id);
    if (idx < 0) {
      compVar.serviceCities_id = -1;
      compVar.serviceCity = '';
      if (compVar.serviceCityLookup.length > 0) {
        compVar.serviceCities_id = compVar.serviceCityLookup[0].cities_id;
        compVar.serviceCity = compVar.serviceCityLookup[0].city;  
      }
    } else {
      compVar.serviceCity = compVar.serviceCityLookup[idx].city;
    }
  }

  //**********************************************************/
  const setWef = async() => {
    const idx = compVar.wefLookup.findIndex(rec => rec.Wef === compVar.wef);
    if (idx < 0) {
      compVar.wef = '';
      compVar.dateRange = '';
    } else {
      compVar.dateRange = compVar.wefLookup[idx].DateRange;
    }
  }

  //**********************************************************/
  const onAgentChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.agents_id = e[0].Addressbook_id;
      compVar.agent = e[0].OrgCity;
      await updateAllLookups([2,3]);
      forceRender();
    }
  }

  //**********************************************************/
  const onServiceCityChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.serviceCities_id = e[0].cities_id;
      compVar.serviceCity = e[0].city;      
      await updateAllLookups([3]);
      forceRender();
    }
  }

  //**********************************************************/
  const onWefChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.wef = e[0].Wef;
      compVar.dateRange = e[0].DateRange;
      forceRender();
    }
  }

  //**********************************************************/
  const updateAllLookups = async (modeArr) => {
    if (modeArr.includes(1)) {
      await setAgentLookup();
    }
    if (modeArr.includes(2)) {
      await setServiceCityLookup();
    }
    if (modeArr.includes(3)) {
      await setWefLookup();
    }
    forceRender();
  }

  //**********************************************************/
  const agentSwitchValueChanged = async (e) => {
    compVar.agentSwitchValue = e;
    await updateAllLookups([1,2,3]);
    forceRender();
  }

  //**********************************************************/
  const serviceCitySwitchValueChanged = async (e) => {    
    compVar.serviceCitySwitchValue = e;
    await updateAllLookups([2,3]);
    forceRender();
  }

  //**********************************************************/
  const wefSwitchValueChanged = async (e) => {
    compVar.wefSwitchValue = e;
    await updateAllLookups([3]);
    forceRender();
  }

  //**********************************************************/
  const getSelectedParams = async (paramObj) => {
  
    // Save to redux store through params reducer
    dispatch(setParamValues({
      ssAgents_id: compVar.agents_id,
      ssServiceCities_id: compVar.serviceCities_id,
      ssWef: compVar.wef
    }));


    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        agents_id: compVar.agents_id,
        serviceCities_id: compVar.serviceCities_id,
        dateRange: compVar.dateRange,
        wef: compVar.wef,
        refresh: paramObj.refresh,
      });
    }

  }
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }


  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.agentLookup, compVar.serviceCityLookup, compVar.wefLookup];
    const fieldLists = [['OrgCity'],['city'],['DateRange']];
    const valueExprs = ['Addressbook_id', 'cities_id', 'wef'];
    const displayExprs = ['OrgCity', 'city', 'DateRange'];
    const labels = ['Agent', 'Service City', 'Wef'];
    const placeholders = ["Select an agent...", "Select a city...", ""];
    const getSelectedRecs = [onAgentChanged, onServiceCityChanged, onWefChanged];
    const values = [compVar.agent, compVar.serviceCity, compVar.dateRange];
    const componentWidths = [320,200,200];
    const dropDownWidths = [400,300,250];
    const labelStyles = [{width: 80, flex: 0.15}, {width: 80, flex: 0.5}, {width: 80, flex: 0.8}] 

    const lookup = lookups[index];
    const fieldList = fieldLists[index];
    const valueExpr = valueExprs[index];
    const displayExpr = displayExprs[index];
    const label = labels[index];
    const placeholder = placeholders[index];
    const getSelectedRec = getSelectedRecs[index];
    const value = values[index];
    const componentWidth = componentWidths[index];
    const dropDownWidth = dropDownWidths[index];
    const labelStyle = labelStyles[index]; 
    
    return (
        <DropDownGrid
          listArray={lookup}
          fieldList={fieldList}
          valueExpr={valueExpr}
          displayExpr={displayExpr}
          label={label}
          placeholder={placeholder}
          getSelectedRecord={getSelectedRec}
          showColumnHeaders={false}
          value={value}
          labelStyle={labelStyle}
          dropDownStyle={{width: componentWidth}}
          dropDownOptions={{width: dropDownWidth}}
        />  
    );

  }

  //**********************************************************/
  const switchParamsJsx = (index) => {

    const onSwitchChanges = [agentSwitchValueChanged, serviceCitySwitchValueChanged, wefSwitchValueChanged];
    const onCheckedValues = [compVar.agentSwitchValue, compVar.serviceCitySwitchValue, compVar.wefSwitchValue];

    const onSwitchChange = onSwitchChanges[index];
    const onCheckedValue = onCheckedValues[index];

    return (
      <>
        <div style={{paddingLeft: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          <Switch 
            height={20} 
            width={40} 
            onChange={onSwitchChange} 
            checked={onCheckedValue} 
            uncheckedIcon={false}
          />
        </div>
      </>
    )

  }


  //**********************************************************/
  const onPanelLoad = async () => {

    if (props.onPanelLoad !== undefined) {
      await props.onPanelLoad ({
      });
    }

  }

  //**********************************************************/
  const renderContent = () => {

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="costser-panelparams-container" style={{width: '100%'}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return (
      <div className="costser-panelparams-container" style={{width: '100%'}}>

        <div className="costser-panelparams-section-container">

          <div className="costser-panelparams-city-container" style={{flex: 1}}>
            {dropDownParamsJsx(0)}
            {switchParamsJsx(0)}
          </div>
          <div className="costser-panelparams-city-container" style={{flex: 1}}>
            {dropDownParamsJsx(1)}
            {switchParamsJsx(1)}
          </div>
          <div className="costser-panelparams-city-container" style={{flex: 1}}>
            {dropDownParamsJsx(2)}
            {switchParamsJsx(2)}
          </div>

        </div>

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default CostServicesParams;
