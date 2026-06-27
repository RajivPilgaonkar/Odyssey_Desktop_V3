import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import {setFocusedRow, getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import { convertDMY_MDY, convert_DbDate_To_DMY } from '../../../../common/CommonTransactionFunctions';
import { dbGetRecordRaw } from '../../../../../actions';
import { TAX_ID_MISC } from '../../../../../actions/types';
import {getCentralTax} from "../../../../common/GetDescFromIds";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import List from 'devextreme-react/list';

import './PrestoCityTransferList.css'
import '../../../../common/MasterGrid.css'

const HEADER_FONT_COLOR = '#454545';
const GREY_BACKGROUND = '#f5f5f0';

let compVar = {};

function PrestoCityTransferList (props) {

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
      listHeight: 160,
      taxObj: {},    
      columnsArr: 
        [
          {label: 'Car', field: 'Vehicle', flex: 1, justifyContent: 'center', alignItems: 'center', format: '', type: 1, specialType: null},

          {label: 'Cost', field: 'CostAc', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 2, specialType: null},
          {label: 'Parking Fee', field: 'ParkingFee', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 2, specialType: null},
          {label: 'Road Tax', field: 'RoadTaxPerDay', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 2, specialType: null},
          {label: 'Sp. GST', field: 'SpecialGst', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 2, specialType: 'GST'},

          {label: 'Meet & Assist', field: 'MeetAndAssist', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 3, specialType: null},
          {label: 'Airport Entry', field: 'EntryAp', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 3, specialType: null},
          {label: 'Sp. GST', field: 'SpecialGst2', flex: 1, justifyContent: 'center', alignItems: 'center', format: '#,##0.00', type: 3, specialType: 'GST'},

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
      const query = `EXEC [p_DisplayTransferCarCosts] ${props.services_id.toString()}, '${convertDMY_MDY(props.serviceDate)}'`;
      compVar.mainData = await dbGetRecordRaw({query: query});

      compVar.taxObj = await getCentralTax(convert_DbDate_To_DMY(`'${props.serviceDate}'`), TAX_ID_MISC);    
                
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const closePopover = async () => {    

    if (props.getSelectedService !== undefined) {
      await props.getSelectedService({open: false, refresh: false});
    }    

  };  


  //**********************************************************/
  const listsJsx = (index) => {
    
    const listHeight = compVar.mainData.length * 45;

    const borders = ['1px solid #e6e6e6', '1px solid #e6e6e6'];
    const heights = [listHeight, listHeight];
    const maxHeights = [compVar.listHeight, compVar.listHeight];
    const dataSources = [compVar.mainData, compVar.mainData];
    const keyExprs = ['CostServicesTransport_id','CostServicesTransport_id'];
    const itemRenders = [listItems1Jsx, listItems2Jsx];
    const onItemClicks = [null,null];
    const allowDeletings = [false,false];
    const itemDeleteModes = [null,null];
    const itemDeletes = [null,null];
    const refs = [compVar.listRef,null];
    const searchExprs = [null,null];
    const searchEnableds = [null,null];
    const noDataTexts = [null,null];

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

      <div className='presto-trsf-list-inner-container' style={{border: border, /*height: height,*/ maxHeight: maxHeight, background: 'rgb(230,242,255)'}}>
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
      </div>
  
    )

  }

  //**********************************************************/
  const listHeaderJsx = (index) => {

    const columnsArr = (index === 0) ? compVar.columnsArr.filter(rec => rec.type === 1 || rec.type === 2) : compVar.columnsArr.filter(rec => rec.type === 1 || rec.type === 3);
    
    const jsxElements = columnsArr.map((item, index) => (
      <div key={index} style={{display: 'flex', flex: item.flex, fontFamily: 'Lato', fontSize: 16, fontWeight: 700, justifyContent: item.justifyContent, alignItems: item.alignItems, color: HEADER_FONT_COLOR}}>
        {item.label}
      </div>
    ));  

    const borderTop = '1px solid ' + HEADER_FONT_COLOR;
    const borderBottom = '1px solid ' + HEADER_FONT_COLOR;
    
    return (
      <div style={{display: 'flex', height: 40, width: '100%', borderTop: borderTop, borderBottom: borderBottom, background: GREY_BACKGROUND}}>
        {jsxElements}
      </div>
    )

  }

  //**********************************************************/
  const listItems1Jsx = (rec) => {

    const columnsArr = compVar.columnsArr.filter(elem => elem.type === 1 || elem.type === 2);
    
    const jsxElements = columnsArr.map((item, index) => (
      <div id={item.id} key={index} className='presto-trsf-list-item' style={{flex: item.flex, justifyContent: item.justifyContent, alignItems: item.alignItems, fontSize: 16, padding: 0}} >
        {item.format === '' &&
          rec[item.field]
        }
        {item.specialType === 'GST' && 
          formatGstField(rec, item.field)
        }
        {item.specialType === null && item.format === '#,##0.00' &&
          formatNumericField(rec, item.field)
        }
      </div>

    )); 
    
    return (
        <div className='presto-trsf-list-item-outer-container'>        
          <div className='presto-trsf-list-item-container'>
            {jsxElements}
          </div>
        </div>
    )

  }

  //**********************************************************/
  const listItems2Jsx = (rec) => {

    const columnsArr = compVar.columnsArr.filter(elem => elem.type === 1 || elem.type === 3);
    
    const jsxElements = columnsArr.map((item, index) => (
      <div id={item.id} key={index} className='presto-trsf-list-item' style={{flex: item.flex, justifyContent: item.justifyContent, alignItems: item.alignItems, fontSize: 16, padding: 0}} >
        {item.format === '' &&
          rec[item.field]
        }
        {item.specialType === 'GST' && 
          formatGstField(rec, item.field)
        }
        {item.specialType === null && item.format === '#,##0.00' &&
          formatNumericField(rec, item.field)
        }
      </div>

    )); 
    
    return (
        <div className='presto-trsf-list-item-outer-container'>        
          <div className='presto-trsf-list-item-container'>
            {jsxElements}
          </div>
        </div>
    )

  }

  //**********************************************************/
  const formatNumericField = (rec, field) => {

    let value = rec[field];
    let valueStr = '';
    if (value !== null && value !== 0) {
      valueStr = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  
      valueStr = valueStr.slice(0, -3);             
    } 

    return valueStr;

  }

  //**********************************************************/
  const formatGstField = (rec, field) => {

    let value = rec[field];
    let valueStr = '';
    if (value !== null && value !== 0) {
      valueStr = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  
      valueStr = valueStr.slice(0, -3);             
    } else if (value === null) {
      valueStr = '*' + compVar.taxObj.tax.toString() + '*'; 
    }

    return valueStr;

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

    const maxHeight = 500;

    return (

      <Popup visible={open} height={600} width={1100} onHiding={closePopover}>

        <div style={{width: '100%', maxHeight: maxHeight, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>

          {listHeaderJsx(0)}
          {listsJsx(0)}

          <div style={{height: 20, width: '100%'}}></div>

          {listHeaderJsx(1)}
          {listsJsx(1)}

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


export default PrestoCityTransferList;

