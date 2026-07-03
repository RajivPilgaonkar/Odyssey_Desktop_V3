import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dbGetRecord, setRouteFinderParamValues, dbExecuteSp } from '../../../../actions';
import { convert_DbDate_To_DMY, convert_DateObj_To_HHmm, convertDMYtoDate, convertMDY_Hm_toDate, convertDMY_MDY  } from "../../../common/CommonTransactionFunctions";
import { getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import DropDownGrid from "../../../common/DropDownGrid";

import './RouteFinder.css'

let compVar = {};

function RouteFinderParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_fromCities_id = useSelector(state => state.routeFinderParams.fromCities_id) || -1;
  let _g_toCities_id = useSelector(state => state.routeFinderParams.toCities_id) || -1;
  let _g_wef = useSelector(state => state.routeFinderParams.wef) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_wefTime = useSelector(state => state.routeFinderParams.wefTime) || '09:00';
  let _g_lockTime = useSelector(state => state.routeFinderParams.lockTime) || false;

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      cityLookup: [], 
      fromCities_id: _g_fromCities_id, fromCity: '',  
      toCities_id: _g_toCities_id, toCity: '',  
      wef: _g_wef, wefTime: _g_wefTime, lockTime: _g_lockTime,      
      displayAlternatives: false,
      errorMsg: ''
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
  const fetchInitialData = async() => {
    try {
      const whereStr = " countries_id IN (SELECT countries_id FROM countries WHERE OperateBusiness = 1) ";
      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr, x_uid: _g_users_id, x_module: 'Distances'});   

      // if selected from city is saved, use it
      if (compVar.fromCities_id > -1)  {
        const idx = compVar.cityLookup.findIndex(rec => rec.cities_id === compVar.fromCities_id);
        if (idx > -1) {
          compVar.fromCity = compVar.cityLookup[idx].city;
        }
      }

      // if selected to city is saved, use it
      if (compVar.toCities_id > -1)  {
        const idx = compVar.cityLookup.findIndex(rec => rec.cities_id === compVar.toCities_id);
        if (idx > -1) {
          compVar.toCity = compVar.cityLookup[idx].city;
        }
      }
      
    } catch(err) {
      alert(err);
    }
  
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
  const cityParamsJsx = (index) => {

    const label = (index === 1) ? "From City" : "To City";
    const getSelectedRecord = (index === 1) ? onFromCitySelect : onToCitySelect;
    const value = (index === 1) ? compVar.fromCities_id : compVar.toCities_id;

    return (
      <DropDownGrid
        listArray={compVar.cityLookup}
        fieldList={['city']}
        valueExpr="cities_id"
        displayExpr="city"
        label={label}
        placeholder="Select a city..."
        getSelectedRecord={getSelectedRecord}
        showColumnHeaders={false}
        value={value}
        labelStyle={{width: 80}}
        dropDownStyle={{width: 150}}
        dropDownOptions={{width: 300}}
      />
  
    );

  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const wef = convertDMYtoDate(compVar.wef); 
    const wefTime = convertMDY_Hm_toDate(convertDMY_MDY(compVar.wef) + ' ' + compVar.wefTime);

    const label = (index === 1) ? "As On" : "At";
    const type = (index === 1) ? "date" : "time";
    const width = (index === 1) ? 180 : 100;
    const displayFormat = (index === 1) ? "dd/MM/yyyy" : "HH:mm";
    const value = (index === 1) ? wef : wefTime;
    const onValueChanged = (index === 1) ? onWefChanged : onWefTimeChanged;
    
    return (
      <>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          {label}
        </div>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          <DateBox 
            type={type}
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
  const buttonParamsJsx = (index) => {

    const lockHint = (compVar.lockTime) ? 'Unlock Time' : 'Lock Time';
    const lockIcon = (compVar.lockTime) ? "icons/unlock.png" : "icons/lock.png";

    const hintAlternative = (compVar.displayAlternatives) ? "Hide Alternatives" : "Show Alternatives";

    const icon = (index === 1) ? lockIcon : "icons/AlternativeRoute.png";
    const hint = (index === 1) ? lockHint : hintAlternative;
    const onClick = (index === 1) ? onLockTimeChanged : alternativeRoute;

    const lockColor = (compVar.lockTime) ? '#ffb3b3' : '#d6f5d6';
    const style = (index === 1) ? {background: lockColor} : null;

    return (
      <Button
        width={35}
        height={35}
        type="normal"
        stylingMode="outlined"
        icon={icon}
        hint={hint}
        onClick={onClick}
        style={style}
      />

    )

  }
  
  //*********************************************************/
  const onFromCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.fromCities_id = e[0].cities_id;
      compVar.fromCity = e[0].city;  
      forceRender();
    }
  }

  //*********************************************************/
  const onToCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.toCities_id = e[0].cities_id;
      compVar.toCity = e[0].city;  
      forceRender();
    }
  }

  //**********************************************************/
  const onWefChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.wef = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const onWefTimeChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.wefTime = convert_DateObj_To_HHmm(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const onLockTimeChanged = () => {
    compVar.lockTime = !compVar.lockTime;
    forceRender();
  }

  //**********************************************************/
  const refreshRouteFinderData = async () => {

    if (!compVar.lockTime) {
      await getEarliestTime();
      forceRender();
    }

    // Save to redux store through params reducer
    dispatch(setRouteFinderParamValues({
      fromCities_id: compVar.fromCities_id,
      toCities_id: compVar.toCities_id,
      wef: compVar.wef,
      wefTime: compVar.wefTime,
      lockTime: compVar.lockTime,
      displayAlternatives: compVar.displayAlternatives
    }));

    getSelectedParams();

  }

  //**********************************************************/
  const getSelectedParams = async () => {

    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        fromCities_id: compVar.fromCities_id,
        toCities_id: compVar.toCities_id,
        wef: compVar.wef,
        wefTime: compVar.wefTime,
        lockTime: compVar.lockTime,
        displayAlternatives: compVar.displayAlternatives,
      });
    }

  }

  //**********************************************************/
  const onPanelLoad = async () => {

    if (props.onPanelLoad !== undefined) {
      await props.onPanelLoad ({
      });
    }

  }


  //**********************************************************/
  const getEarliestTime = async () => {

    let wefTime = compVar.wefTime;
    let wef = convertDMY_MDY(compVar.wef);
  
    let sql = `EXEC p_RouteFinder_EarliestPrefTrain 
      ${compVar.fromCities_id.toString()} , 
      ${compVar.toCities_id.toString()} , 
      '${wef}'`;
  
    let spData = {sql: sql, x_uid: _g_users_id, x_module: 'Route Finder'};
    const timeQry = await dbExecuteSp(spData);
  
    if (timeQry.length > 0 && timeQry[0].EarliestTime !== null) {
      if (timeQry[0].EarliestTime < wefTime) {
        wefTime = timeQry[0].EarliestTime;
      }
    }
  
    compVar.wefTime = wefTime;
    
  }

  //**********************************************************/
  const alternativeRoute = () => {
    compVar.displayAlternatives = !compVar.displayAlternatives;
    if (props.onChangeAlternativeOption !== undefined) {
      props.onChangeAlternativeOption({displayAlternatives: compVar.displayAlternatives});
    }
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

    return (
      <div className="routefinder-panelparams-container">

        <div className="routefinder-panelparams-box-space" style={{display: 'flex', alignItems: 'center'}}>

          <div style={{display: 'flex', flex: 5, paddingLeft: 5}}>            

            <div className="routefinder-panelparams-section-container">

              <div className="routefinder-panelparams-city-container" style={{flex: 1.8}}>
                {cityParamsJsx(1)}
              </div>
              <div className="routefinder-panelparams-city-container" style={{flex: 1.8}}>
                {cityParamsJsx(2)}
              </div>
              <div className="routefinder-panelparams-refresh-button" style={{flex: 1.2}}>
                <Button
                  width={100}
                  text="Get Route"
                  type="success"
                  stylingMode="contained"
                  onClick={refreshRouteFinderData}
                />
              </div>

            </div>
          </div>

          <div style={{display: 'flex', flex: 4}}>            
            <div className="routefinder-panelparams-section-container">

              <div className="routefinder-panelparams-subsection-container" style={{flex: 3}}>
                {dateParamsJsx(1)}
              </div>
              <div className="routefinder-panelparams-subsection-container" style={{flex: 2}}>
                {dateParamsJsx(2)}
                <div style={{display: 'flex', alignItems: 'center'/*, backgroundColor: lockColor*/}}>
                  {buttonParamsJsx(1)}
                </div>
              </div>
              <div  className="routefinder-panelparams-subsection-container" style={{flex: 1}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  {buttonParamsJsx(2)}
                </div>
              </div>
            </div>
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

export default RouteFinderParams;
