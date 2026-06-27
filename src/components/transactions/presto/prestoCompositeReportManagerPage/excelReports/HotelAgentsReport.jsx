import { dbGetRecordRaw } from '../../../../../actions';

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 12};

//**********************************************************/
export async function exportHotelAgents (reportObj, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 6}, {col: 'B', colIndex: 1, width: 10},
    {col: 'C', colIndex: 2, width: 10}, {col: 'D', colIndex: 3, width: 12}, {col: 'E', colIndex: 4, width: 10},
    {col: 'F', colIndex: 5, width: 20}, 
    {col: 'G', colIndex: 6, width: 50}, 
    {col: 'H', colIndex: 7, width: 28}
  ];

  rowNum = 0;

  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
    worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
  }      

  await hotelAgentDetails(reportObj, worksheet);

  rowNum += 2;

}

//**********************************************************/
async function hotelAgentDetails(reportObj, worksheet) {

  /*=== get voucher info to print ===*/  
  let query = "SELECT p.PaxInfo, p.StartingInfo, p.EndingInfo " + 
  " FROM QuoPrint p " +
  " WHERE p.QuoPrint_id = " + reportObj.quoPrint_id.toString();
  const headerData = await dbGetRecordRaw({query: query});

  /*=== quotation data ===*/  
  query = "SELECT q.NumPax, q.TourCode " + 
    " FROM Quotations q " +
    " WHERE q.Quotations_id = " + reportObj.quotations_id.toString();
  const quoData = await dbGetRecordRaw({query: query});

  /*=== details data ===*/  
  query = "EXEC p_Rpt_QuoTourHotelAgentList " + reportObj.quotations_id.toString() + ",1 ";
  const detailsData = await dbGetRecordRaw({query: query});

  /*=== get voucher info to print ===*/  
  query = "SELECT text AS EmergencyPhone " + 
    " FROM Defaults " +
    " WHERE Defaults_id = 52";
  const phoneData = await dbGetRecordRaw({query: query});

  const fields = [

    {id: 'day', col: 'A', row: 1, caption: 'Day', alignment: 'center', field: '', bold: true, extra: false},
    {id: 'from', col: 'B', row: 1, caption: 'From', alignment: '', field: '', bold: true, extra: false},
    {id: 'to', col: 'C', row: 1, caption: 'To', alignment: '', field: '', bold: true, extra: true},

    {id: 'date', col: 'D', row: 1, caption: 'Date', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'time', col: 'E', row: 1, caption: 'Time', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'hotel', col: 'F', row: 1, caption: 'Hotel/Agent', alignment: '', field: '', bold: true, extra: true},
    {id: 'service', col: 'G', row: 1, caption: 'Services requested from hotel/agent', alignment: '', field: '', bold: true, extra: true},
    {id: 'tel', col: 'H', row: 1, caption: 'Telephone No.', alignment: '', field: '', bold: true, extra: true},

  ];


  const columns = [

    {id: 'day', col: 'A', title: '', alignment: 'center', field: 'DayNo', extra: false},
    {id: 'from', col: 'B', title: '', alignment: '', field: 'FromCity', extra: false},
    {id: 'to', col: 'C', title: '', alignment: '', field: 'ToCity', extra: false},

    {id: 'servicedate', col: 'D', title: '', alignment: 'center', field: 'ServiceDate', extra: false},
    //{id: 'servicedate', col: 'D', title: '', alignment: 'center', field: 'ServiceDate', dateformat: 'DD/MM/YYYY', extra: false},
    {id: 'atTime', col: 'E', title: '', alignment: 'center', field: 'AtTime', extra: false},

    {id: 'organisation', col: 'F', title: '', alignment: '', field: 'Organisation', extra: false, wrapText: true},
    {id: 'serviceDesc', col: 'G', title: '', alignment: '', field: 'ServiceDesc', extra: false, wrapText: true},
    {id: 'contact', col: 'H', title: '', alignment: '', field: 'Contact', extra: false, wrapText: true},
     
  ];

  rowNum = 1;

  let cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'List of services for : ' + headerData[0].PaxInfo + ' (' + quoData[0].TourCode + ')';  
  cell.font = {...defaultFont, bold: true};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'No. of Travellers :' + quoData[0].NumPax.toString();  
  cell.font = {...defaultFont};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = headerData[0].StartingInfo;  
  cell.font = {...defaultFont};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = headerData[0].EndingInfo;  
  cell.font = {...defaultFont};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'Emergency Contact No: ' + phoneData[0].EmergencyPhone;  
  cell.font = {...defaultFont, bold: true};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'You can also use our emergency number for any assistance you need with domestic flights and trains (if they are part of the services mentioned below)';  
  cell.font = {...defaultFont, bold: true};
  
  rowNum += 2;

  // Print all Header fields
  await printHeaderFields(fields, detailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C','D','E','F','G','H'];

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
      if (columns[j].wrapText !== undefined && columns[j].wrapText) {
        cell.alignment = { ...cell.alignment, wrapText: true };      
      }
      // Align vertically to the top as some rows wll be of higher height and the default alignment is bottom
      cell.alignment = { ...cell.alignment, vertical: 'top' };      
      if (columns[j].dateformat !== undefined && detailsData[i][columns[j].field] !== null) {
        cell.value = moment(detailsData[i][columns[j].field]).format(columns[j].dateformat);
      } 
      if (columns[j].numformat !== undefined) {
        cell.numFmt = columns[j].numformat;      
      }    

    }

    row++;
  }

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
