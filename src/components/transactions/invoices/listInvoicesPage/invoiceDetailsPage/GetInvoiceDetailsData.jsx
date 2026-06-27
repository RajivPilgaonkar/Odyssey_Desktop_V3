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
  [ {key: 1, label: "ID", field: 'InvoiceDetails_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Invoices_id", field: 'Invoices_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}},
    
    {key: 5, label: "Details", field: 'Details', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 250}, colSpan: 3},

    {key: 7, label: "Rate", field: 'UnitPrice', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 8, label: "Quantity", field: 'Quantity', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 9, label: "Amount", field: 'Amount', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', readOnly: true}, showZeroAsBlanks: true, hint: 'Qty*Rate'},

    {key: 11, label: "GST(%)", field: 'ServiceTaxPerc', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, default: 0, hint: 'Based on Parent Entry'},
    {key: 12, label: "GST", field: 'ServiceTax', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', readOnly: true}, showZeroAsBlanks: true, default: 0, hint:'Amount*Gst/100'},
    {key: 13, label: "Rate After Tax", field: 'RateAfterServTax', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, default: 0},
    {key: 14, label: "Amt After Tax", field: 'AmtAfterTax', width: 110, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', buttons:[{name: 'trash', location: 'after', options: { icon: 'icons/daysOfOperation.png', hint: 'Work Backwards', onClick: () => {alert('X')}}}]}, showZeroAsBlanks: true, default: 0, hint: 'Amount + GST'},

    {key: 21, label: "Place Of Supply", field: 'PlaceOfSupplyLine', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {maxLength: 50}, required: true, colSpan: 2, hint: 'Determines inter(IGST) or intra(CGST/SGST) state'},    
    {key: 22, label: "Sac Code", field: 'SacCode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength: 20}, hint: 'Default from Divisions'},

    {key: 31, label: "Refundable", longLabel:'Is this Refundable?', field: 'Refundable', width: 90, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: true, hint: 'Default from Modules'},

    {key: 32, label: "Item No", field: 'itemno', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, default: 700, hint: '300,700,710,720 - Read Help'},
    {key: 33, label: "Sub Order No", field: 'SubOrderNo', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, hint: 'Order is ItemNo + SubOrderNo'},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

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
  const idx = tableHeaderArray.findIndex(rec => rec.field==='AmtAfterTax');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.onWorkBackwards;
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
            <Item itemType="group" caption="GST" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
          </Tab>

          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="Ordering" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Last Edited " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
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
