/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_CONFIRMATION_VALUES, GET_CONFIRMATION_VALUES } from '../actions/types';

import moment from 'moment';

export default function(state = 
  {asOf: moment().add(6,'months').format('DD/MM/YYYY'),
   fromDate: moment().format('DD/MM/YYYY'), 
   toDate: moment().add(12,'months').format('DD/MM/YYYY'), 
   includeRequests: false,
   createdByMe: true,
   onlyPending: false,
   hotelAddressbook_id: -1}, action) {

  switch (action.type) {

    case GET_CONFIRMATION_VALUES:
      return state;

    case SET_CONFIRMATION_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
