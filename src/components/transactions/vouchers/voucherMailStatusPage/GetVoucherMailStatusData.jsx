import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, TabbedItem} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'PendVouchers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "VoucherDetails_id", field: 'VoucherDetails_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 3, label: "Vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

    {key: 11, label: "Organisation", field: 'Organisation', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:200}, allowFilter: true},    
    {key: 12, label: "City", field: 'ServiceCity', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 13, label: "Description", field: 'Description', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 14, label: "Type", field: 'VoucherType', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}, allowFilter: true, allowHeaderFiltering: true},    
    {key: 15, label: "Tour", field: 'TourCode', width: 70, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 16, label: "Tour Date", field: 'TourDate', width: 90, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 17, label: "Tour Leader", field: 'TourLeader', width: 70, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 18, label: "Voucher", field: 'VoucherNo', width: 70, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true},
    {key: 19, label: "Service Date", field: 'ServiceDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 20, label: "Requested On", field: 'RequestedOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 21, label: "Remarks", field: 'Remarks', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:200}},    
    {key: 22, label: "Issued By", field: 'IssuedBy', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 23, label: "Contact", field: 'Contact', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 24, label: "Phone", field: 'Phone', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
    {key: 25, label: "ImportantFollowup", field: 'ImportantFollowup', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},

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
  if (formObj.tabIndex > 2) {
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

        </TabbedItem>

      </Form>

      {popupFooter(formObj, popupFooterButtonContainerStyle, btnObjArray)}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}

