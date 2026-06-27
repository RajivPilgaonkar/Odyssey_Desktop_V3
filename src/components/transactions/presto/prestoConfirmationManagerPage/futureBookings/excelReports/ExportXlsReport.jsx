import {saveAs} from "file-saver";
import {exportFutureBookingsReport} from "./FutureBokingsReport";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportXlsReport(reportObj) {

  const fileName = reportObj.reportName;

  const workbook = new ExcelJS.Workbook();

  if (reportObj.reportType === 1) {
    const worksheet = workbook.addWorksheet('Future Bookings'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);  
    await exportFutureBookingsReport(reportObj, worksheet);  
  } 
    
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';
  
  const blob = new Blob([buffer], {type: fileType});
  
  saveAs(blob, fileName + fileExtension);
    
}

