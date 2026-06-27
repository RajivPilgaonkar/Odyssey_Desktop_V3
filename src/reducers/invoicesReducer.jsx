/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_INVOICE_VALUES, GET_INVOICE_VALUES } from '../actions/types';

let nowDate = new Date(); 
let currentYear = nowDate.getFullYear();
let currentMonth = nowDate.getMonth()+1;

let currentMonthStr = currentMonth.toString();
currentMonthStr = (currentMonthStr.length < 2) ? '0' + currentMonthStr : currentMonthStr;

const fromDate = '01/' + currentMonthStr + '/' + currentYear.toString();
const toDate = '02/' + currentMonthStr + '/' +  currentYear.toString();

export default function(state = 
  {invoices_id: -1, active: false, fromDate: fromDate, toDate: toDate, periodCurrencies: [], 
   numFutureInvoices: 0, companies_id: 4, divisions_id: 1}, action) {

  switch (action.type) {

    case GET_INVOICE_VALUES:
      return state;

    case SET_INVOICE_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
