import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { dbGetRecordRaw } from '../../../../actions';
import {Popup} from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import { convert_DbDate_To_DMY, convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import { getCityName } from "../../../common/GetDescFromIds";
import RouteFinderParams from './RouteFinderParams';
import AlternativeRouteFinder from './AlternativeRouteFinder';
import List from 'devextreme-react/list';
import {additionalData, setGroupDuration, getOptionsJsx} from './CommonCode';

import '../../../common/MasterGrid.css'
import './RouteFinder.css'

let compVar = {};

function RouteFinder(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [panelDataFetched, setPanelDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_fromCities_id = useSelector(state => state.routeFinderParams.fromCities_id) || -1;
  let _g_toCities_id = useSelector(state => state.routeFinderParams.toCities_id) || -1;
  let _g_wef = useSelector(state => state.routeFinderParams.wef) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_wefTime = useSelector(state => state.routeFinderParams.wefTime) || '09:00';
  let _g_lockTime = useSelector(state => state.routeFinderParams.lockTime) || false;

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], uniqueOptionsData: [], optionsData: [],
      altData: [], selectedData: [],
      fromCities_id: _g_fromCities_id, fromCity: '',
      toCities_id: _g_toCities_id, toCity: '', 
      wef: _g_wef, wefTime: _g_wefTime, lockTime: _g_lockTime,      
      displayAlternatives: false, 
      displayPopup: (props.formType === 2) ? true : false,
      selectedOptionNo: 1, modePreference: 0,
      altSelectedOptionNo: 1,
      errorMsg: ''
    }   
        
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
  const filterData = async() => {
    try {

      const wef = convertDMY_MDY(compVar.wef) + ' ' + compVar.wefTime;
    
      const query = "EXEC [dbo].[p_RouteFinder_x] '" + wef + "'," +
        compVar.fromCities_id.toString() + ","  + 
        compVar.toCities_id.toString() + ","  + 
        "3, 1, null";
        
      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Route Finder'});
      compVar.mainData.forEach(rec => {
        rec.Departure = rec.Departure.replace('T', ' ').replace('Z', '');
        rec.Arrival = rec.Arrival.replace('T', ' ').replace('Z', '');
      })
  
      // Create additional fields for display purposes
      await additionalData(compVar);
  
      if (compVar.mainData.length > 0) {
        compVar.selectedOptionNo = compVar.mainData[0].OptionNo; 
        compVar.modePreference = compVar.mainData[0].ModePreference;  
      }
  
      const fromCityObj = await getCityName(compVar.fromCities_id);
      compVar.fromCity = fromCityObj.City;
  
      const toCityObj = await getCityName(compVar.toCities_id);
      compVar.toCity = toCityObj.City;

      await setGroupDuration(compVar);

      forceRender();
 
    } catch(err) {
      alert(err);
    }
  
    setDataFetched(true);
  }

  //**********************************************************/
  const getSelectedListItem = async (e) => {

    compVar.selectedOptionNo = e.itemData.optionNo; 
    compVar.modePreference = e.itemData.data[0].ModePreference;

    forceRender();

  }

  //**********************************************************/
  const closePopover = async () => {
    compVar.displayPopup = false;

    if (props.onClose !== undefined) {
      await props.onClose({open: false})
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
  const getSelectedParams = async (e) => {

    compVar.fromCities_id = e.fromCities_id;
    compVar.toCities_id = e.toCities_id;
    compVar.wef = e.wef;
    compVar.wefTime = e.wefTime;    

    setDataFetched(false);

    await filterData();
    
  }

  //**********************************************************/
  const getAlternativeData = async (e) => {
    compVar.altSelectedOptionNo = e.itemData.optionNo; 
    compVar.altData = e.itemData.data;
  }

  //**********************************************************/
  const getSelectedRoute = async (e) => {
    if (compVar.displayAlternatives) {
      compVar.selectedData = compVar.altData.filter(rec => rec.OptionNo === compVar.altSelectedOptionNo);
    } else {
      compVar.selectedData = compVar.mainData.filter(rec => rec.OptionNo === compVar.selectedOptionNo);
    }

    if (props.getSelectedRoute !== undefined) {
      setDataFetched(false);
      await props.getSelectedRoute({data: compVar.selectedData});
      setDataFetched(true);
    }

    closePopover();
  }

  //**********************************************************/
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const optionsJsx = (e) => {

    return getOptionsJsx (e, compVar, 1, null);

  }

  //**********************************************************/
  const buttonsJsx = () => {

    const buttonContainerStyle = {
      height: 60,
      width: 600,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    const sector = compVar.fromCity + ' / ' + compVar.toCity;

    /*=== Called from tickets in DTD ===*/
    if (props.formType === 2) {
      return (
        <>
          <div style={buttonContainerStyle}>
            <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
              <Button text="Close" type="default" onClick={closePopover}/>
            </div>
            <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
              <Button text={"Select"} disabled={false} type="success" onClick={getSelectedRoute}/>
            </div>
          </div>
          {props.numCities > 0 &&
            <div style={{...buttonContainerStyle, fontSize: 18, color: 'red', height: 20}}>
              By 'Selecting', you will override the current data in the sector {sector}
            </div>
          }
        </>
      )
  
    }
  
  }

  //**********************************************************/
  const onChangeAlternativeOption = (e) => {
    compVar.displayAlternatives = e.displayAlternatives;
    forceRender();
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    /*=== The load indicator is shown inside the block rather than outside ===*/
    /*=== If shown outside with return, the route finder params will be mounted ... ===*/
    /*=== ... each time and that will cause useEffect with [] to fire each time ... ===*/
    /*=== ... which is undesired ===*/

    return (
      <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>
        <RouteFinderParams
          getSelectedParams={getSelectedParams}          
          onPanelLoad={onPanelLoad}
          onChangeAlternativeOption={onChangeAlternativeOption}
        />
        
        {panelDataFetched && !dataFetched && 
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        }

        {panelDataFetched && dataFetched &&

          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div className="master-grid-content-box" style={{display: 'flex', flex: 1}}>
              <div>
                <List
                  dataSource={compVar.optionsData}    
                  keyExpr="optionNo"
                  displayExpr="optionNo"
                  focusStateEnabled={false}
                  itemRender={optionsJsx}           
                  onItemClick={getSelectedListItem}
                >
                </List>
              </div>
              {buttonsJsx()}
            </div>

            {compVar.displayAlternatives &&
              <div style={{display: 'flex', flex: 1}}>
                <AlternativeRouteFinder
                  fromCities_id={compVar.fromCities_id}
                  toCities_id={compVar.toCities_id}
                  wef={compVar.wef}
                  wefTime={compVar.wefTime}
                  modePreference={compVar.modePreference}
                  getAlternativeData={getAlternativeData}              
                  users_id={_g_users_id}
                >
                </AlternativeRouteFinder>
              </div>
            }
          </div>
        }


      </div>
    );

  }

  return (
    <>
      {props.formType === 2 && 
        <Popup visible={compVar.displayPopup} height={650} width={1200} onHiding={closePopover}>
          <ScrollView width='100%' height='100%' useNative={false}>
            {renderContent()}
          </ScrollView>
        </Popup>
      }
      {props.formType !== 2 && 
        renderContent()
      }
    </>
  )


};

export default RouteFinder;
