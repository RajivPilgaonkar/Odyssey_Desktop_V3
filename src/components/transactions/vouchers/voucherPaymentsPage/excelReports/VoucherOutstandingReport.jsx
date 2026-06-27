
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 10};

//**********************************************************/
export async function exportVoucherOutstandingReport(mainData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 12}, {col: 'B', colIndex: 1, width: 15},
    {col: 'C', colIndex: 2, width: 30}, {col: 'D', colIndex: 3, width: 60}, 
    {col: 'E', colIndex: 4, width: 15}, {col: 'F', colIndex: 5, width: 15},
    {col: 'G', colIndex: 6, width: 18}, {col: 'H', colIndex: 7, width: 15},
    {col: 'I', colIndex: 8, width: 15}];

  rowNum = 0;
  
  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
      worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
  }      

  await reportBody(mainData, worksheet);

  rowNum += 2;

}

//**********************************************************/
async function reportBody(mainData, worksheet) {

  const fields = [
    {id: 'VoucherNo', col: 'A', row: 1, caption: 'Voucher No', alignment: 'center', field: '', bold: true},
    {id: 'VoucherDate', col: 'B', row: 1, caption: 'Voucher Date', alignment: 'center', field: '', bold: true},
    {id: 'HotelAgent', col: 'C', row: 1, caption: 'Hotel/Agent', alignment: '', field: '', bold: true},
    {id: 'Description', col: 'D', row: 1, caption: 'Description', alignment: '', field: '', bold: true},
    {id: 'ExpectedCost', col: 'E', row: 1, caption: 'Expected Cost', alignment: 'right', field: '', bold: true},
    {id: 'AmountBilled', col: 'F', row: 1, caption: 'Billed', alignment: 'right', field: '', bold: true},
    {id: 'OutstandingAmount', col: 'G', row: 1, caption: 'Oustanding Amt.', alignment: 'right', field: '', bold: true},
    {id: 'TourCode', col: 'H', row: 1, caption: 'Tour Code', alignment: 'center', field: '', bold: true},
    {id: 'TourDate', col: 'I', row: 1, caption: 'Tour Date', alignment: 'center', field: '', bold: true},
  ];

  const columns = [
    {id: 'VoucherNo', col: 'A', title: '', alignment: 'center', field: 'VoucherNo'},
    {id: 'VoucherDate', col: 'B', title: '', alignment: 'center', field: 'VoucherDate', dateformat: 'DD/MM/YYYY'},
    {id: 'HotelAgent', col: 'C', title: '', alignment: '', field: 'Organisation'},
    {id: 'Description', col: 'D', title: '', alignment: '', field: 'Description'},
    {id: 'ExpectedCost', col: 'E', title: '', alignment: 'right', field: 'ExpectedCost', printIfZero: true, numformat: '#,##0'},
    {id: 'AmountBilled', col: 'F', title: '', alignment: '', field: 'AmountBilled', printIfZero: false, numformat: '#,##0'},
    {id: 'OutstandingAmount', col: 'G', title: '', alignment: '', field: 'OutstandingAmount', printIfZero: false, numformat: '#,##0'},
    {id: 'TourCode', col: 'H', title: '', alignment: 'center', field: 'MasterTourCode'},
    {id: 'TourDate', col: 'I', title: '', alignment: 'center', field: 'MasterTourDate', dateformat: 'DD/MM/YYYY'},
  ];

  //const rowHeights = [{row: 2, height: 54}, {row: 11, height: 41}];

  // Print all Header fields
  printHeaderFields(fields, mainData, worksheet);

  // Print detail fields
  let startRow = 2;
  let row = startRow;
  for (var i=0; i<mainData.length; i++) {

    const rowObj = worksheet.getRow(row);
    rowObj.height = 45;  
    rowObj.alignment = {...rowObj.alignment, vertical: 'top', wrapText: true}

    for (var j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + row.toString());

      if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((mainData[i][columns[j].field] !== null) && (mainData[i][columns[j].field] > 0))) {
        cell.value = mainData[i][columns[j].field];
      }
      cell.font = defaultFont;
      if (columns[j].bold !== undefined && columns[j].bold) {
        cell.font = {...defaultFont, bold: true};
      }
      if (columns[j].fontSize !== undefined) {
        cell.font = {...cell.font, size: columns[j].fontSize};
      }
      if (columns[j].alignment > '') {
        cell.alignment = { ...cell.alignment, horizontal: columns[j].alignment};      
      }
      if (columns[j].dateformat !== undefined) {
        cell.value = moment(mainData[i][columns[j].field]).format(columns[j].dateformat);
      }    
      if (columns[j].numformat !== undefined) {
        cell.numFmt = columns[j].numformat;      
      }  
    }
    row++;  
  }

  // set Lower Border
  const cellsForBorder = fields.map(e => e.col);
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + row.toString());
    cell.border = {top: {style: 'thin'} };      
  }

  // Total 
  row ++; 
  let cell = worksheet.getCell('A' + row.toString());
  cell.value = 'Total';
  cell.font = {...cell.font, bold: true};

  const cellsForTotals = ['E','F','G'];
  for (let i=0; i<cellsForTotals.length; i++) {
    const cell = worksheet.getCell(cellsForTotals[i] + row.toString());
    cell.value = {formula: '=SUM(' + cellsForTotals[i] + startRow.toString() + ':' + cellsForTotals[i] + (row-2).toString() + ')'};
    cell.numFmt = '#,##0';      
    cell.alignment = { horizontal: 'right' };      
    cell.font = {...cell.font, bold: true};
  }


}


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
