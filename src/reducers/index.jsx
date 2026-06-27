import { combineReducers } from 'redux';
import companyReducer from './companyReducer';
import webPageReducer from './webPageReducer';
import dashboardMenuReducer from './dashboardMenuReducer';
import paramsReducer from './paramsReducer';
import invoicesReducer from './invoicesReducer';
import vouchersReducer from './vouchersReducer';
import elementsReducer from './elementsReducer';
import routeFinderReducer from './routeFinderReducer';
import modulesReducer from './modulesReducer';
import prestoReducer from './prestoReducer';
import confirmationReducer from './confirmationReducer';

import dbUserReducer from './dbUserReducer';
import dbCurrenciesReducer from './dbCurrenciesReducer';
import dbCountriesReducer from './dbCountriesReducer';

import dbInitValuesReducer from './dbInitValuesReducer';

export default combineReducers({
  company: companyReducer,
  webPage: webPageReducer,
  dbUser: dbUserReducer,
  dbCurrencies: dbCurrenciesReducer,
  dbCountries: dbCountriesReducer,
  dashboardMenu: dashboardMenuReducer,
  dbInitValues: dbInitValuesReducer,
  params: paramsReducer,
  invoiceParams: invoicesReducer,
  voucherParams: vouchersReducer,
  elementParams: elementsReducer,
  routeFinderParams: routeFinderReducer,
  moduleParams: modulesReducer,
  prestoParams: prestoReducer,
  confirmationParams: confirmationReducer
});
