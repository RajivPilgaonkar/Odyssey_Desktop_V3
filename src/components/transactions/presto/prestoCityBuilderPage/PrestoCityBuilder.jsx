import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions/index';
import { convertDMYtoDate, convert_DbDate_To_DMY, addDay, dateDiff, dateDiff_DMY, convert_DbDate_To_DMY_day, convertDMY_toDate, deepClone } from "../../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import List, { ItemDragging } from 'devextreme-react/list';
import ScrollView from 'devextreme-react/scroll-view';
import {setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation, getCityName} from "../../../common/GetDescFromIds";
import {getArrivalDepartureString, getTourEndTime} from "../../../common/PrestoHelpers";
import PopupDialogBox from '../../../common/PopupDialogBox';

import '../../../common/MasterGrid.css'
import './PrestoCityBuilder.css';
import '../../../common/ButtonsPanel.css';

const GREY_BACKGROUND = '#f5f5f0';
const HEADER_FONT_COLOR = '#454545';
const CITY_LIST_BACKGROUND = '#e6f2f5';

let compVar = {};

function PrestoCityBuilder(props) {

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
      suggestedCities: [], cities: [],
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      admLevel: 1,
      activeCities_id: -1, activeQuoCities_id: -1,  
      modeChangeDate: false, moveOffset: 0, 
      startDate: props.tourDate,
      arrivalString: '', departureString: '',
      deletedId: -1,
      dayDiff: 0, dayDiffStr: '',
      isDataModified: false, isExecutingSp: false, isDataSaved: false,
      isDateChanged: false,
      listRef: React.createRef(), listHeight: 500,
      columnsArr: 
        [
          {label: '', field: 'Delete', flex: 0.35, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false, onlyHeader: true},
          {label: 'Day', field: 'DayNo', flex: 1, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false, onlyHeader: false},
          {label: 'Date', field: 'DateIn', flex: 3, justifyContent: 'flex-start', alignItems: 'center', format: 'DD/MM/YY, ddd', specialCell: false, onlyHeader: false},
          {label: 'City', field: 'City', flex: 3, justifyContent: 'flex-start', alignItems: 'center', format: '', specialCell: false, onlyHeader: false},
          {label: 'Nights', field: 'Nights', flex: 1, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false, onlyHeader: false},
          {label: '', field: 'IncDecButtons', flex: 2, justifyContent: 'center', alignItems: 'center', format: '', specialCell: true, onlyHeader: false},
          {label: '', field: 'Reorder', flex: 0.39, justifyContent: 'center', alignItems: 'center', format: '', specialCell: false, onlyHeader: true},
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

      const arrDepObj = await getArrivalDepartureString(props.quotations_id);
      compVar.arrivalString = arrDepObj.arrivalString;
      compVar.departureString = arrDepObj.departureString;

      await getSuggestedCities(compVar.activeQuoCities_id);
      await getCities();

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    try {
      compVar.mainData = deepClone(props.data);      
      // or you could do this
      //compVar.mainData = props.data.map(rec => {return {...rec}});

      if (compVar.mainData.length === 0) {
        await insertFirstDefaultCity();
      }            

      await compareWithDepartureDate();
  
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
  const getSuggestedCities = async (quoCities_id) => {

    const idx = compVar.mainData.findIndex(rec => rec.QuoCities_id === quoCities_id);

    const cities_id = (idx >= 0) ? compVar.mainData[idx].ToCities_id : -1;

    const citiesQry = "SELECT TOP 8 c.City, qt.To_Cities_id, COALESCE(c.DefaultDays,1) AS DefaultDays, " + 
      "c.City + ' (' + CAST(COALESCE(c.DefaultDays,1) AS VARCHAR(3)) + ')' AS City2, " +
      "COUNT(*) AS Freq " +
      "FROM QuoTickets qt " +
      "LEFT JOIN cities c ON qt.To_Cities_id = c.cities_id " +
      "WHERE qt.From_Cities_id = " + cities_id.toString() + " " +
      "AND DATEDIFF(year, qt.TravelDate, GETDATE()) < 5 " +
      "GROUP BY c.City, qt.To_Cities_id, c.DefaultDays, " +
      "c.City + ' (' + CAST(COALESCE(c.DefaultDays,1) AS VARCHAR(3)) + ')' " +
      "ORDER BY 5 DESC";      
    
    compVar.suggestedCities = await dbGetRecordRaw({query: citiesQry });    

  }

  //**********************************************************/
  const getCities = async () => {

    const citiesQry = "SELECT Cities_id, City, City + ' (' + LTRIM(RTRIM(CAST(COALESCE(DefaultDays,0) AS VARCHAR(2)))) + ') ' AS City2, DefaultDays " +
      "FROM Cities c " +
      "WHERE COALESCE(DefaultDays,0) >= 0 " + 
      "AND COALESCE(NightHalt,0) = 1 " + 
      "AND LTRIM(RTRIM(COALESCE(City,''))) > '' " +
      "AND City NOT LIKE '%**%' " +
      "ORDER BY City";
    
    compVar.cities = await dbGetRecordRaw({query: citiesQry });    

  }


  //**********************************************************/
  const insertFirstDefaultCity = async () => {

    let quoCities_id = -1;
    let citiesObj = await getCityName(props.startCities_id);

    const newCity = {QuoCities_id: quoCities_id, City: citiesObj.City, ToCities_id: props.startCities_id, Nights: citiesObj.Nights, MinETD: null, MaxETA: null};
    compVar.mainData.splice(0,0,newCity);
    await resetDates();
    compVar.activeCities_id = props.startCities_id;
    compVar.activeQuoCities_id = quoCities_id;

  }

  //**********************************************************/
  const resetDates = async () => {

    let dayNo = 1;

    for (const rec of compVar.mainData) {
      rec.DayNo = dayNo;
      const addDays = dayNo-1;
      rec.DateIn = addDay(props.tourDate, addDays, 1);
      dayNo += rec.Nights;
      if (rec.MinETD !== undefined && rec.MaxETA !== undefined && rec.MinETD !== null && rec.MaxETA !== null) {
        const eta = new Date(rec.MaxETA.substring(0,10));
        const etd = new Date(rec.MinETD.substring(0,10));
        const overnight = dateDiff(eta, etd, 'days');
        dayNo += overnight;
        //if (overnight !== 0) {
        //  rec.DateIn = addDay(props.tourDate, addDays+overnight, 1);
        //}
      } 
    }

    await compareWithDepartureDate();
      
    compVar.isDataModified = true;
    //await onModifyData();

  }

  //**********************************************************/
  const compareWithDepartureDate = async () => {

    let dateIn = convertDMY_toDate(props.tourDate);
    let nights = 0;  

    if (compVar.mainData.length > 0) {
      dateIn = compVar.mainData[compVar.mainData.length-1].DateIn;
      nights = compVar.mainData[compVar.mainData.length-1].Nights;  
    } 

    const maxDateIn = addDay(convert_DbDate_To_DMY(dateIn,1), nights, 1);

    compVar.dayDiff = 0;
    compVar.dayDiffStr = '';
    if (compVar.mainData.length > 0) {
      let dateOut = await getTourEndTime(props.quotations_id);      
      // get dateOut in the same format as maxDateIn, so they are compatible in the dateDiff
      dateOut = addDay(convert_DbDate_To_DMY(dateOut,1), 0, 1);
      compVar.dayDiff = dateDiff(maxDateIn, dateOut, 'days');
    }

    if (compVar.dayDiff !== 0) {
      compVar.dayDiffStr = (compVar.dayDiff > 0) ? 'Exceeded by ' + compVar.dayDiff.toString() + ' day' + ((compVar.dayDiff > 1) ? 's' : '') :
        Math.abs(compVar.dayDiff).toString() + ' day' + ((compVar.dayDiff < -1) ? 's' : '') + ' to go';
    }

  }

  //**********************************************************/
  const onHiding = async () => {

    const refresh = (compVar.isDataSaved) ? true : false;
    const isDateChanged = (compVar.isDateChanged) ? true : false;

    if (props.onHiding !== undefined) {
      await props.onHiding({refresh: refresh, dateChanged: isDateChanged});
    }
  }

  //**********************************************************/
  const onChangeDateClicked = async () => {
    compVar.modeChangeDate = !compVar.modeChangeDate;
    forceRender();
  }

  //**********************************************************/
  const onStartDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.startDate = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const onMoveDates = async () => {

    compVar.isExecutingSp = true;
    forceRender();

    let sql = "EXEC [p_QuoResetItineraryDates] " + 
      props.quotations_id.toString() + ", " +
      compVar.moveOffset.toString();

    let spData = {sql: sql};
    await dbExecuteSp(spData);      

    /*=== Extra date panel that opens when moving dates ===*/
    compVar.modeChangeDate = false;

    compVar.isExecutingSp = false;
    compVar.isDataSaved = true;
    compVar.isDateChanged = true;
    forceRender();    

    // Hide form    
    await onHiding();

    
  }

  //**********************************************************/
  const insertCities = async () => {    

    let sql = "";
    let spData = {sql: ''};

    /*=== Step 1 - Delete existing records ===*/
    sql = "DELETE FROM QuoReorderCities " + 
          "WHERE Quotations_id = " + props.quotations_id.toString();
  
    spData = {sql: sql};
    await dbExecuteSp(spData);

    /*=== Step 2 - Insert new records ===*/      
    for (const rec of compVar.mainData) {

      const nights = (rec.Nights !== null) ? rec.Nights : 0;

      sql = "INSERT INTO QuoReorderCities(Quotations_id," + 
        "QuoCities_id, Cities_id, Nights, DayNo)" + 
        "VALUES (" + props.quotations_id.toString() + "," +
        rec.QuoCities_id.toString() + "," + 
        rec.ToCities_id.toString() + "," + 
        nights.toString() + "," + 
        rec.DayNo.toString() + ")";
  
      spData = {sql: sql};
      await dbExecuteSp(spData);
  
    }    

  }

  //**********************************************************/
  const saveCityOrder= async () => {    

    compVar.isExecutingSp = true;
    forceRender();

    /*=== Insert cities to tmp table ===*/
    await insertCities();

    /*=== Rearrange city list ===*/
    const sql = "EXEC p_QuoRearrangeCities " + props.quotations_id.toString();
    const spData = {sql: sql};
    await dbExecuteSp(spData);        

    compVar.isExecutingSp = false;
    compVar.isDataSaved = true;
    forceRender();

    // Hide form
    await onHiding();

  };   


  //**********************************************************/
  const increaseNights = async () => {
    const idx = compVar.mainData.findIndex(rec => rec.QuoCities_id === compVar.activeQuoCities_id);
    if (idx > -1) {
      compVar.mainData[idx].Nights++;
      await resetDates();
      forceRender();

      // scroll to record
      compVar.listRef.current.instance.scrollToItem(idx);

    }
  }

  //**********************************************************/
  const decreaseNights = async () => {
    const idx = compVar.mainData.findIndex(rec => rec.QuoCities_id === compVar.activeQuoCities_id);
    if (idx > -1 && compVar.mainData[idx].Nights > 0) {
      compVar.mainData[idx].Nights--;
      await resetDates();
      forceRender();

      // scroll to record
      compVar.listRef.current.instance.scrollToItem(idx);

    }
  }

  //**********************************************************/
  const selectSuggestedCity = async () => {

    const idx = compVar.suggestedCities.findIndex(rec => rec.To_Cities_id === compVar.activeCities_id);

    if (idx > -1) {
      const idx2 = compVar.mainData.findIndex(rec => rec.ToCities_id === compVar.activeCities_id);    
      const nights = (idx2 > -1) ? 1 : compVar.suggestedCities[idx].DefaultDays;

      let idx3 = compVar.mainData.findIndex(rec => rec.QuoCities_id === compVar.activeQuoCities_id);

      //=== For added cities put QuoCities_id as a negative number ===*/
      /*=== Spread operator used to convert from array to list ===*/
      let minQuoCities_id = Math.min(...compVar.mainData.map(rec => rec.QuoCities_id));
      minQuoCities_id = (minQuoCities_id > 0) ? -1 : minQuoCities_id-1;

      const newCity = {QuoCities_id: minQuoCities_id, City: compVar.suggestedCities[idx].City, ToCities_id: compVar.suggestedCities[idx].To_Cities_id, Nights: nights};
      compVar.mainData.splice(idx3+1,0,newCity);
      // Just to force the render to display new data ... since array is a reference and it is considered as unchanged
      compVar.mainData = [...compVar.mainData];
      await resetDates();

      compVar.activeCities_id = compVar.suggestedCities[idx].To_Cities_id;
      compVar.activeQuoCities_id = minQuoCities_id;
      forceRender();

      const idx4 = compVar.mainData.findIndex(rec => rec.QuoCities_id === compVar.activeQuoCities_id);
      if (idx4 !== -1) {
        // scroll to record
        compVar.listRef.current.instance.scrollToItem(idx4);
      }

      // Simulate click on City
      const obj = {itemData: {}};
      obj.itemData.QuoCities_id = compVar.activeQuoCities_id;
      await onSelectItem(obj);

      await compareWithDepartureDate();

    }

  }

  //**********************************************************/
  const selectCity = async () => {

    const idx = compVar.cities.findIndex(rec => rec.Cities_id === compVar.activeCities_id);

    if (idx > -1) {
      const idx2 = compVar.mainData.findIndex(rec => rec.ToCities_id === compVar.activeCities_id);    
      const nights = (idx2 > -1) ? 1 : compVar.cities[idx].DefaultDays;

      let idx3 = compVar.mainData.findIndex(rec => rec.QuoCities_id === compVar.activeQuoCities_id);

      //=== For added cities put QuoCities_id as a negative number ===*/
      /*=== Spread operator used to convert from array to list ===*/
      let minQuoCities_id = Math.min(...compVar.mainData.map(rec => rec.QuoCities_id));
      minQuoCities_id = (minQuoCities_id > 0) ? -1 : minQuoCities_id-1;

      const newCity = {QuoCities_id: minQuoCities_id, City: compVar.cities[idx].City, ToCities_id: compVar.cities[idx].Cities_id, Nights: nights};
      compVar.mainData.splice(idx3+1,0,newCity);
      // Just to force the render to display new data ... since array is a reference and it is considered as unchanged
      compVar.mainData = [...compVar.mainData];
      await resetDates();

      compVar.activeCities_id = compVar.cities[idx].Cities_id;
      compVar.activeQuoCities_id = minQuoCities_id;
      forceRender();

      const idx4 = compVar.mainData.findIndex(rec => rec.QuoCities_id === compVar.activeQuoCities_id);
      if (idx4 !== -1) {
        // scroll to record
        compVar.listRef.current.instance.scrollToItem(idx4);
      }

      // Simulate click on City
      const obj = {itemData: {}};
      obj.itemData.QuoCities_id = compVar.activeQuoCities_id;
      await onSelectItem(obj);

      await compareWithDepartureDate();

    }

  }
  
  //**********************************************************/
  const onSelectItem = async (e) => {
    /*=== On clicking an item in the list, set the activeQuoCities_id ===*/
    compVar.activeQuoCities_id = e.itemData.QuoCities_id;    
    await getSuggestedCities(compVar.activeQuoCities_id);
    forceRender();
  }

  //**********************************************************/
  const onSelectSuggestedCity = (e) => {
    /*=== On clicking an item in the list, set the activeCities_id ===*/
    compVar.activeCities_id = e.itemData.To_Cities_id;    
    forceRender();
  }

  //**********************************************************/
  const onSelectCity = (e) => {
    /*=== On clicking an item in the list, set the activeCities_id ===*/
    compVar.activeCities_id = e.itemData.Cities_id;    
    forceRender();
  }

  //**********************************************************/
  const onItemReordered = async (e) => {
    compVar.mainData.splice(e.fromIndex,1);
    compVar.mainData.splice(e.toIndex,0,e.itemData);
    await resetDates();
    forceRender();
  }  

  //**********************************************************/
  const onItemDeleted = async (e) => {
    //compVar.mainData.splice(e.itemIndex,1);
    await resetDates();
    forceRender();
  }

  //**********************************************************/
  const allHeadersJsx = () => {

    return(
      <div className='presto-cb-list-header-container'>
        <div style={{display: 'flex', flex: 0.50}}>
          {suggestedCitiesHeaderJsx(0)}
        </div>
        <div style={{display: 'flex', flex: 2}}>
          {listHeaderJsx()}            
        </div>
        <div style={{display: 'flex', flex: 0.50}}>
          {suggestedCitiesHeaderJsx(1)}
        </div>
      </div>

    )
  }

  //**********************************************************/
  const allListsJsx = () => {

    return(
      <div className='presto-cb-list-outer-container' style={{flexDirection: 'row', alignItems: 'flex-start'}}>

        <div style={{display: 'flex', flex: 0.50, justifyContent: 'center', alignItems: 'flex-start', height: '100%', background: CITY_LIST_BACKGROUND}}>
          {listsJsx(1)}
        </div>

        <div style={{display: 'flex', flex: 2, justifyContent: 'center', alignItems: 'center'}}>
          {listsJsx(0)}
        </div>

        <div style={{display: 'flex', flex: 0.50, justifyContent: 'center', alignItems: 'flex-start', height: '100%', background: CITY_LIST_BACKGROUND}}>
          {listsJsx(2)}
        </div>

      </div>
    )
  }


  //**********************************************************/
  const suggestedCitiesHeaderJsx = (index) => {

    const caption = (index === 0) ? 'Suggested Cities' : 'All Cities';

    const borderTop = '1px solid ' + HEADER_FONT_COLOR;
    const borderBottom = '1px solid ' + HEADER_FONT_COLOR;

    return (
      <div className='presto-cb-list-header-container'>
        <div style={{display: 'flex', flex: 1, fontFamily: 'Lato', fontSize: 16, fontWeight: 700, justifyContent: 'center', alignItems: 'center', color: HEADER_FONT_COLOR, borderTop: borderTop, borderBottom: borderBottom, background: CITY_LIST_BACKGROUND}}>
          {caption}
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
      <div style={{display: 'flex', height: 40, width: '100%', borderTop: borderTop, borderBottom: borderBottom, background: GREY_BACKGROUND}}>
        {jsxElements}
      </div>
    )

  }

  //**********************************************************/
  const listItemsJsx = (rec) => {

    let columnsArr = compVar.columnsArr.filter(e => e.onlyHeader === false);
    columnsArr = columnsArr.map(obj => ({ ...obj, color: '#000000', id: null }));
    
    const jsxElements = columnsArr.map((item, index) => (
      <div id={item.id} key={index} className='presto-cb-list-item' style={{flex: item.flex, justifyContent: item.justifyContent, alignItems: item.alignItems, fontSize: 16, padding: 0}} >
        {item.format === 'DD/MM/YY, ddd' &&
          convert_DbDate_To_DMY_day(rec[item.field],1)
        }
        {item.format !== 'DD/MM/YY, ddd' && !item.specialCell && 
          rec[item.field]
        } 
        {item.specialCell && item.field === 'IncDecButtons' && rec.QuoCities_id === compVar.activeQuoCities_id &&
          <>
            {buttonsJsx(3)}
            {buttonsJsx(4)}
          </>
        }
      </div>

    )); 
    
    return (
        <div className='presto-cb-list-item-outer-container'>        
          <div className='presto-cb-list-item-container'>
            {jsxElements}
          </div>
        </div>
    )

  }

  //**********************************************************/
  const suggestedItemsJsx = (rec) => {

    const jsxElements =       
      <div style={{display: 'flex', flexDirection: 'row', width: '100%', height: 20, fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>
        <div style={{display: 'flex', flex: 3, justifyContent: 'center', alignItems: 'center' }}>
          {rec.City2} 
        </div>
        <div style={{display: 'flex', flex: 1, fontSize: 16, justifyContent: 'center', alignItems: 'center'}}>
          {compVar.activeCities_id === rec.To_Cities_id &&
            buttonsJsx(5)
          }
        </div>
      </div>

    return (
      <>
        <div className='presto-cb-list-item-outer-container'>        
          <div className='presto-cb-list-item-container'>
            {jsxElements}
          </div>
        </div>
      </>

    )    
  }

  
  //**********************************************************/
  const cityItemsJsx = (rec) => {

    const jsxElements =       
      <div style={{display: 'flex', flexDirection: 'row', width: '100%', height: 20, fontSize: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 0}}>
        <div style={{display: 'flex', flex: 3, justifyContent: 'center', alignItems: 'center' }}>
          {rec.City2} 
        </div>
        <div style={{display: 'flex', flex: 1, fontSize: 16, justifyContent: 'center', alignItems: 'center'}}>
          {compVar.activeCities_id === rec.Cities_id &&
            buttonsJsx(6)
          }
        </div>
      </div>

    return (
      <>
        <div className='presto-cb-list-item-outer-container'>        
          <div className='presto-cb-list-item-container'>
            {jsxElements}
          </div>
        </div>
      </>

    )    
  }

  //**********************************************************/
  const topPanelJsx = () => {

    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>

          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
            {buttonsJsx(0)}
          </div>
          <div style={{display: 'flex', flex: 4, fontSize: 16, color: 'blue', justifyContent: 'center', alignItems: 'center'}}>
            {compVar.arrivalString !== undefined &&
              compVar.arrivalString
            }
          </div>
          <div style={{display: 'flex', flex: 4, fontSize: 16, color: 'blue', justifyContent: 'center', alignItems: 'center'}}>
            {compVar.departureString !== undefined &&
              compVar.departureString
            }
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
            {buttonsJsx(1)}
          </div>

        </div>

      </>
    )

  }

  //**********************************************************/
  const moveDatesPanelJsx = () => {

    const dateDiff = dateDiff_DMY (compVar.startDate, props.tourDate,  'days');
    let diffStr = '';
    diffStr = (dateDiff !== 0) ? 'Move by ' + dateDiff.toString() + ' day' : '';
    diffStr += (Math.abs(dateDiff) > 1) ? 's' : '';

    compVar.moveOffset = dateDiff;

    return (
      <>
        <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>

          <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {dateParamsJsx(0)}
          </div>
          <div style={{display: 'flex', flex: 1, fontSize: 16, color: (dateDiff < 0) ? 'red' : 'blue', justifyContent: 'center', alignItems: 'center'}}>
            {diffStr}
          </div>
          <div style={{display: 'flex', flex: 1, fontSize: 16, color: 'blue', justifyContent: 'center', alignItems: 'center'}}>
            {compVar.moveOffset !== 0 && !compVar.isExecutingSp &&
              buttonsJsx(2)
            }
          </div>
          {compVar.isExecutingSp &&
            <div style={{height: 60, display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <LoadIndicator id="small-indicator" height={30} width={30} />
            </div>
          }

        </div>

      </>
    )

  }

  //**********************************************************/
  const listsJsx = (index) => {

    const borders = ['1px solid #e6e6e6', null,null];
    const heights = [compVar.listHeight, null,null];
    const maxHeights = [compVar.listHeight, compVar.listHeight, compVar.listHeight];
    const dataSources = [compVar.mainData, compVar.suggestedCities, compVar.cities];
    const keyExprs = ['QuoCities_id', 'Cities_id', 'Cities_id'];
    const itemRenders = [listItemsJsx, suggestedItemsJsx, cityItemsJsx];
    const onItemClicks = [onSelectItem, onSelectSuggestedCity, onSelectCity];
    const allowDeletings = [true, false, false];
    const itemDeleteModes = ['toggle', null, null];
    const itemDeletes = [onItemDeleted,null,null];
    const refs = [compVar.listRef, null, null];
    const itemDraggings = [true, false, false];
    const searchExprs = [null, null, "City"];
    const searchEnableds = [null, null, true];

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
    const itemDragging = itemDraggings[index];
    const searchExpr = searchExprs[index];
    const searchEnabled = searchEnableds[index];

    return (

      <div className='presto-cb-list-inner-container' style={{border: border, height: height, maxHeight: maxHeight}}>
        <ScrollView width='100%' height='100%' useNative={false}>
          <List              
            dataSource={dataSource}    
            keyExpr={keyExpr}
            itemRender={itemRender}           
            focusStateEnabled={false}
            onItemClick={onItemClick}
            allowItemDeleting={allowDeleting}
            itemDeleteMode={itemDeleteMode}        
            onItemDeleted={itemDelete}
            onItemReordered={onItemReordered}
            searchExpr={searchExpr}
            searchEnabled={searchEnabled}              
            height={maxHeight}
            ref={ref}
          >
            {itemDragging &&
              <ItemDragging
                allowReordering={true}
              />
            }
          </List>
        </ScrollView>
      </div>
  
    )

  }

  //**********************************************************/
  const buttonsPanelJsx = () => {

    const dayDiffColor = (compVar.dayDiff > 0) ? 'red' : 'blue';

    return (
      <>
        <div className="buttons-panel-container" style={{paddingTop: 5}}>
          <div style={{display: 'flex', flex: 0.50}}>
          </div>
          <div style={{display: 'flex', flex: 2}}>
            {compVar.dayDiffStr !== undefined && compVar.dayDiffStr !== null && compVar.dayDiffStr.length > 0 &&
              <div className="buttons-container" style={{color: dayDiffColor, fontSize: 16, fontFamily: 'Lato'}}>
                {compVar.dayDiffStr}
              </div>
            }
            {
              <div className="buttons-container">
                {buttonsJsx(7)}
              </div>
            }
            {compVar.isExecutingSp &&
              <div className="buttons-container">
                <div style={{height: 60, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <LoadIndicator id="small-indicator" height={30} width={30} />
                </div>
              </div>
            }
            {compVar.isDataModified &&
              <div className="buttons-container">
                {buttonsJsx(8)}
              </div>
            }
          </div>
          <div style={{display: 'flex', flex: 0.50}}>
          </div>
        </div>
      </>
    )

  }



  //**********************************************************/
  const buttonsJsx = (index) => {

    const cancelText = compVar.isDataModified ? "Cancel Changes" : "Back";

    const disabledButtons = (compVar.isExecutingSp);

    const widths = [35,35,120,35,35,35,35,null,null];
    const heights = [35,35,35,35,35,35,35,null,null];
    const types = ['normal','normal','normal','normal','normal','normal','normal','default','success'];
    const stylingModes = ['outlined','outlined','outlined','outlined','outlined','outlined','outlined',null,null];
    const icons = ['chevronleft','icons/calendar.png',null,'chevronup','chevrondown','plus','plus',null,null];
    const hints = ['Go Back', 'Change the Start Date', 'Execute Move Dates','Increase Nights', 'Decrease Nights','Add City','Add City','Go Back without saving', 'Save this Itinerary'];
    const texts = [null, null, 'Move Dates',null,null,null,null,cancelText,'Save'];
    const clicks = [onHiding, onChangeDateClicked, onMoveDates, increaseNights, decreaseNights, selectSuggestedCity, selectCity, onHiding, saveCityOrder];
    const disabledArr = [false,false,false,false,false,false,false,disabledButtons,disabledButtons];

    const width = widths[index];
    const height = heights[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const text = texts[index];
    const click = clicks[index];
    const disabled = disabledArr[index];

    return (
      <Button
        width={width}
        height={height}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        hint={hint}
        text={text}
        onClick={click}
        disabled={disabled}
      />
    );
  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const startDate = convertDMYtoDate(compVar.startDate); 

    const labels = ['Reschedule Start Date to'];
    const dates = [startDate];
    const onValuesChanged = [onStartDateChanged];

    const label = labels[index];
    const type = "date";
    const width = 150;
    const displayFormat = "dd/MM/yyyy";
    const value = dates[index];
    const onValueChanged = onValuesChanged[index];
    
    return (
      <>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center', height: '100%'}}>
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
  const getPopupSelectedOption = async (e) => {

    setPopupDialogBoxVisible(false);

    /*=== Delete option chosen - 1, Cancel option chosen - 0 ===*/
    if (e===1) {
    }

    // reset delete helpers
    compVar.dialogMessage1 = '';
    compVar.popupDialogIndex = 0;
    compVar.deletedId = -1;  

  }  

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    const changeDatePanelHeight = (compVar.modeChangeDate) ? 35 : 0;
    compVar.listHeight = containerHeight - 35 - changeDatePanelHeight - 40 - 50;

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          <div className="master-detail-top-panel">
            <div className="master-detail-top-panel-button-container">
              {topPanelJsx()}
            </div>
          </div>

          {compVar.modeChangeDate &&
            <div className="master-detail-top-panel">
              <div className="master-detail-top-panel-button-container">
                {moveDatesPanelJsx()}
              </div>
            </div>
          }

          {dataFetched && initDataFetched && compVar.moveOffset === 0 &&
            <div className="master-grid-content-box">
              {allHeadersJsx()}
              {allListsJsx()}
              {buttonsPanelJsx()}
            </div>
          }

          {(!dataFetched || !initDataFetched) && compVar.moveOffset === 0 &&
            <div className="master-grid-container" style={{height: containerHeight-35}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
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

export default PrestoCityBuilder;
