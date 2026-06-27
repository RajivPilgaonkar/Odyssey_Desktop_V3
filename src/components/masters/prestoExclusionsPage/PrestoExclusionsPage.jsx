import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import PrestoExclusions from './PrestoExclusions';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_PRESTOEXCLUSIONS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PrestoExclusionsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PRESTOEXCLUSIONS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PrestoExclusions/>
      <Footer/>
    </>
  );

};

export default PrestoExclusionsPage;
