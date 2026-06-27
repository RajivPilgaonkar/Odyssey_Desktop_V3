import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dbGetRecordRaw, dbExecuteSp, dbPrestoReports, dbPrestoDocxReports } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { MASTER_GRID_TITLE_HEIGHT} from '../../../../config/paths';
import ToolbarOptions from "../../../common/ToolbarOptions";
import {Button} from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import {getAdmLevelLocation} from "../../../common/GetDescFromIds";
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import PopupDialogBox from '../../../common/PopupDialogBox';
import PrestoCompositeReportForm from "./PrestoCompositeReportForm";
import BasicItinerary from "./basicItinerary/BasicItinerary";
import DetailedItineraryManager from "./detailedItinerary/DetailedItineraryManager";
import Inclusions from "./inclusions/Inclusions";
import Exclusions from "./exclusions/Exclusions";
import { setupReport } from "./ReportSetup";

import '../../../common/MasterGrid.css'

let compVar = {};

function PrestoCompositeReportManager(props) {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [popupDialogBoxVisible, setPopupDialogBoxVisible] = useState(false);
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
      mainTitle: 'Composite Report Manager', title: 'ABC',
      errorMsg: '', 
      isEdited: false, condition: '',
      admLevel: 1, 
      popupDialogIndex: 0, popupSelectedOptions: [deleteCompositeReportProc],
      viewType: 1, reportInProgress: false,
      reportsData:
        [
          {id: 1, type: 1, text: 'Hotels & Agents', reportName: 'HotelsAgents', reportType: 'PDF', reportEndPoint: '/reports/presto/hotelsAgents', subType: 1},
          {id: 2, type: 1, text: 'Only Hotels', reportName: 'Hotels', reportType: 'PDF', reportEndPoint: '/reports/presto/hotelsAgents', subType: 2},
          {id: 3, type: 1, text: 'Only Agents', reportName: 'Agents', reportType: 'PDF', reportEndPoint: '/reports/presto/hotelsAgents', subType: 3},

          {id: 4,  type: 3,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          

          {id: 5, type: 2, text: 'Welcome Letter', reportName: 'WelcomeLetter', reportType: 'DOCX', reportEndPoint: '/reports/presto/welcomeLetter'},
          {id: 6, type: 2, text: 'Drivers Itinerary', reportName: 'DriversItinerary', reportType: 'DOCX', reportEndPoint: '/reports/presto/driversItinerary'},

          {id: 10,  type: 3,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          

          {id: 11, type: 4, text: 'Hotels & Agents (XLSX)', reportName: 'HotelsAgents', reportType: 'XLSX', reportEndPoint: ''},
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
    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);

    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {

    setDataFetched(false);

    const query = "SELECT QuoPrint_id, PaxInfo, BookingInfo, StartingInfo, " + 
      "EndingInfo, QuoRequest, QuoFor, QuoRequestDetails, QuoForDetails, QuoEstimate " + 
      " FROM QuoPrint " + 
      "WHERE Quotations_id = " + props.quotations_id.toString();

    const compositeDataArr = await dbGetRecordRaw({query: query});

    compVar.compositeReportCreated = false;
    compVar.quoPrint_id = -1;
    compVar.viewType = 1;
    if (compositeDataArr.length > 0 && compositeDataArr[0].QuoPrint_id !== null) {
      compVar.compositeReportCreated = true;
      compVar.quoPrint_id = compositeDataArr[0].QuoPrint_id;  
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
  const createCompositeReport = async () => {

    setDataFetched(false);

    let sql = 'EXEC p_QuoInsertPrintItinerary ' + props.quotations_id.toString() + ', 1';
    let spData = {sql: sql};
    await dbExecuteSp(spData);  

    sql = 'EXEC p_AddQuoExclusions ' + props.quotations_id.toString() + ' ';
    spData = {sql: sql};
    await dbExecuteSp(spData);  

    await filterData();

  }

  //**********************************************************/
  const onReportClick = async (e) => {

    if (e.itemData.type === 1) {
      await createPdfReport(e.itemData);
    } else if (e.itemData.type === 2) {
      await createDocxReport(e.itemData);
    } else if (e.itemData.type === 4) {
      await createXlsxReport(e.itemData);
    }

  }


  //**********************************************************/
  const displayCompositeForm = () => {
    compVar.viewType = 1;
    forceRender();
  }

  //**********************************************************/
  const displayItinerary = () => {
    compVar.viewType = 2;
    forceRender();
  }

  //**********************************************************/
  const displayDetailedItinerary = () => {
    compVar.viewType = 3;
    forceRender();
  }

  //**********************************************************/
  const displayInclusions = () => {
    compVar.viewType = 4;
    forceRender();
  }

  //**********************************************************/
  const displayExclusions = () => {
    compVar.viewType = 5;
    forceRender();
  }

  //**********************************************************/
  const deleteCompositeReport  = async () => {

    compVar.popupDialogIndex = 0;
    compVar.dialogMessage1 = 'Are you sure you would like to delete this composite report?';
    compVar.dialogMessage2 = '';
    setPopupDialogBoxVisible(() => {return true});

  };      

  //**********************************************************/
  const deleteCompositeReportProc = async (e) => {

    // close dialog box
    setPopupDialogBoxVisible(() => {return false});
  
    // if Yes selected
    if (e===1) {

      setDataFetched(false);

      let sql = 'EXEC p_QuoPrint_Delete ' + compVar.quoPrint_id.toString();
      let spData = {sql: sql};
      await dbExecuteSp(spData);  

      await filterData();
  
    }

  }
  
  //**********************************************************/
  const createPdfReport = async(reportObj) => {

    const reportName = reportObj.reportName + '_' + props.tourCode + '.pdf';

    const quoPrint_id = compVar.quoPrint_id;

    const data = {reportType: reportObj.type, fileName: reportName, reportEndPoint: reportObj.reportEndPoint, reportSubType: reportObj.subType, 
      quotations_id: props.quotations_id, quoPrint_id: quoPrint_id};

    compVar.reportInProgress = true;
    compVar.errorMsg = '';  
    forceRender();

    const getReportStatus = await dbPrestoReports({data: data});
    compVar.reportInProgress = false;
    if (getReportStatus.error !== undefined && getReportStatus.error !== null) {
      compVar.errorMsg = getReportStatus.error;    
    }
    forceRender();

  }

  //**********************************************************/
  const createDocxReport = async(reportObj) => {

    const reportName = reportObj.reportName + '_' + props.tourCode + '.docx';

    const quoPrint_id = compVar.quoPrint_id;

    const data = {reportType: reportObj.type, fileName: reportName, reportEndPoint: reportObj.reportEndPoint, 
      quotations_id: props.quotations_id, quoPrint_id: quoPrint_id};

    compVar.reportInProgress = true;
    compVar.errorMsg = '';  
    forceRender();
  
    const getReportStatus = await dbPrestoDocxReports({data: data});
    compVar.reportInProgress = false;
    if (getReportStatus.error !== undefined && getReportStatus.error !== null) {
      compVar.errorMsg = getReportStatus.error;    
    }
    forceRender();

  }

  //**********************************************************/
  const createXlsxReport = async(itemData) => {

    let data = {quotations_id: props.quotations_id, 
      quoPrint_id: compVar.quoPrint_id, 
      reportType: itemData.type, reportName: itemData.reportName, 
      openReport: false
    };  
      
    compVar.reportInProgress = true;
    forceRender();

    await setupReport(data);

    compVar.reportInProgress = false;
    forceRender();

  }


  //**********************************************************/
  const buttonsJsx = (index) => {

    const widths = [35];
    const heights = [35];
    const types = ['normal'];
    const stylingModes = ['outlined'];
    const icons = ['icons/trash.png'];
    const hints = ['Delete Composite Report'];
    const clicks = [deleteCompositeReport];
    const disabledArr = [false];
    const texts = [null];

    const width = widths[index];
    const height = heights[index];
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
        height={height}
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
  const createElementProps = () => {

    const createCompositeRpt = (!compVar.compositeReportCreated);

    return {
      numButtons: 1,
      buttonListObj: [
        {visible: createCompositeRpt, options: {icon: "add", onClick: createCompositeReport, hint: 'Create Composite Report'}},
        {visible: !createCompositeRpt, options: {icon: "icons/compositeform.png", onClick: displayCompositeForm, hint: 'Composite Report Form'}},
        {visible: !createCompositeRpt, options: {icon: "icons/itinerary.png", onClick: displayItinerary, hint: 'Basic Itinerary'}},
        {visible: !createCompositeRpt, options: {icon: "icons/detaileditinerary.png", onClick: displayDetailedItinerary, hint: 'Detailed Itinerary'}},
        {visible: !createCompositeRpt, options: {icon: "icons/tick.png", onClick: displayInclusions, hint: 'Inclusions'}},
        {visible: !createCompositeRpt, options: {icon: "icons/minus.png", onClick: displayExclusions, hint: 'Exclusions'}},
      ],
      boxContainerStyle: {/*borderBottom: '1px solid #cccccc'*/},
      height: '100%',
      width: '100%'
    };

  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const elementProps = createElementProps();

    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight, justifyContent: 'flex-start', background: '#e6f2ff', borderBottom: '1px solid #cccccc'}}>

          <div className="master-grid-title-box" style={{height: MASTER_GRID_TITLE_HEIGHT+1, border: 'none', borderBottom: '1px solid #cccccc' }}>
            <div style={{display: 'flex', flex: 1, background: 'rgb(245,245,240)', height: '100%', justifyContent: 'center', alignItems: 'center', fontSize: 18, color: 'blue', borderBottom: null}}>
              {dropDownButtonJsx(0)}
              {compVar.reportInProgress &&
                  <LoadIndicator id="small-indicator" height={30} width={30} />
              }
            </div>  
            <div style={{display: 'flex', flex: 2}}>
              <ToolbarOptions text={compVar.mainTitle} {...elementProps}></ToolbarOptions>
            </div>  
            <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', background: 'rgb(245,245,240)', height: '100%', paddingRight: 5, borderBottom: null}}>
              {buttonsJsx(0)}
            </div>
          </div>        

          {compVar.viewType === 1 &&
            <PrestoCompositeReportForm
              quotations_id={props.quotations_id}
            />
          }

          {compVar.viewType === 2 &&
            <BasicItinerary
              quotations_id={props.quotations_id}
              quoPrint_id={compVar.quoPrint_id}
            />
          }

          {compVar.viewType === 3 &&
            <DetailedItineraryManager
              quotations_id={props.quotations_id}
              quoPrint_id={compVar.quoPrint_id}
            />
          }

          {compVar.viewType === 4 &&
            <Inclusions
              quotations_id={props.quotations_id}
              quoPrint_id={compVar.quoPrint_id}
            />
          }

          {compVar.viewType === 5 &&
            <Exclusions
              quotations_id={props.quotations_id}
              quoPrint_id={compVar.quoPrint_id}
            />
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

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default PrestoCompositeReportManager;
