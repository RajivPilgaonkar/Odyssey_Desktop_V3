import {saveAs} from "file-saver";
import {exportVoucherListingReport} from "./VoucherListingReport";
import {exportVoucherTallyReport} from "./VoucherTallyReport";
import {exportVoucherOutstandingReport} from "./VoucherOutstandingReport";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportXlsReport(reportObj, mainData) {

  const fileName = reportObj.reportName;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vouchers'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);
  
  if (reportObj.type === 4) {
    await exportVoucherListingReport(mainData, worksheet)
  } else if (reportObj.type === 5) {
    await exportVoucherTallyReport(mainData, worksheet)
  } else if (reportObj.type === 7) {
    await exportVoucherOutstandingReport(mainData, worksheet)
  }
    
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';
  
  const blob = new Blob([buffer], {type: fileType});
  
  saveAs(blob, fileName + fileExtension);
    
}

