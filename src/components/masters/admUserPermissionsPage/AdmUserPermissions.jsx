import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { dbGetRecord, dbExecuteSp } from '../../../actions';
import { getFieldsArray } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, tableHeaderArray } from "./GetAdmUserPermissionsData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { Button } from 'devextreme-react/button';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, getViewContainerHeights} from "../../common/MasterGridHelpers";
import { formHelp } from './Help';
import AdmUserListing from './AdmUserListing';

import '../../common/MasterGrid.css'

let compVar = {};

function AdmUserPermissions(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      admLevelLoookup: [],      
      tableName: 'AdmUserPermissions', keyField: 'AdmUserPermissions_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Permissions for ' + props.userName, title: 'New Permission',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [],
      displayGridFilterRow: true,
      toastIsVisible: false, toastMessage: '',
      displayCopyUserList: false,
      admLevel: props.admLevel,
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

    compVar.admLevelLoookup = await dbGetRecord({fields: ['AdmLevels_id', 'AdmLevel'], orders: ['AdmLevels_id'], table: 'AdmLevels'});   

    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray = fieldArray.map((rec) => `aup.${rec}`);
    fieldArray.push ('amm.AdmMenuModule');
    fieldArray.push ('amm.AdmMenuModuleNo');
    fieldArray.push ('amt.AdmModuleType');
    fieldArray.push ('a.AdmLevel');

    try {
      const tableStr = "AdmUserPermissions aup " +
        "LEFT JOIN AdmMenuModules amm ON aup.AdmMenuModules_id = amm.AdmMenuModules_id " +
        "LEFT JOIN AdmModuleTypes amt ON amm.AdmModuleTypes_id = amt.AdmModuleTypes_id " +
        "LEFT JOIN AdmLevels a ON aup.AdmLevels_id = a.AdmLevels_id ";
      const whereStr = "aup.AdmUsers_id = " + props.admUsers_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['amm.AdmMenuModuleNo'], table: tableStr, where: whereStr});   

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
  }

  //**********************************************************/
  const saveFormData = async () => {
  }

  //**********************************************************/
  const toggleEditPopup = () => {
    setEditPopupVisible(() => {return !editPopupVisible});
  }; 
  
  //**********************************************************/
  const closePopup = async () => {
    toggleEditPopup();
    compVar.errorMsg = '';

    if (compVar.isEdited) {
      await filterData();
    }
  };  
  
  //**********************************************************/
  const toggleHelp = () => {
    setHelpVisible(() => {return !helpVisible});
  }; 
  
  //**********************************************************/
  const toggleHint = () => {
    setHintVisible(() => {return !hintVisible});
  }; 
  
  //**********************************************************/
  const onToastHiding = () => {
    compVar.toastIsVisible = false;
    forceRender();
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
  const onFormFieldDataChanged = () => {
    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const onContextMenuPreparing = (e) => {

    if (compVar.admLevel < 3) {
      return;
    }

    if (e.target === 'content') {
      if (!e.items) e.items = []; 

      for (const rec of compVar.admLevelLoookup) {
        e.items.push({
          text: rec.AdmLevel,
          onItemClick: () => {
            setPermission(rec.AdmLevels_id, e.row.data.AdmMenuModules_id);
          }
        });        
      }        

    }

  }

  //**********************************************************/
  const setPermission = async (admLevels_id, admMenuModules_id) => {
    const spData = {sql: `UPDATE AdmUserPermissions SET AdmLevels_id = ${admLevels_id} 
                           WHERE AdmUsers_id = ${props.admUsers_id} 
                           AND AdmMenuModules_id = ${admMenuModules_id}`, x_uid: _g_users_id, x_module: 'User Permissions'};
    try {
      await dbExecuteSp(spData);  
    } catch(err) {
      alert(err);
    }
    await filterData();
    forceRender();
  }

  //**********************************************************/
  const copyPermissions = () => {
    if (compVar.admLevel > 2) {
      compVar.displayCopyUserList = true;
      forceRender();  
    }
  }

  //**********************************************************/
  const getSelectedUser = async (e) => {
    const spData = {sql: `EXEC p_CopyPermissions ${e.admUsers_id}, ${props.admUsers_id}`, x_uid: _g_users_id, x_module: 'User Permissions'}  
    try {
      await dbExecuteSp(spData);  
    } catch (err) {
      alert(err);
    }
    compVar.displayCopyUserList = false;
    await filterData();
    forceRender();
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
      onContextMenuPreparing: onContextMenuPreparing, /*=== Right click menu ===*/
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      formHelp: formHelp,
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: [],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: true, options: {icon: "icons/copy.png", onClick: copyPermissions, hint: 'Copy permissions from another user'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

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
    const formObj = createFormObject();
    const elementProps = createElementProps();
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container master-detail-top-panel-button-container" style={{flex: 1}}>
              <Button
                width={35}
                height={35}
                type="normal"
                stylingMode="outlined"
                icon={"chevronleft"}
                onClick={props.onHidePermissions}
              />
            </div>
            <div className="master-grid-params-container" style={{flex: 1, fontSize: 18}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>
            <div className="master-grid-params-container" style={{flex: 1}}>
              (Right click on a row to set permissions)
            </div>
          </div>        

          <div className="master-grid-content-box">
            {(compVar.errorMsg > '') &&
              popupTitle(formObj, popupTitleContainerStyle)
            }

            {getDevExtremeTable(dataObj, true)}
          </div>

          {compVar.displayCopyUserList &&
            <AdmUserListing
              getSelectedUser={getSelectedUser}
            />
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

export default AdmUserPermissions;
