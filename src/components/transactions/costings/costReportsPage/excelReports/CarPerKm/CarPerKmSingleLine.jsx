import { dbGetRecord } from '../../../../../../actions';

import moment from 'moment';


//**********************************************************/
export async function exportCarPerKmSingleLine(reportObj, priceData, worksheet) {

  let cell = worksheet.getCell('A1');
  cell.value = 'Car Per Km';  
  cell.font = { name: 'Calibri', size: 14, bold: true };

  cell = worksheet.getCell('A3');
  cell.value = 'From: ' + reportObj.fromDate;  
  cell.font = { name: 'Calibri', size: 12, bold: true };

  //cell = worksheet.getCell('A4');
  //cell.value = 'Based on ' + reportObj.numPax.toString() + ' pax';  
  //cell.font = { name: 'Calibri', size: 12, bold: true };

  const columns = [
    {id: 'b1', col: 'A', title: '', width: 8, alignment: '', field: ''},
    {id: 'servicecity', col: 'B', title: 'Service City', width: 14, alignment: '', field: ''},
    {id: 'agent', col: 'C', title: 'Agent', width: 21, alignment: '', field: ''},
    {id: 'vehicle', col: 'D', title: 'Vehicle', width: 17, alignment: '', field: 'Vehicle', recordset: 2},
    {id: 'maxpax', col: 'E', title: 'Max Pax', width: 10, alignment: 'center', field: 'ToPax', recordset: 2},
    {id: 'wef', col: 'F', title: 'Wef', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wef'},
    {id: 'wet', col: 'G', title: 'Wet', width: 12, dateformat: 'DD/MM/YYYY', alignment: 'center', field: 'Wet'},

    {id: 'b2', col: 'H', title: '', width: 3, alignment: '', field: ''},

    {id: 'cost', col: 'I', title: 'Cost', subtitle: reportObj.currencyCode, width: 9, numformat: '#,##0', alignment: 'right', field: 'FinalQuoteCurr', field2: 'TotalCost', printIfZero: false, recordset: 2},

    {id: 'b3', col: 'J', title: '', width: 3, alignment: '', field: ''},
    {id: 'b4', col: 'K', title: '', width: 3, alignment: '', field: ''},

    {id: 'n1', col: 'L', toCol: 'U', title: 'Cost Per Pax', subtitle: '1', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_1', comment: 'Comment_1'},
    {id: 'n2', col: 'M', title: '', subtitle: '2', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_2', comment: 'Comment_2'},
    {id: 'n3', col: 'N', title: '', subtitle: '3', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_3', comment: 'Comment_3'},
    {id: 'n4', col: 'O', title: '', subtitle: '4', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_4', comment: 'Comment_4'},
    {id: 'n5', col: 'P', title: '', subtitle: '5', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_5', comment: 'Comment_5'},
    {id: 'n6', col: 'Q', title: '', subtitle: '6', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_6', comment: 'Comment_6'},
    {id: 'n7', col: 'R', title: '', subtitle: '7', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_7', comment: 'Comment_7'},
    {id: 'n8', col: 'S', title: '', subtitle: '8', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_8', comment: 'Comment_8'},
    {id: 'n9', col: 'T', title: '', subtitle: '9', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_9', comment: 'Comment_9'},
    {id: 'n10', col: 'U', title: '', subtitle: '10', width: 9, numformat: '#,##0', alignment: 'right', field: 'Cost_10', comment: 'Comment_10'},

  ];

  const colorBands = [
    {cols: ['I'], color: 'FDE9D9'},
    {cols: ['L','Q'], color: 'DAEEF3'},
    {cols: ['M','R'], color: 'F2DCDB'},
    {cols: ['N','S'], color: 'EBF1DE'},
    {cols: ['O','T'], color: 'E4DFEC'},
    {cols: ['P','U'], color: 'FDE9D9'},
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
    if (pData[j].Agents_id !== prevAgents_id) {
      cell = worksheet.getCell('C' + row.toString());
      cell.value = pData[j].Agent;  
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
      } else if ((columns[i].recordset !== undefined) && (columns[i].recordset === 2)) {
        show = false;
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
        if (columns[i].comment !== undefined) {
          cell.note = pData[j][columns[i].comment];
        }            

      }

    }

    // get data from 2nd recordset
    const sql_fields = 'v.Vehicle, t.ToPax, t.FinalQuoteCurr ';
    const sql_table = 'tmpCarPriceList t ' + 
      'LEFT JOIN Vehicles v ON t.Vehicles_id = v.Vehicles_id ';
    const sql_where = 
      "t.Addressbook_id = " + pData[j].Agents_id.toString() + " " +
      "AND t.Wef = '" + moment(pData[j].Wef).format('MM/DD/YYYY') + "' " +
      'AND t.Cities_id = ' + pData[j].ServiceCities_id.toString() + ' ';

    let subData = await dbGetRecord({fields: [sql_fields], table: sql_table, where: sql_where});

    for (var m=0; m<subData.length; m++) {

      for (i=0; i<columns.length; i++) {

        // depending on with margin or without margin
        let xfield = columns[i].field;
  
        let show = false;
        if ((columns[i].recordset !== undefined) && (columns[i].recordset === 2)) {
          show = true;
        }
  
        if (show) {
          cell = worksheet.getCell(columns[i].col + row.toString());
          cell.value = subData[m][xfield];  
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

}
