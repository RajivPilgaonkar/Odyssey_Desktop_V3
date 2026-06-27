import React, { useState, useEffect } from 'react';
import {getViewContainerHeights} from "../../common/MasterGridHelpers";
import Categories from "./categoriesPage/Categories";
import SubCategories from "./subCategoriesPage/SubCategories";
import AddressbookServices from "./addressbookServicesPage/AddressbookServices";

import '../../common/MasterGrid.css'

let compVar = {};

function AddressbookCategories() {

  const [categoriesId, setCategoriesId] = useState(-1);  
  const [subCategoriesId, setSubCategoriesId] = useState(-1);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      errorMsg: '', 
    }   
        
    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
  
  //**********************************************************/
  const onCategoryChange = (e) => {
    setCategoriesId(e.contactCategories_id);
  }

  //**********************************************************/
  const onSubCategoryChange = (e) => {
    setSubCategoriesId(e.contactSubCategories_id);
  }  
  
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'center'}}>
            <div style={{width: 400, display: 'flex'}}>
              <Categories
                onCategoryChange={onCategoryChange}
              />
            </div>
            <div style={{width: 400, display: 'flex'}}>
              <SubCategories
                contactCategories_id={categoriesId}
                onSubCategoryChange={onSubCategoryChange}
              />
            </div>
            <div style={{width: 400, display: 'flex'}}>
              <AddressbookServices
                contactSubCategories_id={subCategoriesId}
              />
            </div>
          </div>

        </div>

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default AddressbookCategories;
