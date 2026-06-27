import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Trains_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Train No", field: 'TrainNo', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: true, editorOptions: {maxLength: 10}},  
    {key: 3, label: "Train", field: 'TrainName', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true, editorOptions: {maxLength: 100}},  

    {key: 10, label: "Category", field: 'TrainCategories_id', width: 120, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 1, required: true},    
    {key: 11, label: "Operates On", field: 'DayOfOperation', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 127, required: true},
    {key: 12, label: "Operates On", field: 'DayString', width: 160, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, default: 'Daily', required: true, colSpan: 2, editorOptions: {readOnly: false, buttons:[{name: 'trash', location: 'after', options: { icon: 'icons/daysOfOperation.png', onClick: () => {alert('X')}}}]}, isDbField: false, cssClass: "button-read-only-simple-item"},
    {key: 13, label: "Superfast", field: 'SF', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, default: false, booleanText: ['Yes','No']},
    {key: 14, label: "Agent", field: 'Addressbook_id', width: 150, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true, default: 1904},    

    {key: 21, label: "Wef", field: 'Wef', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 22, label: "Wet", field: 'Wet', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: false},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, editorOptions: {readOnly: true}},

  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  // set function to call days of operation
  const idx = tableHeaderArray.findIndex(rec => rec.field==='DayString');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.onSelectDaysOfOperation;
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

      <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

      {popupTitle(formObj, popupTitleContainerStyle)}

      <Form
        colCount={1}
        id="form"
        formData={formObj.formData}
        onFieldDataChanged={formObj.formFieldDataChanged}
        onContentReady={formObj.contentReady}
      >
        <TabbedItem colSpan={1}>
          <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Last Edited " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
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
