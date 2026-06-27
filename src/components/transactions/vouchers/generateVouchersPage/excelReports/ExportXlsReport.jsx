import {saveAs} from "file-saver";
import {exportClientReport} from "./ClientReport";
import {exportOfficeReport} from "./OfficeReport";
import {exportDeptReport} from "./DeptReport";
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
    const invData = mainData.filter(rec => (rec.PrincipalAgents_id === agents_id) && (rec.Invoices_id !== null));
  
    if (reportObj.id === 1) {
      await exportClientReport(reportObj, invData, worksheet);
    } else if (reportObj.id === 2) {
      await exportOfficeReport(reportObj, invData, worksheet);
    } else if (reportObj.id === 3) {
      await exportDeptReport(reportObj, invData, worksheet);
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';
  
    const blob = new Blob([buffer], {type: fileType});
  
    saveAs(blob, fileName + fileExtension);
  
  }

  
}

//**********************************************************/
export function getUniqueAgents (mainData) {
  const unique = [...new Set(mainData.map(item => item.PrincipalAgents_id))]; 
  return unique;
}


