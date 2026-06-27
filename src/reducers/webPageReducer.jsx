/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { GET_WEBPAGE, SET_WEBPAGE } from '../actions/types';

export default function(state = {webPages_id: 1}, action) {

  switch (action.type) {

    case GET_WEBPAGE:
      return state;

    case SET_WEBPAGE:
      return {webPages_id: action.payload};

    default:
      return state;
  }

}
