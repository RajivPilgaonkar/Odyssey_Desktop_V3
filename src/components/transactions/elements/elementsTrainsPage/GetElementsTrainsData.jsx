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
[ {key: 1, label: "ID", field: 'ElemTickets_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 2, label: "State", field: 'State', width: 80, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, isDbField: false, allowHeaderFiltering: true},    
  {key: 3, label: "Start City", field: 'City', width: 100, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, isDbField: false, allowHeaderFiltering: true},    

  {key: 4, label: "From City", field: 'From_Cities_id', width: 90, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 1, required: true},        
  {key: 5, label: "To City", field: 'To_Cities_id', width: 80, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 1, required: true},        
  {key: 6, label: "From City", field: 'FromCity', width: 90, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, required: false, allowFilter: true, isDbField: false},        
  {key: 7, label: "To City", field: 'ToCity', width: 90, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, required: false, allowFilter: true, isDbField: false},        

  {key: 500, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    
  {key: 8, label: "From Station", field: 'From_TrainStations_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 9, label: "To Station", field: 'To_TrainStations_id', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, required: true},
  {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    

  {key: 10, label: "Train No", field: 'TrainNo', width: 70, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}, required: true, allowFilter: true},    
  {key: 11, label: "Train", field: 'TrainName', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength: 30, readOnly: true}, isDbField: false, allowFilter: true},    
  {key: 12, label: "Timings", field: 'Timings', width: 90, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30}},    
  {key: 13, label: "Operates On", field: 'DaysOfOperation', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength: 30, readOnly: true}, isDbField: false},    
  {key: 14, label: "Overnight", field: 'Overnight', width: 80, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: false, allowHeaderFiltering: true},
    
  {key: 23, label: "Wef", field: 'Wef', width: 90, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 503, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},

  {key: 24, label: "Cost", field: 'Cost', width: 60, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0', readOnly: true}, default: 0},    
  {key: 27, label: "1A", field: 'ac_1a_cost', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    
  {key: 28, label: "2A", field: 'ac_2t_cost', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    
  {key: 29, label: "3A", field: 'ac_3t_cost', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    
  {key: 26, label: "CC", field: 'ac_cc_cost', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    
  {key: 25, label: "ECC", field: 'ac_ecc_cost', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    

  {key: 31, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 2, required: true},    
  {key: 33, label: "Type", field: 'TrainType', width: 80, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, colSpan: 1, editorOptions: {maxLength: 30, readOnly: true}, isDbField: false},    
  {key: 34, label: "Quoted", field: 'Quoted', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, booleanText: ['Yes','No'], required: true, default: true},
  {key: 35, label: "Tickets_id", field: 'Tickets_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 2},    

  {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 3, editorOptions: {readOnly: true}},

];

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj,compVar) {

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
          <Button
            width={35}
            height={35}
            type="normal"
            stylingMode="outlined"
            icon={"icons/quickEntry.png"}
            onClick={formObj.quickCostEntry}
          />
          <div style={{paddingLeft: 100, fontSize: 18, color: 'blue'}}>
            {formObj.formTitle}
          </div>
        </div>
      </div>

      <div className="master-detail-body-type1">

        <div style={{flex: 3, justifyContent: 'center'}}>

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
                <Item itemType="group" caption=" " colCount={5}>
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption=" " colCount={5}>
                  {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
                </Item>
              </Tab>
              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
                <Item itemType="group" caption="Last Edited" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
                </Item>
              </Tab>
            </TabbedItem>
          </Form>
      
          {popupFooter(formObj, popupFooterButtonContainerStyle, [])}
      
        </div>

      </div>

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}


