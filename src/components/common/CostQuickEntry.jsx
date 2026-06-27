import React, { useEffect, useState } from 'react';
import DataGrid, {Column,Editing,Paging,FilterRow,KeyboardNavigation} from 'devextreme-react/data-grid';
import {Popup} from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import { getViewContainerHeights} from "./MasterGridHelpers";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {Button} from 'devextreme-react/button';
import { dbExecuteSp } from '../../actions';

import './MasterGrid.css'

let compVar = {};

function CostQuickEntry(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [data, setData] = useState([]);
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [], data: [],
      totalColumnWidth: 300, popupFormHeight: 550
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

    compVar.mainData = props.data;

    compVar.totalColumnWidth = props.headerData.filter(rec => rec.visible === true)
      .reduce((n, {width}) => n + width, 0);

    setData([...compVar.mainData]);
  
    setDataFetched(true);
  }

  //**********************************************************/
  const closePopover = async () => {
    compVar.displayPopup = false;

    if (props.onClose !== undefined) {
      await props.onClose({open: false})
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
  const handleCellValueChanged = (e) => {
    const updatedData = [...data];
    updatedData[e.dataIndex] = { ...e.data, [e.column.dataField]: e.value };
    setData(updatedData);
  };

  //**********************************************************/
  const saveDataToDb = async () => {

    // get the array of fields which were modifiable
    let fields = props.headerData.filter(rec => rec.allowEditing === true).map(a => a.field);    

    setDataFetched(false);

    for (const rec of data) {

      let query = 'UPDATE ' + props.tableName + " SET ";
      let fieldQuery = '';

      for (const fieldRec of fields) {
        if (rec[fieldRec] !== null) {
          fieldQuery += (fieldQuery.trim().length > 0) ? ', ' : '';        
          fieldQuery += fieldRec + " = " + rec[fieldRec].toString() + " ";  
        }
      }

      fieldQuery += ((props.auditString.trim().length > 0) ? ", " : " ") + props.auditString;

      if (fieldQuery.trim().length > 0) {

        query += fieldQuery + " WHERE " + props.keyField + " = " + rec[props.keyField];

        let spData = {sql: query}
        await dbExecuteSp(spData);  

        // Total query
        if (props.sqlTotal.trim().length > 0) {
          query = props.sqlTotal + " WHERE " + props.keyField + " = " + rec[props.keyField];
          spData = {sql: query}
          await dbExecuteSp(spData);  
        }

      }

    }

    setDataFetched(true);
      
    closePopover();
  }

  //**********************************************************/
  const buttonsJsx = () => {

    const buttonContainerStyle = {
      height: 60,
      width: compVar.totalColumnWidth,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    /*=== Called from tickets in DTD ===*/
    return (
      <>
        <div style={buttonContainerStyle}>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Close" type="default" onClick={closePopover}/>
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text={"Save"} disabled={false} type="success" onClick={saveDataToDb}/>
          </div>
        </div>
        </>
      )
    
  }

  //**********************************************************/
  const columnsJsx = () => {

    return props.headerData.map(rec => {
      const allowFilter = rec.allowFilter !== undefined && rec.allowFilter;
      return (
        <Column key={rec.field} dataField={rec.field} caption={rec.caption} width={rec.width} allowEditing={rec.allowEditing} visible={rec.visible} allowFiltering={allowFilter}/>
      )
    })  
  
  }

   //**********************************************************/
   const displayFilterRow = () => {

    const filterArr = props.headerData.map(rec => rec.allowFilter !== undefined && rec.allowFilter);

    return (filterArr.length > 0);
  
  }
 
  //**********************************************************/
  const renderContent = () => {

    const heights = getViewContainerHeights(compVar);
    let containerHeight = heights.containerHeight;
    containerHeight = compVar.popupFormHeight - 100;

    const gridHeight = (props.gridHeight !== undefined) ? props.gridHeight : null;
    const defaultPageSize = (props.defaultPageSize !== undefined) ? props.defaultPageSize : 11;

    const displayFilter = displayFilterRow();

    return (
      <div className="master-grid-container" style={{height: containerHeight, flexDirection: 'column', justifyContent: 'flex-start'}}>
        
        {!dataFetched && 
          <div className="master-grid-container" style={{height: containerHeight}}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        }

        {dataFetched &&

          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div className="master-grid-content-box" style={{display: 'flex', flex: 1, width: compVar.totalColumnWidth}}>
              <div>
                <DataGrid
                  dataSource={data}
                  showBorders={true}
                  onCellValueChanged={handleCellValueChanged}
                  height={gridHeight}
                >
                  <Editing mode="cell" allowUpdating={true} />
                  <FilterRow visible={displayFilter} />

                  {columnsJsx()}

                  <Paging defaultPageSize={defaultPageSize} />

                  <KeyboardNavigation
                    editOnKeyPress={true}
                    enterKeyAction="moveFocus"
                    enterKeyDirection="row"
                    cellTabInterval={0}
                  />                

                </DataGrid>                

              </div>
              {buttonsJsx()}
            </div>

          </div>
        }


      </div>
    );

  }

  return (
    <>
      <Popup visible={true} height={compVar.popupFormHeight} width={compVar.totalColumnWidth+100} onHiding={closePopover} title={props.title}>
        <ScrollView width='100%' height='100%' useNative={false}>
          {renderContent()}
        </ScrollView>
      </Popup>
    </>
  )


};

export default CostQuickEntry;
