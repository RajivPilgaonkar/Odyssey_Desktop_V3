import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, TabbedItem, TabPanelOptions, Tab, GroupItem} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'cities_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "City", field: 'city', width: 300, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 50}},  
    {key: 3, label: "Alias", field: 'cityAlias', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:100}, default: ''},
    {key: 4, label: "City", field: 'Alias', width: 130, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:100}, isDbField: false, allowFilter: true},

    {key: 5, label: "State", field: 'states_id', width: 130, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, allowFilter: true, allowHeaderFiltering: true},    
    {key: 6, label: "Country", field: 'countries_id', width: 120, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, allowFilter: true, default: 200},  

    {key: 11, label: "Use Alias as Main Name", field: 'useAlias', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: false, colSpan: 2, booleanText: ['Yes','No'], hint: 'Use City / Alias in reports'},
    {key: 12, label: "Night Halt", longLabel: "Is it a Night Halt?", field: 'nighthalt', width: 90, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 13, label: "Def. Nights", longLabel: "Recommended Nights", field: 'DefaultDays', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

    {key: 16, label: "Airport Code", field: 'citycode', width: 110, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, allowFilter: true, editorOptions: {maxLength:4}},
    {key: 17, label: "Train Station", field: 'railway', width: 100, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: true, allowFilter: true},

    {key: 20, label: "Active", field: 'active', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 21, label: "Display", field: 'Display', width: 70, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, default: true, colSpan: 2, allowFilter: true, booleanText: ['Yes','No'], hint: 'Display in certain DropDowns or for the Web'},

    {key: 22, label: "Write Up", field: 'writeup', width: 60, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, colSpan: 3, editorType: 'dxTextArea', hint: 'Suggested max 1000 char', editorOptions: {maxLength: 1000, height: 100}},

    {key: 23, label: "Latitude", field: 'Latitude', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 4},
    {key: 24, label: "Longitude", field: 'Longitude', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 4},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

    // redundant fields now???
    {key: 1001, label: "Airport", field: 'airport', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: true, allowFilter: true},
    {key: 1002, label: "Courier", field: 'courier', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: true, allowFilter: true},

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

        <TabbedItem >

          <TabPanelOptions onSelectionChanged={formObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>

          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} colCount={5} >
            <GroupItem caption = "" colSpan={2} colCount={1} >
              {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
            </GroupItem>
            <GroupItem caption = "" colSpan={3} colCount={2} cssClass="groupRightClass">
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </GroupItem>
          </Tab>

          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''}>
            <GroupItem caption = "" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </GroupItem>
            <GroupItem caption = "Last Edit" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </GroupItem>
          </Tab>

          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[2].title : ''}>
          </Tab>

          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[3].title : ''}>
            <GroupItem caption = "Geo Locator" colCount={2}>
              {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
            </GroupItem>
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
