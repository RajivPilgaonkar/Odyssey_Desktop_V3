import moment from 'moment';
import { dbGetRecord } from '../../actions';
import { dbGetRecordRaw } from '../../actions';

//**********************************************************/
export const getAgentListing = async(types_id_str, active) => {

  let tableStr = "addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ";
  let whereStr = "a.addressbook_id IN " +
    "(SELECT acs.Addressbook_id FROM AddressbookCategoryServices acs " + 
    "WHERE acs.addressbook_id = a.addressbook_id " +
    "AND acs.AddressbookServices_id IN (" + types_id_str + ")) ";

  if (active !== undefined && active) {
    whereStr += ' AND a.active = 1';
  }

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity "], orders: ['a.Organisation'], table: tableStr, where: whereStr});   

  return (data);

}


//**********************************************************/
export const getAgentSubCatListing = async(types_id_str, active) => {

  const activeStr = active ? ' a.active = 1 AND ' : '';

  let tableStr = "addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ";
  let whereStr = activeStr + " a.addressbook_id IN " +
    "(SELECT ac.Addressbook_id FROM AddressbookSubcategories ac " + 
    "WHERE ac.addressbook_id = a.addressbook_id " +
    "AND ac.ContactSubCategories_id IN (" + types_id_str + ")) " + 
    "AND COALESCE(a.Organisation,'') > ''";

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity, a.Cities_id, a.Active "], orders: ['Organisation'], table: tableStr, where: whereStr});   

  return (data);

}

//**********************************************************/
export const getAgentSubCatByCityListing = async(types_id_str, active, cities_id) => {

  const activeStr = active ? ' a.active = 1 AND ' : '';
  const citiesStr = 'a.cities_id = ' + cities_id.toString() + ' AND ';

  let tableStr = "addressbook a LEFT JOIN cities c ON a.cities_id = c.cities_id";
  let whereStr = activeStr + citiesStr + " a.addressbook_id IN " +
    "(SELECT ac.Addressbook_id FROM AddressbookSubcategories ac " + 
    "WHERE ac.addressbook_id = a.addressbook_id " +
    "AND ac.ContactSubCategories_id IN (" + types_id_str + ")) ";

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity "], orders: ['Organisation'], table: tableStr, where: whereStr});   

  return (data);

}

//**********************************************************/
export const getAgentSubCatFutureListing = async(types_id_str, active) => {

  const activeStr = active ? ' a.active = 1 AND ' : '';

  let tableStr = "addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ";
  let whereStr = activeStr + " a.addressbook_id IN " +
    "(SELECT ac.Addressbook_id FROM AddressbookSubcategories ac " + 
    "WHERE ac.addressbook_id = a.addressbook_id " +
    "AND ac.ContactSubCategories_id IN (" + types_id_str + ")) " + 
    "AND COALESCE(Organisation,'') > '' " +
    "AND a.addressbook_id IN " + 
    "(SELECT HotelAddressbook_id FROM QuoAccommodation WHERE DateIn >= '" + moment().format('MM/DD/YYYY') + "')"

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity, a.Cities_id "], orders: ['Organisation'], table: tableStr, where: whereStr});   

  return (data);

}


//**********************************************************/
export const getAgentServicesListing = async(types_id_str, active) => {

  const activeStr = active ? ' a.active = 1 AND ' : '';

  let tableStr = "addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ";
  let whereStr = activeStr + "a.addressbook_id IN " +
    "(SELECT acs.Addressbook_id FROM AddressbookCategoryServices acs " + 
    "WHERE acs.addressbook_id = a.addressbook_id " +
    "AND acs.AddressbookServices_id IN (" + types_id_str + ")) ";

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity, a.Active "], orders: ['Organisation'], table: tableStr, where: whereStr});   
  
  return (data);

}


//**********************************************************/
export const getAgentServicesListingInCity = async(types_id_str, cities_id, transfer, active) => {

  const activeStr = active ? ' a.active = 1 AND ' : '';

  let tableStr = "addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ";
  let whereStr = activeStr + "a.addressbook_id IN " +
    "(SELECT acs.Addressbook_id FROM AddressbookCategoryServices acs " + 
    "WHERE acs.addressbook_id = a.addressbook_id " +
    "AND acs.AddressbookServices_id IN (" + types_id_str + ")) " + 
    "AND EXISTS (SELECT * FROM costservices cs " + 
    "LEFT JOIN services s ON cs.services_id = s.services_id " + 
    "WHERE a.addressbook_id = cs.addressbook_id " +
    "AND s.transfer = " + transfer.toString() + " " + 
    "AND cs.cities_id = " + cities_id.toString() + ")";
  
  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity "], orders: ['Organisation'], table: tableStr, where: whereStr});   

  return (data);

}

//**********************************************************/
export const getAgentSearchTagListing = async(types_id_str, active) => {

  const activeStr = active ? ' a.active = 1 AND ' : '';

  let tableStr = "addressbook a LEFT JOIN cities c ON a.cities_id = c.cities_id ";
  let whereStr = activeStr + " a.addressbook_id IN " +
    "(SELECT as1.Addressbook_id FROM AddressbookSearchTags as1 " + 
    "WHERE as1.addressbook_id = a.addressbook_id " +
    "AND as1.SearchTags_id IN (" + types_id_str + ")) " + 
    "AND COALESCE(Organisation,'') > ''";

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity, a.Cities_id "], orders: ['a.Organisation'], table: tableStr, where: whereStr});   

  return (data);

}

//**********************************************************/
export const getAgentByCategoryListing = async(types_id_str) => {

  let tableStr = "addressbook a LEFT JOIN Cities c ON a.cities_id = c.cities_id ";
  let whereStr = "a.ContactCategories_id IN (" + types_id_str + ") ";

  let data = await dbGetRecord({fields: ["a.Addressbook_id, a.Organisation, c.City, COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity "], orders: ['Organisation'], table: tableStr, where: whereStr});   

  return (data);

}

//**********************************************************/
export const getDefaultTrainAgents_id = async() => {

  let agents_id = 2136;

  let tableStr = "Defaults";
  let whereStr = "item = 'Default Ticket Agent - Train'";

  let defaultData = await dbGetRecord({fields: ["number"], table: tableStr, where: whereStr});   
  if (defaultData.length > 0) {
    agents_id = defaultData[0].number;
  }

  let obj = {agents_id: agents_id};

  return (obj);

}

//**********************************************************/
export const getDefaultFlightAgents_id = async() => {

  let agents_id = 2548;

  let tableStr = "Defaults";
  let whereStr = "item = 'Default Ticket Agent - Air'";

  let defaultData = await dbGetRecord({fields: ["number"], table: tableStr, where: whereStr});   
  if (defaultData.length > 0) {
    agents_id = defaultData[0].number;
  }

  let obj = {agents_id: agents_id};

  return (obj);

}

//**********************************************************/
export const getCurrentAgent = async(quoTickets_id) => {

  const ticketsObj = {agents_id: -1, class_id: -1};

  // IN add mode, quoTickets_id will be null
  if (quoTickets_id === null) {
    return ticketsObj;
  }
  
  const query = "SELECT AgentAddressbook_id, Class_id FROM QuoTickets WHERE QuoTickets_id = " + quoTickets_id.toString();
  const data = await dbGetRecordRaw({query: query});   
  if (data.length > 0) {
    ticketsObj.agents_id = data[0].AgentAddressbook_id;
    ticketsObj.class_id = data[0].Class_id;
  }

  return (ticketsObj);

}

//**********************************************************/
export const getBusinessCities = async() => {

  let whereStr = "countries_id IN (SELECT Countries_id FROM Countries WHERE OperateBusiness = 1)";

  let data = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr});   

  return (data);

}

//**********************************************************/
export const getTrainStationCities = async() => {

  let whereStr = "cities_id IN (SELECT cities_id FROM TrainStations WHERE COALESCE(Cities_id,0) > 0)";

  let data = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities', where: whereStr});   

  return (data);

}
