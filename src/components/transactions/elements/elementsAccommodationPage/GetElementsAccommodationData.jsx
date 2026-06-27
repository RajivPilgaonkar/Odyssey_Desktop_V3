import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import ElementsAccommodationDetails from './elementsAccommodationDetailsPage/ElementsAccommodationDetails';

export const tableHeaderArray = 
[ {key: 1, label: "ID", field: 'ElemAccommodation_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 2, label: "State", field: 'State', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, isDbField: false, allowHeaderFiltering: true, allowFilter: true, allowSort: true},    
  {key: 3, label: "City", field: 'City', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1, isDbField: false, allowHeaderFiltering: true, allowFilter: true, allowSort: true},    

  {key: 4, label: "Hotel", field: 'Addressbook_id', width: 200, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true, allowFilter: true},        
  {key: 5, label: "Hotel", field: 'Hotel', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, isDbField: false, allowFilter: true},    
  //{key: 400, label: "Riksja Id", field: 'RiksjaElementId', width: 80, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: false},        
  {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},

  {key: 6, label: "From Date", field: 'FromDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 7, label: "To Date", field: 'ToDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
  {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},

  {key: 8, label: "Room Type", field: 'RoomTypes_id', width: 100, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true},    
  {key: 9, label: "Meal Plan", field: 'MealPlans_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: true, default: 2},
  {key: 10, label: "AC", field: 'AC', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},

  {key: 11, label: "Currency", field: 'Currencies_id', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, required: true, default: 27},    
  {key: 13, label: "SpecialPeriod", field: 'SpecialPeriod', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No'], required: true, default: true},
  {key: 14, label: "Quoted", field: 'Quoted', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No'], required: true, default: true},
  {key: 503, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, colSpan: 2},

  {key: 31, label: "Single", field: 'CostSingle', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    
  {key: 32, label: "Double", field: 'CostDouble', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    
  {key: 33, label: "Triple", field: 'CostTriple', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, default: 0},    

  {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
  {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, editorOptions: {readOnly: true}},

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
                <Item itemType="group" caption=" " colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </Item>
                <Item itemType="group" caption="Last Edited " colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
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
                <ElementsAccommodationDetails 
                  elements_id={formObj.formData.ElemAccommodation_id}
                  counter={compVar.counter}
                >              
                </ElementsAccommodationDetails>
            }
            </div>
          </div>  
        </div>  

      </div>

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}


