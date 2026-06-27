import React, { useEffect, useState } from 'react';
import { convert_DbDate_To_DMY, convertDMYtoDate, getNowDate, addDay, getStartEndOfMonth } from "../../../common/CommonTransactionFunctions";
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import DropDownGrid from "../../../common/DropDownGrid";
import {Popup} from 'devextreme-react/popup';
import TextBox from 'devextreme-react/text-box';

// some of the devextreme css properties are overridden
import './VoucherReportRange.css';

let compVar = {};

function VoucherReportRange(props) {
  
  const [renderToggle, setRenderToggle] = useState(false);  

  let _g_dateObj = {};
  if (props.dateRangeType === 1) {
    _g_dateObj = getStartEndOfMonth(new Date());
  }

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  useEffect (() => {
    compVar = {
      fromDate: (props.dateRangeType === 1) ? convert_DbDate_To_DMY(_g_dateObj.startDate, 1) : getNowDate('DD/MM/YYYY'), 
      toDate: (props.dateRangeType === 1) ? convert_DbDate_To_DMY(_g_dateObj.endDate, 1) : addDay(getNowDate('DD/MM/YYYY'),1,2),
      tourCode: '',
      activeReportTypes_id: 1, activeReportType: '',
      refresh: false, reportInProgress: false,
      reportsData: [
        {type_id: 1, reportCategory: 'Date Range'}, 
        {type_id: 2, reportCategory: 'Tour Code'}      
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

    const idx = compVar.reportsData.findIndex(rec => rec.type_id === compVar.activeReportTypes_id);        
    compVar.activeReportType = compVar.reportsData[idx].reportCategory;

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
  const onFromDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.fromDate = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const onToDateChanged = (e) => {
    if (e !== undefined && e !== null) {
      compVar.toDate = convert_DbDate_To_DMY(e.value,1);
      if (props.formType === 2) {
        compVar.fromDate = compVar.toDate;
      }
      forceRender();
    }
  }
  
  //**********************************************************/
  const closePopover = async () => {    
    const refresh = compVar.refresh;

    if (props.getSelectedReportRangeOption !== undefined) {
      await props.getSelectedReportRangeOption({open: false, refresh: refresh, 
        reportCategory: compVar.activeReportTypes_id,
        fromDate: compVar.fromDate, toDate: compVar.toDate,
        tourCode: compVar.tourCode
      });
    }    
    forceRender();
  };  

  //**********************************************************/
  const createReport = async () => {    
    compVar.refresh = true;
    await closePopover();
  };  

  //**********************************************************/
  const cancelReport = async () => {    
    compVar.refresh = false;
    await closePopover();
  };  


  //**********************************************************/
  const onReportTypeChanged = async (e) => {
    compVar.activeReportTypes_id = e[0].type_id;
    compVar.activeReportType = e[0].reportCategory;
    forceRender();
  }  

  //**********************************************************/
  const onTourCodeChange = async (e) => {

    if (e.value !== undefined) {
      compVar.tourCode = e.value;
      forceRender();
    }
  }  

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const fromDate = convertDMYtoDate(compVar.fromDate); 
    const toDate = convertDMYtoDate(compVar.toDate); 

    const toDateStr = (props.formType === 2) ? 'As of:' : 'To:';

    const labels = ['From:', toDateStr];
    const values = [fromDate, toDate];
    const dateChanges = [onFromDateChanged, onToDateChanged];

    const label = labels[index];
    const value = values[index];
    const dateChange = dateChanges[index];


    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 16, paddingRight: 10}}>
          {label}
        </div>
        <div style={{flex: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
          <DateBox 
            type={"date"}
            width={150}
            displayFormat={"dd/MM/yyyy"}
            value={value} 
            onValueChanged={dateChange}
            style={{fontSize: 18}}
            acceptCustomValue={false}
          />
        </div>
      </div>      
    )
  }  

  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.reportsData];
    const fieldLists = [['reportCategory']];
    const valueExprs = ['type_id'];
    const displayExprs = ['reportCategory'];
    const labels = ['Report Type'];
    const placeholders = ["Select a report type..."];
    const getSelectedRecs = [onReportTypeChanged];
    const values = [compVar.activeReportType];
    const componentWidths = [250];
    const dropDownWidths = [300];
    const labelStyles = [{}] 

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
  const textParamsJsx = (index) => {

    const labels = ['Tour Code'];
    const widths = [160];
    const defaultValues = [compVar.tourCode];
    const valueChanges = [onTourCodeChange];

    const label = labels[index];
    const width = widths[index];
    const defaultValue = defaultValues[index];
    const valueChange = valueChanges[index];
    
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%'}}>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontSize: 16}}>
          {label}
        </div>
        <div style={{flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
          <TextBox 
            width={width}
            defaultValue={defaultValue} 
            onValueChanged={valueChange}
          />
        </div>
      </div>
    );

  }

  //**********************************************************/
  const buttonsJsx = () => {

    const buttonContainerStyle = {
      height: 60,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    /*=== Called from tickets in DTD ===*/
    return (
      <>
        <div style={buttonContainerStyle}>
          <div style={{display: 'flex', flex: 1}}>
          </div>

          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Cancel" type="default" onClick={cancelReport}/>
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text={"Create Report"} disabled={false} type="success" onClick={createReport}/>
          </div>

          <div style={{display: 'flex', flex: 1}}>
          </div>
        </div>
        </>
      )
    
  }

  
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    const boxHeight = 100;
    const open = (props.open === undefined) ? true : props.open;

    return (
      <Popup visible={open} height={400} width={900} onHiding={closePopover}>

        <div className="report-page-container" style={{height: containerHeight}}>

          <h2 className="report-header">
            Voucher Listing (in Excel/XML)
          </h2>

          {props.reportType !== undefined && props.reportType === 2 &&
            <h2 className="report-item" style={{paddingTop: 10}}>
              <div className="box-outer-container">
                {dropDownParamsJsx(0)}
              </div>
            </h2>
          }

          <div className="box-outer-container">
            <div className="box-params-container" style={{height: boxHeight, width: 480, flexDirection: 'row'}}>
              {props.formType !== 2 && compVar.activeReportTypes_id === 1 &&
                <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  {dateParamsJsx(0)}
                </div>
              }
              {compVar.activeReportTypes_id === 1 &&
                <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  {dateParamsJsx(1)}
                </div>
              }
              {compVar.activeReportTypes_id === 2 &&                  
                <h2 className="report-item" style={{paddingTop: 10}}>
                  <div className="box-outer-container">
                    {textParamsJsx(0)}
                  </div>
                </h2>
              }
            </div>
          </div>

          {buttonsJsx()}

        </div>

      </Popup>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}

export default VoucherReportRange;

