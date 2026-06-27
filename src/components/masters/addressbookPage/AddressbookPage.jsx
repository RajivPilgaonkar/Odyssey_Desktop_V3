import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import Addressbook from './Addressbook';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_ADDRESSBOOK } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function AddressbookPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ADDRESSBOOK));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <Addressbook/>
      <Footer/>
    </>
  );

};

export default AddressbookPage;
