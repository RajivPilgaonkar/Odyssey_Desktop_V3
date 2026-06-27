import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../../actions';
import { convertDMY_MDY, convert_DbDate_To_DMY, convert_DbDate_To_MDY, getFieldsArray, beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd } from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import { getAgentLabel, getGridHeight } from "../../../common/CostingHelpers";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import LinkForms from "../../../common/LinkForms";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetCostServicesData";
import CostServicesParams from './CostServicesParams';
import CostServicesMisc from "./costServicesMiscPage/CostServicesMisc";
import CostServicesGuide from "./costServicesGuidePage/CostServicesGuide";
import CostServicesEntrance from "./costServicesEntrancePage/CostServicesEntrance";
import CostServicesTransport from "./costServicesTransportPage/CostServicesTransport";
import CostServicesMeetAssist from "./costServicesMeetAssistPage/CostServicesMeetAssist";
import CostServicesClosed from "./costServicesClosedPage/CostServicesClosed";
import PopupDialogBox from '../../../common/PopupDialogBox';
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import CopyCostings from '../copyCostingsPage/CopyCostings';
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function CostServices(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [panelDataFetched, setPanelDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  let _g_agents_id = useSelector(state => state.params.ssAgents_id) || -1;
  let _g_serviceCities_id = useSelector(state => state.params.ssServiceCities_id) || -1;
  let _g_wef = useSelector(state => state.params.ssWef) || convert_DbDate_To_DMY (new Date(), 1);

  // use this to write to the redux store
  const dispatch = useDispatch();
  
  const _g_location = useLocation();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      userLookup: [],  mainData: [],
      serviceLookup: [],
      tableName: 'CostServices', keyField: 'CostServices_id',
      masterDescField: '',
      agents_id: _g_agents_id, serviceCities_id: _g_serviceCities_id, wef: _g_wef,
      dateRange: '', costServices_id: -1, services_id: -1, service: '',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: (props.transfer) ? 'Transfers' : 'Sightseeing', 
      title: (props.transfer) ? 'New Transfer' : 'New Sightseeing',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 440,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      costRefresh: false,
      admLevel: 1, displayCopyCosting: false, 
      gridHeight: 100, gridHeightClosed: 100, displayAllMode: false,
      miscCount: 0, guideCount: 0, entranceCount: 0, transportCount: 0, closedCount: 0,
      dbLookup: [      
        {keyField: 'services_id', dataSource: compVar.serviceLookup, 
        displayExpr: 'service', valueExpr: 'services_id', fieldList: ['service']},        
        
        {keyField: 'AdmUsers_id', dataSource: compVar.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
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

      const transfer = (props.transfer) ? 1 : 0;
      const whereStr = 'transfer = ' + transfer.toString() + ' ' +
        'and cities_id = ' + compVar.serviceCities_id.toString();
      compVar.serviceLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id'], orders: ['[service]'], table: '[services]', where: whereStr});    
      compVar.dbLookup[0].dataSource = compVar.serviceLookup;  
  
      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.dbLookup[1].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    // this is done since the query to retrieve data is a join
    fieldArray = fieldArray.map((rec) => `cs.${rec}`);    
    fieldArray.push (`(SELECT COUNT(*) FROM CostServicesOthers cso
      WHERE cso.CostServices_id = cs.CostServices_id) AS MiscCount `);
    fieldArray.push (`(SELECT COUNT(*) FROM CostServicesGuides csg
      WHERE csg.CostServices_id = cs.CostServices_id) AS GuideCount `);
    fieldArray.push (`(SELECT COUNT(*) FROM CostServicesEntranceFees cse
      WHERE cse.CostServices_id = cs.CostServices_id) AS EntranceCount `);
    fieldArray.push (`(SELECT COUNT(*) FROM CostServicesTransport cst
      WHERE cst.CostService_id = cs.CostServices_id) AS TransportCount `);
    fieldArray.push (`(SELECT COUNT(*) FROM CostServicesClose csc
      WHERE csc.CostServices_id = cs.CostServices_id) AS ClosedCount `);

    let condition = ' AND (1=2) ';
    try {

      const transfer = (props.transfer) ? 1 : 0;

      let whereStr = 'transfer = ' + transfer.toString() + ' ' +
        'and cities_id = ' + compVar.serviceCities_id.toString();
      compVar.serviceLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id'], orders: ['[service]'], table: '[services]', where: whereStr});    
      compVar.dbLookup[0].dataSource = compVar.serviceLookup;  

      if (compVar.wef !== undefined && compVar.wef !== null && compVar.wef.trim().length > 0) {
        const wef = convertDMY_MDY(compVar.wef); 
        condition = ` AND Wef = '${wef}'`;
      }

      whereStr = `cs.Addressbook_id = ${compVar.agents_id.toString()} 
        AND cs.Cities_id = ${compVar.serviceCities_id.toString()}
        ${condition} `;       

      whereStr += 'AND cs.services_id IN (SELECT services_id FROM services WHERE transfer = ' + transfer.toString() + ')';

      const tableStr = 'costservices cs LEFT JOIN services s ON cs.services_id = s.services_id ';
      compVar.mainData = await dbGetRecord({fields: fieldArray, orders: ['s.[description]'], table: tableStr, where: whereStr, x_uid: _g_users_id, x_module: 'Cost Services'});         
      if (compVar.mainData.length > 0) {
        compVar.costServices_id = compVar.mainData[0].CostServices_id;
        compVar.services_id = compVar.mainData[0].Services_id;
        setServiceDescription();
      }
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const setServiceDescription = () => {
    const idx = compVar.serviceLookup.findIndex(rec => rec.services_id === compVar.services_id);
    if (idx > -1) {
      compVar.service = compVar.serviceLookup[idx].service;
    }
  }

  //**********************************************************/
  const editRow = async (e) => {
    afterEdit(compVar, e);
    const title = await getAgentLabel(compVar.agents_id, compVar.serviceCities_id, compVar.wef);
    compVar.formTitle = title;
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

    // add other code like next sr no, yearref ...
    defaultObj = {...defaultObj, 
      Addressbook_id: compVar.agents_id,
      Cities_id: compVar.serviceCities_id
    }

    afterAdd(compVar, defaultObj);
    const title = await getAgentLabel(compVar.agents_id, compVar.serviceCities_id, compVar.wef);
    compVar.formTitle = 'New ... ' + title;

    toggleEditPopup();    
  }

  //**********************************************************/
  const deleteRow = async (e) => {

    if (compVar.admLevel < 3) {
      alert('Insufficient Permissions');
      return;
    }

    const error = await canDelete([
      {table: 'CostServicesGuides', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data.CostServices_id, existsIn: 'Guide Costs. Delete the guide costs first'},
      {table: 'CostServicesOthers', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data.CostServices_id, existsIn: 'Misc Costs. Delete the misc costs first'},
      {table: 'CostServicesEntranceFees', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data.CostServices_id, existsIn: 'Entrance Costs. Delete the entrance costs first'},
      {table: 'CostServicesTransport', condition: 'WHERE CostService_id = ' + e.row.data.CostServices_id, existsIn: 'Transport Costs. Delete the transport costs first'},
      {table: 'CostServicesClose', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data.CostServices_id, existsIn: '"Closed On". Delete the "Closed On" records first'},
    ]);    

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

    const wef = convert_DbDate_To_MDY(compVar.formData.Wef,1);

    let condition = "WHERE Addressbook_id = " + compVar.formData.Addressbook_id.toString() + " " + 
      "AND Services_id = " + compVar.formData.Services_id.toString() + " " +
      "AND Wef = '" + wef + "' ";
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField + " <> " + compVar.formData[compVar.keyField].toString() : "";

    let obj = {
      formMode: compVar.formMode,
      tableName: compVar.tableName,
      keyField: compVar.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: _g_users_id,
        ModifiedOn: convert_DbDate_To_MDY()
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

    // Only for new records
    if (compVar.formMode === 1) {
      compVar.costServices_id = compVar.focusedRowKey;
      compVar.services_id = saveData.formData.Services_id;
      setServiceDescription();

      compVar.toastIsVisible = true;
      compVar.toastMessage = "Please toggle the Wef DropDown for new dates";
    }

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

    // form validation errors

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
  const getSelectedService = (e) => {
    compVar.formData.Services_id = e[0].services_id;
  }

  //**********************************************************/
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
  }

  //**********************************************************/
  const clearServiceLookup = () => {
    compVar.formData.Services_id = null;
  }

  //**********************************************************/
  const clearUserLookup = () => {
    compVar.formData.ModifiedByUsers_id = null;
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
  const onModifyCostServiceTransport = (e) => {
    /*=== if transport cost is modified, also refresh the meet & assist costs ===*/
    if (e.refresh) {
      compVar.costRefresh = !compVar.costRefresh;
      forceRender();
    }
  }
  
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
        compVar.costServices_id = id;
        compVar.services_id = e.row.data.Services_id;
        setServiceDescription();
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
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const getSelectedParams = async (e) => {
    compVar.agents_id = e.agents_id;
    compVar.serviceCities_id = e.serviceCities_id;
    compVar.wef = e.wef;
    compVar.dateRange = e.dateRange;    

    if (e.refresh) {
      await filterData();
    } 
  }

  //**********************************************************/
  const displayAllBlocks = async () => {
    compVar.displayAllMode = !compVar.displayAllMode;
    forceRender();
  }


  //**********************************************************/
  const copyData = async () => {

    const idx = compVar.mainData.findIndex(rec => rec.CostServices_id === compVar.costServices_id);
    if (idx > -1) {

      if (compVar.mainData[idx].ToDate === null) {
        compVar.errorMsg = 'Cannot copy without "To Date"';
        forceRender();
        return;
      }

      let fromDate = convert_DbDate_To_DMY(compVar.mainData[idx].Wef, 1);
      let toDate = convert_DbDate_To_DMY(compVar.mainData[idx].ToDate, 1);

      // Save to redux store through params reducer
      dispatch(setParamValues({
        costService: compVar.agent,
        costFromDate: fromDate,
        costToDate: toDate
      }));

      compVar.displayCopyCosting = true;
      forceRender();
    }

  }

  //**********************************************************/
  const getSelectedCopyCostingOption = async(e) => {

    compVar.displayCopyCosting = false;
    // If data was copied, give toast message
    if (e.copiedData) {
      compVar.toastIsVisible = true;
      compVar.toastMessage = "Please toggle the Wef DropDown";
    }

    forceRender();      

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const idx = compVar.mainData.findIndex(rec => rec.CostServices_id === compVar.costServices_id);
    compVar.costServices_id = (idx > -1) ? compVar.costServices_id : -1;
    compVar.services_id = (idx > -1) ? compVar.services_id : -1;
    compVar.miscCount = (idx > -1) ? compVar.mainData[idx].MiscCount : 0;
    compVar.guideCount = (idx > -1) ? compVar.mainData[idx].GuideCount : 0;
    compVar.entranceCount = (idx > -1) ? compVar.mainData[idx].EntranceCount : 0;
    compVar.transportCount = (idx > -1) ? compVar.mainData[idx].TransportCount : 0;
    compVar.closedCount = (idx > -1) ? compVar.mainData[idx].ClosedCount : 0;

    compVar.gridHeight = (compVar.mainData.length > 0) ? getGridHeight(compVar.mainData.length) : 140;    
    compVar.gridHeightClosed = (idx > -1) ? (compVar.mainData[idx].ClosedCount > 0 && getGridHeight(compVar.mainData[idx].ClosedCount)) : 0;    

    // Get max height between the services & closed grids
    compVar.gridHeight = Math.max(compVar.gridHeight, compVar.gridHeightClosed);

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
    const clearServiceLookupValues = {services_id: null, service: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialServiceLookupValues = getLookupValues (
      clearServiceLookupValues, compVar.serviceLookup, 
      ['services_id','service'], compVar.formData.Services_id);

    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,compVar.userLookup, 
      ['AdmUsers_id','uid'], compVar.formData.ModifiedByUsers_id);

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
      clearLookup: [clearServiceLookup, clearUserLookup],
      getSelectedRecord: [getSelectedService, getSelectedUser],
      initialLookupValues: [initialServiceLookupValues, initialUserLookupValues],
      clearLookupValues: [clearServiceLookupValues, clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.agents_id !== null && compVar.agents_id > 0) ? true : false;
    const canCopy = (canAdd && compVar.mainData.length > 0);    

    const hint = (compVar.displayAllMode) ? 'Click to display only blocks with data' : 'Click to display all blocks';
    const icon = (compVar.displayAllMode) ? 'hidepanel' : 'showpanel';

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: true, options: {icon: icon, onClick: displayAllBlocks, hint: hint}},
        {visible: canCopy, options: {icon: "copy", onClick: copyData, hint: 'Copy Costing to next FY'}},
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

    const additionalPanelHeight = 40;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

    let dataObj = null;
    let formObj = null;
    let elementProps = null;  
    if (dataFetched) {
      dataObj = createDataObject(viewHeight);
      formObj = createFormObject();
      elementProps = createElementProps();  
    }

    const id_arr = (compVar.mainData !== undefined) ? compVar.mainData.map(rec => rec.CostServices_id) : [];

    const copyCostings = {
      id: compVar.costServices_id, open: compVar.displayCopyCosting,
      serviceType: (props.transfer) ? 3 : 2,
      id_arr: id_arr,
      getSelectedCopyCostingOption: getSelectedCopyCostingOption
    }

    const maxHeight = (compVar.costServices_id !== undefined && compVar.costServices_id > 0) ? compVar.gridHeight : null;
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          <div style={{ width: '100%'}}>
            <CostServicesParams
              transfer={props.transfer}
              getSelectedParams={getSelectedParams}          
              onPanelLoad={onPanelLoad}
            />
          </div>

          {panelDataFetched && (!initDataFetched || !dataFetched) &&
            <div className="master-grid-container" style={{height: containerHeight - additionalPanelHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {!editPopupVisible && dataFetched &&
            <div style={{display: 'flex', width: '100%'}}>
              <div style={{flex: 2}}>

                <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>            

                  <div className="master-grid-params-container">
                    <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                      <LinkForms hideElem={[6]}/>
                    </div>
                  </div>        

                  <div style={{flex: 2}}>
                    <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
                  </div>

                  <div className="master-grid-params-container">
                  </div>

                </div>                

                <div className="master-grid-content-box" style={{maxHeight: maxHeight}}>
                  {(compVar.errorMsg > '') &&
                    popupTitle(formObj, popupTitleContainerStyle)
                  }
                  {getDevExtremeTable(dataObj, true)}
                </div>

              </div>
              {(compVar.displayAllMode || compVar.closedCount > 0) &&
                <div style={{flex: 1}}>
                  <CostServicesClosed
                    costServices_id={compVar.costServices_id}
                    services_id={compVar.services_id}
                    wef={compVar.wef}
                    service={compVar.service}
                  />
                </div> 
              }

            </div>
          }

          {!editPopupVisible && dataFetched &&
            toast(formObj, toastContainerStyle, {})
          }          

          {compVar.costServices_id !== undefined && compVar.costServices_id !== null &&
            <>
              {(compVar.displayAllMode || compVar.miscCount > 0) &&
                <CostServicesMisc
                  costServices_id={compVar.costServices_id}
                  services_id={compVar.services_id}
                  wef={compVar.wef}
                  service={compVar.service}
                />
              }
              {(compVar.displayAllMode || compVar.guideCount > 0) &&
                <CostServicesGuide
                  costServices_id={compVar.costServices_id}
                  services_id={compVar.services_id}
                  wef={compVar.wef}
                  service={compVar.service}
                />
              }
              {(compVar.displayAllMode || compVar.entranceCount > 0) &&
                <CostServicesEntrance
                  costServices_id={compVar.costServices_id}
                  services_id={compVar.services_id}
                  wef={compVar.wef}
                  service={compVar.service}
                />
              }
              {(compVar.displayAllMode || compVar.transportCount > 0) &&
                <CostServicesTransport
                  costServices_id={compVar.costServices_id}
                  services_id={compVar.services_id}
                  wef={compVar.wef}
                  service={compVar.service}
                  transfer={props.transfer}
                  costRefresh={compVar.costRefresh}
                  onModifyCostServiceTransport={onModifyCostServiceTransport}
                />
              }
              {props.transfer && (compVar.displayAllMode || compVar.transportCount > 0) && 
                <CostServicesMeetAssist
                  costServices_id={compVar.costServices_id}
                  services_id={compVar.services_id}
                  wef={compVar.wef}
                  service={compVar.service}
                  costRefresh={compVar.costRefresh}
                />
              }
            </>            
          }

          {editPopupVisible && getDevExtremePopupForm(formObj,dataObj)}

          {dataFetched && popupDialogBoxVisible && 
            <PopupDialogBox
              open={true}
              message1={compVar.dialogMessage1}
              message2={compVar.dialogMessage2}
              getSelectedOption={compVar.popupSelectedOptions[compVar.popupDialogIndex]}
            >
            </PopupDialogBox>
          }

          {compVar.displayCopyCosting &&
            <div>
              <CopyCostings {...copyCostings} ></CopyCostings>
            </div>
          }        

        </div>

      </>

    );

  }


  return (
    renderContent()
  )


};

export default CostServices;
