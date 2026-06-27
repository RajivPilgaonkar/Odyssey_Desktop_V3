import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import CityGroups from './CityGroups';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_CITY_GROUPS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function CityGroupsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CITY_GROUPS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <CityGroups/>
      <Footer/>
    </>
  );

};

export default CityGroupsPage;
