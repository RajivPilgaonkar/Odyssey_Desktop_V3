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
[ {key: 1, label: "ID", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
{key: 4, label: "Tour Code", field: 'MasterTourCode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:10, readOnly: false}},    
{key: 5, label: "Tour Date", field: 'MasterTourDate', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},

{key: 11, label: "Voucher No.", field: 'VoucherNo', width: 70, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, required: true},
{key: 12, label: "Voucher Date", field: 'VoucherDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
{key: 15, label: "Hotel/Agent", field: 'Organisation', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true, allowFilter: true},    
{key: 16, label: "Service City", field: 'City', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true},    
        
{key: 21, label: "Description", field: 'Description', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 80}},    

{key: 31, label: "Expected", field: 'ExpectedCost', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0, hint: 'Expected supplier invoice. Auto generated.'},    
{key: 32, label: "Billed", field: 'AmountBilled', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0},    
{key: 33, label: "Paid", field: 'AmountPaid', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0},    

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
