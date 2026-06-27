import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import CarCityGroups from './CarCityGroups';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_CAR_CITY_GROUPS } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CarCityGroupsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CAR_CITY_GROUPS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CarCityGroups/>
    </>
  );

};

export default CarCityGroupsPage;


