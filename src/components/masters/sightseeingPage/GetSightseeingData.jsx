import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";
import SightseeingTimings from './sightseeingTimingsPage/SightseeingTimings';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Services_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Order No.", field: 'DefaultOrder', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

    {key: 3, label: "Service", field: 'Description', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 4, required: true, editorOptions: {maxLength: 100}},  
    {key: 4, label: "Default Agent", field: 'Addressbook_id', width: 200, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 3, required: true, allowFilter: true},    
    {key: 500, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    
    {key: 5, label: "Cities_id", field: 'Cities_id', width: 300, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, required: true},    

    {key: 6, label: "Duration", field: 'duration', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5, mask: '00:00'}, hint: "Ex. 23:15, 08:25", required: true},        
    {key: 7, label: "Operates On", field: 'DaysOfOperation', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 127, required: true},
    {key: 8, label: "Operates On", field: 'DayString', width: 160, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, default: 'Daily', required: true, colSpan: 2, editorOptions: {readOnly: false, buttons:[{name: 'trash', location: 'after', options: { icon: 'icons/daysOfOperation.png', onClick: () => {alert('X')}}}]}, isDbField: false, cssClass: "button-read-only-simple-item"},
    {key: 9, label: "Timing", field: 'Timing', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, default: '', isDbField: false},
    {key: 10, label: "Active", field: 'Active', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, default: true, booleanText: ['Yes','No']},
    {key: 11, label: "LoS String", field: 'ListOfServicesString', width: 120, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, default: '', colSpan: 2, editorOptions: {maxLength: 100}, hint: 'List of Services String'},

    {key: 21, label: "Transfer", field: 'Transfer', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: false, booleanText: ['Yes','No']},
    {key: 23, label: "Private", field: 'Private', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: false, booleanText: ['Yes','No']},
    {key: 24, label: "Recommended", field: 'Recommended', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: true, booleanText: ['Yes','No']},
    {key: 25, label: "Refundable", field: 'Refundable', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: true, booleanText: ['Yes','No']},
    {key: 26, label: "Day At Leisure", field: 'DayAtLeisure', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: false, booleanText: ['Yes','No']},

    {key: 30, label: "Adv Bkg Reqd?", field: 'AdvBooking', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, default: false, booleanText: ['Yes','No']},
    {key: 31, label: "Guide Reqd?", field: 'Guide', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, default: true, booleanText: ['Yes','No']},
    {key: 32, label: "Transport Reqd?", field: 'TransportReqd', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, default: true, booleanText: ['Yes','No']},
    {key: 33, label: "Day Excursion", field: 'DayExcursion', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, default: false, booleanText: ['Yes','No']},
    {key: 34, label: "Own Transport?", field: 'OwnTransport', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: false, booleanText: ['Yes','No']},

    {key: 50, label: "When Hotel is not", field: 'NotHotelAddressbook_id', width: 400, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, colSpan: 3},    
    {key: 51, label: "Pop Up Message", field: 'MessagePopup', width: 300, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, colSpan: 3, editorType: 'dxTextArea', editorOptions: {maxLength: 1000, height: 120}, hint: 'Suggested max 1000 char'},  

    {key: 60, label: "Image", field: 'image', width: 400, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, colSpan: 3, required: false},    
    {key: 61, label: "Write Up", field: 'writeup', width: 300, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, colSpan: 3, required: false, editorType: 'dxTextArea', editorOptions: {maxLength: 1000, height: 150}, hint: 'Suggested max 1000 char'},  

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 5, editorOptions: {readOnly: true}},

  ];

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  // set function to call days of operation
  const idx = tableHeaderArray.findIndex(rec => rec.field==='DayString');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.onSelectDaysOfOperation;
  }

  return (

    <React.Fragment>

      {popupTitle(formObj, popupTitleContainerStyle)}

      <div className="master-detail-top-panel">
        <div className="master-detail-top-panel-button-container">
          <Button
            width={35}
            height={35}
            type="normal"
            stylingMode="outlined"
            icon={"chevronleft"}
            onClick={formObj.onHiding}
          />
        </div>
      </div>

      <div className="master-detail-body-type1">

        <div style={{flex: 3.5, justifyContent: 'center'}}>
          <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

          <Form
            colCount={1}
            id="form"
            formData={formObj.formData}
            onFieldDataChanged={formObj.formFieldDataChanged}
            onContentReady={formObj.contentReady}
          >
            <TabbedItem colSpan={1}>

              <TabPanelOptions onSelectionChanged={formObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
                <Item itemType="group" caption="" colCount={4}>
                  {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption=" " colCount={4}>
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption=" " colCount={4}>
                  {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
                <Item itemType="group" caption="" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption="Last Edit" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[2].title : ''} >
                <Item itemType="group" caption="" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
                </Item>
              </Tab>

            </TabbedItem>

          </Form>

          {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

          </ScrollView>

        </div>

        <div style={{flex: 1, justifyContent: 'center'}}>
          {formObj.formMode === 2 && 
            <SightseeingTimings 
              services_id={formObj.formData.Services_id}
              serviceObj={formObj}
              admLevel={formObj.admLevel}
            >              
            </SightseeingTimings>
          }
        </div>  
      
      </div>

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
