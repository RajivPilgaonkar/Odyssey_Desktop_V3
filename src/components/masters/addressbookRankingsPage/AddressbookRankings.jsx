import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { setParamValues } from '../../../actions';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import { getBusinessCities } from "../../common/GetOrgListing";
import {getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import DropDownGrid from "../../common/DropDownGrid";
import AddressbookServiceRankings from "./addressbookServiceRankings/AddressbookServiceRankings";

import '../../common/MasterGrid.css'
import './AddressbookRanking.css'

let compVar = {};

function AddressbookRakings() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_cities_id = useSelector(state => state.params.cities_id);
  _g_cities_id = _g_cities_id || -1;
  let _g_city = useSelector(state => state.params.city);
  _g_city = _g_city || '';

  const _g_location = useLocation();

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      cityLookup: [],
      cities_id: _g_cities_id, city: _g_city, 
      admLevel: 1,
      dbLookup: [       
      ]
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
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.cityLookup = await getBusinessCities();   
  
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

  //*********************************************************/
  const onCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.cities_id = e[0].cities_id;
      compVar.city = e[0].city;  

      // Save to redux store hrough params reducer
      dispatch(setParamValues({cities_id: compVar.cities_id, city: compVar.city}));

      forceRender();
    }
  }

  //**********************************************************/
  const createCityParams = () => {

    return (
      <>
        <DropDownGrid
          listArray={compVar.cityLookup}
          fieldList={['city']}
          valueExpr="cities_id"
          displayExpr="city"
          label="City"
          placeholder="Select a city..."
          getSelectedRecord={onCitySelect}
          showColumnHeaders={false}
          value={compVar.city}
          labelStyle={{width: 50}}
          dropDownStyle={{width: 60}}
        />
      </>
  
    );

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
      <>
        <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
            <div className="master-grid-params-container" style={{flex: 1}}></div>
            <div className="master-grid-params-container" style={{flex: 2, fontSize: 18, color: 'blue'}}>
              Hotel Rankings
            </div>
            <div className="master-grid-params-container" style={{flex: 1, justifyContent: 'flex-end'}}>
              {createCityParams()}
            </div>
          </div>

          <div className="rankings-parent-container">              
            <div className="rankings-child-container">              
              <AddressbookServiceRankings
                id={'7'}
                hotelCities_id={compVar.cities_id}
                addressbookServices_id={7}
                addressbookService={'Standard'}
              />
            </div>
            <div className="rankings-child-container">              
              <AddressbookServiceRankings
                id={'8'}
                hotelCities_id={compVar.cities_id}
                addressbookServices_id={8}
                addressbookService={'Comfortable'}
              />
            </div>
            <div className="rankings-child-container">              
              <AddressbookServiceRankings
                hotelCities_id={compVar.cities_id}
                addressbookServices_id={9}
                addressbookService={'Superior'}
              />
            </div>
            <div className="rankings-child-container">              
              <AddressbookServiceRankings
                hotelCities_id={compVar.cities_id}
                addressbookServices_id={10}
                addressbookService={'Top of the line'}
              />
            </div>
          </div>

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

export default AddressbookRakings;
