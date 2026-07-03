import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dbGetRecord, dbExecuteSp, setParamValues } from '../../../../actions';
import { getPrevYear_DMY, getNextYear_DMY, convertDMYtoDate, convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import {getExchRate} from "../../../common/GetDescFromIds";
import DropDownGrid from "../../../common/DropDownGrid";
import {Button} from 'devextreme-react/button';
import { CheckBox } from 'devextreme-react/check-box';
import List from 'devextreme-react/list';
import DateBox from 'devextreme-react/date-box';
import { LoadIndicator } from 'devextreme-react/load-indicator';
//import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function ElementImport(props) {

  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_wef = useSelector(state => state.elementParams.wef);

  // use this to write to the redux store
  const dispatch = useDispatch();
  
  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      currencies_id: 27, currency: 'EUR', wef: _g_wef,
      exchRate: 1, reportInProgress: false, counter: 0,
      reportOptions: [
        {key2: 0, text: 'Guide', selected: true, categories: [2,3]},
        {key2: 1, text: 'Entrance Fees', selected: true, categories: [2,3]},
        {key2: 2, text: 'Meet & Assist', selected: true, categories: [2,3]},
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

    compVar.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies', x_uid: _g_users_id, x_module: 'Elements'}); 

    compVar.exchRate = await getExchRate(compVar.currencies_id, compVar.wef);

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
  const getSelectedParams = async () => {
  
    // Save to redux store through params reducer
    dispatch(setParamValues({
      wef: compVar.wef,
      elementType: compVar.elementType,
      elementLabel: compVar.elementLabel      
    }));

  }

  //*********************************************************/
  const onCurrencyChanged = async(e) => {
    if (e.length > 0) {
      compVar.currencies_id = e[0].currencies_id;
      compVar.currency = e[0].currencycode;  
      compVar.exchRate = await getExchRate(compVar.currencies_id, compVar.wef);
      forceRender();
    }
  }

  //**********************************************************/
  const onWefChanged = (e) => {
    if (e !== undefined && e !== null) {
    }
  }

  //**********************************************************/
  const addYear = async () => {
    compVar.wef = getNextYear_DMY(compVar.wef);
    compVar.exchRate = await getExchRate(compVar.currencies_id, compVar.wef);
    forceRender();
  }

  //**********************************************************/
  const subtractYear = async () => {
    compVar.wef = getPrevYear_DMY(compVar.wef);
    compVar.exchRate = await getExchRate(compVar.currencies_id, compVar.wef);
    forceRender();
  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const wef = convertDMYtoDate(compVar.wef);

    const widths = [150];
    const values = [wef];
    const onValueChanges = [onWefChanged];

    const width = widths[index];
    const value = values[index];
    const onValueChange = onValueChanges[index];

    return (
      <DateBox 
        type={"date"}
        width={width}
        displayFormat={"dd/MM/yyyy"}
        value={value} 
        onValueChanged={onValueChange}
        style={{fontSize: 18}}
        acceptCustomValue={false}
        readOnly={true}
      />
    );

  }

  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.currencyLookup];
    const fieldLists = [['currencycode']];
    const valueExprs = ['currencies_id'];
    const displayExprs = ['currencycode'];
    const labels = ['Currency'];
    const placeholders = [""];
    const getSelectedRecs = [onCurrencyChanged];
    const values = [compVar.currencies_id];
    const componentWidths = [120];
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
  const smallButtonParamsJsx = (index) => {

    const widths = [35,35];
    const types = ['normal','normal'];
    const stylingModes = ['outlined','outlined'];
    const icons = ['arrowup','arrowdown'];
    const onClicks = [addYear,subtractYear];

    const width = widths[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    
    return (
      <Button
        width={width}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        onClick={onClick}
    />
    );

  }

  //**********************************************************/
  const importData = async () => {

    compVar.reportInProgress = true;
    forceRender();

    const guide = (compVar.reportOptions[0].selected) ? '1' : '0';
    const entranceFees = (compVar.reportOptions[1].selected) ? '1' : '0';
    const meetAssist = (compVar.reportOptions[2].selected) ? '1' : '0';

    const fromDate = convertDMY_MDY(compVar.wef);

    let sql = '';
    if (props.elementType === 1) {
      sql = "EXEC [p_ElemInsertHotels_GST] '" + fromDate + "', 2, " +
        compVar.currencies_id.toString() + ', ' + _g_users_id.toString();
    } else if (props.elementType === 2) {
      sql = "EXEC [p_ElemInsertServices_GST] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ", 0, " + guide + ", " + entranceFees + ", " + meetAssist + ', ' + 
        _g_users_id.toString();
    } else if (props.elementType === 3) {
      sql = "EXEC [p_ElemInsertServices_GST] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ", 1, " + guide + ", " + entranceFees + ", " + meetAssist + ', ' + 
        _g_users_id.toString();
    } else if (props.elementType === 4) {
      sql = "EXEC [p_ElemInsertCars_GST] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ', ' + 
        _g_users_id.toString();
    } else if (props.elementType === 5) {
      sql = "EXEC [p_ElemInsertInterCities_GST] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ', ' + 
        _g_users_id.toString();
    } else if (props.elementType === 6) {
      sql = "EXEC [p_ElemInsertCityGroups_GST] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ', ' + 
        _g_users_id.toString();
    } else if (props.elementType === 7) {
      sql = "EXEC [p_ElemInsertTickets_GST] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ', ' + 
        _g_users_id.toString();
    } else if (props.elementType === 21) {
      sql = "EXEC [p_ElemInsertExtraDayCarHire] '" + fromDate + "', " +
        compVar.currencies_id.toString() + ', ' + 
        _g_users_id.toString();
    }

    let spData = {sql: sql};
    await dbExecuteSp(spData);

    compVar.reportInProgress = false;
    compVar.counter = props.counter+1;
    forceRender();

  }

  //**********************************************************/
  const closeImport = () => {
    //SP run, filter data on close
    const refresh = (compVar.counter > props.counter);

    if (props.onCloseImport !== undefined) {
      props.onCloseImport({refresh: refresh});
    }
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
  const onReportOptionListClick = (e) => {
    compVar.reportOptions[e.itemIndex].selected = !compVar.reportOptions[e.itemIndex].selected;

    forceRender();
  }


  //**********************************************************/
  const renderContent = () => {

    const exchRate = (compVar.exchRate !== 1) ? '@ ' + parseInt(compVar.exchRate) : '';
    const importStr = 'Import ' + props.elementLabel;
    
    return (
      <>
        <div className="elements-panelparams-container" style={{width: '100%'}}>

          <div className="elements-panelparams-section-container">

            <div className="elements-panelparams-city-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              {dropDownParamsJsx(0)} 
            </div>

            <div className="elements-panelparams-city-container" style={{flex: 0.3, justifyContent: 'flex-start', alignItems: 'center', fontSize: 16}}>
              {exchRate}              
            </div>

            <div className="elements-panelparams-city-container" style={{flex: 1.6, justifyContent: 'center', alignItems: 'center'}}>
              <div style={{fontSize: 16, paddingRight: 4}}>
                Copy From:
              </div>
              {dateParamsJsx(0)}
              {smallButtonParamsJsx(0)}
              {smallButtonParamsJsx(1)}
              <div style={{fontSize: 16, paddingLeft: 4}}>
                from Costings
              </div>
            </div>

            <div className="elements-panelparams-city-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              {!compVar.reportInProgress &&
                <Button text={importStr} disabled={false} type="success" onClick={importData}/>
              }
              {compVar.reportInProgress &&
                <LoadIndicator id="large-indicator" height={60} width={60} />
              }
            </div>

            <div className="elements-panelparams-city-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              {!compVar.reportInProgress &&
                <Button text={"Back to Elements"} disabled={false} type="default" onClick={closeImport}/>
              }
            </div>

          </div>

        </div>

        {(props.elementType === 2 || props.elementType === 3) &&
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: 300}}>
            <List              
              dataSource={compVar.reportOptions}    
              keyExpr="key2"
              itemRender={itemJsx}           
              focusStateEnabled={true}
              onItemClick={onReportOptionListClick}
            />
          </div>
        }

      </>

    );

  }


  return (
    renderContent()
  )


};

export default ElementImport;
