import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import TrainDeadlines from './TrainDeadlines';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_TRAIN_DEADLINES } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function TrainDeadlinesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_TRAIN_DEADLINES));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <TrainDeadlines/>
      <Footer/>
    </>
  );

};

export default TrainDeadlinesPage;
