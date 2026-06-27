/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_ROUTEFINDER_VALUES, GET_ROUTEFINDER_VALUES } from '../actions/types';

export default function(state = 
  {wef: '01/10/2022', wefTime: '09:00', fromCities_id: -1, 
   toCities_id: -1, lockTime: false, displayAlternatives: false}, action) {

  switch (action.type) {

    case GET_ROUTEFINDER_VALUES:
      return state;

    case SET_ROUTEFINDER_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
