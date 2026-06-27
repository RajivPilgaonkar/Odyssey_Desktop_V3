import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import TaxRates from './TaxRates';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_ENTRY_TAXES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function TaxRatesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ENTRY_TAXES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <TaxRates/>
      <Footer/>
    </>
  );

};

export default TaxRatesPage;
