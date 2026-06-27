import { dbGetRecordRaw } from '../../../../../actions';
import { numberFormat } from "../../../../common/CommonTransactionFunctions";


// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Book Antiqua', size: 12};

//**********************************************************/
export async function exportItineraryQuotation (reportObj, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 9}, {col: 'B', colIndex: 1, width: 12},
    {col: 'C', colIndex: 2, width: 9}, {col: 'D', colIndex: 3, width: 15}, 
    {col: 'E', colIndex: 4, width: 30},
    {col: 'F', colIndex: 5, width: 48},
    {col: 'G', colIndex: 6, width: 12}, 
    {col: 'H', colIndex: 7, width: 11}, 
    {col: 'I', colIndex: 8, width: 12},
    {col: 'J', colIndex: 9, width: 11},
    {col: 'K', colIndex: 10, width: 12},
    {col: 'L', colIndex: 11, width: 11},
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
  let query = "SELECT q.PaxName, q.TourCode, q.StartDate, q.NumPax, c.CurrencyCode " + 
  " FROM Quotations q " +
  " LEFT JOIN Currencies c ON q.Currencies_id = c.Currencies_id " +
  " WHERE q.Quotations_id = " + reportObj.quotations_id.toString();
  const headerData = await dbGetRecordRaw({query: query});

  /*=== details data ===*/  
  query = "SELECT ql.QuoLines_id, ql.LineNum, ql.QuoDate, ql.QuoTime, " + 
    "c.city, ql.QuoString, ql.Cost, ql.ServiceTax AS Gst, " + 
    "ql.Cost + ql.ServiceTax as Total, ql.Margin, ql.QuoteCost, " + 
    "FCurrQuoteCost AS Forex, ql.ExchRate, ql.TrsType, " +
    "ql.QuoAccommodation_id, ql.QuoServices_id, ql.QuoTickets_id, ql.CarHireAgents_id " + 
    "FROM QuoLines ql " +
    "LEFT JOIN Cities c ON ql.Cities_id = c.cities_id " +
    "WHERE Quotations_id = " + reportObj.quotations_id.toString() + " " +
    "ORDER BY LineNum";
  const detailsData = await dbGetRecordRaw({query: query});  

  // Add Agent to the details data
  await setActivityAgent(detailsData);

  // Add line for Tour Operator GST
  await setTourOperatorGstLine (reportObj, detailsData);

  const fields = [

    {id: 'lineNum', col: 'A', row: 1, caption: 'Sr. No.', alignment: 'center', field: '', bold: true, extra: false},
    {id: 'date', col: 'B', row: 1, caption: 'Date', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'time', col: 'C', row: 1, caption: 'Time', alignment: 'center', field: '', bold: true, extra: true},

    {id: 'city', col: 'D', row: 1, caption: 'City', alignment: '', field: '', bold: true, extra: true},
    {id: 'supplier', col: 'E', row: 1, caption: 'Supplier', alignment: '', field: '', bold: true, extra: true},
    {id: 'description', col: 'F', row: 1, caption: 'Description', alignment: '', field: '', bold: true, extra: true},

    {id: 'cost', col: 'G', row: 1, caption: 'Cost', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'gst', col: 'H', row: 1, caption: 'Gst', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'total', col: 'I', row: 1, caption: 'Total', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'margin', col: 'J', row: 1, caption: 'Margin(%)', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'quote', col: 'K', row: 1, caption: 'Quote', alignment: 'center', field: '', bold: true, extra: true},
    {id: 'forex', col: 'L', row: 1, caption: 'Forex', alignment: 'center', field: '', bold: true, extra: true},

  ];


  const columns = [

    {id: 'lineNum', col: 'A', title: '', alignment: 'center', field: 'LineNum', extra: false},
    {id: 'date', col: 'B', title: '', alignment: 'center', field: 'QuoDate', extra: false, dateformat: 'DD/MM/YYYY'},
    {id: 'time', col: 'C', title: '', alignment: 'center', field: 'QuoTime', extra: false, dateformat: 'HH:mm'},

    {id: 'city', col: 'D', title: '', alignment: '', field: 'city', extra: false},
    {id: 'supplier', col: 'E', title: '', alignment: '', field: 'Agent', extra: false},
    {id: 'description', col: 'F', title: '', alignment: '', field: 'QuoString', extra: false, wrapText: true},

    {id: 'cost', col: 'G', title: '', alignment: '', field: 'Cost', extra: false, numformat: '#,##0', printIfZero: false},
    {id: 'gst', col: 'H', title: '', alignment: '', field: 'Gst', extra: false, numformat: '#,##0', printIfZero: false},
    {id: 'total', col: 'I', title: '', alignment: '', field: 'Total', extra: false, numformat: '#,##0', printIfZero: false},
    {id: 'margin', col: 'J', title: '', alignment: 'center', field: 'Margin', extra: false, numformat: '#,##0', printIfZero: false},
    {id: 'quote', col: 'K', title: '', alignment: '', field: 'QuoteCost', extra: false, numformat: '#,##0', printIfZero: false},
    {id: 'forex', col: 'L', title: '', alignment: '', field: 'Forex', extra: false, numformat: '#,##0', printIfZero: false},
     
  ];

  rowNum = 1;

  let cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'Quotation for : ' + headerData[0].PaxName + ' (' + headerData[0].TourCode + ')';  
  cell.font = {...defaultFont, bold: true};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'No. of Travellers : ' + headerData[0].NumPax.toString();  
  cell.font = {...defaultFont};
  rowNum++;

  cell = worksheet.getCell('A'+rowNum.toString());
  cell.value = 'Currency : ' + headerData[0].CurrencyCode;  
  cell.font = {...defaultFont};
  rowNum++;

  if (detailsData.length > 0) {
    cell = worksheet.getCell('A'+rowNum.toString());
    cell.value = 'Exch Rate : ' + numberFormat(detailsData[0].ExchRate,2);  
    cell.font = {...defaultFont};
    rowNum++;  
  }
  
  rowNum ++;

  // Print all Header fields
  await printHeaderFields(fields, detailsData, worksheet);

  // set Borders
  let cellsForBorder = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  const borderCell = 'L';

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

  rowBorder = row;
  for (let i=0; i<cellsForBorder.length; i++) {
    const cell = worksheet.getCell(cellsForBorder[i] + rowBorder.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

  // Total 
  row += 1; 
  cell = worksheet.getCell('A' + row.toString());
  cell.value = 'Grand Total';
  cell.font = {...defaultFont, bold: true};

  let quote = detailsData.reduce((n, {QuoteCost}) => n + QuoteCost, 0);
  let forex = detailsData.reduce((n, {Forex}) => n + Forex, 0);

  const quoteCell = 'K';
  cell = worksheet.getCell(quoteCell + row.toString());
  cell.value = quote;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0';      
  cell.alignment = { horizontal: 'right' };      

  const forexCell = 'L';
  cell = worksheet.getCell(forexCell + row.toString());
  cell.value = forex;
  cell.font = {...defaultFont, bold: true};
  cell.numFmt = '#,##0';      
  cell.alignment = { horizontal: 'right' };      

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

//**********************************************************/
async function setTourOperatorGstLine (reportObj, detailsData) {

  if (detailsData.length === 0)
    return;

  // Add line for Tour Operator GST
  const tourDate = moment(reportObj.tourDate).format('MM/DD/YYYY');
  let query = "SELECT [dbo].[fn_GetServiceTaxPerc] ('" + tourDate + "', 28) AS TourOperatorGst";
  let tourOperatorGstArr = await dbGetRecordRaw({query: query});   
  let tourOperatorGst = 0;
  if (tourOperatorGstArr.length > 0 && tourOperatorGstArr[0].TourOperatorGst !== null) {
    tourOperatorGst = tourOperatorGstArr[0].TourOperatorGst;
  }

  let quote = detailsData.reduce((n, {QuoteCost}) => n + QuoteCost, 0);
  let forex = detailsData.reduce((n, {Forex}) => n + Forex, 0);

  const quoteGst = Math.round(quote * (tourOperatorGst/100));
  const forexGst = Math.round(forex * (tourOperatorGst/100));

  const description = 'Add: Tour Operator GST @ ' + tourOperatorGst.toString() + '%';

  const columns = Object.keys(detailsData[0]);
  let tourOperatorGstOj = columns.reduce((o, key) => ({ ...o, [key]: null}), {});
  tourOperatorGstOj = {...tourOperatorGstOj, QuoLines_id: -1,
      QuoteCost: quoteGst, Forex: forexGst, QuoString: description};

  detailsData.push(tourOperatorGstOj);

}

//**********************************************************/
async function setActivityAgent (detailsData) {

  let query = "";
  let organisationObj = null;
    
  // For start of new day, activity type 0, check if any other records exist. If none -> Day at Leisure
  for (let [idx, rec] of detailsData.entries()) {

    if (rec.TrsType === 1) {
      query = "SELECT a.Organisation FROM QuoTickets qt " + 
        "LEFT JOIN Addressbook a ON qt.AgentAddressbook_id = a.Addressbook_id " +
        "WHERE qt.QuoTickets_id = " + rec.QuoTickets_id.toString();        
    } else if (rec.TrsType === 2) {
      query = "SELECT a.Organisation FROM QuoAccommodation qa " + 
        "LEFT JOIN Addressbook a ON qa.HotelAddressbook_id = a.Addressbook_id " +
        "WHERE qa.QuoAccommodation_id = " + rec.QuoAccommodation_id.toString();        
    } else if (rec.TrsType === 3 || rec.TrsType === 4) {
      query = "SELECT a.Organisation FROM QuoServices qs " + 
        "LEFT JOIN Addressbook a ON qs.AgentAddressbook_id = a.Addressbook_id " +
        "WHERE qs.QuoServices_id = " + rec.QuoServices_id.toString();        
    } else if (rec.TrsType === 5) {
      query = "SELECT a.Organisation FROM QuoTickets qt " + 
        "LEFT JOIN Addressbook a ON qt.AgentAddressbook_id = a.Addressbook_id " +
        "WHERE qt.QuoTickets_id = " + rec.QuoTickets_id.toString();        

      organisationObj = await dbGetRecordRaw({query: query});   

      if (organisationObj.length > 0 && organisationObj[0].Organisation !== null) {
        query = "SELECT a.Organisation FROM QuoLines ql " + 
          "LEFT JOIN Addressbook a ON ql.CarHireAgents_id = a.Addressbook_id " +
          "WHERE ql.QuoLines_id = " + rec.QuoLines_id.toString();        

        organisationObj = await dbGetRecordRaw({query: query});   

      }

    }

    if (query.length > 0) {
      organisationObj = await dbGetRecordRaw({query: query});   
      if (organisationObj.length > 0 && organisationObj[0].Organisation !== null) {
        detailsData[idx].Agent = organisationObj[0].Organisation;          
      }
    }

  };

}
