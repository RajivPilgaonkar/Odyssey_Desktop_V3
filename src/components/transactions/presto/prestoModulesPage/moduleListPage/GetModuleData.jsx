import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import { Button } from 'devextreme-react/button';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';

import { getDevextremeFormItems, convert_DbDate_To_DMY } from "../../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../../common/ComponentStyles";

import ModuleDetails from '../moduleDetailsPage/ModuleDetails';

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 'QuoModules_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 11, label: "Quo. No.", field: 'QuotationNo', width: 90, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {format: '#,##0'}, required: true},
  {key: 12, label: "Quo. Date", field: 'QuotationDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},

  {key: 2, label: "Tour Code", field: 'TourCode', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 1, editorOptions: {maxLength:10, readOnly: false}, required: true},    
  {key: 3, label: "Tour Date", field: 'TourDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},

  {key: 13, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2},
  {key: 14, label: "Pax", field: 'PaxName', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:50, readOnly: false}, required: true},    
  {key: 15, label: "Year Ref", field: 'QuotationYearRef', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, required: true},
  {key: 16, label: "Num Pax", field: 'NumPax', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: true, default: 2},
  {key: 17, label: "Arrival Date", field: 'ArrivalDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 18, label: "Trial", field: 'Trial', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, required: true, default: 0},
  {key: 20, label: "Agent", field: 'PrincipalAgents_id', width: 200, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, colSpan: 2, required: true},    

  {key: 21, label: "Total Amt", field: 'TotalAmt', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0, isDbField: false },    
  {key: 22, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 2, default: 27, required: true},    

  {key: 23, label: "Singles", field: 'NumSingles', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 0},
  {key: 24, label: "Doubles", field: 'NumDoubles', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 0},
  {key: 25, label: "Triples", field: 'NumTriples', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 0},
  {key: 26, label: "Twins", field: 'NumTwins', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, required: true, default: 0},
  {key: 40, label: "Remarks", field: 'Remarks', width: 250, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, colSpan: 4, editorType: 'dxTextArea', editorOptions: {maxLength:250, readOnly: false, height: 60}},    

  {key: 42, label: "Invoices Id", field: 'Invoices_id', width: 70, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, required: false, isDbField: false},

  {key: 43, label: "Cancelled", field: 'Cancelled', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 4, booleanText: ['Yes','No'], default: false, editorOptions: {readOnly: true}},    
  {key: 44, label: "Created By", field: 'UserName', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 4, colSpan: 1, editorOptions: {maxLength:30, readOnly: true}, required: false, isDbField: false},    

  {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 5, editorOptions: {readOnly: true}},

];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

export function buttonsJsx(index,formObj) {

  const widths = [35,35,35,35];
  const heights = [35,35,35,35];
  const types = ["normal","normal","normal","normal"];
  const stylingModes = ["outlined","outlined","outlined","outlined"];
  const icons = ["chevronleft","icons/form.png","icons/table.png","trash"];
  const hints = ["Back","Form","Line Items","Delete this entire module along with its line items"];  
  const onClicks = [formObj.onLineItemsHiding,formObj.formDisplayTypeClick,formObj.tableDisplayTypeClick,formObj.deleteFullModule];

  const width = widths[index];
  const height = heights[index];
  const type = types[index];
  const stylingMode = stylingModes[index];
  const icon = icons[index];
  const hint = hints[index];
  const onClick = onClicks[index];

  return (
    <Button
      width={width}
      height={height}
      type={type}
      stylingMode={stylingMode}
      icon={icon}
      hint={hint}
      onClick={onClick}
    />  
  );

}


export function getDevExtremePopupForm(formObj,dataObj,moduleParamsObj) {

  const title = (formObj.formMode !== 1) ? moduleParamsObj.pax : 'New Module';
  const deleteButtonVisible = (formObj.formData.Invoices_id !== null || formObj.formData.Cancelled) ? 'hidden' : 'visible';

  const tourDate = convert_DbDate_To_DMY(formObj.formData.TourDate,1);

  const strikethrough = (formObj.formData.Cancelled) ? 'line-through' : null;
  const invoiced = (formObj.formData.Invoices_id > 0) ? ' (Invoiced)' : '';

  return (

    <React.Fragment>

      {popupTitle(formObj, popupTitleContainerStyle)}

      <div className="master-detail-top-panel">
        <div className="master-detail-top-panel-button-container">
          {buttonsJsx(0,formObj)}
          <div style={{paddingLeft: 100, fontSize: 16}}>
            {title}
          </div>
          {formObj.formMode !== 1 &&
            <>
              <div style={{paddingLeft: 100, fontSize: 18, color: '#0066cc', fontWeight: 500, textDecoration: strikethrough}}>
                {`${moduleParamsObj.tourCode}`} &nbsp; &nbsp; {`${moduleParamsObj.tourDate} ${invoiced}` }
              </div>
            </>
          }
          <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            {buttonsJsx(1,formObj)}
            {buttonsJsx(2,formObj)}
          </div>
          <div style={{display: 'flex', flex: 0.5, justifyContent: 'flex-end', alignItems: 'center', visibility: deleteButtonVisible}}>
            {buttonsJsx(3,formObj)}
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
                <Item itemType="group" caption="" colCount={4}>
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption=" " colCount={4}>
                  {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption=" " colCount={4}>
                  {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
                </Item>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
                <Item itemType="group" caption = "" colCount={3} >
                  {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption = "Last Edited" colCount={3} >
                  {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
                </Item>
              </Tab>

            </TabbedItem>

          </Form>

          {popupFooter(formObj, popupFooterButtonContainerStyle, formObj.navObj)}

        </div>

      }

      {formObj.formDisplayType === 2 && 
        <ModuleDetails
          quoModules_id={formObj.formData.QuoModules_id}
          tourCode={formObj.formData.TourCode}
          tourDate={tourDate}
          numPax={formObj.formData.NumPax}
          invoices_id={formObj.formData.Invoices_id}
          cancelled={formObj.formData.Cancelled}              
          numSingles={formObj.formData.NumSingles}
          numDoubles={formObj.formData.NumDoubles}
          numTriples={formObj.formData.NumTriples}
          numTwins={formObj.formData.NumTwins}
        />          
      }

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
