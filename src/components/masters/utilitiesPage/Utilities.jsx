import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbExecuteSp } from '../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { getViewContainerHeights} from "../../common/MasterGridHelpers";
import {Button} from 'devextreme-react/button';
import {getAdmLevelLocation} from "../../common/GetDescFromIds";

import '../../common/MasterGrid.css'

let compVar = {};

function Utilities() {

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
      errorMsg: '', displayLoadIndicator: false,
      admLevel: 1
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
  }

  //**********************************************************/
  const filterData = async() => {
  }
      
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const reindexTables = async () => {
    compVar.displayLoadIndicator = true;
    forceRender();
    const spData = {sql: `EXEC [p_ReindexDbcc]`, x_uid: _g_users_id, x_module: 'Utilities'}  
    try {
      await dbExecuteSp(spData);  
    } catch (err) {
      alert(err);
    }
    compVar.displayLoadIndicator = false;
    forceRender();
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const disabled = (compVar.admLevel < 3) ? true : false;

    // Show spinner if data not yet fetched
    if (compVar.displayLoadIndicator) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'row'}}>
          
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 30}}>
              The below processes might take several minutes to execute
            </div>
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 30}}>
              <Button text={"Reindex Tables"} disabled={disabled} type="success" onClick={reindexTables}/>
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

export default Utilities;
