/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_VOUCHER_VALUES, GET_VOUCHER_VALUES } from '../actions/types';
import { convert_DbDate_To_DMY, getStartEndOfWeek} from "../components/common/CommonTransactionFunctions";

let nowDate = new Date(); 
const startEndDateObj = getStartEndOfWeek(nowDate);

const fromDate = convert_DbDate_To_DMY(startEndDateObj.startDate,1);
const toDate = convert_DbDate_To_DMY(startEndDateObj.endDate,1);

export default function(state = 
  {vouchers_id: -1, masters_id: -1, active: false, fromDate: fromDate, toDate: toDate, periodCurrencies: [], 
   tourCode: '', tourDate: '01/01/2000', countries_id: 200, issuedOn: '01/01/2000',
   issuedBy: '', tourRef: '', paxName: '', countries: [], createdByMe: false,
   fromDateRange: fromDate, toDateRange: toDate}, action) {

  switch (action.type) {

    case GET_VOUCHER_VALUES:
      return state;

    case SET_VOUCHER_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
