import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";

import BookingClients from './bookingClientsPage/BookingClients';
import BookingTours from './bookingToursPage/BookingTours';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Bookings_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Reference", field: 'Reference', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: true, editorOptions: {maxLength: 50}},  
    {key: 500, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 2},    
    {key: 3, label: "Agent", field: 'Addressbook_id', width: 300, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, required: true},    
    {key: 501, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 1},    

    {key: 4, label: "Country", field: 'Countries_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, required: true, allowFilter: true, default: 200, colSpan: 1},  
    {key: 502, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: false, colSpan: 2},    
    {key: 5, label: "Currency", field: 'Currencies_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 1},

    {key: 10, label: "Pax", field: 'PaxNames', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptins: {maxLength: 150, readOnly: true}, isDbField: false, allowFilter: true},  
    {key: 11, label: "Tours", field: 'Tours', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength: 150, readOnly: true}, isDbField: false, allowFilter: true},  

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 2, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 2, editorOptions: {readOnly: true}},

  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}


export function getDevExtremePopupForm(formObj,dataObj) {

  // set function to call days of operation
  const idx = tableHeaderArray.findIndex(rec => rec.field==='DayString');
  if (idx > -1) {
    tableHeaderArray[idx].editorOptions.buttons[0].options.onClick = formObj.onSelectDaysOfOperation;
  }

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
            onContentReady={formObj.contentReady}
          >
            <TabbedItem colSpan={1}>
              <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>
              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
                <Item itemType="group" caption="" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
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
            <div style={{display: 'flex', flex: 1}}>
              {formObj.formMode === 2 && 
                <BookingClients
                  bookings_id={formObj.formData.Bookings_id}
                  admLevel={formObj.admLevel}
                >              
                </BookingClients>
              }
            </div>
            <div style={{display: 'flex', flex: 0.8}}>
              {formObj.formMode === 2 && 
                <BookingTours
                  bookings_id={formObj.formData.Bookings_id}
                  admLevel={formObj.admLevel}
                >              
                </BookingTours>
              }
            </div>
          </div>  
        </div>  


      </div>
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
