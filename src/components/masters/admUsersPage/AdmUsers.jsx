import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../actions';
import { beforeInsert, saveEditedInsertedData, checkNullErrors, getFieldsArray, escapeSingleQuotes } from "../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetAdmUserData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Switch from "react-switch";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../config/paths';
import ToolbarOptions from "../../common/ToolbarOptions";
import { popupTitle } from "../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, afterAdd, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation, getLastFinancialYear} from "../../common/GetDescFromIds";
import { formHelp } from './Help';
import PopupDialogBox from '../../common/PopupDialogBox';

import '../../common/MasterGrid.css'
import AdmUserPermissions from '../admUserPermissionsPage/AdmUserPermissions';

let compVar = {};

function AdmUsers() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [activeUsers, setActiveUsers] = useState(true);
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
      tableName: 'AdmUsers', keyField: 'AdmUsers_id',
      masterDescField: 'Uid',      
      displayPermissions: false, activeUsers_id: -1, activeUserName: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Users', title: 'New User',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, resetPasswordProc],
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
  // This should execute only when the active flag changes
  useEffect (() => {

    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [activeUsers]);

  //**********************************************************/
  const fetchInitialData = async() => {
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const activeStr = activeUsers ? 'Active = 1' : '(1=1)';

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      const whereStr = activeStr; 
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['Uid'], table: 'AdmUsers', where: whereStr});   
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);
    toggleEditPopup();    

  }

  //**********************************************************/
  const addRow = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    const financialYearObj = await getLastFinancialYear();
    const financialYears_id = financialYearObj.financialYears_id;

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      DefaultFinancialYears_id: financialYears_id
    }

    afterAdd(compVar, defaultObj);

    toggleEditPopup();    

  }

  //**********************************************************/
  const deleteRow = async (e) => {
    
    alert('Cannot delete users');

    return;

  }

  //**********************************************************/
  const saveFormData = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    // Only while adding, make pwd same as uid
    if (compVar.formMode === 1) {
      compVar.formData.Pwd = compVar.formData.Uid;
    }

    // Remove any previous error messages
    compVar.errorMsg = '';

    // check for null & data errors in form
    let errorMsg = await checkFormErrors(compVar.formData);
    if (errorMsg > '') {
      compVar.errorMsg = errorMsg;
      forceRender();
      return;      
    }
    
    let tmpFormData = {...compVar.formData};

    let condition = "WHERE " + compVar.masterDescField + " = '" + escapeSingleQuotes(compVar.formData[compVar.masterDescField]) + "' ";
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
      },
      afterPost: afterPost
    }
    
    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, compVar.formOldData, obj);
    if (saveData.errorMsg > '') {
      compVar.errorMsg = saveData.errorMsg;
      forceRender();
      return;      
    }        

    // reset focused row
    compVar.focusedRowKey = saveData.formData[compVar.keyField];

    // refresh data after save
    await filterData();

    compVar.formData = {...saveData.formData}; 
    compVar.formOldData = {...saveData.formData};
  
  }

  //**********************************************************/
  const checkFormErrors = async (formData) => {

    // required data errors
    const checkNullError = await checkNullErrors(tableHeaderArray, formData);
    if (checkNullError.errorNo === -1) {
      return checkNullError.errorDesc;
    }

    // Check other errors here like is amount < 0, is date less than today ....
        
    return '';

  }

  //**********************************************************/
  const afterPost = async() => {

    if ((compVar.formMode === 1) || (compVar.formMode === 2)) {
      await closePopup();
    }
       
    // refresh data
    await filterData();

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
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (!e.data.Active) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Inactive User';
      } 
    }
  }

  //**********************************************************/
  const onActiveSwitchChange = (e) => {
    setActiveUsers(e);
  }

  //**********************************************************/
  const modifyPermissions = async () => {
    const idx = compVar.mainData.findIndex(rec => rec.AdmUsers_id === compVar.focusedRowKey);
    if (idx > -1) {
      compVar.activeUsers_id = compVar.focusedRowKey;
      compVar.activeUserName = compVar.mainData[idx].UserName;
      compVar.displayPermissions = true;
      
      const spData = {sql: `EXEC p_AdmAddUserModules ${compVar.activeUsers_id}`, x_uid: _g_users_id, x_module: 'Users'};
      try {
        await dbExecuteSp(spData);  
      } catch (err) {
        alert(err);
      }
  

    }
    forceRender();
  }

  //**********************************************************/
  const resetPassword = async () => {
    const idx = compVar.mainData.findIndex(rec => rec.AdmUsers_id === compVar.focusedRowKey);
    if (idx > -1) {
      compVar.popupDialogIndex = 1;
      compVar.dialogMessage1 = `Are you sure you want to reset the password for 
        ${compVar.mainData[idx].UserName}`
      setPopupDialogBoxVisible(() => {return true});
    }
  }

  //**********************************************************/
  const resetPasswordProc = async (e) => {

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {
      const idx = compVar.mainData.findIndex(rec => rec.AdmUsers_id === compVar.focusedRowKey);
      if (idx > -1) {
        const spData = {sql: `UPDATE AdmUsers SET Pwd = Uid 
          WHERE AdmUsers_id = ${compVar.mainData[idx].AdmUsers_id.toString()}`, x_uid: _g_users_id, x_module: 'Users'};
        try {
          await dbExecuteSp(spData);  
        } catch (err) {
          alert(err);
        }     

        compVar.errorMsg = `Password Reset to User Name for ${compVar.mainData[idx].UserName}` ;

        forceRender();
      }
    }

  }

  //**********************************************************/
  const onHidePermissions = async () => {
    compVar.displayPermissions = false;
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
      onRowPrepared: onRowPrepared
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
        {visible: true, options: {icon: "icons/permissions.png", onClick: modifyPermissions, hint: 'Modify permissions'}},
        {visible: true, options: {icon: "icons/reset.png", onClick: resetPassword, hint: 'Reset Password to User Name'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const createUserParams = (mode) => {

    return (
      <>
        <div className="master-grid-params-switch-container"> 
          <div className="master-grid-params-switch-label">
              Active Users
          </div>
          <div style={{height: 20}}>
            <Switch height={20} width={40} onChange={onActiveSwitchChange} checked={activeUsers} uncheckedIcon={false}/>
          </div>
        </div>
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

        {!compVar.displayPermissions &&

          <div className="master-grid-container" style={{height: containerHeight}}>

            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
              <div className="master-grid-params-container" style={{flex: 1}}>
                {createUserParams()}
              </div>
              <div style={{flex: 2}}>
                <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container" style={{flex: 1}}>
              </div>
            </div>        

            <div className="master-grid-content-box">
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}
            </div>

            {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

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
        }

        {compVar.displayPermissions &&
          <AdmUserPermissions
            admUsers_id={compVar.activeUsers_id}
            userName={compVar.activeUserName}
            onHidePermissions={onHidePermissions}
            admLevel={compVar.admLevel}
          >
          </AdmUserPermissions>
        }

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default AdmUsers;
