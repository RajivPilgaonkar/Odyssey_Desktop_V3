import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import ChangePassword from './ChangePassword';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_CHANGE_PWD } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function ChangePasswordPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_CHANGE_PWD));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <ChangePassword/>
      <Footer/>
    </>
  );

};

export default ChangePasswordPage;
