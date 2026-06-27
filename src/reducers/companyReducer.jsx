import { FETCH_COMPANY_DATA } from '../actions/types';

const company_data = {
  company: 'Odyssey Tours & Travels',
  address: '286, Boa Viagem Road, Calangute, Goa 403002',
  email: 'admin@odyssey.com',
  phone: '(91) 832-2277720'
};

export default function(state = company_data, action) {
  switch (action.type) {
    case FETCH_COMPANY_DATA:
      return state;
    default:
      return state;
  }

}
