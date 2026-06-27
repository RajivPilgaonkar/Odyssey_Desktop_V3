/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { GET_INITVALUES, SET_INITVALUES_PACKAGES, SET_INITVALUES_CITIES } from '../actions/types';

export default function(state = {packages_id: -1, cities_id: -1}, action) {
  switch (action.type) {

    case GET_INITVALUES:
      return state;

    case SET_INITVALUES_PACKAGES:
      return {...state, packages_id: action.payload};

    case SET_INITVALUES_CITIES:
      return {...state, cities_id: action.payload};
  
    default:
      return state;
  }

}
