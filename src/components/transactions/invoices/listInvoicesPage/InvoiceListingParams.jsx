import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { convert_DbDate_To_DMY, convertDMYtoDate, convertDMYtoDateObj, addMonth, getFirstOfMonth_DMY, getLastOfMonth_DMY } from "../../../common/CommonTransactionFunctions";
import { dbGetRecordRaw, setInvoiceParamValues } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import DropDownGrid from "../../../common/DropDownGrid";

import './InvoiceListing.css'

let compVar = {};

function InvoiceListingParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_fromDate = useSelector(state => state.invoiceParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.invoiceParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_companies_id = useSelector(state => state.invoiceParams.companies_id) || 4;
  let _g_divisions_id = useSelector(state => state.invoiceParams.divisions_id) || 0;

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
      companies_id: _g_companies_id, divisions_id: _g_divisions_id,
      companyLookup: [], divisionLookup: [], 
      company: '', division: '',
      errorMsg: '' 
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

    let query = "SELECT Companies_id, CompanyAlias FROM Companies WHERE Companies_id IN (1,4) ORDER BY CompanyAlias";
    compVar.companyLookup = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Invoice Listing'});   
    let idx = compVar.companyLookup.findIndex(rec => rec.Companies_id === compVar.companies_id);
    if (idx > -1) {
      compVar.company = compVar.companyLookup[idx].CompanyAlias;
    }

    query = "SELECT Divisions_id, Division FROM Divisions WHERE Divisions_id IN (0,4)";
    compVar.divisionLookup = await dbGetRecordRaw({query: query, x_uid: _g_users_id, x_module: 'Invoice Listing'});   
    idx = compVar.divisionLookup.findIndex(rec => rec.Divisions_id === compVar.divisions_id);
    if (idx > -1) {
      compVar.division = compVar.divisionLookup[idx].Division;
    }

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
  const refreshInvoiceData = async () => {
    
    // Save to redux store through params reducer
    dispatch(setInvoiceParamValues({
      fromDate: compVar.fromDate,
      toDate: compVar.toDate,
      companies_id: compVar.companies_id,
      divisions_id: compVar.divisions_id,
    }));

    getSelectedParams({refresh: true});

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
  const onCompanyChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.companies_id = e[0].Companies_id;      
      compVar.company = e[0].CompanyAlias;      
      refreshInvoiceData();
    }
  }

  //**********************************************************/
  const onDivisionChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.divisions_id = e[0].Divisions_id;      
      compVar.division = e[0].Division;      
      refreshInvoiceData();
    }
  }

  //**********************************************************/
  const getSelectedParams = async (paramObj) => {

    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        fromDate: compVar.fromDate,
        toDate: compVar.toDate,
        companies_id: compVar.companies_id,
        divisions_id: compVar.divisions_id,
        refresh: paramObj.refresh
      });
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
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    const labels = ['Inv. Between', 'and'];
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
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.companyLookup, compVar.divisionLookup];
    const fieldLists = [['CompanyAlias'], ['Division']];
    const valueExprs = ['Companies_id', 'Divisions_id'];
    const displayExprs = ['CompanyAlias', 'Division'];
    const labels = ['Company', 'Division'];
    const placeholders = ['Select a Company', 'Select a Division'];
    const valChanges = [onCompanyChanged, onDivisionChanged];
    const selectedVals = [compVar.company, compVar.division];

    const lookup = lookups[index];
    const fieldList = fieldLists[index];
    const valueExpr = valueExprs[index];
    const displayExpr = displayExprs[index];
    const label = labels[index];
    const placeholder = placeholders[index];
    const valChange = valChanges[index];
    const selectedVal = selectedVals[index];

    return (
        <DropDownGrid
          listArray={lookup}
          fieldList={fieldList}
          valueExpr={valueExpr}
          displayExpr={displayExpr}
          label={label}
          placeholder={placeholder}
          getSelectedRecord={valChange}
          showColumnHeaders={false}
          value={selectedVal}
          labelStyle={{width: 90}}
          dropDownStyle={{width: 60}}
        />

    );

  }

  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const widths = [35, 35, 90];
    const icons = ['arrowup', 'arrowdown', null];
    const onClicks = [nextMonth, prevMonth, refreshInvoiceData];
    const hints = ['Next Month', 'Prev Month', 'Refresh Data'];
    const texts = [null, null, 'Refresh'];

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
        <div className="list-invoices-panelparams-container">
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return (
      <div className="list-invoices-panelparams-container">

        <div style={{display: 'flex', flex: 5, paddingLeft: 5, alignItems:'center'}}>            
          <div className="list-invoices-panelparams-section-container">

            <div className="list-invoices-panelparams-section-container">

              <div className="list-invoices-panelparams-city-container">
                {dateParamsJsx(0)}
              </div>
              <div className="list-invoices-panelparams-city-container">
                {dateParamsJsx(1)}
              </div>
              <div className="list-invoices-panelparams-city-container">
                {buttonParamsJsx(0)}
                {buttonParamsJsx(1)}
                {buttonParamsJsx(2)}
              </div>

            </div>

          </div>
        </div>

        <div style={{display: 'flex', flex: 4}}>            
          <div className="list-invoices-panelparams-section-container">

            <div className="list-invoices-panelparams-section-container">
              <div className="list-invoices-panelparams-subsection-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                {dropDownParamsJsx(0)}
              </div>
              <div className="list-invoices-panelparams-subsection-container" style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 20, paddingRight: 5}}>
                {dropDownParamsJsx(1)}                
              </div>
            </div>

          </div>
        </div>        

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default InvoiceListingParams;
