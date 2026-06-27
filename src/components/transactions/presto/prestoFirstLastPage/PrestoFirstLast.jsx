import React, { useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import { dbGetRecordRaw } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import Switch from "react-switch";
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {convert_DbDate_To_DMY, convertDMY_MDY, addDay, addMonth} from "../../../common/CommonTransactionFunctions";

import '../../../common/MasterGrid.css'
import '../../../common/ButtonsPanel.css'
import './PrestoFirstLast.css'

let compVar = {};

function PrestoFirstLast(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      createdByMe: true, topSwitchValue: true,
      userStr: '', errorMsg: '',
      dataSource: null, keyExpr: 'Quotations_id', 
      tableWidth: 450, focusedRowKey: -1,
      defaultPageSize: 8, 
      renderToggle: false,
    }   
        
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
  // This should execute only when the errorMsg changes
  // Ensure that 2nd argument is [errorMsg]
  // After 5 sec, the error message is auto-closed
  useEffect (() => {

    getPrestoListing();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.searchText, props.searchType]);

  //**********************************************************/
  const getPrestoListing = async() => {

    setDataFetched(false);

    const order = (compVar.topSwitchValue) ? "DESC" : "ASC";
    const userStr = (compVar.createdByMe) ? " AND q.AdmUsers_id = " + _g_users_id.toString() : " ";

    const quotationDate = convertDMY_MDY(props.quotationDate);
    const quotationToDate = convertDMY_MDY(addDay(addMonth(props.quotationDate, 12, 2),-1,2));

    const query = "SELECT TOP 10 q.Quotations_id, q.TourCode, q.StartDate,  q.PaxName, q.Trial, " + 
      "CASE WHEN q.Trial = 0 THEN 'Live' WHEN q.Trial = 1 THEN 'Trial' ELSE 'Riksja' END AS TrsType, " +
      "q.QuotationDate, u.uid " +
      "FROM Quotations q " + 
      "LEFT JOIN AdmUsers u ON q.AdmUsers_id = u.AdmUsers_id " +
      "WHERE QuotationDate BETWEEN '" + quotationDate + "' AND '" + quotationToDate + "' " +
      "AND Trial <> 3 " + 
      userStr +
      " ORDER BY QuotationDate " + order;      

    const queryObj = await dbGetRecordRaw({query: query });
    compVar.dataSource = queryObj;

    // no records found, then close
    if (queryObj.length > 0) {
      compVar.focusedRowKey = queryObj[0][compVar.keyExpr];
      forceRender();
    }

    setDataFetched(true);    

  }
  
  //**********************************************************/
  const closePopup = async () => {
    await selectFirstLastPresto(0);
  };  
    
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
      compVar.focusedRowKey = e.row.data.Quotations_id;

      forceRender();

    }

  }

  //**********************************************************/
  const onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.Trial === 1) {
        e.rowElement.style.color = 'red'; 
        e.rowElement.title = 'Trial';
      }  
    }
  }
 
  //**********************************************************/
  const selectFirstLastPresto = async (mode) => {     

    // get selected presto details
    let selectedPresto = await getSelectedFirstLastPresto();    

    let tourCode = selectedPresto.tourCode; 
    let tourDate = selectedPresto.tourDate;
    let pax = selectedPresto.pax;
    let open = false;
    let dataRefresh = (mode === 1) ? true : false;
    let trial = selectedPresto.trial;
    let quotations_id = selectedPresto.quotations_id;
        
    if (props.getSelectedFirstLastPrestoSearchOption !== undefined) {
      await props.getSelectedFirstLastPrestoSearchOption({
        tourCode: tourCode, 
        tourDate: tourDate,
        pax: pax,
        refresh: dataRefresh, 
        open: open, 
        trial: trial,
        quotations_id: quotations_id
      });
    }    
    
  };  

  //**********************************************************/
  const getSelectedFirstLastPresto = async () => {    
    
    const selectedPresto = compVar.dataSource.filter(rec => (rec[compVar.keyExpr] === compVar.focusedRowKey));    

    let tourCode = '';
    let tourDate = '01/01/2000';
    let pax = '';
    let trial = 0;
    let quotations_id = -1;

    if (selectedPresto.length > 0) {
      tourCode = selectedPresto[0].TourCode;
      tourDate = convert_DbDate_To_DMY(selectedPresto[0].StartDate,1);
      pax = selectedPresto[0].PaxName;
      trial = selectedPresto[0].Trial;
      quotations_id = selectedPresto[0].Quotations_id;
    }    

    return {tourCode: tourCode, tourDate: tourDate, pax: pax, trial: trial, quotations_id: quotations_id};

  };  

  //**********************************************************/
  const getColumns = () => {

    let tableHeaderArray = [ 
      {key: 1, label: "Quotations_id", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false},
      {key: 2, label: "Tour Code", field: 'TourCode', width: 100, align: "center", dataType: 'string', visible: true},  
      {key: 3, label: "Tour Date", field: 'StartDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
      {key: 4, label: "Party", field: 'PaxName', width: 200, align: "left", dataType: 'string', visible: true},
      {key: 5, label: "Type", field: 'TrsType', width: 50, align: "left", dataType: 'string', visible: true},
      {key: 6, label: "Quotation Date", field: 'QuotationDate', width: 120, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
      {key: 7, label: "Created By", field: 'uid', width: 100, align: "left", dataType: 'string', visible: true},
    ];

    compVar.tableWidth = tableHeaderArray.reduce((acc, rec) => acc + rec.width, 0);

    /*=== generate the JSX for grid columns ===*/
    return tableHeaderArray.map((rec) => {

      /*==== fields which are kewords in SQL are wrapped in [] ===*/
      let field = rec.field.startsWith('[') ? rec.field.replace('[','').replace(']','') : rec.field;

      /*=== data format ===*/
      let dataFormat = ((rec.editorOptions !== undefined) && (rec.editorOptions.displayFormat !== undefined)) ?
        rec.editorOptions.displayFormat : null;
            
      return (
        <Column key={rec.key}
          dataField={field} 
          caption={rec.label} 
          width={rec.width}
          alignment={rec.align}
          visible={rec.visible}
          dataType={rec.dataType}
          format={dataFormat}
        >
        </Column>
      );

    });

  }

  //**********************************************************/
  const createdBySwitchValueChanged = async (e) => {

    compVar.createdByMe = e;
    await getPrestoListing();
    forceRender();
    
  }  

  //**********************************************************/
  const topSwitchValueChanged = async (e) => {

    compVar.topSwitchValue = e;
    await getPrestoListing();
    forceRender();
    
  }  

  //**********************************************************/
  const switchJsx = (index) => {

    const createdByMe = (compVar.createdByMe !== undefined && compVar.createdByMe !== null) ? compVar.createdByMe : false;
    const topSwitchValue = (compVar.topSwitchValue !== undefined) ? compVar.topSwitchValue : false;

    const labels = ['Created By Me','Latest entered'];
    const heights = [20,20];
    const widths = [40,40];
    const onSwitchChanges = [createdBySwitchValueChanged, topSwitchValueChanged];
    const onChecks = [createdByMe, topSwitchValue];

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
  const dataGridJsx = () => {

    const boxWidth = compVar.tableWidth;

    const pagingVisible = (compVar.dataSource.length > compVar.defaultPageSize) ? true : false;

    return (
      <div style={{height: '100%', width: boxWidth, display: 'flex', justifyContent: 'center'}}>

        <DataGrid 
          dataSource={compVar.dataSource}
          keyExpr={compVar.keyExpr}
          rowAlternationEnabled={true}
          focusedRowEnabled={true}
          focusedRowKey={compVar.focusedRowKey}
          onFocusedRowChanged={onFocusedRowChanged}
          onRowPrepared={onRowPrepared}
        >      

          <Paging 
            enabled={true} 
            defaultPageSize={compVar.defaultPageSize} 
          />

          <Pager
            visible={pagingVisible}
            displayMode='full'
            showPageSizeSelector={false}
            showInfo={true}
            showNavigationButtons={true} 
          />      

          {getColumns()}

        </DataGrid>

      </div>

    )    
  }


  //**********************************************************/
  const buttonsJsx = () => {

    const disabled = false;

    return (
      <>
        <div className="buttons-panel-container">
          <div className="buttons-container">
          </div>
          <div className="buttons-container">
            <Button text="Cancel" type="default" onClick={closePopup}/>
          </div>
          <div className="buttons-container">
            <Button text="OK" disabled={disabled} type="success" onClick={async() => selectFirstLastPresto(1)}/>
          </div>
          <div className="buttons-container">
          </div>
        </div>
      </>
    )

  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight - 170;

    const open = (props.open === undefined) ? true : props.open;
    
    return (
      <>
        <Popup visible={open} height={550} width={900} onHiding={closePopup}>

          {!dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched && 
            <>
              <div className="master-grid-container" style={{height: containerHeight, background: '#ffefcc', justifyContent: 'flex-start'}}>

                <div className="presto-firstlast-list-header">
                  <span className="presto-firstlast-list-switch-item" style={{justifyContent: 'flex-end'}}>{switchJsx(0)}</span>
                  <span className="presto-firstlast-list-switch-item" style={{justifyContent: 'flex-start', paddingLeft: 20}}>{switchJsx(1)}</span>
                </div>

                <hr style={{width: '100%'}}/>

                {dataGridJsx()}
              </div>

              <hr/>

              {buttonsJsx()}
            </>
          }
          
        </Popup>

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default PrestoFirstLast;
