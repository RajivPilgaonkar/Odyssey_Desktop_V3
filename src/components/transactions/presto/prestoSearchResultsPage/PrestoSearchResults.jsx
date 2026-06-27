import React, { useEffect, useState} from 'react';
import { dbGetRecordRaw } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {convert_DbDate_To_DMY} from "../../../common/CommonTransactionFunctions";

import '../../../common/MasterGrid.css'
import '../../../common/ButtonsPanel.css'

let compVar = {};

function PrestoSearchResults(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  


  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      dataSource: null, keyExpr: 'Quotations_id', 
      tableWidth: 450, focusedRowKey: -1,
      defaultPageSize: 8
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

    let searchField = (props.searchType === 1) ? 'TourCode' : 'PaxName';
    if (props.searchType === 3) {
      searchField = 'QuotationNo';  
    }

    let periodStr = "";
    if (!props.wefSwitchValue) {
      periodStr = " AND DATEDIFF(year, StartDate, GETDATE()) < 2 ";
    }

    let whereTrial = ' AND Trial IN (0,1) ';
    if (props.dataType === 3) {
      whereTrial = ' AND Trial IN (3) ';
    }

    const query = "SELECT Quotations_id, TourCode, StartDate,  PaxName, Trial, " + 
        "CASE WHEN Trial = 0 THEN 'Live' WHEN Trial = 1 THEN 'Trial' ELSE 'Riksja' END AS TrsType " +
        "FROM Quotations q " + 
        "WHERE " + searchField + " LIKE '%" + props.searchText + "%' " +
        periodStr +
        whereTrial + 
        "ORDER BY StartDate DESC";      

    compVar.keyExpr = 'Quotations_id';

    const queryObj = await dbGetRecordRaw({query: query });
    compVar.dataSource = queryObj;

    // no records found, then close
    if (queryObj.length === 0) {
      compVar.focusedRowKey = -1;
      await selectPresto(0);
    // one record found
    } else if (queryObj.length === 1) {
      compVar.focusedRowKey = queryObj[0][compVar.keyExpr];
      await selectPresto(1);
    // multiple records
    } else {
      compVar.focusedRowKey = queryObj[0][compVar.keyExpr];
      forceRender();
    }

    setDataFetched(true);

  }
  
  //**********************************************************/
  const closePopup = async () => {
    await selectPresto(0);
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
  const selectPresto = async (mode) => {     

    // get selected presto details
    let selectedPresto = await getSelectedPresto();    

    let tourCode = selectedPresto.tourCode; 
    let tourDate = selectedPresto.tourDate;
    let pax = selectedPresto.pax;
    let open = false;
    let dataRefresh = (mode === 1) ? true : false;
    let trial = selectedPresto.trial;
    let quotations_id = selectedPresto.quotations_id;
    
    if (props.getSelectedPrestoSearchOption !== undefined) {
      await props.getSelectedPrestoSearchOption({
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
  const getSelectedPresto = async () => {    
    
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

    let tableHeaderArray = 
      [ {key: 1, label: "Quotations_id", field: 'Quotations_id', width: 60, align: "left", dataType: 'number', visible: false},
        {key: 2, label: "Tour Code", field: 'TourCode', width: 100, align: "center", dataType: 'string', visible: true},  
        {key: 3, label: "Tour Date", field: 'StartDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
        {key: 4, label: "Party", field: 'PaxName', width: 200, align: "left", dataType: 'string', visible: true},
        {key: 5, label: "Type", field: 'TrsType', width: 50, align: "left", dataType: 'string', visible: true},
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
            <Button text="OK" disabled={disabled} type="success" onClick={async() => selectPresto(1)}/>
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
    const containerHeight = heights.containerHeight - 200;

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

export default PrestoSearchResults;
