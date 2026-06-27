import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, TabbedItem, Tab, GroupItem} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'seasons_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},
    {key: 2, label: "addressbook_id", field: 'addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},       

    {key: 5, label: "From Date", field: 'fromdate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 6, label: "To Date", field: 'todate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

    {key: 7, label: "Closed", field: 'closed', width: 60, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 8, label: "Special Tariff", field: 'SpecialTariff', width: 120, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 9, label: "Group", field: 'git', width: 120, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 10, label: "FIT", field: 'fit', width: 120, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: true, allowFilter: false, booleanText: ['Yes','No'], isDbField: false},

    {key: 15, label: "From Pax", field: 'frompax', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: true, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 16, label: "To Pax", field: 'to_pax', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: true, default: 1, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 17, label: "No. of Pax", field: 'NumPax', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, showZeroAsBlanks: true, isDbField: false},
    {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, colSpan: 1},
     
    {key: 20, label: "Notes", field: 'Notes', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 3, editorType: 'dxTextArea', editorOptions: {maxLength:430, height: 100}},

    {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

    // added by this modules but edited in CostAccCommission
    {key: 501, label: "Travel Agent Commission (%)", field: 'tac', width: 220, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 502, label: "Travel Agent Commission on Meal Plan", field: 'taconmealplan', width: 300, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 503, label: "Agent GST Commission (%)", field: 'AgentCommPerc', width: 200, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 504, label: "TAC PT (%)", field: 'tac_pt', width: 110, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},

    // added by this modules but edited in CostAccTourLeader
    {key: 601, label: "Policy", field: 'policyonescorts_id', width: 120, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true, default: 1},
    {key: 602, label: "Discount (%)", field: 'tl_discount', width: 110, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 603, label: "Free Above", field: 'tl_freeabove', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 604, label: "Half a Double", field: 'tl_halfdouble', width: 110, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 605, label: "Discount Above", field: 'tl_discountabove', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

  ];

  export function getDevExtremeTable(dataObj, superuser) {

    // standard table form most grid listings ...
    // ... for variants copy the code from getDevExtremeStandardTable, and modify
    return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);
  
  }
  
  
  export function getDevExtremePopupForm(formObj,dataObj) {
  
    const formHeight = 520;
    const popupHeight = (formObj.errorMsg) ? formHeight+popupTitleContainerStyle.height : formHeight;
    const showScrollBar = formObj.showHintData ? 'always' : 'never';
    const labelLocation = formObj.labelLocation ? formObj.labelLocation : null;
    
    return (
  
      <React.Fragment>        
        <Popup
            ref={formObj.formRef}
            visible={formObj.visible}
            hideOnOutsideClick={false}
            onHiding={formObj.onHiding}
            height={popupHeight}
            width={1000}
            title={formObj.formTitle}
            showTitle={true}          
        >

        <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

        {popupTitle(formObj, popupTitleContainerStyle)}

        <Form
          id="form"
          formData={formObj.formData}
          labelLocation={labelLocation}
        >

          <TabbedItem >
            <Tab title="Setup" >
              <GroupItem caption = "" colCount={2} cssClass="groupBottomClass">
                {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
              </GroupItem>
              <GroupItem caption = "" colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
              </GroupItem>
            </Tab>
            <Tab title="Other Details" >
              <GroupItem caption = "Last Edit" colCount={3} >
                {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
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
  