import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import AdmUserPermissions from './AdmUserPermissions';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_ADM_USER_PERMISSIONS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function AdmUserPermissionsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ADM_USER_PERMISSIONS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <AdmUserPermissions/>
      <Footer/>
    </>
  );

};

export default AdmUserPermissionsPage;
