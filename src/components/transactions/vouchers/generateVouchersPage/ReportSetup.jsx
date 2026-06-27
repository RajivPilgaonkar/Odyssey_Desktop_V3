import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
//import { dbExecuteSp, dbGetRecord } from '../../../../actions';
import {exportXlsReport} from "./excelReports/ExportXlsReport";

//**********************************************************/
export async function setupReport(reportObj, mainData) {

    await exportXlsReport(reportObj, mainData);
  
}

