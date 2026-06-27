import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbDeleteRecord, dbExecuteSp } from '../../../../actions';
import { setDateTimeFormat, convert_DbDate_To_MDY, convert_DbDate_To_DMY} from "../../../common/CommonTransactionFunctions";
import { getDevExtremeTable, tableHeaderArray } from "./GetPrestoCostData";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import { popupTitle } from "../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../common/ComponentStyles";
import {getDefaultDataObject, getDefaultFormObject, setFocusedRow, getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {getAdmLevelLocation, getCurrencyCode} from "../../../common/GetDescFromIds";
import PopupDialogBox from '../../../common/PopupDialogBox';
import DropDownButton from 'devextreme-react/drop-down-button';
import {Button} from 'devextreme-react/button';
import PrestoCostBreakupList from './PrestoCostBreakupList';
import PrestoExtraMargin from './PrestoExtraMargin';
import PrestoEnterMargin from './PrestoEnterMargin';
import { setupReport } from "./ReportSetup";

import '../../../common/MasterGrid.css'

const CAR_ODD_GROUP_COLOR = '#b3ffcc';
const CAR_EVEN_GROUP_COLOR = '#d7b3ff';

let compVar = {};

function PrestoCost(props) {

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
      tableName: 'QuoLines', keyField: 'QuoLines_id',
      masterDescField: '',
      mainTitle: 'Itemised Pricing', title: 'New Pricing',
      errorMsg: '', focusedRowKey: -1,
      tabs: [{title: 'Main', index: 0},{title: 'Additional', index: 1}], 
      canAdd: false, canModify: true, 
      getSelectedOption: null, dialogMessage1: '', dialogMessage2: '',
      isEdited: false, condition: '',
      formHeight: 410,
      popupDialogIndex: 0, popupSelectedOptions: [getPopupSelectedOption, regenerateCostingLinesProc],
      currency: '', extraMargin: 0, displayExtraMargin: false,
      displayMargin: false,
      displayCostBreakup: false,
      displayGridFilterRow: false,
      toastIsVisible: false, toastMessage: '',
      admLevel: 1,
      formChanged: false, 
      showAll: true,
      rowDragging: false,
      dbLookup: [       
      ],
      reportsData: [
        {id: 1, type: 4, text: 'Itemised Pricing (XLSX)', reportName: 'ItemisedPricing', reportType: 'XLSX', reportEndPoint: ''},
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
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    try {
      const query = "EXEC [p_QuoGetCostingLines] " + props.quotations_id.toString();
      compVar.mainData = await dbGetRecordRaw({query: query});

      // do this whenever hasTime has been specified for some fields
      // otherwise if the time exceeds 17:30, it adds 04:30 hours and it shows the next date
      setDateTimeFormat (tableHeaderArray, compVar.mainData);

      colorDriveGroups();

      await getExchRateAndExtraMargin();
      await setTourOperatorGstLine();
        
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);

    // *** ... if this is not done, the summary footer duplicates
    let id = compVar.focusedRowKey;
    compVar.focusedRowKey = -1;

    setDataFetched(true);

    // *** ... if this is not done, the summary footer duplicates
    id = ((id === null || id < 0) && compVar.mainData.length > 0) ? compVar.mainData[0].QuoLines_id : id;
    compVar.focusedRowKey = id;
    forceRender();

  }

  //**********************************************************/
  const editRow = async (e) => {
    compVar.displayMargin = true;
    forceRender();
  }

  //**********************************************************/
  const addRow = async () => {
  }

  //**********************************************************/
  const deleteRow = async (e) => {
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
    compVar.formChanged = true;

    if (compVar.errorMsg > '') {
      compVar.errorMsg = '';
      forceRender();
    } 
  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    

    if (e.rowType === 'data') {
      if (e.data.Cost === 0) {        
        if (e.data.OwnArrangements) {
          e.rowElement.style.color = '#7300e6'; 
          e.rowElement.title = 'Pax make their own arrangements';  
        } else if (e.data.TrsType !== 5 && e.data.NewDriveLine !== 1) {
          e.rowElement.style.color = 'red'; 
          e.rowElement.title = 'Zero Costing Line';  
        } else if (e.data.TrsType === 5 && e.data.NewDriveLine === 1) {
          e.rowElement.style.color = 'red'; 
          e.rowElement.title = 'Zero Costing Line';  
        }
      } 
    }

  }

  //**********************************************************/
  const onCellPrepared = async(e) => {    
    if (e.rowType === 'data' && e.column.dataField !== undefined && 
        e.column.dataField === 'CarColor' && e.data.groupColor !== undefined && 
        e.data.groupColor !== null ) {
      e.cellElement.style.backgroundColor = e.data.groupColor;
    }
  }

  //**********************************************************/
  const colorDriveGroups = async () => {

    let driveGroupNo = 0;
    let counter = 0;
    
    // For start of new day, activity type 0, check if any other records exist. If none -> Day at Leisure
    for (const rec of compVar.mainData) {
      if (rec.groupNo !== undefined && rec.groupNo !== null) {
        counter = (rec.groupNo !== driveGroupNo) ? counter+1 : counter;
        const groupColor = ((counter % 2) !== 0) ? CAR_ODD_GROUP_COLOR : CAR_EVEN_GROUP_COLOR;
        rec.groupColor = groupColor;      
        driveGroupNo = rec.groupNo;
      }
    }
      
  }

  //**********************************************************/
  const getExchRateAndExtraMargin = async () => {

    // Currency
    const currencyObj = await getCurrencyCode(props.currencies_id);
    compVar.currency = currencyObj.currencyCode;
    let exchRate = 1.0;
    if (compVar.mainData.length > 0 && compVar.mainData[0].ExchRate !== null) {
      exchRate = compVar.mainData[0].ExchRate;
    }
    compVar.currency = (exchRate !== 1.0) ? " (" + compVar.currency + " @ " + Math.round(exchRate).toString() + ")" : '';

    // Exch Rate
    const query = "SELECT COALESCE(q.ExtraMargin,0.0) AS ExtraMargin FROM Quotations q " + 
      "WHERE q.Quotations_id = " + props.quotations_id.toString();
    const extraMarginObj = await dbGetRecordRaw({query: query});   
    if (extraMarginObj.length > 0 && extraMarginObj[0].ExtraMargin !== null) {
      compVar.extraMargin = extraMarginObj[0].ExtraMargin;
    }
      
  }

  //**********************************************************/
  const setTourOperatorGstLine = async () => {

    if (compVar.mainData.length === 0)
      return;

    // Add line for Tour Operator GST
    const tourDate = convert_DbDate_To_MDY(props.tourDate);
    let query = "SELECT [dbo].[fn_GetServiceTaxPerc] ('" + tourDate + "', 28) AS TourOperatorGst";
    let tourOperatorGstArr = await dbGetRecordRaw({query: query});   
    let tourOperatorGst = 0;
    if (tourOperatorGstArr.length > 0 && tourOperatorGstArr[0].TourOperatorGst !== null) {
      tourOperatorGst = tourOperatorGstArr[0].TourOperatorGst;
    }

    let quote = compVar.mainData.reduce((n, {QuoteCost}) => n + QuoteCost, 0);
    let forex = compVar.mainData.reduce((n, {Forex}) => n + Forex, 0);

    const quoteGst = Math.round(quote * (tourOperatorGst/100));
    const forexGst = Math.round(forex * (tourOperatorGst/100));

    const description = 'Add: Tour Operator GST @ ' + tourOperatorGst.toString() + '%';

    const columns = Object.keys(compVar.mainData[0]);
    let tourOperatorGstOj = columns.reduce((o, key) => ({ ...o, [key]: null}), {});
    tourOperatorGstOj = {...tourOperatorGstOj, QuoLines_id: -1 /*=== -1 used for default in compVar.focusedRow ===*/,
      QuoteCost: quoteGst, Forex: forexGst, QuoString: description};

    compVar.mainData.push(tourOperatorGstOj);

  }

  //**********************************************************/
  const displayCostBreakup = async (e) => {
    compVar.displayCostBreakup = true;
    forceRender();
  }

  //**********************************************************/
  const closeBreakupForm = async() => {
    compVar.displayCostBreakup = false;
    forceRender();
  }

  //**********************************************************/
  const displayExtraMargin = async() => {
    compVar.displayExtraMargin = true;
    forceRender();
  }

  //**********************************************************/
  const closeExtraMarginForm = async(e) => {
    compVar.displayExtraMargin = false;
    if (e.refresh) {
      if (e.extraMargin !== undefined && e.extraMargin !== null) {
        compVar.extraMargin = e.extraMargin;
      }
      await recomputeCost();
    }
    forceRender();
  }

  //**********************************************************/
  const closeEnterMarginForm = async(e) => {
    compVar.displayMargin = false;
    if (e.refresh) {
      await filterData();
    }
    forceRender();
  }

  //**********************************************************/
  const recomputeCost = async () => {

    setDataFetched(false);
    forceRender();

    const sql = "EXEC [p_RecreateCostingLines] " + props.quotations_id + ", 2";

    let spData = {sql: sql};
    await dbExecuteSp(spData);

    await filterData();

  }

  //**********************************************************/
  const regenerateCostingLines = (e) => {

    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = 'This will delete & re-create all the costing lines. Are you sure?'; 
    setPopupDialogBoxVisible(() => {return true});

  }

  //**********************************************************/
  const regenerateCostingLinesProc = async (e) => {

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});

    // if Yes selected
    if (e===1) {

      setDataFetched(false);
      forceRender();
  
      const sql = "EXEC [p_RecreateCostingLines] " + props.quotations_id + ", 1";
  
      let spData = {sql: sql};
      await dbExecuteSp(spData);
  
      await filterData();  

    }

  }

  //**********************************************************/
  const onReportClick = async (e) => {

    if (e.itemData.type === 4) {
      await createXlsxReport(e.itemData);
    }

  }

  //**********************************************************/
  const createXlsxReport = async(itemData) => {

    let data = {quotations_id: props.quotations_id,
      tourCode: props.tourCode,
      tourDate: props.tourDate,
      reportType: itemData.type, reportName: itemData.reportName, 
      openReport: false
    };  
      
    setDataFetched(false);
    await setupReport(data);
    setDataFetched(true);

  }

  //**********************************************************/
  const buttonsJsx = (index) => {

    const disabledCostBreakup = !(compVar.mainData.length > 0);
    const buttonText = (compVar.mainData.length > 0) ? 'Recreate Costing Items' : 'Generate Costing Items';

    const widths = [35,35,200];
    const types = ['normal','normal','normal'];
    const stylingModes = ['outlined','outlined','outlined'];
    const icons = ['icons/extramargin.png','icons/costing.png',null];
    const hints = ['Extra Margin for Entire Tour', 'Recompute Cost without Regenerating Items', 'Should be done if you have made changes to the itinerary'];
    const clicks = [displayExtraMargin, recomputeCost, regenerateCostingLines];
    const disabledArr = [disabledCostBreakup, false, false];
    const texts = [null, null, buttonText];

    const width = widths[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];
    const disabled = disabledArr[index];
    const text = texts[index];

    return (
      <Button
        width={width}
        type={type}
        stylingMode={stylingMode}
        icon={icon}
        hint={hint}
        onClick={click}
        disabled={disabled}
        text={text}
      />
    );
  }


  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = ['Reports'];
    const icons = ['doc']
    const widths = [150];
    const dropDownOptions = [{width: 200}];
    const items = [compVar.reportsData];
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
  const createDataObject = (viewHeight) => {

    if (Object.keys(compVar).length === 0) {
      return {}
    }

    // For showAll, set scroll, else pager (set page size > data length ... so that it scrolls)
    const defaultPageSize = (compVar.showAll) ? compVar.mainData.length+1 : 11;
    //let gridHeight = (compVar.mainData.length > 11) ? viewHeight : null;
    let gridHeight = viewHeight;

    if (Object.keys(compVar).length === 0) {
      return {}
    }

    const defaultDataObject = getDefaultDataObject(
      { compVar: compVar, 
        viewHeight: viewHeight, 
        gridRef: gridRef,
      });

    return {...defaultDataObject,
      dbLookup: compVar.dbLookup,
      addRow: addRow,
      editRow: editRow,
      deleteRow: deleteRow,
      customizeText: customizeText,
      onFocusedRowChanged: onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
      onRowPrepared: onRowPrepared,
      onCellPrepared: onCellPrepared,
      defaultPageSize: defaultPageSize,
      wordWrapEnabled: true,
      gridHeight: gridHeight
    }

  }

  //**********************************************************/
  const createFormObject = () => {

    if (Object.keys(compVar).length === 0) {
      return {}
    }

    const defaultFormObject = getDefaultFormObject({compVar: compVar});

    // *** CASE SENSITIVE override formData properties

    return {...defaultFormObject,
      visible: editPopupVisible,
      onHiding: closePopup,
      showHintData: toggleHint,
      showHelpData: toggleHelp,
      formFieldDataChanged: onFormFieldDataChanged,
      onToastHiding: onToastHiding,      
      showHint: hintVisible,
      popoverVisible: helpVisible,
      clearLookup: [],
      getSelectedRecord: [],
      initialLookupValues: [],
      clearLookupValues: []
    }
  
  }

  //**********************************************************/
  const createElementProps = () => {

    const breakupButtonVisible = (compVar.focusedRowKey > 0);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: compVar.canAdd, options: {icon: "add", onClick: addRow, hint: 'Add a new record'}},
        {visible: breakupButtonVisible, options: {icon: "icons/costbreakup.png", onClick: displayCostBreakup, hint: 'Show Cost Breakup '}},
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

    const paramsPanelHeight = 50;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight-paramsPanelHeight;
    const viewHeight = heights.viewHeight-paramsPanelHeight;

    const dataObj = createDataObject(viewHeight);
    const formObj = createFormObject();
    const elementProps = createElementProps();
    
    const idx = (compVar.mainData !== undefined) ? compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.focusedRowKey) : -1;    
    const trsType = (idx > -1) ? compVar.mainData[idx].TrsType : -1;
    const description = (idx > -1) ? compVar.mainData[idx].QuoString : '';

    const extraMargin = (compVar.extraMargin > 0) ? 'Extra Margin ' + compVar.extraMargin.toString() + '%' : '';
    const title = `${compVar.mainTitle} ${compVar.currency}`;

    return (
      <>

        {(!initDataFetched || !dataFetched) &&
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        }

        {initDataFetched && dataFetched &&
          <div className="master-grid-container" style={{height: containerHeight}}>

            <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT}}>
              <div className="master-grid-params-container" style={{flex: 1}}>
                {buttonsJsx(0)}
                {buttonsJsx(1)}
                {extraMargin.length > 0 &&
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 16, paddingLeft: 15, color: 'blue'}}>
                    {extraMargin}
                  </div>
                }
              </div>
              <div style={{flex: 1}}>
                <ToolbarOptions text={title} {...elementProps}></ToolbarOptions>
              </div>
              <div className="master-grid-params-container" style={{flex: 0.5}}>
                {dropDownButtonJsx(0)}
              </div>
              <div className="master-grid-params-container" style={{flex: 0.5}}>
                {buttonsJsx(2)}
              </div>
            </div>        

            <div className="master-grid-content-box" style={{height: containerHeight-MASTER_GRID_TITLE_HEIGHT}}>
              {(compVar.errorMsg > '') &&
                popupTitle(formObj, popupTitleContainerStyle)
              }

                <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  {getDevExtremeTable(dataObj, true)}
                </div>

            </div>

            {compVar.displayCostBreakup && compVar.mainData.length > 0 &&
              <PrestoCostBreakupList
                quotations_id={props.quotations_id}
                quoLines_id={compVar.focusedRowKey}
                trsType={trsType}
                description={description}
                closeBreakupForm={closeBreakupForm}
              >
              </PrestoCostBreakupList>
            }

            {compVar.displayExtraMargin && 
              <PrestoExtraMargin
                quotations_id={props.quotations_id}
                tourCode={props.tourCode}
                tourDate={convert_DbDate_To_DMY(props.tourDate)}
                closeExtraMarginForm={closeExtraMarginForm}
              >
              </PrestoExtraMargin>
            }

            {compVar.displayMargin && 
              <PrestoEnterMargin
                quotations_id={props.quotations_id}
                quoLines_id={compVar.focusedRowKey}
                trsType={trsType}
                description={description}
                closeEnterMarginForm={closeEnterMarginForm}
              >
              </PrestoEnterMargin>
            }

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

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default PrestoCost;
