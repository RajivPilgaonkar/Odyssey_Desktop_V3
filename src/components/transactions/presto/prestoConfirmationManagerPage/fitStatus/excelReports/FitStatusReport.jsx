
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 12};

//**********************************************************/
export async function exportFitStatusReport (reportObj, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 12}, {col: 'B', colIndex: 1, width: 12},
    {col: 'C', colIndex: 2, width: 12}, {col: 'D', colIndex: 3, width: 32}, {col: 'E', colIndex: 4, width: 12},
    {col: 'F', colIndex: 5, width: 30}, {col: 'G', colIndex: 6, width: 16}, {col: 'H', colIndex: 7, width: 13},
    {col: 'I', colIndex: 8, width: 30}, {col: 'J', colIndex: 9, width: 16}, {col: 'K', colIndex: 10, width: 12}, 
    {col: 'L', colIndex: 11, width: 14}, {col: 'M', colIndex: 12, width: 12}, {col: 'N', colIndex: 13, width: 14},
    {col: 'O', colIndex: 14, width: 14}
  ];

  rowNum = 0;

  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
      worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
  }      

  await moduleDetails(reportObj, worksheet);

  rowNum += 2;

}

//**********************************************************/
async function moduleDetails(reportObj, worksheet) {

  const detailsData = reportObj.excelData;

  const fields = [

    {id: 'starts', col: 'A', row: 1, caption: 'Starts', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'ends', col: 'B', row: 1, caption: 'Ends', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'tourcode', col: 'C', row: 1, caption: 'Tour Code', alignment: 'center', field: '', bold: true, extra: false},
    {id: 'pax', col: 'D', row: 1, caption: 'Pax', alignment: '', field: '', bold: true, extra: false},
    {id: 'numpax', col: 'E', row: 1, caption: 'Num Pax', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'organisation', col: 'F', row: 1, caption: 'Agent', alignment: '', field: '', bold: true, extra: false},
    {id: 'contact', col: 'G', row: 1, caption: 'Reference', alignment: '', field: '', bold: true, extra: false},
    {id: 'quotation', col: 'H', row: 1, caption: 'Quotation', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'comment', col: 'I', row: 1, caption: 'Comment', alignment: '', field: '', bold: true, extra: true},
    {id: 'consultant', col: 'J', row: 1, caption: 'Consultant', alignment: '', field: '', bold: true, extra: true},

    {id: 'bkgRecd', col: 'K', row: 1, caption: 'Bkg. Recd.', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'bkgEntered', col: 'L', row: 1, caption: 'Bkg. Entered', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'deadline', col: 'M', row: 1, caption: 'Deadline', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'quoSendFile', col: 'N', row: 1, caption: 'Quo. Sent', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'tourSendFile', col: 'O', row: 1, caption: 'File Sent', alignment: 'center', field: '', bold: true, extra: true},

  ];

  const columns = [
    {id: 'starts', col: 'A', title: '', alignment: 'center', field: 'StartDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'ends', col: 'B', title: '', alignment: 'center', field: 'EndDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'tourcode', col: 'C', title: '', alignment: 'center', field: 'TourCode', extra: false},

    {id: 'pax', col: 'D', title: '', alignment: '', field: 'PaxName', numformat: '#,##0.00', extra: false},
    {id: 'numpax', col: 'E', title: '', alignment: 'center', field: 'NumPax', numformat: '#,##0', extra: false},

    {id: 'principalAgent', col: 'F', title: '', alignment: '', field: 'PrincipalAgent', extra: false},
    {id: 'reference', col: 'G', title: '', alignment: '', field: 'Reference', extra: false},
    {id: 'quotationNo', col: 'H', title: '', alignment: 'center', field: 'QuotationNo', numformat: '#,##0', extra: false},
    
    {id: 'comment', col: 'I', title: '', alignment: '', field: 'Comment', extra: false},
    {id: 'consultant', col: 'J', title: '', alignment: '', field: 'Consultant', extra: false},

    {id: 'bkgRecd', col: 'K', title: '', alignment: 'center', field: 'BookingRecdDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'bkgEnter', col: 'L', title: '', alignment: 'center', field: 'BookingEntryDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'deadline', col: 'M', title: '', alignment: 'center', field: 'Deadline', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'quoSendDate', col: 'N', title: '', alignment: 'center', field: 'QuotationSendDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'tourFileSendDate', col: 'O', title: '', alignment: 'center', field: 'TourFileSendDate', dateformat: 'DD/MM/YYYY', extra: false},

  ];

  rowNum = 1;

  let cell = worksheet.getCell('A1');
  cell.value = 'FIT Status between ' + reportObj.fromDate + ' and ' + reportObj.toDate;  
  cell.font = {...defaultFont, bold: true};

  rowNum += 2;

  // Print all Header fields
  await printHeaderFields(fields, detailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];

  const borderCell = 'O';

  let rowBorder = fields[fields.length-1].row+rowNum;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'}, top: {style: 'thin'} };      
    if (cellsForBorder[i] === borderCell) {
      cell.border = {...cell.border, right: {style: 'thin'} };      
    }
  }

  let row = rowBorder + 1;
  for (var i=0; i<detailsData.length; i++) {
    for (var j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + row.toString());

      if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((detailsData[i][columns[j].field] !== null) && (detailsData[i][columns[j].field] > 0))) {
        cell.value = detailsData[i][columns[j].field];
      }
      cell.font = {...defaultFont, size: 10};
      if (detailsData[i].RecType === 1) {
        cell.font = {...cell.font, bold: true};
      }
      if (columns[j].bold !== undefined && columns[j].bold) {
        cell.font = {...defaultFont, bold: true};
      }
      if (columns[j].fontSize !== undefined) {
        cell.font = {...cell.font, size: columns[j].fontSize};
      }
      if (columns[j].alignment > '') {
        cell.alignment = { horizontal: columns[j].alignment };      
      }
      if (columns[j].dateformat !== undefined && detailsData[i][columns[j].field] !== null) {
        cell.value = moment(detailsData[i][columns[j].field]).format(columns[j].dateformat);
      } 
      if (columns[j].numformat !== undefined) {
        cell.numFmt = columns[j].numformat;      
      }    

    }

    row++;
  }

  // set Lower Border
  cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];

  rowBorder = row;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

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
