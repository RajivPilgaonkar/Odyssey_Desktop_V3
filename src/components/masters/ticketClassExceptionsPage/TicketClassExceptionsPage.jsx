import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import TicketClassExceptions from './TicketClassExceptions';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_TICKET_CLASS_EXCEPTIONS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function TicketClassExceptionsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_TICKET_CLASS_EXCEPTIONS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <TicketClassExceptions/>
      <Footer/>
    </>
  );

};

export default TicketClassExceptionsPage;
