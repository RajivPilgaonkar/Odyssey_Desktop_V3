import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../actions';
import { getFieldsArray } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, tableHeaderArray } from "./GetShortestRouteData";
import { canDelete } from "../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import {getDefaultDataObject, setFocusedRow, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getBusinessCities} from "../../common/GetOrgListing";
import PopupDialogBox from '../../common/PopupDialogBox';
import DropDownGrid from "../../common/DropDownGrid";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";

import '../../common/MasterGrid.css'

let compVar = {};

function ShortestRoute() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

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
      userLookup: [],  mainData: [],
      cityLookup: [],
      fromCities_id: -1, fromCity: '', toCities_id: -1, toCity: '',  
      tableName: 'Map', keyField: 'RowID',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Shortest Route', title: 'New Route',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 430,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [       
      ]
    }   
        
    fetchInitialData();
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
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

      compVar.cityLookup = await getBusinessCities();   
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    let whereStr = (compVar.fromCities_id < 0 || compVar.toCities_id < 0) ? 'RowID = -999' : '(1=1)';

    // If cities are selected, compute the shortest route and display it
    if (compVar.fromCities_id > 0 && compVar.toCities_id > 0) {
      const spData = {sql: `EXEC p_QuoShortestRoute '${compVar.fromCity}', '${compVar.toCity}' `, x_uid: _g_users_id, x_module: 'Shortest Route'};
      try {
        await dbExecuteSp(spData);  
      } catch (err) {
        alert(err);
      }
  
    }

    try {
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['RowID'], table: 'Map', where: whereStr});   
    } catch(err) {
      alert(err);
    }

    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {
  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
    ]);    

    error.errorMsg = 'Cannot Delete';      

    if (error.errorMsg === '') {
      compVar.dialogMessage1 = 'Are you sure you want to delete this record?';
      compVar.popupDialogIndex = 0;
      setPopupDialogBoxVisible(true);
    } else {
      compVar.errorMsg = error.errorMsg;      
      forceRender();
    }

  }

  //**********************************************************/
  const customizeText = (cellInfo) => {
    if (!cellInfo.value) 
      return ''
    else
      return String(cellInfo.valueText);
  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const onFocusedRowChanged = (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data[compVar.keyField];

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;
        forceRender();
      }

    }

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
    }

  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = false;

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #b5b5b5'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createModeParams = () => {

    return (
      <>
        <DropDownGrid
          listArray={compVar.cityLookup}
          fieldList={['city']}
          valueExpr="cities_id"
          displayExpr="city"
          label="From"
          placeholder="Select a city..."
          getSelectedRecord={onFromCitySelect}
          showColumnHeaders={false}
          value={compVar.fromCities_id}
          labelStyle={{width: 50}}
          dropDownStyle={{width: 60}}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
        <DropDownGrid
          listArray={compVar.cityLookup}
          fieldList={['city']}
          valueExpr="cities_id"
          displayExpr="city"
          label="To"
          placeholder="Select a city..."
          getSelectedRecord={onToCitySelect}
          showColumnHeaders={false}
          value={compVar.toCities_id}
          labelStyle={{width: 30}}
          dropDownStyle={{width: 60}}
        />

      </>
  
    );

  }

  //**********************************************************/
  const getPopupSelectedOption = async (e) => {

    const recObj = {table: compVar.tableName, keyField: compVar.keyField, keyValue: compVar.focusedRowKey}
    setPopupDialogBoxVisible(() => {return false});

    if (e===1) {
      const idx = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey);
      compVar.focusedRowKey = (idx > 0) ? compVar.mainData[idx-1][compVar.keyField] : null;  
      await dbDeleteRecord(recObj);
      await filterData();
    }
  }
    
  //*********************************************************/
  const onFromCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.fromCities_id = e[0].cities_id;
      compVar.fromCity = e[0].city;  
      await filterData();
    }
  }

  //*********************************************************/
  const onToCitySelect = async(e) => {
    if (e.length > 0) {
      compVar.toCities_id = e[0].cities_id;
      compVar.toCity = e[0].city;  
      await filterData();
    }
  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const dataObj = createDataObject(viewHeight);
    const elementProps = createElementProps();
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT, borderBottom: '1px solid rgba(0, 0, 0, 0.2)'}}>
            <div className="master-grid-params-container"></div>
            <div style={{flex: 1}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container">
              {createModeParams()}
            </div>
          </div>        

          <div className="master-grid-content-box">
            {getDevExtremeTable(dataObj, true)}
          </div>

          {popupDialogBoxVisible && 
            <PopupDialogBox
              open={true}
              message1={compVar.dialogMessage1}
              message2={compVar.dialogMessage2}
              getSelectedOption={compVar.popupSelectedOptions[compVar.popupDialogIndex]}
            >
            </PopupDialogBox>
          }

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

export default ShortestRoute;
