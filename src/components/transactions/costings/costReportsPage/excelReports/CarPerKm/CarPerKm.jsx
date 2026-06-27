import {saveAs} from "file-saver";
import {exportCarPerKmBreakup} from "./CarPerKmBreakup"
import {exportCarPerKmOneToTen} from "./CarPerKmOneToTen"
import {exportCarPerKmSingleLine} from "./CarPerKmSingleLine"

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportCarPerKmData(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Costing Breakup', {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]});

  if ((reportObj.id === 41) || (reportObj.id === 42)) {
    await exportCarPerKmBreakup(reportObj, priceData, worksheet);
  } else if (reportObj.id === 43) {
    await exportCarPerKmOneToTen(reportObj, priceData, worksheet);
  } else if (reportObj.id === 44) {
    await exportCarPerKmSingleLine(reportObj, priceData, worksheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}


