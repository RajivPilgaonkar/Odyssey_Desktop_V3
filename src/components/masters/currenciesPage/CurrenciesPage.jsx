import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import Currencies from './Currencies';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_CURRENCIES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CurrenciesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CURRENCIES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <Currencies/>
      <Footer/>
    </>
  );

};

export default CurrenciesPage;
