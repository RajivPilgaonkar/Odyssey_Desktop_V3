import React, { useEffect, useState } from 'react';
import {getStartOfFinancialYear,getEndOfFinancialYear, addMonth,convert_DbDate_To_DMY, convertDMYtoDate} from "../../../common/CommonTransactionFunctions";
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';

import '../../../common/MasterGrid.css'

let compVar = {};

function ListUncodedVoucherParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_fromDate = getStartOfFinancialYear(new Date());
  let _g_toDate = getEndOfFinancialYear(_g_fromDate,2);

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      errorMsg: '',
      fromDate: _g_fromDate, toDate: _g_toDate,
    }   
        
    fetchInitialData();

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
  // When initDataFetched is changed and set to true, call onPanelLoad
  useEffect (() => {

    if (initDataFetched) {
      onPanelLoad();
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [initDataFetched]);

  //**********************************************************/
  const fetchInitialData = async() => {
    await getSelectedParams(1);		
    setInitDataFetched(true);
  }
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const addYear = async () => {
    compVar.fromDate = addMonth(compVar.fromDate, 12, 2);
    compVar.toDate = addMonth(compVar.toDate, 12, 2);
    forceRender();
  }

  //**********************************************************/
  const subtractYear = async() => {
    compVar.fromDate = addMonth(compVar.fromDate, -12, 2);
    compVar.toDate = addMonth(compVar.toDate, -12, 2);
    forceRender();
  }

  //**********************************************************/
  const refreshVoucherData = async () => {
    
    await getSelectedParams(1);

  }

  //**********************************************************/
  const onFromDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromDate = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const onToDateChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.toDate = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const getSelectedParams = async (mode) => {

    const dateObj = {
      fromDate: compVar.fromDate, toDate: compVar.toDate,
      dataRefreshMode: mode};

    await props.getUncodedSelectedParams(dateObj);

  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    const labels = ['Vouchers Between', 'and'];
    const dates = [fromDate, toDate];
    const onValuesChanged = [onFromDateChanged, onToDateChanged];

    const label = labels[index];
    const type = "date";
    const width = 150;
    const displayFormat = "dd/MM/yyyy";
    const value = dates[index];
    const onValueChanged = onValuesChanged[index];
    
    return (
      <>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          {label}
        </div>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          <DateBox 
            type={type}
            width={width}
            height={35}
            displayFormat={displayFormat}
            value={value} 
            onValueChanged={onValueChanged}
            style={{fontSize: 18}}
            acceptCustomValue={false}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const widths = [35,35,90];
    const heights = [35,35,35];
    const icons = ['arrowup', 'arrowdown', null];
    const onClicks = [addYear, subtractYear, refreshVoucherData];
    const hints = ['Next Month', 'Prev Month', 'Refresh Data'];
    const texts = [null, null, 'Refresh'];

    const width = widths[index];
    const height = heights[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    const hint = hints[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        height={height}
        type="normal"
        stylingMode="outlined"
        icon={icon}
        hint={hint}
        text={text}
        onClick={onClick}
      />

    )

  }
  

  //**********************************************************/
  const onPanelLoad = async () => {

    if (props.onPanelLoad !== undefined) {
      await props.onPanelLoad ({
      });
    }

  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
          <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return (
      <>
        <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
          <div className="master-grid-params-container" style={{flex: 2, justifyContent: 'flex-start', paddingLeft: 10}}>
            {dateParamsJsx(0)}
            {dateParamsJsx(1)}
            {buttonParamsJsx(0)}
            {buttonParamsJsx(1)}
            {buttonParamsJsx(2)}
          </div>
          <div className="master-grid-params-container" style={{flex: 1, color: '#0066cc', fontWeight: 700, fontSize: 18, fontFamily: 'Lato'}}>
            Vouchers without Tour Codes
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

export default ListUncodedVoucherParams;
