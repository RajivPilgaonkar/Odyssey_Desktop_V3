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
[ {key: 1, label: "ID", field: 'VouchersAccommodation_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},  

  {key: 3, label: "Room Type", field: 'RoomTypes_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, hint: 'From Acc. Costing'},
  {key: 4, label: "Meal Plan", field: 'MealPlans_id', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 2},
  {key: 5, label: "AC Room", field: 'Ac', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true},

  {key: 10, label: "From Date", field: 'DateIn', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 11, label: "To Date", field: 'DateOut', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 12, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, colSpan: 1},

  {key: 21, label: "Singles", field: 'NoOfSingles', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, required: true},  
  {key: 22, label: "Doubles", field: 'NoOfDoubles', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, required: true},  
  {key: 23, label: "Triples", field: 'NoOfTriples', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, required: true},  
  {key: 24, label: "Twins", field: 'NoOfTwins', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, required: true},  
  {key: 25, label: "Confirmation No", field: 'ConfirmationNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:20, readOnly: true}},    

  {key: 31, label: "Addressbook_id", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 32, label: "Agent_Addressbook_id", field: 'Agent_Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 33, label: "MasterTourCode", field: 'MasterTourCode', width: 60, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},  
  {key: 34, label: "MasterTourDate", field: 'MasterTourDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

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
            <Item itemType="group" caption=" " colCount={4}>
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
