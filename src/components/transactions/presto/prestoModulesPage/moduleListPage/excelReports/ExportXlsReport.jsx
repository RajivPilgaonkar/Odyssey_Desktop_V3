import {saveAs} from "file-saver";
import {exportModuleQuotationReport} from "./ModuleQuotationReport";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportXlsReport(reportObj, headerData, paxData, detailsData) {

  const fileName = reportObj.reportName;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Module Quotation'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);
  
  await exportModuleQuotationReport(headerData, paxData, detailsData, worksheet);
    
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';
  
  const blob = new Blob([buffer], {type: fileType});
  
  saveAs(blob, fileName + fileExtension);
    
}

