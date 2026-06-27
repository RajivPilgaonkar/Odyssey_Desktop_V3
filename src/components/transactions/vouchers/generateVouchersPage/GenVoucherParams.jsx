import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {addWeek, convert_DbDate_To_DMY, convertDMYtoDate, convertDMY_MDY, convertDMY_toDate, getStartEndOfWeek} from "../../../common/CommonTransactionFunctions";
import { setVoucherParamValues } from '../../../../actions';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { getNumGreaterVouchers } from "../../../common/GetDescFromIds";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import Switch from "react-switch";
import DateBox from 'devextreme-react/date-box';
import TextBox from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';
import DropDownButton from 'devextreme-react/drop-down-button';
import VoucherSearchResults from '../voucherSearchResultsPage/VoucherSearchResults';

import '../../../common/MasterGrid.css'

let compVar = {};

function GenVoucherParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [searchPopup, setSearchPopup] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_fromDate = useSelector(state => state.voucherParams.fromDate);
  let _g_toDate = useSelector(state => state.voucherParams.toDate);
  let _g_createdByMe = useSelector(state => state.voucherParams.createdByMe);
  
  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      errorMsg: '',
      fromDate: _g_fromDate, toDate: _g_toDate,
      voucherDate: _g_fromDate,
      createdByMe: _g_createdByMe,
      wefYearsSwitchValue: false, searchMode: false, 
      tourCode: null, tourDate: null,
      searchByArray: [{type: 1, text: 'By Tour Code'}, {type: 2, text: 'By Voucher No'}, {type: 3, text: 'By Pax Name'}],
      searchType: 1, searchText: '', numYears: 2,
      searchId: -1,
      actionList: [
        {key2: 1, text: 'Generate All Vouchers'}, 
        {key2: 2, text: 'Delete All Vouchers'}, 
      ],
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
    const toDate_MDY = convertDMY_MDY(compVar.toDate);
    compVar.numFutureVouchers = await getNumGreaterVouchers(1, 1, toDate_MDY);      

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
  const nextWeek = async () => {
    compVar.fromDate = addWeek(compVar.fromDate, 1, 2);
    compVar.toDate = addWeek(compVar.toDate, 1, 2);
    forceRender();
  }

  //**********************************************************/
  const prevWeek = async() => {
    compVar.fromDate = addWeek(compVar.fromDate, -1, 2);
    compVar.toDate = addWeek(compVar.toDate, -1, 2);
    forceRender();
  }

  //**********************************************************/
  const refreshVoucherData = async () => {
    
    await getSelectedParams(1);

  }

  //**********************************************************/
  const findVoucher = async () => {
    compVar.searchMode = !compVar.searchMode;
    forceRender();    
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

    const toDate_MDY = convertDMY_MDY(compVar.toDate);
    compVar.numFutureVouchers = await getNumGreaterVouchers(1, 1, toDate_MDY);      
    
    const dateObj = {
      fromDate: compVar.fromDate, toDate: compVar.toDate, 
      voucherDate: compVar.voucherDate, dataRefreshMode: mode, 
      numFutureVouchers: compVar.numFutureVouchers, 
      wefSwitchValue: compVar.createdByMe,
      wefYearsSwitchValue: compVar.numYears,
      searchPanelOpen: compVar.searchMode,
      tourCode: compVar.tourCode,
      tourDate: compVar.tourDate,
      masters_id: compVar.searchId
    };

    // Save to redux store through params reducer
    dispatch(setVoucherParamValues({
      fromDate: compVar.fromDate,
      toDate: compVar.toDate,
      createdByMe: compVar.createdByMe,
      masters_id: compVar.searchId
    }));

    await props.getSelectedParams(dateObj);

    forceRender();

  }

  //**********************************************************/
  const generateAllVouchers = async () => {
    await getSelectedParams(2);
  }

  //**********************************************************/
  const deleteAllVouchers = async () => {
    await getSelectedParams(3);
  }

  //**********************************************************/
  const onActionDropDownClick = async(e) => {
    if (e.itemData.key2 === 1) {
      await generateAllVouchers();
    } else if (e.itemData.key2 === 2) {
      await deleteAllVouchers();
    } 
    forceRender();
  }
  

  //**********************************************************/
  const createdByMeSwitchValueChanged = async (e) => {
    compVar.createdByMe = e;
    await getSelectedParams(1);
    forceRender();
  }

  //**********************************************************/
  const wefYearsSwitchValueChanged = async (e) => {
    compVar.wefYearsSwitchValue = e;
    compVar.numYears = e ? 0 : 2;
    await getSelectedParams(1);
    forceRender();
  }

  //**********************************************************/
  const onSearchTypeValueChanged = (e) => {    
    compVar.searchType = e.value;
    forceRender();
  }

  //**********************************************************/
  const onSearchTextChange = async (e) => {
    compVar.searchText = e.value;
    forceRender();
  }


  //**********************************************************/
  const setDates = async (xDate) => {

    const startEndDateObj = getStartEndOfWeek(convertDMY_toDate(xDate));

    compVar.fromDate = convert_DbDate_To_DMY(startEndDateObj.startDate,1);
    compVar.toDate = convert_DbDate_To_DMY(startEndDateObj.endDate,1);

  }

  //*********************************************************/
  const getSelectedVoucherSearchOption = async(e) => {    

    if (e.refresh) {  
      compVar.tourCode = e.tourCode;
      compVar.tourDate = e.tourDate;
      compVar.tourLeader = e.pax;
      compVar.tourRef = e.tourRef;

      setDates(e.tourDate);

      compVar.searchId = -1;
      if (e.id !== undefined && e.id !== null) {
        compVar.searchId = e.id;
      }

      // If next refresh is based from voucher search 
      const flag = (compVar.searchId > 0) ? 4 : 1;
      await getSelectedParams(flag);
    }

    setSearchPopup(e.open);
    
  }

  //**********************************************************/
  const searchTours = async () => {
    setSearchPopup(true);
  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    const labels = ['Tours Between', 'and'];
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

    const widths = [35,35,90,35,35];
    const heights = [35,35,35,35,35];
    const icons = ['arrowup', 'arrowdown', null, 'find', 'find'];
    const onClicks = [nextWeek, prevWeek, refreshVoucherData, findVoucher, searchTours];
    const hints = ['Next Week', 'Prev Week', 'Refresh Data', 'Find Tours', 'Search'];
    const texts = [null, null, 'Refresh', null, null];

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
  const dropDownButtonJsx = (index) => {

    const texts = ['Actions for Selected'];
    const icons = ['bulletlist']
    const widths = [200];
    const dropDownOptions = [{width: 230}];
    const items = [compVar.actionList];
    const onItemClicks = [onActionDropDownClick];

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
        keyExpr={"id"}
        displayExpr={"text"}
        onItemClick={onItemClick}
      />
    )

  }

  //**********************************************************/
  const switchJsx = (index) => {

    const createdByMe = (compVar.createdByMe !== undefined && compVar.createdByMe !== null) ? compVar.createdByMe : false;
    const wefYearsSwitchValue = (compVar.wefYearsSwitchValue !== undefined) ? compVar.wefYearsSwitchValue : false;

    const labels = ['Created By Me',''];
    const heights = [20,20];
    const widths = [40,40];
    const onSwitchChanges = [createdByMeSwitchValueChanged, wefYearsSwitchValueChanged];
    const onChecks = [createdByMe, wefYearsSwitchValue];

    const label = labels[index];
    const height = heights[index];
    const width = widths[index];
    const onSwitchChange = onSwitchChanges[index];
    const onCheck = onChecks[index];

    return (
      <>
        <div style={{paddingRight: 10}}>
          {label}
        </div>            
        <Switch 
          height={height} 
          width={width} 
          onChange={onSwitchChange} 
          checked={onCheck} 
          uncheckedIcon={false}
        />
      </>      
    )
  }

  //**********************************************************/
  const textParamsJsx = (index) => {

    const labels = ['Search'];
    const widths = [150];
    const valueChanges = [onSearchTextChange];
    const enterClicks = [searchTours];
    const maxLengths = [30];
    const heights = [35];
    const values = [compVar.searchText];
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
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'/*, width: '100%'*/}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16, paddingRight: 5}}>
          {label}
        </div>
        <div style={{flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
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
  const searchParamsJsx = () => {

    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 20}}>
          {textParamsJsx(0)}
          {buttonParamsJsx(4)}
          {selectBoxParamsJsx(0)}
          <div style={{paddingRight: 5}}></div>
          {switchJsx(1)}
        </div>
      </>
    )

  }

  //**********************************************************/
  const selectBoxParamsJsx = (index) => {

    const dataSources = [compVar.searchByArray];
    const displayExprs = ["text"];
    const valueExprs = ["type"];
    const values = [compVar.searchType];
    const widths = [150];
    const onSelectBoxChanges = [onSearchTypeValueChanged];

    const dataSource = dataSources[index];
    const displayExpr = displayExprs[index];
    const valueExpr = valueExprs[index];
    const value = values[index];
    const width = widths[index];
    const onSelectBoxChange = onSelectBoxChanges[index];

    return (
      <SelectBox 
        dataSource={dataSource}
        displayExpr={displayExpr}
        valueExpr={valueExpr}
        value={value} 
        width={width}
        onValueChanged={onSelectBoxChange}
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

    const voucherSearchResultsObj = {
      open: searchPopup,
      getSelectedVoucherSearchOption: getSelectedVoucherSearchOption, 
      searchText: ((compVar.searchText !== undefined && compVar.searchText.trim().length > 0) ? compVar.searchText : '-1'), 
      searchType: compVar.searchType, 
      numYears: compVar.numYears
    }    

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
          <div className="master-grid-params-container" style={{flex: 3, justifyContent: 'flex-start', paddingLeft: 10}}>
            {dateParamsJsx(0)}
            {dateParamsJsx(1)}
            {buttonParamsJsx(0)}
            {buttonParamsJsx(1)}
            {buttonParamsJsx(2)}
          </div>
          <div className="master-grid-params-container" style={{flex: 1}}>
            {switchJsx(0)}
          </div>
          <div className="master-grid-params-container" style={{flex: 0.5}}>
            {buttonParamsJsx(3)}
          </div>
          <div className="master-grid-params-container" style={{flex: 1}}>
            {dropDownButtonJsx(0)}
          </div>
        </div>

        {compVar.searchMode &&
          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 2}}>
              {searchParamsJsx()}
            </div>
            <div className="master-grid-params-container" style={{flex: 3}}>
            </div>
          </div>
        }

        {searchPopup &&
          <div>
            <VoucherSearchResults {...voucherSearchResultsObj} ></VoucherSearchResults>
          </div>
        }

      </>
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default GenVoucherParams;
