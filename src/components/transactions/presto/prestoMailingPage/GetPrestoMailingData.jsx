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
[ {key: 1, label: "ID", field: 't_ID', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "QuoAccommodation_id", field: 'QuoAccommodation_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 3, label: "QuoTickets_id", field: 'QuoTickets_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 4, label: "QuoServices_id", field: 'QuoServices_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 11, label: "City", field: 'City', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: true},    
  {key: 12, label: "Hotel/Agent", field: 'Organisation', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: true},    
  {key: 13, label: "Date", field: 'ServiceDate', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yy'}, required: true},
  {key: 14, label: "Description", field: 'ServiceString', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 100}},    
  {key: 15, label: "Remarks", field: 'Remarks', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:200, readOnly: false, height: 100}},    

  {key: 21, label: "Requested", field: 'RequestedOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yy'}, required: true},
  {key: 22, label: "Confirmed", field: 'ConfirmedOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yy'}, required: true},
  {key: 23, label: "Cancelled", field: 'CancelledOn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yy'}, required: true},

  {key: 51, label: "Selected", field: 'Selected', width: 70, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true},
  {key: 52, label: "Overnight", field: 'Overnight', width: 70, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true},
  {key: 53, label: "VoucherTypes_id", field: 'VoucherTypes_id', width: 70, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true},

  {key: 55, label: "PaxNames", field: 'PaxNames', width: 250, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 100}},    

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

