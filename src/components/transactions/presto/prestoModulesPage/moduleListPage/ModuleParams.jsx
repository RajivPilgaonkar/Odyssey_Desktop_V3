import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { convert_DbDate_To_DMY, convertDMYtoDate, convertDMYtoDateObj, addMonth, getFirstOfMonth_DMY, getLastOfMonth_DMY } from "../../../../common/CommonTransactionFunctions";
import { setModuleParamValues } from '../../../../../actions';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import Switch from "react-switch";
import TextBox from 'devextreme-react/text-box';
import SelectBox from 'devextreme-react/select-box';
import DropDownButton from 'devextreme-react/drop-down-button';
import ModuleSearchResults from './ModuleSearchResults';

import './Modules.css'

let compVar = {};

function ModuleParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [searchPopup, setSearchPopup] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_fromDate = useSelector(state => state.moduleParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.moduleParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_createdByMe = useSelector(state => state.moduleParams.createdByMe) || false; 
  let _g_trial = useSelector(state => state.moduleParams.trial) || 0; 

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      fromDate: _g_fromDate, toDate: _g_toDate,
      invoiceDate: _g_toDate,
      errorMsg: '', tourCode: '', tourDate: null,
      pax: '', searchMode: false,
      createdByMeSwitchValue: _g_createdByMe,
      searchByArray: [{type: 1, text: 'By Tour Code'}, {type: 3, text: 'By Pax Name'}],
      searchId: -1, searchType: 1, searchText: '', numYears: 2,
      actionList: [
        {key: 1, text: 'Live', mode: 0, moduleId: 'liveDropDown'}, 
        {key: 2, text: 'Trial', mode: 1, moduleId: 'trialDropDown'}, 
      ],
      moduleMode: _g_trial, moduleId: 'liveDropDown', moduleText: 'Live',
    }   
    compVar.moduleId = compVar.actionList[compVar.moduleMode].moduleId;
    compVar.moduleText = compVar.actionList[compVar.moduleMode].text;
    
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
  const nextMonth = async () => {
    compVar.fromDate = addMonth(compVar.fromDate, 1, 2);
    const fromDate = convertDMYtoDateObj(compVar.fromDate);
    compVar.fromDate = getFirstOfMonth_DMY(fromDate,0);
    compVar.toDate = getLastOfMonth_DMY(fromDate,0);
    forceRender();
  }

  //**********************************************************/
  const prevMonth = async() => {
    compVar.fromDate = addMonth(compVar.fromDate, -1, 2);
    const fromDate = convertDMYtoDateObj(compVar.fromDate);
    compVar.fromDate = getFirstOfMonth_DMY(fromDate,0);
    compVar.toDate = getLastOfMonth_DMY(fromDate,0);
    forceRender();
  }

  //**********************************************************/
  const refreshModuleData = async () => {

    saveToReduxStore();
    await getSelectedParams(1);

  }

  //**********************************************************/
  const setDates = async (mode) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    /*=== fromDate was changed ===*/
    if (mode === 1) {
      if (fromDate.getTime() > toDate.getTime() || fromDate.getMonth() !== toDate.getMonth()) {
        compVar.toDate = getLastOfMonth_DMY(fromDate,0);
      }
    } else if (mode === 2) {
      if (toDate.getTime() < fromDate.getTime() || fromDate.getMonth() !== toDate.getMonth()) {
        compVar.fromDate = getFirstOfMonth_DMY(toDate,0);
      }
    }

  }

  //**********************************************************/
  const onFromDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromDate = convert_DbDate_To_DMY(e.value,1);
      setDates(1);
      forceRender();
    }
  }

  //**********************************************************/
  const onToDateChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.toDate = convert_DbDate_To_DMY(e.value,1);
      setDates(2);
      forceRender();
    }
  }

  //**********************************************************/
  const getSelectedParams = async (mode) => {

    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        fromDate: compVar.fromDate,
        toDate: compVar.toDate,
        tourCode: compVar.tourCode, tourDate: compVar.tourDate,
        pax: compVar.pax, trial: compVar.moduleMode, 
        dataRefreshMode: mode, 
        searchPanelOpen: compVar.searchMode,
        createdByMe: compVar.createdByMeSwitchValue,
        searchId: compVar.searchId
      });
    }

  }

  //*********************************************************/
  const getSelectedModuleSearchOption = async(e) => {    

    setSearchPopup(e.open);

    if (e.refresh) {  

      compVar.tourCode = e.tourCode;
      compVar.tourDate = e.tourDate;
      compVar.tourLeader = e.pax;
      compVar.moduleMode = e.trial;

      // set first and last of the month
      compVar.fromDate = getFirstOfMonth_DMY(convertDMYtoDate(compVar.tourDate),0);
      compVar.toDate = getLastOfMonth_DMY(convertDMYtoDate(compVar.tourDate),0);

      compVar.searchId = -1;
      if (e.id !== undefined && e.id !== null) {
        compVar.searchId = e.id;
      }

      await getSelectedParams(1);
    }
    
  }


  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const saveToReduxStore = async () => {
    
    // Save to redux store through params reducer
    dispatch(setModuleParamValues({
      fromDate: compVar.fromDate,
      toDate: compVar.toDate,
      createdByMe: compVar.createdByMeSwitchValue,
      trial: compVar.moduleMode,
    }));

  }

  //**********************************************************/
  const createdByMeSwitchValueChanged = async (e) => {    
    compVar.createdByMeSwitchValue = e;
    await refreshModuleData();
    forceRender();
  }  

  //**********************************************************/
  const onActionDropDownClick = async(e) => {

    compVar.moduleMode = e.itemData.mode;
    compVar.moduleText = e.itemData.text;
    compVar.moduleId = e.itemData.moduleId;

    await refreshModuleData();

    forceRender();

  }

  //**********************************************************/
  const findTour = async () => {
    compVar.searchMode = !compVar.searchMode;
    await getSelectedParams(0);
    forceRender();    
  }

  //**********************************************************/
  const searchTours = async () => {
    setSearchPopup(true);
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
  const wefYearsSwitchValueChanged = async (e) => {
    compVar.wefYearsSwitchValue = e;
    compVar.numYears = e ? 0 : 2;
    await getSelectedParams(1);
    forceRender();
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
    const widths = ['100%'];
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
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    const labels = ['Tours Between', 'and'];
    const dates = [fromDate, toDate];
    const onValuesChanged = [onFromDateChanged, onToDateChanged];

    const label = labels[index];
    const type = "date";
    const width = 150;
    const height = 35;
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
            height={height}
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
  const switchJsx = (index) => {

    const createdByMe = (compVar.createdByMeSwitchValue !== undefined && compVar.createdByMeSwitchValue !== null) ? compVar.createdByMeSwitchValue : false;
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
  const dropDownParamsJsx = () => {

    return (
        <DropDownButton
          text={compVar.moduleText}
          icon={null}
          width={100}
          dropDownOptions={{width: 100}}
          dataSource={compVar.actionList}
          displayExpr="text"
          disabled={false}
          onItemClick={onActionDropDownClick}
        />                                
    );

  }

  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const widths = [35, 35, 90, 35, 35];
    const icons = ['arrowup', 'arrowdown', null, 'find', 'find'];
    const onClicks = [nextMonth, prevMonth, refreshModuleData, findTour, searchTours];
    const hints = ['Next Month', 'Prev Month', 'Refresh Data', 'Open Search', 'Search Tours'];
    const texts = [null, null, 'Refresh', null, null];

    const width = widths[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    const hint = hints[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        height={35}
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

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="panelparams-container">
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const buttonColorClass = compVar.moduleId;

    const moduleSearchResultsObj = {
      open: searchPopup,
      getSelectedModuleSearchOption: getSelectedModuleSearchOption, 
      searchText: ((compVar.searchText !== undefined && compVar.searchText.trim().length > 0) ? compVar.searchText : '-1'), 
      searchType: compVar.searchType, 
      numYears: compVar.numYears
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
          <div className="master-grid-params-container" style={{flex: 1}}>
            <div className={buttonColorClass}>
              {dropDownParamsJsx(0)}
            </div>
          </div>
          <div className="master-grid-params-container" style={{flex: 0.5}}>
            {buttonParamsJsx(3)}
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
            <ModuleSearchResults {...moduleSearchResultsObj} ></ModuleSearchResults>
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

export default ModuleParams;
