import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import { dbGetRecordRaw } from '../../../../actions';
import {exportXlsReport} from "./excelReports/ExportXlsReport";
import {exportXmlReport} from "./excelReports/ExportXmlReport";

import moment from 'moment';

//**********************************************************/
export async function setupReport(reportObj) {

  if (reportObj.type === 4) {
    await voucherListingReport(reportObj);
  } else if (reportObj.type === 5) {
    await voucherExportTally(reportObj);
  } else if (reportObj.type === 6) {
    await voucherExportTallyXml(reportObj);
  } else if (reportObj.type === 7) {
    await voucherOustanding(reportObj);
  } 

}


//**********************************************************/
export async function voucherListingReport(reportObj) {
  
  let query = "SELECT v.Vouchers_id, v.VoucherNo, " + 
    "v.VoucherDate, v.Mastertourcode, " + 
    "v.Description + CASE WHEN vt.PnrNo IS NOT NULL THEN ' (PNR No.' + vt.PnrNo + ')' ELSE '' END " + 
    " + CASE WHEN vt.CoachNo IS NOT NULL THEN ' (Coach No.' + vt.CoachNo + ')' ELSE '' END AS Description, " +
    "v.TourRef, " + 
    "v.TourLeader, A.Organisation, " +
    "'(' + COALESCE(a.areacode,'') + ') ' + a.phone AS phone, " + 
    "a.org_mobile, " +
    "vt.PnrNo, vt.CoachNo " +
    "FROM Vouchers v " +
    "LEFT JOIN Addressbook a ON v.Addressbook_id = a.Addressbook_id " +
    "LEFT JOIN vouchersTickets vt ON v.Vouchers_id = vt.Vouchers_id " +
    "WHERE v.voucherdate BETWEEN '" + moment(reportObj.fromDate,'DD/MM/YYYY').format('MM/DD/YYYY') + 
    "' AND '" + moment(reportObj.toDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "' " +
    "ORDER BY v.VoucherDate ASC, v.VoucherNo ASC";  
  
  const voucherData = await dbGetRecordRaw({query: query });

  await exportXlsReport(reportObj, voucherData);

}

//**********************************************************/
export async function voucherExportTally(reportObj) {

  let query = "EXEC p_VoucherTallyExport '" + 
    moment(reportObj.fromDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "', '" +
    moment(reportObj.toDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "' ";
  
  const voucherData = await dbGetRecordRaw({query: query });

  await exportXlsReport(reportObj, voucherData);

}

//**********************************************************/
export async function voucherExportTallyXml(reportObj) {

  let query = "EXEC p_VoucherTallyExport '" + 
    moment(reportObj.fromDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "', '" +
    moment(reportObj.toDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "' ";
  
  const voucherData = await dbGetRecordRaw({query: query });

  await exportXmlReport(reportObj, voucherData);

}

//**********************************************************/
export async function voucherOustanding(reportObj) {

  let query = "EXEC p_VouchersOutstanding '" + 
    moment(reportObj.fromDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "'";
  
  const voucherData = await dbGetRecordRaw({query: query });

  await exportXlsReport(reportObj, voucherData);

}
