import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { convert_DbDate_To_DMY, convertDMYtoDate, convertDMYtoDateObj, convertDMY_MDY, addMonth, getFirstOfMonth_DMY, getLastOfMonth_DMY } from "../../../common/CommonTransactionFunctions";
import { dbGetRecordRaw, setInvoiceParamValues } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import DropDownButton from 'devextreme-react/drop-down-button';

import './Invoices.css'

let compVar = {};

function InvoiceParams(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  let _g_fromDate = useSelector(state => state.invoiceParams.fromDate) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_toDate = useSelector(state => state.invoiceParams.toDate) || convert_DbDate_To_DMY (new Date(), 1);

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
      errorMsg: '',
      numFutureInvoices: 0,
      popupDialogIndex: 0, 
      actionList: [
        {key: 1, text: 'Generate All Invoices'}, 
        {key: 2, text: 'Delete All Invoices'}, 
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
    await getFutureInvoices();
    setInitDataFetched(true);
  }

  //**********************************************************/
  const nextMonth = async () => {
    compVar.fromDate = addMonth(compVar.fromDate, 1, 2);
    const fromDate = convertDMYtoDateObj(compVar.fromDate);
    compVar.fromDate = getFirstOfMonth_DMY(fromDate,0);
    compVar.toDate = getLastOfMonth_DMY(fromDate,0);
    await getFutureInvoices();
    forceRender();
  }

  //**********************************************************/
  const prevMonth = async() => {
    compVar.fromDate = addMonth(compVar.fromDate, -1, 2);
    const fromDate = convertDMYtoDateObj(compVar.fromDate);
    compVar.fromDate = getFirstOfMonth_DMY(fromDate,0);
    compVar.toDate = getLastOfMonth_DMY(fromDate,0);
    await getFutureInvoices();
    forceRender();
  }

  //**********************************************************/
  const refreshInvoiceData = async () => {
    
    const fromDate = convertDMYtoDateObj(compVar.fromDate);
    const toDate = convertDMYtoDateObj(compVar.toDate);
    const invoiceDate = convertDMYtoDateObj(compVar.invoiceDate);

    if (invoiceDate.getTime() < fromDate.getTime() || invoiceDate.getTime() > toDate.getTime()) {
      compVar.invoiceDate = compVar.toDate;
      forceRender();
    }

    // Save to redux store through params reducer
    dispatch(setInvoiceParamValues({
      fromDate: compVar.fromDate,
      toDate: compVar.toDate,
      numFutureInvoices: compVar.numFutureInvoices
    }));

    getSelectedParams({refresh: true, popup: false});

  }

  //**********************************************************/
  const setDates = async (mode) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    /*=== fromDate was changed ===*/
    if (mode === 1) {
      if (fromDate.getTime() > toDate.getTime() || fromDate.getMonth() !== toDate.getMonth()) {
        compVar.toDate = getLastOfMonth_DMY(fromDate,0);
        await getFutureInvoices();
      }
    } else if (mode === 2) {
      if (toDate.getTime() < fromDate.getTime() || fromDate.getMonth() !== toDate.getMonth()) {
        compVar.fromDate = getFirstOfMonth_DMY(toDate,0);
      }
    }

    adjustInvoiceDates();

  }

  //**********************************************************/
  const adjustInvoiceDates = () => {

    const fromDate = convertDMYtoDateObj(compVar.fromDate);
    const toDate = convertDMYtoDateObj(compVar.toDate);
    const invoiceDate = convertDMYtoDateObj(compVar.invoiceDate);

    if (invoiceDate.getTime() < fromDate.getTime() || invoiceDate.getTime() > toDate.getTime()) {
      compVar.invoiceDate = compVar.toDate;
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
      await getFutureInvoices();
      setDates(2);
      forceRender();
    }
  }

  //**********************************************************/
  const onInvoiceDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.invoiceDate = convert_DbDate_To_DMY(e.value,1);
      adjustInvoiceDates();
      forceRender();
    }
  }

  //**********************************************************/
  const getSelectedParams = async (paramObj) => {

    if (props.getSelectedParams !== undefined) {
      await props.getSelectedParams ({
        fromDate: compVar.fromDate,
        toDate: compVar.toDate,
        invoiceDate: compVar.invoiceDate,
        popupDialogIndex: compVar.popupDialogIndex,
        numFutureInvoices: compVar.numFutureInvoices,
        refresh: paramObj.refresh,
        popup: paramObj.popup
      });
    }

  }

  //**********************************************************/
  const getFutureInvoices = async() => {

    const query = "SELECT COUNT(*) AS xCount " + 
      "FROM Invoices " +
      "WHERE InvoiceDate > '" + convertDMY_MDY(compVar.toDate) + "' " +
      "AND Companies_id = 4";
    const invData = await dbGetRecordRaw({query: query});

    compVar.numFutureInvoices = 0;
    if (invData.length > 0) {
      compVar.numFutureInvoices = invData[0].xCount;
    }

  }
  
  //**********************************************************/
  const onActionDropDownClick = async(e) => {

    if (e.itemData.key === 1) {
      compVar.popupDialogIndex = 0;
      getSelectedParams({refresh: false, popup: true});
    } else if (e.itemData.key === 2) {
      compVar.popupDialogIndex = 1;
      getSelectedParams({refresh: false, popup: true});
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
    const invoiceDate = convertDMYtoDate(compVar.invoiceDate); 

    const labels = ['Tours Between', 'and', 'Invoice Date'];
    const dates = [fromDate, toDate, invoiceDate];
    const onValuesChanged = [onFromDateChanged, onToDateChanged, onInvoiceDateChanged];

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
  const dropDownParamsJsx = () => {

    const disabled = (compVar.numFutureInvoices > 0);

    return (
        <DropDownButton
          text="Actions for Period"
          icon="bulletlist"
          dropDownOptions={{width: 230}}
          dataSource={compVar.actionList}
          displayExpr="text"
          disabled={disabled}
          onItemClick={onActionDropDownClick}
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
        <div className="invoices-panelparams-container">
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return (
      <div className="invoices-panelparams-container" style={{display: 'flex', alignItems: 'center'}}>

        <div style={{display: 'flex', flex: 5, paddingLeft: 5}}>            
          <div className="invoices-panelparams-section-container">

            <div className="invoices-panelparams-city-container">
              {dateParamsJsx(0)}
            </div>
            <div className="invoices-panelparams-city-container">
              {dateParamsJsx(1)}
            </div>
            <div className="invoices-panelparams-city-container">
              {buttonParamsJsx(0)}
              {buttonParamsJsx(1)}
              {buttonParamsJsx(2)}
            </div>

          </div>
        </div>

        <div style={{display: 'flex', flex: 4}}>            
          <div className="invoices-panelparams-section-container">

            <div className="invoices-panelparams-subsection-container" style={{flex: 3}}>
              {dateParamsJsx(2)}
            </div>
            <div className="invoices-panelparams-subsection-container" style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
              {dropDownParamsJsx()}                
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

export default InvoiceParams;
