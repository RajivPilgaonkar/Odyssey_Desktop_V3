import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import PrestoConfirmationManager from './PrestoConfirmationManager';
/*import Footer from '../../../common/Footer';*/

import { setWebPage } from '../../../../actions';
import { WEBPAGE_PRESTO_CONFIRMATION } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PrestoConfirmationManagerPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PRESTO_CONFIRMATION));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PrestoConfirmationManager/>
      {/*<Footer/>*/}
    </>
  );

};

export default PrestoConfirmationManagerPage;
