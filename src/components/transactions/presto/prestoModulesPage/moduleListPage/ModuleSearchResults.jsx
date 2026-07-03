import React, { useEffect, useState} from 'react';
import { dbGetRecordRaw } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import {getViewContainerHeights} from "../../../../common/MasterGridHelpers";
import {convert_DbDate_To_DMY} from "../../../../common/CommonTransactionFunctions";

import '../../../../common/MasterGrid.css'
import '../../../../common/ButtonsPanel.css'

let compVar = {};

function ModuleSearchResults(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  


  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      tourCodeField: '', tourDateField: '', pax: '', 
      dataSource: null, keyExpr: 'QuoModules_id', 
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

    getModuleListing();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.searchText, props.searchType, props.numYears]);

  //**********************************************************/
  const getModuleListing = async() => {

    setDataFetched(false);

    let query = '';
    let periodStr = '';

    let searchField = (props.searchType === 1) ? 'TourCode' : 'PaxName';
    
    if (props.numYears > 0) {
      periodStr = " AND DATEDIFF(year, TourDate, GETDATE()) < 2 ";
    }
  
    query = "SELECT QuoModules_id, TourCode, TourDate,  PaxName, Trial, " + 
        "CASE WHEN Trial = 0 THEN 'Live' ELSE 'Trial' END AS TrsType " +
        "FROM QuoModules q " + 
        "WHERE " + searchField + " LIKE '%" + props.searchText + "%' " +
        periodStr +
        " AND Trial IN (0,1) " +
        "ORDER BY TourDate DESC";      

    const queryObj = await dbGetRecordRaw({query: query });
    compVar.dataSource = queryObj;

    // no records found, then close
    if (queryObj.length === 0) {
      if (props.getSelectedModuleSearchOption !== undefined) {
        await props.getSelectedModuleSearchOption({open: false, refresh: false});
      }      
      compVar.focusedRowKey = -1;
    // one record found
    } else if (queryObj.length === 1) {
      const tourCode = queryObj[0].TourCode;
      const tourDate = convert_DbDate_To_DMY(queryObj[0].TourDate,1);
      const paxName = queryObj[0].PaxName;
      const trial = queryObj[0].Trial;
      if (props.getSelectedModuleSearchOption !== undefined) {
        await props.getSelectedModuleSearchOption({
          open: false, refresh: true, 
          tourCode: tourCode, tourDate: tourDate, pax: paxName,
          trial: trial,
          id: queryObj[0][compVar.keyExpr]
        });
      }      
      compVar.focusedRowKey = queryObj[0][compVar.keyExpr];
    // multiple records
    } else {
      compVar.dataSource = queryObj;
      compVar.focusedRowKey = queryObj[0][compVar.keyExpr];
    }

    setDataFetched(true);

  }
  
  //**********************************************************/
  const closePopup = async () => {
    if (props.getSelectedModuleSearchOption !== undefined) {
      await props.getSelectedModuleSearchOption({open: false, refresh: false});
    }        
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
      compVar.focusedRowKey = e.row.data.QuoModules_id;

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
  const selectModule = async () => {     
    
    const selectedModule = await getSelectedModule();

    if (props.getSelectedModuleSearchOption !== undefined) {
      await props.getSelectedModuleSearchOption({
        open: false, refresh: true, 
        tourCode: selectedModule.tourCode, 
        tourDate: selectedModule.tourDate,
        pax: selectedModule.pax,
        trial: selectedModule.trial
      });
    }    
    
  };  

  //**********************************************************/
  const getSelectedModule = async () => {    

    const selectedModule = compVar.dataSource.filter(rec => (rec[compVar.keyExpr] === compVar.focusedRowKey));

    let tourCode = '';
    let tourDate = '';
    let pax = '';
    let trial = 0;

    tourCode = selectedModule[0].TourCode;
    tourDate = convert_DbDate_To_DMY(selectedModule[0].TourDate,1);
    pax = selectedModule[0].PaxName;
    trial = selectedModule[0].Trial;

    return {tourCode: tourCode, tourDate: tourDate, pax: pax, trial: trial};

  };  

  //**********************************************************/
  const getColumns = () => {

    let tableHeaderArray = [ 
      {key: 1, label: "QuoModules_id", field: 'QuoModules_id', width: 60, align: "left", dataType: 'number', visible: false},
      {key: 2, label: "Tour Code", field: 'TourCode', width: 100, align: "center", dataType: 'string', visible: true},  
      {key: 3, label: "Tour Date", field: 'TourDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
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
            <Button text="OK" disabled={disabled} type="success" onClick={selectModule}/>
          </div>
          <div className="buttons-container">
          </div>
        </div>
      </>
    )

  }

  //**********************************************************/
  const renderContent = () => {

    const ROW_HEIGHT = 34;
    const GRID_HEADER_HEIGHT = 36;
    const PAGER_HEIGHT = 40;
    const rowCount = (compVar.dataSource && compVar.dataSource.length) ? compVar.dataSource.length : 0;
    const pagingVisible = rowCount > compVar.defaultPageSize;
    const visibleRowCount = pagingVisible ? compVar.defaultPageSize : rowCount;
    const gridHeight = GRID_HEADER_HEIGHT + (visibleRowCount + 1) * ROW_HEIGHT + (pagingVisible ? PAGER_HEIGHT : 0);
    const popupHeight = gridHeight + 200;

    const open = (props.open === undefined) ? true : props.open;

    return (
      <>
        <Popup visible={open} height={popupHeight} width={900} onHiding={closePopup}>

          {!dataFetched &&
            <div className="master-grid-container">
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched &&
            <>
              <div className="master-grid-container" style={{height: gridHeight, background: '#ffefcc', justifyContent: 'flex-start'}}>
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

export default ModuleSearchResults;
