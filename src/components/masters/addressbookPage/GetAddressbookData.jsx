import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import {Form, TabbedItem, TabPanelOptions, Tab, GroupItem} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';
import AddressbookContacts from './addressbookContactsPage/AddressbookContacts'
import AddressbookCategories from './addressbookCategoriesPage/AddressbookCategories'
import AddressbookSearchTags from './addressbookSearchTagsPage/AddressbookSearchTags'
import AddressbookHotel from './addressbookHotelPage/AddressbookHotel'

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Addressbook_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 11, label: "Name", field: 'Organisation', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, required: true, editorOptions: {maxLength: 60}, allowFilter: true, colSpan: 2},  
    {key: 12, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, colSpan: 2},

    {key: 3, label: "Country", field: 'Countries_id', width: 90, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, default: 200, required: false, allowFilter: true, colSpan: 3, editorOptions: {readOnly: true}},
    {key: 4, label: "Category", field: 'ContactCategories_id', width: 90, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, required: false, allowFilter: true, colSpan: 3},

    {key: 13, label: "Address", field: 'Address', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, allowFilter: true,  allowSearch: true, editorOptions: {maxLength:250, height: 110}, colSpan: 2, editorType: 'dxTextArea'},    
    {key: 14, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, required: false, colSpan: 2},

    {key: 19, label: "City", field: 'Cities_id', width: 110, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, allowFilter: true, colSpan: 1},
    {key: 22, label: "State", field: 'States_id', width: 100, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 1, allowFilter: true, allowHeaderFiltering: true, colSpan: 1, editorOptions: {readOnly: true}},

    {key: 31, label: "Sub-category", field: 'SubCategories', width: 110, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, required: false, allowFilter: true,  allowSearch: true, isDbField: false},    
    {key: 32, label: "Services", field: 'Services', width: 110, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, required: false, allowFilter: true,  allowSearch: true, isDbField: false},    
    {key: 33, label: "Search Tags", field: 'SearchTags', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, required: false, allowFilter: true,  allowSearch: true, isDbField: false},    

    /*=== This is a calcluated field, which is not in the database ===*/
    {key: 41, label: "Contact", field: 'Contacts', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, required: false, allowFilter: true,  allowSearch: true, isDbField: false},    

    {key: 51, label: "Pin", field: 'Postalcode', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:10}, colSpan: 1},    

    {key: 61, label: "Country Code", field: 'CountryCode', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:10}, colSpan: 1},    
    {key: 62, label: "Area Code", field: 'Areacode', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:10}, colSpan: 1},    
    {key: 63, label: "Phone", field: 'Phone', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:100}, colSpan: 1},    
    {key: 64, label: "Mobile", field: 'Org_mobile', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {maxLength:100}, colSpan: 1},    

    {key: 71, label: "E-mail", field: 'Email', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength:150, height: 80}, colSpan: 1,  editorType: 'dxTextArea'},    
    {key: 72, label: "Website", field: 'Www', width: 150, align: "left", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 3, editorOptions: {maxLength:100}, colSpan: 1},    

    {key: 81, label: "Currency", field: 'Currencies_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, colSpan: 1},
    {key: 82, label: "Active", field: 'Active', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 83, label: "EmptyItem", field: 'EmptyItem', width: 0, align: "left", dataType: 'emptyItem', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, required: false, colSpan: 1},

    {key: 84, label: "Book Through", field: 'Through_addressbook_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, colSpan: 2},
    {key: 85, label: "Payment Terms", field: 'VendorPaymentTerms_id', width: 120, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 4, colSpan: 1},

    {key: 91, label: "Combine Vouchers", field: 'CombineVouchersExp', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 5, default: false, booleanText: ['Yes','No'], hint: 'If ticked, combines supplier vouchers for a tour during Tally import'},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 6, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 6, editorOptions: {readOnly: true}},

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
            {viewButtonJsx(formObj,"group","Contacts",2)}
            {viewButtonJsx(formObj,"icons/categories.png","Categories",3)}
            {viewButtonJsx(formObj,"icons/searchTags.png","Search Tags",4)}                        
            {formObj.isHotel &&
              viewButtonJsx(formObj,"icons/accommodation.png","Hotel Info",5)
            }
          </div>
        </div>
      </div>

      {formObj.formDisplayType === 1 &&

        <div className="master-form-without-popup" style={{width: 1260}}>

          <Form
            colCount={1}
            id="form"
            width={'100%'}
            height={500}
            formData={formObj.formData}
            onFieldDataChanged={formObj.formFieldDataChanged}
          >

            <TabbedItem >

              <TabPanelOptions onSelectionChanged={formObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} colCount={1} >
                <GroupItem caption = "" colCount={6} cssClass="groupBottomClass">
                  {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
                </GroupItem>
                <GroupItem caption = "" colCount={4} cssClass="groupBottomClass">
                  {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
                </GroupItem>
                <GroupItem caption = "" colCount={2}>
                  {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
                </GroupItem>
              </Tab>

              <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''}>
                <GroupItem caption = "" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
                </GroupItem>
                <GroupItem caption = "Accounts" colCount={1}>
                  {getDevextremeFormItems(tableHeaderArray,5,formObj,dataObj)}
                </GroupItem>
                <GroupItem caption = "Last Edit" colCount={3}>
                  {getDevextremeFormItems(tableHeaderArray,6,formObj,dataObj)}
                </GroupItem>
              </Tab>

            </TabbedItem>

          </Form>

          {popupFooter(formObj, popupFooterButtonContainerStyle, [])}

        </div>

      }

      {formObj.formDisplayType === 2 && formObj.formMode > 1 &&
        <AddressbookContacts 
          addressbook_id={formObj.formData.Addressbook_id}
          onAddrDetailsModified={formObj.onAddrDetailsModified}
        />
      }

      {formObj.formDisplayType === 3 && formObj.formMode > 1 && 
       formObj.formData.ContactCategories_id !== null &&
        <AddressbookCategories
          addressbook_id={formObj.formData.Addressbook_id}
          categories_id={formObj.formData.ContactCategories_id}
          onAddrDetailsModified={formObj.onAddrDetailsModified}
        />
      }

      {formObj.formDisplayType === 4 && formObj.formMode > 1 &&
        <AddressbookSearchTags 
          addressbook_id={formObj.formData.Addressbook_id}
          onAddrDetailsModified={formObj.onAddrDetailsModified}
        />
      }

      {formObj.formDisplayType === 5 && formObj.formMode > 1 &&
        <AddressbookHotel 
          addressbook_id={formObj.formData.Addressbook_id}
          onAddrDetailsModified={formObj.onAddrDetailsModified}
        />
      }

      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
