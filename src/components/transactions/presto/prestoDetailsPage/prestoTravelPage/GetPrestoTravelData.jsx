import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import {Button} from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 'QuoTickets_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 4, label: "From City", field: 'From_Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 5, label: "Departs On", field: 'ETD', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true, required: true},    
  {key: 6, label: "ETD", field: 'ETD_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},    
  {key: 7, label: "ETD", field: 'ETD2', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM HH:mm'}, hasTime: true, required: false, isDbField: false},    

  {key: 10, label: "To City", field: 'To_Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 11, label: "Arrives On", field: 'ETA', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true, required: true},    
  {key: 12, label: "ETA", field: 'ETA_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},        
  {key: 13, label: "ETA", field: 'ETA2', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM HH:mm'}, hasTime: true, required: false, isDbField: false},    

  {key: 21, label: "Travel Mode", field: 'Tickets_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, required: true},
  {key: 22, label: "Class", field: 'Class_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1},
  {key: 23, label: "Drive Type", field: 'DriveTypes_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1},
  {key: 24, label: "Local Car Hire", field: 'LocalCarHire', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, booleanText: ['Yes','No'], default: false},

  {key: 44, label: "Flight/Train", field: 'FlightNo', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:40, buttons:[{name: 'trash', location: 'after', options: { icon: 'icons/trainStations.png', onClick: () => {alert('X')}, hint: 'List of Trains'}}]}, colSpan: 2},    
  {key: 45, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, colSpan: 1},
  {key: 46, label: "PNR No", field: 'PnrNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:20}},    
  {key: 47, label: "Coach No", field: 'CoachNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:20}},    
  {key: 48, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, colSpan: 1},

  {key: 56, label: "Train No.", field: 'TrainNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength:10}},    
  {key: 57, label: "From Station", field: 'From_TrainStations_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3},
  {key: 58, label: "To Station", field: 'To_TrainStations_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3},

  {key: 61, label: "Agent", field: 'AgentAddressbook_id', width: 150, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, colSpan: 2, hint: 'Based on Drive Type '},        
  {key: 62, label: "Vehicle", field: 'Vehicles_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, hint: 'Based on Cars > Agents > Car Hire '},
  {key: 63, label: "City Group", field: 'CarHireGroups_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, colSpan: 3},

  {key: 71, label: "Report On", field: 'CarReportDate', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true},    
  {key: 72, label: "At", field: 'CarReport_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},    
  {key: 73, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, colSpan: 1},
  {key: 74, label: "Release On", field: 'CarReleaseDate', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true},    
  {key: 75, label: "At", field: 'CarRelease_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},        

  {key: 81, label: "ReserveHotelOvernight", field: 'ReserveHotelOvernight', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 7, booleanText: ['Yes','No'], default: false},
  {key: 82, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 7, colSpan: 2},
  {key: 83, label: "Overnight", field: 'Overnight', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 7, booleanText: ['Yes','No'], default: false},
  {key: 84, label: "NoOfTickets", field: 'NoOfTickets', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 7, default: 1},
  {key: 85, label: "P2P", field: 'P2P', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 7, default: 0},
  {key: 86, label: "GroupOrderNo", field: 'GroupOrderNo', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 7},

  {key: 91, label: "Quotations_id", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},
  {key: 92, label: "QuoCities_id", field: 'QuoCities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},

  {key: 101, label: "Comments", field: 'Comments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 8, editorOptions: {maxLength:100}, colSpan: 2},    
  {key: 102, label: "Own Arrangement?", field: 'OwnArrangements', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 8, booleanText: ['Yes','No'], default: false, hint: 'Tick if client makes own arrangement'},
  {key: 103, label: "List of Services Comments", field: 'ServicesComments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 8, editorOptions: {maxLength:100}, colSpan: 3},    
  {key: 104, label: "Added Voucher Descr.", field: 'ExtraVoucherDescription', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 8, editorOptions: {maxLength:100}, colSpan: 3},    

  //{key: 101, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  //{key: 102, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {readOnly: true}},

];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  let modifiedArray = changeLayout(formObj.formData.Tickets_id, formObj.formData.DriveTypes_id, formObj.formData.LocalCarHire);

  let backgroundColor = (formObj.driveObj.isSectorDrivable) ? '#cce6ff' : '#ffd6cc';
  backgroundColor = (formObj.formData.Tickets_id !== 5 || formObj.formMode === 1) ? null : backgroundColor;

  // set function to call days of operation
  const idx = tableHeaderArray.findIndex(rec => rec.field==='FlightNo');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.trainListing;
    tableHeaderArray[idx].editorOptions.buttons[0].options.visible = (formObj.formData.Tickets_id === 2);
  }

  return (

    <React.Fragment>
      <Popup
          ref={formObj.formRef}
          visible={formObj.visible}
          hideOnOutsideClick={false}
          onHiding={formObj.onHiding}
          height={popupHeight}
          width={1200}
          title={formObj.formTitle}
          showTitle={true}          
          onFieldDataChanged={formObj.formFieldDataChanged}
      >

      {formObj.formData.Tickets_id === 5 &&
        <div style={{width: '100%', height: 35, display: 'flex', flexDirection: 'row', backgroundColor: backgroundColor}}>
          <div style={{flex: 6, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: 16, paddingLeft: 10}}>
            {formObj.formData.Tickets_id === 5 && formObj.formData.From_Cities_id !== null && 
             formObj.formData.To_Cities_id !== null && formObj.formData.QuoTickets_id !== null &&
             formObj.formData.From_Cities_id !== formObj.formData.To_Cities_id &&
             formObj.driveObj.remarks
            }
          </div>
          <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 30}}>
            {buttonsJsx(0, formObj)}
            {buttonsJsx(1, formObj)}
            {buttonsJsx(2, formObj)}
            {buttonsJsx(3, formObj)}
          </div>
        </div>
      }

      <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

      {popupTitle(formObj, popupTitleContainerStyle)}

      <Form
        colCount={1}
        id="form"
        formData={formObj.formData}
        onFieldDataChanged={formObj.formFieldDataChanged}
      >
        <TabbedItem colSpan={1}>
          <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(modifiedArray,0,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(modifiedArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(modifiedArray,2,formObj,dataObj)}
              {getDevextremeFormItems(modifiedArray,3,formObj,dataObj)}
              {getDevextremeFormItems(modifiedArray,4,formObj,dataObj)}
              {getDevextremeFormItems(modifiedArray,5,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,7,formObj,dataObj)}
              {getDevextremeFormItems(tableHeaderArray,8,formObj,dataObj)}
            </Item>
          </Tab>

        </TabbedItem>

      </Form>

      {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}

//**********************************************************/
export function buttonsJsx(index, formObj) {    

  const trainButtonDisabled = !(formObj.formData.Tickets_id === 2);
  const driveViaButtonDisabled = !(formObj.formData.Tickets_id === 5 && formObj.formMode === 2);

  const widths = [35,35,35,35];
  const types = ['normal','normal','normal','normal'];
  const stylingModes = ['outlined','outlined','outlined','outlined'];
  const icons = ['icons/trainStations.png','icons/routeBuilder.png','icons/calendar.png','icons/firstlast.png'];
  const hints = ['Get List of Trains','Drive Via','Set Report/Release Dates','Shift Car Report/Release'];
  const clicks = [formObj.trainListing,formObj.driveViaListing,formObj.carReportReleaseListing,formObj.shiftCarReportRelease];
  const disabledArr = [trainButtonDisabled,driveViaButtonDisabled,driveViaButtonDisabled,driveViaButtonDisabled];
  const visibleArr = [!trainButtonDisabled, !driveViaButtonDisabled, !driveViaButtonDisabled,!driveViaButtonDisabled];
  const texts = [null,null,null];

  const width = widths[index];
  const type = types[index];
  const stylingMode = stylingModes[index];
  const icon = icons[index];
  const hint = hints[index];
  const click = clicks[index];
  const disabled = disabledArr[index];
  const visible = visibleArr[index];
  const text = texts[index];

  return (
    <Button
      width={width}
      type={type}
      stylingMode={stylingMode}
      icon={icon}
      hint={hint}
      onClick={click}
      disabled={disabled}
      text={text}
      visible={visible}
    />
  );
}


//**********************************************************/
export function changeLayout(tickets_id, driveTypes_id, LocalCarHire) {

  let modifiedArray = [];

  tableHeaderArray.forEach(rec => {
    let item = {...rec};

    // For Air, hide group nos 3,4 & 5
    if (tickets_id === 1) {
      if (rec.groupNo === 3 || rec.groupNo === 4 || rec.groupNo === 5) {
        item.visibleInForm = false;
        if (item.field === 'AgentAddressbook_id') {
          item.visibleInForm = true;
        }
      }
    } else if (tickets_id === 2) {
      if (rec.groupNo === 4 || rec.groupNo === 5) {
        item.visibleInForm = false;
      }
      if (item.field === 'AgentAddressbook_id') {
        item.visibleInForm = true;
      }
    } else if (tickets_id === 5) {
      if (rec.groupNo === 2 || rec.groupNo === 3) {
        item.visibleInForm = false;
      }
    } else {
      if (rec.groupNo === 2 || rec.groupNo === 3 || rec.groupNo === 4 || rec.groupNo === 5) {
        item.visibleInForm = false;
      }
    }

    modifiedArray.push(item);

  })


  let index = modifiedArray.findIndex(rec => rec.field === 'Class_id');
  if (index > -1) {
    modifiedArray[index].visibleInForm = (tickets_id === 1 || tickets_id === 2) ? true : false;
  }

  index = modifiedArray.findIndex(rec => rec.field === 'DriveTypes_id');
  if (index > -1) {
    modifiedArray[index].visibleInForm = (tickets_id === 5) ? true : false;    
  }

  index = modifiedArray.findIndex(rec => rec.field === 'LocalCarHire');
  if (index > -1) {
    modifiedArray[index].visibleInForm = (tickets_id === 5) ? true : false;    
  }

  index = modifiedArray.findIndex(rec => rec.field === 'CarHireGroups_id');
  if (index > -1) {
    modifiedArray[index].visibleInForm = (tickets_id === 5 && driveTypes_id === 3) ? true : false;
  }

  index = modifiedArray.findIndex(rec => rec.field === 'PnrNo');
  if (index > -1) {
    modifiedArray[index].visibleInForm = (tickets_id === 1 || tickets_id === 2) ? true : false;
  }

  index = modifiedArray.findIndex(rec => rec.field === 'CoachNo');
  if (index > -1) {
    modifiedArray[index].visibleInForm = (tickets_id === 2) ? true : false;
  }

  index = modifiedArray.findIndex(rec => rec.field === 'ETA_Time');
  if (index > -1) {
    modifiedArray[index].editorOptions.readOnly = (tickets_id === 5 && LocalCarHire !== true) ? true : false;
  }

  // This has to be done if Mode of Travel not filled in ....
  // Otherwise groups 2,3,4,5 all return blank and then the form shows all fields !!!
  index = modifiedArray.findIndex(rec => rec.field === 'EmptyItem' && rec.groupNo === 5);
  if (index > -1 && tickets_id === null) {
    modifiedArray[index].visibleInForm = true;
  }

  return modifiedArray;
    
}
