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
  [ {key: 1, label: "ID", field: 'Masters_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Generate Invoice?", field: 'GenInvoice', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, default: true, allowFilter: true, booleanText: ['Yes','No']},

    {key: 3, label: "Tour Code", field: 'MasterCode', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 10}},  
    {key: 4, label: "Tour Date", field: 'MasterDepDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},    

    {key: 10, label: "Agent", field: 'organisation', width: 130, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 100}},  
    {key: 12, label: "Pax", field: 'NumPax', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},
    {key: 13, label: "Cancelled", field: 'NumCencelled', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},

    {key: 20, label: "Invoice No", field: 'InvoiceNo', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},    
    {key: 21, label: "Invoice Date", field: 'InvoiceDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 22, label: "Invoice ID", field: 'Invoices_id', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 23, label: "Error No", field: 'ErrorNo', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},

    {key: 30, label: "Currency", field: 'currencycode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:10}},    
    {key: 31, label: "Amount", field: 'TotalInvoiceAmount', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 32, label: "Exch. Rate", field: 'exchangerate', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true},

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
            <Item itemType="group" caption="" colCount={4}>
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
