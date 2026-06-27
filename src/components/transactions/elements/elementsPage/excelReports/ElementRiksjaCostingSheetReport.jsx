
// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import 'exceljs/dist/exceljs';

import moment from 'moment';

let rowNum = 0;
const defaultFont = { name: 'Calibri', size: 11};

//**********************************************************/
export async function exportRiksjaCostingSheetReport(mainData, worksheet, reportObj) {
  
  exportRiksjaReport(mainData, worksheet, reportObj);

}

//**********************************************************/
export async function exportRiksjaReport(mainData, worksheet, reportObj) {
  
  const columnWidths = [{col: 'A', colIndex: 0, width: 10}, {col: 'B', colIndex: 1, width: 12},
    {col: 'C', colIndex: 2, width: 18}, {col: 'D', colIndex: 3, width: 12}, {col: 'E', colIndex: 4, width: 17},
    {col: 'F', colIndex: 5, width: 16}, {col: 'G', colIndex: 6, width: 12}, {col: 'H', colIndex: 7, width: 13},
    {col: 'I', colIndex: 8, width: 9}, {col: 'J', colIndex: 9, width: 12}, {col: 'K', colIndex: 10, width: 12},
    {col: 'L', colIndex: 11, width: 10}, {col: 'M', colIndex: 12, width: 12}, {col: 'N', colIndex: 13, width: 15},
    {col: 'O', colIndex: 14, width: 17}, {col: 'P', colIndex: 15, width: 9}, {col: 'Q', colIndex: 16, width: 12}, 
    {col: 'R', colIndex: 17, width: 12}, {col: 'S', colIndex: 18, width: 12}, {col: 'T', colIndex: 19, width: 12}, 
    {col: 'U', colIndex: 20, width: 8}, {col: 'V', colIndex: 21, width: 10}, {col: 'W', colIndex: 22, width: 10},
    {col: 'X', colIndex: 23, width: 8}, {col: 'Y', colIndex: 24, width: 10}, {col: 'Z', colIndex: 25, width: 10},

  ];

  rowNum = 1;
  
  // Set Column Widths
  for (let i=0; i<columnWidths.length; i++) {
    worksheet.getColumn(columnWidths[i].colIndex+1).width = columnWidths[i].width;
    // hide columns, if marked as hidden
    if (columnWidths[i].hidden !== undefined && columnWidths[i].hidden)
      worksheet.getColumn(columnWidths[i].colIndex+1).hidden = true;  
  }      

  if (reportObj.elementType === 1) {
    await reportAccBody(mainData[0], worksheet);
  } else if (reportObj.elementType === 2) {
    await reportServicesBody(mainData[1], worksheet);
  } else if (reportObj.elementType === 3) {
    await reportServicesBody(mainData[2], worksheet);
  }

}

//**********************************************************/
export async function reportAccBody(mainData, worksheet) {
  																				
  const fields = [
    {id: '1', col: 'A', row: 0, caption: 'ElementId', alignment: 'left', field: '', bold: true, type: 1},
    {id: '2', col: 'B', row: 0, caption: 'ElementType', alignment: '', field: '', bold: true, type: 1},
    {id: '3', col: 'C', row: 0, caption: 'ElementTypeString', alignment: '', field: '', bold: true, type: 1},
    {id: '4', col: 'D', row: 0, caption: 'Subcategory', alignment: '', field: '', bold: true, type: 1},
    {id: '5', col: 'E', row: 0, caption: 'SubcategoryString', alignment: '', field: '', bold: true, type: 1},
    {id: '6', col: 'F', row: 0, caption: 'SalesDestinations', alignment: '', field: '', bold: true, type: 1},
    {id: '7', col: 'G', row: 0, caption: 'SupplierTitle', alignment: '', field: '', bold: true, type: 1},
    {id: '8', col: 'H', row: 0, caption: 'SupplierCode', alignment: '', field: '', bold: true, type: 2},
    {id: '9', col: 'I', row: 0, caption: 'Currency', alignment: '', field: '', bold: true, type: 1},
    {id: '10', col: 'J', row: 0, caption: 'Start', alignment: '', field: '', bold: true, type: 2},
    {id: '11', col: 'K', row: 0, caption: 'End', alignment: '', field: '', bold: true, type: 2},
    {id: '12', col: 'L', row: 0, caption: 'Comment', alignment: '', field: '', bold: true, type: 1},

    {id: '13', col: 'M', row: 0, caption: 'RoomTypeId', alignment: '', field: '', bold: true, type: 1},
    {id: '14', col: 'N', row: 0, caption: 'RoomTypeName', alignment: '', field: '', bold: true, type: 2},
    {id: '15', col: 'O', row: 0, caption: 'IrregularRoomSize', alignment: '', field: '', bold: true, type: 2},
    {id: '16', col: 'P', row: 0, caption: 'RoomSize', alignment: '', field: '', bold: true, type: 2},
    {id: '17', col: 'Q', row: 0, caption: 'IrregularRoomPrice', alignment: '', field: '', bold: true, type: 2},
    {id: '18', col: 'R', row: 0, caption: 'OnePax', alignment: '', field: '', bold: true, type: 2},
    {id: '19', col: 'S', row: 0, caption: 'TwoPax', alignment: '', field: '', bold: true, type: 2},
    {id: '20', col: 'T', row: 0, caption: 'ThreePax', alignment: '', field: '', bold: true, type: 2},
    {id: '21', col: 'U', row: 0, caption: 'FourPax', alignment: '', field: '', bold: true, type: 2},
  ];

  const columns = [
    {id: '1', col: 'A', title: '', alignment: '', field: 'ElementId', type: 1, required: true, repeat: false},
    {id: '2', col: 'B', title: '', alignment: '', field: 'ElementType', type: 1, repeat: false},
    {id: '3', col: 'C', title: '', alignment: '', field: 'ElementTypeString', type: 1, repeat: false},
    {id: '4', col: 'D', title: '', alignment: '', field: 'Subcategory', type: 1, repeat: false},
    {id: '5', col: 'E', title: '', alignment: '', field: 'SubcategoryString', type: 1, repeat: false},
    {id: '6', col: 'F', title: '', alignment: '', field: 'SalesDestinations', type: 1, repeat: false},
    {id: '7', col: 'G', title: '', alignment: '', field: 'SupplierTitle', type: 1, repeat: false},
    {id: '8', col: 'H', title: '', alignment: '', field: 'SupplierCode', type: 2, repeat: true},
    {id: '9', col: 'I', title: '', alignment: '', field: 'Currency', type: 1, repeat: true},
    {id: '10', col: 'J', title: '', alignment: '', field: 'Start', type: 2, repeat: true},
    {id: '11', col: 'K', title: '', alignment: '', field: 'End', type: 2, repeat: true},
    {id: '12', col: 'L', title: '', alignment: '', field: 'Comment', type: 1, repeat: false},

    {id: '12', col: 'M', title: '', alignment: '', field: 'RoomTypeId', type: 1, repeat: true},
    {id: '13', col: 'N', title: '', alignment: '', field: 'RoomTypeName', type: 2, repeat: true},
    {id: '14', col: 'O', title: '', alignment: '', field: 'IrregularRoomSize', type: 2, repeat: true},
    {id: '15', col: 'P', title: '', alignment: '', field: 'RoomSize', type: 2, repeat: true},
    {id: '16', col: 'Q', title: '', alignment: '', field: 'IrregularRoomPrice', numformat: '#,##0', printIfZero: false, type: 2, repeat: true},
    {id: '17', col: 'R', title: '', alignment: '', field: 'OnePax', numformat: '#,##0', printIfZero: false, type: 2, repeat: true},
    {id: '18', col: 'S', title: '', alignment: '', field: 'TwoPax', numformat: '#,##0', printIfZero: false, type: 2, repeat: true},
    {id: '19', col: 'T', title: '', alignment: '', field: 'ThreePax', numformat: '#,##0', printIfZero: false, type: 2, repeat: true},
    {id: '20', col: 'U', title: '', alignment: '', field: 'FourPax', numformat: '#,##0', printIfZero: false, type: 2, repeat: true},
  ];

  printAccData(mainData, fields, columns, worksheet, 1);

}

//**********************************************************/
export async function reportServicesBody(mainData, worksheet) {  

  const fields = [
    {id: '1', col: 'A', row: 0, caption: 'ElementId', alignment: 'left', field: '', bold: true, type: 1},
    {id: '2', col: 'B', row: 0, caption: 'ElementType', alignment: '', field: '', bold: true, type: 1},
    {id: '3', col: 'C', row: 0, caption: 'ElementTypeString', alignment: '', field: '', bold: true, type: 1},
    {id: '4', col: 'D', row: 0, caption: 'Subcategory', alignment: '', field: '', bold: true, type: 1},
    {id: '5', col: 'E', row: 0, caption: 'SubcategoryString', alignment: '', field: '', bold: true, type: 1},
    {id: '6', col: 'F', row: 0, caption: 'SalesDestinations', alignment: '', field: '', bold: true, type: 1},

    {id: '7', col: 'G', row: 0, caption: 'SupplierTitle', alignment: '', field: '', bold: true, type: 2},
    {id: '8', col: 'H', row: 0, caption: 'SupplierCode', alignment: '', field: '', bold: true, type: 2},
    {id: '9', col: 'I', row: 0, caption: 'Currency', alignment: '', field: '', bold: true, type: 2},
    {id: '10', col: 'J', row: 0, caption: 'Start', alignment: '', field: '', bold: true, type: 2},
    {id: '11', col: 'K', row: 0, caption: 'End', alignment: '', field: '', bold: true, type: 2},
    {id: '12', col: 'L', row: 0, caption: 'TargetGroupId', alignment: '', field: '', bold: true, type: 2},

    {id: '13', col: 'M', row: 0, caption: 'TargetGroupName', alignment: '', field: '', bold: true, type: 2},
    {id: '14', col: 'N', row: 0, caption: 'MinAge', alignment: '', field: '', bold: true, type: 2},
    {id: '15', col: 'O', row: 0, caption: 'UnitPricing', alignment: '', field: '', bold: true, type: 2},
    
    {id: '16', col: 'P', row: 0, caption: 'Price', alignment: '', field: '', bold: true, type: 2},
    {id: '17', col: 'Q', row: 0, caption: 'MaxPax', alignment: '', field: '', bold: true, type: 2},
    {id: '18', col: 'R', row: 0, caption: 'OnePax', alignment: '', field: '', bold: true, type: 2},
    {id: '19', col: 'S', row: 0, caption: 'TwoPax', alignment: '', field: '', bold: true, type: 2},
    {id: '20', col: 'T', row: 0, caption: 'ThreePax', alignment: '', field: '', bold: true, type: 2},
    {id: '21', col: 'U', row: 0, caption: 'FourPax', alignment: '', field: '', bold: true, type: 2},
    {id: '22', col: 'V', row: 0, caption: 'FivePax', alignment: '', field: '', bold: true, type: 2},
    {id: '23', col: 'W', row: 0, caption: 'SixPax', alignment: '', field: '', bold: true, type: 2},
    {id: '24', col: 'X', row: 0, caption: 'InfinitePax', alignment: '', field: '', bold: true, type: 2},
  ];

  const columns = [
    {id: '1', col: 'A', title: '', alignment: '', field: 'ElementId', type: 1, required: true, repeat: true},
    {id: '2', col: 'B', title: '', alignment: '', field: 'ElementType', type: 1, repeat: true},
    {id: '3', col: 'C', title: '', alignment: '', field: 'ElementTypeString', type: 1, repeat: true},
    {id: '4', col: 'D', title: '', alignment: '', field: 'Subcategory', type: 1, repeat: true},
    {id: '5', col: 'E', title: '', alignment: '', field: 'SubcategoryString', type: 1, repeat: true},
    {id: '6', col: 'F', title: '', alignment: '', field: 'SalesDestinations', type: 1, repeat: true},

    {id: '7', col: 'G', title: '', alignment: '', field: 'SupplierTitle', type: 2, repeat: true},
    {id: '8', col: 'H', title: '', alignment: '', field: 'SupplierCode', type: 2, repeat: true},
    {id: '9', col: 'I', title: '', alignment: '', field: 'Currency', type: 1, repeat: true},
    {id: '10', col: 'J', title: '', alignment: '', field: 'Start', type: 2, repeat: true},
    {id: '11', col: 'K', title: '', alignment: '', field: 'End', type: 2, repeat: true},
    {id: '12', col: 'L', title: '', alignment: '', field: 'TargetGroupId', type: 1, repeat: true},

    {id: '13', col: 'M', title: '', alignment: '', field: 'TargetGroupName', type: 1, addRow: 1, repeat: true},
    {id: '14', col: 'N', title: '', alignment: '', field: 'MinAge', type: 2, repeat: true},
    {id: '15', col: 'O', title: '', alignment: '', field: 'UnitPricing', type: 2, repeat: true},

    {id: '16', col: 'P', title: '', alignment: '', field: 'Price', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '17', col: 'Q', title: '', alignment: '', field: 'MaxPax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '18', col: 'R', title: '', alignment: '', field: 'OnePax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '19', col: 'S', title: '', alignment: '', field: 'TwoPax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '20', col: 'T', title: '', alignment: '', field: 'ThreePax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '21', col: 'U', title: '', alignment: '', field: 'FourPax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '22', col: 'V', title: '', alignment: '', field: 'FivePax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '23', col: 'W', title: '', alignment: '', field: 'SixPax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},
    {id: '24', col: 'X', title: '', alignment: '', field: 'InfinitePax', numformat: '#,##0', printIfZero: false, type: 2, subType: 2, repeat: true},

  ];

  printData(mainData, fields, columns, worksheet, 2);

}

//**********************************************************/
export async function printAccData(mainData, fields, columns, worksheet, dataType) {
  
    let supplierTitle = '@#!';
    let subIdx = 0;
  
    // Print detail fields
    mainData.forEach((element,index) => {

      if (element['SupplierTitle'] !== supplierTitle) {

        if (index > 0) {
          for (let j=0; j<columns.length; j++) {
            let cell = worksheet.getCell(columns[j].col + rowNum.toString());
            cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'D3D3D3' }};
          }      
          rowNum ++;    
        }

        // Print all Header fields
        printHeaderFields(fields, worksheet);
        rowNum++;

      }

      subIdx = (element['SupplierTitle'] !== supplierTitle) ? 0 : subIdx;
    
      for (let j=0; j<columns.length; j++) {
        let cell = worksheet.getCell(columns[j].col + rowNum.toString());

        /*=== If supplier changes or columns tagged as to be repeated ===*/
        if (subIdx === 0 || columns[j].repeat) {

          if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((element[columns[j].field] !== null) && (element[columns[j].field] > 0))) {
            cell.value = element[columns[j].field];
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
            cell.value = moment(element[columns[j].field]).format(columns[j].dateformat);
          }    
          if (columns[j].numformat !== undefined) {
            cell.numFmt = columns[j].numformat;      
          }  
    
          // Element Id not filled
          if (columns[j].required !== undefined && columns[j].required && element[columns[j].field] === null) 
            cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FF0000' }};        
      
        }        

        if (columns[j].type === 2)
          cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: '87CEEB' }};

        supplierTitle = element['SupplierTitle'];
  
      }
  
      // For non acc data type, add 2 more rows
      if (dataType !== 1) {
        addBlankRow(worksheet, columns, 1);
        addBlankRow(worksheet, columns, 2);
      }
    
      rowNum++;  

      subIdx++
    
    });
  
  }
  


//**********************************************************/
export async function printData(mainData, fields, columns, worksheet, dataType) {

  // Print detail fields
  mainData.forEach(element => {

    // Print all Header fields
    printHeaderFields(fields, worksheet);
    rowNum++;

    for (let j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + rowNum.toString());
      
      if ((columns[j].printIfZero === undefined) || (columns[j].printIfZero) || ((element[columns[j].field] !== null) && (element[columns[j].field] > 0))) {
        cell.value = element[columns[j].field];
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
        cell.value = moment(element[columns[j].field]).format(columns[j].dateformat);
      }    
      if (columns[j].numformat !== undefined) {
        cell.numFmt = columns[j].numformat;      
      }  

      // Element Id not filled
      //if (columns[j].required !== undefined && columns[j].required && element[columns[j].field] === null) 
      //  cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'FF0000' }};        

      if (columns[j].type === 2)
        cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: '87CEEB' }};

    }

    // For non acc data type, add 2 more rows
    if (dataType !== 1) {
      addBlankRow(worksheet, columns, 1);
      addBlankRow(worksheet, columns, 2);
    }
  
    rowNum++;  

    for (let j=0; j<columns.length; j++) {
      let cell = worksheet.getCell(columns[j].col + rowNum.toString());
      cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: 'D3D3D3' }};
    }

    rowNum ++;  

  });

}

//**********************************************************/
export async function addBlankRow(worksheet, columns, rowType) {

  rowNum++;

  for (let j=0; j<columns.length; j++) {
    let cell = worksheet.getCell(columns[j].col + rowNum.toString());
    if (columns[j].type === 2)
      cell.fill = {type: 'pattern', pattern:'solid', fgColor: {argb: '87CEEB' }};  
    if (columns[j].type === 2 && rowType === 2 && (columns[j].subType !== undefined && columns[j].subType === 2))
      cell.fill = null;

    if (columns[j].addRow !== undefined && columns[j].addRow)
      cell.value = (rowType === 1) ? 'DiscountedPrice' : 'Free';

  }
}


//**********************************************************/
export async function printHeaderFields(fields, worksheet) {
 
  // Print all Header fields
  for (var i=0; i<fields.length; i++) {
    let cell = worksheet.getCell(fields[i].col + rowNum.toString());
    cell.value = fields[i].caption;  
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

  }

}
