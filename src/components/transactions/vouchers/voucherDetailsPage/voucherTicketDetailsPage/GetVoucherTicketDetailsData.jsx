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
[ {key: 1, label: "ID", field: 'VouchersTickets_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},  

  {key: 3, label: "From City", field: 'From_Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 4, label: "Dept On", field: 'Departure', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true, hasTime: true},
  {key: 5, label: "Dept At", field: 'DepartureStr', width: 110, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25"},        

  {key: 6, label: "To City", field: 'To_Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 7, label: "Arr On", field: 'Arrival', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true, hasTime: true},
  {key: 8, label: "Arr At", field: 'ArrivalStr', width: 110, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25"},        

  {key: 9, label: "Travel Date", field: 'TravelDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},

  {key: 11, label: "Travel Mode", field: 'Tickets_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, required: true},
  {key: 12, label: "Class", field: 'ClassId', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1},
  {key: 13, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1},
  {key: 14, label: "Flight/Train No.", field: 'FlightNo', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:40}, colSpan: 2},    
  {key: 15, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 1},
  {key: 16, label: "Train No.", field: 'TrainNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:20}},    
  {key: 17, label: "From Station", field: 'FromStations_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 2},
  {key: 18, label: "To Station", field: 'ToStations_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 2},
  {key: 19, label: "PNR No", field: 'PnrNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:20, readOnly: true}},    
  {key: 20, label: "Coach No.", field: 'CoachNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:20, readOnly: true}},    

  {key: 31, label: "Booked", field: 'NoBooked', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 1},  
  {key: 32, label: "Cancelled", field: 'NoCancelled', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 0},  
  {key: 33, label: "Booked Reidents", field: 'NoOfPax_Resident', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, default: 0},  
  {key: 34, label: "Cancelled Reidents", field: 'NoCancelled_Resident', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, default: 0},  
  {key: 35, label: "Constant USD", field: 'Constant_USD', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    

  {key: 41, label: "Addressbook_id", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4},  
  {key: 42, label: "MasterTourCode", field: 'MasterTourCode', width: 60, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 4},  
  {key: 43, label: "MasterTourDate", field: 'MasterTourDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj,compVar) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  const tickets_id = compVar.formData.Tickets_id;

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
              {tickets_id === 2 && getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
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
