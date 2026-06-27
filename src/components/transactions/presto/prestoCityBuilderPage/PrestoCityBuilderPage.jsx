import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import PrestoCityBuilder from './PrestoCityBuilder';
//import Footer from '../../../common/Footer';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_PRESTO_CITY_BUILDER } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PrestoCityBuilderPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PRESTO_CITY_BUILDER));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PrestoCityBuilder location={location}/>
      {/*<Footer/>*/}
    </>
  );

};

export default PrestoCityBuilderPage;

