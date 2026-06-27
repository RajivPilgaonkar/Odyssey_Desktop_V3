import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import { dbGetRecordRaw } from '../../../../actions';
import {exportXlsReport} from "./excelReports/ExportXlsReport";

//**********************************************************/
export async function setupReport(reportObj, dataObj) {

  if (reportObj.type === 1) {
    await moduleQuotationReport(reportObj, dataObj);
  } 

}

//**********************************************************/
export async function moduleQuotationReport(reportObj) {
  
  let query = "EXEC [p_PrintQuoModule] " + reportObj.data.quoModules_id.toString() + ",1";  
  const headerData = await dbGetRecordRaw({query: query });

  query = "EXEC [p_PrintQuoModule] " + reportObj.data.quoModules_id.toString() + ",2";  
  const paxData = await dbGetRecordRaw({query: query });

  query = "EXEC [p_PrintQuoModule] " + reportObj.data.quoModules_id.toString() + ",3";  
  const detailsData = await dbGetRecordRaw({query: query });

  await exportXlsReport(reportObj, headerData, paxData, detailsData);

}
