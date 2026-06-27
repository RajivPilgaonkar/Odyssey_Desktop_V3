import React, { useEffect, useState } from 'react';
import { dbGetRecordRaw } from '../../../../actions';
import { convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { getCityName } from "../../../common/GetDescFromIds";
import List from 'devextreme-react/list';
import {additionalData, setGroupDuration, getOptionsJsx} from './CommonCode';

import '../../../common/MasterGrid.css'
import './RouteFinder.css'

let compVar = {};

function AlternativeRouteFinder(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], uniqueOptionsData: [], optionsData: [],
      fromCities_id: props.fromCities_id, fromCity: '',
      toCities_id: props.toCities_id, toCity: '',  
      wef: props.wef, wefTime: props.wefTime,
      modePreference: props.modePreference,
      displayAlternatives: false,
      selectedOptionNo: 1, 
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
  // This should execute every time the props change
  useEffect (() => {
    // Object for component variables
    compVar = {
      fromCities_id: props.fromCities_id, 
      toCities_id: props.toCities_id,  
      wef: props.wef, wefTime: props.wefTime,
      modePreference: props.modePreference
    }   
        
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, [props.fromCities_id, props.toCities_id, props.wef, props.wefTime,
      props.modePreference]);
  

  //**********************************************************/
  const filterData = async() => {
    try {
      setDataFetched(false);

      const wef = convertDMY_MDY(compVar.wef) + ' ' + compVar.wefTime;
    
      const query = "EXEC [dbo].[p_RouteFinder_x] '" + wef + "'," +
        compVar.fromCities_id.toString() + ","  + 
        compVar.toCities_id.toString() + ","  + 
        "3, 2, " + compVar.modePreference.toString();
        
      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: props.users_id, x_module: 'Alt Route Finder'});
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

    if (props.getAlternativeData !== null) {
      props.getAlternativeData(e);
    }

    forceRender();

  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const optionsJsx = (e, index) => {

    return getOptionsJsx (e, compVar, 2, index);

  }


  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    let containerHeight = heights.containerHeight;
    // Reduce by height of params container
    containerHeight = containerHeight - 50;

    // Show spinner if data not yet fetched
    if (!dataFetched) {
      return (
        <>
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        </>
      )
    }

    return (
      <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>
        <List
          dataSource={compVar.optionsData}    
          keyExpr="optionNo"
          displayExpr="optionNo"
          focusStateEnabled={false}
          itemRender={optionsJsx}           
          onItemClick={getSelectedListItem}
          height={containerHeight}
        >
        </List>
      </div>
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default AlternativeRouteFinder;
