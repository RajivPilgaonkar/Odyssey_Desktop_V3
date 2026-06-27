/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_MODULE_VALUES, GET_MODULE_VALUES } from '../actions/types';

let nowDate = new Date(); 
let currentYear = nowDate.getFullYear();
let currentMonth = nowDate.getMonth()+1;

let currentMonthStr = currentMonth.toString();
currentMonthStr = (currentMonthStr.length < 2) ? '0' + currentMonthStr : currentMonthStr;

const fromDate = '01/' + currentMonthStr + '/' + currentYear.toString();
const toDate = '02/' + currentMonthStr + '/' +  currentYear.toString();


export default function(state = 
  {fromDate: fromDate, toDate: toDate, trial: 0, states_id: -1, 
   tourCode: '', tourDate: '01/10/2022', pax: '', 
   createdByMe: false}, action) {

  switch (action.type) {

    case GET_MODULE_VALUES:
      return state;

    case SET_MODULE_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
