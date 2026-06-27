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
  [ {key: 1, label: "ID", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 11, label: "Voucher", field: 'VoucherNo', width: 70, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, required: true},
    {key: 12, label: "Dated", field: 'VoucherDate', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 14, label: "Type", field: 'VoucherType', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true},    
    {key: 15, label: "Hotel/Agent", field: 'organisation', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true},    
    {key: 16, label: "Service City", field: 'city', width: 90, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true},    
    
    {key: 21, label: "Description", field: 'description', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 100}},    
    {key: 22, label: "Remarks", field: 'VoucherMailRemarks', width: 110, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:200, readOnly: false, height: 100}},    

    {key: 41, label: "Requested", field: 'RequestedOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 42, label: "Confirmed", field: 'ConfirmedOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 43, label: "Cancelled", field: 'CancelledOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

    {key: 51, label: "Send Mail", field: 'SendMail', width: 70, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true},
    {key: 52, label: "Select", field: 'Selected', width: 70, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, isDbField: false},

  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? 650+popupTitleContainerStyle.height : 650;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  // do not show hint, help, save buttons in the Contacts tab
  let btnObjArray = [];
  if (formObj.tabIndex > 1) {
    btnObjArray = [{visible: false},{visible: false},{visible: false}];          
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
            <Item itemType="group" caption="Remarks" colCount={4}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
          </Tab>

        </TabbedItem>

      </Form>
      
      {popupFooter(formObj, popupFooterButtonContainerStyle, btnObjArray)}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}

