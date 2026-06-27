
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 10};

//**********************************************************/
export async function exportVoucherTallyReport(mainData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 12}, {col: 'B', colIndex: 1, width: 15},
    {col: 'C', colIndex: 2, width: 60}, {col: 'D', colIndex: 3, width: 35}, {col: 'E', colIndex: 4, width: 15},
    {col: 'F', colIndex: 5, width: 20}, {col: 'G', colIndex: 6, width: 20}];

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
    {id: 'Narration', col: 'C', row: 1, caption: 'Narration', alignment: '', field: '', bold: true},
    {id: 'HotelAgent', col: 'D', row: 1, caption: 'Hotel/Agent', alignment: '', field: '', bold: true},
    {id: 'Amount', col: 'E', row: 1, caption: 'Amount', alignment: 'right', field: '', bold: true},
    {id: 'DbAccount', col: 'F', row: 1, caption: 'Db Account', alignment: '', field: '', bold: true},
    {id: 'CrAccount', col: 'G', row: 1, caption: 'Cr Account', alignment: '', field: '', bold: true},
  ];

  const columns = [
    {id: 'VoucherNo', col: 'A', title: '', alignment: 'center', field: 'VoucherNo'},
    {id: 'VoucherDate', col: 'B', title: '', alignment: 'center', field: 'VoucherDate', dateformat: 'DD/MM/YYYY'},
    {id: 'Narration', col: 'C', title: '', alignment: '', field: 'Narration'},
    {id: 'Account', col: 'D', title: '', alignment: '', field: 'Organisation'},
    {id: 'Amount', col: 'E', title: '', alignment: 'right', field: 'Amount', printIfZero: true, numformat: '#,##0'},
    {id: 'DbAccount', col: 'F', title: '', alignment: '', field: 'Account2'},
    {id: 'CrAccount', col: 'G', title: '', alignment: '', field: 'Account1'},
  ];

  //const rowHeights = [{row: 2, height: 54}, {row: 11, height: 41}];

  // Print all Header fields
  printHeaderFields(fields, mainData, worksheet);

  // Print detail fields
  let row = 2;
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


  // Special Fields (Invoice as a combination of 2 fields)
  //let obj = fields.find(o => o.id === 'invNo');
  //let cell = worksheet.getCell('B' + (rowNum + obj.row).toString());
  //cell.value = invHeaderData[0].yearref.toString() + '/' + invHeaderData[0].invoiceno;

  // Set Row Heights
  //for (let i=0; i<rowHeights.length; i++) {
  //  const row = worksheet.getRow(rowHeights[i].row+rowNum);
  //  row.height = rowHeights[i].height;  
  //  row.alignment = {...row.alignment, wrapText: true}
  //}

  // set Lower Border
  //const cellsForBorder = ['A','B','C','D','E','F','G'];
  //const rowBorder = fields[fields.length-1].row+rowNum;
  //for (let i=0; i<cellsForBorder.length; i++) {
  //  const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
  //  cell.border = {bottom: {style: 'thin'} };      
  //}

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
