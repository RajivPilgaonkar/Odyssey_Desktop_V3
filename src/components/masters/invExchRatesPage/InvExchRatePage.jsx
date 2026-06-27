import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import InvExchRate from './InvExchRate';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_INV_EXCH_RATES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function InvExchRatePage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_INV_EXCH_RATES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <InvExchRate/>
      <Footer/>
    </>
  );

};

export default InvExchRatePage;
