import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import PlaceOfSupply from './PlaceOfSupply';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_PLACE_OF_SUPPLY } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PlaceOfSupplyPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PLACE_OF_SUPPLY));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PlaceOfSupply/>
      <Footer/>
    </>
  );

};

export default PlaceOfSupplyPage;
