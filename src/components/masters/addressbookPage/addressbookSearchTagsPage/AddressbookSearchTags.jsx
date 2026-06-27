import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import { getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import List from 'devextreme-react/list';
import {Button} from 'devextreme-react/button';
import { CheckBox } from 'devextreme-react/check-box';

import '../../../common/MasterGrid.css'
import './AddressbookSearchTags.css'

let compVar = {};

function AddressbookSearchTags(props) {

  const [dataFetched, setDataFetched] = useState(false);  
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
      mainData: [],
      addressbook_id: props.addressbook_id,
      categories_id: props.categories_id,
      errorMsg: '', editMode: false, renderToggle: false,
      activeItemIndex: 0, buttonRowHeight: 50,
      subCategoriesIds: '',
      admLevel: 1
    }   
        
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);

  //**********************************************************/
  // This should execute only when the errorMsg changes
  // Ensure that 2nd argument is [errorMsg]
  // After 5 sec, the error message is auto-closed
  useEffect (() => {
    if (compVar.errorMsg > '') {
      setTimeout(() => {
        compVar.errorMsg = '';
        forceRender();
      }, 5000)
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.errorMsg]);

  //**********************************************************/
  const filterData = async() => {
    try {
      setDataFetched(false);
    
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      const query = "SELECT SearchTags_id, SearchTag, " +
        "(SELECT COUNT(*) FROM AddressbookSearchTags ast1 " +
        "WHERE ast1.SearchTags_id = st1.SearchTags_id " +
        "AND ast1.Addressbook_id = " + props.addressbook_id.toString() + ") AS xCount " +
        "FROM SearchTags st1";
        
      compVar.mainData = await dbGetRecordRaw({query: query, x_uid: props.users_id, x_module: 'Addressbook Search Tags'});

      compVar.mainData = compVar.mainData.map(rec => {return {...rec, Selected: (rec.xCount > 0)}});
        
    } catch(err) {
      alert(err);
    }
  
    setDataFetched(true);
  }
  
  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const buttonJsx = (stylingMode, caption, buttonType, onClick, disabled) => {
    return (
      <Button
        stylingMode={stylingMode} text={caption} type={buttonType} onClick={onClick} disabled={disabled}
      />
    )
  }

  //**********************************************************/
  const saveData = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    let spData = {sql: ''};

    // Add and delete the in the Db, based on the selection
    for (const rec of compVar.mainData) {      
      const value = rec.Selected ? 1 : 0;
      spData = {sql: `EXEC p_UpdateAddrSearchTags ${props.addressbook_id.toString()}, ${rec.SearchTags_id.toString()}, ${value.toString()}, ${_g_users_id.toString()} `, x_uid: _g_users_id, x_module: 'Addressbook Search Tags'};
      try {
        await dbExecuteSp(spData);  
      } catch (err) {
        alert(err);
      }
    }

  }

  //**********************************************************/
  const onHandleCancel = async () => {
    compVar.editMode = false;
    await filterData();

  }

  //**********************************************************/
  const onHandleSave = async () => {
    compVar.editMode = false;
    await saveData();
    await filterData();

    // Flag as Addressbook Modified
    if (props.onAddrDetailsModified !== undefined) {
      props.onAddrDetailsModified(true);
    }

    forceRender();
  }

  //**********************************************************/
  const onHandleEdit = () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    compVar.editMode = true;

    forceRender();
  }

  //**********************************************************/
  const onItemClick = (e) => {
    if (compVar.editMode) {
      compVar.activeItemIndex = e.itemIndex;
      compVar.mainData[compVar.activeItemIndex].Selected = !compVar.mainData[compVar.activeItemIndex].Selected;
      forceRender();  
    }
  }

  //**********************************************************/
  const listItem = (e) => {
    return (
      <div className="list-parent-container">
        {compVar.editMode &&
          <div className="list-checkbox-container">
            <CheckBox
              value={e.Selected}
              style={{height: '100%', justifyContent: 'flex-end' }}
            />
          </div>
        }
        <div className="list-label-container">
          {e.SearchTag}
        </div>
      </div>
    )
  }

  //**********************************************************/
  const buttonRow = () => {    

    const disabled = (props.editMode) ? true : false;

    return (
      <div className="button-group-container" style={{height: compVar.buttonRowHeight}}>
        {compVar.editMode && 
          <div className="button-container" style={{justifyContent: 'flex-end', paddingRight: 10}}>
            {buttonJsx("outlined","Cancel","danger",onHandleCancel,disabled)}
          </div>
        }
        {compVar.editMode && 
          <div className="button-container" style={{justifyContent: 'flex-start', paddingLeft: 10}}>
            {buttonJsx("outlined","Save","success",onHandleSave,disabled)}
          </div>
        }
        {!compVar.editMode && 
          <div className="button-container">
            {buttonJsx("contained","Edit Search Tags","default",onHandleEdit,disabled)}
          </div>
        }
      </div>
    )
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    let containerHeight = heights.containerHeight;
    // Reduce by height of params container
    containerHeight = containerHeight - 35;

    // Show spinner if data not yet fetched
    if (!dataFetched) {
      return (
        <>
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        </>
      )
    }

    const data = (compVar.editMode) ? [...compVar.mainData] : [...compVar.mainData.filter(rec => rec.Selected === true)];
    const selectByClick = (compVar.editMode) ? true : false;

    const listHeight = containerHeight - compVar.buttonRowHeight;

    return (
      <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>
        {buttonRow()}
        <List
          dataSource={data}    
          keyExpr="SearchTags_id"
          displayExpr="SearchTag"
          focusStateEnabled={false}
          selectByClick={selectByClick}
          itemRender={listItem}
          onItemClick={onItemClick}
          height={listHeight}
          width={200}
        >
        </List>
      </div>
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default AddressbookSearchTags;
