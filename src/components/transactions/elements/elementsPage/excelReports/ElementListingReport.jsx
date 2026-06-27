
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Calibri', size: 11};

//**********************************************************/
export async function exportElementListingReport(mainData, worksheet) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 60}, {col: 'B', colIndex: 1, width: 8},
    {col: 'C', colIndex: 2, width: 8}, {col: 'D', colIndex: 3, width: 8}, {col: 'E', colIndex: 4, width: 8},
    {col: 'F', colIndex: 5, width: 8}, {col: 'G', colIndex: 6, width: 8}, {col: 'H', colIndex: 7, width: 8},
    {col: 'I', colIndex: 8, width: 8}, {col: 'J', colIndex: 10, width: 8}, {col: 'K', colIndex: 10, width: 8},
    {col: 'L', colIndex: 10, width: 8}, {col: 'M', colIndex: 10, width: 8}, {col: 'N', colIndex: 10, width: 8},
    {col: 'O', colIndex: 10, width: 8}
  ];

  rowNum = 1;
  
  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
      worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
  }      

  await reportBody(mainData, worksheet);

  rowNum += 2;

}

//**********************************************************/
export async function reportBody(mainData, worksheet) {

  const fields = [
    {id: 'TravelElement', col: 'A', row: 0, caption: 'Travel Element', alignment: '', field: '', bold: true, type: 1},
    {id: 'DayIn', col: 'B', row: 0, caption: 'Day In', alignment: 'center', field: '', bold: true, type: 1},
    {id: 'DayOut', col: 'C', row: 0, caption: 'Day Out', alignment: 'center', field: '', bold: true, type: 1},
    {id: 'Blank', col: 'D', row: 0, caption: '', alignment: '', field: '', bold: true, type: 1},
    {id: 'Nights', col: 'E', row: 0, caption: 'Nights', alignment: 'center', field: '', bold: true, type: 1},
    {id: '1', col: 'F', row: 0, caption: '1', alignment: 'right', field: '', bold: true, type: 2},
    {id: '2', col: 'G', row: 0, caption: '2', alignment: 'right', field: '', bold: true, type: 2},
    {id: '3', col: 'H', row: 0, caption: '3', alignment: 'right', field: '', bold: true, type: 2},
    {id: '4', col: 'I', row: 0, caption: '4', alignment: 'right', field: '', bold: true, type: 2},
    {id: '5', col: 'J', row: 0, caption: '5', alignment: 'right', field: '', bold: true, type: 2},
    {id: '6', col: 'K', row: 0, caption: '6', alignment: 'right', field: '', bold: true, type: 2},
    {id: '7', col: 'L', row: 0, caption: '7', alignment: 'right', field: '', bold: true, type: 2},
    {id: '8', col: 'M', row: 0, caption: '8', alignment: 'right', field: '', bold: true, type: 2},
    {id: '9', col: 'N', row: 0, caption: '9', alignment: 'right', field: '', bold: true, type: 2},
    {id: '10', col: 'O', row: 0, caption: '10', alignment: 'right', field: '', bold: true, type: 2},
  ];

  const columns = [
    {id: 'TravelElement', col: 'A', title: '', alignment: '', field: 'TravelElement'},
    {id: 'DayIn', col: 'B', title: '', alignment: 'center', field: 'DayIn'},
    {id: 'DayOut', col: 'C', title: '', alignment: 'center', field: 'DayOut'},
    {id: 'Blank', col: 'D', title: '', alignment: 'center', field: ''},
    {id: 'Nights', col: 'E', title: '', alignment: 'center', field: 'Nights'},
    {id: '1', col: 'F', title: '', alignment: 'right', field: 'Cost_1', numformat: '#,##0', printIfZero: false},
    {id: '2', col: 'G', title: '', alignment: 'right', field: 'Cost_2', numformat: '#,##0', printIfZero: false},
    {id: '3', col: 'H', title: '', alignment: 'right', field: 'Cost_3', numformat: '#,##0', printIfZero: false},
    {id: '4', col: 'I', title: '', alignment: 'right', field: 'Cost_4', numformat: '#,##0', printIfZero: false},
    {id: '5', col: 'J', title: '', alignment: 'right', field: 'Cost_5', numformat: '#,##0', printIfZero: false},
    {id: '6', col: 'K', title: '', alignment: 'right', field: 'Cost_6', numformat: '#,##0', printIfZero: false},
    {id: '6', col: 'L', title: '', alignment: 'right', field: 'Cost_7', numformat: '#,##0', printIfZero: false},
    {id: '7', col: 'M', title: '', alignment: 'right', field: 'Cost_8', numformat: '#,##0', printIfZero: false},
    {id: '8', col: 'N', title: '', alignment: 'right', field: 'Cost_9', numformat: '#,##0', printIfZero: false},
    {id: '10', col: 'O', title: '', alignment: 'right', field: 'Cost_10', numformat: '#,##0', printIfZero: false},
  ];

  // Print all Header fields
  //printHeaderFields(fields, mainData, worksheet);

  const uniqueModules = getUniqueModules (mainData);

  uniqueModules.forEach(rec => {
    console.log(rec);
  })

  // Print detail fields
  uniqueModules.forEach(module => {

    const data = mainData.filter(rec => rec.ModuleCode === module);    

    let headerCell = worksheet.getCell('A' + rowNum.toString());
    headerCell.font = {...defaultFont, bold: true};
    headerCell.value = data[0].ModuleName;
    headerCell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FFFF99' }};

    headerCell = worksheet.getCell('B' + rowNum.toString());
    headerCell.font = {...defaultFont, bold: true};
    headerCell.value = data[0].ModuleCode;
    headerCell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FFFF99' }};
    
    rowNum++;

    // Print all Header fields
    printHeaderFields(fields, data, worksheet);
    rowNum++;

    let startRow = rowNum;

    for (var k=0; k<data.length; k++) {

      for (var j=0; j<columns.length; j++) {
        let cell = worksheet.getCell(columns[j].col + rowNum.toString());
  
        if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((data[k][columns[j].field] !== null) && (data[k][columns[j].field] > 0))) {
          cell.value = data[k][columns[j].field];
        }
        cell.font = defaultFont;
        if (columns[j].bold !== undefined && columns[j].bold) {
          cell.font = {...defaultFont, bold: true};
        }
        if (columns[j].fontSize !== undefined) {
          cell.font = {...cell.font, size: columns[j].fontSize};
        }
        if (columns[j].alignment > '') {
          cell.alignment = { ...cell.alignment, horizontal: columns[j].alignment};      
        }
        if (columns[j].dateformat !== undefined) {
          cell.value = moment(data[k][columns[j].field]).format(columns[j].dateformat);
        }    
        if (columns[j].numformat !== undefined) {
          cell.numFmt = columns[j].numformat;      
        }  

        cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'CCFFCC' }};

      }
  
      rowNum++;  

    }

    let endRow = rowNum-1;
    
    let data1 = fields.filter(rec => rec.type === 1);
    for (let m=0; m<data1.length; m++) {
      let cell = worksheet.getCell(data1[m].col + rowNum.toString());
      cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'CCFFCC' }};
    }
    let data2 = fields.filter(rec => rec.type === 2);
    for (let m=0; m<data2.length; m++) {
      let cell = worksheet.getCell(data2[m].col + rowNum.toString());
      cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FFFF99' }};
      cell.border = {top: {style: 'thin'} };      
      cell.font = {...defaultFont, bold: true};
      let formula = '=SUM(' + data2[m].col + startRow.toString() + ':' + data2[m].col + endRow.toString() + ')';
      cell.value = { formula: formula };
    }
    rowNum += 2;  

  });

}


//**********************************************************/
export async function printHeaderFields(fields, invHeaderData, worksheet) {
 
  // Print all Header fields
  for (var i=0; i<fields.length; i++) {
    let cell = worksheet.getCell(fields[i].col + (fields[i].row + rowNum).toString());
    let value = fields[i].caption;
    if (fields[i].field > '') {
      value += invHeaderData[0][fields[i].field];
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
    cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'C0C0C0' }};

  }

}

//**********************************************************/
export function getUniqueModules (mainData) {
  const unique = [...new Set(mainData.map(item => item.ModuleCode))]; 
  return unique;
}
