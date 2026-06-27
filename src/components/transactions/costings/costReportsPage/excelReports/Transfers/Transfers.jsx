import {saveAs} from "file-saver";
import {exportTransferBreakup} from "./TransferBreakup"
import {exportTransferOneToTen} from "./TransferOneToTen"
import {exportTransferStacked} from "./TransferStacked"

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportTransferData(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Costing Breakup', {views: [{ state: "frozen", xSplit: 8, ySplit: 7 }]});

  if ((reportObj.id === 21) || (reportObj.id === 22)) {
    await exportTransferBreakup(reportObj, priceData, worksheet);
  } else if (reportObj.id === 23) {
    await exportTransferOneToTen(reportObj, priceData, worksheet);
  } else if (reportObj.id === 24) {
    await exportTransferStacked(reportObj, priceData, worksheet);
  } else if (reportObj.id === 25) {
    await exportTransferBreakup(reportObj, priceData, worksheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}


