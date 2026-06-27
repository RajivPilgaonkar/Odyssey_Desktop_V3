import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import { dbGetRecord } from '../../../actions';
import {setFocusedRow, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {searchDataGridJsx, searchDataButtonJsx, searchDataGetColumnsJsx, getFieldsArray} from "../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'AdmUsers_id', width: 60, align: "left", dataType: 'number', visible: false, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Copy From User", field: 'UserName', width: 150, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, colSpan: 1, required: true, editorOptions: {maxLength: 50}},  

  ];

let compVar = {};

function AdmUserListing (props) {

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
      keyField: 'AdmUsers_id',
      admUsers_id: -1, admUser: '', 
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

    let fieldArray = getFieldsArray(tableHeaderArray);

    try {

      const whereStr = 'Active = 1';
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['UserName'], table: 'AdmUsers', where: whereStr});   

    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
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
  const closePopover = async () => {    

    if (props.getSelectedUser !== undefined) {
      await props.getSelectedUser({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const selectUser = async () => {    

    if (props.getSelectedUser !== undefined) {
      await props.getSelectedUser({
        open: false, refresh: true,
        admUsers_id: compVar.focusedRowKey
      });
    }    

  };  

  //**********************************************************/
  const onFocusedRowChanged = async (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data.AdmUsers_id;

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;

        compVar.admUsers_id = id; 

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
      keyExpr: 'AdmUsers_id',
      maxPageSize: 9,
      boxWidth: 400,
      boxHeight: 420,
      getColumns: searchDataGetColumnsJsx(tableHeaderArray,compVar),
      onFocusedRowChanged: onFocusedRowChanged,
      closePopover: closePopover,
      onSelection: selectUser
    }

    return (

      <Popup visible={open} height={640} width={700} onHiding={closePopover}>

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


export default AdmUserListing;

