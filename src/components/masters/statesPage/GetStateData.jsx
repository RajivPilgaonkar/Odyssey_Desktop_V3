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
  [ {key: 1, label: "ID", field: 'states_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "State", field: '[state]', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true, editorOptions: {maxLength: 50}},  
    {key: 3, label: "Code", field: 'statecode', width: 70, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true, editorOptions: {maxLength: 3}},  
    {key: 4, label: "Countries ID", field: 'countries_id', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, required: false, default: 200},  
    {key: 5, label: "Print", field: 'printstate', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true, default: true},
    {key: 6, label: "Display", field: 'Display', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true, default: true},

    {key: 10, label: "Latitude", field: 'Latitude', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: false},  
    {key: 11, label: "Longitude", field: 'Longitude', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: false},  

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

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
            <Item itemType="group" caption="Last Edited " colCount={3}>
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
