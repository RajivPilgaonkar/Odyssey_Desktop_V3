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
  {key: 1, label: "ID", field: 'QuoModuleDetails_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "Modules ID", field: 'QuoModules_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

  {key: 3, label: "Details", field: 'QuoModuleDetails', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength: 250}, colSpan: 3, required: true},

  {key: 4, label: "Date", longLabel: "From Date", field: 'DateIn', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true},
  {key: 5, label: "To Date", field: 'DateOut', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true},
  {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},

  {key: 6, label: "Rate", field: 'Rate', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, required: true, default: 0},
  {key: 7, label: "Qty", field: 'Qty', width: 70, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, required: true, default: 1},
  {key: 8, label: "Amount", field: 'Cost', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', readOnly: true}, showZeroAsBlanks: true, hint: 'Qty*Rate', required: true, default: 0},

  {key: 11, label: "GST(%)", field: 'ServTaxPerc', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, required: true, default: 0, hint: 'GST on Tour Operator'},
  {key: 12, label: "GST", field: 'ServTaxAmt', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', readOnly: true}, showZeroAsBlanks: true, default: 0, hint:'Amount*Gst/100'},
  {key: 13, label: "Rate After Tax", field: 'RateAfterServTax', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, default: 0},
  {key: 14, label: "Amt After Tax", field: 'TotalAmt', width: 110, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', buttons:[{name: 'trash', location: 'after', options: { icon: 'revert', onClick: () => {alert('X')}, hint: "Work Backwards"} }]}, showZeroAsBlanks: true, default: 0, hint: "Work Backwards", summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},
  
  {key: 21, label: "Place Of Supply", field: 'PlaceOfSupplyLine', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {maxLength: 50}, required: true, colSpan: 2, hint: 'Determines inter(IGST) or intra(CGST/SGST) state'},    
  //{key: 22, label: "Sac Code", field: 'SacCode', width: 70, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength: 20}, hint: 'Default from Divisions'},

  {key: 31, label: "Refundable", longLabel:'Is this Refundable?', field: 'Refundable', width: 90, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: true},
  {key: 32, label: "Cancel(%)", field: 'CancelPerc', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, hint: 'Cancellation %'},
  {key: 33, label: "Inv Amt", field: 'InvAmt', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true, hint: 'Invoice Amount', isDbField: false, summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},

  {key: 36, label: "Main Order No", field: 'MainOrderNo', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, default: 0, hint: 'Order is MainOrder + SubOrder'},
  {key: 37, label: "Sub Order No", field: 'SubOrderNo', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, hint: 'Order is MainOrder + SubOrderNo'},

  {key: 41, label: "FixedItin_id", field: 'FixedItin_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 42, label: "ParentFixedItin_id", field: 'ParentFixedItin_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 43, label: "DayNo", field: 'DayNo', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 44, label: "GroupOrderNo", field: 'GroupOrderNo', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, default: 1},  
  {key: 45, label: "RecType", field: 'RecType', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  

  {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, allowFilter: false, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, allowFilter: false, editorOptions: {readOnly: true}},

];



export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height+30 : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  // set function to call days of operation
  const idx = tableHeaderArray.findIndex(rec => rec.field==='TotalAmt');
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

      {popupTitle(formObj, popupTitleContainerStyle)}

      <ScrollView width='100%' height={popupHeight-150} /*height='100%'*/ showScrollbar={showScrollBar} useNative={false}>

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
            {formObj.formData.FixedItin_id == null &&
              <Item itemType="group" caption="GST" colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
              </Item>
            }
            {formObj.formData.FixedItin_id == null &&
              <Item itemType="group" caption="" colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
              </Item>
            }
          </Tab>

          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="Ordering" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Last Edit" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
            </Item>
          </Tab>

        </TabbedItem>

      </Form>

      </ScrollView>

      {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
