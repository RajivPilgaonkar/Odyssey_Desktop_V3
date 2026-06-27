import {saveAs} from "file-saver";
import {exportCarCityGroupBreakup} from "./CarCityGroupBreakup"
import {exportCarCityGroupOneToTen} from "./CarCityGroupOneToTen"
import {exportCarCityGroupSingleLine} from "./CarCityGroupSingleLine"

//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportCarCityGroupData(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Costing Breakup', {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]});

  if ((reportObj.id === 61) || (reportObj.id === 62)) {
    await exportCarCityGroupBreakup(reportObj, priceData, worksheet);
  } else if (reportObj.id === 63) {
    await exportCarCityGroupOneToTen(reportObj, priceData, worksheet);
  } else if (reportObj.id === 64) {
    await exportCarCityGroupSingleLine(reportObj, priceData, worksheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}


