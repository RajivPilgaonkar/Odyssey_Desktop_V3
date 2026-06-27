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
  [ {key: 1, label: "ID", field: 'hoteltariffs_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},
    {key: 2, label: "seasons_id", field: 'seasons_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},


    {key: 3, label: "Room Type", field: 'roomtypes_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
    {key: 4, label: "Currency", field: 'currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 13},
    {key: 5, label: "Currency PT", field: 'currencies_pt_id', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true, default: 13},

    {key: 6, label: "Single NAC", field: 'cost_single', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 7, label: "Double NAC", field: 'cost_double', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 8, label: "Single AC", field: 'cost_single_ac', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 9, label: "Double AC", field: 'cost_double_ac', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},

    {key: 10, label: "Meal Plan", field: 'mealplans_id', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, required: true, default: 2},
    {key: 11, label: "Extra Bed", field: 'extrabed', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},

    {key: 25, label: "Nett", field: 'nett', width: 60, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 26, label: "Free Transfer", field: 'freetransfer', width: 100, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 27, label: "Nett PT", field: 'nett_pt', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: false, allowFilter: false, booleanText: ['Yes','No']},

    {key: 301, label: "Default Room", field: 'defaultRoom', width: 110, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, required: false, allowFilter: true,  allowSearch: false, isDbField: false},    
     
    {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

  ];

  export function getDevExtremeTable(dataObj, superuser) {

    // standard table form most grid listings ...
    // ... for variants copy the code from getDevExtremeStandardTable, and modify
    return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);
  
  }
  
  
  export function getDevExtremePopupForm(formObj,dataObj) {
  
    const formHeight = 560;
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
              <GroupItem caption = "Costs" colCount={2} cssClass="groupBottomClass">
                {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
              </GroupItem>
              <GroupItem caption = "" colCount={3} >
                {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
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
  