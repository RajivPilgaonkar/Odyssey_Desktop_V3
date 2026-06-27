import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import {exportXlsReport} from "./excelReports/ExportXlsReport";

//**********************************************************/
export async function setupReport(reportObj) {

  if (reportObj.reportType === 1) {
    await statusReport(reportObj);
  } else if (reportObj.reportType === 2) {
    await statusReport(reportObj);
  } 

}

//**********************************************************/
export async function statusReport(reportObj) {
  
  await exportXlsReport(reportObj);

}

