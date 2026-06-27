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
  [ {key: 1, label: "ID", field: 'Seasons_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "addressbook_id", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true, editorOptions: {readOnly: true}},       

    {key: 3, label: "From Date", field: 'FromDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 4, label: "To Date", field: 'ToDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},

    {key: 11, label: "Closed", field: 'Closed', width: 60, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, default: false, booleanText: ['Yes','No'], hint: 'If closed in selected period'},
    {key: 12, label: "Special Tariff", field: 'SpecialTariff', width: 120, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, default: false, booleanText: ['Yes','No']},
    {key: 13, label: "Group", field: 'Git', width: 120, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 14, label: "FIT", field: 'Fit', width: 120, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, default: true, allowFilter: false, booleanText: ['Yes','No'], isDbField: false, hint: 'FIT or GIT'},

    {key: 21, label: "From Pax", field: 'FromPax', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 22, label: "To Pax", field: 'To_Pax', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 23, label: "No. of Pax", field: 'NumPax', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, showZeroAsBlanks: true, isDbField: false},
    {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},

    {key: 30, label: "Notes", field: 'Notes', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 3, editorType: 'dxTextArea', editorOptions: {maxLength:430, height: 100}},
    {key: 31, label: "Default Room", field: 'Default_RoomTypes_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: false},

    {key: 32, label: "Days of Operation", field: 'dayoftheweek', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 127},
    {key: 33, label: "Default AC", field: 'default_ac', width: 80, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: true, allowFilter: false, booleanText: ['Yes','No']},

    {key: 40, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 41, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

    // added by this modules but edited in CostAccCommission
    {key: 501, label: "Travel Agent Commission (%)", field: 'Tac', width: 220, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 502, label: "Travel Agent Commission on Meal Plan", field: 'TacOnMealPlan', width: 300, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: true, allowFilter: false, booleanText: ['Yes','No']},
    {key: 503, label: "Agent GST Commission (%)", field: 'AgentCommPerc', width: 200, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 504, label: "TAC PT (%)", field: 'Tac_Pt', width: 110, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},

    // added by this modules but edited in CostAccTourLeader
    {key: 601, label: "Policy", field: 'PolicyOnEscorts_id', width: 120, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 1},
    {key: 602, label: "Discount (%)", field: 'Tl_Discount', width: 110, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 603, label: "Free Above", field: 'Tl_FreeAbove', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 604, label: "Half a Double", field: 'Tl_HalfDouble', width: 110, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 605, label: "Discount Above", field: 'Tl_DiscountAbove', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

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
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="Last Edit" colCount={3}>
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
