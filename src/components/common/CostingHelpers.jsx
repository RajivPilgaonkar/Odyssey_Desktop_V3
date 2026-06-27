import { dbGetRecordRaw, dbExecuteSp } from '../../actions';
import { convertDMY_MDY, convert_DbDate_To_MDY, convert_DbDate_To_DMY } from "./CommonTransactionFunctions";

//**********************************************************/
export const checkDatesOverLap = async (seasons_id, addressbook_id, dbFromDate, dbToDate) => {

  const seasonsStr = (seasons_id === null) ? '' : ' AND seasons_id <> ' + seasons_id.toString();
  let query = '';

  if (dbToDate !== null) {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);
    const toDate =  convert_DbDate_To_MDY(dbToDate, 1);
  
    const toDateStr = (dbToDate === null) ? '' : ` OR ('${toDate}' BETWEEN FromDate AND ToDate) `;
  
    query = `SELECT Seasons_id FROM Seasons 
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND ((('${fromDate}' BETWEEN FromDate AND ToDate) OR ('${fromDate}' >= FromDate AND ToDate IS NULL))
       ${toDateStr}) 
       ${seasonsStr}`;
    
  } else {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);
    
    query = `SELECT Seasons_id FROM Seasons 
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND ('${fromDate}' >= FromDate AND ToDate IS NULL)
       ${seasonsStr}`;
    
  }

  let errorStr = '';

  const seasonsArr = await dbGetRecordRaw({query: query });
  if (seasonsArr.length > 0) {
    errorStr = 'From or To Date overlaps with existing data';  
  }

  return errorStr;

}

//**********************************************************/
export const getDefaultRoom = async (seasons_id) => {
  
  const query = "SELECT Default_RoomTypes_id FROM Seasons " + 
    "WHERE Seasons_id = " + seasons_id.toString();

  const seasonsArr = await dbGetRecordRaw({query: query });

  const defaultRoomTypes_id = (seasonsArr.length > 0 && seasonsArr[0].Default_RoomTypes_id !== null) ? 
    seasonsArr[0].Default_RoomTypes_id : null;

  return {defaultRoomTypes_id: defaultRoomTypes_id}
        
}
  
//**********************************************************/
export const setDefaultRoom = async (formData, mainData) => {

  // update the default room in the seasons table
  if (formData.DefaultRoom) {

    const sql = "UPDATE seasons SET " + 
      "Default_RoomTypes_id = " + formData.RoomTypes_id.toString() + " " +
      "WHERE Seasons_id = " + formData.Seasons_id;
   
    const spData = {sql: sql}
    await dbExecuteSp(spData);  

    // set default to 0 for rest of the array
    mainData.forEach(rec => {
      if (rec.HotelTariffs_id !== formData.HotelTariffs_id) {
        rec.DefaultRoom = false;
      }
    });

  }

}

//**********************************************************/
export const getHotelLabel = async (addressbook_id, wef) => {

  let label = '';

  let query = `SELECT COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity
    FROM Addressbook a LEFT JOIN Cities c ON a.Cities_id = c.Cities_id
    WHERE a.Addressbook_id = ${addressbook_id.toString()}`;

  const orgArr = await dbGetRecordRaw({query: query });
  if (orgArr.length > 0) {
    label += orgArr[0].OrgCity; 
  }

  if (wef.trim().length > 0) {
    const fromDate = convertDMY_MDY(wef);
    query = `SELECT FromDate, ToDate
      FROM Seasons WHERE Addressbook_id = ${addressbook_id.toString()} 
      AND FromDate = '${fromDate}' `;

    const seasonsArr = await dbGetRecordRaw({query: query });
    if (seasonsArr.length > 0) {
      let dateStr = convert_DbDate_To_DMY(seasonsArr[0].FromDate,1); 
      if (seasonsArr[0].ToDate !== null) {
        dateStr += ' to ' + convert_DbDate_To_DMY(seasonsArr[0].ToDate,1); 
      }
      label += (dateStr.length > 0) ? ' ('+dateStr+')' : '';
    }
  }
    
  return label;

}

//**********************************************************/
export const getAgentLabel = async (addressbook_id, serviceCities_id, wef) => {

  let label = '';

  let query = `SELECT COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity
    FROM Addressbook a LEFT JOIN Cities c ON a.Cities_id = c.Cities_id
    WHERE a.Addressbook_id = ${addressbook_id.toString()}`;

  const orgArr = await dbGetRecordRaw({query: query });
  if (orgArr.length > 0) {
    label += orgArr[0].OrgCity; 
  }

  if (serviceCities_id !== undefined && serviceCities_id !== null) {
    query = `SELECT City
      FROM Cities WHERE Cities_id = ${serviceCities_id.toString()} `
  
    const citiesArr = await dbGetRecordRaw({query: query });
    if (citiesArr.length > 0) {
      let city = citiesArr[0].City; 
      label += ' (Service City: ' + city + ')';
    }  

  }

  if (wef.trim().length > 0) {
    const fromDate = convertDMY_MDY(wef);
    query = `SELECT Wef
      FROM CostServices WHERE Addressbook_id = ${addressbook_id.toString()} 
      AND Wef = '${fromDate}' `;
  
    const costServiceArr = await dbGetRecordRaw({query: query });
    if (costServiceArr.length > 0) {
      let dateStr = convert_DbDate_To_DMY(costServiceArr[0].Wef,1); 
      label += (dateStr.length > 0) ? ' ('+dateStr+')' : '';
    }  
  }
    
  return label;

}

//**********************************************************/
export const getAgentCgLabel = async (addressbook_id, carHireGroups_id, wef) => {

  let label = '';

  let query = `SELECT COALESCE(a.Organisation,'') + ', ' + COALESCE(c.City,'') AS OrgCity
    FROM Addressbook a LEFT JOIN Cities c ON a.Cities_id = c.Cities_id
    WHERE a.Addressbook_id = ${addressbook_id.toString()}`;

  const orgArr = await dbGetRecordRaw({query: query });
  if (orgArr.length > 0) {
    label += orgArr[0].OrgCity; 
  }

  if (carHireGroups_id !== undefined && carHireGroups_id !== null) {
    query = `SELECT carHireGroup
      FROM carHireGroups WHERE carHireGroups_id = ${carHireGroups_id.toString()} `
  
    const carHireGroupArr = await dbGetRecordRaw({query: query });
    if (carHireGroupArr.length > 0) {
      let carHireGroup = carHireGroupArr[0].carHireGroup; 
      label += ' (' + carHireGroup + ')';
    }  

  }
    
  return label;

}


//**********************************************************/
export const getServiceLabel = async (services_id, wef) => {

  let label = '';

  let query = `SELECT Description 
    FROM Services
    WHERE Services_id = ${services_id.toString()}`;

  const servArr = await dbGetRecordRaw({query: query });
  if (servArr.length > 0) {
    label += servArr[0].Description; 
  }

  if (wef.trim().length > 0) {
    label += (wef.length > 0) ? ' ('+wef+')' : '';
  }
    
  return label;

}

//**********************************************************/
export const getGridHeight = (numRows) => {

  const gridHeaderHeight = 37;
  const gridRowHeight = 34;
  
  const gridHeight = gridHeaderHeight + (gridRowHeight*numRows) + 5;

  return gridHeight;
}

//**********************************************************/
export const checkCarDatesOverLap = async (carHire_id, addressbook_id, cities_id, vehicles_id, dbFromDate, dbToDate) => {

  const carHireStr = (carHire_id === null) ? '' : ' AND carHire_id <> ' + carHire_id.toString();
  let query = '';

  if (dbToDate !== null) {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);
    const toDate =  convert_DbDate_To_MDY(dbToDate, 1);
  
    const toDateStr = (dbToDate === null) ? '' : ` OR ('${toDate}' BETWEEN Wef AND Wet) `;
  
    query = `SELECT CarHire_id FROM CarHire
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND Vehicles_id = ${vehicles_id.toString()}
      AND ServiceCities_id = ${cities_id.toString()}
      AND ((('${fromDate}' BETWEEN Wef AND Wet) OR ('${fromDate}' >= Wef AND Wet IS NULL))
       ${toDateStr}) 
       ${carHireStr}`;
    
  } else {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);

    query = `SELECT CarHire_id FROM CarHire
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND Vehicles_id = ${vehicles_id.toString()}
      AND ServiceCities_id = ${cities_id.toString()}
      AND ('${fromDate}' >= Wef AND Wet IS NULL)
      ${carHireStr}`;
        
  }

  let errorStr = '';

  const carHireArr = await dbGetRecordRaw({query: query });
  if (carHireArr.length > 0) {
    errorStr = 'From or To Date overlaps with existing data';  
  }

  return errorStr;

}

//**********************************************************/
export const checkCarP2PDatesOverLap = async (carHireP2P_id, addressbook_id, vehicles_id, fromCities_id, toCities_id, dbFromDate, dbToDate) => {

  const carHireStr = (carHireP2P_id === null) ? '' : ' AND carHireP2P_id <> ' + carHireP2P_id.toString();
  let query = '';

  if (dbToDate !== null) {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);
    const toDate =  convert_DbDate_To_MDY(dbToDate, 1);
  
    const toDateStr = (dbToDate === null) ? '' : ` OR ('${toDate}' BETWEEN Wef AND Wet) `;
  
    query = `SELECT CarHireP2P_id FROM CarHireP2P
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND Vehicles_id = ${vehicles_id.toString()}
      AND FromCities_id = ${fromCities_id.toString()}
      AND ToCities_id = ${toCities_id.toString()}
      AND ((('${fromDate}' BETWEEN Wef AND Wet) OR ('${fromDate}' >= Wef AND Wet IS NULL))
       ${toDateStr}) 
       ${carHireStr}`;
    
  } else {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);

    query = `SELECT CarHireP2P_id FROM CarHireP2P
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND Vehicles_id = ${vehicles_id.toString()}
      AND FromCities_id = ${fromCities_id.toString()}
      AND ToCities_id = ${toCities_id.toString()}
      AND ('${fromDate}' >= Wef AND Wet IS NULL)
      ${carHireStr}`;
        
  }

  let errorStr = '';

  const carHireArr = await dbGetRecordRaw({query: query });
  if (carHireArr.length > 0) {
    errorStr = 'From or To Date overlaps with existing data';  
  }

  return errorStr;

}


//**********************************************************/
export const checkCarCgDatesOverLap = async (carHireGroupCosts_id, addressbook_id, vehicles_id, carHireGroups_id, dbFromDate, dbToDate) => {

  const carHireStr = (carHireGroupCosts_id === null) ? '' : ' AND carHireGroupCosts_id <> ' + carHireGroupCosts_id.toString();
  let query = '';

  if (dbToDate !== null) {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);
    const toDate =  convert_DbDate_To_MDY(dbToDate, 1);
  
    const toDateStr = (dbToDate === null) ? '' : ` OR ('${toDate}' BETWEEN Wef AND Wet) `;
  
    query = `SELECT CarHireGroupCosts_id FROM CarHireGroupCosts
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND Vehicles_id = ${vehicles_id.toString()}
      AND CarHireGroups_id = ${carHireGroups_id.toString()}
      AND ((('${fromDate}' BETWEEN Wef AND Wet) OR ('${fromDate}' >= Wef AND Wet IS NULL))
       ${toDateStr}) 
       ${carHireStr}`;
    
  } else {

    const fromDate =  convert_DbDate_To_MDY(dbFromDate, 1);

    query = `SELECT CarHireGroupCosts_id FROM CarHireGroupCosts
      WHERE Addressbook_id = ${addressbook_id.toString()}
      AND Vehicles_id = ${vehicles_id.toString()}
      AND CarHireGroups_id = ${carHireGroups_id.toString()}
      AND ('${fromDate}' >= Wef AND Wet IS NULL)
      ${carHireStr}`;
        
  }

  let errorStr = '';

  const carHireArr = await dbGetRecordRaw({query: query });
  if (carHireArr.length > 0) {
    errorStr = 'From or To Date overlaps with existing data';  
  }

  return errorStr;

}

//**********************************************************/
export const filterActiveVehicles = (vehicleArr) => {
  const filteredArr = [];

  const uniqueVehicles = [...new Set(vehicleArr.map(item => item.vehicle))]; 

  for (const rec of uniqueVehicles) {
    let idx = vehicleArr.findIndex(e => e.vehicle === rec && e.Active);
    if (idx < 0) {
      idx = vehicleArr.findIndex(e => e.vehicle === rec);
    }
    filteredArr.push(vehicleArr[idx])
  }

  return filteredArr;
      
}
