import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import {setFocusedRow, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import { convertDMY_MDY } from '../../../../common/CommonTransactionFunctions';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';

import './PrestoCityHotelList.css'
import '../../../../common/MasterGrid.css'

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
      hotelCategory: '', uniqueCategories: [], tariffs: [],
      listHeight: 400
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
      const query = `EXEC [dbo].[p_GetOverviewHotelsAndRates] ${props.cities_id.toString()} `;
      compVar.mainData = await dbGetRecordRaw({query: query});
      // Tariffs added subsequently
      compVar.mainData = compVar.mainData.map(rec => ({ ...rec, tariffs: [] }));

      if (compVar.mainData.length > 0) {
        compVar.hotelCategory = compVar.mainData[0].category;
      }

      await getRoomRates();

      const uniqueCategories = [...new Set(compVar.mainData.map(item => item.category))]; 
      compVar.uniqueCategories = uniqueCategories.map(rec => ({category: rec}));
                
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

    if (props.getSelectedHotel !== undefined) {
      await props.getSelectedHotel({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const tariffInfo = (rec) => {

    let tariff = rec.costDouble;
    let tariffStr = '';
    if (tariff !== null && tariff !== 0) {
      tariffStr = tariff.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  
      tariffStr = tariffStr.slice(0, -3);             
    } 

    const color = (rec.defaultRoom) ? 'blue' : null;

    return (
      <React.Fragment>

        <div style={{display: 'flex', flexDirection: 'row', width: '100%', minHeight: 40, fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center', fontSize: 16, color: color}}>
            {rec.roomType} 
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', fontSize: 16, color: color}}>
            {tariffStr} 
          </div>
        </div>
      </React.Fragment>
    );    
  }

  //**********************************************************/
  const hotelInfo = (rec) => {

    compVar.tariffs = rec.tariffs;

    return (
      <React.Fragment>

        <div style={{display: 'flex', flexDirection: 'column', width: '100%', minHeight: 40, fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>
          <div style={{height: 20, justifyContent: 'center', alignItems: 'flex-start', fontSize: 16, fontWeight: 700}}>
            {rec.organisation} 
          </div>

          <div style={{display: 'flex', flexDirection: 'row', width: '100%', minHeight: 40, fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>

            <div style={{flex: 1, height: '100%', minHeight: 40, /*background: 'red',*/  overflowX: 'none'}}>
              <img 
                style={{width: 200, height: 125}}
                src={rec.imgPath}
                alt="Img Missing"
              />
            </div>

            <div style={{flex: 1.3, height: '100%', minHeight: 40, /*background: 'red',*/  overflowX: 'none'}}>
              {listsJsx(1)}
            </div>

            <div style={{flex: 0.2, height: '100%', minHeight: 40, /*background: 'red',*/  overflowX: 'none'}}>
            </div>

            <div style={{flex: 2, height: '100%', minHeight: 40/*, background: 'blue'*/, overflowX: 'none', overflowY: 'auto', alignItems: 'flex-start', whiteSpace: 'normal', fontSize: 14}}>
              {rec.hotelRemarks} 
            </div>
          
          </div>

        </div>

      </React.Fragment>
    );    
  }

  //**********************************************************/
  const getRoomRates = async() => {

    for (const rec of compVar.mainData) {

      const sql = `EXEC p_GetRoomRates ${rec.addressbook_id.toString()}, '${convertDMY_MDY(props.dateIn)}' `;
      const spData = {sql: sql};
      const tariffs = await dbExecuteSp(spData);  

      for (const tariffRec of tariffs) {
        const tariffObj = {
          roomType: tariffRec.RoomType,
          mealPlan: tariffRec.plan,
          costSingle: tariffRec.CostSingle,
          costDouble: tariffRec.CostDouble,
          costExtraBed: tariffRec.CostExtraBed,
          defaultRoom: tariffRec.DefaultRoom,
        }
        rec.tariffs.push(tariffObj);
      }

    }
      
  }

  //*********************************************************/
  const onHotelCategoryClick = async(e) => {
    compVar.hotelCategory = e.itemData.category;
    forceRender();
  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = [compVar.hotelCategory];
    const icons = [null]
    const widths = [150];
    const dropDownOptions = [{width: 200}];
    const items = [compVar.uniqueCategories];
    const onItemClicks = [onHotelCategoryClick];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={"category"}
        displayExpr={"category"}
        onItemClick={onItemClick}
      />
    )

  }


  //**********************************************************/
  const listsJsx = (index) => {

    let data = [];
    if (index === 0) {
      data = (compVar.mainData !== undefined) ? compVar.mainData.filter(rec => rec.category === compVar.hotelCategory) : [];
    }

    const borders = ['1px solid #e6e6e6', null];
    const heights = [compVar.listHeight, null];
    const maxHeights = [compVar.listHeight, null];
    const dataSources = [data, compVar.tariffs];
    const keyExprs = ['addressbook_id','roomType'];
    const itemRenders = [hotelInfo, tariffInfo];
    const onItemClicks = [null,null];
    const allowDeletings = [false,false];
    const itemDeleteModes = [null,null];
    const itemDeletes = [null,null];
    const refs = [compVar.listRef,null];
    const searchExprs = [null,null];
    const searchEnableds = [null,null];

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

          <div style={{width: '100%', height: 50, display: 'flex', justifyContent: 'center',alignItems: 'center', background: 'rgb(230,242,245)'}}>
            {dropDownButtonJsx(0)}
          </div>

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


export default PrestoCityHotelList;

