/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_ELEMENT_VALUES, GET_ELEMENT_VALUES } from '../actions/types';

export default function(state = 
  {wef: '01/10/2022', types_id: 1, states_id: -1, 
   cities_id: -1, elemAccommodation_id: -1 ,
   elementType: -1, elementLabel: '', elementSp: ''}, action) {

  switch (action.type) {

    case GET_ELEMENT_VALUES:
      return state;

    case SET_ELEMENT_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
