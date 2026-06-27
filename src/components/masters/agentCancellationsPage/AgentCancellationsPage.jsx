import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import AgentCancellations from './AgentCancellations';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_AGENT_CANCELLATION } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function AgentCancellationsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_AGENT_CANCELLATION));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <AgentCancellations/>
      <Footer/>
    </>
  );

};

export default AgentCancellationsPage;
