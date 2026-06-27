import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import Sightseeing from './Sightseeing';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_SIGHTSEEING } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function SightseeingPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_SIGHTSEEING));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <Sightseeing/>
      <Footer/>
    </>
  );

};

export default SightseeingPage;
