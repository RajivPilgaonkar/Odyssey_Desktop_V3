import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";
import CityCrossings from './cityCrossingsPage/CityCrossings';
import StateCrossings from './stateCrossingsPage/StateCrossings';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'distances_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "From City", field: 'from_cities_id', width: 100, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 1},    
    {key: 3, label: "To City", field: 'to_cities_id', width: 120, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, allowFilter: true, editorOptions: {readOnly: false}, hint: 'Cannot edit city as that affects the reverse entries'},    
    {key: 500, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    

    {key: 5, label: "Distance", field: 'distance', width: 100, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, required: true},
    {key: 6, label: "Duration", field: '[time]', width: 100, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, hint: "Ex. 23:15, 08:25", required: true},        
    {key: 7, label: "Duration", field: 'duration', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, hint: "Ex. 23:15, 08:25", required: true, isDbField: false},        
    {key: 8, label: "Drivable?", field: 'drive', width: 100, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},

    {key: 10, label: "Via", field: 'via', width: 300, align: "left", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength: 255}},  
    {key: 11, label: "Through Cities", field: 'CityCrossings', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength: 255}, isDbField: false, allowFilter: true},  
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false},    
    {key: 12, label: "Through States", field: 'StateCrossings', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength: 255}, isDbField: false, allowFilter: true},  
    {key: 13, label: "Edited", field: 'edited', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},
    {key: 14, label: "CreateSectors", field: 'CreateSectors', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

  ];
  
export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

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
        </div>
      </div>

      <div className="master-detail-body-type1">

        <div style={{flex: 2, justifyContent: 'center'}}>

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
                <Item itemType="group" caption="Last Edited " colCount={3}>
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
                <CityCrossings 
                  distances_id={formObj.formData.distances_id}
                  distancesFormObj={formObj}
                  admLevel={formObj.admLevel}
                >              
                </CityCrossings>
              }
            </div>
            <div style={{flex: 1}}>
              {formObj.formMode === 2 && 
                <StateCrossings 
                  distances_id={formObj.formData.distances_id}
                  distancesFormObj={formObj}
                  admLevel={formObj.admLevel}
                >              
                </StateCrossings>
              }
            </div>
          </div>  
        </div>  

      </div>

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
