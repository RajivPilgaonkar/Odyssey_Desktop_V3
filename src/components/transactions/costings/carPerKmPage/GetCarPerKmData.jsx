import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import Switch from "react-switch";

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'CarHire_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Addressbook_id", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 3, label: "ServiceCities_id", field: 'ServiceCities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

    {key: 4, label: "Vehicle", field: 'Vehicles_id', width: 150, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, required: true, colSpan: 2, hint: 'Based on Masters -> Cars -> CarHire'},
    {key: 5, label: "Vehicle", field: 'Vehicle', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, isDbField: false },

    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},
    {key: 6, label: "From Pax", field: 'FromPax', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true, default: 1, editorOptions: {format: '#,##0'}},
    {key: 7, label: "To Pax", field: 'ToPax', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true, default: 2, editorOptions: {format: '#,##0'}},
    {key: 701, label: "Pax", field: 'NumPax', width: 70, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, default: 0, showZeroAsBlanks: true, isDbField: false},

    {key: 8, label: "Wef", field: 'Wef', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, required: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 9, label: "Wet", field: 'Wet', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    
    {key: 10, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 13  },
    {key: 11, label: "Per Km (AC)", field: 'CostPerKmAc', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0.00'}},
    //{key: 11, label: "Per Km (NAC)", field: 'costperkmnonac', width: 120, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0.00'}, showZeroAsBlanks: true},
    {key: 12, label: "Min Kms", field: 'MinimumKm', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, colSpan: 3,  editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},

    {key: 13, label: "Night Halt", field: 'CostNightHalt', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 14, label: "Toll Tax", field: 'TollTax', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 15, label: "Escort", field: 'CostEscort', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 16, label: "Commission(%)", field: 'Commission', width: 130, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 3, default: 0, editorOptions: {format: '#,##0.00'}, showZeroAsBlanks: true},

    {key: 17, label: "Remarks", field: 'Remarks', width: 130, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, colSpan: 3, editorType: 'dxTextArea', editorOptions: {maxLength:200, readOnly: false, height: 100}, hint: 'Max 200 char'},

    {key: 40, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 41, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 5, editorOptions: {readOnly: true}},

  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


//**********************************************************/
const switchParamsJsx = (formObj,compVar) => {

  return(
    <div style={{display: 'flex', flexDirection: 'row', padding: 5}}>
      <div style={{fontSize: 18}}>
        Active Vehicles
      </div>
      <div style={{paddingLeft: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
        <Switch 
          height={20} 
          width={40} 
          onChange={formObj.onActiveSwitchValueChanged} 
          checked={compVar.vehicleSwitchValue} 
          uncheckedIcon={false}
        />
      </div>
    </div>
  );
}

export function getDevExtremePopupForm(formObj,dataObj,compVar) {

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

      {switchParamsJsx(formObj,compVar)}

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
            <Item itemType="group" caption="Validity" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Costs" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Last Edit" colCount={3}>
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
