import React from 'react';
import { useDispatch } from 'react-redux';

import HeaderBar from '../../common/HeaderBar';
import Bookings from './Bookings';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_BOOKINGS } from '../../../actions/types';
import { mainFormHelp } from './Help';

function BookingsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_BOOKINGS));

  return (
    <>
      <HeaderBar help={mainFormHelp}/>
      <Bookings/>
      <Footer/>
    </>
  );

};

export default BookingsPage;
