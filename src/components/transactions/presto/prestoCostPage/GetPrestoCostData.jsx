import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';

import {getDevExtremeStandardTable} from "../../../common/HelperComponents";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'QuoLines_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Sr No", field: 'LineNum', width: 55, align: "center", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 3, label: "Date", field: 'QuoDate', width: 90, align: "center", dataType: 'date', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 4, label: "QuoTime", field: 'QuoTime', width: 95, align: "center", dataType: 'string', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}},    
    {key: 5, label: "Time", field: 'QuoTime_Time', width: 55, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:5}, isDbField: false, hint: "Ex. 23:15, 08:25"},        

    {key: 6, label: "City", field: 'City', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    
    {key: 7, label: "Supplier", field: 'Agent', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:100, readOnly: false}, required: true, isDbField: false},    
    {key: 8, label: "Description", field: 'QuoString', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    

    {key: 11, label: "Cost", field: 'Cost', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},
    {key: 12, label: "GST", field: 'ServiceTax', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},
    {key: 13, label: "Total", field: 'Total', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},
    {key: 14, label: "Margin (%)", field: 'Margin', width: 75, align: "center", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 15, label: "Quote", field: 'QuoteCost', width: 70, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},
    {key: 16, label: "Forex", field: 'Forex', width: 55, align: "right", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 2, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true, summary: {summaryType:"sum", alignment: "right", valueFormat: '#,##0'}},

    {key: 31, label: "CarMode", field: 'CarMode', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},
    {key: 32, label: "NewDriveLine", field: 'NewDriveLine', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},
    {key: 33, label: "TrsType", field: 'TrsType', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3},
    {key: 34, label: "ExchRate", field: 'ExchRate', width: 70, align: "right", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    {key: 35, label: "", field: 'CarColor', width: 30, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 3, isDbField: false},        
    {key: 36, label: "OwnArrangements", field: 'OwnArrangements', width: 100, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 3, booleanText: ['Yes','No'], required: false, default: false},

    
  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

