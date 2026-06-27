import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import {Popup} from 'devextreme-react/popup';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Services_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Order No.", field: 'DefaultOrder', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

    {key: 3, label: "Service", field: 'Description', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 4, required: true, editorOptions: {maxLength: 100}},  
    {key: 4, label: "Default Agent", field: 'Addressbook_id', width: 200, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true, allowFilter: true},    
    {key: 7, label: "Transfer Type", field: 'TransferTypes_id', width: 150, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},    
    {key: 6, label: "Cities_id", field: 'Cities_id', width: 300, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, required: true},    
    {key: 5, label: "Mode", field: 'Tickets_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},    
    {key: 11, label: "Duration", field: 'duration', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5, mask: '00:00'}, hint: "Ex. 23:15, 08:25", required: true},        
    {key: 12, label: "Chk In Duration", field: 'CheckInDuration', width: 120, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5, mask: '00:00'}, hint: "Ex. 23:15, 08:25", required: false},        
    {key: 500, label: "EmptyItem1", field: 'EmptyItem1', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    

    //{key: 13, label: "Operates On", field: 'DaysOfOperation', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 127, required: true},
    //{key: 14, label: "Timing", field: 'Timing', width: 120, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: '', isDbField: false},
    {key: 16, label: "Arrival Description", field: 'ArrivalDescription', width: 300, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 3, required: false, editorOptions: {maxLength: 200}},  

    {key: 20, label: "Active", field: 'Active', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: true, booleanText: ['Yes','No']},
    {key: 21, label: "Transfer", field: 'Transfer', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: true, booleanText: ['Yes','No']},
    {key: 23, label: "Private", field: 'Private', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: false, booleanText: ['Yes','No']},
    {key: 24, label: "Recommended", field: 'Recommended', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: false, booleanText: ['Yes','No']},
    {key: 25, label: "Refundable", field: 'Refundable', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: true, booleanText: ['Yes','No']},
    {key: 26, label: "Day At Leisure", field: 'DayAtLeisure', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: false, booleanText: ['Yes','No']},

    {key: 30, label: "Adv Bkg Reqd?", field: 'AdvBooking', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: false, booleanText: ['Yes','No']},
    {key: 31, label: "Guide Reqd?", field: 'Guide', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: false, booleanText: ['Yes','No']},
    {key: 32, label: "Transport Reqd?", field: 'TransportReqd', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: true, booleanText: ['Yes','No']},
    {key: 33, label: "Day Excursion", field: 'DayExcursion', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: false, booleanText: ['Yes','No']},
    {key: 34, label: "Own Transport?", field: 'OwnTransport', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: true, booleanText: ['Yes','No']},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, editorOptions: {readOnly: true}},

  ];

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  // set function to call days of operation
  const idx = tableHeaderArray.findIndex(rec => rec.field==='DayString');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.onSelectDaysOfOperation;
  }

  return (

    <React.Fragment>
      <Popup
          ref={formObj.formRef}
          visible={formObj.visible}
          hideOnOutsideClick={false}
          onHiding={formObj.onHiding}
          height={popupHeight}
          width={1100}
          title={formObj.formTitle}
          showTitle={true}          
      >

        <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

        {popupTitle(formObj, popupTitleContainerStyle)}

        <div className="master-detail-body-type1">

          <div style={{flex: 3.5, justifyContent: 'center'}}>

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
                  <Item itemType="group" caption=" " colCount={3}>
                    {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
                  </Item>
                </Tab>

              </TabbedItem>

            </Form>

            {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

          </div>
      
        </div>

        </ScrollView>

      </Popup>          

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
