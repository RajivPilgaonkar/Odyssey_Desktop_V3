import {saveAs} from "file-saver";
import {exportCarP2pBreakup} from "./CarP2pBreakup"
import {exportCarP2pOneToTen} from "./CarP2pOneToTen"
import {exportCarP2pSingleLine} from "./CarP2pSingleLine"

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportCarP2pData(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Costing Breakup', {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]});

  if ((reportObj.id === 51) || (reportObj.id === 52)) {
    await exportCarP2pBreakup(reportObj, priceData, worksheet);
  } else if (reportObj.id === 53) {
    await exportCarP2pOneToTen(reportObj, priceData, worksheet);
  } else if (reportObj.id === 54) {
    await exportCarP2pSingleLine(reportObj, priceData, worksheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}


