import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { convert_DbDate_To_DMY } from "../../../common/CommonTransactionFunctions";
import { dbGetRecord, setParamValues } from '../../../../actions';
import {getBusinessCities, getAgentListing} from "../../../common/GetOrgListing";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Switch from "react-switch";
import DropDownGrid from "../../../common/DropDownGrid";
import { SERVICE_P2P } from '../../../../actions/types';

import './CarP2p.css'

let compVar = {};

function CarP2pParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_agents_id = useSelector(state => state.params.carP2pAgents_id) || -1;
  let _g_fromCities_id = useSelector(state => state.params.carP2pFromCities_id) || -1;
  let _g_toCities_id = useSelector(state => state.params.carP2pToCities_id) || -1;
  let _g_wef = useSelector(state => state.params.carP2pWef) || convert_DbDate_To_DMY (new Date(), 1);

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      agents_id: _g_agents_id, fromCities_id: _g_fromCities_id, toCities_id: _g_toCities_id, wef: _g_wef,
      agent: '', fromCity: '', toCity: '', dateRange: '', 
      fromCityLookup: [], toCityLookup: [], agentLookup: [], wefLookup: [],      
      fromCitySwitchValue: false, toCitySwitchValue: false, agentSwitchValue: false, wefSwitchValue: false,
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

  }, [compVar.fromCities_id, compVar.toCities_id, compVar.agents_id, compVar.wef]);

  //**********************************************************/
  // When params are changed, write to redux, and send to calling parent component
  useEffect (() => {

    // Params already mounted, so compVar is defined ...
    // ... redux store changes when route selected frm list...
    if (compVar !== undefined && (compVar.fromCities_id !== _g_fromCities_id || compVar.toCities_id !== _g_toCities_id)) {
      compVar.fromCities_id = _g_fromCities_id;
      compVar.toCities_id = _g_toCities_id;
      fetchInitialData();
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [_g_fromCities_id, _g_toCities_id]);


  //**********************************************************/
  const fetchInitialData = async() => {

    await updateAllLookups([1,2,3,4]);

    setInitDataFetched(true);
  }

  //**********************************************************/
  const setAgentLookup = async() => {
    const active = !compVar.agentSwitchValue;
    compVar.agentLookup =  await getAgentListing(SERVICE_P2P.toString(),active);
    setAgent();
  }

  //**********************************************************/
  const setFromCityLookup = async() => {

    let tableStr = 'cities c';

    if (compVar.fromCitySwitchValue) {
      compVar.fromCityLookup = await getBusinessCities();
    } else {
      tableStr = "cities c WHERE c.cities_id IN " + 
        "(SELECT ch.FromCities_id FROM CarHireP2p ch WHERE ch.addressbook_id = " + compVar.agents_id.toString() + ")";    
      compVar.fromCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: tableStr, x_uid: _g_users_id, x_module: 'Cost Car P2P'});   
    } 
    setFromCity();
  }

  //**********************************************************/
  const setToCityLookup = async() => {

    let tableStr = 'cities c';

    if (compVar.toCitySwitchValue) {
      compVar.toCityLookup = await getBusinessCities();
    } else {
      tableStr = "cities c WHERE c.cities_id IN " + 
        "(SELECT ch.ToCities_id FROM CarHireP2p ch WHERE ch.addressbook_id = " + compVar.agents_id.toString() + " " +
        "AND ch.FromCities_id = " + compVar.fromCities_id.toString() + ") ";    
      compVar.toCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: tableStr, x_uid: _g_users_id, x_module: 'Cost Car P2P'});   
    } 
    setToCity();
  }

  //**********************************************************/
  const setWefLookup = async() => {
    // all wef dates
    let whereStr = 'Addressbook_id = ' + compVar.agents_id.toString() + ' ' +
      'AND FromCities_id = ' + compVar.fromCities_id.toString() + ' ' + 
      'AND ToCities_id = ' + compVar.toCities_id.toString() + ' ';

    // only in the last 3 years
    if (!compVar.wefSwitchValue) {
      whereStr = whereStr + ' AND wef > DATEADD(year,-3,GETDATE()) '; 
    }    

    compVar.wefLookup = await dbGetRecord({fields: ["DISTINCT Wef, CONVERT(varchar(10),wef,103)  + '-' + CASE WHEN wet IS NOT NULL THEN CONVERT(varchar(10),wet,103) ELSE '' END AS DateRange"], orders: ['Wef DESC'], table: 'CarHireP2P', where: whereStr, x_uid: _g_users_id, x_module: 'Cost Car P2P'});   
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
  const setFromCity = async() => {
    const idx = compVar.fromCityLookup.findIndex(rec => rec.cities_id === compVar.fromCities_id);
    if (idx < 0) {
      compVar.fromCities_id = -1;
      compVar.fromCity = '';
      if (compVar.fromCityLookup.length > 0) {
        compVar.fromCities_id = compVar.fromCityLookup[0].cities_id;
        compVar.fromCity = compVar.fromCityLookup[0].city;  
      }
    } else {
      compVar.fromCity = compVar.fromCityLookup[idx].city;
    }
  }

  //**********************************************************/
  const setToCity = async() => {
    const idx = compVar.toCityLookup.findIndex(rec => rec.cities_id === compVar.toCities_id);
    if (idx < 0) {
      compVar.toCities_id = -1;
      compVar.toCity = '';
      if (compVar.toCityLookup.length > 0) {
        compVar.toCities_id = compVar.toCityLookup[0].cities_id;
        compVar.toCity = compVar.toCityLookup[0].city;  
      }
    } else {
      compVar.toCity = compVar.toCityLookup[idx].city;
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
      await updateAllLookups([2,3,4]);
    }
  }

  //**********************************************************/
  const onFromCityChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromCities_id = e[0].cities_id;
      compVar.fromCity = e[0].city;
      await updateAllLookups([3,4]);
    }
  }

  //**********************************************************/
  const onToCityChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.toCities_id = e[0].cities_id;
      compVar.toCity = e[0].city;
      await updateAllLookups([4]);
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
      await setFromCityLookup();
    }
    if (modeArr.includes(3)) {
      await setToCityLookup();
    }
    if (modeArr.includes(4)) {
      await setWefLookup();
    }
    forceRender();
  }

  //**********************************************************/
  const agentSwitchValueChanged = async (e) => {
    compVar.agentSwitchValue = e;
    await updateAllLookups([1,2,3,4]);
  }

  //**********************************************************/
  const fromCitySwitchValueChanged = async (e) => {    
    compVar.fromCitySwitchValue = e;
    await updateAllLookups([2,3,4]);
  }

  //**********************************************************/
  const toCitySwitchValueChanged = async (e) => {    
    compVar.toCitySwitchValue = e;
    await updateAllLookups([3,4]);
  }

  //**********************************************************/
  const wefSwitchValueChanged = async (e) => {
    compVar.wefSwitchValue = e;
    await updateAllLookups([4]);
  }

  //**********************************************************/
  const getSelectedParams = async (paramObj) => {
  
    // Save to redux store through params reducer
    dispatch(setParamValues({
      carP2pAgents_id: compVar.agents_id,
      carP2pFromCities_id: compVar.fromCities_id,
      carP2pToCities_id: compVar.toCities_id,
      carP2pWef: compVar.wef
    }));


    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        agents_id: compVar.agents_id,
        fromCities_id: compVar.fromCities_id,
        toCities_id: compVar.toCities_id,
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

    const lookups = [compVar.agentLookup, compVar.fromCityLookup, compVar.toCityLookup, compVar.wefLookup];
    const fieldLists = [['OrgCity'],['city'],['city'],['DateRange']];
    const valueExprs = ['Addressbook_id', 'cities_id', 'cities_id', 'Wef'];
    const displayExprs = ['OrgCity', 'city', 'city', 'DateRange'];
    const labels = ['Agent', 'From', 'To', 'Wef'];
    const placeholders = ["Select an agent...", "Select a city...", "Select a city...", ""];
    const getSelectedRecs = [onAgentChanged, onFromCityChanged, onToCityChanged, onWefChanged];
    const values = [compVar.agents_id, compVar.fromCities_id, compVar.toCities_id, compVar.wef];
    const componentWidths = [270,150,150,230];
    const dropDownWidths = [500,300,300,250];
    const labelStyles = [{width: 80, flex: 0.15}, {width: 80, flex: 0.5}, {width: 80, flex: 0.5}, {width: 80, flex: 0.8}] 

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

    const onSwitchChanges = [agentSwitchValueChanged, fromCitySwitchValueChanged, toCitySwitchValueChanged, wefSwitchValueChanged];
    const onCheckedValues = [compVar.agentSwitchValue, compVar.fromCitySwitchValue, compVar.toCitySwitchValue, compVar.wefSwitchValue];

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
        <div className="carp2p-panelparams-container" style={{width: '100%'}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return (
      <div className="carp2p-panelparams-container" style={{width: '100%'}}>

        <div className="carp2p-panelparams-section-container">

          <div className="carp2p-panelparams-city-container" style={{flex: 1}}>
            {dropDownParamsJsx(0)}
            {switchParamsJsx(0)}
          </div>
          <div className="carp2p-panelparams-city-container" style={{flex: 0.6}}>
            {dropDownParamsJsx(1)}
            {switchParamsJsx(1)}
          </div>
          <div className="carp2p-panelparams-city-container" style={{flex: 0.6}}>
            {dropDownParamsJsx(2)}
            {switchParamsJsx(2)}
          </div>
          <div className="carp2p-panelparams-city-container" style={{flex: 1}}>
            {dropDownParamsJsx(3)}
            {switchParamsJsx(3)}
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

export default CarP2pParams;
