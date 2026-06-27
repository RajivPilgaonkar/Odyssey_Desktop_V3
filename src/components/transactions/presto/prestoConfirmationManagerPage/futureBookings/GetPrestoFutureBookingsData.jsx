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
  {key: 1, label: "ID", field: 'QuAccommodation_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "Quotations_id", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 4, label: "Tour Code", field: 'TourCode', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}, allowFilter: true },    
  {key: 5, label: "Pax", field: 'PaxName', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {readOnly: true}},    
  {key: 6, label: "Num Pax", field: 'NumPax', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}},    

  {key: 11, label: "Singles", field: 'Singles', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}},    
  {key: 12, label: "Doubles", field: 'Doubles', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}},    
  {key: 13, label: "Twins", field: 'Twins', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}},    
  {key: 14, label: "Triples", field: 'Triples', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}},    

  {key: 21, label: "Date In", field: 'DateIn', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 22, label: "Date Out", field: 'DateOut', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 23, label: "Nights", field: 'Nights', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {readOnly: true}},    

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
