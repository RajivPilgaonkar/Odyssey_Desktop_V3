import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStartDate } from "../../../common/CommonTransactionFunctions";
import { dbGetRecord } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { convert_DbDate_To_DMY, convertDMYtoDate, addMonth } from "../../../common/CommonTransactionFunctions";
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import { CheckBox } from 'devextreme-react/check-box';
import List from 'devextreme-react/list';
import DropDownButton from 'devextreme-react/drop-down-button';
import TextBox from 'devextreme-react/text-box';
import DropDownGrid from "../../../common/DropDownGrid";
import {setupReport} from './ReportSetup';

import './CostReports.css'

let compVar = {};

function CostReports() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      activeMealPlans_id: 2, activeMealPlan: 'CP', 
      activeCurrencies_id: 13, activeCurrency: 'INR',
      activeCountries_id: 200, activeCountry: 'India',
      numPax: '2', fromDate: '01/10/2000', 
      activeReportTypes_id: 0, activeReportType: '', 
      renderToggle: false,
      mealPlanLookup: [], currencyLookup: [], countryLookup: [],
      hotelCategories: [], states: [], 
      hotelSelectedKeys: '', sightseeingSelectedKeys: '0,1,2,3,4', 
      transferSelectedKeys: '4', optionsSelectedKeys: '0,1',
      statesSelectedKeys: '',
      errorMsg: '',
      reportInProgress: false,
      sightseeingCategories: [
        {key2: 0, text: 'Misc', selected: true},
        {key2: 1, text: 'Guide', selected: true},
        {key2: 2, text: 'Entrance', selected: true},
        {key2: 3, text: 'Transport', selected: true},
        {key2: 4, text: 'Meet & Assist', selected: true},
      ],
      transferCategories: [
        {key2: 4, text: 'Meet & Assist', selected: true},
      ],
      reportOptions: [
        {key2: 0, text: 'Only Ranked', selected: true, categories: [0]},
        {key2: 1, text: 'Recommended', selected: true, categories: [1]},
        {key2: 2, text: 'Order State-wise', selected: false, categories: [0,1,2,3,4,5,6]},
        {key2: 3, text: 'Riksja', selected: false, categories: [0]},
      ],
      data: [
        {type_id: 0, type: 'Accommodation', boxHeight: 280},
        {type_id: 1, type: 'Sightseeing', boxHeight: 310},
        {type_id: 2, type: 'Transfers', boxHeight: 280},
        {type_id: 3, type: 'Packages', boxHeight: 220},
        {type_id: 4, type: 'Car - Per Km', boxHeight: 220},
        {type_id: 5, type: 'Car - P2P', boxHeight: 220},
        {type_id: 6, type: 'Car - City Groups', boxHeight: 220},
      ],
      reportsData: [
        {id: 1, type: 0, text: 'With Margin', oneToTen: '0', option: '1', reportName: 'Acc_Quote_'},
        {id: 2, type: 0, text: 'Without Margin', oneToTen: '0', option: '2', reportName: 'Acc_Cost_NoMargin_'},
        {id: 3, type: 0, text: '1-10 Costing', oneToTen: '0', option: '3',  reportName: 'Acc_OneToTen_'},

        {id: 11, type: 1, text: 'With Margin', oneToTen: '0', option: '1', reportName: 'SS_Quote_'},
        {id: 12, type: 1, text: 'Without Margin', oneToTen: '0', option: '1', reportName: 'SS_Cost_NoMargin_'},
        {id: 13, type: 1, text: '1-10 - All Cars', oneToTen: '1', option: '1', reportName: 'SS_OneToTen_'},
        {id: 14, type: 1, text: '1-10 Stacked', oneToTen: '1', option: '0', reportName: 'SS_Stacked_'},
        {id: 15, type: 1, text: 'Misc/Guide/Entrance Details', oneToTen: '0', option: '1', reportName: 'SS_MiscGuideEnt_'},

        {id: 21, type: 2, text: 'With Margin', oneToTen: '0', option: '1', reportName: 'Trsf_Quote_'},
        {id: 22, type: 2, text: 'Without Margin', oneToTen: '0', option: '1', reportName: 'Trsf_Cost_NoMargin_'},
        {id: 23, type: 2, text: '1-10 - All Cars', oneToTen: '1', option: '1', reportName: 'Trsf_OneToTen_'},
        {id: 24, type: 2, text: '1-10 - Stacked', oneToTen: '1', option: '0', reportName: 'Trsf_Stacked_'},
        {id: 25, type: 2, text: 'Compare Agent Costs', oneToTen: '0', option: '1', reportName: 'Trsf_Quote_AllAgents_'},

        {id: 31, type: 3, text: 'With Margin', oneToTen: '0', option: '0'},
        {id: 32, type: 3, text: 'Without Margin', oneToTen: '0', option: '0'},
        
        {id: 41, type: 4, text: 'With Margin', oneToTen: '0', option: '1', reportName: 'CarPerKm_Quote_'},
        {id: 42, type: 4, text: 'Without Margin', oneToTen: '0', option: '1', reportName: 'CarPerKm_Cost_NoMargin_'},
        {id: 43, type: 4, text: '1-10 - All Cars', oneToTen: '1', option: '1', reportName: 'CarPerKm_OneToTen_'},
        {id: 44, type: 4, text: '1-10 - Single Line', oneToTen: '1', option: '2', reportName: 'CarPerKm_SingleLine_'},

        {id: 51, type: 5, text: 'With Margin', oneToTen: '0', option: '1', reportName: 'CarP2P_Quote_'},
        {id: 52, type: 5, text: 'Without Margin', oneToTen: '0', option: '1', reportName: 'CarP2P_Cost_NoMargin_'},
        {id: 53, type: 5, text: '1-10 - All Cars', oneToTen: '1', option: '1', reportName: 'CarP2P_OneToTen_'},
        {id: 54, type: 5, text: '1-10 - Single Line', oneToTen: '1', option: '2', reportName: 'CarP2P_SingleLine_'},

        {id: 61, type: 6, text: 'With Margin', oneToTen: '0', option: '1', reportName: 'CarCityGroup_Quote_'},
        {id: 62, type: 6, text: 'Without Margin', oneToTen: '0', option: '1', reportName: 'CarCityGroup_Cost_NoMargin_'},
        {id: 63, type: 6, text: '1-10 - All Cars', oneToTen: '1', option: '1', reportName: 'CarCityGroup_OneToTen_'},
        {id: 64, type: 6, text: '1-10 - Single Line', oneToTen: '1', option: '2', reportName: 'CarCityGroup_SingleLine_'},
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
  const fetchInitialData = async() => {

    compVar.activeReportType = compVar.data[compVar.activeReportTypes_id].type;

    compVar.mealPlanLookup = await dbGetRecord({fields: ['mealplans_id', '[plan] AS mp'], orders: ['[plan]'], table: 'mealplans', x_uid: _g_users_id, x_module: 'Cost Reports'});   
    compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Addressbook'}); 
    let whereStr = 'OperateBusiness = 1';
    compVar.countryLookup = await dbGetRecord({fields: ['countries_id', 'country'], orders: ['country'], table: 'countries', where: whereStr, x_uid: _g_users_id, x_module: 'Currencies'});   

    whereStr = 'ContactSubCategories_id = 4';
    compVar.hotelCategories = await dbGetRecord({fields: ['AddressbookServices_id AS key2, AddressbookService AS text'], orders: ['OrderNo'], table: 'AddressbookServices', where: whereStr, x_uid: _g_users_id, x_module: 'Cost Reports'});   
    compVar.hotelCategories.map(rec => rec.selected = true);

    compVar.states = await dbGetRecord({fields: ['states_id AS key2, [state] AS text'], orders: ['[state]'], table: 'states'});   
    compVar.states.map(rec => rec.selected = true);

    compVar.fromDate = getStartDate(2);

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
  const onReportTypeChanged = (e) => {    
    compVar.activeReportTypes_id = e[0].type_id;
    compVar.activeReportType = e[0].type;
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
  const onMealPlanChanged = (e) => {    
    compVar.activeMealPlans_id = e[0].mealplans_id;
    compVar.activeMealPlan = e[0].mp;
    forceRender();
  }

  //**********************************************************/
  const onCurrencyChanged = (e) => {    
    compVar.activeCurrencies_id = e[0].currencies_id;
    compVar.activeCurrency = e[0].currencycode;
    forceRender();
  }

  //**********************************************************/
  const onCountryChanged = (e) => {    
    compVar.activeCountries_id = e[0].countries_id;
    compVar.activeCountry = e[0].country;
    forceRender();
  }

  //**********************************************************/
  const onNumPaxChange = (e) => {
    compVar.numPax = e.value;    
  }

  //**********************************************************/
  const dateParamsJsx = () => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 

    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16}}>
          From Date
        </div>
        <div style={{flex: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
          <DateBox 
            type={"date"}
            width={150}
            displayFormat={"dd/MM/yyyy"}
            value={fromDate} 
            onValueChanged={onFromDateChanged}
            style={{fontSize: 18}}
            acceptCustomValue={false}
          />
          {buttonParamsJsx(0)}
          {buttonParamsJsx(1)}
        </div>
      </div>      
    )
  }  

  //**********************************************************/
  const paxParamsJsx = () => {

    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16}}>
          From Pax
        </div>
        <div style={{flex: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
          <TextBox 
            width={80}
            mask={'##'}
            maskChar={' '}
            defaultValue='2' 
            onValueChanged={onNumPaxChange}
          />
        </div>
      </div>      
    )
  }  

  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.data, compVar.mealPlanLookup, compVar.currencyLookup, compVar.countryLookup];
    const fieldLists = [['type'], ['mp'], ['currencycode'], ['country']];
    const valueExprs = ['type_id', 'mealplans_id', 'currencies_id', 'countries_id'];
    const displayExprs = ['type', 'mp', 'currencycode', 'country'];
    const labels = ['Report Type', 'Meal Plan', 'Currency', 'Country'];
    const placeholders = ["Select a report type...", "Select a meal plan...", "Select a currency...", "Select a country..."];
    const getSelectedRecs = [onReportTypeChanged, onMealPlanChanged, onCurrencyChanged, onCountryChanged];
    const values = [compVar.activeReportTypes_id, compVar.activeMealPlans_id, compVar.activeCurrencies_id, compVar.activeCountries_id];
    const componentWidths = [250,200,200,200];
    const dropDownWidths = [300,200,200,200];
    const labelStyles = [{width: 0, flex: 0, display: 'none'},{width: 0, flex: 0, display: 'none'},{width: 0, flex: 0, display: 'none'},{width: 0, flex: 0, display: 'none'}] 

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
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16}}>
          {label}
        </div>
        <div style={{flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
          <DropDownGrid
            listArray={lookup}
            fieldList={fieldList}
            valueExpr={valueExpr}
            displayExpr={displayExpr}
            label={''}
            placeholder={placeholder}
            getSelectedRecord={getSelectedRec}
            showColumnHeaders={false}
            value={value}
            labelStyle={labelStyle}
            dropDownStyle={{width: componentWidth}}
            dropDownOptions={{width: dropDownWidth}}
          />  
        </div>
      </div>
    );

  }

  //**********************************************************/
  const addYear = () => {
    compVar.fromDate = addMonth(compVar.fromDate, 12, 2);
    forceRender();
  }
  
  //**********************************************************/
  const subtractYear = () => {
    compVar.fromDate = addMonth(compVar.fromDate, -12, 2);
    forceRender();
  }


  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const widths = [35, 35];
    const icons = ['arrowup', 'arrowdown'];
    const onClicks = [addYear, subtractYear];
    const hints = ['Next Year', 'Prev Year'];
    const texts = [null, null];

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
  const itemJsx = (rec) => {

    return (
      <>
        <div className="list-outer-container">

          <div className="list-checkbox-container">
            <CheckBox
              value={rec.selected}
              style={{height: '100%', display: 'flex', justifyContent: 'flex-end'}}
            />
          </div>

          <div className="list-text-container">
            {rec.text}
          </div>

        </div> 

      </>
    )

  }

  //**********************************************************/
  const stateItemJsx = (rec) => {

    return (
      <>
        <div className="list-outer-container">
          <div className="list-text-container">
            {rec.text}
          </div>

        </div> 

      </>
    )

  }

  //**********************************************************/
  const onItemListClick =  (e) => {
    const dataSourceArr = [compVar.hotelCategories, compVar.sightseeingCategories, compVar.transferCategories];
    const dataSource = dataSourceArr[compVar.activeReportTypes_id];

    dataSource[e.itemIndex].selected = !dataSource[e.itemIndex].selected;

    forceRender();
  }

  //**********************************************************/
  const onReportOptionListClick = (e) => {

    // filter depending on activeReportTypes_id
    const reportOptions = compVar.reportOptions.filter(rec => rec.categories.includes(compVar.activeReportTypes_id));

    // BE CAREFUL HERE !!! ... Although filter returns a new array,
    // ... but the array elements are referencing the same object ...
    // ... so changing in reportOptions will auto change in compVar.reportOptions
    reportOptions[e.itemIndex].selected = !reportOptions[e.itemIndex].selected;

    forceRender();
  }

  //**********************************************************/
  const onSelectedStateKeysChange = (args) => {
    if (args.name === 'selectedItemKeys') {
      compVar.statesSelectedKeys = args.value.join(", ");    
    }

  }

  //**********************************************************/
  const listAccServicesParamsJsx = () => {
    const dataSourceArr = [compVar.hotelCategories, compVar.sightseeingCategories, compVar.transferCategories];
    const dataSource = dataSourceArr[compVar.activeReportTypes_id];

    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <List              
          dataSource={dataSource}    
          keyExpr="key2"
          itemRender={itemJsx}           
          focusStateEnabled={true}
          onItemClick={onItemListClick}
        />
      </div>
    )
  }

  //**********************************************************/
  const listReportParamsJsx = () => {

    //reportsData
    const reportOptions = compVar.reportOptions.filter(rec => rec.categories.includes(compVar.activeReportTypes_id));

    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <List              
          dataSource={reportOptions}    
          keyExpr="key2"
          itemRender={itemJsx}           
          focusStateEnabled={true}
          onItemClick={onReportOptionListClick}
        />
      </div>
    )
  }

  //**********************************************************/
  const listStateParamsJsx = () => {

    const boxHeight = compVar.data[compVar.activeReportTypes_id].boxHeight-15;

    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <List              
          dataSource={compVar.states}    
          keyExpr="key2"
          itemRender={stateItemJsx}           
          focusStateEnabled={true}
          height={boxHeight}
          showSelectionControls={true}
          selectionMode={"all"}
          selectAllMode={"allPages"}
          onOptionChanged={onSelectedStateKeysChange} 
        />
      </div>
    )
  }

  //**********************************************************/
  const reportsJsx = () => {

    if (compVar.reportInProgress) {
      return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <LoadIndicator id="large-indicator" height={40} width={40} />
        </div>
      )
    }

    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <DropDownButton
          text="Select Report"
          icon="exportxlsx"
          width={200}
          items={compVar.reportsData.filter(rec => {return rec.type === compVar.activeReportTypes_id})}
          keyExpr={"id"}
          displayExpr={"text"}
          onItemClick={onReportClick}
        />
      </div>
    )
  }

  //**********************************************************/
  const getAccServicesSelectedKeys = (dataSource) => {

    const selectionIndexes = [];
    dataSource.forEach(function (rec, i) {
      if (rec.selected) {
        selectionIndexes.push(rec.key2);
      }
    });     
    
    return selectionIndexes.join(', ');

  }

  //**********************************************************/
  const onReportClick = async (e) => {

    // hotels
    compVar.hotelSelectedKeys = getAccServicesSelectedKeys(compVar.hotelCategories);

    // sightseeing
    compVar.sightseeingSelectedKeys = getAccServicesSelectedKeys(compVar.sightseeingCategories);

    // transfers
    compVar.transferSelectedKeys = getAccServicesSelectedKeys(compVar.transferCategories);

    // report options
    const selectionIndexes = [];
    compVar.reportOptions.forEach(function (rec, i) {
      if (rec.categories.includes(compVar.activeReportTypes_id) && rec.selected) {
        selectionIndexes.push(i);
      }
    });           
    compVar.optionsSelectedKeys = selectionIndexes.join(', ');

    const reportObj = {...e.itemData, 
        hotelSelectedKeys: compVar.hotelSelectedKeys,
        sightseeingSelectedKeys: compVar.sightseeingSelectedKeys,
        transferSelectedKeys: compVar.transferSelectedKeys,
        optionsSelectedKeys: compVar.optionsSelectedKeys,
        statesSelectedKeys: compVar.statesSelectedKeys,
        fromDate: compVar.fromDate,
        numPax: compVar.numPax,
        currencies_id: compVar.activeCurrencies_id, currencyCode: compVar.activeCurrency,
        mealPlans_id: compVar.activeMealPlans_id, mealPlan: compVar.activeMealPlan,
        countries_id: compVar.activeCountries_id, country: compVar.activeCountry
      }

      compVar.reportInProgress = true;
      forceRender();

      await setupReport(reportObj);

      compVar.reportInProgress = false;
      forceRender();

  }


  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="report-page-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const boxHeight = compVar.data[compVar.activeReportTypes_id].boxHeight;

    return (
      <div className="report-page-container" style={{height: containerHeight}}>
        <h2 className="report-header">
          Costing Reports
        </h2>
        <h2 className="report-item" >
          <div style={{width: 380}}>
            {dropDownParamsJsx(0)}
          </div>
        </h2>
        <div className="box-outer-container">
          <div className="box-params-container" style={{height: boxHeight, width: 400}}>
              {dateParamsJsx()}
              {compVar.activeReportTypes_id === 0 && dropDownParamsJsx(1)}
              {dropDownParamsJsx(2)}
              {dropDownParamsJsx(3)}
              {(compVar.activeReportTypes_id === 1 || compVar.activeReportTypes_id === 2) && paxParamsJsx()}
          </div>
          {compVar.activeReportTypes_id >= 0 && compVar.activeReportTypes_id <= 2 &&
            <div className="box-params-container" style={{height: boxHeight, width: 240, justifyContent: 'center'}}>
              {listAccServicesParamsJsx()}
            </div>
          }
          <div className="box-params-container" style={{height: boxHeight, width: 240, justifyContent: 'center'}}>
            {listReportParamsJsx()}
          </div>
          <div className="box-params-container" style={{height: boxHeight, width: 280, justifyContent: 'center'}}>
            {listStateParamsJsx()}
          </div>
        </div>

        <h2 className="report-item" style={{paddingTop: 10}}>
          <div className="box-outer-container">
            {reportsJsx()}
          </div>
        </h2>

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default CostReports;
