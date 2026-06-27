import React, { useEffect } from 'react';
import { Button } from 'devextreme-react/button';

import '../../../common/MasterGrid.css'
import TrainDetails from './trainDetailsPage/TrainDetails';
import TrainAvailClass from './trainAvailClassPage/TrainAvailClass';

function TrainContainer(props) {

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
        
    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
  

  //**********************************************************/
  const renderContent = () => {

    return (
      <>

        <div className="master-detail-top-panel">
          <div className="master-grid-params-container master-detail-top-panel-button-container">
            <Button
              width={35}
              height={35}
              type="normal"
              stylingMode="outlined"
              icon={"chevronleft"}
              onClick={props.onHiding}
            />
          </div>
          <div className="master-grid-params-container" style={{flex: 4, fontSize: 18}}>
            {'Train ' + props.trainNo + ' - ' + props.trainName}
          </div>
          <div className="master-grid-params-container">
          </div>
        </div>

        <div className="master-grid-content-box" style={{flexDirection: 'row'}}>
          <div style={{flex: 3, justifyContent: 'center', height: '100%'}}>
            <TrainDetails
              trains_id={props.trains_id}
              admLevel={props.admLevel}
            >
            </TrainDetails>
          </div>
          <div style={{flex: 1, justifyContent: 'center', height: '100%'}}>
            <TrainAvailClass
              trains_id={props.trains_id}
              admLevel={props.admLevel}
            >
            </TrainAvailClass>
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

export default TrainContainer;
