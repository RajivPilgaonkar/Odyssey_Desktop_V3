import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPrestoParamValues } from '../../../../actions';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {addMonth, convert_DbDate_To_DMY, convertDMYtoDate, convertDMY_toDate, getFirstOfMonth, getLastOfMonth, getStartOfFinancialYear} from "../../../common/CommonTransactionFunctions";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import DateBox from 'devextreme-react/date-box';
import Switch from "react-switch";
import PrestoSearchResults from '../prestoSearchResultsPage/PrestoSearchResults';
import PrestoFirstLast from '../prestoFirstLastPage/PrestoFirstLast';
import DropDownButton from 'devextreme-react/drop-down-button';

import '../../../common/MasterGrid.css'
import './PrestoList.css'

let compVar = {};

function PrestoListParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [searchPopup, setSearchPopup] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_fromDate = useSelector(state => state.prestoParams.fromDate);
  let _g_toDate = useSelector(state => state.prestoParams.toDate);

  if (props.dataType === 3) {
    _g_fromDate = useSelector(state => state.prestoParams.riksjaFromDate);
    _g_toDate = useSelector(state => state.prestoParams.riksjaToDate);  
  }

  let nowDate = new Date(); 
  const startEndDateObj = getFirstOfMonth(nowDate,1);

  const fromDate = convert_DbDate_To_DMY(startEndDateObj.startDate,1);
  const toDate = convert_DbDate_To_DMY(startEndDateObj.endDate,1);

  _g_fromDate = (_g_fromDate === 'Invalid date') ? fromDate : _g_fromDate;
  _g_toDate = (_g_toDate === 'Invalid date') ? toDate : _g_toDate;

  let _g_tourCode = useSelector(state => state.prestoParams.tourCode) || '';
  let _g_tourDate = useSelector(state => state.prestoParams.tourDate) || null;
  let _g_paxName = useSelector(state => state.prestoParams.pax) || '';
  let _g_trial = useSelector(state => state.prestoParams.trial);
  let _g_searchMode = useSelector(state => state.prestoParams.searchMode);
  let _g_quotations_id = useSelector(state => state.prestoParams.quotations_id);
  if (props.dataType === 3) {
    _g_quotations_id = useSelector(state => state.prestoParams.riksjaQuotations_id);
  }
  let _g_createdByMe = useSelector(state => state.prestoParams.createdByMe);
  
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {    

    setTrialFromDataType();

    // Object for component variables
    compVar = {
      errorMsg: '',
      fromDate: _g_fromDate, toDate: _g_toDate,
      tourCode: _g_tourCode, tourDate: _g_tourDate, paxName: _g_paxName,
      trial: _g_trial, createdByMe: _g_createdByMe, searchMode: _g_searchMode,
      displayFirstLast: false, wefYearsSwitchValue: false,
      searchByArray: [{type: 1, text: 'By Tour Code'}, {type: 2, text: 'By Pax Name'}, {type: 3, text: 'By Quotation No.'}],
      searchType: 1, searchText: '', numYears: 2,      
      searchId: -1,
      prestoText: (props.dataType === 3) ? 'Riksja' : ((_g_trial === 0) ? 'Live' : 'Trial'), 
      prestoId: (props.dataType === 3) ? 'presto-riksjaDropDown' : ((_g_trial === 0) ? 'presto-liveDropDown' : 'presto-trialDropDown'), 
      prestoModeData: (props.dataType === 1) ?
        [
          {id: 1, mode: 0, text: 'Live', prestoId: 'presto-liveDropDown'},
          {id: 2, mode: 1, text: 'Trial', prestoId: 'presto-trialDropDown'},
        ]:
        [
          {id: 3, mode: 3, text: 'Riksja', prestoId: 'presto-riksjaDropDown'},
        ]
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
  const setTrialFromDataType = async () => {
    if (props.dataType === 3) {
      _g_trial = 3;
    } else {
      if (_g_trial !== 0 && _g_trial !== 1) {
        _g_trial = 0;
      }
    }  
  }

  //**********************************************************/
  const nextMonth = async () => {
    const xDate = addMonth(compVar.fromDate, 1, 1);
    compVar.fromDate = convert_DbDate_To_DMY(getFirstOfMonth(xDate,0),1); 
    compVar.toDate = convert_DbDate_To_DMY(getLastOfMonth(xDate,0),1); 
    forceRender();
  }

  //**********************************************************/
  const prevMonth = async() => {
    const xDate = addMonth(compVar.fromDate, -1, 1);
    compVar.fromDate = convert_DbDate_To_DMY(getFirstOfMonth(xDate,0),1); 
    compVar.toDate = convert_DbDate_To_DMY(getLastOfMonth(xDate,0),1); 
    forceRender();
  }

  //**********************************************************/
  const refreshPrestoData = async () => {
    
    saveToReduxStore();
    await getSelectedParams(1);

  }

  //**********************************************************/
  const findQuotation = async () => {
    compVar.searchMode = !compVar.searchMode;

    // don't refresh, simply show resized grid based on space available
    await getSelectedParams(0);

    forceRender();    
  }

  //**********************************************************/
  const searchFirstLast = async () => {
    compVar.displayFirstLast = true;
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
  const createdByMeSwitchValueChanged = async (e) => {
    compVar.createdByMe = e;
    await refreshPrestoData();
    forceRender();
  }

  //**********************************************************/
  const wefYearsSwitchValueChanged = async (e) => {
    compVar.wefYearsSwitchValue = e;
    compVar.numYears = e ? 0 : 2;
    //await getSelectedParams(1);
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
  const searchTours = async () => {
    setSearchPopup(true);
  }

  //**********************************************************/
  const setDates = async (xDate) => {

    const fromDate = getFirstOfMonth(convertDMY_toDate(xDate), 0);
    const toDate = getLastOfMonth(convertDMY_toDate(xDate), 0);

    compVar.fromDate = convert_DbDate_To_DMY(fromDate,1);
    compVar.toDate = convert_DbDate_To_DMY(toDate,1);

  }

  //*********************************************************/
  const onActionDropDownClick = async(e) => {
    compVar.trial = e.itemData.mode;
    compVar.prestoText = e.itemData.text;
    compVar.prestoId = e.itemData.prestoId;

    await getSelectedParams(1);    
  }

  //**********************************************************/
  const getSelectedParams = async (mode) => {
 
    const tourObj = {
      fromDate: compVar.fromDate, 
      toDate: compVar.toDate,
      quotations_id: compVar.quotations_id,
      tourCode: compVar.tourCode, 
      tourDate: compVar.tourDate, 
      paxName: compVar.paxName,
      trial: compVar.trial,
      dataRefreshMode: mode,
      searchId: compVar.searchId,
      searchPanelOpen: compVar.searchMode,
      createdSwitchValue: compVar.createdByMe
    };

    // Save to redux store through params reducer
    saveToReduxStore();    

    await props.getSelectedParams(tourObj);

  }

  //**********************************************************/
  const saveToReduxStore = () => {
    
    // Save to redux store through params reducer
    if (props.dataType !== 3) {
      dispatch(setPrestoParamValues({
        fromDate: compVar.fromDate,
        toDate: compVar.toDate,
        tourCode: compVar.tourCode, 
        tourDate: compVar.tourDate, 
        trial: compVar.trial,
        pax: compVar.paxName,
        createdByMe: compVar.createdByMe,
        quotations_id: _g_quotations_id,
        searchMode: compVar.searchMode
      }))  
    } else {
      dispatch(setPrestoParamValues({
        riksjaFromDate: compVar.fromDate,
        riksjaToDate: compVar.toDate,
        pax: compVar.paxName,
        riksjaQuotations_id: _g_quotations_id,
        searchMode: compVar.searchMode
      }))
    }
  }


  //*********************************************************/
  const getSelectedPrestoSearchOption = async(e) => {    

    if (e.refresh) {  
      compVar.tourCode = e.tourCode;
      compVar.tourDate = e.tourDate;
      compVar.paxName = e.pax;    
      compVar.prestoMode = e.trial;
      compVar.trial = e.trial;
      compVar.quotations_id = e.quotations_id;
      _g_quotations_id = e.quotations_id;
      const idx = compVar.prestoModeData.findIndex(rec => rec.mode === compVar.prestoMode);
      if (idx >= 0) {
        compVar.prestoText = compVar.prestoModeData[idx].text;
        compVar.prestoId = compVar.prestoModeData[idx].prestoId;
      }

      setDates(compVar.tourDate);
        
      await getSelectedParams(1);
    }

    setSearchPopup(e.open);
    
  }

  //**********************************************************/
  const getSelectedFirstLastPrestoSearchOption = async (e) => {

    compVar.displayFirstLast = false;

    if (e.refresh) {  
      compVar.tourCode = e.tourCode;
      compVar.tourDate = e.tourDate;
      compVar.paxName = e.pax;    
      compVar.trial = e.trial; 
      compVar.quotations_id = e.quotations_id;
      _g_quotations_id = e.quotations_id;

      const idx = compVar.prestoModeData.findIndex(rec => rec.mode === compVar.trial);
      if (idx >= 0) {
        compVar.prestoText = compVar.prestoModeData[idx].text;
        compVar.prestoId = compVar.prestoModeData[idx].prestoId;
      }

      setDates(compVar.tourDate);
            
      await getSelectedParams(1);
        
    } 
    
    forceRender();

  }

  //**********************************************************/
  const searchParamsJsx = () => {

    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 10}}>
          {textParamsJsx(0)}
          {buttonParamsJsx(5)}
          {selectBoxParamsJsx(0)}
          <div style={{paddingRight: 5}}></div>
          {switchJsx(1)}
        </div>
      </>
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
            style={{fontSize: 16}}
            acceptCustomValue={false}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const ids = [compVar.prestoId];
    const texts = [compVar.prestoText];
    const widths = [100];
    const items = [compVar.prestoModeData];
    const keyExprs = ['id'];
    const displayExprs = ['text'];
    const onItemClicks = [onActionDropDownClick];

    const id = ids[index];
    const text = texts[index];
    const width = widths[index];
    const item = items[index];
    const keyExpr = keyExprs[index];
    const displayExpr = displayExprs[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        id={id}
        text={text}
        width={width}
        items={item}
        keyExpr={keyExpr}
        displayExpr={displayExpr}
        onItemClick={onItemClick}
      />
  
    )

  }

  //**********************************************************/
  const selectBoxParamsJsx = (index) => {

    const dataSources = [compVar.searchByArray];
    const displayExprs = ["text"];
    const valueExprs = ["type"];
    const values = [compVar.searchType];
    const widths = ['150'];
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
  const textParamsJsx = (index) => {

    const labels = ['Search'];
    const widths = [150];
    const valueChanges = [onSearchTextChange];
    const enterClicks = [searchTours];
    const maxLengths = [30];
    const heights = [35];
    const values = [compVar.searchText];
    const styles = [{fontSize: 14}];

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
  const buttonParamsJsx = (index) => {

    const widths = [35,35,90,35,35.35];
    const heights = [35,35,35,35,35.35];
    const icons = ['arrowup', 'arrowdown', null, 'find', 'icons/firstlast.png','find'];
    const onClicks = [nextMonth, prevMonth, refreshPrestoData, findQuotation, searchFirstLast, searchTours];
    const hints = ['Next Month', 'Prev Month', 'Refresh Data', 'Find Tours', 'Display first/last','Find Tour'];
    const texts = [null, null, 'Refresh', null, null, null];

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

    const prestoSearchResultsObj = {
      open: searchPopup,
      getSelectedPrestoSearchOption: getSelectedPrestoSearchOption, 
      searchText: ((compVar.searchText !== undefined && compVar.searchText.trim().length > 0) ? compVar.searchText : '-1'), 
      searchType: compVar.searchType, 
      wefSwitchValue: compVar.wefYearsSwitchValue,
      numYears: compVar.numYears,
      dataType: props.trial
    }    

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
          <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    let quotationDate = null;
    if (compVar.displayFirstLast) {
      quotationDate = getStartOfFinancialYear(convertDMY_toDate(compVar.fromDate));
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
          <div className="master-grid-params-container" style={{flex: 0.75}}>
            {dropDownButtonJsx(0)}
          </div>
          <div className="master-grid-params-container" style={{flex: 0.75}}>
            {switchJsx(0)}
          </div>
          <div className="master-grid-params-container" style={{flex: 0.5}}>
            {buttonParamsJsx(3)}
            {buttonParamsJsx(4)}
          </div>
        </div>

        {compVar.searchMode &&
          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 1, justifyContent: 'flex-start'}}>
              {searchParamsJsx()}
            </div>
            <div className="master-grid-params-container" style={{flex: 1}}>
            </div>
          </div>
        }

        {searchPopup && 
          <div>
            <PrestoSearchResults {...prestoSearchResultsObj} ></PrestoSearchResults>
          </div>
        }

        {compVar.displayFirstLast &&
          <PrestoFirstLast
            quotationDate={quotationDate}            
            getSelectedFirstLastPrestoSearchOption={getSelectedFirstLastPrestoSearchOption}
          />
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

export default PrestoListParams;
