import React from 'react';
import { useDispatch } from 'react-redux';

import HeaderBar from '../common/HeaderBar';
import Dashboard from './Dashboard';

import { setWebPage } from '../../actions';
import { WEBPAGE_DASHBOARD } from '../../actions/types';

function DashboardPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_DASHBOARD));

  return (
    <>
      <HeaderBar />
      <Dashboard/>
    </>
  );

};

export default DashboardPage;


