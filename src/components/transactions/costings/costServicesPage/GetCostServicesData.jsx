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
  [ {key: 1, label: "ID", field: 'CostServices_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 5, label: "Wef", field: 'Wef', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 6, label: "Service", field: 'Services_id', width: 450, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},
    {key: 7, label: "Addressbook_id", field: 'Addressbook_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},
    {key: 8, label: "Cities_id", field: 'Cities_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},

    {key: 15, label: "Remarks", field: 'Remarks', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 3, editorType: 'dxTextArea', editorOptions: {maxLength:100, height: 100}},

    {key: 21, label: "MiscCount", field: 'MiscCount', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, isDbField: false},
    {key: 22, label: "GuideCount", field: 'GuideCount', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, isDbField: false},
    {key: 23, label: "EntranceCount", field: 'EntranceCount', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, isDbField: false},
    {key: 24, label: "TransportCount", field: 'TransportCount', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, isDbField: false},
    {key: 25, label: "ClosedCount", field: 'ClosedCount', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, isDbField: false},

    {key: 40, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 41, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

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
