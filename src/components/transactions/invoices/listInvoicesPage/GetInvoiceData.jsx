import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';
import InvoiceDetails from './invoiceDetailsPage/InvoiceDetails'

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Invoices_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Invoice Type", field: 'InvoiceTypes_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 3, label: "Company", field: 'Companies_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 4, label: "Division", field: 'Divisions_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 5, label: "Office", field: 'Offices_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

    {key: 11, label: "Invoice No.", field: 'InvoiceNo', width: 60, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, required: true},
    {key: 12, label: "Invoice Date", field: 'InvoiceDate', width: 100, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 13, label: "Year Ref", field: 'YearRef', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {readOnly: true}},
    {key: 14, label: "Div Invoice No.", field: 'DivInvoiceNo', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, required: true},

    {key: 15, label: "Tour Code", field: 'MasterCode', width: 60, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength: 10}},
    {key: 16, label: "Tour Date", field: 'MasterDepartureDate', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},

    {key: 17, label: "Customer", field: 'Addressbook_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, hint: "If customer not in drop down, enter in 'Additional' tab"},    
    {key: 18, label: "Customer", field: 'CustomerParty', width: 120, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, isDbField: false},    
    {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},

    {key: 21, label: "Tax (%)", field: 'TaxPercentage', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},

    {key: 22, label: "Amount", longLabel: 'Invoice Amount', field: 'TotalInvoiceAmount', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, showZeroAsBlanks: true, default: 0},
    {key: 23, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, default: 13}, 
    {key: 24, label: "Exch. Rate", field: 'ExchangeRate', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00', readOnly: true}, showZeroAsBlanks: true, default: 1},

    {key: 31, label: "Recipient GSTIN", field: 'GstinRecipient', width: 60, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength: 30}},
    {key: 32, label: "Place Of Supply", field: 'PlaceOfSupply', width: 120, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {maxLength: 50}, required: true, hint: "Depending on this selection, enter IGST or C/S GST"},    
    {key: 33, label: "Supply State", field: 'SupplyStates_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, required: true, default: 10},    
    {key: 34, label: "Tax Under RCM", field: 'TaxPayableRcm', width: 60, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {maxLength: 10}, required: true, default: 'No'},

    {key: 41, label: "I GST(%)", field: 'I_Gst_Perc', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, default: 0, hint: "Enter if inter-state"},
    {key: 42, label: "C GST(%)", field: 'C_Gst_Perc', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, default: 0, hint: "Enter if intra(within)-state"},
    {key: 43, label: "S GST(%)", field: 'S_Gst_Perc', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, default: 0, hint: "Enter if intra(within)-state"},
    {key: 44, label: "I GST (Rs.)", field: 'I_Gst', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, showZeroAsBlanks: true, default: 0, hint: "Amt in Rs."},
    {key: 45, label: "C GST (Rs.)", field: 'C_Gst', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, showZeroAsBlanks: true, default: 0, hint: "Amt in Rs."},
    {key: 46, label: "S GST (Rs.)", field: 'S_Gst', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, showZeroAsBlanks: true, default: 0, hint: "Amt in Rs."},

    {key: 51, label: "Customer", field: 'Party', width: 60, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength: 100}, colSpan: 2, hint: "Enter if customer not listed in drop-down"},
    {key: 504, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: false, colSpan: 1},
    {key: 52, label: "Address", field: 'Party_Addr', width: 400, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength: 200, height: 90}, colSpan: 3, editorType: 'dxTextArea' },

    {key: 55, label: "Notes", field: 'Notes', width: 400, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, required: false, editorOptions: {maxLength:255, height: 90}, colSpan: 3, editorType: 'dxTextArea'},    

    {key: 100, label: "On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, allowFilter: false, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, allowFilter: false, editorOptions: {readOnly: true}},

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

      <div className="master-detail-top-panel">
        <div className="master-detail-top-panel-button-container">
          <Button
            width={35}
            height={35}
            type="normal"
            stylingMode="outlined"
            icon={"chevronleft"}
            onClick={formObj.onHiding}
          />
          <div style={{paddingLeft: 100, fontSize: 18, color: 'blue'}}>
            {formObj.formTitle}
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
            {viewButtonJsx(formObj,"icons/form.png","Form",1)}
            {viewButtonJsx(formObj,"icons/categories.png","Invoice Line Items",2)}
          </div>
        </div>
      </div>

      {formObj.formDisplayType === 1 &&

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
                <Item itemType="group" caption=" " colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
                <Item itemType="group" caption="" colCount={2}>
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption="GST Invoice Info" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[2].title : ''} >
                <Item itemType="group" caption="Uncoded Customer Info" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption="Last Edited " colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
                </Item>
              </Tab>

            </TabbedItem>

          </Form>
      
          {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

        </div>

      }

      {formObj.formDisplayType === 2 && formObj.formMode > 1 &&
        <InvoiceDetails
          invoices_id={formObj.formData.Invoices_id}
          onInvDetailsModified={formObj.onInvDetailsModified}
        />
      }
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
