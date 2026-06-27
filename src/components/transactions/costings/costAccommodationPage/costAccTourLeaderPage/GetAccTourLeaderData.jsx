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
  [ {key: 1, label: "ID", field: 'Seasons_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}, allowSort: false},

    {key: 4, label: "Policy", field: 'PolicyOnEscorts_id', width: 120, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 1},

    {key: 6, label: "Discount (%)", field: 'Tl_discount', width: 110, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 8, label: "Free Above", field: 'Tl_freeabove', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true, hint: 'TL free above these pax'},
    {key: 9, label: "Half a Double", field: 'Tl_halfdouble', width: 110, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, default: false, allowFilter: false, booleanText: ['Yes','No'], hint: 'TL tariff half a double'},
     
    {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, editorOptions: {readOnly: true}},

    // redundant fields
    {key: 7, label: "Discount Above", field: 'Tl_discountabove', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

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
              <Item itemType="group" caption="Costs" colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
              </Item>
            </Tab>
            <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
              <Item itemType="group" caption="Last Edit" colCount={3}>
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
    
