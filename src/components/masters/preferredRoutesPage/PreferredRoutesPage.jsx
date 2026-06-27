import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import PreferredRoutes from './PreferredRoutes';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_PREFERRED_ROUTES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PreferredRoutesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PREFERRED_ROUTES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PreferredRoutes/>
      <Footer/>
    </>
  );

};

export default PreferredRoutesPage;
