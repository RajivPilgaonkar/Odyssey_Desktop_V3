import {saveAs} from "file-saver";
import {exportHotelAgents} from "./HotelAgentsReport";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportXlsReport(reportObj) {

  const fileName = reportObj.reportName;

  const workbook = new ExcelJS.Workbook();

  if (reportObj.reportType === 4) {
    const worksheet = workbook.addWorksheet('Hotels Agents'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);  
    await exportHotelAgents(reportObj, worksheet);  
  } 
    
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';
  
  const blob = new Blob([buffer], {type: fileType});
  
  saveAs(blob, fileName + fileExtension);
    
}

