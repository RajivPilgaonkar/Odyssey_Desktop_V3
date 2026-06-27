/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_PARAM_VALUES, GET_PARAM_VALUES } from '../actions/types';

const d = new Date();
let dateDMY = '01/10/' + d.getFullYear().toString();

export default function(state = 
  {agents_id: -1, hotels_id: -1, serviceCities_id: -1, wef: '01/01/2000',
   fromCities_id: -1, toCities_id: -1, carHireGroups_id: -1, startCities_id: -1,
   cities_id: -1, tourCode: '',
   city: '', fromCity: '', toCity: '', agent: '', carHireGroup: '',
   packages_id: -1, numYears: 3, 
   costService: '', costFromDate: '', costToDate: '',
   bookings_id: -1,
   trainNo: '-1', currencies_id: -1,
   accCities_id: -1, accHotels_id: -1, accWef: dateDMY, accLabel: '',
   ssAgents_id: -1, ssServiceCities_id: -1, ssWef: dateDMY,
   carPerKmAgents_id: -1, carPerKmServiceCities_id: -1, carPerKmWef: dateDMY,
   carP2pAgents_id: -1, carP2pFromCities_id: -1, carP2pToCities_id: -1, carP2pWef: dateDMY,
   carCgAgents_id: -1, carCgCarHireGroups_id: -1, carCgWef: dateDMY,
  }, action) {

  switch (action.type) {

    case GET_PARAM_VALUES:
      return state;

    case SET_PARAM_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
