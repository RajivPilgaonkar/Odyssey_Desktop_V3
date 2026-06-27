import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import PrestoList from './PrestoList';
/*import Footer from '../../../common/Footer';*/

import { setWebPage } from '../../../../actions';
import { WEBPAGE_PRESTO_LIST } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function PrestoListPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PRESTO_LIST));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PrestoList dataType={1}/>
      {/*<Footer/>*/}
    </>
  );

};

export default PrestoListPage;

