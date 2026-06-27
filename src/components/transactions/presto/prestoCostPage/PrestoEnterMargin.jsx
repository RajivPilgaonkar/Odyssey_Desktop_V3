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
import TextArea from 'devextreme-react/text-area';

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
      admLevel: 1, 
      quoTickets_id: -1,
      margin: '', marginChanged: false, 
      cost: '', costPerPax: 0, costPerPaxChanged: false,
      quoString: '', quoStringChanged: false,
      boxWidth: 630, boxHeight: 300,
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

      const query = "SELECT qt.CostPerPax, qt.QuoTickets_id, ql.Margin, ql.QuoString " + 
        "FROM QuoLines ql " +
        "LEFT JOIN QuoTickets qt ON ql.QuoTickets_id = qt.QuoTickets_id " +
        "WHERE ql.QuoLines_id = " + props.quoLines_id.toString();
  
      const costQry = await dbGetRecordRaw({query: query });

      if (costQry.length > 0) {
        if (costQry[0].CostPerPax !== null) {
          compVar.costPerPax = costQry[0].CostPerPax;
          compVar.cost = compVar.costPerPax.toString();
        }
        if (costQry[0].Margin !== null) {
          compVar.margin = costQry[0].Margin.toString();
        }
        compVar.quoTickets_id = costQry[0].QuoTickets_id;
        if (costQry[0].QuoString !== null) {
          compVar.quoString = costQry[0].QuoString;
        }
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

    if (props.closeEnterMarginForm !== undefined) {
      await props.closeEnterMarginForm({open: false, refresh: refresh});
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
  const onCostPerPaxChange = async (e) => {    

    if (!isNaN(e.value)) {
      compVar.cost = e.value;
      compVar.costPerPax = parseFloat(e.value);  
      compVar.costPerPaxChanged = true;
      compVar.errorMsg = '';
    } else {
      compVar.cost = '0';
      compVar.costPerPax = '0';
      compVar.costPerPaxChanged = false;
      compVar.errorMsg = 'Invalid Cost Entered ....';
    }

    forceRender();

  }

  //**********************************************************/
  const onMarginChange = async (e) => {    

    if (!isNaN(e.value)) {
      compVar.margin = e.value;
      compVar.marginChanged = true;
      compVar.errorMsg = '';
    } else {
      compVar.margin = '0';
      compVar.marginChanged = false;
      compVar.errorMsg = 'Invalid Margin Entered ....';
    }

    forceRender();

  }

  //**********************************************************/
  const onQuoStringChange = async (e) => {    
    compVar.quoString = e.value;
    compVar.quoStringChanged = true;

    forceRender();

  }

  //**********************************************************/
  const saveData = async () => {

    let spData = {};

    // Cost Per Pax
    if (compVar.costPerPaxChanged && props.trsType === 1) {
      spData = {sql: "EXEC p_QuoUpdateCostPerPaxTickets " + 
        compVar.quoTickets_id.toString() + ", " +
        compVar.costPerPax.toString()};

      await dbExecuteSp(spData);  
      compVar.saveRecord = true;
    }

    // Margin
    if (compVar.marginChanged && compVar.margin.trim().length > 0) {
      spData = {sql: "EXEC p_QuoUpdateMargin " + 
        props.quoLines_id.toString() + ", " +
        compVar.margin};       

      await dbExecuteSp(spData);
      compVar.saveRecord = true;
    }

    // Quo String
    if (compVar.quoStringChanged && compVar.quoString.trim().length > 0) {
      spData = {sql: "UPDATE QuoLines SET QuoString = '" +     
        compVar.quoString + "' " +
        " WHERE QuoLines_id = " + props.quoLines_id.toString()}

      await dbExecuteSp(spData);
      compVar.saveRecord = true;
    }

    await closePopover();

  };  

  //**********************************************************/
  const textAreaJsx = (index) => {

    const labels = ['Service'];
    const values = [compVar.quoString];
    const widths = [480]
    const heights = [150]
    const styles = [{fontSize: 18}]
    const onValuesChanged = [onQuoStringChange];
    const maxLengths = [200];

    const label = labels[index];
    const value = values[index];
    const width = widths[index];
    const height = heights[index];
    const style = styles[index];
    const onValueChanged = onValuesChanged[index];
    const maxLength = maxLengths[index];
    
    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16, paddingRight: 5}}>
            {label}
          </div>
          <div style={{flex: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
            <TextArea 
              value={value}
              width={width}
              height={height}
              style={style}
              onValueChanged={onValueChanged}
              maxLength={maxLength}
            />
          </div>
        </div>
      </>
    )

  }

  //**********************************************************/
  const textJsx = (index) => {

    const labels = ['Margin(%)','Cost Per Pax (Without GST)'];
    const widths = [150, 150];
    const valueChanges = [onMarginChange, onCostPerPaxChange];
    const enterClicks = [null, null];
    const maxLengths = [5, 10];
    const heights = [35, 35];
    const values = [compVar.margin, compVar.cost];
    const styles = [{fontSize: 18}, {fontSize: 18}];
  
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
        <div style={{flex: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
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

    const disabled = !(compVar.marginChanged || compVar.costPerPaxChanged ||
      compVar.quoStringChanged);

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
            <Button text={"Update"} disabled={disabled} type="success" onClick={saveData}/>
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

        <Popup visible={open} height={600} width={900} onHiding={closePopover}>

          <ScrollView width='100%' height='100%' useNative={false}>

            <div style={{display: 'flex', flexDirection: 'column'}}>

              <div className="presto-extra-margin-text">
                {props.description}
              </div>

              <div style={{width: '100%', height: compVar.boxHeight, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, background: '#f5f5f0', border: '0.5px solid rgba(0, 0, 0, .5)', borderRadius: 15 }}>
                <div style={{height: compVar.boxHeight, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>

                  <div style={{width: '80%', display: 'flex', flexDirection: 'column'}}>
                    {props.trsType === 1 &&
                      <div className="presto-extra-margin-text" style={{flex: 5, fontSize: 16, color: '#000000'}}>
                        {textJsx(1)}
                      </div>
                    }
                    <div className="presto-extra-margin-text" style={{flex: 5, fontSize: 16, color: '#000000', paddingTop: 10}}>
                      {textJsx(0)}
                    </div>
                    <div className="presto-extra-margin-text" style={{flex: 5, fontSize: 16, color: '#000000', paddingTop: 10}}>
                      {textAreaJsx(0)}
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
