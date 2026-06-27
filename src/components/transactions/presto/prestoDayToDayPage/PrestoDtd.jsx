import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp, setPrestoParamValues } from '../../../../actions/index';
import { setDateTimeFormat, convert_DbDate_To_DMY, addDay, deepClone } from "../../../common/CommonTransactionFunctions";
import { tableHeaderArray } from "./GetPrestoDtdData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import ScrollView from 'devextreme-react/scroll-view';
import DropDownButton from 'devextreme-react/drop-down-button';
import {setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { groupCitywiseData, getActivityData, getActivityDescription, activityTiming, activityDayTitleJsx, activityDescriptionJsx, activityVoucherDescriptionJsx, activityCarJourneyJsx, checkActivityErrors, activityErrorJsx } from '../../../common/PrestoHelpers';
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import List from 'devextreme-react/list';
import Switch from "react-switch";
import PopupDialogBox from '../../../common/PopupDialogBox';
import { Toast } from 'devextreme-react/toast';
import {toastContainerStyle} from "../../../common/ComponentStyles";
import PrestoTravel from '../prestoDetailsPage/prestoTravelPage/PrestoTravel';
import PrestoAccommodation from '../prestoDetailsPage/prestoAccommodationPage/PrestoAccommodation';
import PrestoSightseeing from '../prestoDetailsPage/prestoSightseeingPage/PrestoSightseeing';
import PrestoTransfer from '../prestoDetailsPage/prestoTransferPage/PrestoTransfer';
import PrestoCityHotelList from '../prestoDetailsPage/prestoAccommodationPage/PrestoCityHotelList';
import PrestoCitySightseeingList from '../prestoDetailsPage/prestoSightseeingPage/PrestoCitySightseeingList';

import '../../../common/MasterGrid.css'
import './PrestoDtd.css'

const WHITE_BACKGROUND = '#ffffff';
const ACTIVE_ACT_COLOR = '#f2f2f2';

let compVar = {};

function PrestoDtd(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_allData = useSelector(state => state.prestoParams.allData);
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  // use this to write to the redux store
  const dispatch = useDispatch();

  const _g_location = useLocation();

  const scrollViewRef = useRef(null);
  const divItemRefs = useRef([]);

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [], groupedData: [], allData: [],
      activityData: [],
      keyField: 'TmpActivities_id',      
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      admLevel: 1,
      toastIsVisible: false, toastMessage: '', toastMessageType: 'info',
      deletedId: -1,
      dayByDaySwitchValue: !_g_allData, voucherDescSwitchValue: false,
      displayActivityDetails: false, // used for activities
      displayActivityDetailsPopup: false,      
      activeDate: null, displayHotelList: false, displaySightseeingList: false,
      activeCities_id: null, activityType: null,      
      hotelCategory: 'Standard',
      addData:
        [
          {id: 21, text: 'Add Transfer', onClick: addTransfer},
          {id: 22, text: 'Add Sightseeing', onClick: addSightseeing},
          {id: 23, text: 'Add Accommodation', onClick: addAccommodation},
        ],
        addHotelSightseeing:
        [
          {id: 1, text: 'List Hotels', onClick: listHotels},
          {id: 2, text: 'List Sightseeings', onClick: listSightseeing},
        ]
    }   
        
    fetchInitialData();
    //filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
 
  //**********************************************************/
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);
      
      // Get Tickets, Accommodation, Services, Transport data for that quotation
      compVar.activityData = await getActivityData(props.quotations_id,null);

      await filterData();

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const query = "EXEC [p_CreateActivityData] " + props.quotations_id.toString() + ", 1"; 
    
    try {

      compVar.mainData =  await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Presto DTD'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date      
      await setDateTimeFormat (tableHeaderArray, compVar.mainData);

      await adjustMainData();

      // Save all data as 'Day By Day' switch will filter the data
      compVar.allData = deepClone(compVar.mainData);   

      // If 'Day By Day' switch is ON
      if (compVar.dayByDaySwitchValue && compVar.mainData.length > 0) {
        // If activeDate is not yet set, set it to the date of the 1st record
        compVar.activeDate = (compVar.activeDate === null || compVar.activeDate === undefined) ? compVar.mainData[0].activityDateDMY : compVar.activeDate;
        compVar.mainData = (compVar.activeDate !== null) ? compVar.mainData.filter(elem => elem.activityDateDMY === compVar.activeDate) : compVar.mainData.filter(elem => elem.activityDateDMY === compVar.mainData[0].activityDateDMY) ;            
        compVar.activeKey = compVar.mainData[0].key;  
      } else {

        // case of deletion where record is deleted and idx no longer valid
        let idx = compVar.allData.findIndex(rec => rec.key === compVar.activeKey && rec.activityDateDMY === compVar.activeDate);
        if (idx === -1) {
          idx = compVar.allData.findIndex(rec => rec.activityDateDMY === compVar.activeDate);
        }
  
        // Go to the previous record if key not found
        idx = (idx > -1) ? idx : idx-1;
        // But do not go beyond 0
        idx = (idx > -1) ? idx : 0;
        compVar.activeDate = compVar.allData[idx].activityDateDMY;      
        compVar.activeKey = compVar.allData[idx].key;  
      }

      // Grouped data on city/dates as shown in the left panel
      compVar.groupedData = await groupCitywiseData(props.quotations_id,compVar.allData);

    } catch(err) {
      alert(err);
    }

    setFocusedRow(compVar);

    setDataFetched(true);

  }

  //**********************************************************/
  const dayByDayToggle = () => {
    setDataFetched(false);
    
    // If 'Day By Day' switch is ON
    if (compVar.dayByDaySwitchValue && compVar.allData.length > 0) {
      // If activeDate is not yet set, set it to the date of the 1st record
      compVar.activeDate = (compVar.activeDate === null || compVar.activeDate === undefined) ? compVar.allData[0].activityDateDMY : compVar.activeDate;
      compVar.mainData = (compVar.activeDate !== null) ? compVar.allData.filter(elem => elem.activityDateDMY === compVar.activeDate) : compVar.allData.filter(elem => elem.activityDateDMY === compVar.allData[0].activityDateDMY) ;    
    } else {
      compVar.mainData = deepClone(compVar.allData);
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
  const toggleActivityDetails = (e) => {
    // If this is not called, it will also fire onSelectItem of the parent div ....
    // ... and that will set displayActivityDetails to false
    if (e && e.event) {
      e.event.stopPropagation();
    }

    // Activity Type -- Tickets, Acc, S/S, Trsf
    const idx = compVar.mainData.findIndex(rec => rec.key === compVar.activeKey);
    compVar.activityType = compVar.mainData[idx].activityType;

    // Show / Hide Activity Details under the selected list
    compVar.displayActivityDetails = !compVar.displayActivityDetails;
    forceRender();
  }

  //**********************************************************/
  const adjustMainData = async () => {

    // Reset to no errors
    compVar.mainData = compVar.mainData.map(rec => ({...rec, ErrorType: 0, ErrorMsg: '', ErrorList: [], displayCities_id: rec.cities_id, activityDateDMY: convert_DbDate_To_DMY(rec.activityDate,1)}));

    // check Errors 
    await checkAllErrors();

  }

  //**********************************************************/
  const onModifyTravel = async(e) => {

    if (e.addNew || e.save) {
      // get only the related services data
      const activityData = await getActivityData(props.quotations_id,1);
      // add only the accommodation data
      compVar.activityData = {...compVar.activityData, ticketsData: activityData.ticketsData};

      compVar.displayActivityDetailsPopup = false;
      compVar.displayActivityDetails = true;
    }

    if (e.addNew) {
      setDataFetched(false);
      // Reset the car travel ... Per Km, P2P, City Groups as the CarRelease CarReport Dates may have changed
      await arrangeCarTravel();

      // Refresh the data .... as the Group Report and Group Release dates would have changed      
      await refreshData();      
    } else if (e.save) {
      forceRender();
    }

  }

  //**********************************************************/
  const saveToReduxStore = async () => {

    // Save to redux store through params reducer
    dispatch(setPrestoParamValues({
      allData: !compVar.dayByDaySwitchValue
    }));

  }

  //**********************************************************/
  const dayByDaySwitchValueChanged = async (e) => {
    compVar.dayByDaySwitchValue = e;
    await saveToReduxStore();
    dayByDayToggle();
  }  

  //**********************************************************/
  const voucherDescSwitchValueChanged = async (e) => {
    compVar.voucherDescSwitchValue = e;
    forceRender();
  }  

  //**********************************************************/
  const checkAllErrors = async () => {
    // Warnings & errors --- Tickets, Accommodation, Services, Transport
    await checkActivityErrors(1, compVar.mainData, props.quotations_id, null);
    await checkActivityErrors(2, compVar.mainData, props.quotations_id, null);
    await checkActivityErrors(3, compVar.mainData, props.quotations_id, null);
    await checkActivityErrors(4, compVar.mainData, props.quotations_id, null);
  }

  //**********************************************************/
  const previousDay = async () => {
    if (compVar.activeDate !== compVar.allData[0].activityDateDMY) {
      compVar.activeDate = (compVar.activeDate !== null) ? addDay(compVar.activeDate, -1, 2) : null;    
      dayByDayToggle();
    }
  }

  //**********************************************************/
  const nextDay = async () => {
    if (compVar.activeDate !== compVar.allData[compVar.allData.length-1].activityDateDMY) {
      compVar.activeDate = (compVar.activeDate !== null) ? addDay(compVar.activeDate, 1, 2) : null;
      dayByDayToggle();
    }
  }

  //**********************************************************/
  const refreshData = async () => {

    // get only the related services data
    compVar.activityData = await getActivityData(props.quotations_id,null);

    /*=== get idx BEFORE executing filterData ===*/
    let idx = compVar.allData.findIndex(rec => rec.key === compVar.activeKey);

    await filterData();

    // case of deletion where record is deleted and idx no longer valid
    const idx2 = compVar.allData.findIndex(rec => rec.key === compVar.activeKey);
    if (idx2 > -1) {
      idx = idx2;
    } else {
      idx = (idx > 0) ? idx-1 : 0;
    }

    /*=== Reposition to the active div ===*/
    if (idx > -1) {
      const activeDate = compVar.allData[idx].activityDateDMY;      
      const activeKey = compVar.allData[idx].key;
      compVar.activityType = null;
      await scrollIntoView({itemData: compVar.activeDate});
      compVar.activeDate = activeDate;      
      compVar.activeKey = activeKey;
      forceRender();
    }

    //await filterData();    

  }

  //**********************************************************/
  const autoFillActivities = async () => {

    setDataFetched(false);

    // If activities were deleted, use auto-fill for system generated activities    
    const sql = 'EXEC p_AutoFillActivities ' + props.quotations_id.toString();
    const spData = {sql: sql};
    await dbExecuteSp(spData);  

    /*=== get idx BEFORE executing filterData ===*/
    const idx = compVar.allData.findIndex(rec => rec.key === compVar.activeKey);

    await filterData();

    /*=== Reposition to the active div ===*/
    if (idx > -1) {
      const activeDate = compVar.allData[idx].activityDateDMY;      
      const activeKey = compVar.allData[idx].key;
      compVar.activityType = null;
      await scrollIntoView({itemData: compVar.activeDate});
      compVar.activeDate = activeDate;      
      compVar.activeKey = activeKey;
      forceRender();
    }

  }

  //**********************************************************/
  const onDropDownMenuSelect = async (e) => {
    await e.itemData.onClick;
  }

  //**********************************************************/
  const onToastHiding = () => {
    compVar.toastIsVisible = false;
    forceRender();
  }

  //**********************************************************/
  const listHotels = async(e) => {
    const idx = compVar.mainData.findIndex(rec => rec.key === compVar.activeKey);
    compVar.activeCities_id = (idx > -1) ? compVar.mainData[idx].cities_id : null;
    compVar.activeDate = (idx > -1) ? compVar.mainData[idx].activityDateDMY : null;
    compVar.displayHotelList = true;
    forceRender();
  }

  //**********************************************************/
  const getSelectedHotelFromList = async(e) => {
    compVar.displayHotelList = false;
    forceRender();
  }

  //**********************************************************/
  const listSightseeing = async(e) => {
    const idx = compVar.mainData.findIndex(rec => rec.key === compVar.activeKey);
    compVar.activeCities_id = (idx > -1) ? compVar.mainData[idx].cities_id : null;
    compVar.activeDate = (idx > -1) ? compVar.mainData[idx].activityDateDMY : null;
    compVar.displaySightseeingList = true;
    forceRender();
  }

  //**********************************************************/
  const getSelectedSightseeingFromList = async(e) => {
    compVar.displaySightseeingList = false;
    forceRender();
  }

  //**********************************************************/
  const onSelectItem = (e) => {
    /*=== On clicking an item in the list, set the active key ===*/
    compVar.activeKey = e.key;
    compVar.displayActivityDetails = false;
    // Direct insert mode from titles menu
    compVar.displayActivityDetailsPopup = false;
    compVar.activeDate = e.activityDateDMY;

    forceRender();
  }

  //**********************************************************/
  const addAccommodation = (e) => {
    // Direct insert mode from titles menu
    compVar.displayActivityDetailsPopup = true;
    compVar.activityType = 2;
    forceRender();
  }

  //**********************************************************/
  const onModifyAccommodation = async (e) => {

    if (e.addNew || e.save) {
      // get only the related services data
      const activityData = await getActivityData(props.quotations_id,2);
      // add only the accommodation data
      compVar.activityData = {...compVar.activityData, accommodationData: activityData.accommodationData};

      compVar.displayActivityDetailsPopup = false;
      compVar.displayActivityDetails = true;
    }

    if (e.addNew) {
      await refreshData();      
    } else if (e.save) {
      forceRender();
    }

  }

  //**********************************************************/
  const addSightseeing = (e) => {
    // Direct insert mode from titles menu
    compVar.displayActivityDetailsPopup = true;
    compVar.activityType = 3;
    forceRender();
  }

  //**********************************************************/
  const onModifySightseeing = async (e) => {

    if (e.addNew || e.save) {
      // get only the related services data
      const activityData = await getActivityData(props.quotations_id,3);
      // add only the accommodation data
      compVar.activityData = {...compVar.activityData, servicesData: activityData.servicesData};

      compVar.displayActivityDetailsPopup = false;
      compVar.displayActivityDetails = true;
    }

    if (e.addNew) {
      await refreshData();      
    } else if (e.save) {
      forceRender();
    }

  }

  //**********************************************************/
  const addTransfer = (e) => {
    // Direct insert mode from titles menu
    compVar.displayActivityDetailsPopup = true;
    compVar.activityType = 4;
    forceRender();
  }

  //**********************************************************/
  const onModifyTransfer = async (e) => {

    if (e.addNew || e.save) {
      // get only the related services data
      const activityData = await getActivityData(props.quotations_id,3);
      // add only the accommodation data
      compVar.activityData = {...compVar.activityData, servicesData: activityData.servicesData};

      compVar.displayActivityDetailsPopup = false;
      compVar.displayActivityDetails = true;
    }

    if (e.addNew) {
      await refreshData();      
    } else if (e.save) {
      forceRender();
    }

  }

  //**********************************************************/
  // This function will be called whenever a new div is rendered
  const handleDivRef = (ref, index) => {
    divItemRefs.current[index] = ref;
  };

  //**********************************************************/
  const scrollIntoView = async (e) => {

    const groupIdx = (e.itemIndex !== undefined) ? e.itemIndex.group : -1;

    // get idx from allData since mainData may be filtered by date    
    let idx = compVar.allData.findIndex(rec => rec.activityDateDMY === e.itemData);

    // ScrollIntoView is triggered in 2 different ways. If by clicking left panel dates, then ...
    if (groupIdx > -1 && groupIdx < compVar.groupedData.length) {
      const cities_id = compVar.groupedData[groupIdx].cities_id;
      const idx2 = compVar.allData.findIndex(rec => rec.activityDateDMY === e.itemData && rec.cities_id === cities_id);      
      idx = (idx2 > -1) ? idx2 : idx;
    }

    // If Day to Day Switch ON
    if (compVar.dayByDaySwitchValue) {
      if (idx > -1) {
        compVar.activeKey = compVar.allData[idx].key;
        compVar.activeDate = e.itemData;
        dayByDayToggle();
      }
    } else {

      // This is done in a 2 step manner as otherwise it goes to a rec ...
      // ... and the rec sits at the bottom where the subsequent records are ...
      // ... not visible. But whilst scrolling backwards to the top, ...
      // ... the top record sits at the top of the grid and all the subsequent ...
      // ... records are visible. Hence this is done in 2 steps. 

      // scroll to last record
      let focusDiv = divItemRefs.current[compVar.mainData.length-1];
      scrollViewRef.current.instance.scrollToElement(focusDiv, { block: 'start', behavior: 'smooth' });    

      // scroll to record as per idx
      focusDiv = divItemRefs.current[idx];
      scrollViewRef.current.instance.scrollToElement(focusDiv, { block: 'start', behavior: 'smooth' });    

      compVar.activeDate = e.itemData;
      compVar.activeKey = compVar.mainData[idx].key;
      forceRender();
    }
  }

  //**********************************************************/
  const headerContainerJsx = () => {

    return (
      <>
        <div className='presto-list-header-container'>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', fontSize: 16}}>                        
            {switchJsx(0)}
            <div style={{paddingLeft: 20}}>
              {buttonsJsx(0)}
              {buttonsJsx(1)}
            </div>
          </div>
          <div style={{display: 'flex', flex: 2, justifyContent: 'center', alignItems: 'center', fontSize: 16}}>                        
            {buttonsJsx(2)}
            {buttonsJsx(3)}
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', fontSize: 16}}>
            {switchJsx(1)}
          </div>
        </div>

      </>
    )

  }

  //**********************************************************/
  const activityDetailsJsx = (rec) => {

    let idx = -1;
    if (compVar.displayActivityDetailsPopup) {
      if (rec.quoCities2_id !== null) {
        idx = compVar.mainData.findIndex(elem => elem.cities_id === rec.cities_id && elem.activityDateDMY === rec.activityDateDMY && elem.quoCities2_id === rec.quoCities2_id);
      } else {
        idx = compVar.mainData.findIndex(elem => elem.cities_id === rec.cities_id && elem.activityDateDMY === rec.activityDateDMY && elem.quoCities_id !== null);
      }
    }

    let quoCities_id = (idx > -1) ? compVar.mainData[idx].quoCities_id : rec.quoCities_id;        
    // If clicked from title -- grab quoCities2_id as quoCities_id may not be populated
    quoCities_id = (quoCities_id === null) ? rec.quoCities2_id : quoCities_id;
    
    const quoAccommodation_id = (compVar.displayActivityDetailsPopup) ? null : rec.quoAccommodation_id;
    const accFormType = (compVar.displayActivityDetailsPopup) ? 2 : 1;

    const quoServices_id = (compVar.displayActivityDetailsPopup) ? null : rec.quoServices_id;
    const serviceFormType = (compVar.displayActivityDetailsPopup) ? 2 : 1;

    if (compVar.activityType === 1) {
      return (
        <PrestoTravel
          quotations_id={props.quotations_id}
          quoCities_id = {rec.quoCities_id}
          quoTickets_id = {rec.quoTickets_id}
          cities_id={rec.cities_id}
          activityDate={rec.activityDateDMY}
          city={rec.city}
          formMode={1}
          activityDescription={rec.description}
          onAddTravel={onModifyTravel}
        />
      )
    } else if (compVar.activityType === 2) {
      return (
        <PrestoAccommodation
          quotations_id={props.quotations_id}
          quoCities_id = {quoCities_id}
          quoAccommodation_id = {quoAccommodation_id}
          cities_id={rec.cities_id}
          activityDate={rec.activityDateDMY}
          city={rec.city}
          accommodationFormType={accFormType}
          onAddAccommodation={onModifyAccommodation}
        />
      )
    } else if (compVar.activityType === 3) {
      return (
        <PrestoSightseeing
          quotations_id={props.quotations_id}
          quoCities_id = {quoCities_id}
          quoServices_id = {quoServices_id}
          cities_id={rec.cities_id}
          activityDate={rec.activityDateDMY}
          city={rec.city}
          sightseeingFormType={serviceFormType}              
          onAddSightseeing={onModifySightseeing}
        />
      )
    } else if (compVar.activityType === 4) {
      return (
        <PrestoTransfer
          quotations_id={props.quotations_id}
          quoCities_id = {quoCities_id}                          
          quoServices_id = {quoServices_id}
          cities_id={rec.cities_id}
          activityDate={rec.activityDateDMY}
          city={rec.city}
          transferFormType={serviceFormType}      
          onAddTransfer={onModifyTransfer}
        />
      )
    } else {
      return (<></>)
    }      
  }

  //**********************************************************/
  const listJsx = () => {

    const jsxElements = compVar.mainData.map((item,index) => (
      listIemsJsx(item,index)
    ));        

    return (
      <div className='presto-list-inner-container' style={{width: '100%'/*, paddingRight: 2*/}}>
        <ScrollView ref={scrollViewRef} width='100%' height='100%' useNative={false}>
          {jsxElements}
        </ScrollView>
      </div>
    )

  }

  //**********************************************************/
  const listIemsJsx = (rec,index) => {

    const styles = [
      {display: 'flex', flex: 2, height: '100%', justifyContent: 'center', alignItems: 'center', fontSize: 18},
      {display: 'flex', flex: 10, height: '100%'},
      {display: 'flex', flex: 1.5, height: '100%'},
      {display: 'flex', flex: 0.5, height: '100%'},
      {display: 'flex', flex: 0.2, height: '100%'}
    ];    

    // Check all warnings & errors
    const hasWarnings = rec.ErrorList.filter(elem => elem.errorType === 1).length > 0;
    const hasErrors = rec.ErrorList.filter(elem => elem.errorType === 2).length > 0;

    // Blue border for warning, red border for errors
    // A default white border is given as the car color strips move a little to the right when a border is applied
    let border = (hasWarnings) ? '1px dashed rgba(0, 0, 255, .8)' : '1px solid rgba(255, 255, 255, .9)';
    border = (hasErrors) ? '1px solid rgba(255, 0, 0, .9)' : border;    
    
    // Title divs '... Day starts in ...'
    if (rec.activityType === 0) {

      // Different color for 'Day Starts in ...' / 'Clients arrive by ...'
      let background = (rec.activitySubtype === 1) ? 'rgb(204, 242, 255)' : 'rgb(230, 238, 255)';      
      let titleColor = null;

      // Day Excursion
      if (rec.activitySubtype === 1 && rec.description !== null && rec.description.includes('Day Excursion')) {
        background = '#ecc6d9';
      }
      // Pax Change
      if (rec.activitySubtype === 3) {
        background = '#ffe6cc';
        titleColor = '#ac00e6';
      }

      return (
        <div key={rec.key+"_outer"} style={{display: 'flex', flexDirection: 'column'}}>

        <div key={rec.key} ref={(ref) => handleDivRef(ref,index)} className='presto-list-item-outer-container' style={{background: background, flexDirection: 'row', minHeight: 40}} onClick={() => onSelectItem(rec)}>        
            <div style={{...styles[0]}}>
              {rec.activitySubtype !== 3 &&
                <>
                  {dropDownButtonJsx(0)}
                  {dropDownButtonJsx(1)}
                </>
              }
            </div>
          <div style={{...styles[1], fontSize: 18, fontWeight: 600, alignItems: 'center', color: titleColor}}>
            {activityDayTitleJsx(rec, styles)}
          </div>
          <div style={styles[2]}>
          </div>
          <div style={{...styles[3], display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          </div>
          <div style={styles[4]}>
          </div>
        </div>
        {compVar.displayActivityDetailsPopup && compVar.activeKey === rec.key &&
          activityDetailsJsx(rec)
        }
        </div>
      )      
    }

    // Description as an object of lines
    const description = getActivityDescription(rec, compVar.activityData);

    // Change background of selected div (active activity)
    let background = (rec.key === compVar.activeKey) ? ACTIVE_ACT_COLOR : WHITE_BACKGROUND;
    
    // Other activity divs
    return (
      <div key={rec.key+"_outer"} style={{display: 'flex', flexDirection: 'column'}}>
        <div key={rec.key} ref={(ref) => handleDivRef(ref,index)} className='presto-list-item-outer-container' style={{background: background, display: 'flex', flexDirection: 'row', alignItems: 'stretch', border: border, minHeight: 40}} onClick={() => onSelectItem(rec)}>
          <div style={styles[0]}>
            {activityTiming(rec)}
          </div>
          <div style={{...styles[1], color: 'rgb(0, 0, 0)', fontSize: 18, flexDirection: 'column', justifyContent: 'center'}}>
            {activityDescriptionJsx(rec, description, styles)}
            {rec.ErrorList.length > 0 &&
              activityErrorJsx(rec)
            }
            {compVar.voucherDescSwitchValue && rec.voucherDescription !== null && rec.voucherDescription.length > 0 &&
              activityVoucherDescriptionJsx(rec)
            }
          </div>
          <div style={{...styles[2], alignItems: 'stretch', height: null}}>
            {activityCarJourneyJsx(rec)}
          </div>
          <div style={{...styles[3], display: 'flex', justifyContent: 'center', alignItems: 'stretch', height: null}}>
            {activityEditButtonJsx(rec)}
          </div>
          <div style={styles[4]}>
          </div>
        </div>
        {compVar.displayActivityDetails && compVar.activeKey === rec.key &&
          activityDetailsJsx(rec)
        }
      </div>
    )

  }

  //**********************************************************/
  const activityEditButtonJsx = (rec) => {

    // Button not visible for titles, 'Day at Leisure', Client Arrival/Departure
    const dormantActivityTypes = [100,0,20];

    // Also don't show if the voucher description switch is ON
    return (
      <>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {rec.key === compVar.activeKey && !dormantActivityTypes.includes(rec.activityType) &&
            !compVar.voucherDescSwitchValue &&
            buttonsJsx(4)
          }
        </div>
      </>
    )
  }

  //**********************************************************/
  const ToastJsx = () => {

    return (
      <>
        <div style={toastContainerStyle}>
          <Toast
            visible={compVar.toastIsVisible}
            message={compVar.toastMessage}
            type={compVar.toastMessageType}
            onHiding={onToastHiding}
            displayTime={3000}
            maxWidth={300}
            position={'center'}
          />
        </div>
      </>
      )
    
  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = [null,null];
    const icons = ['add','info']
    //const widths = [35,35];
    const dropDownOptions = [{width: 200},{width: 200}];
    const items = [compVar.addData,compVar.addHotelSightseeing];
    const onItemClicks = [null,onDropDownMenuSelect/*onAddActivityClick,onAddActivityClick*/];

    const text = texts[index];
    const icon = icons[index];
    //const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        //width={width}
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

    const dayByDay = (compVar.dayByDaySwitchValue !== undefined && compVar.dayByDaySwitchValue !== null) ? compVar.dayByDaySwitchValue : false;
    const voucherDesc = (compVar.voucherDescSwitchValue !== undefined && compVar.voucherDescSwitchValue !== null) ? compVar.voucherDescSwitchValue : false;

    const labels = ['Day by Day','Voucher Description'];
    const heights = [20,20];
    const widths = [40,40];
    const onSwitchChanges = [dayByDaySwitchValueChanged, voucherDescSwitchValueChanged];
    const onChecks = [ dayByDay, voucherDesc];

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
  const buttonsJsx = (index) => {

    const navButtonsVisible = (compVar.dayByDaySwitchValue);
    const moreLessIcon = (compVar.displayActivityDetails) ? 'chevronup' : 'chevrondown';

    const widths = [35,35,35,35,35];
    const heights = [35,35,35,35,35];
    const types = ['normal','normal','normal','normal','normal'];
    const stylingModes = ['outlined','outlined','outlined','outlined','outlined'];
    const icons = ['chevronleft','chevronright','refresh','icons/create.png', moreLessIcon];
    const hints = ['Previous Day', 'Next Day', 'Refresh Data', 'Auto fill Acc/SS/Trsf', 'Activity Details'];
    const clicks = [previousDay, nextDay, refreshData, autoFillActivities, toggleActivityDetails];
    const btnVisibles = [navButtonsVisible, navButtonsVisible, true, true, true];

    const width = widths[index];
    const height = heights[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];
    const btnVisible = btnVisibles[index];

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
        visible={btnVisible}
      />
    );
  }


  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    setPopupDialogBoxVisible(false);

    /*=== Delete option chosen - 1, Cancel option chosen - 0 ===*/
    if (e===1) {
      setDataFetched(false);
      setDataFetched(true);        
    }

    // reset delete helpers
    compVar.dialogMessage1 = '';
    compVar.popupDialogIndex = 0;
    compVar.deletedId = -1;  

  }
    
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight - 50;
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          {(!initDataFetched || !dataFetched) &&
            <div className="master-grid-container" style={{height: containerHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {initDataFetched && dataFetched &&
            <div className="master-grid-content-box" style={{flexDirection: 'row', height: containerHeight}}>
              <div className='presto-list-outer-container' style={{flex: 1, height: '100%'}}>
                <List
                  dataSource={compVar.groupedData}
                  keyExpr="key"
                  onItemClick={scrollIntoView}
                  grouped={true}
                  collapsibleGroups={true}
                />
              </div>
              <div className='presto-list-outer-container' style={{flex: 0.05}}>
              </div>
              <div className='presto-list-outer-container' style={{flex: 7}}>
                {headerContainerJsx()}
                {listJsx()}
              </div>
              <div className='presto-list-outer-container' style={{flex: 0.05}}>
              </div>
            </div>
          }

          {compVar.displayHotelList && compVar.activeCities_id !== null &&
           compVar.activeDate !== null &&
            <div style={{height: 200}}>
              <PrestoCityHotelList
                cities_id={compVar.activeCities_id}
                dateIn={compVar.activeDate}
                open={true}
                getSelectedHotel={getSelectedHotelFromList}
                hotelCategory={compVar.hotelCategory}
              />
            </div>
          }

          {compVar.displaySightseeingList && compVar.activeCities_id !== null &&
           compVar.activeDate !== null &&
            <div style={{height: 200}}>
              <PrestoCitySightseeingList
                cities_id={compVar.activeCities_id}
                serviceDate={compVar.activeDate}
                open={true}
                getSelectedService={getSelectedSightseeingFromList}
              />
            </div>
          }

          {ToastJsx()}

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

export default PrestoDtd;
