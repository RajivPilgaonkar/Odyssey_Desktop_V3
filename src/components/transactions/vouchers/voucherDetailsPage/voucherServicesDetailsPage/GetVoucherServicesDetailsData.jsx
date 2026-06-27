import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import Switch from "react-switch";
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
[ {key: 1, label: "ID", field: 'VouchersServices_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, fieldFlag: 0},
  {key: 2, label: "vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, fieldFlag: 0},  

  {key: 3, label: "Service", field: 'Services_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, colSpan: 2, hint: 'Services for this Agent / City', fieldFlag: 0},
  {key: 4, label: "Sightseeing", field: 'Sightseeing', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true, fieldFlag: 0},
  {key: 5, label: "Transfer Type", field: 'TransferTypes_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: true, groupNo: 0, fieldFlag: 0},
  {key: 6, label: "Sightseeing At", field: 'Timing', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true, hasTime: true, fieldFlag: 0},        
  {key: 7, label: "Sightseeing At", field: 'TransferTime', width: 110, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25", fieldFlag: 0},        

  {key: 11, label: "Travel Mode", field: 'Tickets_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: true, groupNo: 1, required: false, fieldFlag: 0},
  {key: 12, label: "Flight/Train No", field: 'Flightno', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:30}, fieldFlag: 2},    
  {key: 13, label: "From/To Place", field: 'Place', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:30}, fieldFlag: 2},    
  {key: 14, label: "Arr/Dep On", field: 'FlightDepTime', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true, hasTime: true, fieldFlag: 2},        
  {key: 15, label: "At", field: 'FlightTime', width: 110, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:5}, required: true, isDbField: false, fieldFlag: 2},        
  
  {key: 21, label: "Vehicle Required?", field: 'Transport', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, default: false, fieldFlag: 0},
  {key: 22, label: "Guide Required?", field: 'Guide', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, default: false, fieldFlag: 0},
  {key: 23, label: "Entrance Fees", field: 'EntranceFees', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, default: false, hint: 'Tick to include Entrance Fees', fieldFlag: 0},
  {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, required: false, fieldFlag: 0},
  {key: 24, label: "Vehicle", field: 'Vehicles_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, hint: 'Based on Cars > Agents > Car Hire ', fieldFlag: 0},
  {key: 25, label: "Vehicles", field: 'NoOfVehicles', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, fieldFlag: 0},  
  {key: 26, label: "ac", field: 'Ac', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, default: true, fieldFlag: 0},

  {key: 31, label: "Resident Pax", field: 'NoOfPax_Resident', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 0, hint: 'Residents for S/S Costing', fieldFlag: 0},  

  {key: 40, label: "TransferDate", field: 'TransferDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, editorOptions: {displayFormat: 'dd/MM/yyyy'}, fieldFlag: 0},
  {key: 41, label: "Addressbook_id", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, fieldFlag: 0},  
  {key: 43, label: "MasterTourCode", field: 'MasterTourCode', width: 60, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, fieldFlag: 0},  
  {key: 44, label: "MasterTourDate", field: 'MasterTourDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, editorOptions: {displayFormat: 'dd/MM/yyyy'}, fieldFlag: 0},

];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj,compVar) {

  const popupHeight = (formObj.errorMsg) ? formObj.formHeight + popupTitleContainerStyle.height : formObj.formHeight;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  const tableHeaderArrayFiltered = (compVar.sightseeing) ? 
    tableHeaderArray.filter(rec => (rec.fieldFlag === 0 || rec.fieldFlag === 1)) : 
    tableHeaderArray.filter(rec => (rec.fieldFlag === 0 || rec.fieldFlag === 2));

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

      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40}}>
        <div style={{fontSize: 18, paddingRight: 10}}>Transfer</div>
        <Switch height={20} width={40} onChange={formObj.onTransferCkbChange} checked={compVar.sightseeing} checkedIcon={false} uncheckedIcon={false} offColor={'#0066ff'} onColor={'#ff0000'}/>
        <div style={{fontSize: 18, paddingLeft: 10}}>Sightseeing</div>
      </div>

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
              {getDevextremeFormItems(tableHeaderArrayFiltered,0,formObj,dataObj)}
            </Item>
            {!compVar.sightseeing &&
              <Item itemType="group" caption=" " colCount={3}>
                {getDevextremeFormItems(tableHeaderArrayFiltered,1,formObj,dataObj)}
              </Item>
            }
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArrayFiltered,2,formObj,dataObj)}
            </Item>
            {compVar.sightseeing &&
              <Item itemType="group" caption=" " colCount={3}>
                {getDevextremeFormItems(tableHeaderArrayFiltered,3,formObj,dataObj)}
              </Item>
            }          
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
