import React, { useEffect, useState} from 'react';
import { dbGetRecordRaw, dbExecuteSp } from '../../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import {getViewContainerHeights, setFocusedRow} from "../../../../common/MasterGridHelpers";
import {getQuoTicketDriveDetails} from "../../../../common/PrestoHelpers";

import '../../../../common/MasterGrid.css'
import '../../../../common/ButtonsPanel.css'

let compVar = {};

function PrestoDriveViaList(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  


  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      quoTicketsCityCrossings_id: -1,
      keyExpr: 'QuoTicketsCityCrossings_id', 
      activeKey: null, hasChanged: false,
      remarks: '', remarksVia: '',
      tableWidth: 550, focusedRowKey: -1,
      defaultPageSize: 8
    }   

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
  const filterData = async() => {

    setDataFetched(false);

    try {

      const sql = "EXEC [dbo].[p_QuoInsertCityCrossings] " + 
        props.quoTickets_id.toString();
      const spData = {sql: sql};
      await dbExecuteSp(spData);  

      let query = "SELECT qtcc.QuoTicketsCityCrossings_id, qtcc.QuoTickets_id, " + 
        "qtcc.Cities_id, c.City, cc.Duration, qtcc.Selected " + 
        "FROM QuoTicketsCityCrossings qtcc " +
        "LEFT JOIN Cities c ON qtcc.Cities_id = c.Cities_id " + 
        "LEFT JOIN QuoTickets qt ON qtcc.QuoTickets_id = qt.QuoTickets_id " +
        "LEFT JOIN Distances d ON qt.From_Cities_id = d.from_cities_id AND qt.To_Cities_id = d.to_cities_id " +
        "LEFT JOIN CityCrossings cc ON d.distances_id = cc.Distances_id AND qtcc.Cities_id = cc.Cities_id " + 
        "WHERE qtcc.QuoTickets_id = " + props.quoTickets_id.toString() + " ";

        compVar.mainData = await dbGetRecordRaw({query: query});

        await setRemarks();
        
      } catch(err) {
        alert(err);
      }
      setFocusedRow(compVar);
      setDataFetched(true);

  }

  //**********************************************************/
  const setRemarks = async () => {    

    const query = "SELECT c1.City AS FromCity, c2.City AS ToCity, From_Cities_id, To_Cities_id " + 
                  "FROM QuoTickets qt " +
                  "LEFT JOIN Cities c1 ON qt.From_Cities_id = c1.Cities_id " +
                  "LEFT JOIN Cities c2 ON qt.To_Cities_id = c2.Cities_id " +
                  "WHERE QuoTickets_id = " + props.quoTickets_id.toString() + " ";

    const cityData = await dbGetRecordRaw({query: query});
    compVar.remarks = '';
    compVar.remarksVia = '';
    if (cityData.length > 0 && cityData[0].From_Cities_id !== null && cityData[0].To_Cities_id !== null) {
      const driveObj = await getQuoTicketDriveDetails(props.quoTickets_id.toString());
      compVar.remarks = cityData[0].FromCity + ' to ' + cityData[0].ToCity;
      compVar.remarksVia = driveObj.remarks;
    }

  }
    
  //**********************************************************/
  const closePopup = async () => {

    const refresh = compVar.hasChanged ? true : false;

    if (props.getSelectedDriveVia !== undefined) {
      await props.getSelectedDriveVia({open: false, refresh: refresh});
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
      compVar.focusedRowKey = e.row.data.QuoTicketsCityCrossings_id;

      forceRender();

    }

  }

  //**********************************************************/
  const updateDb = async (quoTicketsCityCrossings_id, selected) => {

    const selectedBit = selected ? 1 : 0;

    let sql = "UPDATE QuoTicketsCityCrossings " + 
      "SET Selected = " + selectedBit.toString() + " " +
      "WHERE QuoTicketsCityCrossings_id = " + quoTicketsCityCrossings_id.toString() + " ";
    let spData = {sql: sql};
    await dbExecuteSp(spData);

    await setRemarks();
    forceRender();

  }

  //**********************************************************/
  const onCellClick = async (e) => {    

    if (e.rowType === 'data' && e.column.dataField === 'Selected') {      
      const rec_id = e.data.QuoTicketsCityCrossings_id;

      const idx = compVar.mainData.findIndex(o => o.QuoTicketsCityCrossings_id === rec_id);

      if (idx >= 0) {
        compVar.mainData[idx].Selected = !compVar.mainData[idx].Selected;
        await updateDb(rec_id, compVar.mainData[idx].Selected);
        // otherwise even a render may not change the data as it would think the array data has not changed
        compVar.mainData = [...compVar.mainData];
        compVar.hasChanged = true;
      }

      forceRender();
    }
  }


  //**********************************************************/
  const getColumns = () => {

    const tableHeaderArray = 
    [ {key: 1, label: "ID", field: 'QuoTicketsCityCrossings_id', width: 80, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
      {key: 2, label: "QuoTickets_id", field: 'QuoTickets_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

      {key: 5, label: "City", field: 'Cities_id', width: 130, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},
      {key: 6, label: "City", field: 'City', width: 200, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0},
      {key: 7, label: "Duration", field: 'Duration', width: 120, align: "center", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0},
      {key: 8, label: "Selected", field: 'Selected', width: 100, align: "center", dataType: 'boolean', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, booleanText: ['Yes','No'], required: true},

    ];

    compVar.tableWidth = tableHeaderArray.filter(rec => rec.visible === true).reduce((acc, rec) => acc + rec.width, 0);

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
          onCellClick={onCellClick}
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

    return (
      <>
        <div className="buttons-panel-container">
          <div className="buttons-container">
            <Button text="Close" type="default" onClick={closePopup}/>
          </div>
        </div>
      </>
    )

  }

  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight - 300;

    const open = (props.open === undefined) ? true : props.open;
    
    return (
      <>
        <Popup visible={open} height={500} width={900} onHiding={closePopup}>

          {!dataFetched &&
            <div className="master-grid-container" style={{height: containerHeight}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched && 
            <>
              <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', background: '#cce6ff'}}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 20}}>
                  {compVar.remarks}
                </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 18}}>
                  {compVar.remarksVia}
                </div>
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

export default PrestoDriveViaList;
