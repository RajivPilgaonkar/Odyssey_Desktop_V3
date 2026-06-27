import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import Switch from "react-switch";

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 'QuoAccommodation_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "QuoCities_id", field: 'QuoCities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 4, label: "City", field: 'Cities_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},
  {key: 5, label: "Hotel", field: 'HotelAddressbook_id', width: 250, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},  
  {key: 6, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1},

  {key: 11, label: "Date In", field: 'DateIn', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yy'/*, width: 140*/}, hasTime: true, required: true},    
  {key: 12, label: "At", field: 'DateIn_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, width: 120}, isDbField: false, hint: "Ex. 23:15, 08:25"},    

  {key: 13, label: "Date Out", field: 'DateOut', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yy'/*, width: 140*/}, hasTime: true, required: true},    
  {key: 14, label: "At", field: 'DateOut_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, width: 120}, isDbField: false, hint: "Ex. 23:15, 08:25"},    

  {key: 20, label: "Room Type", field: 'RoomTypes_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, required: true, hint: 'From Acc. Costing'},
  {key: 21, label: "Meal Plan", field: 'MealPlans_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, required: true, default: 2},
  {key: 22, label: "AC Room", field: 'AC', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No']},

  {key: 30, label: "Nights", field: 'Nights', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, editorOptions: {format: '##0'}},  
  {key: 31, label: "Early Checkin?", field: 'ReserveHotelOvernight', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false, hint: 'Tick if client arrives only after midnight but booked for previous night'},
  {key: 32, label: "Late Checkout?", field: 'LateCheckOut', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false, hint: 'Tick if client books additional night but leaves earlier'},
  {key: 33, label: "Own Arrangement?", field: 'OwnArrangements', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false, hint: 'Tick if client makes own arrangement'},

  {key: 41, label: "Quotations_id", field: 'Quotations_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, editorOptions: {format: '##0'}},  
  {key: 42, label: "Selected", field: 'Selected', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, booleanText: ['Yes','No'], default: true},

  {key: 50, label: "Singles", field: 'Singles', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {format: '##0'}, default: 0},  
  {key: 51, label: "Doubles", field: 'Doubles', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {format: '##0'}, default: 0},  
  {key: 52, label: "Triples", field: 'Triples', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {format: '##0'}, default: 0},  
  {key: 53, label: "Twins", field: 'Twins', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {format: '##0'}, default: 0},  

  {key: 55, label: "Confirmation No", field: 'ConfirmationNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {maxLength:20}},    

  {key: 61, label: "Comments", field: 'Comments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 7, editorOptions: {maxLength:100}, colSpan: 3},    
  {key: 63, label: "List of Services", field: 'ServicesComments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 7, editorOptions: {maxLength:100}, colSpan: 3},    
  {key: 64, label: "Voucher Description", field: 'ExtraVoucherDescription', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 7, editorOptions: {maxLength:100}, colSpan: 3},    

  //{key: 101, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  //{key: 102, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {readOnly: true}},

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
          width={1200}
          title={formObj.formTitle}
          showTitle={true}          
      >

      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', fontSize: 18}}>
        <div style={{paddingRight: 5}}>List Only Active Hotels</div>
        <Switch 
          height={20} 
          width={40} 
          onChange={formObj.activeHotelSwitchValueChanged} 
          checked={formObj.activeHotelSwitchValue} 
          uncheckedIcon={false}
        />
      </div>
      <div style={{height: 5}}></div>

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
            <Item itemType="group" caption=" " colCount={4}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,6,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={4}>
              {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Comments" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,7,formObj,dataObj)}
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
