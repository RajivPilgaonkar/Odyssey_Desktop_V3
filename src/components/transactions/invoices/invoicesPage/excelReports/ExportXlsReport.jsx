import {saveAs} from "file-saver";
import {exportClientReport} from "./ClientReport";
import {exportOfficeReport} from "./OfficeReport";
import {exportDeptReport} from "./DeptReport";
import {exportInvoiceTallyReport} from "./InvoiceTallyReport";
import {exportInvoiceTallyXmlReport} from "./InvoiceTallyXmlReport";
import {exportInvoiceGstReport} from "./InvoiceGstReport";
import {getMonthYear_FromDMY_String} from "../../../../common/CommonTransactionFunctions";
import {getAgentNameWithoutCity} from "../../../../common/GetDescFromIds";

// gives an error during 'npm run build' ...
// ..."Super expression must either be null or a function"
//const ExcelJS = require('exceljs');
import ExcelJS from 'exceljs/dist/exceljs';

//**********************************************************/
export async function exportXlsReport(reportObj, mainData) {

  const monthYear = getMonthYear_FromDMY_String(reportObj.fromDate);
  const invoicePrefix = "Invoices_" + monthYear + "_";

  const agents = getUniqueAgents(mainData);

  for (var i=0; i<agents.length; i++) {
    const agentObj = await getAgentNameWithoutCity(agents[i]);
    const fileName = invoicePrefix + agentObj.Organisation.replace(/ /g, "_") + ((reportObj.reportName > '') ? "_" + reportObj.reportName : "");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);

    const agents_id = agents[i];
    const invData = mainData.filter(rec => (rec.PrincipalAgents_id === agents_id) && (rec.Invoices_id !== null) && (rec.InvoiceNo > 0));    
  
    if (reportObj.id === 1) {
      await exportClientReport(reportObj, invData, worksheet);
    } else if (reportObj.id === 2) {
      await exportOfficeReport(reportObj, invData, worksheet);
    } else if (reportObj.id === 3) {
      await exportDeptReport(reportObj, invData, worksheet);
    } else if (reportObj.type === 4) {
      await exportInvoiceTallyReport(invData, worksheet)
    } else if (reportObj.type === 5) {
      await exportInvoiceTallyXmlReport(invData, worksheet)
    }
      
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';
  
    const blob = new Blob([buffer], {type: fileType});
  
    saveAs(blob, fileName + fileExtension);
  
  }

  
}


//**********************************************************/
export async function exportTallyXlsReport(reportObj, invData) {

    const monthYear = getMonthYear_FromDMY_String(reportObj.fromDate);
    const invoicePrefix = "Invoices_" + monthYear + "_";
    let fileName = invoicePrefix + reportObj.reportName;

    const content = {text: ''};

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);

    if (reportObj.type === 4 || reportObj.type === 6) {
      fileName = (reportObj.type === 4) ? "Tours_"+fileName : "Sum_"+fileName;
      await exportInvoiceTallyReport(invData, worksheet)
    } else if (reportObj.type === 5 || reportObj.type === 7) {
      fileName = (reportObj.type === 5) ? "Tours_"+fileName : "Sum_"+fileName;
      await exportInvoiceTallyXmlReport(invData, content)
    }
    
    if (reportObj.type === 4 || reportObj.type === 6) {
      const buffer = await workbook.xlsx.writeBuffer();
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = '.xlsx';
  
      const blob = new Blob([buffer], {type: fileType});
  
      saveAs(blob, fileName + fileExtension);
    } else if (reportObj.type === 5 || reportObj.type === 7) {
      const fileType = 'text/plain';
      const fileExtension = '.xml';
      
      const blob = new Blob([content.text], { type: fileType });
      
      saveAs(blob, fileName + fileExtension);
    
    }
  
}


//**********************************************************/
export async function exportGstr1Report(reportObj, invData) {

  const monthYear = getMonthYear_FromDMY_String(reportObj.fromDate);
  let fileName = reportObj.reportName + "_" + monthYear;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('GSTR1'/*, {views: [{ state: "frozen", xSplit: 7, ySplit: 6 }]}*/);

  if (reportObj.type === 8) {
    await exportInvoiceGstReport(invData, worksheet)
  } 
  
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileExtension = '.xlsx';

  const blob = new Blob([buffer], {type: fileType});

  saveAs(blob, fileName + fileExtension);

}


//**********************************************************/
export function getUniqueAgents (mainData) {
  const unique = [...new Set(mainData.map(item => item.PrincipalAgents_id))]; 
  return unique;
}


