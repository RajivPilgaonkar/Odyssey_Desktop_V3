/*================================================================*/
/*=== Keep track of the webpage index in the store ===============*/
/*=== This way components can be manipulated based on the page ===*/
/*================================================================*/

import { SET_PRESTO_VALUES, GET_PRESTO_VALUES } from '../actions/types';
import { convert_DbDate_To_DMY, getFirstOfMonth, getLastOfMonth} from "../components/common/CommonTransactionFunctions";

let nowDate = new Date(); 
const startDate = getFirstOfMonth(nowDate,1);
const endDate = getLastOfMonth(nowDate,1);

const fromDate = convert_DbDate_To_DMY(startDate,1);
const toDate = convert_DbDate_To_DMY(endDate,1);

export default function(state = 
  {fromDate: fromDate, toDate: toDate, trial: 0, states_id: -1, 
   tourCode: '', tourDate: '01/10/2022', pax: '', allData: false,
   createdByMe: false, quotations_id: -1,
   riksjaFromDate: fromDate, riksjaToDate: toDate, riksjaQuotations_id: -1,
   searchMode: false}, action) {

  switch (action.type) {

    case GET_PRESTO_VALUES:
      return state;

    case SET_PRESTO_VALUES:
      return {...state, ...action.payload};

    default:
      return state;
  }

}
