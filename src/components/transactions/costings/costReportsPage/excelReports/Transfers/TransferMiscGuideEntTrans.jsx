import { numberFormat } from "../../../../../common/CommonTransactionFunctions";

import moment from 'moment';

//**********************************************************/
export async function exportSightseeingMiscGuideEntTrans(reportObj, priceData, worksheet, worksheetName, worksheetIndex) {

  let cell = worksheet.getCell('A1');
  cell.value = worksheetName;  
  cell.font = { name: 'Calibri', size: 14, bold: true };

  cell = worksheet.getCell('A3');
  cell.value = 'From: ' + reportObj.fromDate;  
  cell.font = { name: 'Calibri', size: 12, bold: true };

  //cell = worksheet.getCell('A4');
  //cell.value = 'Based on ' + reportObj.numPax.toString() + ' pax';  
  //cell.font = { name: 'Calibri', size: 12, bold: true };

  if (priceData.length > 0) {
    cell = worksheet.getCell('AC4');
    cell.value = 'Tour Gst @ ' + numberFormat(priceData[0].TourOperatorGstPerc,2) + '%';  
    cell.font = { name: 'Calibri', size: 12, bold: true };  
  }

  const marginStr = (priceData.length > 0) ? '@ ' + priceData[0].MarginPerc.toString() + '%' : '';

  const columns = [
    {id: 'b1', col: 'A', title: '', width: 8, alignment: '', field: ''},
    {id: 'servicecity', col: 'B', title: 'Service City', width: 14, alignment: '', field: ''},
    {id: 'service', col: 'C', title: 'Service', width: 21, alignment: '', field: ''},
    {id: 'agent', col: 'D', title: 'Default Agent', width: 21, alignment: '', field: ''},
    {id: 'remarks', col: 'E', title: 'Remarks', width: 21, alignment: '', field: 'remarks', worksheets: '0,1,2'},
    {id: 'resident', col: 'F', title: 'Resident', width: 21, alignment: '', field: 'Resident', worksheets: '0,1,2'},
    {id: 'type', col: 'G', title: 'Type', width: 21, alignment: '', field: 'MiscType', worksheets: '0,1,2'},
    {id: 'vehicle', col: 'H', title: 'Vehicle', width: 21, alignment: '', field: 'Vehicle', worksheets: '3'},

    {id: 'wef', col: 'I', title: 'Wef', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wef'},
    {id: 'wet', col: 'J', title: 'Wet', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wet'},

    {id: 'frompax', col: 'K', title: 'From Pax', width: 9, numformat: '#,##0', alignment: 'center', field: 'FromPax'},
    {id: 'topax', col: 'L', title: 'To Pax', width: 9, numformat: '#,##0', alignment: 'center', field: 'ToPax'},

    {id: 'b2', col: 'M', title: '', width: 3, alignment: '', field: ''},
    {id: 'finalquotecurr', col: 'N', title: 'Cost', subtitle: reportObj.currencyCode, width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuoteCurr', printIfZero: false},
    {id: 'b3', col: 'O', title: '', width: 3, alignment: '', field: ''},

    {id: 'misccost', col: 'P', title: 'Misc', width: 9, numformat: '#,##0', alignment: 'right', field: 'MiscCost', printIfZero: false, worksheets: '0'},
    {id: 'guidecost', col: 'Q', title: 'Guide', width: 9, numformat: '#,##0', alignment: 'right', field: 'GuideCost', printIfZero: false, worksheets: '1'},
    {id: 'entcost', col: 'R', title: 'Entrance', width: 9, numformat: '#,##0', alignment: 'right', field: 'EntranceFees', printIfZero: false, worksheets: '2'},
    {id: 'carhirecost', col: 'S', title: 'Car Hire', width: 9, numformat: '#,##0', alignment: 'right', field: 'CarHireCost', printIfZero: false, worksheets: '3'},
    {id: 'parking', col: 'T', title: 'Parking', width: 9, numformat: '#,##0', alignment: 'right', field: 'ParkingCost', printIfZero: false, worksheets: '3'},
    {id: 'roadtax', col: 'U', title: 'Road Tax', width: 9, numformat: '#,##0', alignment: 'right', field: 'MiscCost', printIfZero: false, worksheets: '3'},
    {id: 'meetassistcost', col: 'V', title: 'Meeet & Assist', width: 9, numformat: '#,##0', alignment: 'right', field: 'MeetAssistCost', printIfZero: false, worksheets: '3'},
    {id: 'entryapcost', col: 'W', title: 'Entry A/P', width: 9, numformat: '#,##0', alignment: 'right', field: 'EntryApCost', printIfZero: false, worksheets: '3'},
    {id: 'vendorgst', col: 'X', title: 'Vendor GST', width: 9, numformat: '#,##0', alignment: 'right', field: 'VendorGst', printIfZero: false},
    {id: 'totalcost', col: 'Y', title: 'Total', width: 9, numformat: '#,##0', alignment: 'right', field: 'TotalCost', printIfZero: false},
    {id: 'margin', col: 'Z', title: 'Margin', subtitle: marginStr, width: 9, numformat: '#,##0', alignment: 'right', field: 'Margin', printIfZero: false},
    {id: 'quote', col: 'AA', title: 'Quote', width: 9, numformat: '#,##0', alignment: 'right', field: 'Quote', printIfZero: false},

    {id: 'b3', col: 'AB', title: '', width: 3, alignment: '', field: ''},

    {id: 'finalquote', col: 'AC', title: 'Quote with GST', subtitle: 'INR', width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuote', printIfZero: false},

  ];

  const colorBands = [
    {cols: ['N','AC'], color: 'FDE9D9'},
    {cols: ['P','Q','R','S','T','U','V','W','AA'], color: 'E4DFEC'},
    {cols: ['X'], color: 'EBF1DE'},
    {cols: ['Y',], color: 'DAEEF3'},
    {cols: ['Z'], color: 'F2DCDB'},
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
  for (var i=0; i<columns.length; i++) {
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
      cell = worksheet.getCell('C' + row.toString());
      cell.value = pData[j].AgentService;  
      cell.font = { name: 'Calibri', size: 12 };    

      cell = worksheet.getCell('D' + row.toString());
      cell.value = pData[j].Agent;  
      cell.font = { name: 'Calibri', size: 12 };    
    }

    // write costing data
    for (var i=0; i<columns.length; i++) {

      // depending on with margin or without margin
      let xfield = columns[i].field;

      let show = true;
      if ((columns[i].worksheets !== undefined) && (!columns[i].worksheets.includes(worksheetIndex.toString()))) {
        show = false;
      }

      if ((show) && (pData[j][xfield] !== undefined) && (xfield.length > '')) {
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
  for (var i=0; i<colorBands.length; i++) {
    for (var j=0; j<colorBands[i].cols.length; j++) {
      for (var k=startDataRow; k<=endDataRow; k++) {
        cell = worksheet.getCell(colorBands[i].cols[j] + k.toString());
        cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: colorBands[i].color }};
      }
    }      
  }

  /*=== Hide columns ====*/
  for (var i=0; i<columns.length; i++) {
    if ((columns[i].worksheets !== undefined) && (!columns[i].worksheets.includes(worksheetIndex.toString()))) {
      worksheet.getColumn(i+1).hidden = true;
    }
  }  

}
