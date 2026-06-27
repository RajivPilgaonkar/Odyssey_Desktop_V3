import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbGetRecordRaw, dbDeleteRecord } from '../../../../actions';
import { getLookupValues, saveEditedInsertedData, checkNullErrors, getFieldsArray, convertDMY_MDY, setDateTimeFormat } from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetPrestoAssignModuleData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, afterEdit, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import PopupDialogBox from '../../../common/PopupDialogBox';

import '../../../common/MasterGrid.css'

let compVar = {};

function PrestoChangePax(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
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
      tableName: 'QuoCities', keyField: 'QuoCities_id',
      masterDescField: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Assign Modules', title: 'Assign New Modules',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      dbLookup: [ 
        {keyField: 'cities_id', dataSource: compVar.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'Quotations_id', dataSource: compVar.moduleLookup, 
        displayExpr: 'PaxName', valueExpr: 'Quotations_id', fieldList: ['PaxName','QuotationRef','TourDate']},
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

      compVar.cityLookup = await dbGetRecord({fields: ['cities_id', 'city'], orders: ['city'], table: 'cities'});   
      compVar.dbLookup[0].dataSource = compVar.cityLookup;  

      const tourDate = convertDMY_MDY(props.tourDate);    
      const query = "SELECT Quotations_id, QuotationRef, PaxName, CONVERT(VARCHAR(10),StartDate,103) AS TourDate " + 
        "FROM Quotations " + 
        "WHERE Trial = 3 " + 
        "AND DATEDIFF(yy, StartDate,'" + tourDate + "') < 3 " + 
        "ORDER BY StartDate DESC";
      compVar.moduleLookup = await dbGetRecordRaw({query: query});
      compVar.dbLookup[1].dataSource = compVar.moduleLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    try {
      let whereStr = "qc.Quotations_id = " + props.quotations_id.toString();
      const tableStr = "QuoCities qc " + 
        "LEFT JOIN Cities c ON qc.ToCities_id = c.Cities_id ";  
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['qc.DateIn, qc.TimeIn, qc.QuoCities_id'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Presto Assign Modules'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      // fill in the mode of travel
      await fillModeOfTravel();

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const editRow = async (e) => {

    afterEdit(compVar, e);
    compVar.formTitle = props.pax;
    toggleEditPopup();    

  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {
  }

  //**********************************************************/
  const saveFormData = async () => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
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

    let condition = "WHERE 1=2 " ;

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        //ModifiedByUsers_id: _g_users_id,
        //ModifiedOn: convert_DbDate_To_MDY()
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
  const getSelectedCity = (e) => {
    compVar.formData.ToCities_id = e[0].cities_id;
  }

  //**********************************************************/
  const getSelectedModule = (e) => {
    compVar.formData.ModuleQuotations_id = e[0].Quotations_id;
  }

  //**********************************************************/
  const clearCityLookup = () => {
    compVar.formData.ToCities_id = null;
  }

  //**********************************************************/
  const clearModuleLookup = () => {
    compVar.formData.ModuleQuotations_id = null;
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
  const fillModeOfTravel = async () => {

    // for each QuoCities record, fill travel mode like Car/Train ...
    for (const rec of compVar.mainData) {
      const modeOfTravel = await getModeOfTravel(rec.QuoCities_id);
      rec.ModeOfTravel = modeOfTravel;
    }
      
  }

  //**********************************************************/
  const getModeOfTravel = async (quoCities_id) => {

    let modeOfTravel = '';

    const query = "SELECT qt.Tickets_id, c.City, t.Details AS ModeOfTravel, qt.Overnight, qt.DriveTypes_id " + 
      "FROM QuoTickets qt " + 
      "LEFT JOIN Cities c ON qt.To_Cities_id = c.cities_id " +
      "LEFT JOIN Tickets t ON qt.Tickets_id = t.Tickets_id " +
      "WHERE QuoCities_id = " + quoCities_id.toString() + " " +
      "AND COALESCE(qt.LocalCarHire,0) = 0 " +
      "ORDER BY ETA"

    const queryObj = await dbGetRecordRaw({query: query });

    if (queryObj.length === 1) {
      modeOfTravel = queryObj[0].ModeOfTravel + getDriveType(queryObj[0].Tickets_id, queryObj[0].DriveTypes_id) + (queryObj[0].Overnight ? " (O/N)" : "");
    } else {
      for (const rec of queryObj) {
        modeOfTravel += (modeOfTravel > '') ? ' / ' : '';
        modeOfTravel += rec.City + " (" + rec.ModeOfTravel + getDriveType(rec.Tickets_id, rec.DriveTypes_id) + (rec.Overnight ? " [O/N])" : ")");
      }        
    }

    return modeOfTravel;

  }

  //**********************************************************/
  const getDriveType = (tickets_id, driveTypes_id) => {

    // for each QuoCities record, for a Car show suffix of P2P/CG (otherwise assume Per Km)
    let driveType = '';
    if (tickets_id === 5 && (driveTypes_id === 2 || driveTypes_id === 3)) {
      driveType = (driveTypes_id === 2) ? '_P2P' : '_CG';
    }

    return driveType;
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
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearModuleLookupValues = {Quotations_id: null, PaxName: ''};

    const initialCityLookupValues = getLookupValues (
      clearCityLookupValues, compVar.cityLookup, 
      ['cities_id','city'], compVar.formData.ToCities_id);

    const initialModuleLookupValues = getLookupValues (
      clearModuleLookupValues, compVar.moduleLookup, 
      ['Quotations_id','PaxName'], compVar.formData.ModuleQuotations_id);

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
      clearLookup: [clearCityLookup, clearModuleLookup],
      getSelectedRecord: [getSelectedCity, getSelectedModule],
      initialLookupValues: [initialCityLookupValues, initialModuleLookupValues],
      clearLookupValues: [clearCityLookupValues, clearModuleLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
      ],
      boxContainerStyle: {borderBottom: '1px solid #cccccc'},
      height: '100%',
      width: '100%'
    };

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

    const additionalPanelHeight = 50;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

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
            <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
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

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default PrestoChangePax;
