import { dbExecuteSp, dbGetRecord, dbGetRecordRaw } from '../../../../../actions';
import { getLastOfMonth, convert_Date_to_DD_MMM } from "../../../../common/CommonTransactionFunctions";


// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 1;
const defaultFont = { name: 'Book Antiqua', size: 10};
const backgroundAlternatingColors = ['FFFFCC','CCFFCC'];
let g_invMonth = 0;
let g_invYear = 0;
let g_companies_id = 0;
let g_divisions_id = 0;
let g_offices_id = 0;
let g_agents_id = -1;
let g_endDate = new Date('01/01/2020');
let g_endDateStr = '';
let g_endDateMonYear = '';
let g_currency = '';

//**********************************************************/
export async function exportDeptReport(reportObj, invData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 44}, {col: 'B', colIndex: 1, width: 12},
    {col: 'C', colIndex: 2, width: 12}, {col: 'D', colIndex: 3, width: 11}, {col: 'E', colIndex: 4, width: 10},
    {col: 'F', colIndex: 5, width: 14}, {col: 'G', colIndex: 6, width: 14}, {col: 'H', colIndex: 7, width: 10},
    {col: 'I', colIndex: 8, width: 13}, {col: 'J', colIndex: 9, width: 10}, {col: 'K', colIndex: 10, width: 15},
    {col: 'L', colIndex: 11, width: 15}, {col: 'M', colIndex: 12, width: 15}
  ];

  rowNum = 1;

  const whereStr = "invoices_id = " + invData[0].Invoices_id.toString();
  const invYearMonthData = await dbGetRecord({fields: ["Addressbook_id, Month(InvoiceDate) AS Month, Year(InvoiceDate) AS Year,Companies_id, Divisions_id, Offices_id"], orders: ['Companies_id'], table: 'Invoices', where: whereStr});

  // get params related to the invoice
  g_invMonth = invYearMonthData[0].Month;
  g_invYear = invYearMonthData[0].Year;
  g_companies_id = invYearMonthData[0].Companies_id;
  g_divisions_id = invYearMonthData[0].Divisions_id;
  g_offices_id = invYearMonthData[0].Offices_id;
  g_agents_id = invYearMonthData[0].Addressbook_id;

  const invDate = new Date(g_invYear, g_invMonth-1, 1);
  g_endDate = getLastOfMonth (invDate, 0);
  g_endDateStr = convert_Date_to_DD_MMM(g_endDate,1);
  g_endDateMonYear = convert_Date_to_DD_MMM(g_endDate,2);
  
  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
    worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
  }      

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInvDeptSummary] " + 
    g_agents_id.toString() + "," + g_invMonth.toString() + "," +
    g_invYear.toString() + "," + g_companies_id.toString() + "," +
    g_divisions_id.toString() + "," + g_offices_id.toString() + ", 2";

  spData = {sql: sql};
  const invBreakupData = await dbExecuteSp(spData);

  for (let i=0; i<invData.length; i++) {

    const whereStr = "invoices_id = " + invData[i].Invoices_id.toString() + " " + 
      "AND LTRIM(RTRIM(COALESCE(PlaceOfSupplyLine,''))) > '' AND amount IS NOT NULL AND amount <> 0.0";
    const invDetails = await dbGetRecord({fields: ["DISTINCT PlaceOfSupplyLine"], table: 'invoicedetails', where: whereStr});

    for (let k=0; k<invDetails.length; k++) {
      
      const placeOfSupply = invDetails[k].PlaceOfSupplyLine;
      const invSuffixObj = invBreakupData.filter(rec => rec.InvoiceNo === invData[i].InvoiceNo && rec.PlaceOfSupply === placeOfSupply);
      const invSuffix = invSuffixObj[0].InvoiceSuffix;

      const startRowNum = rowNum;    
      await deptHeader(invData[i], worksheet, invDetails[k].PlaceOfSupplyLine, invSuffix);
      await deptPaxNames(invData[i], worksheet);
      await deptDetails(invData[i], worksheet, invDetails[k].PlaceOfSupplyLine);
      const endRowNum = rowNum;
  
      let color = (i%2 === 0) ? backgroundAlternatingColors[0] : backgroundAlternatingColors[1];
  
      /*=== Color cells ====*/  
      for (let j=0; j<columnWidths.length-2; j++) {
        for (let k=startRowNum; k<=endRowNum; k++) {
          const cell = worksheet.getCell(columnWidths[j].col + k.toString());
          cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: color }};
        }
      }      
  
    }
  }

  rowNum += 2;

  await deptSummaryHeader(worksheet);
  await deptSummaryDetails(worksheet);
  ////await deptPaymentInstructions(worksheet);
  await clientPaymentInstructions2(worksheet, invData);

}

//**********************************************************/
async function deptHeader(invData, worksheet, placeOfSupply, invoiceSuffix) {

  const fields = [
    {id: 'companyName', col: 'B', row: 1, caption: '', alignment: 'center', field: 'name', fontSize: 20},
    {id: 'divName', col: 'B', row: 2, caption: '', alignment: 'center', field: 'DivName', fontSize: 14, italics: true},
    {id: 'companyAddress', col: 'B', row: 3, caption: '', alignment: 'center', field: 'CompanyAddress'},
    {id: 'phoneEmail', col: 'B', row: 4, caption: '', alignment: 'center', field: 'PhoneEmail'},
    {id: 'pan', col: 'A', row: 6, caption: 'Pan No: ', alignment: '', field: 'pan'},
    {id: 'llpin', col: 'A', row: 7, caption: 'LLPIN No: ', alignment: '', field: 'Llpin'},
    {id: 'gstin', col: 'A', row: 8, caption: 'GSTIN: ', alignment: '', field: 'Gstin'},

    {id: 'gstin_rec', col: 'E', row: 6, caption: 'GSTIN Recipient: ', alignment: '', field: ''},
    {id: 'placeSupply', col: 'E', row: 7, caption: 'Place Of Supply: ', alignment: '', field: 'PlaceOfSupply'},
    {id: 'stateName', col: 'E', row: 8, caption: 'Name of State: ', alignment: '', field: 'SupplyState'},
    {id: 'taxRCM', col: 'E', row: 9, caption: 'If Tax Payable under RCM: ', alignment: '', field: 'TaxPayableRcm'},

    {id: 'agentName', col: 'A', row: 11, caption: '', alignment: '', field: 'organisation'},
    {id: 'agentAddress', col: 'A', row: 12, caption: '', alignment: '', field: 'ClientAddress'},

    {id: 'taxInvoice', col: 'A', row: 15, caption: 'TAX INVOICE', alignment: '', field: '', bold: true, fontSize: 12},

    {id: 'invDate', col: 'A', row: 17, caption: 'Invoice Date', alignment: '', field: '', bold: true},
    {id: 'invNo', col: 'A', row: 18, caption: 'Invoice No', alignment: '', field: '', bold: true},
    {id: 'tourDate', col: 'A', row: 19, caption: 'Tour Date', alignment: '', field: '', bold: true},
    {id: 'tourCode', col: 'A', row: 20, caption: 'Tour Code', alignment: '', field: '', bold: true},

    {id: 'invDate', col: 'B', row: 17, caption: '', alignment: '', field: 'invoicedate', dateformat: 'DD/MM/YYYY'},
    {id: 'invNo', col: 'B', row: 18, caption: '', alignment: '', field: 'invoiceno', combination: ['YearRef','InvoiceNo'],combinationAppend: 'InvoiceSuffix'},
    {id: 'tourDate', col: 'B', row: 19, caption: '', alignment: '', field: 'MasterDepartureDate', dateformat: 'DD/MM/YYYY'},
    {id: 'tourCode', col: 'B', row: 20, caption: '', alignment: '', field: 'MasterCode'},

    {id: 'inv', col: 'E', row: 20, caption: 'Invoice', alignment: '', field: '', bold: true, fontSize: 12},

    {id: 'sac', col: 'D', row: 23, caption: 'Sac Code', alignment: 'center', field: '', bold: true},
    {id: 'netPrice', col: 'E', row: 23, caption: 'Unit Price', alignment: 'right', field: '', bold: true},
    {id: 'qty', col: 'F', row: 23, caption: 'Qty', alignment: 'right', field: '', bold: true},
    {id: 'amount', col: 'G', row: 23, caption: 'Amount', alignment: 'right', field: '', bold: true},
    {id: 'gst', col: 'H', row: 23, caption: 'GST', alignment: 'right', field: '', bold: true},
    {id: 'amountAfterTax', col: 'I', row: 23, caption: 'Amt After Tax', alignment: 'right', field: '', bold: true},
    {id: 'cancel', col: 'J', row: 23, caption: 'Cancel(%)', alignment: 'right', field: '', bold: true},
    {id: 'placeSupply', col: 'K', row: 23, caption: 'Place of Supply', alignment: 'center', field: '', bold: true},

  ];

  const rowHeights = [{row: 12, height: 41}];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInv] " + 
    invData.Invoices_id.toString() + ", 1";

  spData = {sql: sql};
  const invHeaderData = await dbExecuteSp(spData);

  // Print all Header fields
  printHeaderFields(fields, invHeaderData, worksheet);

  // Special Fields (Invoice as a combination of 2 fields)
  let obj = fields.find(o => o.id === 'placeSupply');
  let cell = worksheet.getCell('E' + (rowNum + obj.row).toString());
  cell.value = 'Place of Supply: ' + placeOfSupply;

  // Special Fields (Invoice as a combination of 2 fields)
  obj = fields.find(o => o.id === 'invNo');
  cell = worksheet.getCell('B' + (rowNum + obj.row).toString());
  cell.value = invHeaderData[0].yearref.toString() + '/' + invHeaderData[0].invoiceno + invoiceSuffix;

  // Set Row Heights
  for (let i=0; i<rowHeights.length; i++) {
    const row = worksheet.getRow(rowHeights[i].row+rowNum);
    row.height = rowHeights[i].height;  
    row.alignment = {...row.alignment, wrapText: true}
  }

  // set Lower Border
  const cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K'];
  const rowBorder = fields[fields.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

}

//**********************************************************/
async function deptPaxNames(invData, worksheet) {

  const fields = [
    {id: 'reference', col: 'A', row: 25, caption: '', alignment: '', field: 'Reference', bold: true}
  ];

  const columns = [
    {id: 'name', col: 'A', title: '', alignment: '', field: 'Name'}
  ];


  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInv] " + 
    invData.Invoices_id.toString() + ", 2";

  spData = {sql: sql};
  const invHeaderData = await dbExecuteSp(spData);

  // Print all Header fields
  printHeaderFields(fields, invHeaderData, worksheet);

  let row = fields[fields.length-1].row + rowNum + 1;
  for (var i=0; i<invHeaderData.length; i++) {
    for (var j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + row.toString());
      cell.value = invHeaderData[i][columns[j].field];
    }
    row++;
  }

  rowNum = row + 1;
}


//**********************************************************/
async function deptDetails(invData, worksheet, placeOfSupply) {

  const fields = [
    {id: 'bookElement', col: 'A', row: 1, caption: 'Book Element', alignment: '', field: '', bold: true},
    {id: 'startDate', col: 'B', row: 1, caption: 'Start Date', alignment: '', field: '', bold: true},
    {id: 'endDate', col: 'C', row: 1, caption: 'End Date', alignment: '', field: '', bold: true},
  ];

  const columns = [
    {id: 'details', col: 'A', title: '', alignment: '', field: 'details'},
    {id: 'dateIn', col: 'B', title: '', alignment: '', field: 'DateIn', dateformat: 'DD/MM/YYYY'},
    {id: 'dateOut', col: 'C', title: '', alignment: '', field: 'DateOut', dateformat: 'DD/MM/YYYY'},
    {id: 'sac', col: 'D', title: '', alignment: '', field: 'SacCode'},
    {id: 'unitprice', col: 'E', title: '', alignment: 'right', field: 'unitprice', numformat: '#,##0.00'},
    {id: 'quantity', col: 'F', title: '', alignment: 'right', field: 'quantity', numformat: '#,##0'},
    {id: 'amount', col: 'G', title: '', alignment: 'right', field: 'amount', numformat: '#,##0.00'},
    {id: 'gst', col: 'H', title: '', alignment: 'right', field: 'ServiceTax', numformat: '#,##0.00'},
    {id: 'amtAfterTax', col: 'I', title: '', alignment: 'right', field: 'AmtAfterTax', numformat: '#,##0.00'},
    {id: 'cancelPerc', col: 'J', title: '', alignment: 'right', field: 'CancelPerc', numformat: '#,##0.00', printIfZero: false},
    {id: 'placeSupply', col: 'K', title: '', alignment: '', field: 'PlaceOfSupplyLine'},
  ];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInvDept] " + 
    invData.Invoices_id.toString() + ", '" + placeOfSupply + "', 3";

  spData = {sql: sql};
  let invDetailsData = await dbExecuteSp(spData);
  //invDetailsData = invDetailsData.filter(rec => rec.PlaceOfSupplyLine === placeOfSupply);

  // Print all Header fields
  printHeaderFields(fields, invDetailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C'];
  let rowBorder = fields[fields.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'}, top: {style: 'thin'} };      
    if (cellsForBorder[i] === 'C') {
      cell.border = {...cell.border, right: {style: 'thin'} };      
    }
  }


  let gstTotal = 0;
  let c_gstTotal = 0;
  let s_gstTotal = 0;
  let i_gstTotal = 0;
  let itemTotal = 0;
  let invTotal = 0;
  let invTotal_INR = 0;
  let exchRate = 1;
  let currency = '';

  let row = rowBorder + 1;
  for (var i=0; i<invDetailsData.length; i++) {
    for (var j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + row.toString());

      if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((invDetailsData[i][columns[j].field] !== null) && (invDetailsData[i][columns[j].field] > 0))) {
        cell.value = invDetailsData[i][columns[j].field];
      }
      cell.font = defaultFont;
      if (columns[j].bold !== undefined && columns[j].bold) {
        cell.font = {...defaultFont, bold: true};
      }
      if (columns[j].italics !== undefined && columns[j].italics) {
        cell.font = {...cell.font, italic: true};
      }  
      if (columns[j].fontSize !== undefined) {
        cell.font = {...cell.font, size: columns[j].fontSize};
      }
      if (columns[j].alignment > '') {
        cell.alignment = { horizontal: columns[j].alignment };      
      }
      if (columns[j].dateformat !== undefined && invDetailsData[i][columns[j].field] !== null) {
        cell.value = moment(invDetailsData[i][columns[j].field]).format(columns[j].dateformat);
      }    
      if (columns[j].numformat !== undefined) {
        cell.numFmt = columns[j].numformat;      
      }    

    }

    if (i===0) {
      itemTotal = invDetailsData[i]['TotalItemAmount'];
      gstTotal = invDetailsData[i]['taxamount'];
      invTotal = invDetailsData[i]['TotalInvoiceAmount'];
      currency = invDetailsData[i]['currencycode'];

      c_gstTotal = invDetailsData[i]['C_Gst'];
      s_gstTotal = invDetailsData[i]['S_Gst'];
      i_gstTotal = invDetailsData[i]['I_Gst'];

      exchRate = invDetailsData[i]['ExchRate'];

      invTotal_INR = invTotal * exchRate;

    }

    row++;
  }

  // set Lower Border
  cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K'];
  rowBorder = row;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

  // Total 
  row += 1; 
  let cell = worksheet.getCell('A' + row.toString());
  cell.value = 'Sub-Total';

  cell = worksheet.getCell('G' + row.toString());
  cell.value = itemTotal;
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('H' + row.toString());
  cell.value = gstTotal;
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('I' + row.toString());
  cell.value = invTotal;
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  row++;

  // C GST
  cell = worksheet.getCell('B' + row.toString());
  //cell.value = 'C GST';
  cell.value = invDetailsData[0]['C_Gst_Str'];
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('C' + row.toString());
  cell.value = c_gstTotal;
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  row++;

  // S GST
  cell = worksheet.getCell('B' + row.toString());
  //cell.value = 'S GST';
  cell.value = invDetailsData[0]['S_Gst_Str'];
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('C' + row.toString());
  cell.value = s_gstTotal;
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  row++;

  // I GST
  cell = worksheet.getCell('B' + row.toString());
  //cell.value = 'I GST';
  cell.value = invDetailsData[0]['I_Gst_Str'];
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('C' + row.toString());
  cell.value = i_gstTotal;
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  row++;

  cell = worksheet.getCell('A' + row.toString());
  cell.value = 'Grand Total';
  cell.font = {...defaultFont, bold: true};

  cell = worksheet.getCell('H' + row.toString());
  cell.value = currency;
  cell.font = {...defaultFont, bold: true};
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('I' + row.toString());
  cell.value = invTotal;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  if (currency !== 'INR') {

    row += 2;

    cell = worksheet.getCell('F' + row.toString());
    cell.value = 'Exch Rate';
  
    cell = worksheet.getCell('G' + row.toString());
    cell.value = exchRate;
    cell.numFmt = '#,##0.00';      
    cell.alignment = { horizontal: 'right' };      
  
    cell = worksheet.getCell('H' + row.toString());
    cell.value = 'INR';
    cell.alignment = { horizontal: 'right' };      
    cell.font = {...defaultFont, bold: true};
  
    cell = worksheet.getCell('I' + row.toString());
    cell.value = invTotal_INR;
    cell.numFmt = '#,##0.00';      
    cell.alignment = { horizontal: 'right' };      
    cell.font = {...defaultFont, bold: true};
  
  }

  rowNum = row + 3;
}

//**********************************************************/
async function deptSummaryHeader(worksheet) {

  const fields = [
    {id: 'companyName', col: 'B', row: 1, caption: '', alignment: 'center', field: 'name'},
    {id: 'divName', col: 'B', row: 2, caption: '', alignment: 'center', field: 'DivName'},
    {id: 'companyAddress', col: 'B', row: 3, caption: '', alignment: 'center', field: 'CompanyAddress'},
    {id: 'pan', col: 'A', row: 5, caption: 'Pan No: ', alignment: '', field: 'pan'},
    {id: 'cin', col: 'A', row: 6, caption: 'Cin No: ', alignment: '', field: 'CinNo'},
    {id: 'gstin', col: 'A', row: 7, caption: 'GSTIN: ', alignment: '', field: 'Gstin'},

    {id: 'invDate', col: 'A', row: 8, caption: 'Invoice Date', alignment: '', field: ''},
    {id: 'sentTo', col: 'A', row: 9, caption: 'Sent To', alignment: '', field: ''},
    {id: 'clientsGroups', col: 'A', row: 12, caption: 'Clients / Groups', alignment: '', field: ''},
    {id: 'outstandingInvoices', col: 'A', row: 15, caption: 'Outstanding invoices as of ', alignment: '', field: '', bold: true},

    {id: 'organisation', col: 'B', row: 9, caption: '', alignment: '', field: 'organisation'},
    {id: 'clientAddress', col: 'B', row: 10, caption: '', alignment: '', field: 'ClientAddress'},

    {id: 'namePax', col: 'A', row: 18, caption: 'Name of the pax', alignment: '', field: '', bold: true},
    {id: 'invNo', col: 'B', row: 18, caption: 'Invoice No', alignment: 'center', field: '', bold: true},
    {id: 'bookingNo', col: 'C', row: 18, caption: 'Booking No', alignment: 'center', field: '', bold: true},
    {id: 'tourCode', col: 'D', row: 18, caption: 'Tour Code', alignment: 'center', field: '', bold: true},
    {id: 'pax', col: 'E', row: 18, caption: 'Pax', alignment: 'center', field: '', bold: true},
    {id: 'arrivalDate', col: 'F', row: 18, caption: 'Arrival Date', alignment: 'center', field: '', bold: true},
    {id: 'amtPerPax', col: 'G', row: 18, caption: 'Amt Per Pax', alignment: 'right', field: '', bold: true},
    {id: 'total', col: 'H', row: 18, caption: 'Total', alignment: 'right', field: '', bold: true},

    {id: 'gst', col: 'I', row: 18, caption: 'GST', alignment: 'right', field: '', bold: true},
    {id: 'i_gst', col: 'J', row: 18, caption: 'I_Gst', alignment: 'right', field: '', bold: true},
    {id: 'c_gst', col: 'K', row: 18, caption: 'C_Gst', alignment: 'right', field: '', bold: true},
    {id: 's_gst', col: 'L', row: 18, caption: 'S_Gst', alignment: 'right', field: '', bold: true},
    {id: 'placeSupply', col: 'M', row: 18, caption: 'Place Of Supply', alignment: 'right', field: '', bold: true},

  ];

  const rowHeights = [{row: 3, height: 54}, {row: 10, height: 68}];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInvSummary] " + 
    g_agents_id.toString() + "," + g_invMonth.toString() + "," +
    g_invYear.toString() + "," + g_companies_id.toString() + "," +
    g_divisions_id.toString() + "," + g_offices_id.toString() + ", 1";

  spData = {sql: sql};
  const invHeaderData = await dbExecuteSp(spData);

  // Currency
  g_currency = invHeaderData[0]['currencyCode'];

  // Print all Header fields
  printHeaderFields(fields, invHeaderData, worksheet);

  // Set Row Heights
  for (let i=0; i<rowHeights.length; i++) {
    const row = worksheet.getRow(rowHeights[i].row+rowNum);
    row.height = rowHeights[i].height;  
    row.alignment = {...row.alignment, wrapText: true}
  }

  // Special Fields
  let obj = fields.find(o => o.id === 'invDate');
  let cell = worksheet.getCell('B' + (rowNum + obj.row).toString());
  cell.value = g_endDateStr;

  obj = fields.find(o => o.id === 'clientsGroups');
  cell = worksheet.getCell('B' + (rowNum + obj.row).toString());
  cell.value = g_endDateMonYear;

  obj = fields.find(o => o.id === 'outstandingInvoices');
  cell = worksheet.getCell('A' + (rowNum + obj.row).toString());
  cell.value += g_endDateStr;

  // set Lower Border
  const cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
  const rowBorder = fields[fields.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'}, top: {style: 'thin'} };      
  }

  rowNum = rowBorder + 2;

}

//**********************************************************/
function nextChar(c) {
  let i = (parseInt(c, 36) + 1 ) % 36;
  return (!i * 10 + i).toString(36);
}

//**********************************************************/
async function deptSummaryDetails(worksheet) {

  const columns = [
    {id: 'namePax', col: 'A', row: 18, caption: '', alignment: '', field: 'PaxName'},
    {id: 'invNo', col: 'B', row: 18, caption: '', alignment: 'center', field: 'InvoiceNo',combination: ['YearRef','InvoiceNo'],combinationAppend: 'InvoiceSuffix'},
    {id: 'bookingNo', col: 'C', row: 18, caption: '', alignment: 'center', field: 'Reference'},
    {id: 'tourCode', col: 'D', row: 18, caption: '', alignment: 'center', field: 'MasterCode'},
    {id: 'pax', col: 'E', row: 18, caption: '', alignment: 'center', field: 'NumPax'},
    {id: 'arrivalDate', col: 'F', row: 18, caption: '', alignment: 'center', field: 'ArrivalDate', dateformat: 'DD/MM/YYYY'},
    {id: 'amtPerPax', col: 'G', row: 18, caption: '', alignment: 'right', field: '', formula: 'H#/E#', numformat: '#,##0.00'},
    {id: 'total', col: 'H', row: 18, caption: '', alignment: 'right', field: 'InvoiceAmount', numformat: '#,##0.00'},
    {id: 'gst', col: 'I', row: 18, caption: '', alignment: 'right', field: 'TaxAmount', numformat: '#,##0.00'},
    {id: 'i_gst', col: 'J', row: 18, caption: '', alignment: 'right', field: 'I_Gst', numformat: '#,##0.00'},
    {id: 'c_gst', col: 'K', row: 18, caption: '', alignment: 'right', field: 'C_Gst', numformat: '#,##0.00'},
    {id: 's_gst', col: 'L', row: 18, caption: '', alignment: 'right', field: 'S_Gst', numformat: '#,##0.00'},
    {id: 'placeSupply', col: 'M', row: 18, caption: '', alignment: '', field: 'PlaceOfSupply'},
  ];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInvDeptSummary] " + 
    g_agents_id.toString() + "," + g_invMonth.toString() + "," +
    g_invYear.toString() + "," + g_companies_id.toString() + "," +
    g_divisions_id.toString() + "," + g_offices_id.toString() + ", 2";

  spData = {sql: sql};
  const invDetailsData = await dbExecuteSp(spData);

  let prevInvoiceNo = -1;

  // Add to this, breakup into I_GST, C_GST, S_GST
  for (let i=0; i<invDetailsData.length; i++) {
    const invoiceNo = invDetailsData[i].InvoiceNo;
    const invoiceDate = invDetailsData[i].InvoiceDate;
    const placeOfSupply = invDetailsData[i].PlaceOfSupply;
    const home = invDetailsData[i].Home;

    let tableStr = 'invoices i LEFT JOIN invoicedetails id1 ON i.invoices_id = id1.invoices_id'
    let whereStr = "i.invoiceNo = " + invoiceNo.toString() + " " +
      "AND i.InvoiceDate = '" + moment(invoiceDate).format('MM/DD/YYYY') + "' " +
      "AND id1.PlaceOfSupplyLine = '" + placeOfSupply + "'";
    const gstDataObj = await dbGetRecord({fields: ["SUM(id1.ServiceTax) AS gst"], table: tableStr, where: whereStr});

    tableStr = 'invoices i';
    whereStr = "i.invoiceNo = " + invoiceNo.toString() + " " +
      "AND i.InvoiceDate = '" + moment(invoiceDate).format('MM/DD/YYYY') + "' ";
    const gstTotalsObj = await dbGetRecord({fields: ["I_Gst, C_Gst, S_Gst, I_Gst_Perc, C_Gst_Perc, S_Gst_Perc"], table: tableStr, where: whereStr});

    let i_gst = 0, c_gst = 0, s_gst = 0;
    i_gst = gstDataObj[0].gst * (gstTotalsObj[0].I_Gst_Perc)/(gstTotalsObj[0].I_Gst_Perc+gstTotalsObj[0].C_Gst_Perc+gstTotalsObj[0].S_Gst_Perc);
    c_gst = gstDataObj[0].gst * (gstTotalsObj[0].C_Gst_Perc)/(gstTotalsObj[0].I_Gst_Perc+gstTotalsObj[0].C_Gst_Perc+gstTotalsObj[0].S_Gst_Perc);
    s_gst = gstDataObj[0].gst * (gstTotalsObj[0].S_Gst_Perc)/(gstTotalsObj[0].I_Gst_Perc+gstTotalsObj[0].C_Gst_Perc+gstTotalsObj[0].S_Gst_Perc);

    invDetailsData[i].I_Gst = i_gst;
    invDetailsData[i].C_Gst = c_gst;
    invDetailsData[i].S_Gst = s_gst;

    if (home && i_gst > 0) {
      invDetailsData[i].I_Gst = 0;
      invDetailsData[i].C_Gst = invDetailsData[i].C_Gst + i_gst/2.0;
      invDetailsData[i].S_Gst = invDetailsData[i].S_Gst + i_gst/2.0;
    }

  }

  let invTotal = 0;
  let gstTotal = 0;

  let row = rowNum;
  for (var i=0; i<invDetailsData.length; i++) {

    const invoiceNo = invDetailsData[i].InvoiceNo;
    const invoiceDate = invDetailsData[i].InvoiceDate;

    if (prevInvoiceNo !== invoiceNo) {
      row++;
      let lastCol = columns[columns.length-1].col;
      /*=== move to columns to the right ===*/
      lastCol = nextChar(lastCol);
      lastCol = nextChar(lastCol).toUpperCase();
      let nextCol = nextChar(lastCol).toUpperCase();

      const currInvArr = invDetailsData.filter(rec => rec.InvoiceNo === invoiceNo);
      const invCount = currInvArr.length;

      const query = "SELECT ExchangeRate FROM Invoices WHERE InvoiceNo = " + invoiceNo.toString() + 
        " AND InvoiceDate = '" + moment(invoiceDate).format('MM/DD/YYYY') + "'";

      const invObj = await dbGetRecordRaw({query: query});
      const exchRate = (invObj.length > 0 && invObj[0].ExchangeRate !== null) ? invObj[0].ExchangeRate : 1.0;

      let cellToHighlight = worksheet.getCell(lastCol + row.toString());
      cellToHighlight.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FFFFCC' }};
      let formula = '=SUM(H' + (row+1).toString() + ':H' + (row+invCount).toString() + ')';
      cellToHighlight.value = {formula: formula};
      cellToHighlight.numFmt = '#,##0.00';      
      cellToHighlight.alignment = { horizontal: 'right' }
      cellToHighlight.font = defaultFont;

      for (let invLine=0; invLine<invCount; invLine++) {
        formula = '=ROUND(($H$'+ (row+1+invLine).toString() + 
          '/SUM($H$' + (row+1).toString() + ':$H' + (row+1+invCount) + ')) ' +
          ' * $' + lastCol + '$' + row.toString() + 
          ' * ' + exchRate.toString() + ',0)';
        const cellToUpdate = worksheet.getCell(lastCol + (row+1+invLine).toString());
        cellToUpdate.value = {formula: formula};
        cellToUpdate.numFmt = '#,##0.00';      
        cellToUpdate.alignment = { horizontal: 'right' }  
        cellToUpdate.font = defaultFont;
      }

      cellToHighlight = worksheet.getCell(nextCol + row.toString());
      cellToHighlight.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FFFFCC' }};

      cellToHighlight.value = exchRate;
      cellToHighlight.numFmt = '#,##0.00';      
      cellToHighlight.alignment = { horizontal: 'right' }
      cellToHighlight.font = defaultFont;

      for (let invLine=0; invLine<invCount; invLine++) {
        formula = '=ROUND(($H$'+ (row+1+invLine).toString() + 
          '/SUM($H$' + (row+1).toString() + ':$H' + (row+1+invCount) + ')) ' +
          ' * $' + lastCol + '$' + row.toString() + 
          ' * ($' + nextCol + '$' + row.toString() + ' - ' + exchRate.toString() + '),0)';
        const cellToUpdate = worksheet.getCell(nextCol + (row+1+invLine).toString());
        cellToUpdate.value = {formula: formula}
        cellToUpdate.numFmt = '#,##0.00';      
        cellToUpdate.alignment = { horizontal: 'right' }  
        cellToUpdate.font = defaultFont;
      }

      row++;

    }

    for (var j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + row.toString());

      if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((invDetailsData[i][columns[j].field] !== null) && (invDetailsData[i][columns[j].field] > 0))) {
        cell.value = invDetailsData[i][columns[j].field];
      }
      cell.font = defaultFont;
      if (columns[j].bold !== undefined && columns[j].bold) {
        cell.font = {...defaultFont, bold: true};
      }
      if (columns[j].italics !== undefined && columns[j].italics) {
        cell.font = {...cell.font, italic: true};
      }  
      if (columns[j].fontSize !== undefined) {
        cell.font = {...cell.font, size: columns[j].fontSize};
      }
      if (columns[j].alignment > '') {
        cell.alignment = { horizontal: columns[j].alignment };      
      }
      if (columns[j].formula !== undefined) {
        let formula = columns[j].formula;
        formula = formula.replace(/#/g,row.toString());
        cell.value = {formula: formula}
      }    
      if (columns[j].dateformat !== undefined) {
        cell.value = moment(invDetailsData[i][columns[j].field]).format(columns[j].dateformat);
      }    
      if (columns[j].numformat !== undefined) {
        cell.numFmt = columns[j].numformat;      
      }    
      if (columns[j].combination !== undefined) {
        let value = '';
        for (let m=0; m<columns[j].combination.length; m++) {
          if (value > '') {
            value += '/';
          }
          value += invDetailsData[i][columns[j].combination[m]];
        }
        cell.value = value;
      }
      if (columns[j].combinationAppend !== undefined) {
        cell.value += invDetailsData[i][columns[j].combinationAppend];
      }
    }

    invTotal += invDetailsData[i]['InvoiceAmount'];
    gstTotal += invDetailsData[i]['TaxAmount'];

    prevInvoiceNo = invoiceNo;    

    row++;
  }

  // set Lower Border
  const cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
  const rowBorder = row;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

  // Total 
  row += 1; 
  let cell = worksheet.getCell('B' + row.toString());
  cell.value = 'Total Due';
  cell.font = {...defaultFont, bold: true};

  cell = worksheet.getCell('G' + row.toString());
  cell.value = g_currency;
  cell.font = {...defaultFont, bold: true};
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('H' + row.toString());
  cell.value = invTotal;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  cell = worksheet.getCell('I' + row.toString());
  cell.value = gstTotal;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  rowNum = row + 2;
}


//**********************************************************/
/*
async function deptPaymentInstructions(worksheet) {

  const fields = [
    {id: 'paymentTo', col: 'A', row: 1, caption: 'Please make payment to:', alignment: '', field: ''},
    {id: 'benBankName', col: 'A', row: 3, caption: 'Beneficiary Bank\'s Name:', alignment: '', field: ''},
    {id: 'benBankAddr', col: 'A', row: 4, caption: 'Beneficiary Bank\'s Branch Address:', alignment: '', field: ''},
    {id: 'benIFSC', col: 'A', row: 5, caption: 'Beneficiary Bank\'s IFSC Code:', alignment: '', field: ''},
    {id: 'benSwift', col: 'A', row: 6, caption: 'Beneficiary Bank\'s SWIFT Code:', alignment: '', field: ''},
    {id: 'benAc', col: 'A', row: 7, caption: 'Beneficiary\'s Bank A/c No:', alignment: '', field: ''},
    {id: 'benAcName', col: 'A', row: 8, caption: 'Beneficiary\'s  A/c Name / Title:', alignment: '', field: ''},

    {id: 'benBankNameFld', col: 'B', row: 3, caption: '', alignment: '', field: 'Ben_BankName'},
    {id: 'benBankAddrFld', col: 'B', row: 4, caption: '', alignment: '', field: 'Ben_BankAddr'},
    {id: 'benIFSCFld', col: 'B', row: 5, caption: '', alignment: '', field: 'Ben_BankIfsc'},
    {id: 'benSwiftFld', col: 'B', row: 6, caption: '', alignment: '', field: 'Ben_BankSwift'},
    {id: 'benAcFld', col: 'B', row: 7, caption: '', alignment: '', field: 'Ben_BankAccountNo'},
    {id: 'benAcNameFld', col: 'B', row: 8, caption: '', alignment: '', field: 'Ben_BankAccountName'},

  ];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInvSummary] " + 
    g_agents_id.toString() + "," + g_invMonth.toString() + "," +
    g_invYear.toString() + "," + g_companies_id.toString() + "," +
    g_divisions_id.toString() + "," + g_offices_id.toString() + ", 1";

  spData = {sql: sql};
  const invHeaderData = await dbExecuteSp(spData);

  // Print all Header fields
  printHeaderFields(fields, invHeaderData, worksheet);

  const rowBorder = fields[fields.length-1].row+rowNum;
  rowNum = rowBorder + 2;

}
*/

//**********************************************************/
async function printHeaderFields(fields, invHeaderData, worksheet) {

  // Print all Header fields
  for (var i=0; i<fields.length; i++) {
    let cell = worksheet.getCell(fields[i].col + (fields[i].row + rowNum).toString());
    let value = fields[i].caption;
    if (fields[i].field > '') {
      value += invHeaderData[0][fields[i].field];
    }
    cell.value = value;  
    cell.font = defaultFont;
    if (fields[i].bold !== undefined && fields[i].bold) {
      cell.font = {...defaultFont, bold: true};
    }
    if (fields[i].italics !== undefined && fields[i].italics) {
      cell.font = {...cell.font, italic: true};
    }
    if (fields[i].fontSize !== undefined) {
      cell.font = {...cell.font, size: fields[i].fontSize};
    }
    if (fields[i].alignment > '') {
      cell.alignment = { horizontal: fields[i].alignment };      
    }
    if (fields[i].dateformat !== undefined) {
      cell.value = moment(invHeaderData[0][fields[i].field]).format(fields[i].dateformat);
    }    

  }

}


//**********************************************************/
async function clientPaymentInstructions2(worksheet, invData) {

  const cols = [{col: 'A'},{col: 'B'},{col: 'D'},{col: 'F'},{col: 'H'}];

  const whereStr = "currencycode = '" + invData[0].currencycode + "'";
  const currencyData = await dbGetRecord({fields: ['BankInstructions'], table: 'currencies', where: whereStr});   

  if ((currencyData.length === 0) || (currencyData[0].BankInstructions === null)) {
    return;
  }

  rowNum += 2;
  let cell = worksheet.getCell('A' + rowNum.toString());
  cell.value = 'Please make payment to:';  
  cell.font = {...defaultFont, bold: true, size: 12};
  rowNum += 2;

  const bankInstructions = currencyData[0].BankInstructions.split('\n');

  for (let i=0; i<bankInstructions.length; i++) {
    let lineFields = bankInstructions[i].split('##');
    for (let j=0; j<lineFields.length; j++) {
      let fields = lineFields[j].split('@B@');
      if (fields.length > 0) {
        cell = worksheet.getCell(cols[j].col + rowNum.toString());
        cell.value = fields[0];  
        cell.font = defaultFont;
        if (fields.length > 1) {
          cell.font = {...defaultFont, bold: true, size: 11};
        }  
      }  
    }
    rowNum+=2;
  }
  
}
