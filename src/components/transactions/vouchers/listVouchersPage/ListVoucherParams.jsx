import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import SelectBox from 'devextreme-react/select-box';
import TextBox from 'devextreme-react/text-box';
import Switch from "react-switch";
import {getTourRef} from "../../../common/VoucherHelpers";
import VoucherSearchResults from '../voucherSearchResultsPage/VoucherSearchResults';

import '../../../common/MasterGrid.css'

let compVar = {};

function ListVoucherParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [searchPopup, setSearchPopup] = useState(false);  
  const [wef, setWef] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_tourCode = useSelector(state => state.voucherParams.tourCode) || '';
  let _g_tourDate = useSelector(state => state.voucherParams.tourDate) || null;
  let _g_tourLeader = useSelector(state => state.voucherParams.paxName) || '';

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      errorMsg: '',
      tourCode: _g_tourCode, tourDate: _g_tourDate, tourLeader: _g_tourLeader,
      searchByArray: [{type: 1, text: 'By Tour Code'}, {type: 2, text: 'By Voucher No'}, {type: 3, text: 'By Pax Name'}],
      searchType: 1, searchText: '', numYears: 2,
      searchId: -1
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
  const wefSwitchValueChanged = (e) => {
    compVar.numYears = e ? 0 : 2;
    setWef(e);
  }

  //**********************************************************/
  const getSelectedParams = async (mode) => {

    const tourRefObj = await getTourRef (compVar.tourCode, compVar.tourDate);
    const tourRef = tourRefObj.tourRef;
  
    const tourObj = {
      tourCode: compVar.tourCode, 
      tourDate: compVar.tourDate, 
      paxName: compVar.tourLeader,
      tourRef: tourRef,
      dataRefreshMode: mode,
      searchId: compVar.searchId
    };

    await props.getSelectedParams(tourObj);

  }

  //*********************************************************/
  const getSelectedVoucherSearchOption = async(e) => {    

    if (e.refresh) {  
      compVar.tourCode = e.tourCode;
      compVar.tourDate = e.tourDate;
      compVar.tourLeader = e.pax;
      compVar.tourRef = e.tourRef;
      if (e.id !== undefined && e.id !== null) {
        compVar.searchId = e.id;
      }
      await getSelectedParams(1);
    }

    setSearchPopup(e.open);
    
  }

  //**********************************************************/
  const searchParamsJsx = () => {

    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 20}}>
          {textParamsJsx(0)}
          {buttonParamsJsx(0)}
          {selectBoxParamsJsx(0)}
          <div style={{paddingRight: 5}}></div>
          {switchJsx(0)}
        </div>
      </>
    )

  }

  //**********************************************************/
  const switchJsx = (index) => {

    const labels = [''];
    const heights = [20];
    const widths = [40];
    const onSwitchChanges = [wefSwitchValueChanged];
    const onChecks = [wef];

    const label = labels[index];
    const height = heights[index];
    const width = widths[index];
    const onSwitchChange = onSwitchChanges[index];
    const onCheck = onChecks[index];

    return (
      <>
        {label.length > 0 &&
          <div style={{paddingRight: 10}}>
            {label}
          </div>            
        }
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
  const buttonParamsJsx = (index) => {

    const widths = [35];
    const heights = [35];
    const icons = ['find'];
    const onClicks = [searchTours];
    const hints = ['Search Tours'];
    const texts = [null];

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

    // so that the spaces between tourCode and tourDate appear
    const tour = (compVar.tourCode + '   ' + compVar.tourDate).replace(/ /g, "\u00A0");

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
          <div className="master-grid-params-container" style={{flex: 2}}>
            {searchParamsJsx()}
          </div>
          <div className="master-grid-params-container" style={{flex: 1, color: '#0066cc', fontWeight: 700, fontSize: 18, fontFamily: 'Lato'}}>
            {tour}
          </div>
          <div className="master-grid-params-container" style={{flex: 2, fontSize: 16, fontFamily: 'Lato'}}>
            {compVar.tourLeader}
          </div>
        </div>

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

export default ListVoucherParams;
