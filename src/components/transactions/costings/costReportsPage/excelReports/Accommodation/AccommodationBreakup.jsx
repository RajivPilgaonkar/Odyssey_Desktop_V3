import { numberFormat } from "../../../../../common/CommonTransactionFunctions";

import moment from 'moment';

//**********************************************************/
export async function exportAccommodationBreakup(reportObj, priceData, worksheet) {

  let cell = worksheet.getCell('A3');
  cell.value = 'From: ' + reportObj.fromDate;  
  cell.font = { name: 'Calibri', size: 12, bold: true };

  if (priceData.length > 0) {
    cell = worksheet.getCell('BA3');
    cell.value = 'Tour Gst @ ' + numberFormat(priceData[0].TourGstPerc,2) + '%';  
    cell.font = { name: 'Calibri', size: 12, bold: true };  
  }

  const columns = [
    {id: 'b1', col: 'A', title: '', width: 8, alignment: '', field: 'Old'},
    {id: 'b2', col: 'B', title: '', subtitle: '', width: 17, alignment: '', field: ''},
    {id: 'category', col: 'C', title: 'Category', width: 17, alignment: '', field: ''},
    {id: 'rank', col: 'D', title: 'Rank', width: 7, alignment: 'center', field: ''},
    {id: 'hotel', col: 'E', title: 'Hotel', width: 26, alignment: '', field: ''},
    {id: 'fromdate', col: 'F', title: 'From Date', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'FromDate'},
    {id: 'todate', col: 'G', title: 'To Date', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'ToDate'},
    {id: 'ac', col: 'H', title: 'AC', width: 4, alignment: 'center', field: 'AC'},
    {id: 'roomtype', col: 'I', title: 'Room Type', width: 15, alignment: '', field: 'roomtype'},
    {id: 'mp', col: 'J', title: 'MP', width: 8, alignment: '', field: 'MealPlan'},
    {id: 'single', col: 'K', title: 'Single', subtitle: reportObj.currencyCode, width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleQuoteCurr', field2: 'SingleTotal', printIfZero: false},
    {id: 'double', col: 'L', title: 'Double', subtitle: reportObj.currencyCode, width: 8, numformat: '#,##0', alignment: 'right', field: 'DoubleQuoteCurr', field2: 'DoubleTotal', printIfZero: false},
    {id: 'triple', col: 'M', title: 'Triple', subtitle: reportObj.currencyCode, width: 8, numformat: '#,##0', alignment: 'right', field: 'TripleQuoteCurr', field2: 'TripleTotal', printIfZero: false},
    {id: 'b3', col: 'N', title: '', width: 3.5, alignment: '', field: ''},
    {id: 'b4', col: 'O', title: '', width: 3.5, alignment: '', field: ''},
    {id: 'single1', col: 'P', title: 'Single', width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleRate', printIfZero: false},
    {id: 'b5', col: 'Q', title: '', subtitle: 'TAC', width: 8, numformat: '#,##0', alignment: '', field: 'SingleTAC', printIfZero: false},
    {id: 'b6', col: 'R', title: '', subtitle: 'SC', width: 8, numformat: '#,##0', alignment: '', field: 'SingleSC', printIfZero: false},
    {id: 'b7', col: 'S', title: '', subtitle: 'GST (%)', width: 8, numformat: '#,##0', alignment: '', field: 'SingleGstPerc', printIfZero: false},
    {id: 'b8', col: 'T', title: '', subtitle: 'GST', width: 8, numformat: '#,##0', alignment: '', field: 'SingleGst', printIfZero: false},
    {id: 'double1', col: 'U', title: 'Double', width: 8, numformat: '#,##0', alignment: 'right', field: 'DoubleRate', printIfZero: false},
    {id: 'b9', col: 'V', title: '', subtitle: 'TAC', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleTAC', printIfZero: false},
    {id: 'b10', col: 'W', title: '', subtitle: 'SC', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleSC', printIfZero: false},
    {id: 'b11', col: 'X', title: '', subtitle: 'GST (%)', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleGstPerc', printIfZero: false},
    {id: 'b12', col: 'Y', title: '', subtitle: 'GST', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleGst', printIfZero: false},
    {id: 'triple1', col: 'Z', title: 'Triple', width: 8, numformat: '#,##0', alignment: 'right', field: 'TripleRate', printIfZero: false},
    {id: 'b13', col: 'AA', title: '', subtitle: 'TAC', width: 8, numformat: '#,##0', alignment: '', field: 'TripleTAC', printIfZero: false},
    {id: 'b14', col: 'AB', title: '', subtitle: 'SC', width: 8, numformat: '#,##0', alignment: '', field: 'TripleSC', printIfZero: false},
    {id: 'b15', col: 'AC', title: '', subtitle: 'GST (%)', width: 8, numformat: '#,##0', alignment: '', field: 'TripleGstPerc', printIfZero: false},
    {id: 'b16', col: 'AD', title: '', subtitle: 'GST', width: 8, numformat: '#,##0', alignment: '', field: 'TripleGst', printIfZero: false},
    {id: 'nett', col: 'AE', title: 'Nett', width: 8, alignment: 'center', field: 'Nett'},
    {id: 'mealcost', col: 'AF', title: 'Meal Cost', width: 8, numformat: '#,##0', alignment: 'right', field: 'MealRate', printIfZero: false},
    {id: 'b17', col: 'AG', title: '', subtitle: 'TAC', width: 8, numformat: '#,##0', alignment: '', field: 'MealTAC', printIfZero: false},
    {id: 'b18', col: 'AH', title: '', subtitle: 'SC', width: 8, numformat: '#,##0', alignment: '', field: 'MealSC', printIfZero: false},
    {id: 'b19', col: 'AI', title: '', subtitle: 'GST', width: 8, numformat: '#,##0', alignment: '', field: 'MealGst', printIfZero: false},
    {id: 'extrameals', col: 'AJ', title: 'Extra Meals (Extra Bed)', width: 8, numformat: '#,##0', alignment: 'right', field: 'MealEbRate', printIfZero: false},
    {id: 'b20', col: 'AK', title: '', subtitle: 'TAC', width: 8, numformat: '#,##0', alignment: '', field: 'MealEbTAC', printIfZero: false},
    {id: 'b21', col: 'AL', title: '', subtitle: 'SC', width: 8, numformat: '#,##0', alignment: '', field: 'MealEbSC', printIfZero: false},
    {id: 'b22', col: 'AM', title: '', subtitle: 'GST', width: 8, numformat: '#,##0', alignment: '', field: 'MealEbGst', printIfZero: false},
    {id: 'agentgst', col: 'AN', title: 'Agent (GST)', subtitle: 'Single', width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleAgentComm', printIfZero: false},
    {id: 'b24', col: 'AO', title: '', subtitle: 'Double', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleAgentComm', printIfZero: false},
    {id: 'b25', col: 'AP', title: '', subtitle: 'Triple', width: 8, numformat: '#,##0', alignment: '', field: 'TripleAgentComm', printIfZero: false},
    {id: 'total', col: 'AQ', title: 'Total', subtitle: 'Single', width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleTotal', printIfZero: false},
    {id: 'b26', col: 'AR', title: '', subtitle: 'Double', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleTotal', printIfZero: false},
    {id: 'b27', col: 'AS', title: '', subtitle: 'Triple', width: 8, numformat: '#,##0', alignment: '', field: 'TripleTotal', printIfZero: false},
    {id: 'margin', col: 'AT', title: 'Margin (%)', subtitle: 'Single', width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleMarginPerc', field2: '', printIfZero: false},
    {id: 'b28', col: 'AU', title: '', subtitle: 'Double', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleMarginPerc', field2: '', printIfZero: false},
    {id: 'b29', col: 'AV', title: '', subtitle: 'Triple', width: 8, numformat: '#,##0', alignment: '', field: 'TripleMarginPerc', field2: '', printIfZero: false},
    {id: 'quote', col: 'AW', title: 'Quote', subtitle: 'Single', width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleTotalWithMargin', field2: '', printIfZero: false},
    {id: 'b30', col: 'AX', title: '', subtitle: 'Double', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleTotalWithMargin', field2: '', printIfZero: false},
    {id: 'b31', col: 'AY', title: '', subtitle: 'Triple', width: 8, numformat: '#,##0', alignment: '', field: 'TripleTotalWithMargin', field2: '', printIfZero: false},
    {id: 'b32', col: 'AZ', title: '', width: 4, alignment: '', field: '', field2: ''},
    {id: 'quotegst', col: 'BA', title: 'Quote GST', subtitle: 'Single', width: 8, numformat: '#,##0', alignment: 'right', field: 'SingleQuote', field2: '', printIfZero: false},
    {id: 'b33', col: 'BB', title: '', subtitle: 'Double', width: 8, numformat: '#,##0', alignment: '', field: 'DoubleQuote', field2: '', printIfZero: false},
    {id: 'b34', col: 'BC', title: '', subtitle: 'Triple', width: 8, numformat: '#,##0', alignment: '', field: 'TripleQuote', field2: '', printIfZero: false},

  ];

  const colorBands = [
    {cols: ['K','L','M','BA','BB','BC'], color: 'FDE9D9'},
    {cols: ['P','Q','R','S','T','AF','AG','AH','AI','AQ','AR','AS'], color: 'DAEEF3'},
    {cols: ['U','V','W','X','Y','AJ','AK','AL','AM','AT','AU','AV'], color: 'EBF1DE'},
    {cols: ['Z','AA','AB','AC','AD','AN','AO','AP','AW','AX','AY'], color: 'E4DFEC'},
    {cols: ['AE'], color: 'B8CCE4'},
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
  let prevCities_id = -1;
  let prevRoomType = '';
  let prevAddressbook_id = -1;

  for (var j=0; j<pData.length; j++) {

    // new state
    if (pData[j].States_id !== prevStates_id) {
      if (prevStates_id !== -1) {
        row += 2;
      }
      cell = worksheet.getCell('A' + row.toString());
      cell.value = pData[j].state;  
      cell.font = { name: 'Calibri', size: 14, bold: true };    
      row++;
    }

    // new city
    if (pData[j].Cities_id !== prevCities_id) {
      if (pData[j].States_id === prevStates_id) {
        row += 2;
      }
      cell = worksheet.getCell('B' + row.toString());
      cell.value = pData[j].city;  
      cell.font = { name: 'Calibri', size: 12, bold: true };    
    }

    // room type
    if ((pData[j].roomtype !== prevRoomType || pData[j].Addressbook_id !== prevAddressbook_id) && (pData[j].Cities_id === prevCities_id)) {
      row ++;
    }

    // new organisaion
    if (pData[j].Addressbook_id !== prevAddressbook_id) {
      cell = worksheet.getCell('C' + row.toString());
      cell.value = pData[j].Category;  
      cell.font = { name: 'Calibri', size: 12 };    

      cell = worksheet.getCell('D' + row.toString());
      cell.value = pData[j].Ranking;  
      cell.font = { name: 'Calibri', size: 12 };    
      cell.alignment = { horizontal: 'center' };      

      cell = worksheet.getCell('E' + row.toString());
      cell.value = pData[j].organisation;  
      cell.font = { name: 'Calibri', size: 12 };    
    }


    // write costing data
    for (i=0; i<columns.length; i++) {

      // depending on with margin or without margin
      let xfield = columns[i].field;
      if (columns[i].field2 !== undefined) {
        xfield = (reportObj.id === 2) ? columns[i].field2 : columns[i].field;
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
          if (columns[i].dateformat !== undefined) {
            cell.value = moment(pData[j][xfield]).format(columns[i].dateformat);
          }    
        }
      }
    }

    row++;

    prevCities_id = pData[j].Cities_id;
    prevStates_id = pData[j].States_id;
    prevRoomType = pData[j].roomtype;
    prevAddressbook_id = pData[j].Addressbook_id;
  
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
  if (reportObj.id === 2) {
    for (i=0; i<columns.length; i++) {
      if ((columns[i].field2 !== undefined) && (columns[i].field2 === '')) {
        worksheet.getColumn(i+1).hidden = true;
      }
    }  
  }

}
