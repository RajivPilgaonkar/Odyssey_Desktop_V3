import React, { useEffect, useState} from 'react';
import { dbGetRecordRaw } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import { getSectorFromCities } from '../../../common/GetDescFromIds';
import { MASTER_GRID_HEADER_HEIGHT, MASTER_GRID_ROW_HEIGHT, MASTER_GRID_PAGER_HEIGHT } from '../../../../config/paths';

import '../../../common/MasterGrid.css'
import '../../../common/ButtonsPanel.css'
import './PrestoTrainsList.css';

let compVar = {};

function PrestoTrainsList(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  


  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      cityText: '',
      keyExpr: 'Trains_id', 
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

    getTrainListing();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.fromCities_id, props.toCities_id, props.wef]);

  //**********************************************************/
  const getTrainListing = async() => {

    setDataFetched(false);

    let query = "EXEC p_TrainTimingListing " + 
      props.fromCities_id.toString() + ", " +
      props.toCities_id.toString() + ", '" + 
      props.wef + "'";

    compVar.mainData = await dbGetRecordRaw({query: query});

    if (props.fromCities_id !== null && props.toCities_id !== null) {
      compVar.cityText = await getSectorFromCities (props.fromCities_id, props.toCities_id);
    }

    compVar.focusedRowKey = (compVar.mainData.length > 0) ? compVar.mainData[0][compVar.keyExpr] : -1;

    setDataFetched(true);

  }
  
  //**********************************************************/
  const closePopup = async () => {
    if (props.getSelectedTrain !== undefined) {
      await props.getSelectedTrain({open: false, refresh: false});
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
      compVar.focusedRowKey = e.row.data.Trains_id;

      forceRender();

    }

  }

  //**********************************************************/
  const selectTrain = async () => {     
    
    /*=== get the tour Reference ===*/
    const idx = compVar.mainData.findIndex(rec => rec.Trains_id === compVar.focusedRowKey);
    const data = (idx > -1) ? compVar.mainData[idx] : [];

    if (props.getSelectedTrain !== undefined) {
      await props.getSelectedTrain({
        open: false, refresh: true, 
        data: data
      });
    }    
    
  };  

  //**********************************************************/
  const getColumns = () => {

    let tableHeaderArray = [ 
      {key: 1, label: "ID", field: 'Trains_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

      {key: 5, label: "Train", field: 'TrainName', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:100}},    
      {key: 6, label: "TrainNo", field: 'TrainNo', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:20}},    
      {key: 7, label: "Timings", field: 'Timings', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:20}},    
      {key: 8, label: "Overnight", field: 'Overnight', width: 100, align: "center", dataType: 'boolean', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, booleanText: ['Yes','No']},
    ];

    compVar.tableWidth = tableHeaderArray.reduce((acc, rec) => acc + rec.width, 0);

    /*=== generate the JSX for grid columns ===*/
    return tableHeaderArray.map((rec) => {

      /*==== fields which are kewords in SQL are wrapped in [] ===*/
      let field = rec.field.startsWith('[') ? rec.field.replace('[','').replace(']','') : rec.field;

      /*=== data format ===*/
      let dataFormat = ((rec.editorOptions !== undefined) && (rec.editorOptions.displayFormat !== undefined)) ?
        rec.editorOptions.displayFormat : null;
      
      let allowFiltering = (rec.allowFilter !== undefined) && (rec.allowFilter) ? true : false;
        
      return (
        <Column key={rec.key}
          dataField={field} 
          caption={rec.label} 
          width={rec.width}
          alignment={rec.align}
          visible={rec.visible}
          dataType={rec.dataType}
          format={dataFormat}
          allowFiltering={allowFiltering}
        >
        </Column>
      );

    });

  }

  //**********************************************************/
  const dataGridJsx = () => {

    const boxWidth = compVar.tableWidth;

    const pagingVisible = (compVar.mainData.length > compVar.defaultPageSize) ? true : false;

    return (
      <div style={{height: '100%', width: boxWidth, display: 'flex', justifyContent: 'center'}}>

        <DataGrid 
          dataSource={compVar.mainData}
          keyExpr={compVar.keyExpr}
          rowAlternationEnabled={true}
          focusedRowEnabled={true}
          focusedRowKey={compVar.focusedRowKey}
          onFocusedRowChanged={onFocusedRowChanged}
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
            <Button text="Close" type="default" onClick={closePopup}/>
          </div>
          <div className="buttons-container">
            <Button text="Select" disabled={disabled} type="success" onClick={selectTrain}/>
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
    const maxContainerHeight = heights.containerHeight - 200;

    // size the grid container to the rows actually shown, instead of always
    // stretching to maxContainerHeight, so the buttons sit right below the data
    // mainData is only populated once getTrainListing resolves, so guard against
    // the pre-fetch render where it is still undefined
    const mainDataLength = (compVar.mainData !== undefined) ? compVar.mainData.length : 0;
    const pagingVisible = (mainDataLength > compVar.defaultPageSize) ? true : false;
    const numRows = Math.min(mainDataLength, compVar.defaultPageSize);
    const fittedHeight = MASTER_GRID_HEADER_HEIGHT + (numRows * MASTER_GRID_ROW_HEIGHT) + (pagingVisible ? MASTER_GRID_PAGER_HEIGHT : 0);
    const containerHeight = Math.min(fittedHeight, maxContainerHeight);

    const open = (props.open === undefined) ? true : props.open;
    
    return (
      <>
        <Popup visible={open} height={600} width={900} onHiding={closePopup}>

          {!dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched && 
            <>
              <div className="presto-trains-list-header">
                {compVar.cityText}
              </div>

              <hr/>

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

export default PrestoTrainsList;
