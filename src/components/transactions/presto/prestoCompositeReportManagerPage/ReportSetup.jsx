import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import {exportXlsReport} from "./excelReports/ExportXlsReport";

//**********************************************************/
export async function setupReport(reportObj) {

  if (reportObj.reportType === 4) {
    await statusReport(reportObj);
  } 

}

//**********************************************************/
export async function statusReport(reportObj) {
  
  await exportXlsReport(reportObj);

}

