import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'HotelTariffs_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}},
    {key: 2, label: "seasons_id", field: 'Seasons_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}},

    {key: 3, label: "Room Type", field: 'RoomTypes_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
    {key: 4, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 13},
    {key: 5, label: "Currency PT", field: 'Currencies_pt_id', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: false, default: 13},
    {key: 500, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    

    {key: 6, label: "Single NAC", field: 'Cost_Single', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 7, label: "Double NAC", field: 'Cost_Double', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false},    
    {key: 8, label: "Single AC", field: 'Cost_Single_Ac', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 9, label: "Double AC", field: 'Cost_Double_Ac', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false},    

    {key: 10, label: "Meal Plan", field: 'MealPlans_id', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, required: true, default: 2},
    {key: 11, label: "Extra Bed", field: 'ExtraBed', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {displayFormat: '#,##0'}, showZeroAsBlanks: true},
    {key: 503, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false},    

    {key: 25, label: "Nett", field: 'Nett', width: 60, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: false, allowFilter: false, booleanText: ['Yes','No'], hint: 'Tick if inclusive of all taxes'},
    {key: 26, label: "Free Transfer", field: 'FreeTransfer', width: 100, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: false, allowFilter: false, booleanText: ['Yes','No']},
    {key: 27, label: "Nett PT", field: 'Nett_pt', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, default: false, allowFilter: false, booleanText: ['Yes','No']},

    {key: 301, label: "Default Room", field: 'DefaultRoom', width: 110, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, required: false, allowFilter: true,  allowSearch: false, isDbField: false},    
     
    {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

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
              <Item itemType="group" caption = "Costs" colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
              </Item>
              <Item itemType="group" caption = " " colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
              </Item>
            </Tab>
            <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
              <Item itemType="group" caption = "Last Edit" colCount={3} >
                {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
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
    