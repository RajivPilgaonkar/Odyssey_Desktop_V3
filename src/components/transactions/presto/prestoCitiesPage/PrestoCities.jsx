import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { setDateTimeFormat, convert_DbDate_To_DMY } from "../../../common/CommonTransactionFunctions";
import { tableHeaderArray } from "./GetPrestoCitiesData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import { Tooltip } from 'devextreme-react/tooltip';
import ScrollView from 'devextreme-react/scroll-view';
import DropDownButton from 'devextreme-react/drop-down-button';
import {setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { isRiksjaNetwork } from '../../../common/PrestoHelpers';
import {getAdmLevelLocation, getCityName} from "../../../common/GetDescFromIds";
import PopupDialogBox from '../../../common/PopupDialogBox';
import PrestoArriveDepart from '../prestoArriveDepartPage/PrestoArriveDepart'
import PrestoTravel from '../prestoDetailsPage/prestoTravelPage/PrestoTravel'
import PrestoCityBuilder from '../prestoCityBuilderPage/PrestoCityBuilder'

import '../../../common/MasterGrid.css'
import './PrestoCities.css'

const ODD_TIMINGS_COLOR = '#cc00cc';
const GREY_BACKGROUND = '#f5f5f0';
const CAR_ODD_GROUP_COLOR = '#b3ffcc';
const CAR_EVEN_GROUP_COLOR = '#d7b3ff';
const HEADER_FONT_COLOR = '#454545';
const BORDER_BOTTOM_COLOR = '#bfbfbf'

let compVar = {};

function PrestoCities(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      keyField: 'QuoCities_id',
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      admLevel: 1,
      isRiksjaNetwork: false, isPrestoDataReady: false,
      modeReorder: false, displayErrorMsg: true,
      itineraryBuilder: false,
      activeQuoCities_id: -1, deletedId: -1,
      displayTravelDetails: false,
      deleteData:
        [
          {id: 1, text: 'All Tickets in the Tour', table: "QuoTickets", popupType: 1 },
          {id: 2, text: 'All Accommodation in the Tour', table: "QuoAccommodation", popupType: 2},
          {id: 3, text: 'All Sightseeings in the Tour', table: "QuoServices", clause: "Sightseeing = 1", popupType: 3},
          {id: 4, text: 'All Transfers in the Tour', table: "QuoServices", clause: "Sightseeing = 0", popupType: 4}
        ],
      columnsArr: 
        [
          {label: 'Day', field: 'DayNo', flex: 1, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false},
          {label: 'Date', field: 'DateIn', flex: 2, justifyContent: 'flex-start', alignItems: 'center', format: 'DD/MM/YYYY', specialCell: false},
          {label: 'City', field: 'City', flex: 2.5, justifyContent: 'flex-start', alignItems: 'center', format: '', specialCell: false},
          {label: 'Nights', field: 'Nights', flex: 0.8, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false},
          {label: 'Mode', field: 'ModeOfTravel', flex: 5.5, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false},
          {label: 'ETD / ETA', field: 'MinMaxEtd', flex: 2.25, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false},
          {label: '', field: 'CarCoverage', flex: 0.25, justifyContent: 'center', alignItems: 'center', format: '', specialCell: true},
          {label: '', field: 'TimeTopBottom', flex: 1.2, justifyContent: 'center', alignItems: 'center', format: 'HH:mm', specialCell: true},
          {label: '', field: 'MoreLess', flex: 1, justifyContent: 'center', alignItems: 'center', format: 'Button', specialCell: true},
        ]    
    }   
        
    fetchInitialData();
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
 
  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      // Check if Riksja Network. During error checking only check Riksja Network Quotations for Element Costs
      compVar.isRiksjaNetwork = await isRiksjaNetwork(props.quotations_id);

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const query = "EXEC [p_QuoCityList] " + props.quotations_id.toString() + ", 1"; 
    
    try {
      compVar.mainData =  await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Presto Cities'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      await adjustMainData();

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
  const resetCityTimings = async () => {

    setDataFetched(false);

    /*=== Rearrange QuoCities timings ====*/
    let sql = 'EXEC p_QuoRearrangeCitiesTimings ' + props.quotations_id.toString();
    let spData = {sql: sql};
    await dbExecuteSp(spData);  

    await filterData();

  }

  //**********************************************************/
  const onHidingCityBuilder = async (e) => {
    compVar.itineraryBuilder = false;

    /*=== If date has changed ===*/
    if (e.dateChanged) {
      await props.onMoveDates();
    /*=== If other data (such as nights) changed ===*/
    } else if (e.refresh) {
      await filterData();
    } 

    // Do this so that the calling form knows to display the top header ...
    // ... that is, reports + other buttons, when back to the cities mode
    if (props.onChangeModeReorder !== undefined) {
      await props.onChangeModeReorder({mode: compVar.itineraryBuilder});
    }

    forceRender();

  }

  //**********************************************************/
  const setItineraryBuilderMode = async () => {

    // Itinerary Builder is clicked on
    compVar.itineraryBuilder = true;

    // Do this so that the calling form knows NOT to display the top header ...
    // ... that is, reports + other buttons, when building the itinerary
    if (props.onChangeModeReorder !== undefined) {
      await props.onChangeModeReorder({mode: compVar.itineraryBuilder});
    }

    //forceRender();
    
  }

  //**********************************************************/
  const autoFillAll = async () => {

    setDataFetched(false);

    const sql = 'EXEC p_AutoFillActivities ' + props.quotations_id.toString();
    const spData = {sql: sql};
    await dbExecuteSp(spData);  

    setDataFetched(true);

  }

  //**********************************************************/
  const arrangeCarTravel = async () => {

    /*=== Rearrange QuoCities timings ====*/
    let sql = 'EXEC p_QuoRearrangeCitiesTimings ' + props.quotations_id.toString();
    let spData = {sql: sql};
    await dbExecuteSp(spData);  

    /*=== Arrange Car Travel Details (Per Km, P2P, CarGroup) ====*/
    sql = 'EXEC p_QuoTicketsSetChangeCar ' + props.quotations_id.toString();
    spData = {sql: sql};
    await dbExecuteSp(spData);  

    /*=== Set car Agent & Vehicle ====*/
    sql = 'EXEC p_QuoSetCarAgent ' + props.quotations_id.toString();
    spData = {sql: sql};
    await dbExecuteSp(spData);  

  }

  //**********************************************************/
  const displayErrorMsg = async () => {
    await checkTicketErrors();
    compVar.displayErrorMsg = !compVar.displayErrorMsg;
    forceRender();
  }

  //**********************************************************/
  const toggleTravelDetails = () => {
    // Show / Hide Travel Details under the selected list
    compVar.displayTravelDetails = !compVar.displayTravelDetails;
    forceRender();
  }

  //**********************************************************/
  const getCityNames = async () => {
    let cities_id = (props.startCities_id !== undefined && props.startCities_id !== null) ? props.startCities_id : -1;
    let cityObj = await getCityName(cities_id);
    compVar.fromCity = cityObj.City;

    cities_id = (props.endCities_id !== undefined && props.endCities_id !== null) ? props.endCities_id : -1;
    cityObj = await getCityName(cities_id);
    compVar.toCity = cityObj.City;
  }

  //**********************************************************/
  const checkTicketErrors = async () => {

    compVar.mainData = compVar.mainData.map(rec => ({...rec, ErrorType: 0, ErrorMsg: '', ErrorList: []}));

    let query = "EXEC p_QuoCheckTickets " +
      props.quotations_id.toString() + " ";

    let errorArr = await dbGetRecordRaw({query: query});

    for (var rec of errorArr) {
      /*=== done this way since linter gives error --- "Don't make functions within a loop" ===*/
      const idx = getDataIndex(rec.QuoCities_id);
      if (idx > -1) {
        compVar.mainData[idx].ErrorType = rec.ErrorType;
        compVar.mainData[idx].ErrorMsg += (compVar.mainData[idx].ErrorMsg.trim().length > 0 ? '\n' : '') + rec.ErrorDesc;
        compVar.mainData[idx].ErrorList.push({errorType: rec.ErrorType, errorMsg: rec.ErrorDesc});
      }
    }

  }

  //**********************************************************/
  const getDataIndex = (quoCities_id) => {
    const idx = compVar.mainData.findIndex(elem => elem.QuoCities_id === quoCities_id);
    return idx;
  }

  //**********************************************************/
  const adjustMainData = async () => {

    // Reset to no errors
    compVar.mainData = compVar.mainData.map(rec => ({...rec, ErrorType: 0, ErrorMsg: '', ErrorList: []}))

    // check Errors 
    await checkTicketErrors();

    // get from & to city names
    await getCityNames();

  }

  //**********************************************************/
  const onPrestoDataReady = () => {
    compVar.isPrestoDataReady = true;
    forceRender();
  }

  //**********************************************************/
  const onSelectItem = (e) => {
    /*=== On clicking an item in the list, set the activeQuoCities_id ===*/
    compVar.activeQuoCities_id = e.QuoCities_id;    
    forceRender();
  }

  //**********************************************************/
  const onDeleteClick = async (e) => {

    compVar.dialogMessage1 = 'Are you sure you want to delete "' + e.itemData.text + '"?';
    compVar.popupDialogIndex = 0;
    compVar.deletedId = e.itemData.id;
    setPopupDialogBoxVisible(true);

  }

  //**********************************************************/
  const onModifyTravel = async() => {
    // Travel has been modified
    setDataFetched(false);
    // Reset the car travel ... Per Km, P2P, City Groups as the CarRelease CarReport Dates may have changed
    await arrangeCarTravel();
    // Refresh the data .... as the Group Report and Group Release dates would have changed
    await filterData();
  }

  //**********************************************************/
  const dropDownButtonsJsx = (index) => {

    const texts = [null];
    const icons = ['clear'];
    const hints = ['Delete Activities'];
    const widths = [null];
    const dropDownOptions = [{width: 200}];
    const items = [compVar.deleteData];
    const keyExprs = ["id"];
    const displayExprs = ["text"];
    const disableds = [false];
    const onItemClicks = [onDeleteClick];

    const text = texts[index];
    const icon = icons[index];
    const hint = hints[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const keyExpr = keyExprs[index];
    const displayExpr = displayExprs[index];
    const disabled = disableds[index];
    const onItemClick = onItemClicks[index];

    return (
      <DropDownButton
        text={text}
        icon={icon}
        hint={hint}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={keyExpr}
        displayExpr={displayExpr}
        disabled={disabled}
        onItemClick={onItemClick}
      />                                
    );
  }

  //**********************************************************/
  const toolTipJsx = (index) => {

    const targets = ['#driveable', '#oddtiming'];
    const showEvents = ['dxhoverstart','dxhoverstart'];
    const hideEvents = ['dxhoverend','dxhoverend'];
    const hideOnOutsideClicks = [false,false];
    const captions = ['This sector is driveable','Timings before 08:00am or after 08:00pm'];

    const target = targets[index];
    const showEvent = showEvents[index];
    const hideEvent = hideEvents[index];
    const hideOnOutsideClick = hideOnOutsideClicks[index];
    const caption = captions[index];

    return (
      <Tooltip
        target={target}
        showEvent={showEvent}
        hideEvent={hideEvent}
        hideOnOutsideClick={hideOnOutsideClick}
      >              
        <div>{caption}</div>
      </Tooltip>
    )

  }

  //**********************************************************/
  const buttonsJsx = (index) => {

    const moreLessIcon = (compVar.displayTravelDetails) ? 'chevronup' : 'chevrondown';

    const widths = [35,35,35,35,35];
    const heights = [35,35,35,35,30];
    const types = ['normal','normal','normal','normal','normal'];
    const stylingModes = ['outlined','outlined','outlined','outlined','outlined'];
    const icons = ['icons/resetCityTimings.png','icons/routeBuilder.png','icons/create.png', 'icons/error.png', moreLessIcon];
    const hints = ['Reset City Timings', 'Itinerary Builder', 'Auto fill Acc/SS/Trsf', 'Toggle Display Errors', 'Travel Details'];
    const clicks = [resetCityTimings, setItineraryBuilderMode, autoFillAll, displayErrorMsg, toggleTravelDetails];

    const width = widths[index];
    const height = heights[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];

    return (
      <Button
        width={width}
        height={height}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        hint={hint}
        onClick={click}
        //disabled={disabled}
      />
    );
  }

  //**********************************************************/
  const listJsx = () => {

    const jsxElements = compVar.mainData.map((item) => (
      listIemsJsx(item)
    ));  

    return (
        <div className='presto-list-inner-container'>
          <ScrollView width='100%' height='100%' /*showScrollbar={showScrollBar}*/ useNative={false}>
            {jsxElements}
          </ScrollView>
        </div>
    )

  }

  //**********************************************************/
  const listIemsJsx = (rec) => {

    let columnsArr = [...compVar.columnsArr];
    columnsArr = columnsArr.map(obj => ({ ...obj, color: '#000000', id: null }));

    /*=== If other mode but sector is driveable, set different color ===*/
    if (rec.Driveable) {
      const idx = columnsArr.findIndex(elem => elem.field === 'ModeOfTravel');
      if (idx > -1) {
        columnsArr[idx].color = 'blue';
        columnsArr[idx].id = 'driveable';
      }
    }

    /*=== If overnight, set different color ===*/
    if (rec.Overnight) {
      const idx = columnsArr.findIndex(elem => elem.field === 'MinMaxEtd');
      if (idx > -1) {
        columnsArr[idx].color = 'blue';
      }
    }

    /*=== If other mode but sector is driveable, set different color ===*/
    if (rec.OddTimings) {
      const idx = columnsArr.findIndex(elem => elem.field === 'MinMaxEtd');
      if (idx > -1) {
        columnsArr[idx].color = ODD_TIMINGS_COLOR;
        columnsArr[idx].id = 'oddtiming';
      }
    }
    
    const jsxElements = columnsArr.map((item, index) => (
      <div id={item.id} key={index} className='presto-list-item' style={{flex: item.flex, justifyContent: item.justifyContent, alignItems: item.alignItems, color: item.color}} >
        {item.format === 'DD/MM/YYYY' &&
          convert_DbDate_To_DMY(rec[item.field],1)
        }
        {item.format !== 'DD/MM/YYYY' && !item.specialCell && 
          rec[item.field]
        } 
        {item.field === 'ModeOfTravel' && rec.Driveable &&
          toolTipJsx(0)
        }
        {item.field === 'MinMaxEtd' && rec.OddTimings &&
          toolTipJsx(1)
        }
        {item.specialCell && item.field === 'CarCoverage' &&
          colorCells(rec)
        }
        {item.specialCell && item.field === 'TimeTopBottom' &&
          reportReleaseTimings(rec)
        }
        {item.specialCell && item.field === 'MoreLess' && rec.QuoCities_id === compVar.activeQuoCities_id &&
          buttonsJsx(4)
        }
      </div>

    )); 
    
    const hasWarnings = rec.ErrorList.filter(elem => elem.errorType === 1).length > 0;
    const hasErrors = rec.ErrorList.filter(elem => elem.errorType === 2).length > 0;
    let border = (hasWarnings) ? '2px solid rgba(0, 0, 255, .5)' : '2px solid ' + GREY_BACKGROUND;
    border = (hasErrors) ? '2px solid rgba(255, 0, 0, .5)' : border;    

    const borderBottom = '1px solid ' + BORDER_BOTTOM_COLOR;
    
    return (
        <div className='presto-list-item-outer-container' style={{background: GREY_BACKGROUND, borderBottom: borderBottom, border: border}} >        

          <div key={rec.QuoCities_id} className='presto-list-item-container' style={{background: GREY_BACKGROUND}} onClick={() => onSelectItem(rec)}>
            {jsxElements}
          </div>

          {compVar.activeQuoCities_id === rec.QuoCities_id && compVar.displayTravelDetails && 
            <PrestoTravel
              quoCities_id = {compVar.activeQuoCities_id}                          
              quotations_id={props.quotations_id}
              numPax={props.numPax}
              formMode={0}
              city={rec.City}
              timeIn={rec.TimeIn}
              timeOut={rec.TimeOut}
              onModifyTravel={onModifyTravel}
            >
            </PrestoTravel>
          }

          {compVar.displayErrorMsg && (hasWarnings || hasErrors) &&
            listErrorMessages(rec.ErrorList)
          }
        </div>
    )

  }

  //**********************************************************/
  const colorCells = (rec) => {
    const backgroundColors = [CAR_ODD_GROUP_COLOR, CAR_EVEN_GROUP_COLOR ];

    // html cells have 0 height when there is no content
    const dummyContent1 = (rec.GroupOrder1 > 0) ? '.' : '.';
    const dummyContent2 = (rec.GroupOrder2 > 0) ? '.' : '.';

    const backgroundColor1 = (rec.GroupOrder1 > 0) ? backgroundColors[(rec.GroupOrder1+1)%2] : null; 
    const backgroundColor2 = (rec.GroupOrder2 > 0) ? backgroundColors[(rec.GroupOrder2+1)%2] : null; 

    const color1 = (backgroundColor1 !== null) ? backgroundColor1 : GREY_BACKGROUND;
    const color2 = (backgroundColor2 !== null) ? backgroundColor2 : GREY_BACKGROUND;

    return (
      <div className='presto-list-item-split-cell-parent'>
        <div className='presto-list-item-split-cell-child' style={{color: color1, background: backgroundColor1}}>{dummyContent1}</div>
        <div className='presto-list-item-split-cell-child' style={{color: color2, background: backgroundColor2}}>{dummyContent2}</div>
      </div>  
    )

  }

  //**********************************************************/
  const reportReleaseTimings = (rec) => {

    const timeTop = (rec.TimeTop !== null) ? rec.TimeTop : '-';
    const timeBottom = (rec.TimeBottom !== null) ? rec.TimeBottom : '-';

    const colorTop = (timeTop === '-') ? GREY_BACKGROUND : null;
    const colorBottom = (timeBottom === '-') ? GREY_BACKGROUND : null;

    return (
      <div style={{/*width: '100%', height: '100%',*/ display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <div style={{display: 'flex', flex: 1, color: colorTop, fontFamily: 'Lato', fontSize: 12 /*width: '100%', height: '100%', */ }}>{timeTop}</div>
        <div style={{display: 'flex', flex: 1, color: colorBottom, fontFamily: 'Lato', fontSize: 12 /*width: '100%', height: '100%', */}}>{timeBottom}</div>
      </div>  
    )

  }

  //**********************************************************/
  const listErrorMessages = (errorList) => {

    const errorJsx =  errorList.map((rec,index) => {
      return(
        <div key={index} style={{display: 'flex', fontFamily: 'Lato', fontSize: 16, justifyContent: 'center', whiteSpace: 'pre-wrap', color: (rec.errorType === 1 ? 'rgb(0, 0, 255)': 'red')}}>
          {rec.errorMsg}
        </div>
      )
    });
  
    return errorJsx;
  }

  //**********************************************************/
  const fullHeaderJsx = () => {

    return (
      <div className='presto-list-header-container'>
        <div className='presto-list-header-buttons-container'>
          {dropDownButtonsJsx(0)}
          {buttonsJsx(0)}
        </div>
        <div style={{flex: 4}}>{listHeaderJsx()}</div>
        <div className='presto-list-header-buttons-container'>
          {buttonsJsx(1)}
          {buttonsJsx(2)}
          {buttonsJsx(3)}
        </div>
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
      <div style={{display: 'flex', height: 40, borderTop: borderTop, borderBottom: borderBottom, background: GREY_BACKGROUND}}>
        {jsxElements}
      </div>
    )

  }

  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    setPopupDialogBoxVisible(false);

    /*=== Delete option chosen - 1, Cancel option chosen - 0 ===*/
    if (e===1) {

      const idx = compVar.deleteData.findIndex(rec => rec.id === compVar.deletedId);
      if (idx > -1) {
        const rec = compVar.deleteData[idx];

        const sql = 
          "DELETE FROM " + rec.table + " " +
            "WHERE Quotations_id = " + props.quotations_id.toString() + " " +
            ((rec.clause !== undefined) ? "AND " + rec.clause : "");

        setDataFetched(false);

        const spData = {sql: sql};
        await dbExecuteSp(spData);  

        setDataFetched(true);
        
      } 

    }

    // reset delete helpers
    compVar.dialogMessage1 = '';
    compVar.popupDialogIndex = 0;
    compVar.deletedId = -1;  

  }
    
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-50;
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          {!compVar.itineraryBuilder &&

            <>
              <div style={{height: 80}}>
                <PrestoArriveDepart
                  quotations_id={props.quotations_id}
                  onPrestoDataReady={onPrestoDataReady}
                />   
              </div>   

              {compVar.isPrestoDataReady && (!initDataFetched || !dataFetched) &&
                <div className="master-grid-container" style={{height: containerHeight-80}}>
                  <LoadIndicator id="large-indicator" height={60} width={60} />
                </div>
              }

              {compVar.isPrestoDataReady && initDataFetched && dataFetched && 
                <div className="master-grid-content-box" style={{height: containerHeight-90}}>
                  {fullHeaderJsx()}            
                  <div className='presto-list-outer-container' style={{paddingTop: 1, height: containerHeight-90-40}}>
                    {listJsx()}
                  </div>
                </div>
              }

            </>
          }

          {compVar.itineraryBuilder && 
            <PrestoCityBuilder
              quotations_id={props.quotations_id}
              data={compVar.mainData}
              tourDate={props.tourDate}
              tourCode={props.tourCode}
              startCities_id={props.startCities_id}
              onHiding={onHidingCityBuilder}
            >              
            </PrestoCityBuilder>
          }

          {popupDialogBoxVisible && 
            <PopupDialogBox
              open={true}
              message1={compVar.dialogMessage1}
              message2={compVar.dialogMessage2}
              getSelectedOption={compVar.popupSelectedOptions[compVar.popupDialogIndex]}
            >
            </PopupDialogBox>
          }

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

export default PrestoCities;
