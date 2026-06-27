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
  [ {key: 1, label: "ID", field: 'mealcosts_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},
    {key: 2, label: "seasons_id", field: 'seasons_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},

    {key: 4, label: "Currency", field: 'currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 13},

    {key: 6, label: "Breakfast", field: 'breakfast', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 7, label: "Lunch", field: 'lunch', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 8, label: "Dinner", field: 'dinner', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
     
    {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

    // redundant fields
    {key: 50, label: "Currency PT", field: 'currencies_pt_id', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true, default: 13},
    {key: 51, label: "Breakfast PT", field: 'breakfast_pt', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 52, label: "Lunch PT", field: 'lunch_pt', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 53, label: "Dinner PT", field: 'dinner_pt', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

  ];

  export function getDevExtremeTable(dataObj, superuser) {

    // standard table form most grid listings ...
    // ... for variants copy the code from getDevExtremeStandardTable, and modify
    return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);
  
  }
  
  
  export function getDevExtremePopupForm(formObj,dataObj) {
  
    const formHeight = 380;
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
              <GroupItem caption = "" colCount={2} >
                {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
              </GroupItem>
              <GroupItem caption = "Costs" colCount={3} >
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
  