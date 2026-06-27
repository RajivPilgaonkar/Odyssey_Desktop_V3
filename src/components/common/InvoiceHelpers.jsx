import { dbGetRecord, dbGetRecordRaw, dbExecuteSp } from '../../actions';

import moment from 'moment';

//**********************************************************/
export const getInvoiceYearRef = (invoiceDate) => {

  let year = invoiceDate.getFullYear();
  let month = invoiceDate.getMonth()+1;

  const yearRef = (month >= 4) ? year + 1 : year;

  return yearRef;
}

//**********************************************************/
export const setGstFieldEnable = async(tableHeaderArray, tf_value) => {

  let obj_i = tableHeaderArray.find(o => o.field === 'I_Gst_Perc');
  let obj_c = tableHeaderArray.find(o => o.field === 'C_Gst_Perc');
  let obj_s = tableHeaderArray.find(o => o.field === 'S_Gst_Perc');

  //Home
  const tf = (tf_value) ? true : false;
  obj_i.editorOptions.readOnly = tf;
  obj_c.editorOptions.readOnly = !tf;
  obj_s.editorOptions.readOnly = !tf;

}  


//**********************************************************/
export const getNextDivInvoiceNo = async (yearRef, companies_id, divisions_id, invoiceTypes_id) => {

  let query = "SELECT [dbo].fn_GetNextSeriesInvoiceNo (" + 
    yearRef.toString() + ',' + companies_id.toString() + ',' +
    divisions_id.toString() + ',' + invoiceTypes_id.toString() + 
    ") as nextInvoiceNo";

  const queryObj = await dbGetRecordRaw({query: query });

  // set fromPax and toPax defaults if not found
  if ((queryObj.length === 0) || (Object.keys(queryObj[0]).length === 0)) {
    queryObj.push({nextInvoiceNo: 1});
  }

  return queryObj[0];

}

//**********************************************************/
export const getNextInvoiceNo = async (yearRef, companies_id, invoiceTypes_id) => {

  let query = "SELECT [dbo].fn_GetNextSeriesInvoiceNoAllDiv (" + 
    yearRef.toString() + ',' + companies_id.toString() + ',' +
    invoiceTypes_id.toString() + 
    ") as nextInvoiceNo";

  const queryObj = await dbGetRecordRaw({query: query });

  // set fromPax and toPax defaults if not found
  if ((queryObj.length === 0) || (Object.keys(queryObj[0]).length === 0)) {
    queryObj.push({nextInvoiceNo: 1});
  }

  return queryObj[0];

}


//**********************************************************/
export const updateInvoiceAmount = async (invoices_id) => {

  const sql = "EXEC [p_UpdateInvoiceAmountGst] " + 
    invoices_id.toString() + ", 1";
  
  const spData = {sql: sql}

  await dbExecuteSp(spData);

}

//**********************************************************/
export const getExchangeRate = async(currencies_id, invoiceDate) => {

  let exchRate = 1.0;

  if ((currencies_id !== null) && (invoiceDate !== null)) {
    const qry = "SELECT exchRate = dbo.[fn_GetInvExchangeRate] (" + 
      currencies_id.toString() + ", '" + 
      moment(invoiceDate).format('MM/DD/YYYY') + "')";
    const exchRateObj = await dbGetRecordRaw({query: qry});   

    if (exchRateObj.length > 0) {
      exchRate = exchRateObj[0].exchRate;
    }

  }

  return exchRate;

}


//**********************************************************/
export const computeInvoiceAmountWithGst = async (formData, e) => {

  const gstObj = await getGstValues(formData, e);
  const gstPerc = formData.I_Gst_Perc + formData.C_Gst_Perc + formData.S_Gst_Perc;
  const gst = Math.ceil((gstPerc*gstObj.itemAmount)/100);
  const invoiceAmount = gstObj.itemAmount + gst;
  let changedObj = {TotalInvoiceAmount: invoiceAmount, TaxPercentage: gstPerc};
    
  if (e.dataField === 'I_Gst_Perc') {
    changedObj = {...changedObj, I_Gst_Perc: gstObj.gst_perc, I_Gst: gstObj.gst};
  } else if (e.dataField === 'C_Gst_Perc') {
    changedObj = {...changedObj, C_Gst_Perc: gstObj.gst_perc, C_Gst: gstObj.gst};
  } else if (e.dataField === 'S_Gst_Perc') {
    changedObj = {...changedObj, S_Gst_Perc: gstObj.gst_perc, S_Gst: gstObj.gst};
  } 

  return changedObj;

}

//**********************************************************/
export const getGstValues = async (formData, e) => {

  let gst_perc = 0;
  let gst = 0;

  const exchRate = formData.ExchangeRate;          

  const whereStr = 'invoices_id = ' + formData.Invoices_id.toString();
  const itemAmountObj = await dbGetRecord({fields: ['SUM(COALESCE(amount,0.0)) AS itemAmount, SUM(COALESCE(ServiceTax,0.0)) AS gstAmount'], table: 'invoicedetails', where: whereStr});   
  const itemAmount = itemAmountObj[0].itemAmount;
    
  gst_perc = (e.value === null) ? 0 : e.value;
  gst = Math.ceil((gst_perc*itemAmount*exchRate)/100);

  return {gst_perc: gst_perc, gst: gst, itemAmount: itemAmount};

}


//**********************************************************/
export const placeOfSupplyHome = async (placeOfSupply) => {

  const qry = "SELECT PlaceOfSupply, Home FROM PlaceOfSupply " + 
    "WHERE PlaceOfSupply = '" + placeOfSupply + "'";

  const placeOfSupplyArr = await dbGetRecordRaw({query: qry});   

  let home = false;
  if (placeOfSupplyArr.length > 0) {
    home = placeOfSupplyArr[0].Home;
  }

  return home;

}


//**********************************************************/
export const gstValid = async (home, form) => {

  if (home && (form.I_Gst_Perc !== 0)) {
    return {errorDesc: "For 'Place Of Supply' " + form.PlaceOfSupply + ", " + 
      "I GST has to be 0"};
  } else if (!home && ((form.C_Gst_Perc !== 0) || (form.S_Gst_Perc !== 0)) ) {
    return {errorDesc: "For 'Place Of Supply' " + form.PlaceOfSupply + ", " + 
      "C/S GST has to be 0"};
  } 

  return {errorDesc: ""};

}

//**********************************************************/
export const updateGstValues = async (invoices_id, currencies_id, formData) => {

  // update exchange rate for invoicing
  const exchRate = await getExchangeRate(currencies_id, formData.InvoiceDate);
  formData.ExchangeRate = exchRate;

  const whereStr = 'invoices_id = ' + invoices_id.toString();
  const itemAmountObj = await dbGetRecord({fields: ['SUM(COALESCE(amount,0.0)) AS itemAmount, SUM(COALESCE(ServiceTax,0.0)) AS gstAmount'], table: 'invoicedetails', where: whereStr});   
  const itemAmount = itemAmountObj[0].itemAmount;

  // this GST amount is in Rs.
  formData.I_Gst = Math.ceil((formData.I_Gst_Perc)*itemAmount*exchRate/100);
  formData.C_Gst = Math.ceil((formData.C_Gst_Perc)*itemAmount*exchRate/100);
  formData.S_Gst = Math.ceil((formData.S_Gst_Perc)*itemAmount*exchRate/100);

}

//**********************************************************/
export const getDefaultGstDetails = async (invoices_id) => {

  let whereStr = 'invoices_id = ' + invoices_id.toString();
  let tableStr = 'invoices i LEFT JOIN divisions d ON i.divisions_id = d.divisions_id ';
  const invoices = await dbGetRecord({fields: ['i.I_Gst_Perc, i.C_Gst_Perc, i.S_Gst_Perc, i.PlaceOfSupply, d.SacCode'], table: tableStr, where: whereStr});   

  let gstPerc = (invoices[0].I_Gst_Perc > 0) ? invoices[0].I_Gst_Perc : invoices[0].C_Gst_Perc + invoices[0].S_Gst_Perc;
  if ((gstPerc === undefined) || (gstPerc === null)) {
    gstPerc = 0;
  }

  const PlaceOfSupply = invoices[0].PlaceOfSupply;
  const SacCode = invoices[0].SacCode;

  whereStr = 'invoices_id = ' + invoices_id.toString();
  const invoiceDetails = await dbGetRecord({fields: ['MAX(COALESCE(SubOrderNo,0)) AS MaxSubOrderNo'], table: 'invoicedetails', where: whereStr});   

  const maxSubOrderNo = (invoiceDetails.length > 0) ? invoiceDetails[0].MaxSubOrderNo+1 : 1;

  return {gstPerc: gstPerc, placeOfSupply: PlaceOfSupply, sacCode: SacCode, subOrderNo: maxSubOrderNo};

}

//**********************************************************/
export const updateLineTotals = async (formData) => {

  const amount = (formData.UnitPrice * formData.Quantity);
  const gst = (formData.ServiceTaxPerc*amount/100.0);
  const amountAfterTax = amount + gst;
  const rateAfterTax = (amountAfterTax/formData.Quantity);

  formData.Amount = amount;
  formData.ServiceTax = gst;
  formData.AmtAfterTax = amountAfterTax;
  formData.RateAfterServTax = rateAfterTax;

}

//**********************************************************/
export const workBackwardsFieldsSet = async (formData) => {

  if (formData.AmtAfterTax === null) {
    formData.AmtAfterTax = 0;
  }

  if (formData.Quantity === null || formData.Quantity === 0) {
    formData.Quantity = 1;
  }

  formData.Amount = formData.AmtAfterTax/(1 + (formData.ServiceTaxPerc/100.0));
  formData.RateAfterServTax = formData.AmtAfterTax/formData.Quantity;
  formData.UnitPrice = formData.Amount/formData.Quantity;
  formData.ServiceTax = formData.AmtAfterTax - formData.Amount;

}

//**********************************************************/
export const getInvoiceTotal = async (data,option) => {

  let total = data.reduce((accumulator, rec) => {
    return accumulator + rec.AmtAfterTax;
  }, 0);

  if (option === 1)
    return total;

  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
  }).format(total);
      
  if (option === 2)
    return formattedNumber;

}

//**********************************************************/
export const invoiceChangePlaceOfSupply = async (invoices_id, option) => {

  const sql = "EXEC [p_InvoiceChangePlaceOfSupply] " + 
    invoices_id.toString() + ", " + option.toString();
  
  const spData = {sql: sql}

  await dbExecuteSp(spData);

}
