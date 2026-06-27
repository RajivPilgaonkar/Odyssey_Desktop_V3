
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 12};
let cancelled = false;

//**********************************************************/
export async function exportModuleQuotationReport(headerData, paxData, detailsData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 44}, {col: 'B', colIndex: 1, width: 12},
    {col: 'C', colIndex: 2, width: 12}, {col: 'D', colIndex: 3, width: 11}, {col: 'E', colIndex: 4, width: 8},
    {col: 'F', colIndex: 5, width: 11}, {col: 'G', colIndex: 6, width: 12}, {col: 'H', colIndex: 7, width: 15}];

  rowNum = 0;
  
  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
      worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
  }      

  if (headerData.length > 0) {
    cancelled = headerData[0].Cancelled;
  }

  await moduleHeader(headerData, worksheet);
  await modulePaxNames(paxData, worksheet);
  await moduleDetails(detailsData, worksheet);

  rowNum += 2;

}

//**********************************************************/
async function moduleHeader(headerData, worksheet) {

  const fields = [
    {id: 'companyName', col: 'A', row: 1, caption: '', alignment: '', field: 'name', bold: true},
    {id: 'DivName', col: 'A', row: 2, caption: '', alignment: '', field: 'DivName'},
    {id: 'companyAddress', col: 'A', row: 3, caption: '', alignment: '', field: 'CompanyAddress'},

    {id: 'agentName', col: 'A', row: 5, caption: '', alignment: '', field: 'organisation'},
    {id: 'agentAddress', col: 'A', row: 6, caption: '', alignment: '', field: 'ClientAddress'},

    {id: 'quoPreparedFor', col: 'A', row: 9, caption: 'Quotation Prepared For', alignment: '', field: '', bold: true},
    {id: 'preparedBy', col: 'A', row: 10, caption: 'Prepared By', alignment: '', field: '', bold: true},
    {id: 'email', col: 'A', row: 11, caption: 'Email address:', alignment: '', field: '', bold: true},
    {id: 'quotationDate', col: 'A', row: 12, caption: 'Quotation Date', alignment: '', field: '', bold: true},

    {id: 'bookingNumber', col: 'A', row: 14, caption: 'Booking Number', alignment: '', field: '', bold: true},
    {id: 'tourCode', col: 'A', row: 15, caption: 'Tour Code', alignment: '', field: '', bold: true},
    {id: 'tourDate', col: 'A', row: 16, caption: 'Tour Date:', alignment: '', field: '', bold: true},
    {id: 'numPax', col: 'A', row: 17, caption: 'No. of Pax', alignment: '', field: '', bold: true},
    {id: 'roomType', col: 'A', row: 18, caption: 'Room Type', alignment: '', field: '', bold: true},

    {id: 'quoPreparedFor', col: 'B', row: 9, caption: '', alignment: '', field: 'PaxName'},
    {id: 'preparedBy', col: 'B', row: 10, caption: '', alignment: '', field: 'UserName'},
    {id: 'email', col: 'B', row: 11, caption: '', alignment: '', field: 'Email'},
    {id: 'quotationDate', col: 'B', row: 12, caption: '', alignment: '', field: 'QuotationDate', dateformat: 'DD/MM/YYYY'},

    {id: 'bookingNumber', col: 'B', row: 14, caption: '', alignment: '', field: 'Reference'},
    {id: 'tourCode', col: 'B', row: 15, caption: '', alignment: '', field: 'TourCode'},
    {id: 'tourDate', col: 'B', row: 16, caption: '', alignment: '', field: 'TourDate', dateformat: 'DD/MM/YYYY'},
    {id: 'numPax', col: 'B', row: 17, caption: '', alignment: '', field: 'NumPax'},
    {id: 'roomType', col: 'B', row: 18, caption: '', alignment: '', field: 'RoomType'},

    {id: 'taxInvoice', col: 'C', row: 20, caption: 'QUOTATION', alignment: '', field: '', bold: true, fontSize: 12},

  ];

  const rowHeights = [{row: 3, height: 63}, {row: 6, height: 79}];

  // Print all Header fields
  await printHeaderFields(fields, headerData, worksheet);

  // Set Row Heights
  for (let i=0; i<rowHeights.length; i++) {
    const row = worksheet.getRow(rowHeights[i].row+rowNum);
    row.height = rowHeights[i].height;  
    row.alignment = {...row.alignment, wrapText: true}
  }

  // set Lower Border
  const cellsForBorder = ['A','B','C','D','E','F'];
  const rowBorder = fields[fields.length-1].row+rowNum+1;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

}

//**********************************************************/
async function modulePaxNames(paxData, worksheet) {

  const fields = [
    {id: 'reference', col: 'A', row: 23, caption: '', alignment: '', field: 'Reference', bold: true}
  ];

  const columns = [
    {id: 'name', col: 'A', title: '', alignment: '', field: 'Name'}
  ];


  // Print all Header fields
  await printHeaderFields(fields, paxData, worksheet);

  let row = fields[fields.length-1].row + rowNum + 1;
  for (var i=0; i<paxData.length; i++) {
    for (var j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + row.toString());
      cell.font = {...defaultFont, size: 10};
      cell.value = paxData[i][columns[j].field];
    }
    row++;
  }

  rowNum = row + 1;
}


//**********************************************************/
async function moduleDetails(detailsData, worksheet) {

  const fields = [
    {id: 'bookElement', col: 'A', row: 1, caption: 'Book Element', alignment: '', field: '', bold: true, extra: false},
    {id: 'startDate', col: 'B', row: 1, caption: 'Start Date', alignment: '', field: '', bold: true, extra: false},
    {id: 'endDate', col: 'C', row: 1, caption: 'End Date', alignment: '', field: '', bold: true, extra: false},
    {id: 'netPrice', col: 'D', row: 1, caption: 'Net Price', alignment: '', field: '', bold: true, extra: false},
    {id: 'qty', col: 'E', row: 1, caption: 'Qty', alignment: '', field: '', bold: true, extra: false},
    {id: 'amount', col: 'F', row: 1, caption: 'Amount', alignment: '', field: '', bold: true, extra: false},
    {id: 'cancel', col: 'G', row: 1, caption: 'Cancel(%)', alignment: '', field: '', bold: true, extra: true},
    {id: 'finalAmount', col: 'H', row: 1, caption: 'Final Amount', alignment: '', field: '', bold: true, extra: true},
  ];

  const columns = [
    {id: 'QuoModuleDetails', col: 'A', title: '', alignment: '', field: 'QuoModuleDetails', extra: false},
    {id: 'DateIn', col: 'B', title: '', alignment: '', field: 'DateIn', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'DateOut', col: 'C', title: '', alignment: '', field: 'DateOut', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'RateAfterServTax', col: 'D', title: '', alignment: '', field: 'RateAfterServTax', numformat: '#,##0.00', printIfZero: false, extra: false},
    {id: 'Qty', col: 'E', title: '', alignment: '', field: 'Qty', numformat: '#,##0', printIfZero: false, extra: false},
    {id: 'TotalAmt', col: 'F', title: '', alignment: '', field: 'TotalAmt', numformat: '#,##0.00', printIfZero: false, extra: false},
    {id: 'Cancel', col: 'G', title: '', alignment: '', field: 'CancelPerc', numformat: '#,##0.00', printIfZero: false, extra: true},
    {id: 'FinalAmt', col: 'H', title: '', alignment: '', field: 'FinalLineAmount', numformat: '#,##0.00', printIfZero: false, extra: true},
  ];

  const fieldArr = (cancelled) ? fields : fields.filter(rec => !rec.extra);
  const columnsArr = (cancelled) ? columns : columns.filter(rec => !rec.extra);

  // Print all Header fields
  await printHeaderFields(fieldArr, detailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C','D','E','F'];
  if (cancelled) {
    cellsForBorder.push('G','H');
  }

  const borderCell = (cancelled) ? 'H' : 'F';

  let rowBorder = fieldArr[fieldArr.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'}, top: {style: 'thin'} };      
    if (cellsForBorder[i] === borderCell) {
      cell.border = {...cell.border, right: {style: 'thin'} };      
    }
  }

  let invTotal = 0;
  let currency = '';
  let finalAmount = detailsData.reduce((n, {FinalLineAmount}) => n + FinalLineAmount, 0);

  let row = rowBorder + 1;
  for (var i=0; i<detailsData.length; i++) {
    for (var j=0; j<columnsArr.length; j++) {
      let cell = worksheet.getCell(columnsArr[j].col + row.toString());

      if ((columnsArr[j].printIfZero === undefined) || (columnsArr[j].printIfZero) || ((detailsData[i][columnsArr[j].field] !== null) && (detailsData[i][columnsArr[j].field] > 0))) {
        cell.value = detailsData[i][columnsArr[j].field];
      }
      cell.font = {...defaultFont, size: 10};
      if (detailsData[i].RecType === 1) {
        cell.font = {...cell.font, bold: true};
      }
      if (columnsArr[j].bold !== undefined && columnsArr[j].bold) {
        cell.font = {...defaultFont, bold: true};
      }
      if (columnsArr[j].fontSize !== undefined) {
        cell.font = {...cell.font, size: columnsArr[j].fontSize};
      }
      if (columnsArr[j].alignment > '') {
        cell.alignment = { horizontal: columnsArr[j].alignment };      
      }
      if (columnsArr[j].dateformat !== undefined && detailsData[i][columnsArr[j].field] !== null) {
        cell.value = moment(detailsData[i][columnsArr[j].field]).format(columnsArr[j].dateformat);
      } 
      if (columnsArr[j].numformat !== undefined) {
        cell.numFmt = columnsArr[j].numformat;      
      }    

    }

    if (i===0) {
      invTotal = detailsData[i]['TotalInvoiceAmount'];
      currency = detailsData[i]['currencycode'];
    }

    row++;
  }

  // set Lower Border
  cellsForBorder = ['A','B','C','D','E','F','G'];
  if (cancelled) {
    cellsForBorder.push('H','I');
  }

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

  const currencyCell = (cancelled) ? 'G' : 'E';
  cell = worksheet.getCell(currencyCell + row.toString());
  cell.value = currency;
  cell.font = {...defaultFont, bold: true};
  cell.alignment = { horizontal: 'center' };      

  const totalCell = (cancelled) ? 'H' : 'F';
  cell = worksheet.getCell(totalCell + row.toString());
  cell.value = (cancelled) ? finalAmount : invTotal;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0.00';      
  cell.alignment = { horizontal: 'right' };      

  rowNum = row + 3;
}

//**********************************************************/
async function printHeaderFields(fields, invHeaderData, worksheet) {

  // Print all Header fields
  for (var i=0; i<fields.length; i++) {
    let cell = worksheet.getCell(fields[i].col + (fields[i].row + rowNum).toString());
    let value = fields[i].caption;
    if (fields[i].field > '') {
      if (invHeaderData.length > 0 && invHeaderData[0][fields[i].field] !== null) {
        value += invHeaderData[0][fields[i].field];
      }
    }
    cell.value = value;  
    cell.font = defaultFont;
    if (fields[i].bold !== undefined && fields[i].bold) {
      cell.font = {...defaultFont, bold: true};
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
