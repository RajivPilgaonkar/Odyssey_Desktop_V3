import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import ShortestRoute from './ShortestRoute';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_SHORTEST_ROUTE } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function ShortestRoutePage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_SHORTEST_ROUTE));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <ShortestRoute/>
      <Footer/>
    </>
  );

};

export default ShortestRoutePage;
