import {saveAs} from "file-saver";
import {exportElementListingReport} from "./ElementListingReport";
import {exportRiksjaCostingSheetReport} from "./ElementRiksjaCostingSheetReport";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportXlsReport(reportObj, mainData) {

  const fileName = reportObj.reportName + reportObj.elementLabel;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Elements'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);

  if (reportObj.reportId === 1) {
    await exportElementListingReport(mainData, worksheet)
  } else {
    await exportRiksjaCostingSheetReport(mainData, worksheet, reportObj)
  }
    
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';
  
  const blob = new Blob([buffer], {type: fileType});
  
  saveAs(blob, fileName + fileExtension);
    
}

