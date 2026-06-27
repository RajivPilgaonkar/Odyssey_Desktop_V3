import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { convert_DbDate_To_DMY } from "../../../common/CommonTransactionFunctions";
import { dbGetRecord, setParamValues } from '../../../../actions';
import {getAgentSubCatByCityListing, getBusinessCities} from "../../../common/GetOrgListing";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Switch from "react-switch";
import DropDownGrid from "../../../common/DropDownGrid";

import './CostAccommodation.css'

let compVar = {};

function CostAccommodationParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_cities_id = useSelector(state => state.params.accCities_id) || -1;
  let _g_hotels_id = useSelector(state => state.params.accHotels_id) || -1;
  let _g_wef = useSelector(state => state.params.accWef) || convert_DbDate_To_DMY (new Date(), 1);

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      cities_id: _g_cities_id, hotels_id: _g_hotels_id, wef: _g_wef,
      city: '', hotel: '', dateRange: '', 
      cityLookup: [], hotelLookup: [], wefLookup: [],
      citySwitchValue: false, hotelSwitchValue: false, wefSwitchValue: false,
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

  }, [compVar.cities_id, compVar.hotels_id, compVar.wef]);

  //**********************************************************/
  const fetchInitialData = async() => {

    await updateAllLookups([1,2,3]);

    setInitDataFetched(true);
  }

  //**********************************************************/
  const setCityLookup = async() => {
    if (compVar.citySwitchValue) {
      compVar.cityLookup = await getBusinessCities();
    } else {
      const tableStr = 'cities c WHERE c.cities_id IN ' + 
        '(SELECT a.cities_id FROM seasons s LEFT JOIN Addressbook a ON s.addressbook_id = a.addressbook_id )';      
      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: tableStr, x_uid: _g_users_id, x_module: 'Cost Accommodation'});   
    }
    setCity();
  }

  //**********************************************************/
  const setHotelLookup = async() => {
    const active = !compVar.hotelSwitchValue;
    compVar.hotelLookup = await getAgentSubCatByCityListing('4', active, compVar.cities_id);
    setHotel();
  }

  //**********************************************************/
  const setWefLookup = async() => {
    // all wef dates
    let whereStr = 'Addressbook_id = ' + compVar.hotels_id.toString();

    // only in the last 3 years
    if (!compVar.wefSwitchValue) {
      whereStr = whereStr + ' AND fromdate > DATEADD(year,-3,GETDATE()) '; 
    }    

    compVar.wefLookup = await dbGetRecord({fields: ["DISTINCT fromdate AS wef, CONVERT(varchar(10),fromdate,103) + '-' + CASE WHEN todate IS NOT NULL THEN CONVERT(varchar(10),todate,103) ELSE '' END AS DateRange"], orders: ['fromdate DESC'], table: 'seasons', where: whereStr});   
    compVar.wefLookup = compVar.wefLookup.map(rec => ({...rec, wef: rec.wef.replace('T', ' ').replace('Z', '')}) );    
    compVar.wefLookup = compVar.wefLookup.map(rec => ({...rec, wef: convert_DbDate_To_DMY(rec.wef,1)}) );    

    console.log('compVar.wefLookup',compVar.wefLookup);    

    const idx = compVar.wefLookup.findIndex(rec => rec.wef === compVar.wef);
    if (compVar.wefLookup.length > 0) {
      if (idx < 0) {
        compVar.wef = compVar.wefLookup[0].wef;
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
  const setCity = async() => {
    const idx = compVar.cityLookup.findIndex(rec => rec.cities_id === compVar.cities_id);
    if (idx < 0) {
      compVar.cities_id = -1;
      compVar.city = '';
    } else {
      compVar.city = compVar.cityLookup[idx].city;
    }
  }

  //**********************************************************/
  const setHotel = async() => {
    const idx = compVar.hotelLookup.findIndex(rec => rec.Addressbook_id === compVar.hotels_id);
    if (idx < 0) {
      compVar.hotels_id = -1;
      compVar.hotel = '';
    } else {
      compVar.hotel = compVar.hotelLookup[idx].OrgCity;
    }
  }

  //**********************************************************/
  const setWef = async() => {
    const idx = compVar.wefLookup.findIndex(rec => rec.wef === compVar.wef);
    if (idx < 0) {
      compVar.wef = '';
      compVar.dateRange = '';
    } else {
      compVar.dateRange = compVar.wefLookup[idx].DateRange;
    }
  }

  //**********************************************************/
  const onCityChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.cities_id = e[0].cities_id;
      compVar.city = e[0].city;      
      await updateAllLookups([2,3]);
      forceRender();
    }
  }

  //**********************************************************/
  const onHotelChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.hotels_id = e[0].Addressbook_id;
      compVar.hotel = e[0].OrgCity;
      await updateAllLookups([3]);
      forceRender();
    }
  }

  //**********************************************************/
  const onWefChanged = (e) => {
    if (e !== undefined && e !== null) {
console.log('e',e);      
      compVar.wef = e[0].wef;
      compVar.dateRange = e[0].DateRange;
      forceRender();
    }
  }

  //**********************************************************/
  const updateAllLookups = async (modeArr) => {
    if (modeArr.includes(1)) {
      await setCityLookup();
    }
    if (modeArr.includes(2)) {
      await setHotelLookup();
    }
    if (modeArr.includes(3)) {
      await setWefLookup();
    }
    forceRender();
  }

  //**********************************************************/
  const citySwitchValueChanged = async (e) => {    
    compVar.citySwitchValue = e;
    await updateAllLookups([1,2,3]);
    forceRender();
  }

  //**********************************************************/
  const hotelSwitchValueChanged = async (e) => {
    compVar.hotelSwitchValue = e;
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

console.log('in getSelectedParams', compVar.wef, compVar.dateRange);    
  
    // Save to redux store through params reducer
    dispatch(setParamValues({
      accCities_id: compVar.cities_id,
      accHotels_id: compVar.hotels_id,
      accWef: compVar.wef
    }));


    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        cities_id: compVar.cities_id,
        hotels_id: compVar.hotels_id,
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

    const lookups = [compVar.cityLookup, compVar.hotelLookup, compVar.wefLookup];
    const fieldLists = [['city'],['OrgCity'],['DateRange']];
    const valueExprs = ['cities_id', 'Addressbook_id','wef'];
    const displayExprs = ['city', 'OrgCity','DateRange'];
    const labels = ['City', 'Hotel', 'Wef'];
    const placeholders = ["Select a city...","Select a hotel...", ""];
    const getSelectedRecs = [onCityChanged, onHotelChanged, onWefChanged];
    const values = [compVar.city, compVar.hotel, compVar.dateRange];
    const componentWidths = [200,320,200];
    const dropDownWidths = [300,400,250];
    const labelStyles = [{width: 40, flex: 0.1}, {width: 80, flex: 0.5}, {width: 80, flex: 0.5}] 

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

    const onSwitchChanges = [citySwitchValueChanged, hotelSwitchValueChanged, wefSwitchValueChanged];
    const onCheckedValues = [compVar.citySwitchValue, compVar.hotelSwitchValue, compVar.wefSwitchValue];

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
        <div className="costacc-panelparams-container" style={{width: '100%'}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return (
      <div className="costacc-panelparams-container" style={{width: '100%'}}>

        <div className="costacc-panelparams-section-container">

          <div className="costacc-panelparams-city-container" style={{flex: 1}}>
            {dropDownParamsJsx(0)}
            {switchParamsJsx(0)}
          </div>
          <div className="costacc-panelparams-city-container" style={{flex: 1.3}}>
            {dropDownParamsJsx(1)}
            {switchParamsJsx(1)}
          </div>
          <div className="costacc-panelparams-city-container" style={{flex: 1}}>
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

export default CostAccommodationParams;
