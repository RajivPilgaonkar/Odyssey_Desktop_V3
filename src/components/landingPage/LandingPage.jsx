import React from 'react';
import { useDispatch } from 'react-redux';

import HeaderBar from '../common/HeaderBar';
import Landing from './Landing';
import Footer from '../common/Footer';

import { setWebPage } from '../../actions';
import { WEBPAGE_LANDING } from '../../actions/types';

function LandingPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_LANDING));

  return (
    <>
      <HeaderBar />
      <Landing/>
      <Footer/>
    </>
  );

};

export default LandingPage;

