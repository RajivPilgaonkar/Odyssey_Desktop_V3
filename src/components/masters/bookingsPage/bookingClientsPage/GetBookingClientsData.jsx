import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'BookingsClients_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Bookings_id", field: 'Bookings_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, required: true},  

    {key: 3, label: "Name", field: 'Name', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 30}, allowFilter: true, colSpan: 2},  
    {key: 4, label: "Date of Birth", field: 'DateOfBirth', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},    

    {key: 5, label: "Male", field: 'Male', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 2},    

    {key: 10, label: "Passport No.", field: 'PassportNo', width: 200, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength: 20}, allowFilter: true},  
    {key: 11, label: "Place Of Issue", field: 'PlaceOfIssue', width: 200, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength: 50}, allowFilter: true},  
    {key: 503, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1},    
    {key: 12, label: "Issued On", field: 'DateOfIssue', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},    
    {key: 13, label: "Valid Until", field: 'ValidTo', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},    
    {key: 504, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1},    

    {key: 20, label: "Country", field: 'Countries_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, allowFilter: true, colSpan: 1},
    {key: 21, label: "Resident Of", field: 'Resident_Countries_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, allowFilter: true, colSpan: 1},
    {key: 22, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1},    

    {key: 30, label: "Order No.", field: 'LeadPaxOrder', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

  ];
    

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

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
              {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Last Edited " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
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
