import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import AddressbookRankings from './AddressbookRankings';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_ADDRESSBOOK_RANKINGS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function AddressbookRankingsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ADDRESSBOOK_RANKINGS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <AddressbookRankings/>
      <Footer/>
    </>
  );

};

export default AddressbookRankingsPage;
