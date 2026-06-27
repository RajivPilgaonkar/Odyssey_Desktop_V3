import {getDevExtremeStandardTable} from "../../../common/HelperComponents";

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Masters_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 3, label: "Tour Code", field: 'MasterCode', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {maxLength:10}},    
    {key: 4, label: "Departure Date", field: 'MasterDepDate', width: 120, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 5, label: "Pax", field: 'PaxName', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:10}},    

    {key: 10, label: "Num Pax", field: 'PaxOnTour', width: 100, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:20}},    
    {key: 11, label: "Pax", field: 'NumPax', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},
    {key: 12, label: "Cancelled", field: 'NumCancelled', width: 80, align: "center", dataType: 'number', visible: false, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},

    //{key: 21, label: "Vouchers", field: 'NumVoucherStr', width: 130, align: "center", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:30}},    
    {key: 22, label: "Vouchers", field: 'NumVouchers', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 23, label: "Manual", field: 'NumManualVouchers', width: 80, align: "center", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}, showZeroAsBlanks: true},
    {key: 24, label: "Mails Sent?", field: 'SendMail', width: 110, align: "center", dataType: 'boolean', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, allowFilter: false, booleanText: ['Yes','No']},

    {key: 31, label: "Created By", field: 'UserName', width: 90, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:10}},    
    {key: 32, label: "AdmUsers_id", field: 'AdmUsers_id', width: 60, align: "center", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {format: '#,##0'}},
    
  ];


export function getDevExtremeTable(dataObj) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, false);

}


