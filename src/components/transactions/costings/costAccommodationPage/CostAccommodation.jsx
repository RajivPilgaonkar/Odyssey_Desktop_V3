import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../../actions';
import { convertDMY_MDY, convert_DbDate_To_DMY, convert_DbDate_To_MDY, getFieldsArray, beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, convertToMoment_fmt, setDateTimeFormat } from "../../../common/CommonTransactionFunctions";
import { setFocusedRow, getDefaultDataObject, getViewContainerHeights, getDefaultFormObject, afterEdit, afterAdd } from "../../../common/MasterGridHelpers";
import { canDelete } from "../../../common/CommonFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle, toast } from "../../../common/HelperComponents";
import { checkDatesOverLap, getHotelLabel, getGridHeight } from "../../../common/CostingHelpers";
import {popupTitleContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetCostAccommodationData";
import CostAccommodationParams from './CostAccommodationParams';
import PopupDialogBox from '../../../common/PopupDialogBox';
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import LinkForms from "../../../common/LinkForms";
import CostAccRoom from "./costAccRoomPage/CostAccRoom";
import CostAccCommission from "./costAccCommissionPage/CostAccCommission";
import CostAccAgentGst from "./costAccAgentGstPage/CostAccAgentGst";
import CostAccMealPlan from "./costAccMealPlanPage/CostAccMealPlan";
import CostAccTourLeader from "./costAccTourLeaderPage/CostAccTourLeader";
import CopyCostings from '../copyCostingsPage/CopyCostings';
import { formHelp } from './Help';

import '../../../common/MasterGrid.css'

let compVar = {};

function CostAccommodation() {

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
  let _g_cities_id = useSelector(state => state.params.accCities_id) || -1;
  let _g_hotels_id = useSelector(state => state.params.accHotels_id) || -1;
  let _g_wef = useSelector(state => state.params.accWef) || convert_DbDate_To_DMY (new Date(), 1);

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
      tableName: 'seasons', keyField: 'Seasons_id',
      masterDescField: '',
      cities_id: _g_cities_id, hotels_id: _g_hotels_id, wef: _g_wef,
      dateRange: '', seasons_id: -1, 
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: 'Seasons', title: 'New Season',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: true, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 500,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption],
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1, displayCopyCosting: false,
      dbLookup: [       
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

      compVar.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', x_uid: _g_users_id, x_module: 'Aircraft Types'});   
      compVar.dbLookup[0].dataSource = compVar.userLookup;  
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = getFieldsArray(tableHeaderArray);
    fieldArray.push("CASE WHEN COALESCE(git,0) = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS Fit");
    fieldArray.push("RTRIM(LTRIM(CAST(CAST(fromPax AS INT) AS VARCHAR(2)))) + ' to ' + LTRIM(RTRIM(CAST(CAST(to_pax AS INT) AS VARCHAR(2)))) AS NumPax");

    let condition = ' AND (1=2) ';
    try {
      if (compVar.wef !== undefined && compVar.wef !== null && compVar.wef.trim().length > 0) {
console.log('compVar.wef before convertDMY_MDY',compVar.wef);        
        const wef = convertDMY_MDY(compVar.wef); 
        condition = ` AND FromDate = '${wef}'`;
      }

      const whereStr = `Addressbook_id = ${compVar.hotels_id.toString()} 
       ${condition}`;

console.log('whereStr',whereStr);        

      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['FromDate'], table: 'seasons', where: whereStr, x_uid: _g_users_id, x_module: 'Aircraft Types'});   

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      if (compVar.mainData.length > 0) {
        compVar.seasons_id = compVar.mainData[0].Seasons_id;
      }
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const editRow = async (e) => {
    afterEdit(compVar, e);
    const title = await getHotelLabel(compVar.hotels_id, compVar.wef);
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
      Addressbook_id: compVar.hotels_id
    }

    afterAdd(compVar, defaultObj);
    const title = await getHotelLabel(compVar.hotels_id, compVar.wef);
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
      {table: 'hoteltariffsindia', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data.Seasons_id, existsIn: 'Room Tariffs. Delete the room tariffs first'},
      {table: 'mealcostsindia', condition: 'WHERE ' + compVar.keyField + ' = ' + e.row.data.Seasons_id, existsIn: 'Meal Costs. Delete the meal costs first'},
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

    const wef = convert_DbDate_To_MDY(compVar.formData.FromDate,1);

    let condition = "WHERE Addressbook_id = " + compVar.formData.Addressbook_id.toString() + " " + 
      "AND FromDate = '" + wef + "' ";
    condition += (compVar.formMode === 2) ? "AND " + compVar.keyField.toString() + " <> " + compVar.formData[compVar.keyField].toString() : "";

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
      compVar.seasons_id = compVar.focusedRowKey;

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
    if (formData.FromPax > formData.To_Pax) {
      return '"From Pax" cannot exceed "To Pax"';
    }

    // To Date can be null
    if (formData.ToDate !== null) {
      const wef = convertToMoment_fmt(formData.FromDate,'');
      const wet = convertToMoment_fmt(formData.ToDate,'');
      if (wef > wet) {
        return '"Wef" cannot exceed "Wet"';
      }  
    }

    // Check other errors here like is amount < 0, is date less than today ....        
    const errorStr = await checkDatesOverLap(formData.Seasons_id, formData.Addressbook_id, formData.FromDate, formData.ToDate);
    if (errorStr > '') {
      return errorStr;
    }

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
  const getSelectedUser = (e) => {
    compVar.formData.ModifiedByUsers_id = e[0].AdmUsers_id;
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
  const onPanelLoad = async (e) => {
    setPanelDataFetched(true);
  }

  //**********************************************************/
  const getSelectedParams = async (e) => {
    compVar.cities_id = e.cities_id;
    compVar.hotels_id = e.hotels_id;
    compVar.wef = e.wef;
    compVar.dateRange = e.dateRange;    

    if (e.refresh) {
      await filterData();
    } 
  }

  //**********************************************************/
  const copyData = async () => {

    const idx = compVar.mainData.findIndex(rec => rec.Seasons_id === compVar.seasons_id);
    if (idx > -1) {

      if (compVar.mainData[idx].ToDate === null) {
        compVar.errorMsg = 'Cannot copy without "To Date"';
        forceRender();
        return;
      }

      let fromDate = convert_DbDate_To_DMY(compVar.mainData[idx].FromDate, 1);
      let toDate = convert_DbDate_To_DMY(compVar.mainData[idx].ToDate, 1);

      // Save to redux store through params reducer
      dispatch(setParamValues({
        costService: compVar.hotel,
        costFromDate: fromDate,
        costToDate: toDate,
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
  const commissionAndGstJsx = () => {

    return (
      <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
        <div style={{flex: 1, justifyContent: 'center'}}>
          <CostAccCommission
            seasons_id={compVar.seasons_id}
            hotels_id={compVar.hotels_id}
            wef={compVar.wef}
          />
        </div>
        <div style={{flex: 1, justifyContent: 'center'}}>
          <CostAccAgentGst
            seasons_id={compVar.seasons_id}
            hotels_id={compVar.hotels_id}
            wef={compVar.wef}
          />
        </div>
      </div>
    )
  }

  //**********************************************************/
  const mealPlanAndTourLeaderJsx = () => {

    return (
      <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
        <div style={{flex: 1, justifyContent: 'center'}}>
          <CostAccMealPlan
            seasons_id={compVar.seasons_id}
            hotels_id={compVar.hotels_id}
            wef={compVar.wef}
          />
        </div>
        <div style={{flex: 1, justifyContent: 'center'}}>
          <CostAccTourLeader
            seasons_id={compVar.seasons_id}
            hotels_id={compVar.hotels_id}
            wef={compVar.wef}
          />
        </div>
      </div>
    )
  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    const idx = compVar.mainData.findIndex(rec => rec.Seasons_id === compVar.seasons_id);
    compVar.seasons_id = (idx > -1) ? compVar.seasons_id : -1;

    compVar.gridHeight = (compVar.mainData.length > 0) ? getGridHeight(compVar.mainData.length) : 140;    

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
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

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
      clearLookup: [clearUserLookup],
      getSelectedRecord: [getSelectedUser],
      initialLookupValues: [initialUserLookupValues],
      clearLookupValues: [clearUserLookupValues],
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const canAdd = (compVar.hotels_id !== null && compVar.hotels_id > 0) ? true : false;
    const canCopy = (canAdd && compVar.mainData.length > 0);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
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

    const copyCostings = {
      id: compVar.seasons_id, open: compVar.displayCopyCosting,
      serviceType: 1, 
      getSelectedCopyCostingOption: getSelectedCopyCostingOption
    }

    const maxHeight = (compVar.seasons_id !== undefined && compVar.seasons_id > 0) ? compVar.gridHeight : null;
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start'}}>

          <div style={{ width: '100%'}}>
            <CostAccommodationParams
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
          }

          {!editPopupVisible && dataFetched &&
            <div className="master-grid-content-box" style={{maxHeight: maxHeight}}>
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

              {getDevExtremeTable(dataObj, true)}

            </div>
          }

          {!editPopupVisible && dataFetched &&
            toast(formObj, toastContainerStyle, {})
          }

          {compVar.seasons_id !== undefined && compVar.seasons_id !== null &&
            <>
              <CostAccRoom
                seasons_id={compVar.seasons_id}
                hotels_id={compVar.hotels_id}
                wef={compVar.wef}
              />
              {commissionAndGstJsx()}
              {mealPlanAndTourLeaderJsx()}
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

export default CostAccommodation;
