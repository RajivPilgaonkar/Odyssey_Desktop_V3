import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.common.css';
import { dbExecuteSp, dbGetRecord } from '../../../../actions';
import { convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import {exportAccommodationData} from "./excelReports/Accommodation/Accommodation";
import {exportSightseeingData, exportSightseeingDataLoop} from "./excelReports/Sightseeing/Sightseeing";
import {exportTransferData} from "./excelReports/Transfers/Transfers";
import {exportCarPerKmData} from "./excelReports/CarPerKm/CarPerKm";
import {exportCarP2pData} from "./excelReports/CarP2P/CarP2p";
import {exportCarCityGroupData} from "./excelReports/CarCityGroup/CarCityGroup";

let params = {
  fromDate: '',
  stateStr: '', hotelCategoryStr: '', 
  ranked: '0', optionsOrder: '2', optionsIndia: '2', recommended: '0', riksja: '0', searchTagsStr: '',
  misc: '1', guide: '1', entrance: '1', transport: '1', meetAssist: '1',  
}

//**********************************************************/
export async function setupReport(reportObj) {

  params.fromDate = convertDMY_MDY(reportObj.fromDate);
  params.stateStr = getStateString(reportObj.statesSelectedKeys);
  params.hotelCategoryStr = getStateString(reportObj.hotelSelectedKeys);
  params.ranked = reportObj.optionsSelectedKeys.includes('0') ? '1': '0';
  params.recommended = reportObj.optionsSelectedKeys.includes('1') ? '1': '0';
  params.optionsOrder = reportObj.optionsSelectedKeys.includes('2') ? '1': '2';
  params.riksja = reportObj.optionsSelectedKeys.includes('3') ? '1': '0';
  params.searchTagsStr = (params.riksja === '1') ? '(4)' : '';

  params.misc = reportObj.sightseeingSelectedKeys.includes('0') ? '1' : '0';
  params.guide = reportObj.sightseeingSelectedKeys.includes('1') ? '1' : '0';
  params.entrance = reportObj.sightseeingSelectedKeys.includes('2') ? '1' : '0';
  params.transport = reportObj.sightseeingSelectedKeys.includes('3') ? '1' : '0';
  params.meetAssist = reportObj.sightseeingSelectedKeys.includes('4') ? '1' : '0';

  if (reportObj.type === 0) {
    await accommodationReports(reportObj);
  } else if (reportObj.type === 1) {
    await sightseeingReports(reportObj);
  } else if (reportObj.type === 2) {
    await transferReports(reportObj);
  } else if (reportObj.type === 3) {
    await packagesReports(reportObj);
  } else if (reportObj.type === 4) {
    await carPerKmReports(reportObj);
  } else if (reportObj.type === 5) {
    await carP2PReports(reportObj);
  } else if (reportObj.type === 6) {
    await carCityGroupsReports(reportObj);
  }
  
}

//**********************************************************/
export function getStateString(stateStr) {
  if (stateStr.trim().length > 0) {
    return ('(' + stateStr + ')');
  }
  return '';
}

//**********************************************************/
export async function accommodationReports(reportObj) {
  
  let spData = '';
  let sql = "EXEC [p_HotelPriceList_GST] " + 
    "'" + params.fromDate + "', " +
    "'" + params.stateStr + "', " +
    "'" + params.hotelCategoryStr + "', " +
    "'" + params.searchTagsStr + "', " +
    reportObj.currencies_id.toString() + ", " +
    reportObj.mealPlans_id.toString() + ", " +
    params.ranked + ", " +
    params.optionsOrder + ", " +
    params.optionsIndia + ", " +
    reportObj.countries_id.toString() + " ";

  spData = {sql: sql};
  const priceData = await dbExecuteSp(spData);

  //await exportAccommodationData(reportObj, priceData.recordset);
  await exportAccommodationData(reportObj, priceData);

}

//**********************************************************/
export async function sightseeingReports(reportObj) {

  let spData = '';
  let sql = '';
  if ((reportObj.id >= 11) || (reportObj.id >= 14))  {
    sql = "EXEC [p_Services_PriceList_GST] " + 
      "'" + params.fromDate + "', " +
      "'" + params.stateStr + "', " +
      reportObj.currencies_id.toString() + ", " +
      reportObj.numPax + ", " +
      reportObj.oneToTen + ", " +
      "0, " +
      params.recommended + ", " +
      params.misc + ", " +
      params.guide + ", " +
      params.entrance + ", " +
      params.transport + ", " +
      params.meetAssist + ", " +
      reportObj.option + ", " +
      params.optionsOrder + ", " +
      params.optionsIndia + ", " +
      reportObj.countries_id.toString() + " ";
  } else {
    sql = "EXEC [p_ServiceDetails_PriceList_GST] " + 
      "'" + params.fromDate + "', " +
      "'" + params.stateStr + "', " +
      reportObj.currencies_id.toString() + ", " +
      params.recommended + ", " +
      params.misc + ", " +
      params.guide + ", " +
      params.entrance + ", " +
      params.transport + ", " +
      params.meetAssist + ", " +
      reportObj.option + ", " +
      params.optionsOrder + ", " +
      params.optionsIndia + ", " +
      reportObj.countries_id.toString() + " ";    
  }

  let priceData = [];  
  spData = {sql: sql};

  if ((reportObj.id === 11) || (reportObj.id === 12) || (reportObj.id === 13)) {

    const priceData2 = await dbExecuteSp(spData);
    //priceData = priceData2.recordset;
    priceData = priceData2;

  } else if (reportObj.id === 14){

    await dbExecuteSp(spData);

    const sql_fields = "DISTINCT COALESCE(c.States_id,-1) AS States_id, " +
      "CASE WHEN c.States_id IS NULL THEN '' ELSE s2.state END AS [State], c.City AS ServiceCity, " +
      "s.[Description] AS AgentService, a.organisation + ', ' + COALESCE(a.City,'') AS Agent, " +
      "t.Wef, t.Wet, t.Addressbook_id AS Agents_id, t.ServiceCities_id, t.Services_id ";

    const sql_table = 'tmpServicesPriceList_LineWise t ' +
    'LEFT JOIN cities c ON t.ServiceCities_id = c.cities_id ' +
    'LEFT JOIN states s2 ON s2.states_id = t.States_id ' +
    'LEFT JOIN [services] s ON t.Services_id = s.services_id ' +
    'LEFT JOIN addressbook a ON t.addressbook_id = a.addressbook_id ';

    const sql_order = ['2,3'];

    priceData = await dbGetRecord({fields: [sql_fields], table: sql_table, orders: sql_order});

  } else {
    let varArr1 = ['0','0','0','0'];
    let varArr2 = ['0','0','0',params.meetAssist];

    for (var i=0; i<4; i++) {

      let varArr = [...varArr1];
      varArr[i] = '1';

      sql = "EXEC [p_ServiceDetails_PriceList_GST] " + 
        "'" + params.fromDate + "', " +
        "'" + params.stateStr + "', " +
        reportObj.currencies_id.toString() + ", " +
        params.recommended + ", " +
        varArr[0] + ", " +
        varArr[1] + ", " +
        varArr[2] + ", " +
        varArr[3] + ", " +
        varArr2[i] + ", " +
        reportObj.option + ", " +
        params.optionsOrder + ", " +
        params.optionsIndia + ", " +
        reportObj.countries_id.toString() + " ";    

        spData = {sql: sql};
        const priceData2 = await dbExecuteSp(spData);
        //priceData.push(priceData2.recordset);
        priceData.push(priceData2);
    
    }

  }

  if ((reportObj.id >= 11) && (reportObj.id <= 14)) {
    await exportSightseeingData(reportObj, priceData);
  } else {
    await exportSightseeingDataLoop(reportObj, priceData);
  }

}

//**********************************************************/
export async function transferReports(reportObj) {

  let spData = '';
  let sql = '';
  if ((reportObj.id >= 21) || (reportObj.id >= 25))  {
    const spName = (reportObj.id === 25) ? '[p_Services_AllAgents_PriceList_GST]' : '[p_Services_PriceList_GST]';
    sql = "EXEC " + spName + " " +
      "'" + params.fromDate + "', " +
      "'" + params.stateStr + "', " +
      reportObj.currencies_id.toString() + ", " +
      reportObj.numPax + ", " +
      reportObj.oneToTen + ", " +
      "1, " +
      "0, " +
      params.misc + ", " +
      params.guide + ", " +
      params.entrance + ", " +
      params.transport + ", " +
      params.meetAssist + ", " +
      reportObj.option + ", " +
      params.optionsOrder + ", " +
      params.optionsIndia + ", " +
      reportObj.countries_id.toString() + " ";
  } 

  let priceData = [];  
  spData = {sql: sql};

  if ((reportObj.id === 21) || (reportObj.id === 22) || (reportObj.id === 23) || (reportObj.id === 25)) {

    const priceData2 = await dbExecuteSp(spData);
    //priceData = priceData2.recordset;
    priceData = priceData2;

  } else if (reportObj.id === 24){

    await dbExecuteSp(spData);

    const sql_fields = "DISTINCT COALESCE(c.States_id,-1) AS States_id, " +
      "CASE WHEN c.States_id IS NULL THEN '' ELSE s2.state END AS [State], c.City AS ServiceCity, " +
      "s.[Description] AS AgentService, a.organisation + ', ' + COALESCE(a.City,'') AS Agent, " +
      "t.Wef, t.Wet, t.Addressbook_id AS Agents_id, t.ServiceCities_id, t.Services_id ";

    const sql_table = 'tmpServicesPriceList_LineWise t ' +
    'LEFT JOIN cities c ON t.ServiceCities_id = c.cities_id ' +
    'LEFT JOIN states s2 ON s2.states_id = t.States_id ' +
    'LEFT JOIN [services] s ON t.Services_id = s.services_id ' +
    'LEFT JOIN addressbook a ON t.addressbook_id = a.addressbook_id ';

    const sql_order = ['2,3'];

    priceData = await dbGetRecord({fields: [sql_fields], table: sql_table, orders: sql_order});

  } 

  if ((reportObj.id >= 21) && (reportObj.id <= 25)) {
    await exportTransferData(reportObj, priceData);
  } 

}

//**********************************************************/
export async function packagesReports(reportObj) {
  console.log('reportObj', reportObj);
}

//**********************************************************/
export async function carPerKmReports(reportObj) {

  let priceData = [];
  
  let spData = '';
  let sql = "EXEC [p_CarHire_PerKm_PriceList_GST] " + 
    "'" + params.fromDate + "', " +
    "'" + params.stateStr + "', " +
    reportObj.currencies_id.toString() + ", " +
    reportObj.option + ", " +
    params.optionsOrder + ", " +
    params.optionsIndia + ", " +
    reportObj.countries_id.toString() + " ";

  spData = {sql: sql};
  const priceData2 = await dbExecuteSp(spData);
  //priceData = priceData2.recordset;
  priceData = priceData2;

  if ((reportObj.id >= 41) && (reportObj.id <= 44)) {
    await exportCarPerKmData(reportObj, priceData);
  } 

}

//**********************************************************/
export async function carP2PReports(reportObj) {

  let priceData = [];

  let spData = '';
  let sql = "EXEC [p_CarHire_P2P_PriceList_GST] " + 
    "'" + params.fromDate + "', " +
    "'" + params.stateStr + "', " +
    reportObj.currencies_id.toString() + ", " +
    reportObj.option + ", " +
    params.optionsOrder + ", " +
    params.optionsIndia + ", " +
    reportObj.countries_id.toString() + " ";

    spData = {sql: sql};
    const priceData2 = await dbExecuteSp(spData);
    //priceData = priceData2.recordset;
    priceData = priceData2;
  
    if ((reportObj.id >= 51) && (reportObj.id <= 54)) {
      await exportCarP2pData(reportObj, priceData);
    } 
  
}

//**********************************************************/
export async function carCityGroupsReports(reportObj) {

  let priceData = [];

  let spData = '';
  let sql = "EXEC [p_CarHire_CityGroup_PriceList_GST] " + 
    "'" + params.fromDate + "', " +
    "'" + params.stateStr + "', " +
    reportObj.currencies_id.toString() + ", " +
    reportObj.option + ", " +
    params.optionsOrder + ", " +
    params.optionsIndia + ", " +
    reportObj.countries_id.toString() + " ";

  spData = {sql: sql};
  const priceData2 = await dbExecuteSp(spData);
  //priceData = priceData2.recordset;
  priceData = priceData2;

  if ((reportObj.id >= 61) && (reportObj.id <= 64)) {
    await exportCarCityGroupData(reportObj, priceData);
  } 

}
