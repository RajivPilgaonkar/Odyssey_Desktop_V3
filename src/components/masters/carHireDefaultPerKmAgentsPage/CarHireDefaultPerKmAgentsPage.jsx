import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import CarHireDefaultPerKmAgents from './CarHireDefaultPerKmAgents';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_CAR_HIRE_DEFAULT_PERKM_AGENTS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CarHireDefaultPerKmAgentsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CAR_HIRE_DEFAULT_PERKM_AGENTS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CarHireDefaultPerKmAgents/>
      <Footer/>
    </>
  );

};

export default CarHireDefaultPerKmAgentsPage;
