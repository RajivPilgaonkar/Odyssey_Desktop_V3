import { dbExecuteSp, dbGetRecord } from '../../../../../actions';
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
export async function exportClientReport(reportObj, invData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 44}, {col: 'B', colIndex: 1, width: 12},
    {col: 'C', colIndex: 2, width: 12}, {col: 'D', colIndex: 3, width: 11}, {col: 'E', colIndex: 4, width: 8},
    {col: 'F', colIndex: 5, width: 11}, {col: 'G', colIndex: 6, width: 11}, {col: 'H', colIndex: 7, width: 9}];

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

  for (let i=0; i<invData.length; i++) {
    const startRowNum = rowNum;    
    await clientHeader(invData[i], worksheet);
    await clientPaxNames(invData[i], worksheet);
    await clientDetails(invData[i], worksheet);
    const endRowNum = rowNum;

    let color = (i%2 === 0) ? backgroundAlternatingColors[0] : backgroundAlternatingColors[1];

    /*=== Color cells ====*/  
    for (let j=0; j<columnWidths.length; j++) {
      for (let k=startRowNum; k<=endRowNum; k++) {
        const cell = worksheet.getCell(columnWidths[j].col + k.toString());
        cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: color }};
      }
    }      
  }

  rowNum += 2;

  await clientSummaryHeader(worksheet);
  await clientSummaryDetails(worksheet);
  //await clientPaymentInstructions(worksheet);
  await clientPaymentInstructions2(worksheet, invData);
}

//**********************************************************/
async function clientHeader(invData, worksheet) {

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
    {id: 'invNo', col: 'B', row: 18, caption: '', alignment: '', field: 'invoiceno'},
    {id: 'tourDate', col: 'B', row: 19, caption: '', alignment: '', field: 'MasterDepartureDate', dateformat: 'DD/MM/YYYY'},
    {id: 'tourCode', col: 'B', row: 20, caption: '', alignment: '', field: 'MasterCode'},

    {id: 'inv', col: 'E', row: 20, caption: 'Invoice', alignment: '', field: '', bold: true, fontSize: 12},

    {id: 'netPrice', col: 'D', row: 23, caption: 'Net Price', alignment: 'right', field: '', bold: true},
    {id: 'qty', col: 'E', row: 23, caption: 'Qty', alignment: 'right', field: '', bold: true},
    {id: 'amount', col: 'F', row: 23, caption: 'Amount', alignment: 'right', field: '', bold: true},
    {id: 'cancel', col: 'G', row: 23, caption: 'Cancel(%)', alignment: 'right', field: '', bold: true},

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
  let obj = fields.find(o => o.id === 'invNo');
  let cell = worksheet.getCell('B' + (rowNum + obj.row).toString());
  cell.value = invHeaderData[0].yearref.toString() + '/' + invHeaderData[0].invoiceno;

  // Set Row Heights
  for (let i=0; i<rowHeights.length; i++) {
    const row = worksheet.getRow(rowHeights[i].row+rowNum);
    row.height = rowHeights[i].height;  
    row.alignment = {...row.alignment, wrapText: true}
  }

  // set Lower Border
  const cellsForBorder = ['A','B','C','D','E','F','G'];
  const rowBorder = fields[fields.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

}

//**********************************************************/
async function clientPaxNames(invData, worksheet) {

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
async function clientDetails(invData, worksheet) {

  const fields = [
    {id: 'bookElement', col: 'A', row: 1, caption: 'Book Element', alignment: '', field: '', bold: true},
    {id: 'startDate', col: 'B', row: 1, caption: 'Start Date', alignment: '', field: '', bold: true},
    {id: 'endDate', col: 'C', row: 1, caption: 'End Date', alignment: '', field: '', bold: true},
  ];

  const columns = [
    {id: 'details', col: 'A', title: '', alignment: '', field: 'details'},
    {id: 'dateIn', col: 'B', title: '', alignment: '', field: 'DateIn', dateformat: 'DD/MM/YYYY'},
    {id: 'dateOut', col: 'C', title: '', alignment: '', field: 'DateOut', dateformat: 'DD/MM/YYYY'},
    {id: 'unitprice', col: 'D', title: '', alignment: '', field: 'RateAfterServTax', numformat: '#,##0.00'},
    {id: 'quantity', col: 'E', title: '', alignment: '', field: 'quantity', numformat: '#,##0'},
    {id: 'amount', col: 'F', title: '', alignment: '', field: 'AmtAfterTax', numformat: '#,##0.00'},
    {id: 'cancelPerc', col: 'G', title: '', alignment: '', field: 'CancelPerc', numformat: '#,##0.00', printIfZero: false},
  ];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInv] " + 
    invData.Invoices_id.toString() + ", 3";

  spData = {sql: sql};
  const invDetailsData = await dbExecuteSp(spData);

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


  let invTotal = 0;
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
      invTotal = invDetailsData[i]['TotalInvoiceAmount'];
      currency = invDetailsData[i]['currencycode'];
    }

    row++;
  }

  // set Lower Border
  cellsForBorder = ['A','B','C','D','E','F','G'];
  rowBorder = row;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

  // Total 
  row += 1; 
  let cell = worksheet.getCell('A' + row.toString());
  cell.value = 'Grand Total';
  cell.font = {...defaultFont, bold: true};

  cell = worksheet.getCell('E' + row.toString());
  cell.value = currency;
  cell.font = {...defaultFont, bold: true};
  cell.alignment = { horizontal: 'center' };      

  cell = worksheet.getCell('F' + row.toString());
  cell.value = invTotal;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  rowNum = row + 3;
}

//**********************************************************/
async function clientSummaryHeader(worksheet) {

  const fields = [
    {id: 'companyName', col: 'B', row: 1, caption: '', alignment: 'center', field: 'name', fontSize: 20},
    {id: 'divName', col: 'B', row: 2, caption: '', alignment: 'center', field: 'DivName', fontSize: 14, italics: true},
    {id: 'companyAddress', col: 'B', row: 3, caption: '', alignment: 'center', field: 'CompanyAddress'},
    {id: 'phoneEmail', col: 'B', row: 4, caption: '', alignment: 'center', field: 'PhoneEmail'},
    {id: 'pan', col: 'A', row: 6, caption: 'Pan No: ', alignment: '', field: 'pan'},
    {id: 'llpin', col: 'A', row: 7, caption: 'LLPIN No: ', alignment: '', field: 'Llpin'},
    {id: 'gstin', col: 'A', row: 8, caption: 'GSTIN: ', alignment: '', field: 'Gstin'},

    {id: 'invDate', col: 'A', row: 10, caption: 'Invoice Date', alignment: '', field: ''},
    {id: 'sentTo', col: 'A', row: 11, caption: 'Sent To', alignment: '', field: ''},
    {id: 'clientsGroups', col: 'A', row: 14, caption: 'Clients / Groups', alignment: '', field: ''},
    {id: 'outstandingInvoices', col: 'A', row: 16, caption: 'Outstanding invoices as of ', alignment: '', field: '', bold: true},

    {id: 'organisation', col: 'B', row: 11, caption: '', alignment: '', field: 'organisation'},
    {id: 'clientAddress', col: 'B', row: 12, caption: '', alignment: '', field: 'ClientAddress'},

    {id: 'namePax', col: 'A', row: 19, caption: 'Name of the pax', alignment: '', field: '', bold: true},
    {id: 'invNo', col: 'B', row: 19, caption: 'Invoice No', alignment: 'center', field: '', bold: true},
    {id: 'bookingNo', col: 'C', row: 19, caption: 'Booking No', alignment: 'center', field: '', bold: true},
    {id: 'tourCode', col: 'D', row: 19, caption: 'Tour Code', alignment: 'center', field: '', bold: true},
    {id: 'pax', col: 'E', row: 19, caption: 'Pax', alignment: 'center', field: '', bold: true},
    {id: 'arrivalDate', col: 'F', row: 19, caption: 'Arrival Date', alignment: 'center', field: '', bold: true},
    {id: 'amtPerPax', col: 'G', row: 19, caption: 'Amt Per Pax', alignment: 'right', field: '', bold: true},
    {id: 'total', col: 'H', row: 19, caption: 'Total', alignment: 'right', field: '', bold: true},

  ];

  const rowHeights = [{row: 12, height: 68}];

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
  const cellsForBorder = ['A','B','C','D','E','F','G','H'];
  const rowBorder = fields[fields.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'}, top: {style: 'thin'} };      
  }

  rowNum = rowBorder + 2;

}


//**********************************************************/
async function clientSummaryDetails(worksheet) {

  const columns = [
    {id: 'namePax', col: 'A', row: 19, caption: '', alignment: '', field: 'PaxName'},
    {id: 'invNo', col: 'B', row: 19, caption: '', alignment: 'center', field: 'InvoiceNo', combination: ['YearRef','InvoiceNo']},
    {id: 'bookingNo', col: 'C', row: 19, caption: '', alignment: 'center', field: 'Reference'},
    {id: 'tourCode', col: 'D', row: 19, caption: '', alignment: 'center', field: 'MasterCode'},
    {id: 'pax', col: 'E', row: 19, caption: '', alignment: 'center', field: 'NumPax'},
    {id: 'arrivalDate', col: 'F', row: 19, caption: '', alignment: 'center', field: 'ArrivalDate', dateformat: 'DD/MM/YYYY'},
    {id: 'amtPerPax', col: 'G', row: 19, caption: '', alignment: 'right', field: '', formula: 'H#/E#', numformat: '#,##0.00'},
    {id: 'total', col: 'H', row: 19, caption: 'Total', alignment: 'right', field: 'InvoiceAmount', numformat: '#,##0.00'},
  ];

  // Get Header Data  
  let spData = '';
  let sql = "EXEC [p_PrintTourGstInvSummary] " + 
    g_agents_id.toString() + "," + g_invMonth.toString() + "," +
    g_invYear.toString() + "," + g_companies_id.toString() + "," +
    g_divisions_id.toString() + "," + g_offices_id.toString() + ", 2";

  spData = {sql: sql};
  const invDetailsData = await dbExecuteSp(spData);

  let invTotal = 0;

  let row = rowNum;
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
    }

    invTotal += invDetailsData[i]['InvoiceAmount'];

    row++;
  }

  // set Lower Border
  const cellsForBorder = ['A','B','C','D','E','F','G','H'];
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

  rowNum = row + 2;
}


//**********************************************************/
/*
async function clientPaymentInstructions(worksheet) {

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
    rowNum += 2;
  }
  
}
