import React, { useEffect, useState } from 'react';
import {Popup} from 'devextreme-react/popup';
import { dbExecuteSp } from '../../../actions';
import {setFocusedRow, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {searchDataGridJsx, searchDataButtonJsx, searchDataGetColumnsJsx} from "../../common/CommonTransactionFunctions";
import { LoadIndicator } from 'devextreme-react/load-indicator';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Bookings_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},

    {key: 2, label: "Pax", field: 'Pax', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 100}},  
    {key: 3, label: "Tour Code", field: 'TourCode', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 100}},  
    {key: 4, label: "Tour Date", field: 'TourDate', width: 110, align: "center", dataType: 'date', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
    {key: 5, label: "Reference", field: 'Reference', width: 100, align: "left", dataType: 'string', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, required: true, editorOptions: {maxLength: 100}},  

  ];

let compVar = {};

function BookingListing (props) {

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
      keyField: 'Bookings_id',
      bookings_id: -1, 
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

      let sql = "EXEC p_BookingSearchByType '" + props.bookingSearchStr + "',  " + 
        props.searchType.toString();
      let spData = {sql: sql, x_uid: props.users_id, x_module: 'Booking Listing'}
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
      compVar.bookings_id = compVar.mainData[0].Bookings_id; 
      await selectBooking();
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

    if (props.getSelectedBooking !== undefined) {
      await props.getSelectedBooking({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  const selectBooking = async () => {    

    if (props.getSelectedBooking !== undefined) {
      await props.getSelectedBooking({
        open: false, refresh: true,
        bookings_id: compVar.focusedRowKey
      });
    }    

  };  

  //**********************************************************/
  const onFocusedRowChanged = async (e) => {

    if (e.row !== undefined) {

      // !!! do not put await in onFocusedRowChanged code
      const id = e.row.data.Bookings_id;

      if (compVar.mainData.length > 0) {
        compVar.focusedRowKey = id;

        compVar.bookings_id = id; 

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
      keyExpr: 'Bookings_id',
      maxPageSize: 9,
      boxWidth: 600,
      boxHeight: 420,
      getColumns: searchDataGetColumnsJsx(tableHeaderArray,compVar),
      onFocusedRowChanged: onFocusedRowChanged,
      closePopover: closePopover,
      onSelection: selectBooking
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


export default BookingListing;

