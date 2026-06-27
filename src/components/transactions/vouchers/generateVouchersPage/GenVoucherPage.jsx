import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import GenVoucher from './GenVoucher';
/*import Footer from '../../../common/Footer';*/

import { setWebPage } from '../../../../actions';
import { WEBPAGE_GEN_VOUCHERS } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function GenVoucherPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_GEN_VOUCHERS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <GenVoucher/>
      {/*<Footer/>*/}
    </>
  );

};

export default GenVoucherPage;
