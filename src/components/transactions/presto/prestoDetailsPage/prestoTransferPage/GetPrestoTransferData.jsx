import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import Switch from "react-switch";
import {Button} from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 'QuoServices_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "QuoCities_id", field: 'QuoCities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 3, label: "Transfer", field: 'Sightseeing', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true},

  {key: 6, label: "City", field: 'Cities_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: true, groupNo: 0, required: true},
  {key: 7, label: "Service", field: 'Services_id', width: 350, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, colSpan: 2, hint: 'Services for this Agent / City'},
  {key: 8, label: "Transfer Type", field: 'TransferTypes_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, required: true, editorOptions: {readOnly: true}},
  {key: 9, label: "Agent", field: 'AgentAddressbook_id', width: 250, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},  
  {key: 10, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1},

  {key: 12, label: "Transfer Date", field: 'ServiceDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', width: 150}, required: true},    
  {key: 13, label: "At", field: 'StartTime', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, width: 100}, hasTime: true, hint: "Ex. 23:15, 08:25"},    

  {key: 20, label: "Flight/Train No", field: 'FlightNo', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, colSpan: 1, editorOptions: {maxLength:30}},    
  {key: 21, label: "From/To Place", field: 'Place', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:50}},    
  {key: 22, label: "Arr/Dep On", field: 'FlightDepTime', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true, hasTime: true},        
  {key: 23, label: "Flight/Train At", field: 'FlightDepTime_Time', width: 110, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:5}, required: true, isDbField: false},        
  {key: 24, label: "Transfer At", field: 'StartTime_Time', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {maxLength:5, width: 100}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25"},    

  {key: 31, label: "Vehicle Required?", field: 'VehicleReqd', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false},
  {key: 32, label: "Transport?", field: 'Transport', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: true},
  {key: 33, label: "Guide Required?", field: 'Guide', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false},
  {key: 34, label: "Entrance Fees", field: 'EntranceFees', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false},
  {key: 35, label: "Vehicle", field: 'Vehicles_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, required: true, hint: 'Based on Cars > Agents > Car Hire '},
  {key: 36, label: "Vehicles", field: 'NoOfVehicles', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 1},  
  {key: 37, label: "AC", field: 'AC', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: true},

  {key: 41, label: "Quotations_id", field: 'Quotations_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, editorOptions: {format: '##0'}},  
  {key: 42, label: "Selected", field: 'Selected', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, booleanText: ['Yes','No'], default: true},
  {key: 43, label: "Lock", field: 'Lock', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, booleanText: ['Yes','No'], default: false},

  {key: 61, label: "Comments", field: 'Comments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100}, colSpan: 2},    
  {key: 62, label: "Own Arrangement?", field: 'OwnArrangements', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: false, hint: 'Tick if client makes own arrangement'},
  {key: 63, label: "List of Services Comments", field: 'ServicesComments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100}, colSpan: 3},    
  {key: 64, label: "Added Voucher Descr.", field: 'ExtraVoucherDescription', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100}, colSpan: 3},    

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
        <div style={{paddingRight: 5}}>List Only Active Services</div>
        <Switch 
          height={20} 
          width={40} 
          onChange={formObj.activeTransferSwitchValueChanged} 
          checked={formObj.activeTransfersSwitchValue} 
          uncheckedIcon={false}
        />
        <div style={{paddingLeft: 30, paddingRight: 5}}>Active Vehicles</div>
        <Switch 
          height={20} 
          width={40} 
          onChange={formObj.activeVehiclesSwitchValueChanged} 
          checked={formObj.activeVehiclesSwitchValue} 
          uncheckedIcon={false}
        />
        <div style={{paddingLeft: 30}}>
          {buttonsJsx(0, formObj)}
        </div>
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
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption=" " colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
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

//**********************************************************/
export function buttonsJsx(index, formObj) {    

  const widths = [35];
  const types = ['normal'];
  const stylingModes = ['outlined'];
  const icons = ['icons/transfer.png'];
  const hints = ['List Transfer Costs for available cars'];
  const clicks = [formObj.transferCostListing];
  const disabledArr = [false];
  const texts = [null];

  const width = widths[index];
  const type = types[index];
  const stylingMode = stylingModes[index];
  const icon = icons[index];
  const hint = hints[index];
  const click = clicks[index];
  const disabled = disabledArr[index];
  const text = texts[index];

  return (
    <Button
      width={width}
      type={type}
      stylingMode={stylingMode}
      icon={icon}
      hint={hint}
      onClick={click}
      disabled={disabled}
      text={text}
    />
  );
}
