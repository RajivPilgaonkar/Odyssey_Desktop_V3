import React from 'react';
import { useDispatch } from 'react-redux';

import HeaderBar from '../../common/HeaderBar';
import AddressbookCategories from './AddressbookCategories';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_ADDRESSBOOK_CATEGORIES } from '../../../actions/types';
import { mainFormHelp } from './Help';

function AddressbookCategoriesPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_ADDRESSBOOK_CATEGORIES));

  return (
    <>
      <HeaderBar help={mainFormHelp}/>
      <AddressbookCategories/>
      <Footer/>
    </>
  );

};

export default AddressbookCategoriesPage;
