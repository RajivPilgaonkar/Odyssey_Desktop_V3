import React, { useEffect, useState } from 'react';
import {setFocusedRow, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import { convertDMY_MDY } from '../../../../common/CommonTransactionFunctions';
import { dbGetRecordRaw } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import List from 'devextreme-react/list';

import './PrestoCitySightseeingList.css'
import '../../../../common/MasterGrid.css'

let compVar = {};

function PrestoSightseeingDisplayCost (props) {

  const [dataFetched, setDataFetched] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], keyField: '',
      listHeight: 180
    }   
        
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);  

  //**********************************************************/
  // This should execute everytime props change
  useEffect (() => {
      
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, [props.addressbook_id, props.services_id, props.serviceDate, props.transport, props.vehicles_id, props.numVehicles]);

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const transport = (props.transport ? 1 : 0);
    const ac = (props.transport ? 1 : 0);
    const vehicles_id = (props.vehicles_id !== null ? props.vehicles_id : 0);
    const numVehicles = (props.numVehicles !== null ? props.numVehicles : 0);

    try {

      const query = "EXEC p_GetSightSeeingRates " + props.addressbook_id.toString() + ", " + 
        props.services_id.toString() + ",'" + convertDMY_MDY(props.serviceDate) + "', " + 
        "2, " + transport.toString() + "," + ac.toString() + "," + 
        vehicles_id.toString() + "," + numVehicles.toString();

      compVar.mainData = await dbGetRecordRaw({query: query});
                
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const tariffInfo = (rec) => {

    let tariff = rec.Cost;
    let tariffStr = '';
    if (tariff !== null && tariff !== 0) {
      tariffStr = tariff.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  
      tariffStr = tariffStr.slice(0, -3);             
    } 

    return (
      <React.Fragment>

        <div style={{display: 'flex', flexDirection: 'row', width: '100%', fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center', fontSize: 16}}>
            {rec.CostType} 
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', fontSize: 16}}>
            {tariffStr} 
          </div>
        </div>
      </React.Fragment>
    );    
  }

  //**********************************************************/
  const listsJsx = (index) => {

    const listHeight = compVar.mainData.length * 45;

    const borders = ['1px solid #e6e6e6'];
    const heights = [listHeight];
    const maxHeights = [compVar.listHeight];
    const dataSources = [compVar.mainData];
    const keyExprs = ['c_id'];
    const itemRenders = [tariffInfo];
    const onItemClicks = [null];
    const allowDeletings = [false];
    const itemDeleteModes = [null];
    const itemDeletes = [null];
    const refs = [null];
    const searchExprs = [null];
    const searchEnableds = [null];
    const noDataTexts = [null];

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

      <div className='presto-ss-list-inner-container' style={{border: border, maxHeight: maxHeight, /*maxHeight: maxHeight,*/ background: 'rgb(230,242,255)'}}>
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
          height={height}
          ref={ref}
          noDataText={noDataText}
        />
        <div style={{width: '100%', height: 10, paddingTop: 10}}></div>
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

    return (
        <div style={{width: '25%', height: compVar.listHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
          {listsJsx(0)}
        </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}

export default PrestoSightseeingDisplayCost;
