import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../common/HeaderBar';
import PrestoList from '../prestoListPage/PrestoList';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_PRESTO_MODULE_LIST } from '../../../../actions/types';
import { getBackRoute } from "../../../common/CommonTransactionFunctions";
import { mainFormHelp } from '../prestoListPage/Help';

function PrestoModuleListPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_PRESTO_MODULE_LIST));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <PrestoList dataType={3}/>
    </>
  );

};

export default PrestoModuleListPage;


