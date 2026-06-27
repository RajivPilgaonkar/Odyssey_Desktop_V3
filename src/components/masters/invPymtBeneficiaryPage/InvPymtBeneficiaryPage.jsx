import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import InvPymtBeneficiary from './InvPymtBeneficiary';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_INV_PYMT_BEN } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function InvPymtBeneficiaryPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_INV_PYMT_BEN));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <InvPymtBeneficiary/>
      <Footer/>
    </>
  );

};

export default InvPymtBeneficiaryPage;
