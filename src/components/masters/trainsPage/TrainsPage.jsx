import React from 'react';
import { useDispatch } from 'react-redux';

import HeaderBar from '../../common/HeaderBar';
import Trains from './Trains';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_TRAINS } from '../../../actions/types';
import { mainFormHelp } from './Help';

function TrainsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_TRAINS));

  return (
    <>
      <HeaderBar help={mainFormHelp}/>
      <Trains/>
      <Footer/>
    </>
  );

};

export default TrainsPage;
