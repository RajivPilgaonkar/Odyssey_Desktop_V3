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
  [ {key: 1, label: "ID", field: 'CostingTrace_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

    {key: 3, label: "Record Type", field: 'RecordType', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true},
    {key: 4, label: "Code", field: 'CostingCode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:4}},    
    {key: 5, label: "Description", field: 'Description', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:200}},    

    {key: 11, label: "Rate", field: 'Rate', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 12, label: "Quantity", field: 'Qty', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 13, label: "Group Amt", field: 'GroupAmt', width: 90, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, specialCol: 1},
    {key: 14, label: "Amount", field: 'Cost', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},

    {key: 21, label: "Gst (%)", field: 'GstPerc', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 22, label: "Gst", field: 'Gst', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 23, label: "Total", field: 'Total', width: 100, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},

    {key: 31, label: "Meals", field: 'MealCost', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, specialCol: 2},
    {key: 32, label: "Agent Gst", field: 'AgentComm', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, specialCol: 2},

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
export function filterTableHeaderArray (tableArray, voucherTypes_id) {

    let filteredTableHeaderArray = [];    

    if (voucherTypes_id === 3) {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined || rec.specialCol === 2});    
    } else if (voucherTypes_id === 4) {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined || rec.specialCol === 1});    
    } else {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined});    
    }

    return filteredTableHeaderArray;
  }
