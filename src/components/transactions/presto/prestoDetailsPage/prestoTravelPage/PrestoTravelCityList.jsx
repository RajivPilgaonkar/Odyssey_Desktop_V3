import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import {setFocusedRow, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import { convert_DbDate_To_DMY, convert_DbDate_To_MDY, convert_DbDate_To_HHmm } from '../../../../common/CommonTransactionFunctions';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import List from 'devextreme-react/list';

import './PrestoCityTravelList.css'
import '../../../../common/MasterGrid.css'

const HEADER_FONT_COLOR = '#454545';
const GREY_BACKGROUND = '#f5f5f0';

let compVar = {};

function PrestoCityHotelList (props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], keyField: '',
      isReportReleaseModified: false,
      carReportDate: null, carReleaseDate: null,
      activeKey: null,
      listHeight: 400,
      focusedRowKey: -1,
      columnsArr: 
        [
          {label: 'Date', field: 'activityDate', flex: 1, justifyContent: 'flex-start', alignItems: 'center', format: 'DD/MM/YYYY'},
          {label: 'City', field: 'city', flex: 1, justifyContent: 'flex-start', alignItems: 'center', format: ''},
          {label: 'Timing', field: 'timing', flex: 2.5, justifyContent: 'flex-start', alignItems: 'center', format: ''},
          {label: 'Report', field: 'carReportDate', flex: 0.5, justifyContent: 'flex-start', alignItems: 'center', format: 'HH:mm'},
          {label: 'Release', field: 'carReleaseDate', flex: 0.5, justifyContent: 'flex-start', alignItems: 'center', format: 'HH:mm'},
        ]    
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

      const sql = "EXEC [dbo].[p_CreateCityDatewiseList] " + 
        props.quotations_id.toString() + "," +
        props.quoTickets_id.toString();
      const spData = {sql: sql};
      compVar.mainData = await dbExecuteSp(spData);  

      // This has to be done, otherwise it would take the GMT time
      compVar.mainData = compVar.mainData.map(rec => ({...rec,
        activityDate: rec.activityDate.replace('T', ' ').replace('Z', ''),
        carReportDate: (rec.carReportDate !== null) ? rec.carReportDate.replace('T', ' ').replace('Z', '') : null,
        carReleaseDate: (rec.carReleaseDate !== null) ? rec.carReleaseDate.replace('T', ' ').replace('Z', '') : null
      }));
                
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const closePopover = async () => {    

    if (props.getSelectedReportRelease !== undefined) {
      await props.getSelectedReportRelease({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const setCarReportRelease = async () => {    

    if (props.getSelectedReportRelease !== undefined) {
      await props.getSelectedReportRelease({open: false, refresh: true, 
        carReportDate: compVar.carReportDate, carReleaseDate: compVar.carReleaseDate});
    }    

  }

  //**********************************************************/
  const markCarReport = async () => { 

    if (compVar.activeKey === null) {return};
    
    const idx = compVar.mainData.findIndex(rec => rec.key === compVar.activeKey);

    if (idx !== -1) {
      compVar.isReportReleaseModified = true;
      const carReportTime = await getCarReportTime(compVar.mainData[idx]);
      compVar.carReportDate = new Date(convert_DbDate_To_MDY(compVar.mainData[idx].activityDate,1) + ' ' + carReportTime + ' UTC').toISOString().replace('T', ' ').replace('Z', '');            
    }

    forceRender();

  };   

  //**********************************************************/
  const getCarReportTime = async (rec) => { 
    let reportTime = '09:00';
    let idx = -1;

    if (rec.quoCities_id !== undefined && rec.quoCities_id !== null) {
      let query = "SELECT QuoTickets_id, Tickets_id, ETD, ETA " + 
        " FROM QuoTickets " +
        " WHERE QuoCities_id = " + rec.quoCities_id.toString() + " " +
        " ORDER BY ETA";
      let ticketData = await dbGetRecordRaw({query: query});

      // This has to be done, otherwise it would take the GMT time
      ticketData = ticketData.map(rec => ({...rec,
        ETD: rec.ETD.replace('T', ' ').replace('Z', ''),
        ETA: rec.ETA.replace('T', ' ').replace('Z', ''),
      }));

      if (ticketData.length > 0) {
        // look for a car
        idx = ticketData.findIndex(rec => rec.Tickets_id === 5);
        // if found, 1st car ETD
        if (idx !== -1) {
          reportTime = convert_DbDate_To_HHmm(ticketData[idx].ETD,1);

        // Else last travel ETA
        } else {
          reportTime = convert_DbDate_To_HHmm(ticketData[ticketData.length-1].ETA,1);
        }
      }

    }

    return reportTime;

  };   

  //**********************************************************/
  const markCarRelease = async () => { 

    if (compVar.activeKey === null) {return};
    
    const idx = compVar.mainData.findIndex(rec => rec.key === compVar.activeKey);
    if (idx !== -1) {
      compVar.isReportReleaseModified = true;
      const carReleaseTime = await getCarReleaseTime(compVar.mainData[idx]);
      compVar.carReleaseDate = new Date(convert_DbDate_To_MDY(compVar.mainData[idx].activityDate,1) + ' ' + carReleaseTime + ' UTC').toISOString().replace('T', ' ').replace('Z', '');
    }

    forceRender();

  };   

  //**********************************************************/
  const getCarReleaseTime = async (rec) => { 
    let releaseTime = '18:00';
    let idx = -1;

    if (rec.quoCities_id !== undefined && rec.quoCities_id !== null) {
      let query = "SELECT QuoTickets_id, Tickets_id, ETD, ETA " + 
        " FROM QuoTickets " +
        " WHERE QuoCities_id = " + rec.quoCities_id.toString() + " " +
        " ORDER BY ETA DESC";
      let ticketData = await dbGetRecordRaw({query: query});

      // This has to be done, otherwise it would take the GMT time
      ticketData = ticketData.map(rec => ({...rec,
        ETD: rec.ETD.replace('T', ' ').replace('Z', ''),
        ETA: rec.ETA.replace('T', ' ').replace('Z', ''),
      }));

      if (ticketData.length > 0) {
        // look for a car
        idx = ticketData.findIndex(rec => rec.Tickets_id === 5);
        // if found, 1st car ETD
        if (idx !== -1) {
          releaseTime = convert_DbDate_To_HHmm(ticketData[idx].ETA,1);
        // Else last travel ETA
        } else {
          releaseTime = convert_DbDate_To_HHmm(ticketData[ticketData.length-1].ETD,1);
        }
      }

    }

    return releaseTime;

  };   

  //**********************************************************/
  const onItemClick = async (e) => {
    if (e.itemData.key !== undefined) {
      compVar.activeKey = e.itemData.key;
      forceRender();
    }
  }

  //**********************************************************/
  const onFocusedRowChanged = (e) => {
    compVar.focusedRowKey = e.row.key;
    forceRender();
  }

  //**********************************************************/
  const ReportReleaseJsx = () => {

    let ReportStr = '';
    if (compVar.carReportDate !== null) {
      ReportStr += 'Report: ' + convert_DbDate_To_DMY(compVar.carReportDate,1) + ' ' + convert_DbDate_To_HHmm(compVar.carReportDate,1);
    }
    let ReleaseStr = '';
    if (compVar.carReleaseDate !== null) {
      ReleaseStr += 'Release: ' + convert_DbDate_To_DMY(compVar.carReleaseDate,1) + ' ' + convert_DbDate_To_HHmm(compVar.carReleaseDate,1);
    }

    return (
      <div style={{display: 'flex', width: '100%', height: 30, paddingLeft: 10, paddingRight: 10, paddingTop: 10}}>
        <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: '#009933', fontWeight: 600}}>{ReportStr}</div>
        <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: '#009933', fontWeight: 600}}>{ReleaseStr}</div>
        <div style={{display: 'flex', flex: 2}}></div>
      </div>
    )

  }

  //**********************************************************/
  const listHeaderJsx = () => {
    
    const jsxElements = compVar.columnsArr.map((item, index) => (
      <div key={index} style={{display: 'flex', flex: item.flex, fontFamily: 'Lato', fontSize: 16, fontWeight: 700, justifyContent: item.justifyContent, alignItems: item.alignItems, color: HEADER_FONT_COLOR}}>
        {item.label}
      </div>
    ));  

    const borderTop = '1px solid ' + HEADER_FONT_COLOR;
    const borderBottom = '1px solid ' + HEADER_FONT_COLOR;
    
    return (
      <div style={{display: 'flex', width: '100%', height: 40, borderTop: borderTop, borderBottom: borderBottom, background: GREY_BACKGROUND, paddingLeft: 10, paddingRight: 10}}>
        {jsxElements}
      </div>
    )

  }

  //**********************************************************/
  const listIemsJsx = (rec) => {

    let columnsArr = [...compVar.columnsArr];
    columnsArr = columnsArr.map(obj => ({ ...obj, color: '#000000', id: null }));

    const color = ((rec.carReportDate !== null || rec.carReleaseDate !== null) && (compVar.focusedRowKey === undefined || rec.key !== compVar.focusedRowKey)) ? 'blue' : null;
    
    const jsxElements = columnsArr.map((item, index) => (
      <div id={item.id} key={index} className='presto-ctl-list-item' style={{flex: item.flex, justifyContent: item.justifyContent, alignItems: item.alignItems, color: color}} >
        {item.format === 'DD/MM/YYYY' && rec[item.field] !== null &&
          convert_DbDate_To_DMY(rec[item.field],1)
        }
        {item.format === 'HH:mm' && rec[item.field] !== null &&
          convert_DbDate_To_HHmm(rec[item.field],1)
        }
        {item.format === '' &&
          rec[item.field]
        } 
      </div>

    )); 

    return (
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>
        {jsxElements}
      </div>
    );

  }


  //**********************************************************/
  const listsJsx = (index) => {

    let data = [];
    if (index === 0) {
      data = (compVar.mainData !== undefined) ? compVar.mainData : [];
    }

    const borders = [/*'1px solid #e6e6e6'*/ null];
    const heights = [compVar.listHeight];
    const maxHeights = [compVar.listHeight];
    const dataSources = [data];
    const keyExprs = ['key'];
    const itemRenders = [listIemsJsx];
    const onItemClicks = [onItemClick];
    const onFocusedRowChanges = [onFocusedRowChanged];

    const border = borders[index];
    const height = heights[index];
    const maxHeight = maxHeights[index];
    const dataSource = dataSources[index];
    const keyExpr = keyExprs[index];
    const itemRender = itemRenders[index];
    const itemClick = onItemClicks[index];
    const onFocusedRowChange = onFocusedRowChanges[index];

    return (

      <div className='presto-ctl-list-inner-container' style={{border: border, height: height, maxHeight: maxHeight, width: '100%', background: 'rgb(230,242,255)'}}>
        <List              
          dataSource={dataSource}    
          keyExpr={keyExpr}
          itemRender={itemRender}           
          focusStateEnabled={true}
          onItemClick={itemClick}
          height={maxHeight}
          onFocusedRowChanged={onFocusedRowChange}
          focusedRowKey={compVar.focusedRowKey}
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

          {listHeaderJsx(0)}
          {listsJsx(0)}

          {ReportReleaseJsx()}

          <div className="search-grid-button-container" style={{width: '100%', paddingTop: 10}}>
            <div className="search-grid-single-button-container">
              <Button text="Mark Report" type="normal" onClick={markCarReport}/>
            </div>
            <div className="search-grid-single-button-container">
              <Button text="Mark Release" type="normal" onClick={markCarRelease}/>
            </div>
            <div className="search-grid-single-button-container">
              {compVar.isReportReleaseModified &&
                <Button text="Save Report/Release" type="success" onClick={setCarReportRelease}/>
              }
            </div>
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


export default PrestoCityHotelList;

