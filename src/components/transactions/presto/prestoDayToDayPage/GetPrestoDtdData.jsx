import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme-react/text-area';

import {getDevExtremeStandardTable} from "../../../common/HelperComponents";

export const tableHeaderArray = 
  [ 
    {key: 1, label: "ID", field: 'TmpActivities_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 2, label: "Quotations_id", field: 'quotations_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 3, label: "QuoCities_id", field: 'quoCities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 4, label: "QuoAccommodation_id", field: 'quoAccommodation_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 5, label: "QuoServices_id", field: 'quoServices_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 6, label: "QuoTickets_id", field: 'quoTickets_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 11, label: "Date", field: 'activityDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},
    {key: 12, label: "Time", field: 'activityTime', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'HH:mm'}, required: true},
    {key: 13, label: "Time End", field: 'activityTimeEnd', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'HH:mm'}, required: true},
    {key: 14, label: "Group Report", field: 'groupReportDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'HH:mm'}, required: true},
    {key: 15, label: "Group Release", field: 'groupReleaseDate', width: 110, align: "center", dataType: 'date', visible: false, visibleInForm: false, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'HH:mm'}, required: true},

    {key: 21, label: "ActivityType", field: 'activityType', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 22, label: "ActivitySubtype", field: 'activitySubtype', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 23, label: "Description", field: 'Description', width: 140, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:300, readOnly: false}, required: true},    
    {key: 24, label: "Comments", field: 'comments', width: 140, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:300, readOnly: false}, required: true},    
    {key: 25, label: "Services Comments", field: 'servicesComments', width: 140, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:300, readOnly: false}, required: true},    
    {key: 26, label: "Voucher Description", field: 'VoucherDescription', width: 140, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:300, readOnly: false}, required: true},    
    
    {key: 31, label: "OrderNo", field: 'OrderNo', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 32, label: "SubOrderNo", field: 'SubOrderNo', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 33, label: "GroupNo", field: 'GroupNo', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 34, label: "GroupCarIndex", field: 'GroupCarIndex', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 41, label: "Cities_id", field: 'cities_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 42, label: "City", field: 'City', width: 140, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 1, colSpan: 2, editorOptions: {maxLength:100, readOnly: false}, required: true},    

    {key: 51, label: "CarCoverage1", field: 'carCoverage1', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 52, label: "CarCoverage2", field: 'carCoverage2', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
    
    {key: 61, label: "Overnight", field: 'overnight', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 62, label: "Own Arrangements", field: 'ownArrangements', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 63, label: "Back Linked", field: 'backLinked', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, default: true, allowFilter: true, booleanText: ['Yes','No']},
    {key: 64, label: "No Accommodation", field: 'noAccommodation', width: 60, align: "center", dataType: 'boolean', visible: false, visibleInForm: true, isLookup: false, groupNo: 4, default: true, allowFilter: true, booleanText: ['Yes','No']},
      
  ];


export function getDevExtremeTable(dataObj, superuser) {

  // standard table form most grid listings ...
  // ... for variants copy the code from getDevExtremeStandardTable, and modify
  return getDevExtremeStandardTable (tableHeaderArray, dataObj, superuser);

}

