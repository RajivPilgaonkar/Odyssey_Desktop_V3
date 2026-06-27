
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 12};

//**********************************************************/
export async function exportFutureBookingsReport (reportObj, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 20}, {col: 'B', colIndex: 1, width: 35},
    {col: 'C', colIndex: 2, width: 12}, {col: 'D', colIndex: 3, width: 12}, {col: 'E', colIndex: 4, width: 12},
    {col: 'F', colIndex: 5, width: 12}, {col: 'G', colIndex: 6, width: 12}, {col: 'H', colIndex: 7, width: 14},
    {col: 'I', colIndex: 8, width: 14}, {col: 'J', colIndex: 9, width: 12}
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

    {id: 'tourcode', col: 'A', row: 1, caption: 'Tour Code', alignment: 'center', field: '', bold: true, extra: false},
    {id: 'pax', col: 'B', row: 1, caption: 'Pax', alignment: '', field: '', bold: true, extra: false},
    {id: 'numpax', col: 'C', row: 1, caption: 'Num Pax', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'singles', col: 'D', row: 1, caption: 'Singles', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'doubles', col: 'E', row: 1, caption: 'Doubles', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'twins', col: 'F', row: 1, caption: 'Twins', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'triples', col: 'G', row: 1, caption: 'Triples', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'dateIn', col: 'H', row: 1, caption: 'Date In', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'dateOut', col: 'I', row: 1, caption: 'Date Out', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'nights', col: 'J', row: 1, caption: 'Nights', alignment: 'center', field: '', bold: true, extra: true},

  ];


  const columns = [

    {id: 'tourcode', col: 'A', title: '', alignment: 'center', field: 'TourCode', extra: false},
    {id: 'pax', col: 'B', title: '', alignment: '', field: 'PaxName', numformat: '#,##0.00', extra: false},
    {id: 'numpax', col: 'C', title: '', alignment: 'center', field: 'NumPax', numformat: '#,##0', extra: false},

    {id: 'singles', col: 'D', title: '', alignment: 'center', field: 'Singles', numformat: '#,##0', extra: false},
    {id: 'doubles', col: 'E', title: '', alignment: 'center', field: 'Doubles', numformat: '#,##0', extra: false},
    {id: 'twins', col: 'F', title: '', alignment: 'center', field: 'Twins', numformat: '#,##0', extra: false},
    {id: 'triples', col: 'G', title: '', alignment: 'center', field: 'Triples', numformat: '#,##0', extra: false},

    {id: 'dateIn', col: 'H', title: '', alignment: 'center', field: 'DateIn', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'dateOut', col: 'I', title: '', alignment: 'center', field: 'DateOut', dateformat: 'DD/MM/YYYY', extra: false},

    {id: 'nights', col: 'J', title: '', alignment: 'center', field: 'Nights', numformat: '#,##0', extra: false},

  ];

  rowNum = 1;

  let cell = worksheet.getCell('A1');
  cell.value = 'Future Bookings between ' + reportObj.fromDate + ' and ' + reportObj.toDate;  
  cell.font = {...defaultFont, bold: true};

  cell = worksheet.getCell('A2');
  cell.value = reportObj.hotel;  
  cell.font = {...defaultFont, bold: true};

  rowNum += 3;

  // Print all Header fields
  await printHeaderFields(fields, detailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C','D','E','F','G','H','I','J'];

  const borderCell = 'J';

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
  cellsForBorder = ['A','B','C','D','E','F','G','H','I','J'];

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
