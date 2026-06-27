/*================================================================*/
/*=== action.payload is returned as 'res' from the backend ... ===*/
/*=== ... this is returned as an object ... ======================*/
/*=== ... so this is converted into an array of objects ... ======*/
/*=== ... so that libraries like lodash can use it effectively ===*/
/*================================================================*/

import { DB_GET_COUNTRIES } from '../actions/types';

export default function(state = {countries: []}, action) {

  switch (action.type) {

    case DB_GET_COUNTRIES:
      return {countries: action.payload};

      default:
        return state;
  
    }
    
}
