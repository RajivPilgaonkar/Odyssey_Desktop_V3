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
[ {key: 1, label: "ID", field: 'VouchersTransport_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},  

  {key: 11, label: "From City", field: 'From_Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 12, label: "From Place", field: 'FromPlace', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:30}, required: true},    
  {key: 13, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},
  {key: 14, label: "On", field: 'FromDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 15, label: "On", field: 'FromTime', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true},
  {key: 16, label: "At", field: 'FromTimeStr', width: 110, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25"},        

  {key: 21, label: "To City", field: 'To_Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, required: true},
  {key: 22, label: "To Place", field: 'ToPlace', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:30}, required: true},    
  {key: 23, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, colSpan: 1},
  {key: 23, label: "On", field: 'ToDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 24, label: "On", field: 'ToTime', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, hasTime: true},
  {key: 25, label: "At", field: 'ToTimeStr', width: 110, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:5}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25"},        

  {key: 31, label: "Vehicle", field: 'Vehicles_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, required: true, hint: 'Based on Cars > Agents > Car Hire '},
  {key: 32, label: "Vehicles", field: 'NoOfVehicles', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, required: true, default: 1},  
  {key: 33, label: "ac", field: 'Ac', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, default: true},
  {key: 34, label: "Drive Type", field: 'DriveTypes_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, required: true},
  {key: 36, label: "Drop Off Days", field: 'DropOffDays', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: 0, hint: 'Extra days for Costing'},  
  {key: 37, label: "Drop Off Kms", field: 'DropOffKms', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, default: 0, hint: 'Extra kms for Costing'},  
  {key: 38, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, required: false, colSpan: 1},

  {key: 38, label: "City Group", field: 'CarHireGroups_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, required: false, colSpan: 2},

  {key: 41, label: "Addressbook_id", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 42, label: "MasterTourCode", field: 'MasterTourCode', width: 60, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 43, label: "MasterTourDate", field: 'MasterTourDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

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
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
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
