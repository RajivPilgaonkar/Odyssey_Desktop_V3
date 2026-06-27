import React from 'react';
import { dbGetRecordRaw, dbExecuteSp } from '../../actions';
import { convert_DbDate_To_DMY,convert_DbDate_To_HHmm, dateDiff_DMY } from "../common/CommonTransactionFunctions";

import moment from 'moment';

const SUB_TITLE_COLOR = 'rgb(102, 102, 102)';
const GREEN_COLOR = '#008000';
const CAR_ODD_GROUP_COLOR = '#b3ffcc';
const CAR_EVEN_GROUP_COLOR = '#d7b3ff';
const OVERNIGHT_JOURNEY_COLOR = '#ac00e6';
const WARN_ERR_SEPARATOR_COLOR = '#e1e1d0';

//**********************************************************/
export const getPrestoBodyObj = async(recipientObj, mailData, tourCode, paxName, numPax, confirmation, users_id) => {

  /*=== STEP 1 ===*/
  let body = recipientObj.salutationLine + '\r\n\r\n';
  
  /*=== STEP 2 ===*/
  /*=== Body ===*/
  if (confirmation) {
    body += 'Request for Reservation ' + tourCode;
  } else {
    body += 'Request for cancellation of Reservation for Tour Code ' + tourCode;
  }
  body += "\r\n\r\n";

  if (confirmation) {
    body += 'We kindly request you to confirm the following:';
  } else {
    body += 'You had confirmed the following booking:';
  }

  body += "\r\n\r\n";
  body += tourCode + "\r\n";
  body += paxName + " (" + mailData.NumPax.toString() + " pax)";
  body += "\r\n\r\n";

  body += mailData.Organisation + ", " + mailData.City;
  body += "\r\n";
  body += mailData.ServiceString.replace(/\r\r?/g, "\r\n").replace(/\r\n?/g, "\r\n");

  body += "\r\n";

  if (mailData.PaxNames !== null && mailData.PaxNames.trim().length > 0) {
    body += 'Pax:';
    body += "\r\n";
    body += mailData.PaxNames.replace(/,/g, "");
    body += "\r\n";
    body += "\r\n";
  }

  const remarks = (confirmation) ? mailData.RemarksReservation : mailData.RemarksCancel;
  
  if (confirmation) {
    body += (remarks !== null) ? remarks + "\r\n\r\n" : "";
    body += 'Please send us your confirmation by return e-mail. ' + 
      'We will then send you our voucher at the earliest.';
      body += "\r\n\r\n";
  } else {
    body += 'Please note that the clients have changed their itinerary. ' + 
      'We kindly request you therefore to cancel the reservation ' + 
      'for the above dates';
    body += "\r\n\r\n";
    body += (remarks !== null) ? remarks + "\r\n\r\n" : "";
    body += 'We apologize for any inconvenience caused due to this cancellation. ';
    body += "\r\n\r\n";
  }

  /*=== STEP 3 ===*/
  /*=== Body Footer ===*/
  /*=== Current User ===*/
  body += 'Best Regards, \r\n\r\n';
  body += recipientObj.userName + '\r\n';
  body += 'Reservations Dept.\r\n\r\n';

  /*=== STEP 4 ===*/
  /*=== Company Details for Odyssey ===*/
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
  body += company[0].city + '\r\n';
  body += 'Tel: (' + company[0].areacode.trim() + ') ' + company[0].phone + '\r\n';
  body += 'Fax: ' + company[0].fax + '\r\n';

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
    senderEmail: user[0].Email
  };

  return (bodyObj);

}

//**********************************************************/
export const driveableDistance = async(fromCities_id, toCities_id) => {

  const query = "SELECT Drive " + 
  "FROM Distances " + 
  "WHERE From_Cities_id = " + fromCities_id.toString() + " " +
  "AND To_Cities_id = " + toCities_id.toString() + " ";

  const queryObj = await dbGetRecordRaw({query: query });

  let driveable = false;
  if (queryObj.length > 0 && queryObj[0].Drive) {
    driveable = true;
  }

  return driveable;

}

//**********************************************************/
export const isCostingPresent = async(travelDate, driveTypes_id, vehicles_id, agents_id, costingObj) => {

  if (driveTypes_id === null || vehicles_id === null || agents_id === null) {
    return true;
  }

  if (driveTypes_id === 3 && costingObj.carHireGroups_id === null) {
    return true;
  }

  let query = "";

  if (driveTypes_id === 1) {
    query = "SELECT CarHire_id " + 
      "FROM CarHire " + 
      "WHERE Addressbook_id = " + agents_id.toString() + " " +
      "AND Vehicles_id = " + vehicles_id.toString() + " " +
      "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
      "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) ";
  } else if (driveTypes_id === 2) {
    query = "SELECT CarHireP2P_id AS CarHire_id " + 
      "FROM CarHireP2P " + 
      "WHERE Addressbook_id = " + agents_id.toString() + " " +
      "AND Vehicles_id = " + vehicles_id.toString() + " " +
      "AND FromCities_id = " + costingObj.fromCities_id.toString() + " " +
      "AND ToCities_id = " + costingObj.toCities_id.toString() + " " +
      "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
      "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) ";
  } else if (driveTypes_id === 3) {
    query = "SELECT CarHireGroupCosts_id AS CarHire_id " + 
      "FROM CarHireGroupCosts " + 
      "WHERE Addressbook_id = " + agents_id.toString() + " " +
      "AND Vehicles_id = " + vehicles_id.toString() + " " +
      "AND CarHireGroups_id = " + costingObj.carHireGroups_id.toString() + " " +
      "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
      "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) ";
  }

  const queryObj = await dbGetRecordRaw({query: query });

  let isCostingPresent = false;
  if (queryObj.length > 0 && queryObj[0].CarHire_id) {
    isCostingPresent = true;
  }

  return isCostingPresent;

}

//**********************************************************/
export const isElementCostingPresent = async(travelDate, driveTypes_id, vehicles_id, agents_id, costingObj) => {

  if (driveTypes_id === null || vehicles_id === null || agents_id === null) {
    return true;
  }

  if (driveTypes_id === 3 && costingObj.carHireGroups_id === null) {
    return true;
  }

  let query = "";

  if (driveTypes_id === 1) {
    query = "SELECT ElemCars_id " + 
      "FROM ElemCars " + 
      "WHERE Addressbook_id = " + agents_id.toString() + " " +
      "AND FromCities_id = " + costingObj.fromCities_id.toString() + " " +
      "AND ToCities_id = " + costingObj.toCities_id.toString() + " " +
      "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
      "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) ";
  } else if (driveTypes_id === 2) {
    query = "SELECT ElemInterCities_id AS ElemCars_id " + 
      "FROM ElemInterCities " + 
      "WHERE Addressbook_id = " + agents_id.toString() + " " +
      "AND FromCities_id = " + costingObj.fromCities_id.toString() + " " +
      "AND ToCities_id = " + costingObj.toCities_id.toString() + " " +
      "AND (('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet) " +  
      "OR ('" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL)) ";
  } else if (driveTypes_id === 3) {
    query = "SELECT ElemCityGroups_id AS ElemCars_id " + 
      "FROM ElemCityGroups " + 
      "WHERE Addressbook_id = " + agents_id.toString() + " " +
      "AND CarHireGroups_id = " + costingObj.carHireGroups_id.toString() + " " +
      "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
      "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) ";
  }

  const queryObj = await dbGetRecordRaw({query: query });

  let isCostingPresent = false;
  if (queryObj.length > 0 && queryObj[0].ElemCars_id) {
    isCostingPresent = true;
  }

  return isCostingPresent;

}


//**********************************************************/
export const isTrainValid = async(trainNo, travelDate, fromCities_id, toCities_id) => {

  if (trainNo === null) {
    return true;
  }

  const citiesArr = fromCities_id.toString() + ',' + toCities_id.toString();

  const query = "SELECT td.nights, departure, arrival, td.cities_id " + 
    "FROM Trains t " +
    "LEFT JOIN TrainDetails td ON t.trains_id = td.trains_id " +
    "WHERE t.TrainNo = '" + trainNo.trim() + "'" +
    "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
    "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) " + 
    "AND td.Cities_id IN (" + citiesArr + ") " +
    "ORDER BY kms";

  const queryObj = await dbGetRecordRaw({query: query });

  let isValidTrain = false;
  if (queryObj.length > 1) {
    let index = queryObj.findIndex(rec => rec.cities_id === fromCities_id);
    if (index > -1) {
      index = queryObj.findIndex(rec => rec.cities_id === toCities_id);
    }
    isValidTrain = (index > -1) ? true : false;
  }

  return isValidTrain;

}

//**********************************************************/
export const areTrainTimingsValid = async(trainNo, travelDate, fromCities_id, toCities_id, ETD, ETA) => {

  if (trainNo === null) {
    return true;
  }

  const citiesArr = fromCities_id.toString() + ',' + toCities_id.toString();

  const query = "SELECT td.nights, departure, arrival, td.cities_id " + 
    "FROM Trains t " +
    "LEFT JOIN TrainDetails td ON t.trains_id = td.trains_id " +
    "WHERE t.TrainNo = '" + trainNo.trim() + "'" +
    "AND ('" + moment(travelDate).format('MM/DD/YYYY') + "' BETWEEN Wef AND Wet " +  
    "OR '" + moment(travelDate).format('MM/DD/YYYY') + "' >= wef AND wet IS NULL) " + 
    "AND td.Cities_id IN (" + citiesArr + ") " +
    "ORDER BY kms";

  const queryObj = await dbGetRecordRaw({query: query });

  let isValidTrainTiming = false;
  let timingsOk = false;
  if (queryObj.length > 1) {
    let index = queryObj.findIndex(rec => rec.cities_id === fromCities_id);
    const dep = queryObj[index].departure.replace('T', ' ').replace('Z', '');
    if (index > -1) {
      index = queryObj.findIndex(rec => rec.cities_id === toCities_id);
      const arr = queryObj[index].arrival.replace('T', ' ').replace('Z', '');      
      if (moment(ETD).format('HH:mm') === moment(dep).format('HH:mm') || moment(ETA).format('HH:mm') === moment(arr).format('HH:mm')) {
        timingsOk = true;
      }
    }
    isValidTrainTiming = (index > -1 && timingsOk) ? true : false;
  }

  return isValidTrainTiming;

}

//**********************************************************/
export const isClassValid = async(tickets_id, class_id) => {

  const query = "SELECT [dbo].[fn_ValidClass] (" + 
    tickets_id.toString() + "," +
    class_id.toString() + ")  AS Valid";

  const queryObj = await dbGetRecordRaw({query: query });

  let isValidClass = false;
  if (queryObj.length > 0) {
    isValidClass = (queryObj[0].Valid === 1) ? true : false;
  }

  return isValidClass;

}


//**********************************************************/
export const isRiksjaNetwork = async(quotations_id) => {

  const query = "SELECT q.PrincipalAgents_id, pand.PricipalAgentNetworks_id " +
    "FROM Quotations q LEFT JOIN PrincipalAgentNetworkDetails pand ON q.PrincipalAgents_id = pand.Addressbook_id " +
    "WHERE q.Quotations_id = " + quotations_id.toString();
 
  const queryObj = await dbGetRecordRaw({query: query});

  let isRiksjaNetwork = false;
  if (queryObj.length > 0 && queryObj[0].PricipalAgentNetworks_id === 1) {
    isRiksjaNetwork = true;
  }

  return isRiksjaNetwork;
  
}

//**********************************************************/
export const getTourStartTime = async(quotations_id) => {

  const query = "SELECT StartDate, DateOfArrival, ETA " + 
    "FROM Quotations where Quotations_id = " + quotations_id.toString();
 
  const queryObj = await dbGetRecordRaw({query: query});

  let startTime = queryObj[0].StartDate.replace('T', ' ').replace('Z', '');
  if (queryObj[0].ETA !== null) {
    startTime = queryObj[0].ETA.replace('T', ' ').replace('Z', '');
  } else if (queryObj[0].DateOfArrival !== null) {
    startTime = queryObj[0].DateOfArrival.replace('T', ' ').replace('Z', '');
  }

  return startTime;
  
}

//**********************************************************/
export const getTourEndTime = async(quotations_id) => {

  let endTime = null;

  let query = "SELECT EndDate, DateOfDeparture, ETD " + 
    "FROM Quotations where Quotations_id = " + quotations_id.toString();
 
  let queryObj = await dbGetRecordRaw({query: query});

  if (queryObj[0].ETD !== null && moment(queryObj[0].ETD) > moment('01/01/2000')) {
    endTime = queryObj[0].ETD.replace('T', ' ').replace('Z', '');
  } else if (queryObj[0].DateOfDeparture !== null && moment(queryObj[0].DateOfDeparture) > moment('01/01/2000')) {
    endTime = queryObj[0].DateOfDeparture.replace('T', ' ').replace('Z', '');
  } else {
    query = "SELECT MAX(TimeOut) AS MaxTimeOut FROM QuoCities " + 
      "WHERE Quotations_id = " + quotations_id.toString();

    let queryObj = await dbGetRecordRaw({query: query});

    endTime = queryObj[0].DateOfDeparture.replace('T', ' ').replace('Z', '');
  }

  return endTime;
  
}

//**********************************************************/
export const getQuoCitiesTimeLimits = async(quotations_id, quoCities_id, quoCityData) => {

  let fromTime = null;
  let toTime = null;

  const index = quoCityData.findIndex(rec => rec.QuoCities_id === quoCities_id);
  if (index !== -1) {
    if (index === 0) {
      fromTime = await getTourStartTime(quotations_id);
    } else {
      fromTime = quoCityData[index-1].TimeOut;
    }
    if (index === quoCityData.length-1) {
      toTime = await getTourEndTime(quotations_id);
    } else {
      toTime = quoCityData[index+1].TimeIn;
    }
  }

  const timeLimit = {fromTime: fromTime, toTime: toTime};

  return timeLimit;
  
}

  //**********************************************************/
  export const checkActivityErrors = async (type, data, quotations_id, quoActivity_id) => {

    const activityArr = [
      {type: 1, sp: 'p_QuoCheckTickets', elemField: 'quoTickets_id', field: 'QuoTickets_id'},
      {type: 2, sp: 'p_QuoCheckAccommodation', elemField: 'quoAccommodation_id', field: 'QuoAccommodation_id'},
      {type: 3, sp: 'p_QuoCheckSightseeing', elemField: 'quoServices_id', field: 'QuoServices_id'},
      {type: 4, sp: 'p_QuoCheckTransfers', elemField: 'quoServices_id', field: 'QuoServices_id'}
    ]

    const obj = activityArr.filter(rec => rec.type === type);

    let query = "EXEC " + obj[0].sp + " " +
      quotations_id.toString() + "," +
      ((quoActivity_id === null) ? "null" : quoActivity_id.toString());

    if (type === 1) {
      query = "EXEC " + obj[0].sp + " " +
        quotations_id.toString();
    }

    let errorArr = await dbGetRecordRaw({query: query});

    for (var rec of errorArr) {
      const elemField = rec[obj[0].field];
      const index = data.findIndex(elem => elem[obj[0].elemField] === elemField);      

      if (index !== -1 && elemField !== null) {
        // give error precedence over warning
        data[index].ErrorType = (data[index].ErrorType === 2) ? 2 : rec.ErrorType;
        data[index].ErrorMsg += (data[index].ErrorMsg.trim().length > 0 ? '\n' : '') + rec.ErrorDesc;
        data[index].ErrorList.push({errorType: rec.ErrorType, errorMsg: rec.ErrorDesc});

      }
    }

  }

//**********************************************************/
export const getModuleStatus = async(quotations_id) => {

  let query = "SELECT q.StartDate, q.TourCode " +
    "FROM Quotations q " +
    "WHERE q.Quotations_id = " + quotations_id.toString();
 
  const quoArr = await dbGetRecordRaw({query: query});

  let moduleObj = {exists: false, tourCode: (quoArr.length > 0 && quoArr[0].TourCode !== null) ? quoArr[0].TourCode : '' };

  if (quoArr.length > 0 && quoArr[0].StartDate !== null) {

    if (quoArr[0].TourCode !== null && quoArr[0].TourCode.trim() > '') {
      query = "SELECT qm.TourCode " +
      "FROM QuoModules qm " +
      "WHERE TourCode = '" + quoArr[0].TourCode.trim() + "'";

      const modArr = await dbGetRecordRaw({query: query});
    
      moduleObj.exists = (modArr.length > 0) ? true : false;

    } 

  }

  return moduleObj;
  
}

//**********************************************************/
export const getTourMasterStatus = async(quotations_id) => {

  let query = "SELECT q.StartDate, q.TourCode, TourNo, Reference " +
    "FROM Quotations q " +
    "WHERE q.Quotations_id = " + quotations_id.toString();
 
  const quoArr = await dbGetRecordRaw({query: query});

  let masterObj = {exists: false, tourCode: (quoArr.length > 0 && quoArr[0].TourCode !== null) ? quoArr[0].TourCode.trim() : '',
    tourNo: (quoArr.length > 0 && quoArr[0].TourNo !== null) ? quoArr[0].TourNo : '',
    reference: (quoArr.length > 0 && quoArr[0].Reference !== null) ? quoArr[0].Reference.trim() : '',
    masters_id: null, itineraries_id: null
  };

  query = "SELECT COUNT(*) AS x_count " +
    "FROM QuoBookingsClients q " +
    "WHERE q.Quotations_id = " + quotations_id.toString();    
 
  const clientsArr = await dbGetRecordRaw({query: query});
  masterObj.numPax = clientsArr[0].x_count;

  query = "SELECT COUNT(*) AS x_count " +
    "FROM BookingsClients bc " +
    "LEFT JOIN Bookings b ON bc.Bookings_id = b.Bookings_id " +
    "WHERE b.Quotations_id = " + quotations_id.toString();    
 
  const bookingsArr = await dbGetRecordRaw({query: query});
  masterObj.numBooked = bookingsArr[0].x_count;

  if (quoArr.length > 0 && quoArr[0].StartDate !== null) {

    if (quoArr[0].TourCode !== null && quoArr[0].TourCode.trim() > '') {
      query = "SELECT m.MasterCode, m.masters_id " +
        "FROM Masters m " +
        "WHERE m.MasterCode = '" + quoArr[0].TourCode.trim() + "'";

      const modArr = await dbGetRecordRaw({query: query});
    
      masterObj.exists = (modArr.length > 0) ? true : false;
      masterObj.masters_id = (modArr.length > 0) ? modArr[0].masters_id : null;

      if (modArr.length > 0 && modArr[0].masters_id !== null) {
        query = "SELECT i.itineraries_id " +
          "FROM Itineraries i " +
          "WHERE i.masters_id = " + modArr[0].masters_id.toString();

        const itinArr = await dbGetRecordRaw({query: query});

        masterObj.itineraries_id = (itinArr.length > 0) ? itinArr[0].itineraries_id : null;

      }

    } 

  }

  return masterObj;
  
}


//**********************************************************/
export const setMastersId = async(mainData) => {

  for (var rec of mainData) {

    if (rec.TourCode !== null && rec.TourCode.trim() > '') {
      const query = "SELECT m.MasterCode, m.masters_id " +
        "FROM Masters m " +
        "WHERE m.MasterCode = '" + rec.TourCode.trim() + "'";

      const masterArr = await dbGetRecordRaw({query: query});

      if (masterArr.length > 0 && masterArr[0].masters_id !== null) {
        rec.Masters_id = masterArr[0].masters_id;
      }

    }

  }

}  

//**********************************************************/
export const getQuoCitiesId = async(quotations_id, activityDate, inCities_id) => {

  let quoCities_id = null;
  let cities_id = null;

  /*=== The cities_id is required since for Delhi-Agra-Delhi, you are in 2 cities on the same day ===*/
  let query = "SELECT QuoCities_id, ToCities_id FROM QuoCities qc " +
    "WHERE qc.Quotations_id = " + quotations_id.toString() + " " +
    "AND qc.ToCities_id = " + inCities_id.toString();

  let quoArr = await dbGetRecordRaw({query: query});

  if (quoArr.length === 1 && quoArr[0].QuoCities_id !== null) {
    quoCities_id = quoArr[0].QuoCities_id;
    cities_id = quoArr[0].ToCities_id;
  } else {

    query = "SELECT QuoCities_id, ToCities_id FROM QuoCities qc " +
    "WHERE qc.Quotations_id = " + quotations_id.toString() + " " +
    "AND '" + activityDate + " 00:00' BETWEEN TimeIn AND TimeOut " +
    "AND qc.ToCities_id = " + inCities_id.toString();

    quoArr = await dbGetRecordRaw({query: query});

    if (quoArr.length > 0 && quoArr[0].QuoCities_id !== null) {
      quoCities_id = quoArr[0].QuoCities_id;
      cities_id = quoArr[0].ToCities_id;
    } else {

      query = "SELECT QuoCities_id, ToCities_id FROM QuoCities qc " +
      "WHERE qc.Quotations_id = " + quotations_id.toString() + " " +
      "AND '" + activityDate + " 23:59' BETWEEN TimeIn AND TimeOut " + 
      "AND qc.ToCities_id = " + inCities_id.toString();

      quoArr = await dbGetRecordRaw({query: query});

      if (quoArr.length > 0 && quoArr[0].QuoCities_id !== null) {
        quoCities_id = quoArr[0].QuoCities_id;
        cities_id = quoArr[0].ToCities_id;
      }    

    }

  }

  const quoCitiesObj = {quoCities_id: quoCities_id, cities_id: cities_id};

  return quoCitiesObj;
  
}

//**********************************************************/
export const getServiceTimings = async(services_id) => {

  let timings = '';

  let query = "SELECT [dbo].[fn_GetServiceTimings] (" + services_id.toString() + ") AS Timings";

  let timingArr = await dbGetRecordRaw({query: query});

  if (timingArr.length > 0 && timingArr[0].Timings !== null) {
    timings = timingArr[0].Timings;
  } 

  const splitTimings = timings.split(",");
  let firstTiming = splitTimings[0];  
  firstTiming = (firstTiming === null) ? '' : firstTiming.trim();

  const timingObj = {timings: timings, firstTiming: firstTiming};

  return timingObj;
  
}

//**********************************************************/
export const getVehicle = async(quotations_id, addressbook_id, services_id, serviceDate) => {

  let numPax = 2;
  let vehicles_id = null;
  let numVehicles = 1;

  let query = "SELECT NumPax, Vehicles_id FROM Quotations WHERE Quotations_id = " + quotations_id.toString();

  let quoArr = await dbGetRecordRaw({query: query});

  if (quoArr.length > 0) {
    numPax = (quoArr[0].NumPax !== null && quoArr[0].NumPax !== 0) ? quoArr[0].NumPax : numPax;
    vehicles_id = (quoArr[0].Vehicles_id !== null && quoArr[0].Vehicles_id !== 0) ? quoArr[0].Vehicles_id : vehicles_id;
  } 
  const vehicles_id_str = (vehicles_id === null) ? 'null' : vehicles_id.toString();

  query = "SELECT Vehicles_id, NumVehicles FROM  [dbo].[fn_GetVehicles]  (" + 
    addressbook_id.toString() + ", " + services_id.toString() + ", '" +
    serviceDate + "'," + vehicles_id_str + "," + numPax.toString();

  const vehArr = await dbGetRecordRaw({query: query});

  if (vehArr.length > 0) {
    vehicles_id = vehArr[0].Vehicles_id;
    numVehicles = vehArr[0].NumVehicles;
  } 

  const vehObj = {vehicles_id: vehicles_id, numVehicles: numVehicles};

  return vehObj;
  
}


//**********************************************************/
export const isSectorDrivable = async(fromCities_id, toCities_id) => {

  const query = "SELECT drive, distance " + 
    "FROM Distances " +
    "WHERE from_cities_id = " + fromCities_id.toString() + " " +
    "AND to_cities_id = " + toCities_id.toString() + " ";

  const queryObj = await dbGetRecordRaw({query: query });

  let isSectorDrivable = false;
  if (queryObj.length > 0) {
    isSectorDrivable = (queryObj[0].drive);
  }

  return isSectorDrivable;

}

//**********************************************************/
export const getDriveDetails = async(fromCities_id, toCities_id) => {

  let query = "SELECT drive, distance " + 
    "FROM Distances " +
    "WHERE from_cities_id = " + fromCities_id.toString() + " " +
    "AND to_cities_id = " + toCities_id.toString() + " ";

  let queryObj = await dbGetRecordRaw({query: query });

  let isSectorDrivable = false;
  let kms = 0;
  let durationMin = 0;
  let remarks = 'This sector is not driveable';
  if (queryObj.length > 0) {
    isSectorDrivable = (queryObj[0].drive);
    kms = (queryObj[0].distance !== null) ? queryObj[0].distance : 0;
    if (isSectorDrivable) {
      query =  "SELECT [dbo].[fn_GetCityTravelDuration](" + 
        fromCities_id.toString() + "," + toCities_id.toString() + ") AS Duration";

      queryObj = await dbGetRecordRaw({query: query });

      if (queryObj.length > 0 && queryObj[0].Duration !== null && queryObj[0].Duration.length === 5) {
        const hours = queryObj[0].Duration.substr(0,2);
        let min = queryObj[0].Duration.substr(3,2);
        durationMin = parseInt(min) + parseInt(hours)*60;      
      }

      remarks = 'This sector is ' + kms.toString() + ' kms and would take ' + queryObj[0].Duration + ' hrs.';

    } 
  }

  return ({isSectorDrivable: isSectorDrivable, kms: kms, durationMin: durationMin, remarks: remarks});

}

//**********************************************************/
export const getQuoTicketDriveDetails = async(quoTickets_id) => {

  let query = "SELECT From_Cities_id, To_Cities_id " + 
    "FROM QuoTickets " +
    "WHERE QuoTickets_id = " + quoTickets_id.toString();

  let queryObj = await dbGetRecordRaw({query: query });

  let fromCities_id = -1;
  let toCities_id = -1;
  if (queryObj.length > 0) {
    fromCities_id = queryObj[0].From_Cities_id;
    toCities_id = queryObj[0].To_Cities_id;
  }

  query = "SELECT drive, distance " + 
    "FROM Distances " +
    "WHERE from_cities_id = " + fromCities_id.toString() + " " +
    "AND to_cities_id = " + toCities_id.toString() + " ";

  queryObj = await dbGetRecordRaw({query: query });

  let isSectorDrivable = false;
  let kms = 0;
  let durationMin = 0;
  let remarks = 'This sector is not driveable';
  let remarksVia = '';
  if (queryObj.length > 0) {
    isSectorDrivable = (queryObj[0].drive);
    kms = (queryObj[0].distance !== null) ? queryObj[0].distance : 0;
    if (isSectorDrivable) {
      query =  "SELECT [dbo].[fn_QuoGetCityTravelDuration](" + 
        quoTickets_id.toString() + ") AS Duration";

      queryObj = await dbGetRecordRaw({query: query });

      if (queryObj.length > 0 && queryObj[0].Duration !== null && queryObj[0].Duration.length === 5) {
        const hours = queryObj[0].Duration.substr(0,2);
        let min = queryObj[0].Duration.substr(3,2);
        durationMin = parseInt(min) + parseInt(hours)*60;      
      }

      remarks = 'This sector is ' + kms.toString() + ' kms and would take ' + queryObj[0].Duration + ' hrs.';

      query = "SELECT qtcc.QuoTicketsCityCrossings_id, c.City, qtcc.Selected  " + 
        "FROM QuoTicketsCityCrossings qtcc " +
        "LEFT JOIN Cities c ON qtcc.Cities_id = c.Cities_id " +
        "WHERE QuoTickets_id = " + quoTickets_id.toString() + " ";

      queryObj = await dbGetRecordRaw({query: query });

      let cities = queryObj.filter(rec => rec.Selected);
      for (let [index,rec] of cities.entries()) {
        if (remarksVia.length > 0) {
          remarksVia += (index === cities.length-1) ? ' and ' : ', ';
        }
        remarksVia += rec.City;
      }
  
      if (remarksVia.length > 0) {
        remarksVia = ' (via ' + remarksVia + ')';
      }
  
    }
  }

  return ({isSectorDrivable: isSectorDrivable, kms: kms, durationMin: durationMin, remarks: remarks + remarksVia});

}

//**********************************************************/
export const getArrivalDepartureString = async(quotations_id) => {

  let arrivalString = '';
  let departureString = '';

  let query = "SELECT * FROM dbo.[fn_GetArrivalDepartureString](" + quotations_id.toString() + ")";

  let quoArr = await dbGetRecordRaw({query: query});

  if (quoArr.length > 0) {
    arrivalString = (quoArr[0].ArrivalString !== null) ? 'Arrival: ' + quoArr[0].ArrivalString : '';
    departureString = (quoArr[0].DepartureString !== null) ? 'Departure: ' + quoArr[0].DepartureString : '';
  } 

  const arrDepObj = {arrivalString: arrivalString, departureString: departureString};

  return arrDepObj;
  
}

//**********************************************************/
export const getDataIndex = (array, key) => {
  const idx = array.findIndex(elem => elem === key);
  return idx;
}

//**********************************************************/
export const groupCitywiseData = async (quotations_id, mainData) => {

  /*=== Rearrange QuoCities timings ====*/
  let sql = 'EXEC [p_ActivityCityDates] ' + quotations_id.toString() + ', 1';
  let spData = {sql: sql};
  const cityDateData = await dbExecuteSp(spData);  

  /*=== cityDateData with additional properties ===*/
  const groupedData = cityDateData.map(rec => ({key: rec.CityName, items: [], activityDate: rec.ActivityDate, cities_id: rec.Cities_id}));

  /*=== for each city group ===*/
  for (const rec of groupedData) {
    /*=== find first occurrence of city/date ===*/
    let idx = mainData.findIndex(elem => elem.cities_id === rec.cities_id && convert_DbDate_To_DMY(elem.activityDate,1) === rec.activityDate);
    /*=== if found ===*/
    if (idx > -1) {
      let done = false;
      while (!done) {
        /*=== if first found index matches grouped city ===*/
        if (mainData[idx].cities_id === rec.cities_id) {

          /*=== done this way since linter gives error --- "Don't make functions within a loop" ===*/
          const dataIdx = getDataIndex(rec.items, mainData[idx].activityDateDMY);          

          if (dataIdx ===  -1) {
            /*=== Add date to city items properties ===*/
            rec.items.push(convert_DbDate_To_DMY(mainData[idx].activityDate,1));
          }

          /*=== And first found index is not in city item list of dates ===*/
          //if (rec.items.findIndex(elem => elem === convert_DbDate_To_DMY(mainData[idx].activityDate,1)) === -1) {
            /*=== Add date to city items properties ===*/
            //rec.items.push(convert_DbDate_To_DMY(mainData[idx].activityDate,1));
          //}
        }
        idx++;
        /*=== done when index is greater than array length or next city is different ===*/
        done = ((idx >= mainData.length) || (mainData[idx].cities_id !== rec.cities_id));
      }
    }
  }

  return groupedData;
      
}


//**********************************************************/
export const getActivityData = async (quotations_id, type) => {

  let accommodationData = [];
  let servicesData = [];
  let ticketsData = [];
  let data = [];

  /*=== Get Accommodation ===*/
  let query = "SELECT qa.QuoAccommodation_id, qa.QuoCities_id, qa.DateIn, qa.DateOut,  " + 
    "a.Organisation AS Hotel, qa.AC, rt.RoomType, mp.[Plan] AS MealPlan, " +
    "qa.ReserveHotelOvernight, qa.Nights, " + 
    "COALESCE(qa.Singles,0) AS NumSingles, " + 
    "COALESCE(qa.Doubles,0) AS NumDoubles, " + 
    "COALESCE(qa.Triples,0) AS NumTriples, " + 
    "COALESCE(qa.Twins,0) AS NumTwins, " + 
    "c.City, qa.Cities_id, " +
    "qa.LateCheckOut " +
    "FROM QuoAccommodation qa " +
    "LEFT JOIN Quotations q ON qa.Quotations_id = q.Quotations_id " +
    "LEFT JOIN Addressbook a ON qa.HotelAddressbook_id = a.Addressbook_id " +
    "LEFT JOIN Cities c ON a.Cities_id = c.Cities_id " +
    "LEFT JOIN RoomTypes rt ON qa.RoomTypes_id = rt.RoomTypes_id " +
    "LEFT JOIN MealPlans mp ON qa.MealPlans_id = mp.MealPlans_id " +
    "WHERE qa.Quotations_id = " + quotations_id.toString() + " ";

  if (type === null || type === 2) {
    data = await dbGetRecordRaw({query: query});
    accommodationData = data.map(rec => {return {...rec, DateIn: (rec.DateIn !== null) ? rec.DateIn.replace('T', ' ').replace('Z', '') : null, 
      DateOut: (rec.DateOut !== null) ? rec.DateOut.replace('T', ' ').replace('Z', '') : null}});  
  }

  /*=== Get Services ===*/
  query = "SELECT qs.QuoServices_id, qs.QuoCities_id, qs.Sightseeing, s.[description] AS Service, " +
    "qs.ServiceDate, qs.StartTime, a.Organisation AS Agent, qs.Transport, qs.Guide, " +
    "qs.EntranceFees, v.Vehicle, qs.NoOfVehicles, qs.DaysOfOperation,qs.Place, " +
    "qs.TransferTypes_id, qs.FlightNo, qs.FlightDepTime, s.Duration, c.City, qs.Cities_id, " +
    "qs.LinkServices_id " +
    "FROM QuoServices qs " +
    "LEFT JOIN [services] s ON qs.Services_id = s.services_id " +
    "LEFT JOIN Addressbook a ON qs.AgentAddressbook_id = a.Addressbook_id " +
    "LEFT JOIN vehicles v ON qs.Vehicles_id = v.vehicles_id " +
    "LEFT JOIN Cities c ON qs.Cities_id = c.Cities_id " +
    "WHERE qs.Quotations_id = " + quotations_id.toString() + " " +
    "AND qs.Selected = 1 " + 
    "AND qs.ServiceDate IS NOT NULL " + 
    "AND qs.StartTime IS NOT NULL";

  if (type === null || type === 3) {
    data = await dbGetRecordRaw({query: query});
    servicesData = data.map(rec => {return {...rec, ServiceDate: (rec.ServiceDate !== null) ? rec.ServiceDate.replace('T', ' ').replace('Z', '') : rec.ServiceDate, StartTime: (rec.StartTime !== null) ? rec.StartTime.replace('T', ' ').replace('Z', '') : rec.StartTime}});
  }

  /*=== Get Tickets ===*/
  query = "SELECT qt.QuoTickets_id, qt.QuoCities_id, " +
    "qt.TravelDate, c1.city AS FromCity, c2.city AS ToCity, t.details AS Mode, " +
    "qt.Tickets_id, qt.NoOfTickets, qt.FlightNo, qt.TrainNo, c.Class, " +
    "ts1.stationname AS FromStation, ts2.stationname AS ToStation, " +
    "qt.ETD, qt.ETA, qt.Nights, qt.Overnight, qt.CarReportDate, qt.CarReleaseDate, " +
    "qt.ReserveHotelOvernight, v.Vehicle, a.Organisation AS Agent, dt.DriveType, " +
    "qt.From_Cities_id, qt.To_Cities_id, qt.GroupNo " +
    "FROM QuoTickets qt " +
    "LEFT JOIN Cities c1 ON qt.From_Cities_id = c1.cities_id " +
    "LEFT JOIN Cities c2 ON qt.To_Cities_id = c2.cities_id " +
    "LEFT JOIN Tickets t ON qt.Tickets_id = t.tickets_id " +
    "LEFT JOIN Class c ON qt.Class_id = c.class_id " +
    "LEFT JOIN trainstations ts1 ON qt.From_TrainStations_id = ts1.trainstations_id " +
    "LEFT JOIN trainstations ts2 ON qt.To_TrainStations_id = ts2.trainstations_id " +
    "LEFT JOIN DriveTypes dt ON qt.DriveTypes_id = dt.DriveTypes_id " +
    "LEFT JOIN Addressbook a ON qt.AgentAddressbook_id = a.Addressbook_id " +
    "LEFT JOIN vehicles v ON qt.Vehicles_id = v.vehicles_id " +
    "WHERE qt.Quotations_id = " + quotations_id.toString();

  if (type === null || type === 1) {
    data = await dbGetRecordRaw({query: query});
    ticketsData = data.map(rec => {return {...rec, TravelDate: rec.TravelDate.replace('T', ' ').replace('Z', ''), ETA: rec.ETA.replace('T', ' ').replace('Z', ''), ETD: rec.ETD.replace('T', ' ').replace('Z', '')}});
  }

  /*=== go through tickets ===*/
  for (var rec of ticketsData) {

    /*=== only for cars where either vehicle or agent is null ===*/
    if ((rec.Tickets_id === 5 && (rec.Vehicle === null || rec.Agent === null))) {

      /*=== Get first sector of drive ===*/
      query = "SELECT QuoTickets_id FROM QuoTickets qt " +
        "WHERE qt.Quotations_id = " + quotations_id.toString() + " " +
        "AND qt.GroupNo = " + rec.GroupNo.toString() + " " +
        "AND qt.Tickets_id = 5 " + 
        "AND qt.ChangeCar = 1";

      const sectorData = await dbGetRecordRaw({query: query});

      /*=== QuoTickets_id of the record located ===*/
      const sectorId = (sectorData.length > 0 && sectorData[0].QuoTickets_id !== null) ? sectorData[0].QuoTickets_id : -1;
        
      /*=== Get from QuoLines (This is done for compatibility with old data) ===*/
      query = "SELECT v.Vehicle, a.Organisation AS Agent " +
        "FROM QuoLines ql " +
        "LEFT JOIN vehicles v ON ql.Vehicles_id = v.vehicles_id " +
        "LEFT JOIN Addressbook a ON ql.CarHireAgents_id = a.Addressbook_id " +    
        "WHERE ql.Quotations_id = " + quotations_id.toString() + " " +
        "AND ql.QuoTickets_id = " + sectorId.toString() + " ";

      const lineData = await dbGetRecordRaw({query: query});

      /*=== Get vehicle & agent (if null) from quoLines ===*/
      if (lineData.length > 0) {
        if (rec.Vehicle === null && lineData[0].Vehicle !== null) {
          rec.Vehicle = lineData[0].Vehicle;
        }
        if (rec.Agent === null && lineData[0].Agent !== null) {
          rec.Agent = lineData[0].Agent;
        }
      }
      
    }
  }

  return ({accommodationData: accommodationData, servicesData: servicesData, ticketsData: ticketsData});

}

//**********************************************************/
export const getActivityDescription = (rec, activityData) => {

  let line_1a = '';
  let line_1b = '';    
  let line_1c = (rec.comments !== null) ? rec.comments.trim() : '';    
  line_1c += line_1c.length > 0 ? '\n' : '';
  line_1c += (rec.servicesComments !== null) ? rec.servicesComments.trim() : '';    

  const ticketsData = activityData.ticketsData;
  const accData = activityData.accommodationData;
  const servicesData = activityData.servicesData;

  if (rec.activityType === 1) {
    const idx = ticketsData.findIndex(elem => elem.QuoTickets_id === rec.quoTickets_id);
    if (idx > -1) {
      if (ticketsData[idx].NoOfTickets > 0 && (ticketsData[idx].Tickets_id === 1 || ticketsData[idx].Tickets_id === 2)) {
        line_1a += ticketsData[idx].NoOfTickets.toString() + ' ticket';
        line_1a += (ticketsData[idx].NoOfTickets > 1) ? 's' : '';
        line_1a += ' in ' + ticketsData[idx].Class;
      } else if (ticketsData[idx].NoOfTickets > 0 && ticketsData[idx].Tickets_id === 5) {          
        line_1a += (ticketsData[idx].Vehicle) ? ticketsData[idx].Vehicle : 'vehicle ??';
      }
      line_1b += (ticketsData[idx].Agent) ? ticketsData[idx].Agent : 'agent ??';
      if (rec.ownArrangements) {
        line_1a = 'Pax make their own arrangements ';
        line_1b = '';
      }
    }
  } else if (rec.activityType === 2) {
    const idx = accData.findIndex(elem => elem.QuoAccommodation_id === rec.quoAccommodation_id);      
    if (idx > -1) {
      if (!rec.ownArrangements) {
        if (accData[idx].NumSingles > 0) {
          line_1a += accData[idx].NumSingles.toString() + ' Single';
          line_1a += (accData[idx].NumSingles > 1) ? 's' : '';
        }
        if (accData[idx].NumDoubles > 0) { 
          line_1a += (line_1a.trim().length > 0) ? ', ' : '';
          line_1a += accData[idx].NumDoubles.toString() + ' Double';
          line_1a += (accData[idx].NumDoubles > 1) ? 's' : '';
        }
        if (accData[idx].NumTwins > 0) { 
          line_1a += (line_1a.trim().length > 0) ? ', ' : '';
          line_1a += accData[idx].NumTwins.toString() + ' Twin';
          line_1a += (accData[idx].NumTwins > 1) ? 's' : '';
        }
        if (accData[idx].NumTriples > 0) { 
          line_1a += (line_1a.trim().length > 0) ? ', ' : '';
          line_1a += accData[idx].NumTriples.toString() + ' Triple';
          line_1a += (accData[idx].NumTriples > 1) ? 's' : '';
        }  
        line_1a += ' ' + (accData[idx].RoomType ? accData[idx].RoomType : '??') + ' on ' +
                  accData[idx].MealPlan;
      } else {
        line_1a += 'Pax make their own arrangements ';
      }
      line_1a += ' ';
      let nights = accData[idx].Nights.toString() + ' Night';
      nights += (accData[idx].Nights > 1) ? 's' : '';
      line_1a += ' from ' + 
        convert_DbDate_To_DMY(accData[idx].DateIn,1) + ' to ' +
        convert_DbDate_To_DMY(accData[idx].DateOut,1) + ' (' +
        nights + ')';
      if (accData[idx].ReserveHotelOvernight) {
        line_1a += '. (*** Early Checkin).'          
      }
      if (accData[idx].LateCheckOut) {
        line_1a += '. (*** Late Checkout).'          
      }
    }
  } else if (rec.activityType === 3 || rec.activityType === 4) {
  
    const idx = servicesData.findIndex(elem => elem.QuoServices_id === rec.quoServices_id);

    if (idx > -1) {
      line_1a = '';
      if (servicesData[idx].Transport && servicesData[idx].Vehicle !== null) {
        line_1a += servicesData[idx].Vehicle;
      }

      //line_1a = servicesData[index].Vehicle;
      line_1b = servicesData[idx].Agent;

      if (servicesData[idx].Guide !== null && servicesData[idx].Guide === true) {
        line_1a += line_1a.trim().length > 0 ? ' (Guide)' : 'Guide'
      }

      if (rec.ownArrangements) {
        line_1a = 'Pax make their own arrangements ';
        line_1b = '';
      }
    }
  }

  return ({line_1a: line_1a, line_1b: line_1b, line_1c: line_1c});
}


//**********************************************************/
export const activityTiming = (rec) => {
  let timing = '';
  if (rec.activityType !== 0) {
    if (rec.activityTime !== undefined && rec.activityTime !== null) {
      timing += convert_DbDate_To_HHmm(rec.activityTime,1);
    }
    if (rec.activityTimeEnd !== undefined && rec.activityTimeEnd !== null) {
      timing += '/' + convert_DbDate_To_HHmm(rec.activityTimeEnd,1);
    }
  }
  return timing;
}

//**********************************************************/
export const activityDayTitleJsx = (rec, styles) => {

  const overnightJourney = (rec.overnight) ? 'Overnight Journey' : '';
  const noAccommodation = (rec.noAccommodation) ? 'No Accommodation' : '';
 
  return (
    <>
      <div style={{...styles[1], fontSize: 18, fontWeight: 600, alignItems: 'center'}}>
        <div style={{display: 'flex', fontSize: 18, alignItems: 'center'}}>
          {rec.description}
        </div>     
        {noAccommodation > '' &&
          <div style={{paddingLeft: 40, color: 'red'}}>No Accommodation ?</div>
        }
        {overnightJourney > '' &&
          <div style={{paddingLeft: 40, color: OVERNIGHT_JOURNEY_COLOR}}>[Overnight Journey]</div>
        }
      </div>
    </>
  )
}
 
 
//**********************************************************/
export const activityDescriptionJsx = (rec, description, styles) => {

  return (
    <>
      <div style={{...styles[1], display: 'flex', flexDirection: 'column', color: 'rgb(0, 0, 0)', fontSize: 18, justifyContent: 'center'}}>
        <div style={{display: 'flex', flex: 1, fontSize: 18, alignItems: 'center'}}>
          {rec.description}
        </div>          
        {description.line_1a !== null && description.line_1a.length > 0 &&
          <div style={{display: 'flex', flex: 1, fontSize: 16, alignItems: 'center', color: SUB_TITLE_COLOR}}>
            {description.line_1a}
          </div>          
        }
        {description.line_1b !== null && description.line_1b.length > 0 &&
          <div style={{display: 'flex', flex: 1, fontSize: 16, alignItems: 'center', color: SUB_TITLE_COLOR}}>
            {description.line_1b}
          </div>          
        }
        {description.line_1c !== null && description.line_1c.length > 0 &&
          <div style={{display: 'flex', flex: 1, fontSize: 16, alignItems: 'center', color: GREEN_COLOR}}>
            {description.line_1c}
          </div>          
        }
      </div>

    </>
  )
}


//**********************************************************/
export const activityErrorJsx = (rec) => {

  const errorJsx =  rec.ErrorList.map((elem, index) => {
    return (
      <div key={rec.key+'_'+index} style={{display: 'flex', fontSize: 16, whiteSpace: 'pre-wrap', color: (elem.errorType === 1 ? 'blue': 'red'), flex: 1}}>
        {elem.errorMsg}
      </div>
    )
  });
  
  return (
    <>
      <div style={{paddingTop: 10}}>
        <div style={{borderTop: '1px ' + WARN_ERR_SEPARATOR_COLOR + ' solid'}}>
          {errorJsx}
        </div>
      </div>
    </>
  )
}

//**********************************************************/
export const activityVoucherDescriptionJsx = (rec) => {
  return (
    <div style={{width: '100%', backgroundColor: '#ffe6cc', fontSize: 16, whiteSpace: 'pre-line', borderRadius: 5}}>            
      {rec.voucherDescription}
    </div>
  )
}

//**********************************************************/
export const activityCarJourneyJsx = (rec) => {

  const alternateColors = [CAR_ODD_GROUP_COLOR, CAR_EVEN_GROUP_COLOR];

  let colorTop = (rec.carCoverage1 === 1) ? alternateColors[rec.groupCarIndex%2] : null;    
  let colorBottom = (rec.carCoverage2 === 1) ? alternateColors[rec.groupCarIndex%2] : null;    

  let carReport = (rec.groupReportDate !== undefined && rec.groupReportDate !== null) ? 'Rpt: ' + convert_DbDate_To_HHmm(rec.groupReportDate,1) : '';
  let carRelease = (rec.groupReleaseDate !== undefined && rec.groupReleaseDate !== null) ? 'Rel: ' + convert_DbDate_To_HHmm(rec.groupReleaseDate,1) : '';
    
  let carReportColor = null;
  let carReleaseColor = null;

  if (rec.groupReportDate !== undefined && rec.groupReportDate !== null) {      
    const serviceDate = convert_DbDate_To_DMY(rec.groupReportDate,1);
    const activityDate = convert_DbDate_To_DMY(rec.activityDate,1);
    const dayReportDiff = dateDiff_DMY(activityDate, serviceDate, 'days');
    if (dayReportDiff !== 0) {
      carReport += ' (' + dayReportDiff.toString() + ')';
      carReportColor = 'red';
    }
  }

  if (rec.groupReleaseDate !== undefined && rec.groupReleaseDate !== null) {
    const serviceDate = convert_DbDate_To_DMY(rec.groupReleaseDate,1);
    const activityDate = convert_DbDate_To_DMY(rec.activityDate,1);
    const dayReleaseDiff = dateDiff_DMY(activityDate, serviceDate, 'days');
    if (dayReleaseDiff !== 0) {
      carRelease += ' (' + dayReleaseDiff.toString() + ')';
      carReleaseColor = 'red';
    }
  }

  return (
    <>
      {(rec.activityType !== 0) &&
        <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', height: '100%', margin: 0, padding: 0}}>
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 0}}>
            <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', background: colorTop, flex: 1, overflow: 'hidden' }}>                    
            </div>

            <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', background: colorBottom, flex: 1}}>                    
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', flex: 5, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 0}}>
            <div style={{display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'center', flex: 1, margin: 0, padding: 5, fontSize: 14, color: carReportColor}}>
              {carReport}
            </div>
            <div style={{display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'center', flex: 1,  margin: 0, padding: 5, fontSize: 14, color: carReleaseColor}}>
              {carRelease}
            </div>
          </div>
        </div>
      }

    </>
  )
}


//**********************************************************/
export const lockSightseeingProc = async (data, quoServices_id, quoCities_id, quotations_id) => {

  const idx = data.findIndex(rec => rec.QuoServices_id === quoServices_id);
  if (idx > -1) {
    if (data[idx].Lock === true) {
      const spData = {sql: "UPDATE QuoServices " + 
        "SET Lock = 0 " +
        "WHERE QuoServices_id = " + quoServices_id.toString() + " " +
          "AND QuoCities_id = " + quoCities_id.toString() + " " +
          "AND Quotations_id = " + quotations_id.toString() + " " +
          "AND Lock = 1"};
      await dbExecuteSp(spData);  
      data[idx].Lock = false;
    } else {
      if (data[idx].ServiceDate !== null && data[idx].StartTime !== null && data[idx].Lock === false) {
        const spData = {sql: "UPDATE QuoServices " + 
          "SET Lock = 1 " +
          "WHERE QuoServices_id = " + quoServices_id.toString() + " " +
            "AND QuoCities_id = " + quoCities_id.toString() + " " +
            "AND Quotations_id = " + quotations_id.toString() + " " +
            "AND Lock = 0"};
        await dbExecuteSp(spData);  
        data[idx].Lock = true;
      } 
    }
  }

}


//**********************************************************/
export const addSightseeingProc = async (data, quoServices_id) => {

  let spData = {sql: ""};

  const idx = data.findIndex(rec => rec.QuoServices_id === quoServices_id);
  if (idx > -1) {
    if (data[idx].Selected === true) {
      spData = {sql: "EXEC p_QuoAddSightseeingFromList " + quoServices_id.toString() + ",1"};
      await dbExecuteSp(spData);  
    } else {
      spData = {sql: "EXEC p_QuoAddSightseeingFromList " + quoServices_id.toString() + ",2"};
      await dbExecuteSp(spData);  
    }
  }

}


//**********************************************************/
export const getDataForAgent = async (addressbook_id) => {

  // default to Euro
  let countries_id = null;
  let currencies_id = 27;
  let email = '';

  if (addressbook_id !== null) {

    const query = "SELECT countries_id, currencies_id, email FROM Addressbook " + 
      "WHERE Addressbook_id = " + addressbook_id.toString() + " ";

    const dataQry = await dbGetRecordRaw({query: query });

    if (dataQry.length > 0) {
      if (dataQry[0].countries_id !== null) {
        countries_id = dataQry[0].countries_id;
      }
      if (dataQry[0].currencies_id !== null) {
        currencies_id = dataQry[0].currencies_id;
      }
      if (dataQry[0].email !== null) {
        email = dataQry[0].email;
      }
    }

  }

  return {countries_id: countries_id, currencies_id: currencies_id, email: email};

} 

//**********************************************************/
export const getDataForConsultant = async (consultants_id, addressbook_id) => {

  // default to Euro
  let email = null;
  let query = '';
  let dataQry = {};

  if (consultants_id !== null) {
    query = "SELECT email FROM Consultants " + 
      "WHERE Consultants_id = " + consultants_id.toString() + " ";

    dataQry = await dbGetRecordRaw({query: query });
    if (dataQry.length > 0) {
      if (dataQry[0].email !== null) {
        email = dataQry[0].email;
      }
    } 
  }

  if ((email === null || email === '') && addressbook_id !== null) {
    query = "SELECT email FROM Addressbook " + 
      "WHERE Addressbook_id = " + addressbook_id.toString() + " ";

    dataQry = await dbGetRecordRaw({query: query });
    if (dataQry.length > 0) {
      if (dataQry[0].email !== null) {
        email = dataQry[0].email;
      }
    } 
      
  }

  return {email: email};

} 

//**********************************************************/
export const getQuoPrint = async(quotations_id) => {

  const query = "SELECT QuoPrint_id FROM QuoPrint " + 
    "WHERE Quotations_id = " + quotations_id.toString();

  const quoPrintArr = await dbGetRecordRaw({query: query});

  const quoPrint_id = (quoPrintArr.length > 0) ? quoPrintArr[0].QuoPrint_id : -1;

  return quoPrint_id;

}

//**********************************************************/
export const getNextQuotationNo = async (yearRef, trial) => {

  let query = "SELECT MAX(QuotationNo) AS nextQuoteNo FROM Quotations " + 
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

 
