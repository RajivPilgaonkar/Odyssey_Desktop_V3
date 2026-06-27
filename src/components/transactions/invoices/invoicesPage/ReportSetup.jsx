import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
//import { dbExecuteSp, dbGetRecord } from '../../../../actions';
import {exportXlsReport, exportTallyXlsReport, exportGstr1Report} from "./excelReports/ExportXlsReport";

//**********************************************************/
export async function setupReport(reportObj, mainData) {

    if (reportObj.type === 0) {
        await exportXlsReport(reportObj, mainData);
    } else if (reportObj.type === 8) {
        await exportGstr1Report(reportObj, mainData);                
    } else {
        await exportTallyXlsReport(reportObj, mainData);
    } 
  
}

