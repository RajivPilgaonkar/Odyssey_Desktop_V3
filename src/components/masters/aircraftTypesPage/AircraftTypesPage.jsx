import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import AircraftTypes from './AircraftTypes';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_AIRCRAFT_TYPES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function AircraftTypesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_AIRCRAFT_TYPES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <AircraftTypes/>
      <Footer/>
    </>
  );

};

export default AircraftTypesPage;
