import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import {setFocusedRow, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import { convertDMY_MDY } from '../../../../common/CommonTransactionFunctions';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import List from 'devextreme-react/list';

import './PrestoCitySightseeingList.css'
import '../../../../common/MasterGrid.css'

let compVar = {};

function PrestoCitySightseeingList (props) {

  const [dataFetched, setDataFetched] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], keyField: '',
      tariffs: null,
      listHeight: 450
    }   
        
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);  

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    try {
      const query = `EXEC [p_GetOverviewSightseeing] ${props.cities_id.toString()}`;
      compVar.mainData = await dbGetRecordRaw({query: query});

      // get tariffs for Guide, Misc, ...
      await getServiceRates();
                
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const getServiceRates = async() => {

    // Add new property for rates (Guide Cost, Misc Cost, ...)
    compVar.mainData = compVar.mainData.map(rec => ({ ...rec, tariffs: [] }));

    for (const rec of compVar.mainData) {

      const sql = "EXEC p_GetSightSeeingRates " + rec.addressbook_id.toString() + ", " + 
        rec.services_id.toString() + ",'" + convertDMY_MDY(props.serviceDate) + "', " + 
        "2, 0, 0, 0, 0";
      const spData = {sql: sql};
      const tariffs = await dbExecuteSp(spData);  

      for (const tariffRec of tariffs) {
        const tariffObj = {
          costType: tariffRec.CostType,
          cost: tariffRec.Cost
        }
        rec.tariffs.push(tariffObj);
      }

    }
      
  }

  //**********************************************************/
  const closePopover = async () => {    

    if (props.getSelectedService !== undefined) {
      await props.getSelectedService({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const tariffInfo = (rec) => {

    let tariff = rec.cost;
    let tariffStr = '';
    if (tariff !== null && tariff !== 0) {
      tariffStr = tariff.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  
      tariffStr = tariffStr.slice(0, -3);             
    } 

    const color = (rec.defaultRoom) ? 'blue' : null;

    return (
      <React.Fragment>

        <div style={{display: 'flex', flexDirection: 'row', width: '100%', fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center', fontSize: 16, color: color}}>
            {rec.costType} 
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', fontSize: 16, color: color}}>
            {tariffStr} 
          </div>
        </div>
      </React.Fragment>
    );    
  }

  //**********************************************************/
  const sightseeingInfo = (rec) => {

    compVar.tariffs = rec.tariffs;

    const duration = 'Duration: ' + ((rec.duration !== null) ? rec.duration : '');
    const timings = 'Timings: ' + ((rec.timings !== null) ? rec.timings : '');
    const operatingDays = 'Operates On: ' + ((rec.operatingDays !== null) ? rec.operatingDays : '');

    let requires = '';
    requires = (rec.guide) ? 'Guide' : '';
    requires += (requires.length > 0 && rec.transportReqd) ? ', ' : '';
    requires += (rec.transportReqd) ? 'Transport' : '';

    requires = (requires.length > 0) ? 'Requires: ' + requires : '';

    return (
      <React.Fragment>

        <div style={{display: 'flex', flexDirection: 'column', width: '100%', fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>

          <div style={{height: 20, justifyContent: 'center', alignItems: 'flex-start', fontSize: 16, fontWeight: 700}}>
            {rec.description} 
          </div>

          <div style={{display: 'flex', flexDirection: 'row', width: '100%', fontSize: 18, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 0, paddingTop: 5}}>

            <div style={{flex: 1.4, display: 'flex', flexDirection: 'column'}}>

              <div style={{flex: 1, display: 'flex', alignItems: 'flex-start', fontSize: 16, color: 'blue'}}>
                {rec.organisation} 
              </div>

              <div style={{flex: 1, display: 'flex', minHeight: 20, alignItems: 'flex-start', fontSize: 16}}>
              </div>

              <div style={{flex: 1, display: 'flex', alignItems: 'flex-start', fontSize: 16}}>
                {duration} 
              </div>
              <div style={{flex: 1, display: 'flex', alignItems: 'flex-start', fontSize: 16}}>
                {timings} 
              </div>
              <div style={{flex: 1, display: 'flex', alignItems: 'flex-start', fontSize: 16}}>
                {operatingDays} 
              </div>

              <div style={{flex: 1, display: 'flex', minHeight: 20, alignItems: 'flex-start', fontSize: 16}}>
              </div>
              <div style={{flex: 1, display: 'flex', alignItems: 'flex-start', fontSize: 16}}>
                {requires} 
              </div>

            </div>

            <div style={{flex: 1}}>
              {listsJsx(1)}
            </div>

            <div style={{flex: 0.2}}>
            </div>

            <div style={{flex: 2, alignItems: 'flex-start', whiteSpace: 'normal', fontSize: 14}}>
              {rec.writeup} 
            </div>
          
          </div>

        </div>

      </React.Fragment>
    );    
  }

  //**********************************************************/
  const listsJsx = (index) => {

    const borders = ['1px solid #e6e6e6', null];
    const heights = [compVar.listHeight, null];
    const maxHeights = [compVar.listHeight, null];
    const dataSources = [compVar.mainData, compVar.tariffs];
    const keyExprs = ['services_id','costType'];
    const itemRenders = [sightseeingInfo, tariffInfo];
    const onItemClicks = [null,null];
    const allowDeletings = [false,false];
    const itemDeleteModes = [null,null];
    const itemDeletes = [null,null];
    const refs = [compVar.listRef,null];
    const searchExprs = [null,null];
    const searchEnableds = [null,null];
    const noDataTexts = [null,'No Guide/Misc Costing Entered for this period'];

    const border = borders[index];
    const height = heights[index];
    const maxHeight = maxHeights[index];
    const dataSource = dataSources[index];
    const keyExpr = keyExprs[index];
    const itemRender = itemRenders[index];
    const onItemClick = onItemClicks[index];
    const allowDeleting = allowDeletings[index];
    const itemDeleteMode = itemDeleteModes[index];
    const itemDelete = itemDeletes[index];
    const ref = refs[index];
    const searchExpr = searchExprs[index];
    const searchEnabled = searchEnableds[index];
    const noDataText = noDataTexts[index];

    return (

      <div className='presto-cb-list-inner-container' style={{border: border, height: height, maxHeight: maxHeight, background: 'rgb(230,242,255)'}}>
        <List              
          dataSource={dataSource}    
          keyExpr={keyExpr}
          itemRender={itemRender}           
          focusStateEnabled={false}
          onItemClick={onItemClick}
          allowItemDeleting={allowDeleting}
          itemDeleteMode={itemDeleteMode}        
          onItemDeleted={itemDelete}
          onItemReordered={null}
          searchExpr={searchExpr}
          searchEnabled={searchEnabled}              
          height={maxHeight}
          ref={ref}
          noDataText={noDataText}
        />
      </div>
  
    )

  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const open = (props.open === undefined) ? true : props.open;

    const maxHeight = 470;

    return (

      <Popup visible={open} height={600} width={1100} onHiding={closePopover}>

        <div style={{width: '100%', maxHeight: maxHeight+100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>

          {listsJsx(0)}

          <div className="search-grid-button-container" style={{width: '100%', paddingTop: 10}}>
            <div className="search-grid-single-button-container">
              <Button text="Close" type="default" onClick={closePopover}/>
            </div>
          </div>

        </div>

      </Popup>
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default PrestoCitySightseeingList;

