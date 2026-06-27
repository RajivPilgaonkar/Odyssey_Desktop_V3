import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import ScrollView from 'devextreme-react/scroll-view';
import {setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import TextBox from 'devextreme-react/text-box';

import '../../../common/MasterGrid.css'
import './PrestoCost.css';

let compVar = {};

function PrestoExtraMargin(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
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
      mainData: [],
      errorMsg: '',
      admLevel: 1, extraMargin: 0, marginChanged: false, 
      boxWidth: 630, boxHeight: 150,
      saveRecord: false, 
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

    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    try {

      const query = "SELECT ExtraMargin " + 
        " FROM Quotations " +
        "WHERE Quotations_id = " + props.quotations_id.toString();

      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Presto Cost Extra Margin'});
      compVar.extraMargin = 0;
      if (compVar.mainData.length > 0 && compVar.mainData[0].ExtraMargin !== null) {
        compVar.extraMargin = compVar.mainData[0].ExtraMargin;
      }

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }
  
  //**********************************************************/
  const closePopover = async () => {
    const refresh = (compVar.saveRecord) ? true : false;

    if (props.closeExtraMarginForm !== undefined) {
      await props.closeExtraMarginForm({open: false, refresh: refresh});
    }    

    forceRender();

  };  
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const onMarginChange = async (e) => {    

    if (!isNaN(e.value)) {
      compVar.extraMargin = e.value;
      compVar.marginChanged = true;
      compVar.errorMsg = '';
    } else {
      compVar.extraMargin = '0';
      compVar.marginChanged = false;
      compVar.errorMsg = 'Invalid Margin Entered ....';
    }

    forceRender();

  }

  //**********************************************************/
  const saveMargin = async () => {

    if (compVar.marginChanged) {
  
      const sql = "UPDATE Quotations " + 
        "SET ExtraMargin = " + compVar.extraMargin.toString() + " " +
        "WHERE Quotations_id = " + props.quotations_id + " ";

      const spData = {sql: sql};
      await dbExecuteSp(spData);

      compVar.saveRecord = true;

    }

    await closePopover();

  };  

  //**********************************************************/
  const textJsx = (index) => {

    const labels = ['Extra Margin(%) for the Entire Tour'];
    const widths = [150];
    const valueChanges = [onMarginChange];
    const enterClicks = [null];
    const maxLengths = [5];
    const heights = [35];
    const values = [compVar.extraMargin];
    const styles = [{fontSize: 18}];
  
    const label = labels[index];
    const width = widths[index];
    const valueChange = valueChanges[index];
    const enterClick = enterClicks[index];
    const maxLength = maxLengths[index];
    const height = heights[index];
    const value = values[index];
    const style = styles[index];
      
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16, paddingRight: 5}}>
          {label}
        </div>
        <div style={{flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
          <TextBox 
            value={value}
            width={width}
            onValueChanged={valueChange}
            onEnterKey={enterClick}
            maxLength={maxLength}
            height={height}
            style={style}
          />
        </div>
      </div>
    );
  
  }
    
  //**********************************************************/
  const buttonsJsx = () => {

    const disabled = !(compVar.marginChanged);

    /*=== Called from tickets in DTD ===*/
    return (
      <>
        <div style={{height: 60, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', flex: 1}}>
          </div>

          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Cancel" type="default" onClick={closePopover}/>
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text={"Save"} disabled={disabled} type="success" onClick={saveMargin}/>
          </div>

          <div style={{display: 'flex', flex: 1}}>
          </div>
        </div>
        </>
      )
    
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-100;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }
    
    const open = (props.open === undefined) ? true : props.open;

    return (
      <>

        <Popup visible={open} height={350} width={900} onHiding={closePopover}>

          <ScrollView width='100%' height='100%' useNative={false}>

            <div style={{display: 'flex', flexDirection: 'column'}}>

              <div className="presto-extra-margin-text">
                {`Requests for Tour: ${props.tourCode}`}  &nbsp; &nbsp; &nbsp; {`Departure: ${props.tourDate}` }
              </div>

              <div style={{width: '100%', height: compVar.boxHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, background: '#f5f5f0', border: '0.5px solid rgba(0, 0, 0, .5)', borderRadius: 15 }}>
                <div style={{height: compVar.boxHeight, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>

                  <div style={{width: '80%', display: 'flex', flexDirection: 'column'}}>
                    <div className="presto-extra-margin-text" style={{flex: 5, fontSize: 16, color: '#000000'}}>
                      {textJsx(0)}
                    </div>
                    <div className="presto-extra-margin-text" style={{flex: 1, fontSize: 16, color: '#000000'}}>
                      {compVar.errorMsg}
                    </div>
                  </div>

                </div>
              </div>

              {buttonsJsx()}

            </div>

          </ScrollView>

        </Popup>

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default PrestoExtraMargin;
