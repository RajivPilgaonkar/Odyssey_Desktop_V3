import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import RouteFinder from './RouteFinder';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_ROUTE_FINDER } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function RouteFinderPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ROUTE_FINDER));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <RouteFinder/>
    </>
  );

};

export default RouteFinderPage;


