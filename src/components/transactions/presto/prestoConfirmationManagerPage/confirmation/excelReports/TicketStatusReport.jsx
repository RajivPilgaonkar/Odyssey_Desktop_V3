
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 12};

//**********************************************************/
export async function exportTicketStatusReport (reportObj, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 12}, {col: 'B', colIndex: 1, width: 26},
    {col: 'C', colIndex: 2, width: 32}, {col: 'D', colIndex: 3, width: 22}, {col: 'E', colIndex: 4, width: 13},
    {col: 'F', colIndex: 5, width: 34}, {col: 'G', colIndex: 6, width: 13}, {col: 'H', colIndex: 7, width: 13},
    {col: 'I', colIndex: 8, width: 13}, {col: 'J', colIndex: 9, width: 74}, {col: 'K', colIndex: 26, width: 26}, 
    {col: 'L', colIndex: 11, width: 13}, {col: 'M', colIndex: 12, width: 13}
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
    {id: 'city', col: 'A', row: 1, caption: 'City', alignment: '', field: '', bold: true, extra: false},
    {id: 'organisation', col: 'B', row: 1, caption: 'Agent/Hotel', alignment: '', field: '', bold: true, extra: false},
    {id: 'phone', col: 'C', row: 1, caption: 'Phone', alignment: '', field: '', bold: true, extra: false},
    {id: 'contact', col: 'D', row: 1, caption: 'Contact', alignment: '', field: '', bold: true, extra: false},
    {id: 'tourcode', col: 'E', row: 1, caption: 'Tour Code', alignment: 'center', field: '', bold: true, extra: false},
    {id: 'pax', col: 'F', row: 1, caption: 'Pax', alignment: '', field: '', bold: true, extra: false},
    {id: 'quotation', col: 'G', row: 1, caption: 'Quotation', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'travelOn', col: 'H', row: 1, caption: 'Travel On', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'bookedOn', col: 'I', row: 1, caption: 'Booked On', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'description', col: 'J', row: 1, caption: 'Description', alignment: '', field: '', bold: true, extra: true},
    {id: 'remarks', col: 'K', row: 1, caption: 'Remarks', alignment: '', field: '', bold: true, extra: true},
    {id: 'reqOn', col: 'L', row: 1, caption: 'Req. On', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'reqBy', col: 'M', row: 1, caption: 'Req. By', alignment: 'center', field: '', bold: true, extra: true},
  ];

  const columns = [
    {id: 'city', col: 'A', title: '', alignment: '', field: 'City', extra: false},
    {id: 'organisation', col: 'B', title: '', alignment: '', field: 'Organisation', extra: false},
    {id: 'phone', col: 'C', title: '', alignment: '', field: 'Phone', extra: false},
    {id: 'contact', col: 'D', title: '', alignment: '', field: 'Contact', extra: false},

    {id: 'tourcode', col: 'E', title: '', alignment: 'center', field: 'TourCode', extra: false},
    {id: 'pax', col: 'F', title: '', alignment: '', field: 'PaxName', numformat: '#,##0.00', extra: false},
    {id: 'quotationNo', col: 'G', title: '', alignment: 'center', field: 'QuotationNo', numformat: '#,##0', extra: false},

    {id: 'servicedate', col: 'H', title: '', alignment: 'center', field: 'ServiceDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'bookingdate', col: 'I', title: '', alignment: 'center', field: 'BookingDate', dateformat: 'DD/MM/YYYY', extra: false},

    {id: 'servicestring', col: 'J', title: '', alignment: '', field: 'ServiceString', extra: false},
    {id: 'remarks', col: 'K', title: '', alignment: '', field: 'Remarks', extra: false},

    {id: 'reqOn', col: 'L', title: '', alignment: 'center', field: 'RequestedOn', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'reqBy', col: 'M', title: '', alignment: 'center', field: 'RequestedBy', extra: false}

  ];

  rowNum = 1;

  let cell = worksheet.getCell('A1');
  cell.value = 'Ticket Status as on ' + reportObj.asOf;  
  cell.font = {...defaultFont, bold: true};

  rowNum += 2;

  // Print all Header fields
  await printHeaderFields(fields, detailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];

  const borderCell = 'H';

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
  cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];

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
