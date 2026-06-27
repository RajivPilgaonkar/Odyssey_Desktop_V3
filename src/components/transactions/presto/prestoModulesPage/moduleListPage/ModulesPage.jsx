import React, {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../../../common/HeaderBar';
import Modules from './Modules';

import { setWebPage } from '../../../../../actions';
import { WEBPAGE_MODULE_LIST } from '../../../../../actions/types';
import { getBackRoute } from "../../../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function ModulesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setWebPage(WEBPAGE_MODULE_LIST));
  }, [dispatch]); // Run once when component mounts

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <Modules/>
    </>
  );

};

export default ModulesPage;


