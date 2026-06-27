import React, { useState, useEffect } from 'react';
import { dbExecuteSp } from '../../../../../actions';
import {getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DetailedItinerary from "./DetailedItinerary";
import Places from "./Places";

import '../../../../common/MasterGrid.css'

let compVar = {};

function DetailedItineraryManager(props) {

  const [quoPrintDaysId, setQuoPrintDaysId] = useState(-1);  
  const [dataFetched, setDataFetched] = useState(true);  
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      errorMsg: '', 
    }   
        
    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }


  //**********************************************************/
  const onQuoPrintDaysChange = async (e) => {
    if (e.deleteAndRecreate !== undefined && e.deleteAndRecreate) {
      setDataFetched(false);        

      const sql = 'EXEC p_QuoInsertPrintItinerary ' + 
        props.quotations_id.toString() + ', 11';
      const spData = {sql: sql};
      await dbExecuteSp(spData);       

      setDataFetched(true);              
    }
    setQuoPrintDaysId(e.quoPrintDays_id);
    forceRender();
  }
    
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    //const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight;

    return (
      <>
        <div className="master-grid-container" style={{height: viewHeight-80}}>

          <div style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'center'}}>

            {!dataFetched &&
              <div className="master-grid-container" style={{height: viewHeight}}>
               <LoadIndicator id="large-indicator" height={60} width={60} />
              </div>
            }

            {dataFetched &&
              <>
                <div style={{display: 'flex', flex: 1}}>
                  <DetailedItinerary
                    quoPrint_id={props.quoPrint_id}
                    quotations_id={props.quotations_id}
                    onQuoPrintDaysChange={onQuoPrintDaysChange}
                  />
                </div>
                <div style={{display: 'flex', flex: 0.4}}>
                  <Places
                    quoPrintDays_id={quoPrintDaysId}
                  />
                </div>
              </>
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

export default DetailedItineraryManager;
