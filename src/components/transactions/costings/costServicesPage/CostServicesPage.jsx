import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import CostServices from './CostServices';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_COST_SERVICES } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CostServicesPage(props) {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_COST_SERVICES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CostServices transfer={props.transfer}/>
    </>
  );

};

export default CostServicesPage;


