/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { GET_DASHBOARDMENUOPTIONS, SET_DASHBOARDMENUOPTIONS } from '../actions/types';

export default function(state = {mainMenu: 0, subMenu: 0}, action) {

  switch (action.type) {

    case GET_DASHBOARDMENUOPTIONS:
      return state;

    case SET_DASHBOARDMENUOPTIONS:
      return {mainMenu: action.payload.mainMenu, subMenu: action.payload.subMenu};

    default:
      return state;
  }

}
