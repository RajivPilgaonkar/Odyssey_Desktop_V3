import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import CostReports from './CostReports';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_COST_ACCOMMODATION_REPORTS } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CostReportsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_COST_ACCOMMODATION_REPORTS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CostReports/>
    </>
  );

};

export default CostReportsPage;

