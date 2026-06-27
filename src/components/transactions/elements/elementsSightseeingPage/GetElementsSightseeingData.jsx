import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import ElementsSightseeingDetails from './elementsSightseeingDetailsPage/ElementsSightseeingDetails';

export const tableHeaderArray = 
[ 
  {key: 1, label: "ID", field: 'ElemServices_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 2, label: "State", field: 'State', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, isDbField: false, allowHeaderFiltering: true, allowFilter: true, allowSort: true},    
  {key: 3, label: "City", field: 'City', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, isDbField: false, allowHeaderFiltering: true, allowFilter: true, allowSort: true},    
  {key: 4, label: "Service City", field: 'ServiceCities_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 1, required: true, isDbField: false},        
  {key: 500, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 2}, 

  {key: 5, label: "Service", field: 'Services_id', width: 250, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, required: true, colSpan: 2, hint: 'Services for this Agent / City'},
  {key: 6, label: "Service", field: 'Service', width: 350, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, required: true, colSpan: 2, hint: 'Services for this Agent / City', isDbField: false, allowFilter: true},
  {key: 7, label: "Agent", field: 'AgentAddressbook_id', width: 150, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},        

  {key: 8, label: "Wef", field: 'Wef', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 11, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},    

  {key: 14, label: "Quoted", field: 'Quoted', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true, default: true},

  {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

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

        <div style={{flex: 1.5, justifyContent: 'center'}}>

          <Form
            colCount={1}
            id="form"
            formData={formObj.formData}
            onFieldDataChanged={formObj.formFieldDataChanged}
          >
            <TabbedItem colSpan={1}>
              <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>
              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
                <Item itemType="group" caption="" colCount={2}>
                  {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption="Last Edited" colCount={2}>
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </Item>
              </Tab>
            </TabbedItem>

          </Form>
      
          {popupFooter(formObj, popupFooterButtonContainerStyle, [])}
      
        </div>

        <div style={{flex: 1, justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', paddingLeft: 10}}>
            <div style={{flex: 1}}>
              {formObj.formMode === 2 && 
                <ElementsSightseeingDetails 
                  elements_id={formObj.formData.ElemServices_id}
                  counter={compVar.counter}
                >              
                </ElementsSightseeingDetails>
            }
            </div>
          </div>  
        </div>  

      </div>

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}


