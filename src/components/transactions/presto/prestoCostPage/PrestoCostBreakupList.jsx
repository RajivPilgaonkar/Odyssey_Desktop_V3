import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';
import {setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { dbGetRecord, dbGetRecordRaw } from '../../../../actions';
import {searchDataGridJsx, searchDataGetColumnsJsx, getFieldsArray} from "../../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';

export const tableHeaderArray = 
[ {key: 1, label: "ID", field: 'QuoCostingTrace_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

  {key: 2, label: "Quotations_id", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},  

  {key: 3, label: "Record Type", field: 'RecordType', width: 110, align: "left", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, required: true},
  {key: 4, label: "Code", field: 'CostingCode', width: 80, align: "center", dataType: 'string', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, editorOptions: {maxLength:4}},    
  {key: 5, label: "Description", field: 'Description', width: 250, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, editorOptions: {maxLength:200}},    

  {key: 11, label: "Rate", field: 'Rate', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
  {key: 12, label: "Qty", field: 'Qty', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
  {key: 13, label: "Group Amt", field: 'GroupAmt', width: 110, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, specialCol: 1},
  {key: 14, label: "Amount", field: 'Cost', width: 90, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},

  {key: 21, label: "Gst (%)", field: 'GstPerc', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
  {key: 22, label: "Gst", field: 'Gst', width: 60, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
  {key: 23, label: "Total", field: 'Total', width: 80, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},

  {key: 31, label: "Meals", field: 'MealCost', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, specialCol: 2},
  {key: 32, label: "Agent Gst", field: 'AgentComm', width: 100, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, specialCol: 2},

];

let compVar = {};

function PrestoCostBreakupList (props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [],
      keyField: 'QuoCostingTrace_id',
      quoCostingTrace_id: -1, forexRemarks: '',
      filteredTableHeaderArray: [],
      tableWidth: 0,
    }   
        
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);  

  
  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    try {

      compVar.filteredTableHeaderArray = filterTableHeaderArray(tableHeaderArray);
      compVar.fieldArray = getFieldsArray(compVar.filteredTableHeaderArray);
  
      const whereStr = "Quotations_id = " + props.quotations_id.toString() + " AND QuoLines_id = " + props.quoLines_id.toString() + " ";
      const tableStr = "QuoCostingTrace qt ";
      compVar.mainData = await dbGetRecord({fields: compVar.fieldArray, orders: ['CostingCode, QuoCostingTrace_id'], table: tableStr, where: whereStr});   

      const query = "SELECT c.CurrencyCode, ql.ExchRate, ql.Cost + COALESCE(ql.ServiceTax,0.0) AS Cost FROM QuoLines ql " +
        "LEFT JOIN Quotations q ON ql.Quotations_id = q.Quotations_id " +
        "LEFT JOIN Currencies c ON q.Currencies_id = c.currencies_id " +
        "WHERE ql.QuoLines_id = " + props.quoLines_id.toString();  
      const costObj = await dbGetRecordRaw({query: query});   
      if (costObj.length > 0 && costObj[0].CurrencyCode !== null && costObj[0].ExchRate !== null && costObj[0].Cost !== null) {
        const exchRate = (costObj[0].ExchRate === 0) ? 1 : costObj[0].ExchRate;
        const forex = costObj[0].Cost/exchRate;
        compVar.forexRemarks = "Forex: " + costObj[0].CurrencyCode + " " + forex.toFixed(0).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " @ " + costObj[0].ExchRate.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      }
  
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const filterTableHeaderArray = (tableArray) => {

    let filteredTableHeaderArray = [];    

    if (props.trsType === 2) {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined || rec.specialCol === 2});    
    } else if (props.trsType === 3) {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined || rec.specialCol === 1});    
    } else {
      filteredTableHeaderArray = tableArray.filter(rec => {return rec.specialCol === undefined});    
    }

    return filteredTableHeaderArray;
  }


  //**********************************************************/
  const closePopover = async () => {    

    if (props.closeBreakupForm !== undefined) {
      await props.closeBreakupForm({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const onFocusedRowChanged = async (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data.QuoCostingTrace_id;

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;

        forceRender();
      }

    }

  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.RecordType === 3) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.style.fontWeight = 500; 
      } else if (e.data.RecordType === 1) {
        if (e.data.Description !== null && e.data.Description.includes('**PY')) {
          e.rowElement.style.color = 'red'; 
        }
      }  
    }
  }


  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const open = (props.open === undefined) ? true : props.open;
    const tableWidth = compVar.filteredTableHeaderArray.filter(rec => rec.visible).reduce((acc, rec) => acc + rec.width, 0);

    const data = {
      keyExpr: compVar.keyField,
      maxPageSize: 900,
      boxWidth: tableWidth,
      boxHeight: 440,
      getColumns: searchDataGetColumnsJsx(compVar.filteredTableHeaderArray,compVar),
      onFocusedRowChanged: onFocusedRowChanged,
      onRowPrepared: onRowPrepared,
      closePopover: closePopover,
      pagination: false
    }

    return (

      <Popup visible={open} height={600} width={1100} onHiding={closePopover}>

        <div style={{width: '100%', maxHeight: data.boxHeight+100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>

          {searchDataGridJsx(compVar, data)}

          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 16, color: 'blue', paddingTop: 10}}>
            {compVar.forexRemarks}
          </div>

          <div className="search-grid-button-container" style={{width: data.boxWidth, paddingTop: 10}}>
            <div className="search-grid-single-button-container">
              <Button text="Close" type="default" onClick={closePopover}/>
            </div>
          </div>

        </div>

      </Popup>
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default PrestoCostBreakupList;

