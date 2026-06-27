import { numberFormat } from "../../../../../common/CommonTransactionFunctions";

import moment from 'moment';

//**********************************************************/
export async function exportCarPerKmBreakup(reportObj, priceData, worksheet) {

  let cell = worksheet.getCell('A1');
  cell.value = 'Car Per Km';  
  cell.font = { name: 'Calibri', size: 14, bold: true };

  cell = worksheet.getCell('A3');
  cell.value = 'From: ' + reportObj.fromDate;  
  cell.font = { name: 'Calibri', size: 12, bold: true };

 // cell = worksheet.getCell('A4');
 // cell.value = 'Based on ' + reportObj.numPax.toString() + ' pax';  
 // cell.font = { name: 'Calibri', size: 12, bold: true };

  if (priceData.length > 0) {
    cell = worksheet.getCell('X4');
    cell.value = 'Tour Gst @ ' + numberFormat(priceData[0].TourOperatorGstPerc,2) + '%';  
    cell.font = { name: 'Calibri', size: 12, bold: true };  
  }

  const marginStr = (priceData.length > 0) ? '@ ' + priceData[0].MarginPerc.toString() + '%' : '';

  const columns = [
    {id: 'b1', col: 'A', title: '', width: 8, alignment: '', field: ''},
    {id: 'servicecity', col: 'B', title: 'Service City', width: 14, alignment: '', field: ''},
    {id: 'agent', col: 'C', title: 'Agent', width: 21, alignment: '', field: ''},
    {id: 'vehicle', col: 'D', title: 'Vehicle', width: 17, alignment: '', field: 'vehicle'},
    {id: 'maxpax', col: 'E', title: 'Max Pax', width: 10, alignment: 'center', field: 'ToPax'},
    {id: 'wef', col: 'F', title: 'Wef', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wef'},
    {id: 'wet', col: 'G', title: 'Wet', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wet'},

    {id: 'b2', col: 'H', title: '', width: 3, alignment: '', field: ''},

    {id: 'cost', col: 'I', title: 'Cost', subtitle: reportObj.currencyCode, width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuoteCurr', field2: 'TotalCost', printIfZero: false},

    {id: 'b3', col: 'J', title: '', width: 3, alignment: '', field: ''},
    {id: 'b4', col: 'K', title: '', width: 3, alignment: '', field: ''},

    {id: 'rateperkm', col: 'L', title: 'Rate Per Km', width: 9, numformat: '#,##0', alignment: 'right', field: 'CostPerKm', printIfZero: false},
    {id: 'minkm', col: 'M', title: 'Min Km', width: 9, numformat: '#,##0', alignment: 'right', field: 'MinKm', printIfZero: false},
    {id: 'hirecost', col: 'N', title: 'Hire Cost', width: 9, numformat: '#,##0', alignment: 'right', field: 'CarHireCost', printIfZero: false},

    {id: 'nighthalt', col: 'O', title: 'Night Halt', width: 9, numformat: '#,##0', alignment: 'right', field: 'NightHaltCost', printIfZero: false},
    {id: 'tolltax', col: 'P', title: 'Toll Tax', width: 9, numformat: '#,##0', alignment: 'right', field: 'TollTax', printIfZero: false},
    {id: 'escort', col: 'Q', title: 'Escort', width: 9, numformat: '#,##0', alignment: 'right', field: 'EscortCost', printIfZero: false},
    {id: 'comm', col: 'R', title: 'Commission', width: 9, numformat: '#,##0', alignment: 'right', field: 'Commission', printIfZero: false},
    {id: 'vendorgst', col: 'S', title: 'GST', width: 9, numformat: '#,##0', alignment: 'right', field: 'VendorGst', printIfZero: false},
    {id: 'total', col: 'T', title: 'Total', width: 9, numformat: '#,##0', alignment: 'right', field: 'TotalCost', printIfZero: false},
    {id: 'margin', col: 'U', title: 'Margin', subtitle: marginStr, width: 9, numformat: '#,##0', alignment: 'right', field: 'Margin', field2: '', printIfZero: false},
    {id: 'quote', col: 'V', title: 'Quote', width: 9, numformat: '#,##0', alignment: 'right', field: 'Quote', field2: '', printIfZero: false},
    {id: 'b5', col: 'W', title: '', width: 3, alignment: '', field: ''},
    {id: 'quotegst', col: 'X', title: 'Quote incl. GST', subtitle: 'INR', width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuote', field2: '', printIfZero: false},

  ];

  const colorBands = [
    {cols: ['I','X'], color: 'FDE9D9'},
    {cols: ['L','M','V'], color: 'E4DFEC'},
    {cols: ['N','O','P','Q','R','T'], color: 'EBF1DE'},
    {cols: ['S','U',], color: 'DAEEF3'},
  ];

  /*=== Title ====*/
  let row = 5;
  for (var i=0; i<columns.length; i++) {
    worksheet.getColumn(i+1).width = columns[i].width;
    if (columns[i].title > '') {
      cell = worksheet.getCell(columns[i].col + row.toString());
      cell.value = columns[i].title;  
      cell.width = columns[i].width;  
      cell.font = { name: 'Calibri', size: 12, bold: true };    
      if (columns[i].alignment === 'center') {
        cell.alignment = { horizontal: columns[i].alignment };      
      }
    }
  }

  /*=== Sub-Title ====*/
  row++;
  for (i=0; i<columns.length; i++) {
    if (columns[i].subtitle !== undefined) {
      cell = worksheet.getCell(columns[i].col + row.toString());
      cell.value = columns[i].subtitle;  
      cell.font = { name: 'Calibri', size: 10 };    
      cell.alignment = { horizontal: 'right' };      
    }
    cell = worksheet.getCell(columns[i].col + row.toString());
    cell.border = {bottom: {style: 'thin'} };      
  }

  row+=2;

  const startDataRow = row;
  let endDataRow = row;

  const pData = priceData;

  let prevStates_id = -1;
  let prevServiceCities_id = -1;
  let prevAgents_id = -1;

  for (var j=0; j<pData.length; j++) {

    // new state
    if (pData[j].States_id !== prevStates_id) {
      if (prevStates_id !== -1) {
        row += 2;
      }
      cell = worksheet.getCell('A' + row.toString());
      cell.value = pData[j].State;  
      cell.font = { name: 'Calibri', size: 14, bold: true };    
      row++;
    }

    // new city
    if (pData[j].ServiceCities_id !== prevServiceCities_id) {
      if (pData[j].States_id === prevStates_id) {
        row += 2;
      }
      cell = worksheet.getCell('B' + row.toString());
      cell.value = pData[j].ServiceCity;  
      cell.font = { name: 'Calibri', size: 12, bold: true };    
    }

    // new agent
    if (pData[j].Agents_id !== prevAgents_id || pData[j].ServiceCities_id !== prevServiceCities_id) {
      cell = worksheet.getCell('C' + row.toString());
      cell.value = pData[j].Agent;  
      cell.font = { name: 'Calibri', size: 12 };    

      cell = worksheet.getCell('D' + row.toString());
      cell.value = pData[j].Agent;  
      cell.font = { name: 'Calibri', size: 12 };    

    }


    // write costing data
    for (i=0; i<columns.length; i++) {

      // depending on with margin or without margin
      let xfield = columns[i].field;
      if (columns[i].field2 !== undefined) {
        xfield = (reportObj.id === 42) ? columns[i].field2 : columns[i].field;
      }

      if ((pData[j][xfield] !== undefined) && (xfield.length > '')) {
        cell = worksheet.getCell(columns[i].col + row.toString());
        if ((columns[i].printIfZero === undefined) || (columns[i].printIfZero) || ((pData[j][xfield] !== null) && (pData[j][xfield] > 0))) {
          cell.value = pData[j][xfield];  
          cell.font = { name: 'Calibri', size: 12 };    
          if (columns[i].alignment === 'center') {
            cell.alignment = { horizontal: columns[i].alignment };      
          }  
          if (columns[i].numformat !== undefined) {
            cell.numFmt = columns[i].numformat;      
          }    
          if ((columns[i].dateformat !== undefined) && (pData[j][xfield] !== null)) {
            cell.value = moment(pData[j][xfield]).format(columns[i].dateformat);
          }    
        }
      }
    }

    row++;

    prevServiceCities_id = pData[j].ServiceCities_id;
    prevStates_id = pData[j].States_id;
    prevAgents_id = pData[j].Agents_id;
  
  }

  endDataRow = row;

  /*=== Color cells ====*/  
  for (i=0; i<colorBands.length; i++) {
    for (j=0; j<colorBands[i].cols.length; j++) {
      for (var k=startDataRow; k<=endDataRow; k++) {
        cell = worksheet.getCell(colorBands[i].cols[j] + k.toString());
        cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: colorBands[i].color }};
      }
    }      
  }

  /*=== Title ====*/
  if (reportObj.id === 42) {
    for (i=0; i<columns.length; i++) {
      if ((columns[i].field2 !== undefined) && (columns[i].field2 === '')) {
        worksheet.getColumn(i+1).hidden = true;
      }
    }  
  }

}
