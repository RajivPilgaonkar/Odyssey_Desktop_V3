import {saveAs} from "file-saver";
import {exportAccommodationBreakup} from "./AccommodationBreakup"
import {exportAccommodationOneToTen} from "./AccommodationOneToTen"

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportAccommodationData(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Costing Breakup', {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]});

  if ((reportObj.id === 1) || (reportObj.id === 2)) {
    exportAccommodationBreakup(reportObj, priceData, worksheet);
  } else {
    exportAccommodationOneToTen(reportObj, priceData, worksheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}



