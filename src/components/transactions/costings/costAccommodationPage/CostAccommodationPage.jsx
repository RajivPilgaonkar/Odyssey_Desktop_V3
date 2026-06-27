import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import CostAccommodation from './CostAccommodation';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_COST_ACCOMMODATION } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CostAccommodationPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_COST_ACCOMMODATION));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CostAccommodation/>
    </>
  );

};

export default CostAccommodationPage;


