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
[ {key: 1, label: "ID", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 21, label: "Arrives On", field: 'DateOfArrival', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 23, label: "Arrives In", field: 'StartCities_id', width: 150, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 103, colSpan: 2},    
  {key: 25, label: "ETA", field: 'ETA', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}},    
  {key: 26, label: "ETA", field: 'ETA_Time', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},        

  {key: 31, label: "Departs On", field: 'DateOfDeparture', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 33, label: "Departs From", field: 'EndCities_id', width: 150, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, colSpan: 2},    
  {key: 35, label: "ETD", field: 'ETD', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {maxLength:5}},    
  {key: 36, label: "ETD", field: 'ETD_Time', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},    

  {key: 91, label: "Created By", field: 'UserName', width: 80, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 9, colSpan: 6, editorOptions: {maxLength:30, readOnly: true}, required: false, isDbField: false},    

  {key: 100, label: "Last Edited By", field: 'AdmUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {readOnly: true}},
  {key: 101, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 102, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {readOnly: true}},

  {key: 110, label: "EndDate", field: 'EndDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

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
            <Item itemType="group" caption="Arrival" colCount={4}>
              {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Departure" colCount={4}>
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
