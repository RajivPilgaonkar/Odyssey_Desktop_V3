import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dbGetRecord, dbGetRecordRaw, dbExecuteSp, setElementParamValues } from '../../../../actions';
import { convert_DbDate_To_DMY, convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { getViewContainerHeights } from "../../../common/MasterGridHelpers";
import Switch from "react-switch";
import DropDownGrid from "../../../common/DropDownGrid";
import DropDownButton from 'devextreme-react/drop-down-button';
import ElementImport from './ElementImport';
import PopupDialogBox from '../../../common/PopupDialogBox';
import { setupReport } from "./ReportSetup";
import ElementsAccommodation from '../elementsAccommodationPage/ElementsAccommodation';
import ElementsSightseeing from '../elementsSightseeingPage/ElementsSightseeing';
import ElementsTransfer from '../elementsTransferPage/ElementsTransfer';
import ElementsCarHire from '../elementsCarHirePage/ElementsCarHire';
import ElementsCarP2p from '../elementsCarP2pPage/ElementsCarP2p';
import ElementsCarCityGroups from '../elementsCityGroupsPage/ElementsCarCityGroups';
import ElementsCarExtraDay from '../elementsCarExtraDayPage/ElementsCarExtraDay';
import ElementsTrains from '../elementsTrainsPage/ElementsTrains';
//import { formHelp } from './Help';

import '../../../common/MasterGrid.css';
import './Elements.css';

let compVar = {};

function Elements() {

  const [renderToggle, setRenderToggle] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_wef = useSelector(state => state.elementParams.wef) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_elementType = useSelector(state => state.elementParams.elementType) || -1;
  let _g_elementLabel = useSelector(state => state.elementParams.elementLabel) || '';

  // use this to write to the redux store
  const dispatch = useDispatch();
  
  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      wef: _g_wef, elementType: _g_elementType, elementLabel: _g_elementLabel,
      reportType: 1, actionType: 1,
      wefLookup: [], dateRange: '',
      wefSwitchValue: false, quotedSwitchValue: false,
      openImports: false, 
      quoted: false, counter: 0, currencies_id: 27,
      exchRate: 1, 
      popupDialogIndex: 0, popupSelectedOptions: [deleteElementsProc],
      inEditMode: false, costApproved: false,
      reportsData: [
        {id: 1, type: 1, text: 'Elements (XLS)', reportName: 'Elements_'},
        {id: 2, type: 1, text: 'Riksja Costing Sheet (XLS)', reportName: 'CostingSheet_'},
      ],
      elementTypesData: [
        {id: 1, type: 1, text: 'Accommodation', sp: 'p_ElemInsertHotels_GST', dateField: 'FromDate', table: 'ElemAccommodation'},
        {id: 2, type: 2, text: 'Sightseeing', sp: 'p_ElemInsertServices_GST', dateField: 'Wef', table: 'ElemServices'},
        {id: 3, type: 3, text: 'Transfers', sp: 'p_ElemInsertServices_GST', dateField: 'Wef', table: 'ElemServices'},
        {id: 4, type: 4, text: 'Car Per Km', sp: 'p_ElemInsertCars_GST', dateField: 'Wef', table: 'ElemCars'},
        {id: 5, type: 5, text: 'Car P2P (Intercity)', sp: 'p_ElemInsertInterCities_GST', dateField: 'Wef', table: 'ElemIntercities'},
        {id: 6, type: 6, text: 'Car City Groups', sp: 'p_ElemInsertCityGroups_GST', dateField: 'Wef', table: 'ElemCityGroups'},
        {id: 7, type: 7, text: 'Trains', sp: 'p_ElemInsertTickets_GST', dateField: 'Wef', table: 'ElemTickets'},
        {id: 8, type: 8, text: 'Packages', sp: '', dateField: 'Wef', table: 'ElemPackages'},
        {id: 9, type: 21, text: 'Extra Day Car Hire', sp: 'p_ElemInsertExtraDayCarHire', dateField: 'Wef', table: 'ElemExtraDayCarHire'},
      ],
      actionList: [
        {id: 1, text: 'Import Elements'}, 
        {id: 2, text: 'Delete Elements'}, 
        {id: 3, template: function() { return "<hr style='margin: unset, height: 5' />"; }},          
        {id: 4, text: 'Approve Element Costs'}, 
        {id: 5, text: 'Reverse Cost Approval'}, 
        {id: 6, template: function() { return "<hr style='margin: unset, height: 5' />"; }},          
        {id: 7, text: 'Update Train Timings'}, 
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
  // When params are changed, write to redux, and send to calling parent component
  useEffect (() => {

    getSelectedParams();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.wef, compVar.elementType]);

  //**********************************************************/
  const fetchInitialData = async() => {

    await setWefLookup();
    forceRender();

  }
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const costApproval = async () => {
    const query = "SELECT Approved FROM ElemDateRange WHERE FromDate = '" + convertDMY_MDY(compVar.wef) + "'";
    const approvedCostArr = await dbGetRecordRaw({query: query });
    if (approvedCostArr.length > 0 && approvedCostArr[0].Approved !== null) {
      compVar.costApproved = approvedCostArr[0].Approved;
    } else {
      compVar.costApproved = false;
    }
  }

  //**********************************************************/
  const getSelectedParams = async () => {
  
    // Save to redux store through params reducer
    dispatch(setElementParamValues({
      wef: compVar.wef,
      elementType: compVar.elementType,
      elementLabel: compVar.elementLabel      
    }));

    forceRender();

  }

  //**********************************************************/
  const getActivitySelectedParams = async (e) => {

    compVar.inEditMode = e.inEditMode;
  
    forceRender();

  }

  //**********************************************************/
  const setWefLookup = async() => {

    await setWefLookupIndex(-1);

    // For ex. extra car hire may not have wef defined until 2023, so use accommodation dates for wef
    if (compVar.wefLookup.length === 0) {
      await setWefLookupIndex(0);
    }

    const idx = compVar.wefLookup.findIndex(rec => rec.Wef === compVar.wef);
    if (compVar.wefLookup.length > 0) {
      if (idx < 0) {
        compVar.wef = compVar.wefLookup[0].Wef;
        compVar.dateRange = compVar.wefLookup[0].DateRange;
      } else {
        compVar.dateRange = compVar.wefLookup[idx].DateRange;
      } 
    } else {
      compVar.dateRange = '';
    }
  }


  //**********************************************************/
  const setWefLookupIndex = async(index) => {

    let idx = compVar.elementTypesData.findIndex(rec => rec.type === compVar.elementType);
    idx = (idx < 0) ? 0 : idx;

    idx = (index > -1) ? index : idx;

    const fromDate = compVar.elementTypesData[idx].dateField;
    const table = compVar.elementTypesData[idx].table;

    // all wef dates
    let whereStr = ` MONTH(${fromDate}) = 10 AND DAY(${fromDate}) = 1 `;

    // only in the last 3 years
    if (!compVar.wefSwitchValue) {
      whereStr = whereStr + ` AND ${fromDate} > DATEADD(year,-3,GETDATE()) `; 
    }    

    const fields = `DISTINCT ${fromDate} AS Wef, CONVERT(varchar(10),${fromDate},103) + ' - ' + CONVERT(varchar(10),DATEADD(day,-1,DATEADD(year,1,${fromDate})),103) AS DateRange`;
    const orders = `${fromDate} DESC`
    compVar.wefLookup = await dbGetRecord({fields: [fields], orders: [orders], table: table, where: whereStr, x_uid: _g_users_id, x_module: 'Elements'});   
    compVar.wefLookup = compVar.wefLookup.map(rec => ({...rec, Wef: convert_DbDate_To_DMY(rec.Wef,1)}) );        
    await costApproval();
  }


  //**********************************************************/
  const onWefChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.wef = e[0].Wef;
      compVar.dateRange = e[0].DateRange;

      await costApproval();
      forceRender();
    }
  }

  //**********************************************************/
  const wefSwitchValueChanged = async (e) => {
    compVar.wefSwitchValue = (e!== undefined) ? e : false;
    await setWefLookup();
    forceRender();
  }

  //**********************************************************/
  const quotedSwitchValueChanged = async (e) => {
    compVar.quotedSwitchValue =  (e!== undefined) ? e : false;
    forceRender();
  }

  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.wefLookup];
    const fieldLists = [['DateRange']];
    const valueExprs = ['wef'];
    const displayExprs = ['DateRange'];
    const labels = ['Wef'];
    const placeholders = [""];
    const getSelectedRecs = [onWefChanged];
    const values = [compVar.dateRange];
    const componentWidths = [230];
    const dropDownWidths = [250];
    const labelStyles = [{width: 80, flex: 0.8}] 

    const lookup = lookups[index];
    const fieldList = fieldLists[index];
    const valueExpr = valueExprs[index];
    const displayExpr = displayExprs[index];
    const label = labels[index];
    const placeholder = placeholders[index];
    const getSelectedRec = getSelectedRecs[index];
    const value = values[index];
    const componentWidth = componentWidths[index];
    const dropDownWidth = dropDownWidths[index];
    const labelStyle = labelStyles[index]; 
    
    return (
        <DropDownGrid
          listArray={lookup}
          fieldList={fieldList}
          valueExpr={valueExpr}
          displayExpr={displayExpr}
          label={label}
          placeholder={placeholder}
          getSelectedRecord={getSelectedRec}
          showColumnHeaders={false}
          value={value}
          labelStyle={labelStyle}
          dropDownStyle={{width: componentWidth}}
          dropDownOptions={{width: dropDownWidth}}
        />  
    );

  }

  //**********************************************************/
  const switchParamsJsx = (index) => {

    const onSwitchChanges = [wefSwitchValueChanged, quotedSwitchValueChanged];
    const onCheckedValues = [(compVar.wefSwitchValue === undefined) ? false : compVar.wefSwitchValue, (compVar.quotedSwitchValue === undefined) ? false : compVar.quotedSwitchValue];

    const onSwitchChange = onSwitchChanges[index];
    const onCheckedValue = onCheckedValues[index];

    return (
      <>
        <div style={{paddingLeft: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          <Switch 
            height={20} 
            width={40} 
            onChange={onSwitchChange} 
            checked={onCheckedValue} 
            uncheckedIcon={false}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const onElementTypeClick = async (e) => {
    compVar.elementType = e.itemData.type;
    compVar.elementLabel = e.itemData.text;
    await setWefLookup();

    // Reset the counter, otherwise each time you would get the wef toggle message
    compVar.counter = 0;

    forceRender();
  }

  //**********************************************************/
  const onReportClick = async (e) => {
    compVar.reportType = e.itemData.type;

    compVar.reportInProgress = true;
    forceRender();

    let data = {wef: compVar.wef, quoted: compVar.quotedSwitchValue, 
      currencies_id: compVar.currencies_id,
      reportType: e.itemData.type, 
      reportName: e.itemData.reportName, 
      reportId: e.itemData.id,
      openReport: false,
      elementType: compVar.elementType,
      elementLabel: compVar.elementLabel
    };      

    await setupReport(data);

    compVar.reportInProgress = false;
    forceRender();

  }

  //**********************************************************/
  const onActionClick = (e) => {
    compVar.actionType = e.itemData.id;

    if (compVar.actionType === 1) {
      compVar.openImports = true;
      forceRender();
    } else if (compVar.actionType === 2) {
      compVar.popupDialogIndex = 0;
      compVar.dialogMessage1 = `Are you sure you want to delete the  
        ${compVar.elementLabel} elements?`
      compVar.dialogMessage2 = ''; 
      setPopupDialogBoxVisible(() => {return true});  
    } else if (compVar.actionType === 4) {
      approveElementCost(1);
    } else if (compVar.actionType === 5) {
      approveElementCost(2);
    } else if (compVar.actionType === 7) {
      updateElemTrainTimings();
    }
        
  }

  //**********************************************************/
  const approveElementCost = async (x_option) => {
   
    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const fromDate = convertDMY_MDY(compVar.wef);

    const sql = "EXEC [p_ApproveElementCost] '" + fromDate + "', " + x_option.toString();

    let spData = {sql: sql};
    await dbExecuteSp(spData);

    await costApproval();

    forceRender();
   
  }

  //**********************************************************/
  const updateElemTrainTimings = async () => {
   
    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const fromDate = convertDMY_MDY(compVar.wef);

    const sql = "EXEC [p_UpdateElemTrainTimings] '" + fromDate + "' ";

    let spData = {sql: sql};
    await dbExecuteSp(spData);

    //dummy to refresh the data
    compVar.counter++;
    forceRender();      
   
  }

  //**********************************************************/
  const deleteElementsProc = async (e) => {
   
    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {
      const fromDate = convertDMY_MDY(compVar.wef);

      const sql = "EXEC [p_DeleteElements] '" + fromDate + "', " +
        compVar.elementType.toString();

      let spData = {sql: sql};
      await dbExecuteSp(spData);

      await setWefLookup();

      //dummy to refresh the data
      compVar.counter++;
      forceRender();      
    }
   
  }

  //**********************************************************/
  const onCloseImport = (e) => {
    compVar.openImports = false;

    if (e.refresh) {
      compVar.counter++;
    }
    forceRender();
  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = ['Element Type', 'Reports', 'Actions for the Period'];
    const icons = ['more', 'exportxlsx', 'bulletlist']
    const widths = [150,150,200];
    const dropDownOptions = [{width: 200},{width: 200},{width: 200}];
    const items = [compVar.elementTypesData, compVar.reportsData, compVar.actionList];
    const onItemClicks = [onElementTypeClick, onReportClick, onActionClick];

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
  const renderContent = () => {

    //const additionalPanelHeight = 40;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    //const viewHeight = heights.viewHeight - additionalPanelHeight;

    const panelColor = (compVar !== undefined && compVar.costApproved) ? null : '#ffcccc';

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          {!compVar.openImports && !compVar.inEditMode &&
            <div className="elements-panelparams-container" style={{width: '100%'}}>

              <div className="elements-panelparams-section-container" style={{background: panelColor}}>

                <div className="elements-panelparams-city-container" style={{flex: 1}}>
                  {dropDownParamsJsx(0)}
                  {switchParamsJsx(0)}
                </div>

                <div className="elements-panelparams-city-container" style={{flex: 0.7, justifyContent: 'center', alignItems: 'center'}}>
                  Only Quoted
                  {switchParamsJsx(1)}
                </div>

                <div className="elements-panelparams-city-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  {dropDownButtonJsx(0)}
                </div>

                <div className="elements-panelparams-city-container" style={{flex: 0.7, justifyContent: 'center', alignItems: 'center'}}>
                  {dropDownButtonJsx(1)}
                </div>

                <div className="elements-panelparams-city-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  {dropDownButtonJsx(2)}
                </div>

              </div>

            </div>
          }

          {compVar.openImports &&
            <ElementImport 
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              onCloseImport={onCloseImport}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 1 &&
            <ElementsAccommodation 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 2 &&
            <ElementsSightseeing 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 3 &&
            <ElementsTransfer 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 4 &&
            <ElementsCarHire 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 5 &&
            <ElementsCarP2p 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 6 &&
            <ElementsCarCityGroups 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 7 &&
            <ElementsTrains 
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

          {!compVar.openImports && compVar.elementType === 21 &&
            <ElementsCarExtraDay
              wef={compVar.wef}
              elementType={compVar.elementType}
              elementLabel={compVar.elementLabel}
              quoted={compVar.quotedSwitchValue}
              getActivitySelectedParams={getActivitySelectedParams}
              counter={compVar.counter}
            />
          }

        </div>

        {popupDialogBoxVisible && 
          <PopupDialogBox
            open={true}
            message1={compVar.dialogMessage1}
            message2={compVar.dialogMessage2}
            getSelectedOption={compVar.popupSelectedOptions[compVar.popupDialogIndex]}
          >
          </PopupDialogBox>
        }


      </>

    );

  }


  return (
    renderContent()
  )


};

export default Elements;
