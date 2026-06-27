import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import { dbExecuteSp } from '../../../actions';
import {setFocusedRow, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {searchDataGridJsx, searchDataButtonJsx, searchDataGetColumnsJsx} from "../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Trains_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Train No", field: 'TrainNo', width: 80, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: true, editorOptions: {maxLength: 10}},  
    {key: 3, label: "Train", field: 'TrainName', width: 300, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 2, required: true, editorOptions: {maxLength: 100}},  
    {key: 21, label: "Wef", field: 'Wef', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 1, editorOptions: {displayFormat: 'dd/MM/yyyy'}, required: true},

  ];

let compVar = {};

function TrainListing (props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [],
      keyField: 'Trains_id',
      trains_id: -1, trainNo: '', trainName: '',
      tableWidth: 0,
    }   
        
    filterData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);  

  
  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    try {

      let sql = "EXEC p_TrainSearch '" + props.trainSearchStr + "',  " + 
        props.searchType.toString();
      let spData = {sql: sql, x_uid: props.users_id, x_module: 'Train Listing'}
      compVar.mainData = await dbExecuteSp(spData);

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

    /*=== No matches found ===*/
    if (compVar.mainData.length === 0) {
      closePopover();
    /*=== Single match found ===*/
    } else if (compVar.mainData.length === 1) {
      compVar.trains_id = compVar.mainData[0].Trains_id; 
      compVar.trainNo = compVar.mainData[0].TrainNo;
      compVar.trainName = compVar.mainData[0].TrainName;
      await selectTrain();
    }

  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const closePopover = async () => {    

    if (props.getSelectedTrain !== undefined) {
      await props.getSelectedTrain({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const selectTrain = async () => {    

    if (props.getSelectedTrain !== undefined) {
      await props.getSelectedTrain({
        open: false, refresh: true,
        trains_id: compVar.focusedRowKey,
        trainNo: compVar.trainNo,
        trainName: compVar.trainName
      });
    }    

  };  

  //**********************************************************/
  const onFocusedRowChanged = async (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data.Trains_id;

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;

        compVar.trains_id = id; 
        compVar.trainNo = e.row.data.TrainNo;
        compVar.trainName = e.row.data.TrainName;

        forceRender();
      }

    }

  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    const open = (props.open === undefined) ? true : props.open;

    const data = {
      keyExpr: 'Trains_id',
      maxPageSize: 9,
      boxWidth: 600,
      boxHeight: 420,
      getColumns: searchDataGetColumnsJsx(tableHeaderArray,compVar),
      onFocusedRowChanged: onFocusedRowChanged,
      closePopover: closePopover,
      onSelection: selectTrain
    }

    return (

      <Popup visible={open} height={640} width={900} onHiding={closePopover}>

        <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>

          {searchDataGridJsx(compVar, data)}
          {searchDataButtonJsx(data)}

        </div>

      </Popup>
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default TrainListing;

