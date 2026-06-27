import { dbGetRecordRaw } from '../../../../actions';
import { isValidTime } from "../../../common/CommonTransactionFunctions";

import moment from 'moment';

//**********************************************************/
export const getActivityData = async (quotations_id) => {
        
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

  let data = await dbGetRecordRaw({query: query});

  const accommodationData = data.map(rec => {return {...rec, DateIn: (rec.DateIn !== null) ? rec.DateIn.replace('T', ' ').replace('Z', '') : null, 
    DateOut: (rec.DateOut !== null) ? rec.DateOut.replace('T', ' ').replace('Z', '') : null}});

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

  data = await dbGetRecordRaw({query: query});

  const servicesData = data.map(rec => {return {...rec, ServiceDate: (rec.ServiceDate !== null) ? rec.ServiceDate.replace('T', ' ').replace('Z', '') : rec.ServiceDate, StartTime: (rec.StartTime !== null) ? rec.StartTime.replace('T', ' ').replace('Z', '') : rec.StartTime}});

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

  data = await dbGetRecordRaw({query: query});

  const ticketsData = data.map(rec => {return {...rec, TravelDate: rec.TravelDate.replace('T', ' ').replace('Z', ''), ETA: rec.ETA.replace('T', ' ').replace('Z', ''), ETD: rec.ETD.replace('T', ' ').replace('Z', '')}});

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
export const gatherData = async (data, mainData) => { 
    
  let id = 1;

  // Accommodation
  data.accommodationData.forEach(rec => {
    const description = 'Stay in ' + rec.Hotel;
    mainData.push({key: id, 
      quoCities_id: rec.QuoCities_id, 
      quoAccommodation_id: rec.QuoAccommodation_id,
      activityDate: moment(rec.DateIn).format('DD/MM/YYYY'),
      activityTime: '00:00',
      activityType: 2,
      description: description, 
      city: rec.City,
      activityTimeEnd: null,
      carCoverage: [0,0],
      cities_id: rec.Cities_id
    });
    id++;
  })

  // Services
  data.servicesData.forEach(rec => {
    const description = rec.Service;
    let activityTimeEnd = null;
    if (rec.Duration !== null && isValidTime(rec.Duration)) {
      const minutes = parseInt(rec.Duration.substr(0,2))*60 + parseInt(rec.Duration.substr(3,2));
      let startTime = new Date(moment(rec.ServiceDate).format('MM/DD/YYYY') + ' ' + moment(rec.StartTime).format('HH:mm'));
      activityTimeEnd = moment(startTime).add(minutes,'minutes').format('MM/DD/YYYY HH:mm');
    }  
    mainData.push({key: id, 
      quoCities_id: rec.QuoCities_id, 
      quoServices_id: rec.QuoServices_id,
      activityDate: moment(rec.ServiceDate).format('DD/MM/YYYY'),
      activityTime: moment(rec.StartTime).format('HH:mm'),
      activityType: rec.Sightseeing ? 3 : 4,
      transferTypes_id: rec.TransferTypes_id,
      description: description,
      city: rec.City,
      activityTimeEnd: activityTimeEnd,
      carCoverage: [0,0],
      cities_id: rec.Cities_id
    });
    id++;
  })

  // Tickets
  data.ticketsData.forEach(rec => {
    let description = '';
    let Overnight = rec.Overnight ? 'Overnight ' : '';
    if (rec.Tickets_id === 1) {
      description = Overnight + 'Flight [' + rec.FlightNo.trim() + 
        '] from ' + rec.FromCity + ' to ' + rec.ToCity;
    } else if (rec.Tickets_id === 2) {
      description = Overnight + 'Train [' +  rec.FlightNo.trim() + 
        '] from ' + rec.FromCity + ' ('  + (rec.FromStation ? rec.FromStation : '?? station') + ')' + 
        ' to ' + rec.ToCity + ' ('  + (rec.ToStation ? rec.ToStation : '?? station') + ')';
    } else if (rec.Tickets_id === 5) {
      description = 'Drive from ' + rec.FromCity + ' to ' + rec.ToCity;
      if (rec.DriveType !== null) {
        description += ' (' + rec.DriveType + ')';
      }
    } else {
      description = rec.Mode +  ' from ' + rec.FromCity + ' to ' + rec.ToCity;
    }
    mainData.push({key: id, 
      quoCities_id: rec.QuoCities_id, 
      quoTickets_id: rec.QuoTickets_id,
      activityDate: moment(rec.TravelDate).format('DD/MM/YYYY'),
      activityTime: moment(rec.ETD).format('HH:mm'),
      activityType: 1, 
      tickets_id: rec.Tickets_id,
      destinationArrivalDate: moment(rec.ETA).format('DD/MM/YYYY'),
      description: description,
      city: rec.FromCity,
      activityTimeEnd: moment(rec.ETA).format('MM/DD/YYYY HH:mm'),
      carCoverage: [0,0],
      cities_id: rec.From_Cities_id
    });
    id++;
  })


};  


//**********************************************************/
export const setAccommodationTimings = async (dataObj, mainData) => { 

  mainData.forEach(rec => {
    if (rec.activityType === 2) {
      /*=== Check if arrival transfer exists on that day ===*/
      let data = mainData.filter(item => item.activityType === 4 && item.activityDate === rec.activityDate && item.transferTypes_id === 1);
      if (data.length > 0) {
        let serviceData = dataObj.servicesData.filter(item => item.QuoServices_id === data[0].quoServices_id);
        let destinationTime = moment(data[0].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' ' + moment(serviceData[0].StartTime).format('HH:mm');
        let minutes = 0;
        if (serviceData.length > 0 && serviceData[0].Duration !== null && isValidTime(serviceData[0].Duration)) {
          minutes = parseInt(serviceData[0].Duration.substr(0,2))*60 + parseInt(serviceData[0].Duration.substr(3,2));
        }
        rec.activityTime = moment(destinationTime).add(minutes,'minutes').format('HH:mm');
      } else {
        /*=== Check if car arrives on that day ===*/
        let data = mainData.filter(item => item.activityType === 1 && item.tickets_id === 5 && item.destinationArrivalDate === rec.activityDate);
        if (data.length > 0) {
          let ticketsData = dataObj.ticketsData.filter(item => item.QuoTickets_id === data[0].quoTickets_id);
          if (ticketsData.length > 0) {
            rec.activityTime = moment(ticketsData[0].ETA).format('HH:mm');
          }
        } else {
          /*=== Check if car arrives on that day ===*/
          let data = mainData.filter(item => item.activityType === 1 && (item.tickets_id === 1 || item.tickets_id === 2) && item.destinationArrivalDate === rec.activityDate);
          if (data.length > 0) {
            let ticketsData = dataObj.ticketsData.filter(item => item.QuoTickets_id === data[0].quoTickets_id);
            if (ticketsData.length > 0) {
              rec.activityTime = moment(ticketsData[0].ETA).format('HH:mm');
            }
          }
        }
      }
    } 
  });
    
}

//**********************************************************/
export const arraySort = async (mainData) => {

  mainData.sort(function(a,b){
    const date2 = moment(b.activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' ' +  b.activityTime;
    const date1 = moment(a.activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' ' +  a.activityTime;
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(date1) - new Date(date2);
  });

}

//**********************************************************/
export const arrivalDepartureData = async (quotations_id, mainData) => {

  let maxId = Math.max(...mainData.map(rec => rec.key));

  /*=== Get Date Range of Tour ===*/
  let query = "SELECT q.DateOfArrival, q.FlightNo, q.DateOfDeparture, q.PlaceFrom, q.ETA, " +
    "q.DateOfDeparture, q.FlightNoDept, q.PlaceTo, q.ETD, " +
    "c1.city AS FromCity, c2.city AS ToCity " +
    "FROM Quotations q " +
    "LEFT JOIN Cities c1 ON q.StartCities_id = c1.Cities_id " +
    "LEFT JOIN Cities c2 ON q.EndCities_id = c2.Cities_id " +
    "WHERE Quotations_id = " + quotations_id.toString() + " ";

  let data = await dbGetRecordRaw({query: query});

  if (data.length > 0) {

    // Arrival 
    let dateOfArrival = data[0].DateOfArrival.replace('T', ' ').replace('Z', '');
    let eta = '';
    if (data[0].ETA !== null) {
      eta = data[0].ETA.replace('T', ' ').replace('Z', '');           
      eta = moment(eta).format('HH:mm');            
    }
    let title = 'Clients arrive by ' + ((data[0].FlightNo !== null) ? data[0].FlightNo : '') + ' ';
    title += 'from ' + ((data[0].PlaceFrom !== null) ? data[0].PlaceFrom : '') + ' ';

    maxId++;

    let obj = {key: maxId, activityType: 100, activitySubtype: 1, activityDate: moment(dateOfArrival).format('DD/MM/YYYY'), activityTime: eta, 
        description: title, city: data[0].FromCity};
    mainData.splice(0, 0, obj);

    // Departure
    let dateOfDeparture = data[0].DateOfDeparture.replace('T', ' ').replace('Z', '');
    let etd = '';
    if (data[0].ETD !== null) {
      etd = data[0].ETD.replace('T', ' ').replace('Z', '');           
      etd = moment(etd).format('HH:mm');            
    }
    title = 'Clients depart by ' + ((data[0].FlightNoDept !== null) ? data[0].FlightNoDept : '') + ' ';
    title += 'to ' + ((data[0].PlaceTo !== null) ? data[0].PlaceTo : '') + ' ';

    maxId++;

    obj = {key: maxId, activityType: 100, activitySubtype: 2, activityDate: moment(dateOfDeparture).format('DD/MM/YYYY'), activityTime: etd, 
        description: title, city: data[0].ToCity};
    mainData.push(obj);

  }

}


//**********************************************************/
/*
export const setDayHeader = async (quotations_id, tourDate, mainData) => { 
    
  let maxId = Math.max(...mainData.map(rec => rec.key));

  let minDate = null;
  let maxDate = null;
      
  //=== Get Date Range of Tour ===
  let query = "SELECT MIN(DateIn) AS MinDate, MAX(DateOut) AS MaxDate " + 
    "FROM QuoCities " +
    "WHERE Quotations_id = " + quotations_id.toString() + " ";

  let data = await dbGetRecordRaw({query: query});

  if (data.length > 0) {
    minDate = data[0].MinDate;
    minDate = minDate.replace('T', ' ').replace('Z', '');

    maxDate = data[0].MaxDate;
    maxDate = maxDate.replace('T', ' ').replace('Z', '');
  }

  minDate = (minDate !== null) ? moment(minDate).format('DD/MM/YYYY') : null;
  maxDate = (maxDate !== null) ? moment(maxDate).format('DD/MM/YYYY') : null;

  // Starting City every Day
  let xDate = minDate;
  while (moment(xDate,'DD/MM/YYYY') <= moment(maxDate,'DD/MM/YYYY')) {
    maxId++;

    const currentDate = moment(xDate,'DD/MM/YYYY');
    const index = mainData.findIndex(rec => moment(rec.activityDate,'DD/MM/YYYY') >= currentDate);
    if (index > -1) {
      const dayNo = moment(xDate,'DD/MM/YYYY').diff(moment(tourDate,'DD/MM/YYYY'),'days') + 1;
      const day = moment(xDate,'DD/MM/YYY').format('ddd') + ', ' + xDate;
      const title = 'Day ' + dayNo.toString() + ' - ' + day + ' -- Day starts in ' + mainData[index].city;
    
      const obj = {key: maxId, activityType: 0, activitySubtype: 1, activityDate: xDate, activityTime: '00:00', 
        description: title, city: mainData[index].city};
      mainData.splice(index, 0, obj);
    } 

    xDate = moment(xDate,'DD/MM/YYYY').add(1,'day').format('DD/MM/YYYY');

  }

  // Change in City during the day
  xDate = minDate;  
  while (moment(xDate,'DD/MM/YYYY') <= moment(maxDate,'DD/MM/YYYY')) {
    maxId++;

    //=== if arrival transfer occurs on same day that means you must be in a different city ===
    const index = mainData.findIndex(rec => rec.activityDate === xDate && rec.activityType === 4 && rec.transferTypes_id === 1);

    //=== Check that the previous line is not of activity 0 'Day Starts In'. Happens normally on Day 1 ===
    //=== OR previous line is not of activity 100 'Clients arrive by'. Happens normally on Day 1 ===
    let prevActivity0 = false;
    if (index > 0) {
      prevActivity0 = (mainData[index-1].activityType === 0 || mainData[index-1].activityType === 100);
    }

    //=== If arrival transfer on the day exists ===
    if (!prevActivity0 && (index > -1)) {
      const title = ' ... Day continues in ' + mainData[index].city;
    
      const obj = {key: maxId, activityType: 0, activitySubtype: 2, activityDate: xDate, activityTime: mainData[index].activityTime, 
        description: title, city: mainData[index].city};
      mainData.splice(index, 0, obj);
    //=== Maybe transfer is not specified. Find accommodation record on that day ===
    //=== Day 1 may pass the test so also check if city changes ===
    } else {

      //=== Current City ===
      const currentCityObj = mainData.filter(rec => rec.activityDate === xDate);      
      const currentCity = (currentCityObj.length > 0) ? currentCityObj[0].city : '';

      //=== Next City ===
      const activityTypes_arr = [2];
      const nextCityObj = mainData.filter(rec => rec.activityDate === xDate && activityTypes_arr.indexOf(rec.activityType) !== -1);
      if (currentCityObj.length > 0 && nextCityObj.length > 0 && nextCityObj[0].city !== currentCity) {

        const nextCity = nextCityObj[0].city;
        const eta = nextCityObj[0].activityTime;
        const acc_id = nextCityObj[0].quoAccommodation_id;

        const title = ' ... Day continues in ' + nextCity;

        const obj = {key: maxId, activityType: 0, activitySubtype: 2, activityDate: xDate, activityTime: eta, 
          description: title, city: nextCity};

        const accIndex = mainData.findIndex(rec => rec.quoAccommodation_id === acc_id);
        if (accIndex > -1) {
          mainData.splice(accIndex, 0, obj);
        }
              
      }

    }

    xDate = moment(xDate,'DD/MM/YYYY').add(1,'day').format('DD/MM/YYYY');

  }

  // Change 'Day Starts in Delhi' to 'In Delhi' if city does not change
  mainData.filter(e => e.activityType === 0 && e.activitySubtype === 1).map(rec => {
    const activityDate = rec.activityDate;

    const activityIndex = mainData.findIndex(e => e.activityType === 0 && e.activitySubtype === 2 && e.activityDate === activityDate);
    if (activityIndex === -1) {
      rec.description = rec.description.replace("Day starts in", "In");
    }

    return {...rec}
      
  })

};
*/  

//**********************************************************/
export const setDayAtLeisure = async (mainData) => { 
    
  let maxId = Math.max(...mainData.map(rec => rec.key));

  // For start of new day, activity type 0, check if any other records exist. If none -> Day at Leisure
  mainData.filter(e => e.activityType === 0 && e.activitySubtype === 1).forEach((rec) => {
    const index = mainData.findIndex(elem => elem.activityDate === rec.activityDate && elem.activityType !== 0);
    if (index === -1) {      
      // Be careful with indexes here. Do not take idx as that is the index of the filtered table
      const mainIdx = mainData.findIndex(elem => elem.key === rec.key);

      maxId++;
      const title = 'Day at Leisure';
      const activityTimeEnd = moment(rec.activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' 09:01';

      const obj = {key: maxId, activityType: 20, activityDate: rec.activityDate, activityTime: '09:00', activityTimeEnd: activityTimeEnd,
        description: title, city: rec.city, carCoverage: [0,0]};
      mainData.splice(mainIdx+1, 0, obj);

    }
  });

};  



//**********************************************************/
export const setCarCoverage = async (quotations_id, mainData) => { 
        
  /*=== Get Date Range of Tour ===*/
  let query = "SELECT DISTINCT GroupReportDate, GroupReleaseDate, GroupNo " + 
    "FROM QuoTickets " +
    "WHERE Quotations_id = " + quotations_id.toString() + " " + 
    "AND Tickets_id = 5 " +
    "AND GroupReportDate IS NOT NULL " +
    "AND GroupReleaseDate IS NOT NULL " + 
    "ORDER BY GroupNo";

  let data = await dbGetRecordRaw({query: query});

  for (var j=0; j<data.length; j++) {
    data[j].GroupReportDate = data[j].GroupReportDate.replace('T', ' ').replace('Z', '');
    data[j].GroupReleaseDate = data[j].GroupReleaseDate.replace('T', ' ').replace('Z', '');
  }

  const activityTypeArr = [1,2,3,4,20];

  //for (j=0; j<data.length; j++) {
  data.forEach (dataRec => {

    mainData.forEach(rec => {

      let carCoverageTop = 0;
      let carCoverageBottom = 0;
      if (activityTypeArr.indexOf(rec.activityType) !== -1) {

        if (rec.activityType === 2 || rec.activityType === 20) {
          const activityTimeStart = moment(moment(rec.activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' ' + rec.activityTime);
          if (activityTimeStart >= moment(dataRec.GroupReportDate) && activityTimeStart < moment(dataRec.GroupReleaseDate)) {
            carCoverageTop = 1;
            carCoverageBottom= 1;
            rec.groupNo = dataRec.GroupNo;
          }          
        }
        if (rec.activityTimeEnd !== undefined && rec.activityTimeEnd !== null) {
          const activityTimeStart = moment(moment(rec.activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' ' + rec.activityTime);
          const activityTimeEnd = moment(rec.activityTimeEnd);

          if (rec.activityType === 1 && rec.tickets_id === 5) {
            if (activityTimeStart >= moment(dataRec.GroupReportDate) && activityTimeStart <= moment(dataRec.GroupReleaseDate)) {
              carCoverageTop = 1;
            }          
            if (activityTimeEnd >= moment(dataRec.GroupReportDate) && activityTimeEnd <= moment(dataRec.GroupReleaseDate)) {
              carCoverageBottom = 1;
            }            
            
          } else {
  
            if (activityTimeStart >= moment(dataRec.GroupReportDate) && activityTimeStart < moment(dataRec.GroupReleaseDate)) {
              carCoverageTop = 1;
            }          
            if (activityTimeEnd > moment(dataRec.GroupReportDate) && activityTimeEnd <= moment(dataRec.GroupReleaseDate)) {
              carCoverageBottom = 1;
            }            

          }

        }

        // Do not overwrite if already 1
        if (rec.carCoverage[0] !== 1) {
          rec.carCoverage[0] = carCoverageTop;
          if (carCoverageTop === 1) {
            rec.groupNo = dataRec.GroupNo;
          }
        }

        // Do not overwrite if already 1
        if (rec.carCoverage[1] !== 1) {
          rec.carCoverage[1] = carCoverageBottom;
          if (carCoverageTop === 1) {
            rec.groupNo = dataRec.GroupNo;
          }
        }

      };
      
    });
  
  });

};  


//**********************************************************/
/*
export const setCarReportRelease = async (quotations_id, mainData) => { 

  let index = -1;

  //=== Get Date Range of Tour ===
  let query = "SELECT DISTINCT GroupNo " + 
    "FROM QuoTickets " +
    "WHERE Quotations_id = " + quotations_id.toString() + " " + 
    "AND Tickets_id = 5 " +
    "AND GroupReportDate IS NOT NULL " +
    "AND GroupReleaseDate IS NOT NULL ";

  let data = await dbGetRecordRaw({query: query});

  for (var i=0; i<data.length; i++) {

    //*=== Get Group Report Date ===
    let groupQuery = "SELECT GroupReportDate, GroupReleaseDate, QuoTickets_id " + 
      "FROM QuoTickets " +
      "WHERE Quotations_id = " + quotations_id.toString() + " " + 
      "AND Tickets_id = 5 " +
      "AND GroupNo = " + data[i].GroupNo.toString() + " " + 
      "ORDER BY GroupOrderNo";

    let groupData = await dbGetRecordRaw({query: groupQuery});
    
    if (groupData.length > 0) {
      index = mainData.findIndex(rec => rec.activityType === 1 && rec.tickets_id === 5 && rec.quoTickets_id === groupData[0].QuoTickets_id);

      if (index > -1) {
        let groupReport = groupData[0].GroupReportDate;
        groupReport = groupReport.replace('T', ' ').replace('Z', '');
      
        mainData[index].carReport = moment(groupReport).format('HH:mm');
        mainData[index].groupReportDate = moment(groupReport).format('MM/DD/YYYY HH:mm');

        // for release find the last record in mainData with the same group no
        const releaseData = mainData.filter(rec => rec.groupNo === data[i].GroupNo);

        if (releaseData.length > 0) {
          let groupRelease = groupData[0].GroupReleaseDate;
          groupRelease = groupRelease.replace('T', ' ').replace('Z', '');
          const key = releaseData[releaseData.length-1].key;

          index = mainData.findIndex(rec => rec.key === key);
          mainData[index].carRelease = moment(groupRelease).format('HH:mm');
          mainData[index].groupReleaseDate = moment(groupRelease).format('MM/DD/YYYY HH:mm');
          
        }
      }
    }
  }

};
*/  

//**********************************************************/
export const colorDriveGroups = async (mainData) => { 

  let driveGroupNo = 0;
  let counter = 0;
    
  // For start of new day, activity type 0, check if any other records exist. If none -> Day at Leisure
  mainData.forEach((rec,idx) => {
    if (rec.groupNo !== undefined && rec.groupNo !== null) {
      counter = (rec.groupNo !== driveGroupNo) ? counter+1 : counter;
      const groupColor = ((counter % 2) !== 0) ? '#b3ffcc' : '#d7b3ff';
      mainData[idx].groupColor = groupColor;      
      driveGroupNo = rec.groupNo;
    }
  });

};  
