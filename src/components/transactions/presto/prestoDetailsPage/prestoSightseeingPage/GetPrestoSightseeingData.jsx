import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import Switch from "react-switch";
import {Button} from 'devextreme-react/button';
import { convert_DbDate_To_DMY } from '../../../../common/CommonTransactionFunctions';
import PrestoSightseeingDisplayCost from './PrestoSightseeingDisplayCost';

import { getDevextremeFormItems } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 'QuoServices_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 2, label: "QuoCities_id", field: 'QuoCities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
  {key: 3, label: "Sightseeing", field: 'Sightseeing', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true},

  {key: 6, label: "City", field: 'Cities_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: true, groupNo: 0, required: true},
  {key: 7, label: "Service", field: 'Services_id', width: 350, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, colSpan: 2, hint: 'Services for this Agent / City' },
  {key: 8, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1},
  {key: 9, label: "Agent", field: 'AgentAddressbook_id', width: 250, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},  

  {key: 12, label: "Sighseeing On", field: 'ServiceDate', width: 120, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', width: 150}, required: true},    
  {key: 13, label: "At", field: 'StartTime', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, width: 100}, hasTime: true, hint: "Ex. 23:15, 08:25"},    
  {key: 14, label: "At", longLabel: "Sightseeing At", field: 'StartTime_Time', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, width: 100}, required: true, isDbField: false, hint: "Ex. 23:15, 08:25"},    
  {key: 15, label: "Timings", field: 'Timings', width: 80, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:20, readOnly: true}, required: false},    

  {key: 31, label: "Vehicle Required?", field: 'VehicleReqd', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false},
  {key: 32, label: "Guide Required?", field: 'Guide', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false},
  {key: 33, label: "Entrance Fees Required?", field: 'EntranceFees', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: false},
  {key: 34, label: "Transport?", field: 'Transport', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: true},
  {key: 35, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, colSpan: 1},
  {key: 36, label: "Vehicle", field: 'Vehicles_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, hint: 'Based on Cars > Agents > Car Hire '},
  {key: 37, label: "Vehicles", field: 'NoOfVehicles', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3},  
  {key: 38, label: "AC", field: 'AC', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], default: true},

  {key: 41, label: "Quotations_id", field: 'Quotations_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, editorOptions: {format: '##0'}},  
  {key: 42, label: "Selected", field: 'Selected', width: 80, align: "center", dataType: 'boolean', visible: true, visibleInForm: false, isLookup: false, groupNo: 4, booleanText: ['Yes','No'], default: true},
  {key: 43, label: "Lock", field: 'Lock', width: 80, align: "center", dataType: 'boolean', visible: true, visibleInForm: false, isLookup: false, groupNo: 4, booleanText: ['Yes','No'], default: false},
  {key: 44, label: "RecType", field: 'RecType', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, default: 0, isDbField: false},
  {key: 45, label: "DaysOfOperation", field: 'DaysOfOperation', width: 100, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, default: 127},
    
  {key: 61, label: "Comments", field: 'Comments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100}, colSpan: 2},    
  {key: 62, label: "Own Arrangement?", field: 'OwnArrangements', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: false, hint: 'Tick if client makes own arrangement'},
  {key: 63, label: "Link to Service", field: 'LinkServices_id', width: 350, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: true, groupNo: 5, colSpan: 2, hint: 'Link to another services such as take a Guide from another agent'},
  {key: 64, label: "List of Services Comments", field: 'ServicesComments', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100}, colSpan: 3},    
  {key: 65, label: "Added Voucher Descr.", field: 'ExtraVoucherDescription', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {maxLength:100}, colSpan: 3},    

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
          onChange={formObj.activeSightseeingSwitchValueChanged} 
          checked={formObj.activeSightseeingSwitchValue} 
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

      {formObj.formData.AgentAddressbook_id &&
       formObj.formData.Services_id &&
       formObj.formData.ServiceDate &&   
       <>
        <PrestoSightseeingDisplayCost
          addressbook_id={formObj.formData.AgentAddressbook_id}
          services_id={formObj.formData.Services_id}
          serviceDate={convert_DbDate_To_DMY(formObj.formData.ServiceDate,1)}
          transport={formObj.formData.Transport}
          ac={true}
          vehicles_id={formObj.formData.Vehicles_id}
          numVehicles={formObj.formData.NoOfVehicles}                        
        />
       </>
      }

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
  const icons = ['icons/sightseeing.png'];
  const hints = ['List all Sightseeings in City'];
  const clicks = [formObj.sightseeingListing];
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
