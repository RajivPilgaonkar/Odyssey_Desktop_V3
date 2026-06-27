import { dbGetRecord, dbGetRecordRaw } from '../../actions';
import { convertDMY_MDY } from "../common/CommonTransactionFunctions";

import moment from 'moment';

//**********************************************************/
export const getServiceName = async(services_id) => {

  const whereStr = 'services_id = ' + services_id;
  const services = await dbGetRecord({fields: ["services_id,description"], orders: ['description'], table: 'services', where: whereStr});

  let servicesObj = {services_id: -1, service: ''};
  if (services.length > '') {
    servicesObj = {...servicesObj, 
      services_id: services[0].services_id,
      service: services[0].description
    }
  }

  return (servicesObj);

}


//**********************************************************/
export const getAgentName = async(agents_id) => {

  const whereStr = 'a.Addressbook_id = ' + agents_id;
  const tableStr = 'Addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ';
  const agents = await dbGetRecord({fields: ["a.Addressbook_id,a.Organisation, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity, a.cities_id "], orders: ['Organisation'], table: tableStr, where: whereStr});

  let addressbookObj = {Addressbook_id: -1, Organisation: ''};
  if (agents.length > '') {
    addressbookObj = {...addressbookObj, 
      Addressbook_id: agents[0].Addressbook_id,
      Organisation: agents[0].OrgCity,
      Cities_id: agents[0].cities_id,
    }
  }

  return (addressbookObj);

}

//**********************************************************/
export const getAgentNameWithoutCity = async(agents_id) => {

  const whereStr = 'a.Addressbook_id = ' + agents_id;
  const tableStr = 'Addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ';
  const agents = await dbGetRecord({fields: ["a.Addressbook_id,a.Organisation, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity "], orders: ['Organisation'], table: tableStr, where: whereStr});

  let addressbookObj = {Addressbook_id: -1, Organisation: ''};
  if (agents.length > '') {
    addressbookObj = {...addressbookObj, 
      Addressbook_id: agents[0].Addressbook_id,
      Organisation: agents[0].Organisation
    }
  }

  return (addressbookObj);

}

//**********************************************************/
export const getCityName = async(cities_id) => {

  const whereStr = 'Cities_id = ' + cities_id;
  const cities = await dbGetRecord({fields: ["Cities_id,City,DefaultDays"], orders: ['City'], table: 'Cities', where: whereStr});

  let citiesObj = {Cities_id: -1, City: '', Nights: 1};
  if (cities.length > '') {
    citiesObj = {...citiesObj, 
      Cities_id: cities[0].Cities_id,
      City: cities[0].City,
      Nights: (cities[0].DefaultDays !== null) ? cities[0].DefaultDays : 0,
    }
  }

  return (citiesObj);

}

//**********************************************************/
export const getCarHireGroupName = async(carHireGroups_id) => {

  const whereStr = 'CarHireGroups_id = ' + carHireGroups_id;
  const carHireGroups = await dbGetRecord({fields: ["CarHireGroups_id,CarHireGroup"], orders: ['CarHireGroup'], table: 'CarHireGroups', where: whereStr});

  let carHireGroupsObj = {CarHireGroups_id: -1, CarHireGroup: ''};
  if (carHireGroups.length > '') {
    carHireGroupsObj = {...carHireGroupsObj, 
      CarHireGroups_id: carHireGroups[0].CarHireGroups_id,
      CarHireGroup: carHireGroups[0].CarHireGroup
    }
  }

  return (carHireGroupsObj);

}

//**********************************************************/
export const getCarHireStartCity = async(carHireGroups_id) => {

  const whereStr = 'CarHireGroups_id = ' + carHireGroups_id;
  const tableStr = 'CarHireGroupCities chgc LEFT JOIN Cities c ON chgc.cities_id = c.cities_id';
  const carHireGroups = await dbGetRecord({fields: ["c.Cities_id, c.City"], orders: ['chgc.OrderNo'], table: tableStr, where: whereStr});

  let carHireGroupsObj = {Cities_id: -1, City: ''};
  if (carHireGroups.length > '') {
    carHireGroupsObj = {...carHireGroupsObj, 
      Cities_id: carHireGroups[0].Cities_id,
      City: carHireGroups[0].City
    }
  }

  return (carHireGroupsObj);

}


//**********************************************************/
export const getPackageName = async(packages_id) => {

  const whereStr = 'packages_id = ' + packages_id;
  const packages = await dbGetRecord({fields: ["packages_id,package"], orders: ['package'], table: 'packages', where: whereStr});

  let packagesObj = {packages_id: -1, package: ''};
  if (packages.length > '') {
    packagesObj = {...packagesObj, 
      packages_id: packages[0].packages_id,
      package: packages[0].package
    }
  }

  return (packagesObj);

}

//**********************************************************/
export const getRoomType = async(roomTypes_id) => {

  const whereStr = 'roomtypes_id = ' + roomTypes_id;
  const roomtypes = await dbGetRecord({fields: ["roomtypes_id,roomtype"], orders: ['roomtype'], table: 'roomtypes', where: whereStr});

  let roomtypesObj = {roomtypes_id: -1, roomtype: ''};
  if (roomtypes.length > '') {
    roomtypesObj = {...roomtypesObj, 
      roomtypes_id: roomtypes[0].roomtypes_id,
      roomtype: roomtypes[0].roomtype
    }
  }

  return (roomtypesObj);

}

//**********************************************************/
export const getHotelFromSeason = async(seasons_id) => {

  const tableStr = 'seasons s LEFT JOIN addressbook a ON s.addressbook_id = a.addressbook_id ';
  const whereStr = 's.seasons_id = ' + seasons_id;
  const hotels = await dbGetRecord({fields: ["s.addressbook_id,COALESCE(a.organisation,'') + ', ' + COALESCE(a.city,'') AS orgCity, s.fromdate, s.todate"], orders: ['addressbook_id'], table: tableStr, where: whereStr});

  let hotelsObj = {addressbook_id: -1, orgCity: '', wef: null};
  if (hotels.length > '') {
    hotelsObj = {...hotelsObj, 
      addressbook_id: hotels[0].addressbook_id,
      orgCity: hotels[0].orgCity,
      wef: hotels[0].fromdate,
      wet: hotels[0].todate
    }
  }

  return (hotelsObj);

}

//**********************************************************/
export const getAgentFromCostServices = async(costServices_id) => {

  const tableStr = 'costServices cs ' +
    'LEFT JOIN addressbook a ON cs.addressbook_id = a.addressbook_id ' +
    'LEFT JOIN services s ON cs.services_id = s.services_id';
  const whereStr = 'cs.costservices_id = ' + costServices_id;
  const agents = await dbGetRecord({fields: ["cs.addressbook_id, a.organisation, s.[description], cs.wef"], orders: ['costservices_id'], table: tableStr, where: whereStr});

  let agentsObj = {addressbook_id: -1, orgService: '', wef: ''};
  if (agents.length > '') {
    agentsObj = {...agentsObj, 
      addressbook_id: agents[0].addressbook_id,
      orgService: agents[0].description + ' [' + agents[0].organisation + ']',
      service: agents[0].description,
      wef: agents[0].wef
    }
  }

  return (agentsObj);

}

//**********************************************************/
export const getAgentFromCostPackages = async(costPackages_id) => {

  const tableStr = 'costPackages cp ' +
    'LEFT JOIN addressbook a ON cp.addressbook_id = a.addressbook_id ' +
    'LEFT JOIN packages p ON cp.packages_id = p.packages_id';
  const whereStr = 'cp.costpackages_id = ' + costPackages_id;
  const agents = await dbGetRecord({fields: ["cp.addressbook_id, a.organisation, p.package, cp.wef"], orders: ['costpackages_id'], table: tableStr, where: whereStr});

  let agentsObj = {addressbook_id: -1, orgService: '', wef: ''};
  if (agents.length > '') {
    agentsObj = {...agentsObj, 
      addressbook_id: agents[0].addressbook_id,
      orgService: agents[0].package + ' [' + agents[0].organisation + ']',
      wef: agents[0].wef
    }
  }

  return (agentsObj);

}


//**********************************************************/
export const getStartCityFromGroups = async(carHireGroups_id) => {

  const tableStr = 'CarHireGroupCities';
  const whereStr = 'CarHireGroups_id = ' + carHireGroups_id.toString();
  const cities = await dbGetRecord({fields: ["Cities_id"], orders: ['OrderNo'], table: tableStr, where: whereStr});

  let citiesObj = {cities_id: -1};
  if (cities.length > '') {
    citiesObj = {...citiesObj, 
      cities_id: cities[0].Cities_id
    }
  }

  return (citiesObj);

}

//**********************************************************/
export const getFromToPaxForVehicle = async (addressbook_id, cities_id, vehicles_id) => {

  const cityStr = (cities_id !== null) ? ' AND cities_id = ' + cities_id.toString() + ' ' : ''; 

  const condition = 'addressbook_id = ' + addressbook_id.toString() + 
     cityStr +
     ' AND vehicles_id = ' + vehicles_id.toString();
  const fromToObj = await dbGetRecord({fields: ['fromPax, toPax'], table: 'carhireagents', where: condition });

  // set fromPax and toPax defaults if not found
  if ((fromToObj.length === 0) || (Object.keys(fromToObj[0]).length === 0)) {
    fromToObj.push({fromPax: 1, toPax: 3});
  }
  
  return fromToObj[0];

}

//**********************************************************/
export const getNumPaxForVehicle = async (vehicles_id) => {

  const condition = 'vehicles_id = ' + vehicles_id.toString();
  const seatingObj = await dbGetRecord({fields: ['COALESCE(pax,3) AS pax, COALESCE(SeatingCapacity,3) AS seatingCapacity'], table: 'vehicles', where: condition });

  // set fromPax and toPax defaults if not found
  if ((seatingObj.length === 0) || (Object.keys(seatingObj[0]).length === 0)) {
    seatingObj.push({pax: 3, seatingCapacity: 3});
  }
  
  return seatingObj[0];

}


//**********************************************************/
// wef passed in as a string in the DD/MM/YYYY format
export const getCentralTax = async (wef, taxes_id) => {

  const query = "SELECT [dbo].[fn_GetCentralTaxPerc] ('" + 
    convertDMY_MDY(wef) + "', " + 
    taxes_id.toString() + ") AS tax";

  const queryObj = await dbGetRecordRaw({query: query });

  // set fromPax and toPax defaults if not found
  if ((queryObj.length === 0) || (Object.keys(queryObj[0]).length === 0)) {
    queryObj.push({tax: 0});
  }
  
  return queryObj[0];

}

//**********************************************************/
export const getCurrencyCode = async(currencies_id) => {

  const whereStr = 'currencies_id = ' + currencies_id.toString();
  const currencies = await dbGetRecord({fields: ["currencies_id, currencycode "], orders: ['currencies_id'], table: 'currencies', where: whereStr});

  let currenciesObj = {currencies_id: -1, currencyCode: ''};
  if (currencies.length > '') {
    currenciesObj = {...currenciesObj, 
      currencies_id: currencies[0].currencies_id,
      currencyCode: currencies[0].currencycode
    }
  }

  return (currenciesObj);

}


//**********************************************************/
export const getNumGreaterInvoices = async(companies_id, invoiceTypes_id, xDate) => {

  const whereStr = "companies_id = " + companies_id.toString() + " " + 
    " AND invoicetypes_id = " + invoiceTypes_id.toString() + " " +
    " AND invoicedate > '" + moment(xDate).format('MM/DD/YYYY') + "' ";
  const invoices = await dbGetRecord({fields: ["COUNT(*) AS x_count"], table: 'invoices', where: whereStr});

  const numInvoices = invoices[0].x_count;

  return (numInvoices);

}

//**********************************************************/
export const getNumGreaterVouchers = async(companies_id, voucherTypes_id, xDate) => {

  const whereStr = "companies_id = " + companies_id.toString() + " " + 
    " AND vouchertypes_id = " + voucherTypes_id.toString() + " " +
    " AND voucherdate > '" + moment(xDate).format('MM/DD/YYYY') + "' ";
  const vouchers = await dbGetRecord({fields: ["COUNT(*) AS x_count"], table: 'vouchers', where: whereStr});

  const numVouchers = vouchers[0].x_count;

  return (numVouchers);

}


//**********************************************************/
export const getVoucherIssueDetails = async(masters_id, userName) => {

  const whereStr = 'masters_id = ' + masters_id.toString();
  const tableStr = 'masters';
  const voucherIssueDetails = await dbGetRecord({fields: ["TourLeader, TL_Countries_id, VouchersIssuedOn, VouchersIssuedBy, TourRef "], orders: ['masters_id'], table: tableStr, where: whereStr});

  let voucherIssueDetailsObj = {
    TourLeader: '', TL_Countries_id: 200, VouchersIssuedOn: moment().toDate(), 
    VouchersIssuedBy: userName, TourRef: ''};
  if (voucherIssueDetails.length > '') {
    voucherIssueDetailsObj = {...voucherIssueDetailsObj, 
      TourLeader: (voucherIssueDetails[0].TourLeader) ? voucherIssueDetails[0].TourLeader : voucherIssueDetailsObj.TourLeader,
      TL_Countries_id: (voucherIssueDetails[0].TL_Countries_id) ? voucherIssueDetails[0].TL_Countries_id : voucherIssueDetailsObj.TL_Countries_id,
      VouchersIssuedOn: (voucherIssueDetails[0].VouchersIssuedOn) ? voucherIssueDetails[0].VouchersIssuedOn : voucherIssueDetailsObj.VouchersIssuedOn,
      VouchersIssuedBy: (voucherIssueDetails[0].VouchersIssuedBy) ? voucherIssueDetails[0].VouchersIssuedBy : voucherIssueDetailsObj.VouchersIssuedBy,
      TourRef: (voucherIssueDetails[0].TourRef) ? voucherIssueDetails[0].TourRef : voucherIssueDetailsObj.TourRef
    }
  }

  return (voucherIssueDetailsObj);

}

//**********************************************************/
export const getVoucherYearRef = (voucherDate) => {

  let year = voucherDate.getFullYear();
  let month = voucherDate.getMonth()+1;

  const yearRef = (month >= 4) ? year + 1 : year;

  return yearRef;
}


//**********************************************************/
export const getVoucherLastTour = async(voucherDate) => {

  const yearRef = getVoucherYearRef(voucherDate);
  let voucherObj = {tourCode: '', voucherNo: 0};

  let whereStr = 'yearref = ' + yearRef.toString();
  const tableStr = 'vouchers';
  let maxVouchers = await dbGetRecord({fields: ["MAX(voucherNo) AS voucherNoMax"], table: tableStr, where: whereStr});
  if (maxVouchers.length > 0) {
    let maxVoucherNo = maxVouchers[0].voucherNoMax;
    whereStr = 'yearref = ' + yearRef.toString() + ' AND voucherno = ' + maxVoucherNo.toString();
    let vouchers = await dbGetRecord({fields: ["mastertourcode"], table: tableStr, where: whereStr});
    voucherObj = {tourCode: vouchers[0].mastertourcode, voucherNo: maxVoucherNo};
  } 
  
  return (voucherObj);

}

//**********************************************************/
export const getCountryFromCity = async(cities_id) => {

  const whereStr = "c.cities_id = " + cities_id.toString() + " ";

  const tableStr = 'cities c LEFT JOIN countries co ON c.countries_id = co.countries_id ';    

  const countries = await dbGetRecord({fields: ["c.countries_id, co.country"], table: tableStr, where: whereStr});

  let countriesObj = {countries_id: 200, country: 'India'}; 

  if (countries.length > 0) {
    countriesObj = {...countriesObj, countries_id: countries[0].countries_id, country: countries[0].country}
  }

  return (countriesObj);

}

//**********************************************************/
export const getRoomTypeIdsForHotel = async(addressbook_id, accDate) => {

  const whereStr = "s.addressbook_id = " + addressbook_id.toString() + " " + 
     " AND ('" + moment(accDate).format('MM/DD/YYYY') + "' BETWEEN fromdate AND todate OR " + 
     "DATEADD(yy,-2,'" + moment(accDate).format('MM/DD/YYYY') + "') BETWEEN fromdate AND todate) ";

  const tableStr = 'seasons s LEFT JOIN hoteltariffsindia ht ON s.seasons_id = ht.seasons_id ';

  const roomTypeObj = await dbGetRecord({fields: ["DISTINCT ht.roomtypes_id"], table: tableStr, where: whereStr});

  const roomTypeIds = roomTypeObj.map(rec => rec.roomtypes_id);

  return (roomTypeIds);

}

//**********************************************************/
export const getRoomTypesForHotel = async(addressbook_id, accDate) => {

  let whereStr = "s.addressbook_id = " + addressbook_id.toString() + " " + 
     " AND (('" + moment(accDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "' BETWEEN fromdate AND todate) OR " + 
     "(DATEADD(yy,-1,'" + moment(accDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "') BETWEEN fromdate AND todate) OR " +
     "(DATEADD(yy,-2,'" + moment(accDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "') BETWEEN fromdate AND todate)) ";

  const tableStr = 'seasons s LEFT JOIN hoteltariffsindia ht ON s.seasons_id = ht.seasons_id ' + 
    'LEFT JOIN RoomTypes rt ON ht.RoomTypes_id = rt.RoomTypes_id ';
    
  let roomTypeArr = await dbGetRecord({fields: ["DISTINCT ht.roomtypes_id, rt.roomtype, CASE WHEN ht.cost_single_ac > 0 OR ht.cost_double_ac > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS ac "], table: tableStr, where: whereStr});

  return (roomTypeArr);

}



//**********************************************************/
export const getServiceIdsForServiceCity = async(serviceCities_id, sightseeing) => {

  let whereStr = "s.cities_id = " + serviceCities_id.toString() + " ";
  whereStr += (sightseeing) ? ' AND transfer = 0' : 'AND transfer = 1'

  const tableStr = 'services s';

  const servicesObj = await dbGetRecord({fields: ["services_id"], table: tableStr, where: whereStr});

  const serviceIds = servicesObj.map(rec => rec.services_id);

  return (serviceIds);

}

//**********************************************************/
export const getPackageIdsForServiceCity = async(serviceCities_id) => {

  let whereStr = "p.from_cities_id = " + serviceCities_id.toString() + " ";

  const tableStr = 'packages p';

  const packagesObj = await dbGetRecord({fields: ["packages_id"], table: tableStr, where: whereStr});

  const packageIds = packagesObj.map(rec => rec.packages_id);

  return (packageIds);

}

//**********************************************************/
export const getAgentIdsForServices = async(services_id) => {

  
  const query = "SELECT DISTINCT addressbook_id FROM costservices " +
    "WHERE services_id = " + services_id.toString() + " " +
    "AND Wef >= DATEADD(year,-5,GETDATE())";

  const queryObj = await dbGetRecordRaw({query: query });

  const agentIds = queryObj.map(rec => rec.addressbook_id);

  return (agentIds);

}

//**********************************************************/
export const getAgentIdsForPackages = async(packages_id) => {

  
  const query = "SELECT DISTINCT addressbook_id FROM costpackages " +
    "WHERE packages_id = " + packages_id.toString() + " " +
    "AND wef >= DATEADD(year,-5,GETDATE())";

  const queryObj = await dbGetRecordRaw({query: query });

  const agentIds = queryObj.map(rec => rec.addressbook_id);

  return (agentIds);

}


//**********************************************************/
export const getServicesForAgent = async(addressbook_id, cities_id, active) => {

  let whereStr = "cs.addressbook_id = " + addressbook_id.toString() + " " + 
    " AND cs.cities_id = " + cities_id.toString() + " ";
  if (active) {
    whereStr = whereStr + " AND s.active = 1";
  }

  const tableStr = 'costServices cs LEFT JOIN Services s ON cs.services_id = s.services_id';

  const servicesObj = await dbGetRecord({fields: ["DISTINCT cs.services_id, s.description, s.transfer, s.transfertypes_id"], table: tableStr, orders: ["description"], where: whereStr});

  return (servicesObj);

}


//**********************************************************/
export const getVoucherDetails = async (vouchers_id) => {

  const whereStr = 'vouchers_id = ' + vouchers_id.toString();
  const voucherObj = await dbGetRecord({fields: ["mastertourcode, mastertourdate, addressbook_id, through_addressbook_id"], table: "vouchers", where: whereStr});

  if (voucherObj.length > 0) {
    if (voucherObj[0].mastertourcode) {
      voucherObj[0].mastertourdate = voucherObj[0].mastertourdate.replace('T', ' ').replace('Z', '');
    }
  }
  
  return voucherObj;
}

//**********************************************************/
export const getPackageTimings = async (packages_id) => {

  const whereStr = 'packages_id = ' + packages_id.toString();
  const fieldStr = 'CONVERT(VARCHAR(5), from_time, 108) AS FromTime, CONVERT(VARCHAR(5), to_time, 108) AS ToTime'
  const packageObj = await dbGetRecord({fields: [fieldStr], table: "packages", where: whereStr});
  
  return packageObj;
}

//**********************************************************/
export const getSectorFromCities = async(fromCities_id, toCities_id) => {

  let fromCity = '';
  let toCity = '';
  let whereStr = '';
  let fromCities = [];
  let toCities = [];

  // From City
  if (fromCities_id !== null) {    
    whereStr = 'Cities_id = ' + fromCities_id;
    fromCities = await dbGetRecord({fields: ["Cities_id,City"], orders: ['City'], table: 'Cities', where: whereStr});
    if (fromCities.length > 0) {
      fromCity = fromCities[0].City;
    }
  }

  // To City
  if (toCities_id !== null) {    
    whereStr = 'Cities_id = ' + toCities_id;
    toCities = await dbGetRecord({fields: ["Cities_id,City"], orders: ['City'], table: 'Cities', where: whereStr});
    if (toCities.length > 0) {
      toCity = toCities[0].City;
    }
  }

  const sector = fromCity + ' to ' + toCity;

  return (sector);

}

//**********************************************************/
export const getExtraDaySectorFromCities = async(cities_id) => {

  let city = '';
  let whereStr = '';
  let cities = [];
  
  // City
  if (cities_id !== null) {    
    whereStr = 'cities_id = ' + cities_id;
    cities = await dbGetRecord({fields: ["Cities_id,City"], orders: ['City'], table: 'Cities', where: whereStr});
    if (cities.length > 0) {
      city = cities[0].City;
    }
  }

  const sector = 'Extra Day Car Hire in ' + city;

  return (sector);

}

//**********************************************************/
export const getTrainDetails = async (trainNo, travelDate, fromCities_id, toCities_id) => {

  if ((trainNo === null) || (fromCities_id === null) || (toCities_id === null)) {
    return ({trains_id: null, trainName: '', daysOfOperation: null, trainTimings: '', overnight: false})
  }

  let trains_id = null;
  let trainName = '';
  let daysOfOperation = null;
  let trainTimings = '';
  let overnight = false;
  let night1 = 0;
  let night2 = 0;
  
  const travelDate_MDY = convertDMY_MDY(travelDate);

  let query = "SELECT trains_id, trainname, " + 
   "dbo.f_DaysToStr (t.dayofoperation) AS DaysOfOperation " +
   "FROM trains t " +
   "WHERE LTRIM(RTRIM(t.trainno)) = '" + trainNo.trim() + "' " +
   "AND wef <= '" + travelDate_MDY + "' AND ((wet IS NULL) OR ('"  + travelDate_MDY + "' <= wet))";

  const trainsObj = await dbGetRecordRaw({query: query });

  if (trainsObj.length > 0) {

    trains_id = trainsObj[0].trains_id;
    trainName = trainsObj[0].trainname;
    daysOfOperation = trainsObj[0].DaysOfOperation;

    let query = "SELECT departure, nights FROM traindetails " + 
    "WHERE trains_id = " + trainsObj[0].trains_id.toString() + " " + 
    "AND cities_id = " + fromCities_id.toString();

    let trainDetailsObj = await dbGetRecordRaw({query: query });
    if (trainDetailsObj.length > 0) {
      if (trainDetailsObj[0].departure !== null) {
        trainDetailsObj[0].departure = trainDetailsObj[0].departure.replace('T', ' ').replace('Z', '');
        trainTimings += moment(trainDetailsObj[0].departure).format('HH:mm');  
      }
      night1 = (trainDetailsObj[0].nights !== null) ? trainDetailsObj[0].nights : 0;
    }

    query = "SELECT arrival, nights FROM traindetails " + 
    "WHERE trains_id = '" + trainsObj[0].trains_id.toString() + "' " +
    "AND cities_id = " + toCities_id.toString();

    trainDetailsObj = await dbGetRecordRaw({query: query });
    if (trainDetailsObj.length > 0) {
      if (trainDetailsObj[0].arrival !== null) {
        trainDetailsObj[0].arrival = trainDetailsObj[0].arrival.replace('T', ' ').replace('Z', '');
        trainTimings += '/' + moment(trainDetailsObj[0].arrival).format('HH:mm');
      }
      night2 = (trainDetailsObj[0].nights !== null) ? trainDetailsObj[0].nights : 0;
    }

    overnight = (night2 > night1);

    return ({trains_id: trains_id, trainName: trainName, daysOfOperation: daysOfOperation, trainTimings: trainTimings, overnight: overnight})
    
  } else {
    return ({trains_id: null, trainName: '', daysOfOperation: null, trainTimings: '', overnight: false})
  }

}

//**********************************************************/
export const getCityForStation = async (trainStations_id) => {

  let cities_id = null;

  const query = "SELECT Cities_id FROM TrainStations " + 
    "WHERE TrainStations_id = " + trainStations_id.toString();

  const stationsObj = await dbGetRecordRaw({query: query });

  if (stationsObj.length > 0) {
    cities_id = stationsObj[0].Cities_id;
  }

  return({cities_id: cities_id})

}

//**********************************************************/
export const getTrainName = async (trainNo, wef) => {

  const travelDate = (wef === null) ? moment().format('MM/DD/YYYY') : moment(wef).format('MM/DD/YYYY');

  let trains_id = null;
  let trainName = '';
  let trainCategories_id = null;
  let operatesOn = 127;
  let dayString = 'Daily';
  let agents_id = null;
  let sf = false;
  
  let query = "SELECT trains_id, trainname, TrainCategories_id, DayOfOperation, " +
   "dbo.f_DaysToStr (DayOfOperation) AS DayString, Addressbook_id, SF " +
   "FROM trains t " +
   "WHERE LTRIM(RTRIM(t.trainno)) = '" + trainNo.trim() + "' " +
   "AND wef <= '" + travelDate + "' AND ((wet IS NULL) OR ('"  + travelDate + "' <= wet)) " + 
   "ORDER BY wef DESC";

  const trainsObj = await dbGetRecordRaw({query: query });

  if (trainsObj.length > 0) {
    trains_id = trainsObj[0].trains_id;
    trainName = trainsObj[0].trainname;
    trainCategories_id = trainsObj[0].TrainCategories_id;
    operatesOn = trainsObj[0].DayOfOperation;
    dayString = trainsObj[0].DayString;
    agents_id = trainsObj[0].Addressbook_id;
    sf = trainsObj[0].SF;
  }

  return ({trains_id: trains_id, trainName: trainName, trainCategories_id: trainCategories_id,
          operatesOn: operatesOn, dayString: dayString, agents_id: agents_id,
          sf: sf });
    
}

//**********************************************************/
export const getTourCodeFromModules = async (quoModules_id) => {

  let moduleObj = {tourCode: ''};

  const whereStr = 'QuoModules_id = ' + quoModules_id.toString();
  const queryObj = await dbGetRecord({fields: ["TourCode"], table: "QuoModules", where: whereStr});
  
  if (queryObj.length > 0) {
    moduleObj.tourCode = (queryObj[0].TourCode !== null) ? queryObj[0].TourCode : '';
  }
  
  return moduleObj;
}

//**********************************************************/
export const getQuotationFromModules = async (quoModules_id) => {

  let moduleObj = {quotations_id: -1};

  let whereStr = 'qm.QuoModules_id = ' + quoModules_id.toString();
  let tableStr = 'QuoModules qm LEFT JOIN Quotations q ON qm.TourCode = q.TourCode AND qm.TourDate = q.StartDate';
  let queryObj = await dbGetRecord({fields: ["q.Quotations_id"], table: tableStr, where: whereStr});
  
  if (queryObj.length > 0) {  
    moduleObj.quotations_id = (queryObj[0].Quotations_id !== null) ? queryObj[0].Quotations_id : -1;
  }
  
  return moduleObj;
}

//**********************************************************/
export const getDivisionName = async(divisions_id) => {

  const whereStr = 'divisions_id = ' + divisions_id.toString();
  const division = await dbGetRecord({fields: ["divisions_id,division"], orders: ['division'], table: 'divisions', where: whereStr});

  let divisionsObj = {divisions_id: -1, division: ''};
  if (division.length > '') {
    divisionsObj = {...divisionsObj, 
      divisions_id: division[0].divisions_id,
      division: division[0].division
    }
  }

  return (divisionsObj);

}

//**********************************************************/
export const getCompanyName = async(companies_id) => {

  const whereStr = 'companies_id = ' + companies_id.toString();
  const company = await dbGetRecord({fields: ["companies_id,name,divName"], orders: ['name'], table: 'companies', where: whereStr});

  let companiesObj = {companies_id: -1, company: ''};
  if (company.length > '') {
    companiesObj = {...companiesObj, 
      companies_id: company[0].companies_id,
      company: company[0].name + ((company[0].divName !== null) ? ' [' + company[0].divName + '] ' : '')
    }
  }

  return (companiesObj);

}

//**********************************************************/
export const getCityCrossings = async (distances_id) => {
  
  let cityList = '';

  let query = "SELECT c.City " +
   "FROM CityCrossings cc " +
   "LEFT JOIN Cities c ON cc.Cities_id = c.Cities_id " +
   "WHERE cc.Distances_id = " + distances_id.toString() + " " +
   "ORDER BY COALESCE(OrderNo,0)";

  const cityObj = await dbGetRecordRaw({query: query });

  cityObj.forEach(rec => {
    cityList += (cityList.trim().length > 0) ? ' / ' + rec.City : rec.City;
  })

  return ({cityList: cityList});
    
}

//**********************************************************/
export const getStateCrossings = async (distances_id) => {
  
  let stateList = '';

  let query = "SELECT s.State  " +
   "FROM StateCrossings sc " +
   "LEFT JOIN States s ON sc.States_id = s.States_id " +
   "WHERE sc.Distances_id = " + distances_id.toString() + " " +
   "ORDER BY COALESCE(OrderNo,0)";

  const stateObj = await dbGetRecordRaw({query: query });

  stateObj.forEach(rec => {
    stateList += (stateList.trim().length > 0) ? ' / ' + rec.State : rec.State;
  })

  return ({stateList: stateList});
    
}

//**********************************************************/
export const getDaysOfOperation = async (daysOfOperationBit) => {

  let query = "SELECT dbo.f_DaysToStr (" + 
    daysOfOperationBit.toString() + ") AS DaysOfOperation ";

  const daysObj = await dbGetRecordRaw({query: query });

  if (daysObj.length > 0) {
    return ({daysOfOperation: daysObj[0].DaysOfOperation})    
  } else {
    return ({daysOfOperation: ''})    
  }

}

//**********************************************************/
export const getSightseeingTimings = async (services_id) => {

  let query = "SELECT StartTime FROM ServiceTimings " + 
    "WHERE Services_id = " + services_id.toString() + " " +
    "AND StartTime IS NOT NULL";

  const timeArr = await dbGetRecordRaw({query: query });

  let timing = '';
  for (const rec of timeArr) {
    timing += (timing.length > 0) ? ' / ' : '';
    timing += moment(rec['StartTime'].replace('T', ' ').replace('Z', '')).format('HH:mm');
  }

  return timing;

}

//**********************************************************/
export const getTimeFromDbDate = (dbDate) => {
  return moment(dbDate.replace('T', ' ').replace('Z', '')).format('HH:mm');
}

//**********************************************************/
export const getCityFromStation = async(stations_id) => {

  let cities_id = null;

  const query = "SELECT cities_id FROM TrainStations " + 
    "WHERE TrainStations_id = " + stations_id.toString();

  const queryObj = await dbGetRecordRaw({query: query });

  if (queryObj.length > 0) {
    cities_id = queryObj[0].cities_id;
  }

  return ({cities_id: cities_id});

}

//**********************************************************/
export const getLastFinancialYear = async() => {

  let financialYears_id = null;

  const query = "SELECT MAX(FinancialYears_id) AS MaxFinancialYears_id " + 
    "FROM FinancialYears ";

  const queryObj = await dbGetRecordRaw({query: query });

  if (queryObj.length > 0) {
    financialYears_id = queryObj[0].MaxFinancialYears_id;
  }

  return ({financialYears_id: financialYears_id});

}

//**********************************************************/
export const getAdmLevelLocation = async(admUsers_id, location) => {

  let superuser = false;
  let moduleNo = (location.state) ? location.state.moduleNo : undefined;

  const query = "SELECT COALESCE(Superuser,0) AS Superuser FROM AdmUsers " + 
    "WHERE AdmUsers_id = " + admUsers_id.toString();

  const queryObj = await dbGetRecordRaw({query: query });

  if (queryObj.length > 0) {
    superuser = queryObj[0].Superuser;
  }

  if (superuser) {
    return 5;
  }

  if (moduleNo === undefined || moduleNo === null) {
    moduleNo = 0;
  }

  const admLevel = await getAdmLevel(admUsers_id, moduleNo);

  return admLevel;

}

//**********************************************************/
export const getAdmLevel = async(admUsers_id, moduleNo) => {

  let admLevel = 3;

  const query = "SELECT aup.AdmLevels_id FROM AdmUserPermissions aup " +
    "LEFT JOIN AdmMenuModules amm ON aup.AdmMenuModules_id = amm.AdmMenuModules_id " +
    "WHERE aup.AdmUsers_id = " + admUsers_id.toString() + " " +
    "AND amm.AdmMenuModuleNo = " + moduleNo.toString();
    
  const queryObj = await dbGetRecordRaw({query: query });

  if (queryObj.length > 0) {
    admLevel = queryObj[0].AdmLevels_id;
  }

  return admLevel;

}


//**********************************************************/
export const getDataForCity = async (cities_id) => {

  let states_id = null;
  let countries_id = null;

  if (cities_id !== null) {

    const query = "SELECT states_id, countries_id FROM Cities " + 
      "WHERE cities_id = " + cities_id.toString() + " ";

    const dataQry = await dbGetRecordRaw({query: query });

    if (dataQry.length > 0) {
      if (dataQry[0].states_id !== null) {
        states_id = dataQry[0].states_id;
      }
      if (dataQry[0].countries_id !== null) {
        countries_id = dataQry[0].countries_id;
      }
    }

  }

    return {states_id: states_id, countries_id: countries_id};

  } 


//**********************************************************/
export const isHotel = async (addressbook_id) => {

  const query = "SELECT COUNT(*) AS xCount FROM AddressbookSubcategories  " + 
  "WHERE Addressbook_id = " + addressbook_id.toString() + " " + 
  "AND ContactSubCategories_id = 4";

  const dataQry = await dbGetRecordRaw({query: query });

  const hotel = (dataQry.length > 0 && dataQry[0].xCount > 0) ? true : false;

  return hotel;
}

//**********************************************************/
export const getHotelRankingString = async(addressbook_id) => {

  const whereStr = 'acs.Addressbook_id = ' + addressbook_id.toString() + " AND acs.AddressbookServices_id IN (7,8,9,10) AND COALESCE(acs.Ranking,0) > 0";
  const tableStr = 'AddressbookCategoryServices acs ' + 
    'LEFT JOIN AddressbookServices as1 ON acs.AddressbookServices_id = as1.AddressbookServices_id ';
  const servicesArr = await dbGetRecord({fields: ["as1.AddressbookService + ' [' + CAST(acs.Ranking AS VARCHAR(2)) + ']' AS AddressbookService"], orders: ['as1.OrderNo'], table: tableStr, where: whereStr});

  let rankingObj = {rankingStr: ''};
  for (const rec of servicesArr) {
    rankingObj.rankingStr += (rankingObj.rankingStr.trim().length > 0) ? ', ' : '';
    rankingObj.rankingStr += rec.AddressbookService;
  }
  
  return (rankingObj);

}


//**********************************************************/
export const getBookingPaxNames = async (bookings_id) => {

  let query = "SELECT Name FROM BookingsClients bc " + 
    "WHERE Bookings_id = " + bookings_id.toString();

  const namesArr = await dbGetRecordRaw({query: query });

  if (namesArr.length > 0) {    
    return ({clients: namesArr.map((e) => e.Name).join(', ')})    
  } else {
    return ({clients: ''})    
  }

}

//**********************************************************/
export const getBookingTourCodes = async (bookings_id) => {

  let query = "SELECT TourCode, TourDate FROM BookingsTours bt " + 
    "WHERE Bookings_id = " + bookings_id.toString();

  const toursObj = await dbGetRecordRaw({query: query });

  let tourStr = '';
  for (const rec of toursObj) {
    if (tourStr.trim().length > 0) {
      tourStr += ', ';
    }
    tourStr += rec.TourCode + ' ' + moment(rec.TourDate).format('DD/MM/YYYY');
  }
  const tours = {tours: tourStr};

  return tours;

}


//**********************************************************/
export const getExchRate = async (currencies_id, wef) => {

  const query = "SELECT ExchRate = [dbo].[fn_GetExchangeRate] (" + 
      currencies_id.toString() + ", '" +
      moment(wef,'DD/MM/YYYY').format('MM/DD/YYYY') + "')"
  
  let exchRateData = await dbGetRecordRaw({query: query});

  let exchRate = 1.0;
  if (exchRateData.length > 0) {
    exchRate = exchRateData[0].ExchRate;
  }

  return exchRate;

}


//**********************************************************/
export const getCurrencyForAgent = async (addressbook_id) => {

  // default to Euro
  let currencies_id = 27;

  const query = "SELECT currencies_id FROM Addressbook " + 
    "WHERE Addressbook_id = " + addressbook_id.toString() + " ";

  const currencyQry = await dbGetRecordRaw({query: query });
  if (currencyQry.length > 0 && currencyQry[0].currencies_id !== null) {
    currencies_id = currencyQry[0].currencies_id;
  }

  return currencies_id;

} 
