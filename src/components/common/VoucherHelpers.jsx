import { dbGetRecordRaw, dbExecuteSp } from '../../actions';
import { convertDMY_MDY, convertDMY_toDate } from './CommonTransactionFunctions';
import { getVoucherYearRef } from './GetDescFromIds';

import moment from 'moment';

//**********************************************************/
export const getAccVoucherDescription = async(vouchers_id) => {

  const query = 'SELECT [dbo].[fn_AccVouDesc]  (v.pax, va.noofsingles, va.noofdoubles, ' + 
    'va.NoOfTriples, va.NoOfTwins, va.roomtypes_id, va.ac, va.mealplans_id, ' + 
    'va.datein, va.dateout) as descr ' + 
    'FROM vouchers v ' + 
    'LEFT JOIN vouchersaccommodation va ON v.vouchers_id = va.vouchers_id ' + 
    'WHERE v.vouchers_id = ' + vouchers_id.toString();

  const data = await dbGetRecordRaw({query: query});

  const accStr = (data.length > 0) ? data[0].descr : '';

  return (accStr);

}

//**********************************************************/
export const getServiceVoucherDescription = async(vouchers_id) => {

  let query = 'SELECT m.masters_id, v.mastertourdate, v.voucherdate ' + 
    'FROM vouchers v ' + 
    'LEFT JOIN masters m ON v.mastertourcode = m.mastercode ' + 
    'WHERE v.vouchers_id = ' + vouchers_id.toString();

  let data = await dbGetRecordRaw({query: query});

  const tourDate = (data[0].mastertourdate !== null) ? moment(data[0].mastertourdate).format('MM/DD/YYYY') : null;
  const transferDate = moment(data[0].voucherdate).format('MM/DD/YYYY');

  const tourDateStr = (tourDate !== null) ? "'" + tourDate + "'" : 'null';

  query = "SELECT [dbo].[fn_TrsfVouDesc]  (v.pax, vs.noofvehicles, v.addressbook_id, " +
    data[0].masters_id + ", " + tourDateStr + ", " +
    "vs.services_id, vs.vehicles_id, vs.ac, vs.guide, '" + transferDate + "', " +
    "vs.timing, vs.FlightDepTime, vs.FlightNo, vs.place, vs.transfertypes_id, " +
    "vs.sightseeing, vs.entrancefees) AS descr " +
    'FROM vouchers v ' + 
    'LEFT JOIN vouchersservices vs ON v.vouchers_id = vs.vouchers_id ' + 
    'WHERE v.vouchers_id = ' + vouchers_id.toString();

  data = await dbGetRecordRaw({query: query});

  const serviceStr = (data.length > 0) ? data[0].descr : '';

  return (serviceStr);
}

//**********************************************************/
export const getTransportVoucherDescription = async(vouchers_id) => {

  const query = 'SELECT [dbo].[fn_coachvoudesc]  (v.pax, vt.noofvehicles, ' + 
    'vt.from_cities_id, vt.to_cities_id, vt.fromplace, vt.toplace, ' + 
    'CONVERT(VARCHAR(5),vt.fromtime,108), CONVERT(VARCHAR(5),vt.totime,108), ' +
    'CONVERT(VARCHAR(10),vt.fromdate,101), CONVERT(VARCHAR(10),vt.todate,101), ' +
    'vt.ac, vt.vehicles_id) as descr ' + 
    'FROM vouchers v ' + 
    'LEFT JOIN voucherstransport vt ON v.vouchers_id = vt.vouchers_id ' + 
    'WHERE v.vouchers_id = ' + vouchers_id.toString();

  const data = await dbGetRecordRaw({query: query});

  const transportStr = (data.length > 0) ? data[0].descr : '';

  return (transportStr);

}

//**********************************************************/
export const getTicketsVoucherDescription = async(vouchers_id) => {
  
  const query = 'SELECT [dbo].[fn_TravelVouDesc] (v.pax, vt.tickets_id, vt.flightno, vt.from_cities_id, vt.to_cities_id, ' +
    'vt.fromStations_id, vt.toStations_id, vt.classid, vt.arrival, vt.departure, vt.TravelDate, ' +    
    'vt.nobooked, vt.nocancelled) as descr, vt.PnrNo ' + 
    'FROM vouchers v ' + 
    'LEFT JOIN voucherstickets vt ON v.vouchers_id = vt.vouchers_id ' + 
    'WHERE v.vouchers_id = ' + vouchers_id.toString();

  const data = await dbGetRecordRaw({query: query});

  // add PNR number as well to the description
  const accStr = (data.length > 0) ? data[0].descr + 
    ((data[0].PnrNo !== null && data[0].PnrNo.trim().length > 0) ? '\n (PNR No: ' + data[0].PnrNo + ')': '')
    : '';

  return (accStr);

}

//**********************************************************/
export const getPackageVoucherDescription = async(vouchers_id) => {

  const query = 'SELECT [dbo].[fn_PackageDesc]  (vp.packages_id, v.pax, 0, ' + 
    'vp.from_date, 0, 0, null, 0) as descr ' + 
    'FROM vouchers v ' + 
    'LEFT JOIN voucherspackages vp ON v.vouchers_id = vp.vouchers_id ' + 
    'WHERE v.vouchers_id = ' + vouchers_id.toString();

  const data = await dbGetRecordRaw({query: query});

  const packStr = (data.length > 0) ? data[0].descr : '';

  return (packStr);

}


//**********************************************************/
export const getTourRef = async (tourCode, tourDate) => {

  const xTourDate = convertDMY_MDY(tourDate);

  const query = "SELECT tourref FROM vouchers " + 
    "WHERE mastertourcode = '" + tourCode + "' " +
    "AND mastertourdate = '" + xTourDate + "' " +
    "AND pax > 0 " +
    "AND COALESCE(tourref,'') > '' " +
    "ORDER BY voucherno";      

  const tourRefObj = {tourRef: ''};

  const tourRef = await dbGetRecordRaw({query: query });
  if (tourRef.length > 0) {
    tourRefObj.tourRef = tourRef[0].tourref;
  }

  return tourRefObj;

}

//**********************************************************/
export const getMastersIdFromTourCode = async (tourCode) => {

  const query = "SELECT MasterCode, Masters_id FROM Masters " + 
    "WHERE MasterCode = '" + tourCode + "' " + 
    "ORDER BY MasterCode";      

  const tourObj = {tourCode: '', masters_id: -1};

  const tourArr = await dbGetRecordRaw({query: query });
  if (tourArr.length > 0) {
    tourObj.tourCode = tourArr[0].MasterCode;
    tourObj.masters_id = tourArr[0].Masters_id;
  }

  return tourObj;

}

//**********************************************************/
export const getVoucherRecipentObj = async(addressbook_id, users_id) => {

  /*=== STEP 1 ===*/
  /*=== Salutation Line ===*/
  let query = 'SELECT salutation, firstname, lastname FROM addressdetails ' + 
    'WHERE addressbook_id = ' + addressbook_id.toString() + ' ' +
    'ORDER BY COALESCE(OrderNo, 100)';

  const data = await dbGetRecordRaw({query: query});

  let salutationLine = '';

  if (data.length > 0) {

    /*=== Salutation ===*/
    let salutation = '';
    if (data[0].salutation !== null) {
      salutation = data[0].salutation.trim();
    }

    /*=== First Name ===*/
    let firstName = '';
    if (data[0].firstname !== null) {
      firstName = data[0].firstname.trim();
    }

    /*=== Last Name ===*/
    let lastName = '';
    if (data[0].lastname !== null) {
      lastName = data[0].lastname.trim();
    }
    
    salutationLine = salutation + ' ' + firstName + ' ' + lastName;

  } else {
    salutationLine = 'Sir / Madam'
  }

  salutationLine = 'Dear ' + salutationLine + ',';

  /*=== STEP 2 ===*/
  /*=== Hotel Email ===*/
  query = 'SELECT email, VendorPaymentTerms_id, organisation FROM addressbook a ' + 
    'WHERE addressbook_id = ' + addressbook_id.toString();

  const emailData = await dbGetRecordRaw({query: query});

  /*=== Current User ===*/
  query = "SELECT AdmUsers_id, Email, COALESCE(UserName,'Admin') AS UserName from admusers " + 
    "WHERE AdmUsers_id = " + users_id.toString();

  const userData = await dbGetRecordRaw({query: query});

  let emailTo = '';
  if (emailData[0].email !== null) {
    emailTo = emailData[0].email;
  }

  if (userData[0].Email !== null) {
     emailTo += '; ' + userData[0].Email;
  } else {
    emailTo += '; admin@odyssey.co.in';
  }

  // If Payment Terms entered in addressbook for the vendor, include accounts mails in mailing list
  if (emailData[0].VendorPaymentTerms_id !== null) {

    query = "SELECT text FROM defaults WHERE item LIKE '%Hotel Advance Emails%'";
    const accEmailData = await dbGetRecordRaw({query: query});

    if (accEmailData.length > 0) {
      emailTo += '; ' + accEmailData[0].text;
    }

  } 

  /*=== Extract emails from string ===*/
  emailTo = extractEmails(emailTo);
  emailTo = emailTo.join("; ");

  const recipientObj = {
    salutationLine: salutationLine,
    emailTo: emailTo, 
    vendorPymtTerms_id: emailData[0].VendorPaymentTerms_id,
    userName: userData[0].UserName,
    organisation: emailData[0].organisation
  }

  return (recipientObj);

}

//**********************************************************/
export const extractEmails = (text) => {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

//**********************************************************/
export const getVoucherBodyObj = async(vouchers, recipientObj, tourCode, paxName, confirmation, users_id) => {

  /*=== STEP 1 ===*/
  /*=== Get Voucher Details ===*/
  let voucherQuery = 'SELECT pax, tourref FROM vouchers ' +
    'WHERE Vouchers_id = '+ vouchers[0].Vouchers_id;

  const voucherDetails = await dbGetRecordRaw({query: voucherQuery});  

  let body = recipientObj.salutationLine + '\r\n\r\n';
  
  /*=== STEP 2 ===*/
  /*=== Body ===*/
  const voucherStr = vouchers.length > 1 ? 'vouchers' : 'voucher';

  if (confirmation) {
    body += 'Please find our attached ' + voucherStr + ' for ' +
    paxName + ' - ' + voucherDetails[0].pax.toString() + ' pax ' +
    '- ( ' + voucherDetails[0].tourref.trim() + ' )';
  } else {
    body += 'Request for Cancellation of Reservation for our ' + voucherStr + ' for ' +
    paxName + ' - ' + voucherDetails[0].pax.toString() + ' pax ' +
    '- ( ' + voucherDetails[0].tourref.trim() + ' )';
  }
  body += "\r\n\r\n";

  vouchers.forEach(e => {
    body += 'Voucher No: ' + e.VoucherNo.toString() + '\r\n';
    body += e.description.replace(/\r\n|\r|\n/g, '') + '\r\n\r\n';
  })

  if (confirmation) {
    const voucherStr = (vouchers.length > 1) ? 'these vouchers' : 'this voucher';
    body += 'Please acknowledge the receipt of ' + voucherStr + ' by return e-mail. \r\n\r\n';
  } else {
    body += 'Please note that the clients have changed their itinerary. ' +
    'We kindly request you therefore to cancel the reservation for the above dates. \r\n\r\n' +
    'We apologise for any inconvenience caused due to this cancellation. \r\n\r\n';
  }

  /*=== Advance Payment ===*/
  if (confirmation && recipientObj.vendorPymtTerms_id !== null) {
    body += 'Advance Payment\r\n';
    body += 'In order to make an advance payment for these services, we require your Proforma Invoice.\r\n\r\n' +
      'Please ensure that your Proforma Invoice specifies the amount for GST. ' +
      'Please also mention your GSTIN (GST registration number).\r\n\r\n' +
      'We look forward to hear from you soon.\r\n\r\n';
  }

  /*=== STEP 3 ===*/
  /*=== Body Footer ===*/
  /*=== Current User ===*/
  body += 'Best Regards, \r\n\r\n';
  body += recipientObj.userName + '\r\n';
  body += 'Reservations Dept.\r\n\r\n';

  /*=== STEP 4 ===*/
  /*=== Company Details for Solita LLP ===*/
  let query = 'SELECT a.organisation, a.address, a.city, a.phone, a.fax, a.areacode ' +
    'FROM addressbook a ' +
    'WHERE addressbook_id = 68';

  const company = await dbGetRecordRaw({query: query});

  /*=== Trading Name ===*/
  query = "SELECT c.Name as TradingName, COALESCE(c.DivName,'') AS DivName  " +
    "FROM companies c " +
    "WHERE c.companies_id = 4";

  const tradingCompany = await dbGetRecordRaw({query: query});

  body += tradingCompany[0].TradingName + '\r\n';
  body += tradingCompany[0].DivName + '\r\n';
  body += company[0].address + '\r\n';
  body += (company[0].city !== null) ? company[0].city + '\r\n' : '';
  body += 'Tel: (' + company[0].areacode.trim() + ') ' + company[0].phone + '\r\n';
  body += (company[0].fax !== null) ? 'Fax: ' + company[0].fax + '\r\n' : '';

  /*=== STEP 5 ===*/
  /*=== User info ===*/
  query = "SELECT COALESCE(Email,'') AS Email " +
    "FROM AdmUsers " +
    "WHERE AdmUsers_id = " + users_id.toString();

  const user = await dbGetRecordRaw({query: query});

  if (user[0].Email === 'admin@odyssey.co.in') {
    user[0].Email = 'rpilgaonkar@gmail.com';
  }

  const bodyObj = { emailBody: body, tourCode: tourCode, paxName: paxName, recipient: recipientObj.emailTo, 
    senderEmail: user[0].Email, organisation: (recipientObj.organisation !== null ? recipientObj.organisation : '')
  };

  return (bodyObj);

}

//**********************************************************/
export const getBilledAmount = async(vouchers_id) => {

  const query = 'SELECT SUM(COALESCE(BillAmount,0.0)) AS AmountBilled ' + 
    'FROM voucherBillings ' + 
    'WHERE vouchers_id = ' + vouchers_id.toString();

  const data = await dbGetRecordRaw({query: query});

  const amountBilled = (data.length > 0 && data[0].AmountBilled !== null) ? data[0].AmountBilled : 0;

  return (amountBilled);

}

//**********************************************************/
export const getPaidAmount = async(vouchers_id) => {

  const query = 'SELECT SUM(COALESCE(Db,0.0)) AS AmountPaid ' + 
    'FROM voucherPayments ' + 
    'WHERE vouchers_id = ' + vouchers_id.toString();

  const data = await dbGetRecordRaw({query: query});

  const amountPaid = (data.length > 0 && data[0].AmountPaid !== null) ? data[0].AmountPaid : 0;

  return (amountPaid);

}

//**********************************************************/
export const getNextVoucherDetails = async(uncoded, tourCode, tourDate, companies_id, defaultObj) => {

  const xDate = convertDMY_toDate(tourDate);
  const yearRef = await getVoucherYearRef(xDate);

  // next voucher number for the company
  let voucherObj = await getNextVoucherNo (yearRef, companies_id);
  const nextVoucherNo = voucherObj.nextVoucherNo;

  let issuedOn = null;
  let issuedBy = null;
  let pax = null;
  if (!uncoded) {
    voucherObj = await getFirstVoucherDetails(tourCode, tourDate);
    issuedOn =  voucherObj.issuedon;
    issuedBy = voucherObj.issuedby;
    pax = voucherObj.pax;
  }

  /*=== Overwrite DefaultObj properties without creating new object (or spread operator) ===*/
  Object.assign(defaultObj, 
    {YearRef: yearRef, VoucherNo: nextVoucherNo, VoucherDate: xDate,
     IssuedOn: issuedOn, IssuedBy: issuedBy, Pax: pax
    })

}

//**********************************************************/
export const getNextVoucherNo = async (yearRef, companies_id) => {

  let query = "SELECT [dbo].fn_GetNextVoucherNo (" + 
    yearRef.toString() + ',' + companies_id.toString() + ") as nextVoucherNo";

  const queryObj = await dbGetRecordRaw({query: query });

  // set fromPax and toPax defaults if not found
  if ((queryObj.length === 0) || (Object.keys(queryObj[0]).length === 0)) {
    queryObj.push({nextVoucherNo: 1});
  }

  return queryObj[0];

}

//**********************************************************/
export const getFirstVoucherDetails = async (tourCode, tourDate) => {

  let tourDate_MDY = convertDMY_MDY(tourDate);

  let query = "SELECT issuedon, issuedby, pax " + 
    "FROM Vouchers v " +
    "WHERE v.mastertourcode = '" + tourCode + "' " + 
    "AND v.mastertourdate = '" + tourDate_MDY + "' " + 
    "AND v.pax > 0 " +
    "ORDER BY v.voucherno";

  const queryObj = await dbGetRecordRaw({query: query });
  let voucherObj = {issuedon: null, issuedby: null, pax: 2};

  if (queryObj.length > 0) {
    voucherObj = {...voucherObj, ...queryObj[0]}    
  }

  return voucherObj;

}


//**********************************************************/
export const isValidVoucherQuotationLine = async (tourCode, tourDate, lineNum) => {

  let xTourDate = convertDMY_MDY(tourDate);

  let query = "SELECT QuoLines_id FROM Quotations q " + 
    "LEFT JOIN QuoLines ql ON q.Quotations_id = ql.Quotations_id " +
    "WHERE q.TourCode = '" + tourCode + "' " + 
    "AND q.StartDate = '" + xTourDate + "' " +
    "AND ql.LineNum = " + lineNum.toString() + " " +
    "AND ql.TrsType = 5";

  const queryObj = await dbGetRecordRaw({query: query });

  return (queryObj.length > 0);

}


//**********************************************************/
export const deleteVoucherDetails = async (vouchers_id) => {

  let sql = "DELETE FROM vouchersaccommodation WHERE vouchers_id = " + 
      vouchers_id.toString();      
  let spData = {sql: sql}
  await dbExecuteSp(spData);

  sql = "DELETE FROM vouchersservices WHERE vouchers_id = " + 
      vouchers_id.toString();      
  spData = {sql: sql}
  await dbExecuteSp(spData);

  sql = "DELETE FROM voucherstransport WHERE vouchers_id = " + 
    vouchers_id.toString();      
  spData = {sql: sql}
  await dbExecuteSp(spData);

  sql = "DELETE FROM voucherstickets WHERE vouchers_id = " + 
    vouchers_id.toString();      
  spData = {sql: sql}
  await dbExecuteSp(spData);

}

//**********************************************************/
export const recomputeVoucherCost = async (vouchers_id, voucherTypes_id) => {
  
  let sql = "";

  if (voucherTypes_id === 3) {
    sql = "EXEC [p_CostComputeAccommodation] " + vouchers_id.toString();
  } else if (voucherTypes_id === 4) {
    sql = "EXEC [p_CostComputeServices] " + vouchers_id.toString();
  } else if (voucherTypes_id === 5) {
    sql = "EXEC [p_CostComputeCoach] " + vouchers_id.toString();
  } else if (voucherTypes_id === 2) {
    sql = "EXEC [p_CostComputeTickets] " + vouchers_id.toString();
  }

  if (sql > '') {
    const spData = {sql: sql};
    await dbExecuteSp(spData);        
  }

}

//**********************************************************/
export const getExpectedCost = async (vouchers_id) => {
  let query = "SELECT expectedcost = COALESCE(expectedcost,0) FROM Vouchers " + 
      "WHERE vouchers_id = " + vouchers_id.toString();

  const costQry = await dbGetRecordRaw({query: query });
  let expectedCost = 0;

  if ((costQry.length > 0) && (costQry[0].expectedcost !== null)) {
    expectedCost = costQry[0].expectedcost;
  }

  return expectedCost;

}
