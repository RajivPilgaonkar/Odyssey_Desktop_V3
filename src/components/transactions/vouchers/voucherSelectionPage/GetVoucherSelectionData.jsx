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
[ 
  {key: 1, label: "ID", field: 'QuoLines_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "Quotations_id", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

  {key: 3, label: "Sr. No.", field: 'LineNum', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true},
  {key: 4, label: "Date", field: 'QuoDate', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 5, label: "Trs Type", field: 'TrsType', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true},
  {key: 6, label: "City", field: 'City', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}, isDbField: false},    
  {key: 7, label: "Description", field: 'QuoString', width: 400, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:200}},    

  {key: 11, label: "Quoted Amt.", field: 'QuoteCost', width: 100, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}},    
  {key: 12, label: "Generate Voucher", field: 'GenerateVoucher', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No'], required: true},
  {key: 13, label: "Create Voucher", field: 'Selected', width: 120, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, booleanText: ['Yes','No'], required: true, isDbField: false},

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


