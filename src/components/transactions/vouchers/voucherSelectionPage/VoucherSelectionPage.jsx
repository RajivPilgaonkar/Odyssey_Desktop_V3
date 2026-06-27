import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import VoucherSelection from './VoucherSelection';
//import Footer from '../../../common/Footer';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_VOUCHER_SELECTION } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function VoucherSelectionPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_VOUCHER_SELECTION));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <VoucherSelection/>
      {/*<Footer/>*/}
    </>
  );

};

export default VoucherSelectionPage;

