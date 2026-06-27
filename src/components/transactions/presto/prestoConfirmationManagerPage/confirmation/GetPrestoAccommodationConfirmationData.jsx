import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 't_ID', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "ID", field: 'QuoAccommodation_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 10, label: "City", field: 'City', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}},    
  {key: 11, label: "Organisation", field: 'Organisation', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:250, readOnly: true}, allowFilter: true},    
  {key: 12, label: "Phone", field: 'Phone', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}},    
  {key: 13, label: "Contact", field: 'Contact', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:250, readOnly: true}},    

  {key: 21, label: "Tour Code", field: 'TourCode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}, allowFilter: true },    
  {key: 22, label: "Tour Date", field: 'StartDate', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 23, label: "Pax", field: 'PaxName', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:250, readOnly: true}},    
  {key: 24, label: "Quotation", field: 'QuotationNo', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {format: '#,##0', readOnly: true}},
  {key: 25, label: "Date In", field: 'ServiceDate', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 26, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1},

  {key: 31, label: "Description", field: 'ServiceString', width: 230, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorType: 'dxTextArea', editorOptions: {maxLength:1000, readOnly: true, height: 80}, colSpan: 3},    
  {key: 32, label: "Remarks", field: 'Remarks', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorType: 'dxTextArea', editorOptions: {maxLength:1000, readOnly: true, height: 80}, colSpan: 3},    

  {key: 26, label: "Req. On", field: 'RequestedOn', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 27, label: "Req. By", field: 'RequestedBy', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}},    

];

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  const navigateButtonsOverride = (formObj.navigateButtonsOverride !== undefined) ? formObj.navigateButtonsOverride : [];
  
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
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={6}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
          </Tab>

        </TabbedItem>

      </Form>
      
      {popupFooter(formObj, popupFooterButtonContainerStyle, navigateButtonsOverride)}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
