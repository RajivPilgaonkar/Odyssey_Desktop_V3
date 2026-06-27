import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'QuoPrint_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Lead Name", field: 'PaxInfo', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:100, readOnly: false}, required: true},    
    {key: 3, label: "Booking Info", field: 'BookingInfo', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:100, readOnly: false}, required: true},    

    {key: 7, label: "Starting Info", field: 'StartingInfo', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:100, readOnly: false}, required: true},    
    {key: 8, label: "Ending Info", field: 'EndingInfo', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:100, readOnly: false}, required: true},    

    {key: 21, label: "Request From", field: 'QuoRequest', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    
    {key: 22, label: "Request For", field: 'QuoFor', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    

    {key: 23, label: "Estimate", field: 'QuoEstimateText', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorType: 'dxTextArea', editorOptions: {maxLength:2000, readOnly: false, height: 110}, required: false},    

    //{key: 23, label: "", field: 'QuoRequestDetails', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 80}},    
    //{key: 24, label: "", field: 'QuoForDetails', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 80}},    
    
  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

export function getDevExtremePopupForm(formObj,dataObj) {

  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  const labelLocation = (formObj.labelLocation !== undefined) ? "top" : "left";
  
  return (

    <React.Fragment>

      <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

        {popupTitle(formObj, popupTitleContainerStyle)}

        <Form
          colCount={1}
          id="form"
          formData={formObj.formData}
          onFieldDataChanged={formObj.formFieldDataChanged}
          labelLocation={labelLocation}
         >
          <TabbedItem colSpan={1}>
            <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>
              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} > 
              <Item itemType="group" caption="" colCount={2}>
                {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
              </Item>
              <Item itemType="group" caption=" " colCount={2}>
                {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
              </Item>
            </Tab>
          </TabbedItem>

        </Form>
      
        {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

      </ScrollView>
    
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}

  