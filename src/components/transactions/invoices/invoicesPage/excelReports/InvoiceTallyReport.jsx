
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 10};

//**********************************************************/
export async function exportInvoiceTallyReport(mainData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 12}, {col: 'B', colIndex: 1, width: 15},
    {col: 'C', colIndex: 2, width: 17}, {col: 'D', colIndex: 3, width: 35}, {col: 'E', colIndex: 4, width: 20},
    {col: 'F', colIndex: 5, width: 12}, {col: 'G', colIndex: 6, width: 12}, {col: 'H', colIndex: 7, width: 12},
    {col: 'I', colIndex: 8, width: 12}, {col: 'J', colIndex: 9, width: 12}];

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
    {id: 'InvoiceNo', col: 'A', row: 1, caption: 'Invoice No', alignment: 'center', field: '', bold: true},
    {id: 'InvoiceDate', col: 'B', row: 1, caption: 'Invoice Date', alignment: 'center', field: '', bold: true},
    {id: 'PlaceOfSupply', col: 'C', row: 1, caption: 'Place Of Supply', alignment: '', field: '', bold: true},
    {id: 'Narration', col: 'D', row: 1, caption: 'Narration', alignment: '', field: '', bold: true},
    {id: 'Customer', col: 'E', row: 1, caption: 'Customer', alignment: '', field: '', bold: true},
    {id: 'Amount', col: 'F', row: 1, caption: 'Amount', alignment: 'right', field: '', bold: true},
    {id: 'Income', col: 'G', row: 1, caption: 'Income', alignment: 'right', field: '', bold: true},
    {id: 'I_GST', col: 'H', row: 1, caption: 'I_GST', alignment: 'right', field: '', bold: true},
    {id: 'C_GST', col: 'I', row: 1, caption: 'C_GST', alignment: 'right', field: '', bold: true},
    {id: 'S_GST', col: 'J', row: 1, caption: 'S_GST', alignment: 'right', field: '', bold: true},
  ];

  const columns = [
    {id: 'InvoiceNo', col: 'A', title: '', alignment: 'center', field: 'InvoiceNo'},
    {id: 'InvoiceDate', col: 'B', title: '', alignment: 'center', field: 'InvoiceDate', dateformat: 'DD/MM/YYYY'},
    {id: 'PlaceOfSupply', col: 'C', title: '', alignment: '', field: 'PlaceOfSupply'},
    {id: 'Narration', col: 'D', title: '', alignment: '', field: 'Narration'},
    {id: 'Account', col: 'E', title: '', alignment: '', field: 'Account1'},
    {id: 'Amount', col: 'F', title: '', alignment: 'right', field: 'Amount', printIfZero: true, numformat: '#,##0'},
    {id: 'Income', col: 'G', title: '', alignment: 'right', field: 'Income', printIfZero: true, numformat: '#,##0'},
    {id: 'I_GST', col: 'H', title: '', alignment: 'right', field: 'I_GST', printIfZero: true, numformat: '#,##0'},
    {id: 'C_GST', col: 'I', title: '', alignment: 'right', field: 'C_GST', printIfZero: true, numformat: '#,##0'},
    {id: 'S_GST', col: 'J', title: '', alignment: 'right', field: 'S_GST', printIfZero: true, numformat: '#,##0'},
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

    // Visual warning if Place of Supply is blank
    if (mainData[i].PlaceOfSupply === null || 
        mainData[i].PlaceOfSupply.trim().length === 0 || 
        mainData[i].PlaceOfSupply.Amount <= 0) {
      colorRow(row, columns, worksheet);
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
  cell.bold = true;

  const cellsForTotals = ['F','G','H','I','J'];
  for (let i=0; i<cellsForTotals.length; i++) {
    const cell = worksheet.getCell(cellsForTotals[i] + row.toString());
    cell.value = {formula: '=SUM(' + cellsForTotals[i] + startRow.toString() + ':' + cellsForTotals[i] + (row-2).toString() + ')'};
    cell.numFmt = '#,##0';      
    cell.alignment = { horizontal: 'right' };      
    cell.font = {...cell.font, bold: true};
  }

}

//**********************************************************/
function colorRow(row, columns, worksheet) {

  /*=== Color cells ====*/  
  for (let j=0; j<columns.length; j++) {
    const cell = worksheet.getCell(columns[j].col + row.toString());
    cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FFFFCC' }};
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
