import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import Consultants from './Consultants';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_CONSULTANTS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function ConsultantsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CONSULTANTS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <Consultants/>
      <Footer/>
    </>
  );

};

export default ConsultantsPage;
