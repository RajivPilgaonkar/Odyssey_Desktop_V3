import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import AdmUsers from './AdmUsers';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_ADM_USERS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function AdmUsersPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ADM_USERS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <AdmUsers/>
      <Footer/>
    </>
  );

};

export default AdmUsersPage;
