import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Voucher No.", field: 'VoucherNo', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, required: true, allowFilter: true},
    {key: 3, label: "Voucher Date", field: 'VoucherDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 4, label: "Tour Code", field: 'MasterTourCode', width: 90, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength: 10}, allowFilter: true},
    {key: 5, label: "Tour Date", field: 'MasterTourDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 6, label: "Description", field: 'Description', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength: 250}, allowFilter: true},
    {key: 7, label: "Organisation", field: 'Organisation', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength: 100}, allowFilter: true},
    {key: 8, label: "Voucher Type", field: 'VoucherType', width: 110, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength: 30}, allowFilter: true},
  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

export function viewButtonJsx(formObj,icon,hint,clickType) {

  return (
    <Button
      width={35}
      height={35}
      type="normal"
      stylingMode="outlined"
      icon={icon}
      hint={hint}
      onClick={() => {return formObj.onDisplayTypeClick(clickType)}}
    />  
  );

}


export function getDevExtremePopupForm(formObj,dataObj) {

  return (

    <React.Fragment>

      {popupTitle(formObj, popupTitleContainerStyle)}

      <div className="master-form-without-popup" style={{width: 1050}}>

        <Form
          style={{width: '100%'}}
          colCount={1}
          id="form"
          formData={formObj.formData}
          onFieldDataChanged={formObj.formFieldDataChanged}
        >
          <TabbedItem colSpan={1}>
            <TabPanelOptions onSelectionChanged={formObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>

            <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
              <Item itemType="group" caption="" colCount={3}>
                {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
              </Item>
            </Tab>

          </TabbedItem>

        </Form>
      
        {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

      </div>
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
