import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Popup} from 'devextreme-react/popup';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import VoucherCostBreakup from '../voucherCostBreakupPage/VoucherCostBreakup';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Company", field: 'Companies_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 3, label: "Office", field: 'Offices_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  
    {key: 4, label: "Tour Code", field: 'MasterTourCode', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:10, readOnly: false}},    
    {key: 5, label: "Tour Date", field: 'MasterTourDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},

    {key: 11, label: "Voucher No.", field: 'VoucherNo', width: 70, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, required: true},
    {key: 12, label: "Voucher Date", field: 'VoucherDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 13, label: "Year Ref", field: 'YearRef', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, required: true},
    {key: 14, label: "Type", field: 'VoucherTypes_id', width: 120, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},    
    {key: 15, label: "Hotel/Agent", field: 'Addressbook_id', width: 200, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},    
    {key: 16, label: "Service City", field: 'VoucherServiceCities_id', width: 100, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},    
    
    {key: 17, label: "Agent City", field: 'Cities_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: true, groupNo: 0, required: true},    
    {key: 18, label: "Booked Through", field: 'Through_Addressbook_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2},
    {key: 19, label: "Num Pax", field: 'Pax', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true},
    {key: 20, label: "Country", field: 'Countries_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, default: 200},    
        
    {key: 21, label: "Description", field: 'Description', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 80, buttons:[{name: 'trash', location: 'after', options: {icon: 'edit', hint: 'Edit Description', onClick: () => {alert('X')}}}] }},    




    {key: 22, label: "Instructions", field: 'Remarks1', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:500, readOnly: false, height: 80, buttons:[{name: 'trash', location: 'after', options: {icon: 'add', hint: 'Add Instructions', onClick: () => {alert('X')}}}]}, hint: 'Pax arrive by...Clients travel in coach...Entrace fees paid by...'},    
    {key: 23, label: "Hotel/Agent Remarks", field: 'HotelAgentRemark', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorType: 'dxTextArea', editorOptions: {maxLength:100, readOnly: false, height: 50}, hint: 'Pax are staying at....Our Agent is.....'},    
    {key: 24, label: "Remarks for Accounts", field: 'Remarks2', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorType: 'dxTextArea', editorOptions: {maxLength:150, readOnly: false, height: 50}, hint: 'Tour Cancelled...Complimentary stay...Extra Payment...'},    

    {key: 33, label: "Pax", field: 'TourLeader', width: 50, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:50, readOnly: false}},    

    {key: 31, label: "Exp. Cost", field: 'ExpectedCost', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0, hint: 'Expected supplier invoice. Auto generated.'},    
    {key: 32, label: "Adjusted Cost", field: 'AdjExpectedCost', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0, hint: 'Enter is expected cost is different from the one generated'},    

    {key: 34, label: "Exch. Rate", field: 'ExchangeRate', width: 80, align: "right", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, default: 1},
    {key: 35, label: "Currency", field: 'Currencies_id', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, default: 13},    

    {key: 41, label: "Issued On", field: 'IssuedOn', width: 100, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 42, label: "Issued By", field: 'IssuedBy', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength:20}},    
    {key: 43, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: false, colSpan: 1},

    {key: 44, label: "Line Num in Quotations", field: 'QuoLines_LineNum', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, hint: 'Corresponding line number in quotations'},

    {key: 51, label: "Amount Billed", field: 'AmountBilled', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0},    
    {key: 52, label: "Amount Paid", field: 'AmountPaid', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0},    
    {key: 53, label: "Billed", field: 'Billed', width: 100, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0},    

    {key: 61, label: "Checked", field: 'Checked', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: false},
    {key: 62, label: "FIT", field: 'Fit', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: true},
    {key: 63, label: "Manual", field: 'Manual', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: true},
    {key: 64, label: "Extra Services", field: 'ExtraServices', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: false},
    {key: 65, label: "Extras", field: 'Extras', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: false},
    {key: 66, label: "Modified", field: 'Modified', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: true},
    {key: 68, label: "Tour Leader Present", field: 'TL_Present', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: false},
    {key: 69, label: "Include in B/S", field: 'IncludeInBalanceSheet', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 5, booleanText: ['Yes','No'], default: true},

    {key: 80, label: "Tour Ref", field: 'TourRef', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 6, colSpan: 1, editorOptions: {maxLength:10, readOnly: false}},    

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  const popupHeight = (formObj.errorMsg) ? 650+popupTitleContainerStyle.height : 650;
  const showScrollBar = formObj.showHintData ? 'always' : 'never';

  // do not show hint, help, save buttons in the Contacts tab
  let btnObjArray = [];
  if (formObj.tabIndex > 1) {
    btnObjArray = [{visible: false},{visible: false},{visible: false}];          
  }

  const voucherCostBreakupProps = {
    vouchers_id: formObj.formData.Vouchers_id,
    voucherTypes_id: formObj.formData.VoucherTypes_id,
    costModified: formObj.CostModified
  }

  // set function to call 'Edit Description' 
  let idx = tableHeaderArray.findIndex(rec => rec.field==='Description');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.additionalButtonActions[0];
    if (formObj.formMode === 1) {
      tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = () => {};
    }
  }

  // set function to call 'Add Instructions' 
  idx = tableHeaderArray.findIndex(rec => rec.field==='Remarks1');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.additionalButtonActions[1];
    if (formObj.formMode === 1) {
      tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = () => {};
    }
  }
	
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
            <Item itemType="group" caption="" colCount={4}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Voucher Issue Details" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption = "Link to Quotation" colCount={3} >
                {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
            </Item>
            { formObj.uncoded  &&
            <Item itemType="group" caption = " " colCount={3} >
              {getDevextremeFormItems(tableHeaderArray,6,formObj,dataObj)}
            </Item>
            }            
          </Tab>
          { formObj.formData.Vouchers_id && formObj.formData.Vouchers_id > 0 &&
            <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[2].title : ''} >
              {<VoucherCostBreakup {...voucherCostBreakupProps}></VoucherCostBreakup>}
            </Tab>
          }

        </TabbedItem>

      </Form>
      
      {popupFooter(formObj, popupFooterButtonContainerStyle, btnObjArray)}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}

//**********************************************************/
export const getVoucherYearRef = (voucherDate) => {

  let year = voucherDate.getFullYear();
  let month = voucherDate.getMonth()+1;

  const yearRef = (month >= 4) ? year + 1 : year;

  return yearRef;
}

