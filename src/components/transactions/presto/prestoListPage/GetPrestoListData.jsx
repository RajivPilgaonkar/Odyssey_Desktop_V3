import React from 'react';
import { Button } from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { popupTitle, popupFooter, toast } from "../../../common/HelperComponents";
import { convert_DbDate_To_DMY, convert_DbDate_To_HHmm, getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {getDevExtremeStandardTable} from "../../../common/HelperComponents";
import PrestoCities from '../prestoCitiesPage/PrestoCities';
import PrestoItineraryManager from '../prestoItineraryManagerPage/PrestoItineraryManager';
import PrestoDtd from '../prestoDayToDayPage/PrestoDtd';
import PrestoCost from '../prestoCostPage/PrestoCost';
import PrestoCompositeReportManager from '../prestoCompositeReportManagerPage/PrestoCompositeReportManager';
import PrestoHotelAgent from '../prestoHotelAgentPage/PrestoHotelAgent';
import PrestoMailing from '../prestoMailingPage/PrestoMailing';
import PrestoChangePax from '../prestoChangePaxPage/PrestoChangePax';
import PrestoIdle from '../prestoIdlePage/PrestoIdle';
import PrestoBookings from '../prestoBookingsPage/PrestoBookings';
import PrestoAssignModule from '../prestoAssignModulePage/PrestoAssignModule';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Pax", field: 'PaxName', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    
    
    {key: 3, label: "Tour Code", field: 'TourCode', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:10, readOnly: false}},    
    {key: 4, label: "Tour Date", field: 'StartDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 5, label: "Tour No.", field: 'TourNo', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {format: '##0'}},

    {key: 11, label: "Travellers", field: 'NumPax', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, required: true, default: 2},
    {key: 12, label: "Singles", field: 'NumSingles', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: 0},
    {key: 13, label: "Doubles", field: 'NumDoubles', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: 1},
    {key: 14, label: "Triples", field: 'NumTriples', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: 0},
    {key: 15, label: "Twins", field: 'NumTwins', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: 0},

    {key: 21, label: "Arrives On", field: 'DateOfArrival', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}, colSpan: 2, required: true},
    {key: 22, label: "Arrives From", field: 'PlaceFrom', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, colSpan: 2},    
    {key: 23, label: "Arrives In", field: 'StartCities_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, colSpan: 2, required: true, default: 103},    
    {key: 24, label: "Arrival Flight No.", field: 'FlightNo', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:30, readOnly: false}, colSpan: 2},    
    {key: 25, label: "ETA", field: 'ETA', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {maxLength:5}},    
    {key: 26, label: "ETA", field: 'ETA_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},        
    {key: 27, label: "Domestic", field: 'domestic', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, default: false},

    {key: 31, label: "Departs On", field: 'DateOfDeparture', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}, colSpan: 2, required: true},
    {key: 32, label: "Departs To", field: 'PlaceTo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, colSpan: 2},    
    {key: 33, label: "Departs From", field: 'EndCities_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, colSpan: 2},    
    {key: 34, label: "Departure Flight No.", field: 'FlightNoDept', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:30, readOnly: false}, colSpan: 2},    
    {key: 35, label: "ETD", field: 'ETD', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {maxLength:5}},    
    {key: 36, label: "ETD", field: 'ETD_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},    
    {key: 37, label: "Domestic", field: 'DeptDomestic', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, default: false},

    {key: 40, label: "Notes", field: 'Comment', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength:100, readOnly: false}, colSpan: 4},    

    {key: 60, label: "Agent", field: 'PrincipalAgents_id', width: 200, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 5, colSpan: 2},    
    {key: 61, label: "Reference", field: 'Reference', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:50, readOnly: false}},    
    {key: 62, label: "Web", field: 'Web', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, default: false},
    {key: 63, label: "Consultant", field: 'Consultants_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 5, colSpan: 2, required: false},    
    {key: 64, label: "Primary Email", field: 'Email', width: 120, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100, readOnly: false}, colSpan: 2},    
    {key: 65, label: "Country", field: 'Countries_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 5, colSpan: 2},    
    {key: 66, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 5, default: 27, colSpan: 2},    

    {key: 70, label: "Booking Recd. On", field: 'QuotationDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 71, label: "Entered On", field: 'BookingEntryDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}, required: true},
    {key: 72, label: "Booking Recd. On", field: 'BookingRecdDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 6, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 73, label: "Quotation Sent On", field: 'QuotationSendDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 74, label: "Quotation No.", field: 'QuotationNo', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {format: '#,##0', readOnly: true}},
    {key: 75, label: "Year Ref", field: 'QuotationYearRef', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 6, required: true},
    {key: 76, label: "Quotation Ref", field: 'QuotationRef', width: 120, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {maxLength:20}},    

    {key: 80, label: "Car", field: 'Vehicles_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 7, colSpan: 2, default: 42},    
    {key: 81, label: "Hotel Type", field: 'HotelTypes_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 7, colSpan: 2, default: 6},    
    {key: 82, label: "Meal Plan", field: 'MealPlans_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 7, default: 2},    
    {key: 83, label: "Entrance Fees", field: 'EntranceFees', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 7, default: false},
    {key: 84, label: "Extra Bed", field: 'ExtraBed', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 7, default: false},
    {key: 85, label: "Guide", field: 'Guide', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 7, default: true},

    {key: 90, label: "Cancelled", field: 'CancelledOn', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 91, label: "Created By", field: 'UserName', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 9, colSpan: 6, editorOptions: {maxLength:30, readOnly: true}, required: false, isDbField: false},    

    {key: 92, label: "Trial", field: 'Trial', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, required: true, default: 0},
    {key: 93, label: "Car Hire Agent", field: 'CarHireAgents_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, default: 2170},    
    {key: 94, label: "Car Hire City", field: 'CarHireCities_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, default: 176},    
    {key: 95, label: "Confirmed", field: 'Confirmed', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, default: false},
    {key: 96, label: "Extra Margin(%)", field: 'ExtraMargin', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0 },    
    {key: 97, label: "End Date", field: 'EndDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 11, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

    {key: 100, label: "Created By", field: 'AdmUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 10, editorOptions: {readOnly: true}},
    {key: 103, label: "Allow Access To", field: 'Managers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 10},
    {key: 102, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 10, editorOptions: {readOnly: true}},
    {key: 101, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 10, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},

    {key: 110, label: "Masters_id", field: 'Masters_id', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 10, isDbField: false},

  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

//**********************************************************/
export function buttonsJsx(index,formObj) {

  const disabledButton = (formObj.formMode === 1) ? true : false;

  const widths = [35,35];
  const heights = [35,35];
  const types = ["normal","normal"];
  const stylingModes = ["outlined","outlined"];
  const icons = ["chevronleft","icons/calendar.png"];
  const hints = ["Back","Old DTD"];  
  const onClicks = [formObj.closeForm,formObj.oldDtd];
  const disabledButtons = [false,disabledButton];

  const width = widths[index];
  const height = heights[index];
  const type = types[index];
  const stylingMode = stylingModes[index];
  const icon = icons[index];
  const hint = hints[index];
  const onClick = onClicks[index];
  const disabled = disabledButtons[index];

  return (
    <Button
      width={width}
      height={height}
      type={type}
      stylingMode={stylingMode}
      icon={icon}
      hint={hint}
      onClick={onClick}
      disabled={disabled}
    />  
  );

}

//**********************************************************/
export function dropDownButtonJsx(index,formObj) {

  const texts = ['Reports'];
  const icons = ["exportpdf"];
  const widths = [110];
  const dropDownWidths = [{width: 200}];
  const items = [formObj.reportsData];
  const keyExprs = ['id'];
  const displayExprs = ['text'];
  const buttonsDisabled = [(formObj.dataType === 3)];
  const itemClicks = [formObj.onReportClick];

  const text = texts[index];
  const icon = icons[index];
  const width = widths[index];
  const dropDownWidth = dropDownWidths[index];
  const item = items[index];
  const keyExpr = keyExprs[index];
  const displayExpr = displayExprs[index];
  const disabled = buttonsDisabled[index];
  const itemClick = itemClicks[index];

  return (
    <DropDownButton
      text={text}
      icon={icon}
      width={width}
      dropDownOptions={dropDownWidth}
      items={item}
      keyExpr={keyExpr}
      displayExpr={displayExpr}
      disabled={disabled}
      onItemClick={itemClick}
    />
  );
}

//**********************************************************/
export function getDevExtremePopupForm(formObj,dataObj,prestoParamsObj) {

  if (formObj === undefined || formObj === null) {
    return;
  }

  const title = (formObj.formMode !== 1) ? prestoParamsObj.pax : 'New Tour';

  const strikethrough = (formObj.formData.CancelledOn) ? 'line-through' : null;

  let borderColor = (formObj.formData.Trial === 1) ? 'rgb(255, 0, 0)' : null;
  let backgroundColor = (formObj.formData.Trial === 1) ? 'rgb(255, 204, 204)' : null;
  if (formObj.formData.Trial === 3) {
    borderColor = 'rgb(0, 138, 230)';
    backgroundColor = 'rgb(204, 235, 255)';
  }
  const border = (borderColor !== null) ? '1px solid ' + borderColor : null;

  let arrivalDate = (formObj.formData.DateOfArrival) ? convert_DbDate_To_DMY(formObj.formData.DateOfArrival,1) : '';
  if (arrivalDate !== null) {
    let eta = (formObj.formData.ETA) ? convert_DbDate_To_HHmm(formObj.formData.ETA.replace('T', ' ').replace('Z', ''),1) : '';
    arrivalDate += ' ' + eta;
  }

  let departureDate = (formObj.formData.DateOfDeparture) ? convert_DbDate_To_DMY(formObj.formData.DateOfDeparture,1) : '';
  if (departureDate !== null) {
    let etd = (formObj.formData.ETD) ? convert_DbDate_To_HHmm(formObj.formData.ETD.replace('T', ' ').replace('Z', ''),1) : '';
    departureDate += ' ' + etd;
  }

  const disabled = (formObj.formMode === 1);

  return (

    <React.Fragment>

      {popupTitle(formObj, popupTitleContainerStyle)}

      {!formObj.itineraryBuilder && 
        <div className="master-detail-top-panel" style={{border: border}}>
          <div className="master-detail-top-panel-button-container">
            {buttonsJsx(0,formObj)}
            {1===2 && buttonsJsx(1,formObj)}
            <div style={{fontSize: 16, display: 'flex', flex: 2.2, justifyContent: 'center', alignItems: 'center', paddingLeft: 10}}>
              {title}
            </div>
            {formObj.formMode !== 1 &&
              <>
                <div style={{display: 'flex', flex: 1, paddingLeft: 10, fontSize: 18, color: '#0066cc', fontWeight: 500, textDecoration: strikethrough, justifyContent: 'center', alignItems: 'center', background: backgroundColor}}>
                  {`${(prestoParamsObj.tourCode !== null) ? prestoParamsObj.tourCode : '' }`} &nbsp; &nbsp; {`${prestoParamsObj.tourDate} ` }
                </div>
              </>
            }
            <div style={{display: 'flex', flex: 2.5, justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 5, paddingRight: 5}}>
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', paddingRight: 10}}>
                {dropDownButtonJsx(0,formObj)}
              </div>
              {formObj.reportInProgress &&
                <div>
                  <LoadIndicator id="small-indicator" height={30} width={30} />
                </div>
              }
              {formObj.buttonList.map((rec) => 
                <Button 
                  key={rec.id}                   
                  width={35}
                  height={35}
                  type="normal"
                  stylingMode="outlined"
                  icon={rec.icon}
                  hint={rec.hint}
                  disabled={disabled}
                  onClick={() => formObj.changeView(rec.id)}
                />              
              )}
            </div>
          </div>
        </div>
      }

      {formObj.viewType === 1 && 

        <div className="master-form-without-popup" style={{width: '100%'}}>

          <Form
            style={{width: '100%'}}
            colCount={1}
            id="prestoForm"
            formData={formObj.formData}
            onFieldDataChanged={formObj.formFieldDataChanged}
            labelLocation={formObj.labelLocation}
          >

            <TabbedItem colSpan={1}>
              <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>                  
              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} colCount={8}>
                <Item itemType="group" caption="" colSpan={6}>
                  <Item itemType="group" caption="" colCount={5}>
                    {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                  </Item>
                  <Item itemType="group" caption="Flight Details" colCount={10}>
                    {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
                  </Item>
                  <Item itemType="group" caption="" colCount={4}>
                    {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
                  </Item>
                </Item>
                <Item itemType="group" caption="" colSpan={2} colCount={2} cssClass="groupRightClass">
                  {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
                <Item itemType="group" caption = "" colCount={4} >
                  {getDevextremeFormItems(tableHeaderArray,6,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption = "Preferences" colCount={8} >
                  {getDevextremeFormItems(tableHeaderArray,7,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption = "Last Edited" colCount={4} >
                  {getDevextremeFormItems(tableHeaderArray,10,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined && formObj.formMode === 2) ? formObj.tabs[2].title : ''} >
                <PrestoBookings
                  quotations_id={formObj.formData.Quotations_id}
                  paxName={formObj.formData.PaxName}
                />
              </Tab>

            </TabbedItem>

          </Form>

          {popupFooter(formObj, popupFooterButtonContainerStyle, formObj.navObj)}

        </div>

      }

      {formObj.viewType === 2 &&
        <PrestoCities
          quotations_id={formObj.formData.Quotations_id}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
          startCities_id={formObj.formData.StartCities_id}
          endCities_id={formObj.formData.EndCities_id}
          arrivalDate={arrivalDate}
          departureDate={departureDate}
          endDate={(formObj.formData.DateOfDeparture) ? convert_DbDate_To_DMY(formObj.formData.DateOfDeparture,1) : null}
          numPax={formObj.formData.NumPax}
          onChangeModeReorder={formObj.onChangeModeReorder}
          onMoveDates={formObj.onMoveDates}
        />            
      }

      {formObj.viewType === 20 &&
        <PrestoItineraryManager
          quotations_id={formObj.formData.Quotations_id}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
          tourCode={formObj.formData.TourCode}
        />            
      }

      {formObj.viewType === 3 && 
        <PrestoDtd
          quotations_id={formObj.formData.Quotations_id}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
          tourCode={formObj.formData.TourCode}
        />            
      }

      {formObj.viewType === 4 &&
        <PrestoCost
          quotations_id={formObj.formData.Quotations_id}
          tourCode={formObj.formData.TourCode}
          tourDate={formObj.formData.StartDate}
          currencies_id={formObj.formData.Currencies_id}
        />            
      }

      {formObj.viewType === 5 &&
        <PrestoCompositeReportManager
          quotations_id={formObj.formData.Quotations_id}
          tourCode={formObj.formData.TourCode}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
        />            
      }

      {formObj.viewType === 6 &&
        <PrestoHotelAgent
          quotations_id={formObj.formData.Quotations_id}
        />            
      }

      {formObj.viewType === 7 &&
        <PrestoMailing
          quotations_id={formObj.formData.Quotations_id}
          tourCode={formObj.formData.TourCode}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
          pax={formObj.formData.PaxName}
          numPax={formObj.formData.NumPax}
        />            
      }

      {formObj.viewType === 8 &&
        <PrestoChangePax
          quotations_id={formObj.formData.Quotations_id}
          tourCode={formObj.formData.TourCode}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
          tourEndDate={convert_DbDate_To_DMY(formObj.formData.EndDate,1)}
          pax={formObj.formData.PaxName}
          numPax={formObj.formData.NumPax}
        />            
      }

      {formObj.viewType === 9 &&
        <PrestoIdle
          quotations_id={formObj.formData.Quotations_id}
          tourCode={formObj.formData.TourCode}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
          tourEndDate={convert_DbDate_To_DMY(formObj.formData.EndDate,1)}
          pax={formObj.formData.PaxName}
          numPax={formObj.formData.NumPax}
        />            
      }

      {formObj.viewType === 10 &&
        <PrestoAssignModule
          quotations_id={formObj.formData.Quotations_id}
          tourCode={formObj.formData.TourCode}
          tourDate={convert_DbDate_To_DMY(formObj.formData.StartDate,1)}
        />            
      }

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}

  