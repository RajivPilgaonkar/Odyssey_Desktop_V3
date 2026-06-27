import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import VoucherMailStatus from './VoucherMailStatus';
//import Footer from '../../../common/Footer';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_VOUCHER_MAIL_STATUS } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function VoucherMailStatusPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_VOUCHER_MAIL_STATUS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <VoucherMailStatus/>
      {/*<Footer/>*/}
    </>
  );

};

export default VoucherMailStatusPage;

