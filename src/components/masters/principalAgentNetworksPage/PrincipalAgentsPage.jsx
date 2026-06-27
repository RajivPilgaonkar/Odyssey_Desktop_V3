import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import PrincipalAgents from './PrincipalAgents';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_PRINCIPAL_AGENTS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PrincipalAgentsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PRINCIPAL_AGENTS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PrincipalAgents/>
      <Footer/>
    </>
  );

};

export default PrincipalAgentsPage;
