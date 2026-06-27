import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import { convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { dbExecuteSp, dbGetRecordRaw } from '../../../../actions';
import {exportXlsReport} from "./excelReports/ExportXlsReport";

//**********************************************************/
export async function setupReport(reportObj) {

  if (reportObj.reportId === 1)
    await elementListingReport(reportObj);
  else if (reportObj.reportId === 2)
    await riksjaCostingSheet(reportObj);
  
}

//**********************************************************/
export async function elementListingReport (reportObj) {

  const wef = convertDMY_MDY(reportObj.wef);

  let sql = "EXEC [p_CostModules_PaxRange] '" + wef + "', " +    
  reportObj.currencies_id.toString(); 

  let spData = {sql: sql};
  await dbExecuteSp(spData);

  let query = "SELECT * FROM TmpCostModules_PaxRange ORDER BY LineNum";
  const elementsData = await dbGetRecordRaw({query: query});
  
  await exportXlsReport(reportObj, elementsData);

}

//**********************************************************/
export async function riksjaCostingSheet (reportObj) {

  const wef = convertDMY_MDY(reportObj.wef)

  let query = `exec [p_ElementCostingSheetListing] '${wef}', 1`;
  const accData = await dbGetRecordRaw({query: query});

  query = `exec [p_ElementCostingSheetListing] '${wef}', 2`;
  const servicesData = await dbGetRecordRaw({query: query});

  query = `exec [p_ElementCostingSheetListing] '${wef}', 3`;
  const transportData = await dbGetRecordRaw({query: query});

  await exportXlsReport(reportObj, [accData, servicesData, transportData]);

}

