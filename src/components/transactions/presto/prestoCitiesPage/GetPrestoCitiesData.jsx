import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';

import {getDevExtremeStandardTable} from "../../../common/HelperComponents";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'QuoCities_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    //{key: 2, label: "Day No.", field: 'DayNo', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {format: '##0'}, isDbField: false},
    {key: 3, label: "Date", field: 'DateIn', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 4, label: "City", field: 'City', width: 140, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    
    {key: 5, label: "Nights", field: 'Nights', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {format: '##0'}},  
    {key: 6, label: "FromCities_id", field: 'FromCities_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {format: '##0'}},  
    {key: 7, label: "ToCities_id", field: 'ToCities_id', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {format: '##0'}},  
    {key: 11, label: "TimeIn", field: 'TimeIn', width: 90, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {format: 'dd/MM/yyyy HH:mm'}},  
    {key: 12, label: "TimeOut", field: 'TimeOut', width: 90, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {format: 'dd/MM/yyyy HH:mm'}},  

    {key: 21, label: "ETD / ETA", field: 'MinMaxEtd', width: 90, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {maxLength:100, readOnly: false}, required: false},  
    {key: 22, label: "Report", field: 'GroupReportDate', width: 90, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'HH:mm'}, required: false},  
    {key: 23, label: "Release", field: 'GroupReleaseDate', width: 90, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'HH:mm'}, required: false},  

    {key: 24, label: "Driveable", field: 'Driveable', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No']},  
    {key: 25, label: "CarCoverage1", field: 'CarCoverage1', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No']},  
    {key: 26, label: "CarCoverage2", field: 'CarCoverage2', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No']},  

    {key: 27, label: "Group1", field: 'Group1', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1},  
    {key: 28, label: "Group2", field: 'Group2', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1},  

    {key: 31, label: "GroupOrder1", field: 'GroupOrder1', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1},  
    {key: 32, label: "GroupOrder2", field: 'GroupOrder2', width: 90, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 1},  
    {key: 33, label: "TimeTop", field: 'TimeTop', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, readOnly: false}},    
    {key: 34, label: "TimeBottom", field: 'TimeBottom', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {maxLength:5, readOnly: false}},    
    {key: 24, label: "OddTimings", field: 'OddTimings', width: 90, align: "center", dataType: 'boolean', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, booleanText: ['Yes','No']},  
    
  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

