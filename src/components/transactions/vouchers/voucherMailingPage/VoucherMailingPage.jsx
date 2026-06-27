import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import VoucherMailing from './VoucherMailing';
//import Footer from '../../../common/Footer';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_MAIL_VOUCHERS } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function VoucherMailingPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_MAIL_VOUCHERS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <VoucherMailing/>
      {/*<Footer/>*/}
    </>
  );

};

export default VoucherMailingPage;

