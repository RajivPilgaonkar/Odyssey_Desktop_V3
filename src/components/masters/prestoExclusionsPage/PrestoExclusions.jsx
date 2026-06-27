import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {getViewContainerHeights} from "../../common/MasterGridHelpers";
import Exclusions from "./exclusionsPage/Exclusions";
import ExclusionDetails from "./exclusionDetailsPage/ExclusionDetails";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";

import '../../common/MasterGrid.css'

let compVar = {};

function PrestoExclusions() {

  const [exclusionsId, setExclusionsId] = useState(-1);  
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
      errorMsg: '', 
      admLevel: 1,
    }   
        
    fetchInitialData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
  
  //**********************************************************/
  const fetchInitialData = async() => {
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);
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
  const onExclusionChange = (e) => {
    setExclusionsId(e.exclusions_id);
  }
  
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
            <div style={{flex: 1, display: 'flex'}}>
              <Exclusions
                onExclusionChange={onExclusionChange}
                admLevel={compVar.admLevel}
              />
            </div>
            {
            <div style={{flex: 3, display: 'flex'}}>
              <ExclusionDetails
                exclusionsId={exclusionsId}
                admLevel={compVar.admLevel}
              />              
            </div>
            }
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

export default PrestoExclusions;
