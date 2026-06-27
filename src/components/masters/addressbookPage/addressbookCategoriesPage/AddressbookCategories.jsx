import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import AddrSubcategories from "./addrSubcategoriesPage/AddrSubcategories";
import AddrServices from "./addrServicesPage/AddrServices";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";

import '../../../common/MasterGrid.css'

let compVar = {};

function AddressbookCategories(props) {

  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      errorMsg: '', 
      admLevel: 1,
      subCategoriesIds: '',
      subcatEditMode: false,
      servicesEditMode: false
    }   
        
    fetchInitialData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);
  
  //**********************************************************/
  const fetchInitialData = async() => {
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);
    forceRender();
  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }


  //**********************************************************/
  const onSubcategoryChange = (e) => {
    compVar.subCategoriesIds = e.subCategoriesIds;

    // Flag as Addressbook Modified
    if (props.onAddrDetailsModified !== undefined) {
      props.onAddrDetailsModified(e.modified);
    }

    forceRender();
  }

  //**********************************************************/
  const onServicesChange = (e) => {

    // Flag as Addressbook Modified
    if (props.onAddrDetailsModified !== undefined) {
      props.onAddrDetailsModified(true);
    }

    forceRender();
  }

  //**********************************************************/
  const onSubCatEditModeChange = (e) => {
    compVar.subcatEditMode = e;
    forceRender();
  }

  //**********************************************************/
  const onServiceEditModeChange = (e) => {
    compVar.serviceEditMode = e;
    forceRender();
  }
  
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'row'}}>

          <div style={{display: 'flex', flex: 1, height: '100%'}}>              
            <AddrSubcategories
              categories_id={props.categories_id}
              addressbook_id={props.addressbook_id}
              onSubcategoryChange={onSubcategoryChange}
              onEditModeChange={onSubCatEditModeChange}
              editMode={compVar.serviceEditMode}
              admLevel={compVar.admLevel}
              users_id={_g_users_id}
            />
          </div>
          <div style={{display: 'flex', flex: 1, height: '100%'}}>
            {compVar.subCategoriesIds !== undefined &&
              <AddrServices
                subCategoriesIds={compVar.subCategoriesIds}
                addressbook_id={props.addressbook_id}
                onServicesChange={onServicesChange}
                onEditModeChange={onServiceEditModeChange}
                editMode={compVar.subcatEditMode}
                admLevel={compVar.admLevel}
                users_id={_g_users_id}
              />
            }
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
