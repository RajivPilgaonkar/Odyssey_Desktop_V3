import { numberFormat } from "../../../../../common/CommonTransactionFunctions";

import moment from 'moment';

//**********************************************************/
export async function exportTransferBreakup(reportObj, priceData, worksheet) {

  let cell = worksheet.getCell('A1');
  cell.value = 'Transfers';  
  cell.font = { name: 'Calibri', size: 14, bold: true };

  cell = worksheet.getCell('A3');
  cell.value = 'From: ' + reportObj.fromDate;  
  cell.font = { name: 'Calibri', size: 12, bold: true };

  cell = worksheet.getCell('A4');
  cell.value = 'Based on ' + reportObj.numPax.toString() + ' pax';  
  cell.font = { name: 'Calibri', size: 12, bold: true };

  if (priceData.length > 0) {
    cell = worksheet.getCell('Z4');
    cell.value = 'Tour Gst @ ' + numberFormat(priceData[0].TourOperatorGstPerc,2) + '%';  
    cell.font = { name: 'Calibri', size: 12, bold: true };  
  }

  const marginStr = (priceData.length > 0) ? '@ ' + priceData[0].MarginPerc.toString() + '%' : '';

  const columns = [
    {id: 'b1', col: 'A', title: '', width: 8, alignment: '', field: ''},
    {id: 'servicecity', col: 'B', title: 'Service City', width: 14, alignment: '', field: ''},
    {id: 'service', col: 'C', title: 'Service', width: 21, alignment: '', field: ''},
    {id: 'agent', col: 'D', title: (reportObj.id === 25) ? 'Agent' : 'Default Agent', width: 21, alignment: '', field: (reportObj.id === 25) ? 'Agent' : ''},
    {id: 'vehicle', col: 'E', title: 'Vehicle', width: 17, alignment: '', field: 'vehicle'},
    {id: 'numcars', col: 'F', title: 'Num Cars', width: 10, alignment: 'center', field: 'NumVehicles'},
    {id: 'wef', col: 'G', title: 'Wef', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wef'},
    {id: 'wet', col: 'H', title: 'Wet', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wet'},
    {id: 'b2', col: 'I', title: '', width: 3, alignment: '', field: ''},
    {id: 'cost', col: 'J', title: 'Cost', subtitle: reportObj.currencyCode, width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuoteCurr', field2: 'TotalCost', printIfZero: false},
    {id: 'b3', col: 'K', title: '', width: 3, alignment: '', field: ''},
    {id: 'b4', col: 'L', title: '', width: 3, alignment: '', field: ''},
    {id: 'misc', col: 'M', title: 'Misc', width: 9, numformat: '#,##0', alignment: 'right', field: 'MiscCost', printIfZero: false},
    {id: 'guide', col: 'N', title: 'Guide', width: 9, numformat: '#,##0', alignment: 'right', field: 'GuideCost', printIfZero: false},
    {id: 'entrance', col: 'O', title: 'Entrance', width: 9, numformat: '#,##0', alignment: 'right', field: 'EntranceFees', printIfZero: false},

    {id: 'carhire', col: 'P', title: 'Car Hire', width: 9, numformat: '#,##0', alignment: 'right', field: 'CarHireCost', printIfZero: false},
    {id: 'parking', col: 'Q', title: 'Parking', width: 9, numformat: '#,##0', alignment: 'right', field: 'ParkingCost', printIfZero: false},
    {id: 'roadtax', col: 'R', title: 'Road Tax', width: 9, numformat: '#,##0', alignment: 'right', field: 'RoadTax', printIfZero: false},
    {id: 'meetassist', col: 'S', title: 'Meet & Assist', width: 9, numformat: '#,##0', alignment: 'right', field: 'MeetAssistCost', printIfZero: false},
    {id: 'entryap', col: 'T', title: 'Entry A/P', width: 9, numformat: '#,##0', alignment: 'right', field: 'EntryApCost', printIfZero: false},
    {id: 'vendorgst', col: 'U', title: 'Vendor GST', width: 9, numformat: '#,##0', alignment: 'right', field: 'VendorGst', printIfZero: false},
    {id: 'total', col: 'V', title: 'Total', width: 9, numformat: '#,##0', alignment: 'right', field: 'TotalCost', printIfZero: false},
    {id: 'margin', col: 'W', title: 'Margin', subtitle: marginStr, width: 9, numformat: '#,##0', alignment: 'right', field: 'Margin', field2: '', printIfZero: false},
    {id: 'quote', col: 'X', title: 'Quote', width: 9, numformat: '#,##0', alignment: 'right', field: 'Quote', field2: '', printIfZero: false},
    {id: 'b5', col: 'Y', title: '', width: 3, alignment: '', field: ''},
    {id: 'quotegst', col: 'Z', title: 'Quote incl. GST', subtitle: 'INR', width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuote', field2: '', printIfZero: false},

  ];

  const colorBands = [
    {cols: ['J','Z'], color: 'FDE9D9'},
    {cols: ['M','X'], color: 'E4DFEC'},
    {cols: ['N','U','W'], color: 'EBF1DE'},
    {cols: ['O','V',], color: 'DAEEF3'},
    {cols: ['P','Q','R','S','T'], color: 'F2DCDB'},
  ];

  /*=== Title ====*/
  let row = 6;
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
  let prevServices_id = -1;

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

    // new service
    if (pData[j].Services_id !== prevServices_id) {

      row++;

      cell = worksheet.getCell('C' + row.toString());
      cell.value = pData[j].AgentService;  
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
        xfield = (reportObj.id === 22) ? columns[i].field2 : columns[i].field;
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
    prevServices_id = pData[j].Services_id;
  
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
  if (reportObj.id === 22) {
    for (i=0; i<columns.length; i++) {
      if ((columns[i].field2 !== undefined) && (columns[i].field2 === '')) {
        worksheet.getColumn(i+1).hidden = true;
      }
    }  
  }

}
