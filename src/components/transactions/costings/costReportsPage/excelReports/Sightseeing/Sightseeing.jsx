import {saveAs} from "file-saver";
import {exportSightseeingBreakup} from "./SightseeingBreakup"
import {exportSightseeingOneToTen} from "./SightseeingOneToTen"
import {exportSightseeingStacked} from "./SightseeingStacked"
import {exportSightseeingMiscGuideEntTrans} from "./SightseeingMiscGuideEntTrans";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportSightseeingData(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Costing Breakup', {views: [{ state: "frozen", xSplit: 8, ySplit: 7 }]});

  if ((reportObj.id === 11) || (reportObj.id === 12)) {
    await exportSightseeingBreakup(reportObj, priceData, worksheet);
  } else if (reportObj.id === 13) {
    await exportSightseeingOneToTen(reportObj, priceData, worksheet);
  } else if (reportObj.id === 14) {
    await exportSightseeingStacked(reportObj, priceData, worksheet);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}


//**********************************************************/
export async function exportSightseeingDataLoop(reportObj, priceData) {

  const fileName = reportObj.reportName + reportObj.country;

  const workbook = new ExcelJS.Workbook();

  const worksheetNames = ['Misc','Guide','EntranceFees','Transport'];

  for (var i=0; i<priceData.length; i++) {
    const worksheet = workbook.addWorksheet(worksheetNames[i], {views: [{ state: "frozen", xSplit: 12, ySplit: 7 }]});

    await exportSightseeingMiscGuideEntTrans(reportObj, priceData[i], worksheet, worksheetNames[i], i);
    
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);
  
}


