import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {convert_DbDate_To_DMY, convertDMYtoDate, convertDMY_MDY, addMonth, setDateTimeFormat, deepClone } from "../../../../common/CommonTransactionFunctions";
import { dbGetRecordRaw, setConfirmationParamValues } from '../../../../../actions';
import {setFocusedRow, afterEdit, getViewContainerHeights, getDefaultDataObject, getDefaultFormObject} from "../../../../common/MasterGridHelpers";
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../../config/paths';
import { getDevExtremeTable as getDevExtremeTableAcc, getDevExtremePopupForm as getDevExtremePopupFormAcc, tableHeaderArray as tableHeaderArrayAcc } from "./GetPrestoAccommodationConfirmationData";
import { getDevExtremeTable as getDevExtremeTableTkt, getDevExtremePopupForm as getDevExtremePopupFormTkt, tableHeaderArray as tableHeaderArrayTkt } from "./GetPrestoTicketsConfirmationData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getNavButtonsJsx, navPrevRecordClick, navNextRecordClick, setStopNav} from "../../../../common/NavigationHelpers";
import { Button } from 'devextreme-react/button';
import PopupDialogBox from '../../../../common/PopupDialogBox';
import Switch from "react-switch";
import DateBox from 'devextreme-react/date-box';
import DropDownButton from 'devextreme-react/drop-down-button';
import { setupReport } from "./ReportSetup";

import '../../../../common/MasterGrid.css'

let compVar = {};

function PrestoAccommodationConfirmation(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [editPopupVisible, setEditPopupVisible] = useState(false);  
  const [helpVisible, setHelpVisible] = useState(false);  
  const [hintVisible, setHintVisible] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
  const [renderToggle, setRenderToggle] = useState(false);  

  const gridRef = useRef(null);

  const _g_users_id = useSelector(state => state.dbUser.users_id);

  let _g_asOf = useSelector(state => state.confirmationParams.asOf) || convert_DbDate_To_DMY (new Date(), 1);
  let _g_createdByMe = useSelector(state => state.confirmationParams.createdByMe) || false; 
  let _g_includeRequests = useSelector(state => state.confirmationParams.includeRequests) || false; 

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], allData: [],
      keyField: 't_ID',
      formData: [], formOldData: [], formMode: -1, formTitle: 'ABC',
      mainTitle: '', title: '',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}],
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 630,   
      popupDialogIndex: 0, popupSelectedOptions: [setStopNavigation],
      displayGridFilterRow: true,
      toastIsVisible: false, toastMessage: '',
      showAll: true,
      admLevel: 1,
      navigationButtonList: [
        {id: "formPrevButton", text: "", type: "normal", visible: true, icon: "chevronleft", onClick: navigatePrevRecordClick, hint: "Previous Voucher"},
        {id: "formNextButton", text: "", type: "normal", visible: true, icon: "chevronright", onClick: navigateNextRecordClick, hint: "Next Voucher"},
        {id: "formSaveNoCloseButton", text: "", type: "normal", visible: false, icon: "check", onClick: saveFormDataLeaveOpen, hint: "Save without closing"},    
      ], 
      formChanged: false, saveLeaveOpen: false, afterSaveType: 0, 
      createdByMeSwitchValue: _g_createdByMe, 
      includeRequestsSwitchValue: _g_includeRequests, 
      asOf: _g_asOf, 
      reportsData: [
        {id: 1, option: 1, type: 1, text: 'Accommodation Confirmation (XLS)', reportName: 'AccommodationConfirmation'},
        {id: 2, option: 2, type: 2, text: 'Tickets Confirmation (XLS)', reportName: 'TicketsConfirmation'},  
      ],
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
    setInitDataFetched(true);
  }
  
  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    const option = (props.option === undefined || props.option === 1) ? 1 : 2;

    try {
      const asOf = convertDMY_MDY(compVar.asOf);
      const query = `EXEC p_QuoConfirmationStatus '${asOf}', ${option.toString()}`;

      compVar.allData = await dbGetRecordRaw({query: query});

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      if (props.option === 1) {
        setDateTimeFormat (tableHeaderArrayAcc, compVar.allData);
      } else {
        setDateTimeFormat (tableHeaderArrayTkt, compVar.allData);
      }

      applyAddedFilter();
          
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
  const applyAddedFilter = async () => {

    compVar.mainData = deepClone(compVar.allData);

    if (!compVar.includeRequestsSwitchValue) {
      compVar.mainData = compVar.mainData.filter(rec => rec.RequestedOn !== null);
    }

    if (compVar.createdByMeSwitchValue) {
      compVar.mainData = compVar.mainData.filter(rec => rec.AdmUsers_id === _g_users_id);
    }

  }

  //**********************************************************/
  const asOfDateValueChanged = async (e) => {
    if (e !== undefined && e !== null) {
      compVar.asOf = convert_DbDate_To_DMY(e.value,1);
      forceRender();
    }
  }

  //**********************************************************/
  const createdByMeSwitchValueChanged = async (e) => {    
    compVar.createdByMeSwitchValue = e;
    await saveToReduxStore();
    applyAddedFilter();
    forceRender();
  }  

  //**********************************************************/
  const includeRequestsSwitchValueChanged = async (e) => {
    compVar.includeRequestsSwitchValue = e;
    await saveToReduxStore();
    applyAddedFilter();
    forceRender();
  }  

  //**********************************************************/
  const onReportClick = async (e) => {

    let data = {asOf: compVar.asOf, 
      excelData: compVar.mainData,
      reportType: e.itemData.type, reportName: e.itemData.reportName, 
      openReport: false
    };  
      
    setInitDataFetched(false);
    forceRender();
    
    await setupReport(data);

    setInitDataFetched(true);
   
  }

  //**********************************************************/
  const nextMonth = async () => {
    compVar.asOf = addMonth(compVar.asOf, 1, 2);
    forceRender();
  }  

  //**********************************************************/
  const prevMonth = async () => {
    compVar.asOf = addMonth(compVar.asOf, -1, 2);
    forceRender();
  }  

  //**********************************************************/
  const refreshConfirmationData = async () => {
    
    await saveToReduxStore();
    await filterData();

  }

  //**********************************************************/
  const saveToReduxStore = async () => {
    
    // Save to redux store through params reducer
    dispatch(setConfirmationParamValues({
      asOf: compVar.asOf,
      includeRequests: compVar.includeRequestsSwitchValue,
      createdByMe: compVar.createdByMeSwitchValue,
    }));

  }

  //**********************************************************/
  const showAllToggle = async() => {
    compVar.showAll = !compVar.showAll;
    forceRender();
  }

  //**********************************************************/
  const dateParamsJsx = (index) => {

    const asOf = convertDMYtoDate(compVar.asOf); 

    const labels = ['As On'];
    const dates = [asOf];
    const onValuesChanged = [asOfDateValueChanged];

    const label = labels[index];
    const type = "date";
    const width = 150;
    const displayFormat = "dd/MM/yyyy";
    const value = dates[index];
    const onValueChanged = onValuesChanged[index];
    
    return (
      <>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          {label}
        </div>
        <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
          <DateBox 
            type={type}
            width={width}
            height={35}
            displayFormat={displayFormat}
            value={value} 
            onValueChanged={onValueChanged}
            style={{fontSize: 18}}
            acceptCustomValue={false}
          />
        </div>
      </>
    )

  }

  //**********************************************************/
  const buttonParamsJsx = (index) => {

    const widths = [90,35,35,35];
    const heights = [35,35,35,35];
    const icons = [null,'arrowup','arrowdown','icons/size.png'];
    const onClicks = [refreshConfirmationData,nextMonth,prevMonth,showAllToggle];
    const hints = [null,null,null,'Show All/Few'];
    const texts = ['Refresh',null,null,null];

    const width = widths[index];
    const height = heights[index];
    const icon = icons[index];
    const onClick = onClicks[index];
    const hint = hints[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        height={height}
        type="normal"
        stylingMode="outlined"
        icon={icon}
        hint={hint}
        text={text}
        onClick={onClick}
      />

    )

  }
  
  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const reportsData = compVar.reportsData.filter(rec => rec.option === props.option);

    const texts = ['Reports'];
    const icons = ['exportxlsx']
    const widths = [150];
    const dropDownOptions = [{width: 230}];
    const items = [reportsData];
    const onItemClicks = [onReportClick];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={"id"}
        displayExpr={"text"}
        onItemClick={onItemClick}
      />
    )

  }

  //**********************************************************/
  const switchJsx = (index) => {

    const includeRequests = (compVar.includeRequestsSwitchValue !== undefined && compVar.includeRequestsSwitchValue !== null) ? compVar.includeRequestsSwitchValue : false;
    const createdByMe = (compVar.createdByMeSwitchValue !== undefined && compVar.createdByMeSwitchValue !== null) ? compVar.createdByMeSwitchValue : false;

    const labels = ['Include Requests not yet sent','Created By Me'];
    const heights = [20,20];
    const widths = [40,40];
    const onSwitchChanges = [includeRequestsSwitchValueChanged, createdByMeSwitchValueChanged];
    const onChecks = [ includeRequests, createdByMe];

    const label = labels[index];
    const height = heights[index];
    const width = widths[index];
    const onSwitchChange = onSwitchChanges[index];
    const onCheck = onChecks[index];

    return (
      <>
        <div style={{paddingRight: 10}}>
          {label}
        </div>            
        <Switch 
          height={height} 
          width={width} 
          onChange={onSwitchChange} 
          checked={onCheck} 
          uncheckedIcon={false}
        />
      </>      
    )
  }

  //**********************************************************/
  const getNavigationButtonsJsx = () => {
    return getNavButtonsJsx(compVar,null);
  }

  //**********************************************************/
  const saveFormDataLeaveOpen = async () => {
    compVar.saveLeaveOpen = true;
    await saveFormData();
  }

  //**********************************************************/
  const navigatePrevRecordClick = async () => {

    navPrevRecordClick(compVar,-1);
    if (compVar.afterSaveType === -1) {
      setPopupDialogBoxVisible(true);
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const navigateNextRecordClick = async () => {

    navNextRecordClick(compVar,1);
    if (compVar.afterSaveType === 1) {
      setPopupDialogBoxVisible(true);
    } else {
      forceRender();
    }

  }

  //**********************************************************/
  const setStopNavigation  = async (e) => {

    await setStopNav (e, compVar, saveFormData);
    setPopupDialogBoxVisible(false);
    forceRender();

  }

  //**********************************************************/
  const createDataObject = (viewHeight) => {

    // For showAll, set scroll, else pager (set page size > data length ... so that it scrolls)
    const defaultPageSize = (compVar.showAll) ? compVar.mainData.length+1 : 10;
    const gridHeight = (compVar.showAll && compVar.mainData.length > 10) ? viewHeight-10 : undefined;

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
      defaultPageSize: defaultPageSize,
      gridHeight: gridHeight
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    const displayNavigateButtons = (compVar.formMode === 2) ? true : false;

    const navButtonsOverride = [{visible: false}, {visible: false}, {visible: false}];

    // *** CASE SENSITIVE override formData properties

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      saveFormData: saveFormData,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: [],
      displayNavigateButtons: displayNavigateButtons,
      navigateSaveFormData: saveFormDataLeaveOpen,
      navigationControlsJsx: getNavigationButtonsJsx,      
      navigateButtonsOverride: navButtonsOverride,
    }
  
  }

  //**********************************************************/
  const renderContent = () => {

    const additionalPanelHeight = 40;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;
    const viewHeight = heights.viewHeight - additionalPanelHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight-additionalPanelHeight-40}}>
          <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();

    const contentHeight = heights.viewHeight;

    return (
      <>
        <div style={{width: '100%', height: contentHeight}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
            <div className="master-grid-params-container" style={{flex: 2, justifyContent: 'flex-start', paddingLeft: 10}}>
              {dateParamsJsx(0)}
              {buttonParamsJsx(1)}
              {buttonParamsJsx(2)}
              {buttonParamsJsx(0)}
            </div>
            <div className="master-grid-params-container" style={{flex: 1.5}}>
              {switchJsx(0)}
            </div>
            <div className="master-grid-params-container" style={{flex: 1.5}}>
              {switchJsx(1)}
            </div>
            <div className="master-grid-params-container" style={{flex: 1.5}}>
              {dropDownButtonJsx(0)}
            </div>
            <div className="master-grid-params-container" style={{flex: 0.5}}>
              {buttonParamsJsx(3)}
            </div>
          </div>

          {dataFetched &&
            <div className="master-grid-content-box" style={{height: contentHeight-40}}>
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }              
              {props.option === 1 && getDevExtremeTableAcc(dataObj, true)}
              {props.option === 2 && getDevExtremeTableTkt(dataObj, true)}
            </div>
          }

          {props.option === 1 && editPopupVisible && getDevExtremePopupFormAcc(formObj,dataObj)}
          {props.option === 2 && editPopupVisible && getDevExtremePopupFormTkt(formObj,dataObj)}

          {!dataFetched &&
            <div className="master-grid-container" style={{height: contentHeight-40}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched && popupDialogBoxVisible && 
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

export default PrestoAccommodationConfirmation;
