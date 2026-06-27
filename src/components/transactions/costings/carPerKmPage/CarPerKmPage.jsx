import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import CarPerKm from './CarPerKm';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_CAR_PER_KM } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CarPerKmPage(props) {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CAR_PER_KM));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CarPerKm/>
    </>
  );

};

export default CarPerKmPage;


