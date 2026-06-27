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
[ 
  {key: 1, label: "ID", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 5, label: "Starts", field: 'StartDate', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 6, label: "Ends", field: 'EndDate', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 7, label: "Tour Code", field: 'TourCode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}, allowFilter: true },    

  {key: 8, label: "Pax", field: 'PaxName', width: 180, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:250, readOnly: true}},    
  {key: 9, label: "Num Pax", field: 'NumPax', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}},    

  {key: 21, label: "Agent", field: 'PrincipalAgent', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:250, readOnly: true}, allowFilter: true},    
  {key: 22, label: "Reference", field: 'Reference', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}},    
  {key: 23, label: "Quo. No", field: 'QuotationNo', width: 70, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {format: '#,##0', readOnly: true}},
  {key: 24, label: "Comment", field: 'Comment', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:250, readOnly: true}, allowFilter: true},    
  {key: 25, label: "Consultant", field: 'Consultant', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}, allowFilter: true},    

  {key: 31, label: "Booking Recd.", field: 'BookingRecdDate', width: 80, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 32, label: "Booking Entered", field: 'BookingEntryDate', width: 80, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 34, label: "Deadline", field: 'Deadline', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 35, label: "Quo. Sent On", field: 'QuotationSendDate', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},
  {key: 36, label: "File Sent On", field: 'TourFileSendDate', width: 80, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yy', readOnly: true}},

  {key: 37, label: "Masters", field: 'Masters', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},
  {key: 38, label: "Status", field: 'Status', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},
  {key: 39, label: "Cancelled", field: 'Cancelled', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},
  {key: 40, label: "StatusLabel", field: 'StatusLabel', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:250, readOnly: true}},    

];

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  const navigateButtonsOverride = (formObj.navigateButtonsOverride !== undefined) ? formObj.navigateButtonsOverride : [];
  
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
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
          </Tab>

        </TabbedItem>

      </Form>
      
      {popupFooter(formObj, popupFooterButtonContainerStyle, navigateButtonsOverride)}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
