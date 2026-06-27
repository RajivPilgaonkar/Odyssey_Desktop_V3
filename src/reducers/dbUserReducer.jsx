/*================================================================*/
/*=== action.payload is returned as 'res' from the backend ... ===*/
/*=== ... this is returned as an object ... ======================*/
/*=== ... so this is converted into an array of objects ... ======*/
/*=== ... so that libraries like lodash can use it effectively ===*/
/*================================================================*/

import { DB_SET_USER_ID, DB_GET_USER_ID } from '../actions/types';

export default function(state = {users_id: -1, userName: '', superuser: false, accessToken: 'ABC', tokenExpiryDays: 1}, action) {

  switch (action.type) {

    case DB_GET_USER_ID:
      if (action.payload.length === 0) {
        return {...state, users_id: -1, userName: '', superuser: false, tokenExpiryDays: 1};
      } else {
        return {...state, users_id: action.payload[0].AdmUsers_id,
                userName: action.payload[0].uid, superuser: action.payload[0].SuperUser,
                tokenExpiryDays: action.payload[0].TokenExpiryDays
              };
      }

    case DB_SET_USER_ID:
      return {...state, ...action.payload};
  
    default:
      return state;
  
  }
    
}
