import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';
import Switch from "react-switch";
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { Button } from 'devextreme-react/button';

import { getDevextremeFormItems } from "../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../common/ComponentStyles";
import CityGroupDetails from './cityGroupDetailsPage/CityGroupDetails';

import '../../common/MasterGrid.css';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'CarHireGroups_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Group", field: 'CarHireGroup', width: 500, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 3, required: true, editorOptions: {maxLength: 100}, allowFilter: true},  
    {key: 3, label: "Default Agent", field: 'DefaultAgents_id', width: 300, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: true, groupNo: 0, colSpan: 2, allowFilter: true},    
    {key: 10, label: "Active", field: 'active', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], default: true},

    {key: 100, label: "Last Edited On", field: 'ModifiedOn', width: 60, align: "center", dataType: 'date', visible: false, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy', readOnly: true}},
    {key: 101, label: "Last Edited By", field: 'ModifiedByUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: true, groupNo: 1, editorOptions: {readOnly: true}},

  ];

export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

//**********************************************************/
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
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 30, paddingRight: 10}}> 
            <div style={{paddingRight: 5}}>
              Active Agents
            </div>
            <div style={{justifyContent: 'center', alignItems: 'center', height: 20}}>
              <Switch height={20} width={40} onChange={formObj.formParams.onActiveAgentSwitchChange} checked={formObj.formParams.activeAgents} uncheckedIcon={false}/>
            </div>
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
          {formObj.formMode === 2 && 
            <CityGroupDetails 
              carHireGroups_id={formObj.formData.CarHireGroups_id}
              carHireFormObj={formObj}
              admLevel={formObj.admLevel}
            >              
            </CityGroupDetails>
          }
        </div>  

      </div>
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>

  );
}
