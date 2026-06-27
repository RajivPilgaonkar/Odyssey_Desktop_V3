import moment from 'moment';

//**********************************************************/
export async function exportAccommodationOneToTen(reportObj, priceData, worksheet) {

  let cell = worksheet.getCell('A3');
  cell.value = 'From: ' + reportObj.fromDate;  
  cell.font = { name: 'Calibri', size: 12, bold: true };

  const columns = [
    {id: 'b1', col: 'A', title: '', width: 8, alignment: '', field: 'Old'},
    {id: 'b2', col: 'B', title: '', width: 17, alignment: '', field: ''},
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

    {id: 'n1', col: 'P', toCol: 'Y', title: 'Cost Per Pax', subtitle: '1', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=K{rowNo}'},
    {id: 'n2', col: 'Q', title: '', subtitle: '2', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=L{rowNo}/2'},
    {id: 'n3', col: 'R', title: '', subtitle: '3', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=(K{rowNo}+L{rowNo})/3'},
    {id: 'n4', col: 'S', title: '', subtitle: '4', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=L{rowNo}/2'},
    {id: 'n5', col: 'T', title: '', subtitle: '5', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=(K{rowNo}+2*L{rowNo})/5'},
    {id: 'n6', col: 'U', title: '', subtitle: '6', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=L{rowNo}/2'},
    {id: 'n7', col: 'V', title: '', subtitle: '7', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=(K{rowNo}+3*L{rowNo})/7'},
    {id: 'n8', col: 'W', title: '', subtitle: '8', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=L{rowNo}/2'},
    {id: 'n9', col: 'X', title: '', subtitle: '9', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=(K{rowNo}+4*L{rowNo})/9'},
    {id: 'n10', col: 'Y', title: '', subtitle: '10', width: 9, numformat: '#,##0', alignment: 'right', field: '', formula: '=L{rowNo}/2'},

  ];

  const colorBands = [
    {cols: ['K','L','M','T','Y'], color: 'FDE9D9'},
    {cols: ['P','U'], color: 'DAEEF3'},
    {cols: ['Q','V'], color: 'F2DCDB'},
    {cols: ['R','W'], color: 'EBF1DE'},
    {cols: ['S','X'], color: 'E4DFEC'},
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
      if (columns[i].toCol !== undefined) {
        worksheet.mergeCells(columns[i].col + row.toString() + ":" + columns[i].toCol + row.toString());        
        cell.alignment = { horizontal: 'center' };      
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
      cell.border = {top: {style: 'thin'} };      
    }
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
    if ((pData[j].roomtype !== prevRoomType) && (pData[j].Cities_id === prevCities_id)) {
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
      let formula = (columns[i].formula !== undefined) ? columns[i].formula : '';
      formula = formula.replaceAll('{rowNo}',row.toString());

      let show = false;
      if (formula > '') {
        show = true;
      // non-numeric  
      } else if ((xfield > '') && (pData[j][xfield] !== null) && (columns[i].numformat === undefined)) {
        show = true;
      // non-numeric  
      } else if ((xfield > '') && (pData[j][xfield] !== null) && (pData[j][xfield] > 0)) {
        show = true;
      } else if ((xfield > '') && (pData[j][xfield] !== null) && (columns[i].printIfZero !== undefined) && (columns[i].printIfZero)) {
        show = true;
      }

      if (show) {
        cell = worksheet.getCell(columns[i].col + row.toString());

        if (formula > '') {
          cell.value = { formula: formula };
        } else {
          cell.value = pData[j][xfield];  
        }
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

}
