import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import TrainElementSectors from './TrainElementSectors';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_TRAIN_ELEMENTSECTORS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function TrainElementSectorsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_TRAIN_ELEMENTSECTORS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <TrainElementSectors/>
      <Footer/>
    </>
  );

};

export default TrainElementSectorsPage;
