import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import TransferCityPairs from './TransferCityPairs';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_TRANSFER_CITY_PAIRS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function TransferCityPairsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_TRANSFER_CITY_PAIRS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <TransferCityPairs/>
      <Footer/>
    </>
  );

};

export default TransferCityPairsPage;
