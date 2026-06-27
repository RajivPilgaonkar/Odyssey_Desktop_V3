import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import { dbGetRecordRaw } from '../../../../actions';
import {exportXlsReport} from "./excelReports/ExportXlsReport";
import {exportXmlReport} from "./excelReports/ExportXmlReport";

import moment from 'moment';

//**********************************************************/
export async function setupReport(reportObj) {

  if (reportObj.type === 5) {
    await voucherExportTally(reportObj);
  } else if (reportObj.type === 6) {
    await voucherExportTallyXml(reportObj);
  } else if (reportObj.type === 7) {
    await voucherOustanding(reportObj);
  } 

}



//**********************************************************/
export async function voucherExportTally(reportObj) {

  let query = '';

  if (reportObj.reportCategory === 1) {
    query = "EXEC p_VoucherTallyExport '" + 
      moment(reportObj.fromDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "', '" +
      moment(reportObj.toDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "' ";  
  } else if (reportObj.reportCategory === 2) {
    query = "EXEC p_VoucherTallyExport_TourCode '" + 
      reportObj.tourCode  + "' ";  
  }

  const voucherData = await dbGetRecordRaw({query: query });

  await exportXlsReport(reportObj, voucherData);

}

//**********************************************************/
export async function voucherExportTallyXml(reportObj) {

  let query = '';

  if (reportObj.reportCategory === 1) {
    query = "EXEC p_VoucherTallyExport '" + 
      moment(reportObj.fromDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "', '" +
      moment(reportObj.toDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "' ";  
  } else if (reportObj.reportCategory === 2) {
    query = "EXEC p_VoucherTallyExport_TourCode '" + 
      reportObj.tourCode  + "' ";  
  }
  
  const voucherData = await dbGetRecordRaw({query: query });

  await exportXmlReport(reportObj, voucherData);

}

//**********************************************************/
export async function voucherOustanding(reportObj) {

  let query = "EXEC p_VouchersOutstanding '" + 
    moment(reportObj.toDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "'";    
  
  const voucherData = await dbGetRecordRaw({query: query });

  await exportXlsReport(reportObj, voucherData);

}
