import { dbGetRecordRaw } from '../../actions';
import {convert_DbDate_To_MDY} from './CommonTransactionFunctions';


//**********************************************************/
export const getNextModuleNo = async (yearRef, trial) => {

  let query = "SELECT MAX(QuotationNo) AS nextQuoteNo FROM QuoModules " + 
    "WHERE QuotationYearRef = " + yearRef.toString() + " " +
    'AND Trial = ' + trial.toString();

  const queryObj = await dbGetRecordRaw({query: query });

  // set fromPax and toPax defaults if not found
  if ((queryObj.length === 0) || (Object.keys(queryObj[0]).length === 0)) {
    queryObj.push({nextQuoteNo: 1});
  } else {
    queryObj[0].nextQuoteNo++;
  }

  return queryObj[0];

}


//**********************************************************/
export const doesTourExist = async (formMode, quoModules_id, tourCode) => {

  let isExists = false;

  const idStr = (formMode === 1) ? "" : "AND QuoModules_id <> " + quoModules_id.toString();
   
  const query = "SELECT QuoModules_id FROM QuoModules " + 
    "WHERE TourCode = '" + tourCode + "' " + idStr;

  const existsQry = await dbGetRecordRaw({query: query });
  if (existsQry.length > 0) {
    isExists = true;
  }

  return isExists;
    
}


//**********************************************************/
export const defaultTourOperatorGst = async (xDate) => {
    
  let gstPerc = 0.0;

  const dateStr = convert_DbDate_To_MDY(xDate,1);

  const query = "SELECT [dbo].[fn_GetServiceTaxPerc] (' " + dateStr + "',28) AS GstPerc";

  const gstQry = await dbGetRecordRaw({query: query });
  if (gstQry.length > 0) {
    gstPerc = gstQry[0].GstPerc;
  }

  return gstPerc;

}

//**********************************************************/
export const getSubOrderNo = async (quoModules_id, mainOrderNo) => {
    
  let subOrderNo = 1;

  const mainOrderNoStr = (mainOrderNo === null) ? '0' : mainOrderNo.toString();

  const query = "SELECT MAX(COALESCE(SubOrderNo,0)) AS MaxSubOrderNo " + 
    "FROM QuoModuleDetails " +
    "WHERE QuoModules_id = " + quoModules_id.toString() + " " +  
    "AND COALESCE(MainOrderNo,0) = " + mainOrderNoStr + " ";

  const subOrderQry = await dbGetRecordRaw({query: query });
  if (subOrderQry.length > 0) {
    subOrderNo = subOrderQry[0].MaxSubOrderNo + 1;
  }

  return subOrderNo;

}

//**********************************************************/
export const updateLineTotals = async (formData) => {

  const amount = (formData.Rate * formData.Qty);
  const gst = (formData.ServTaxPerc*amount/100.0);
  const amountAfterTax = amount + gst;
  const rateAfterTax = (amountAfterTax/formData.Qty);

  formData.Cost = amount;
  formData.ServTaxAmt = gst;
  formData.TotalAmt = amountAfterTax;
  formData.RateAfterServTax = rateAfterTax;

}


//**********************************************************/
export const workBackwardsFieldsSet = async (formData) => {

  if (formData.TotalAmt === null) {
    formData.TotalAmt = 0;
  }

  if (formData.Qty === null || formData.Qty === 0) {
    formData.Qty = 1;
  }

  formData.Cost = formData.TotalAmt/(1 + (formData.ServTaxPerc/100.0));
  formData.RateAfterServTax = formData.TotalAmt/formData.Qty;
  formData.Rate = formData.Cost/formData.Qty;
  formData.ServTaxAmt = formData.TotalAmt - formData.Cost;

}

//**********************************************************/
export const hasLinkedItems = async(quoModuleDetails_id) => {

  let itemCount = 0;

  let query = "SELECT FixedItin_id, QuoModules_id FROM QuoModuleDetails WHERE QuoModuleDetails_id = " + quoModuleDetails_id.toString();
  let qmdQry = await dbGetRecordRaw({query: query });

  if (qmdQry.length > 0 && qmdQry[0].FixedItin_id !== null && qmdQry[0].FixedItin_id > 0) {
    const fixedItin_id = qmdQry[0].FixedItin_id;
    const quoModules_id = qmdQry[0].QuoModules_id;
    query = "SELECT COUNT(*) AS xCount FROM QuoModuleDetails " + 
      "WHERE QuoModules_id = " + quoModules_id.toString() + " " +
      "AND ParentFixedItin_id = " + fixedItin_id.toString() + " ";
    qmdQry = await dbGetRecordRaw({query: query });
    if (qmdQry.length > 0 && qmdQry[0].xCount > 0) {
      itemCount = qmdQry[0].xCount;
    }
  }

  return itemCount;  
       
}

//**********************************************************/
export const getClonedData = (mainData,id) => {

  const dataObj = {clonedData: [], isModuleReorder: false, mainOrderNoReorder: null, parentFixedItin_id: null};

  const idx = mainData.findIndex(rec => rec.QuoModuleDetails_id === id);

  if (idx > -1) {
    const formData = mainData[idx];

    dataObj.isModuleReorder = (formData.FixedItin_id !== null && formData.FixedItin_id > 0);

    // Reordering of main module groups (like 'Authentic Stater Pack')
    if (dataObj.isModuleReorder) {
      dataObj.clonedData = mainData.filter(rec => rec.FixedItin_id !== null && rec.FixedItin_id > 0);
    } else {
      const mainOrderNo = formData.MainOrderNo;
      const parentFixedItin_id = formData.ParentFixedItin_id;
      // Orphans with no parents
      if (formData.ParentFixedItin_id === 0 || formData.ParentFixedItin_id === null) {
        dataObj.clonedData = mainData.filter(rec => (rec.ParentFixedItin_id === 0 || rec.ParentFixedItin_id === null) && (rec.FixedItin_id === null || rec.FixedItin_id === 0));
      } else {
        dataObj.clonedData = mainData.filter(rec => rec.ParentFixedItin_id === parentFixedItin_id);
      }  
      dataObj.mainOrderNoReorder = mainOrderNo;
      dataObj.parentFixedItin_id = parentFixedItin_id;
    }  
  } 

  return dataObj;
       
}
