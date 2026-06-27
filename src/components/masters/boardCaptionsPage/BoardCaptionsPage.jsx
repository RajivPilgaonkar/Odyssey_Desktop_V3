import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import BoardCaptions from './BoardCaptions';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_BOARD_CAPTIONS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function BoardCaptionsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_BOARD_CAPTIONS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <BoardCaptions/>
      <Footer/>
    </>
  );

};

export default BoardCaptionsPage;
