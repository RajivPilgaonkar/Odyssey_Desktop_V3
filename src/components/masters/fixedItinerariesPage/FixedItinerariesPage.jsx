import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import FixedItineraries from './FixedItineraries';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_FIXED_ITINERARIES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function FixedItinerariesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_FIXED_ITINERARIES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <FixedItineraries/>
      <Footer/>
    </>
  );

};

export default FixedItinerariesPage;
