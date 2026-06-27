import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";

import HeaderBar from '../../common/HeaderBar';
import SearchTags from './SearchTags';
import Footer from '../../common/Footer';

import { setWebPage } from '../../../actions';
import { WEBPAGE_SEARCH_TAGS } from '../../../actions/types';
import { getBackRoute } from "../../common/CommonTransactionFunctions";
import { mainFormHelp } from './Help';

function SearchTagsPage() {

  // Set the WebPage number
  const dispatch = useDispatch();
  dispatch(setWebPage(WEBPAGE_SEARCH_TAGS));

  const location = useLocation();
  const backRoute = getBackRoute(location);

  return (
    <>
      <HeaderBar help={mainFormHelp} {...backRoute}/>
      <SearchTags/>
      <Footer/>
    </>
  );

};

export default SearchTagsPage;
