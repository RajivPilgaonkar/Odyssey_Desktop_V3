import React, { useEffect, useState} from 'react';
import { dbGetRecordRaw } from '../../../../actions';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import {getViewContainerHeights} from "../../../common/MasterGridHelpers";
import {convert_DbDate_To_DMY, convertDMY_MDY} from "../../../common/CommonTransactionFunctions";

import '../../../common/MasterGrid.css'
import '../../../common/ButtonsPanel.css'

let compVar = {};

function VoucherSearchResults(props) {

  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  


  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      tourCodeField: '', tourDateField: '', pax: '', tourRef: '',
      dataSource: null, keyExpr: '', 
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

    getVoucherListing();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [props.searchText, props.searchType, props.numYears]);

  //**********************************************************/
  const getVoucherListing = async() => {

    setDataFetched(false);

    let query = "";
    let periodStr = "";
    
    if (props.searchType === 1) {
      if (props.numYears > 0) {
        periodStr = " AND DATEDIFF(year, q.startDate, GETDATE()) < 2 ";
      }
      
      query = "SELECT m.masters_id, m.mastercode, q.startDate, " + 
        "q.PaxName " + 
        "FROM masters m " + 
        "LEFT JOIN Quotations q ON m.mastercode = q.TourCode " + 
        "WHERE m.mastercode like '%" + props.searchText + "%' " +
        periodStr +
        "ORDER BY q.StartDate DESC";      

      compVar.tourCodeField = 'mastercode';
      compVar.tourDateField = 'startDate';
      compVar.paxNameField = 'PaxName';
      compVar.keyExpr = 'masters_id';
    } else if (props.searchType === 2) {
      if (props.numYears > 0) {
        periodStr = " AND DATEDIFF(year, v.MasterTourDate, GETDATE()) < 2 ";
      }

      query = "SELECT Vouchers_id, MasterTourCode, MasterTourDate, " + 
        "[description], TourLeader from vouchers v " + 
        "WHERE voucherNo = '" + props.searchText + "' " + 
        periodStr +
        "ORDER BY voucherdate DESC ";

        compVar.tourCodeField = 'MasterTourCode';
        compVar.tourDateField = 'MasterTourDate';
        compVar.paxNameField = 'TourLeader';
        compVar.keyExpr = 'Vouchers_id';
      } else  {
        if (props.numYears > 0) {
          periodStr = " AND DATEDIFF(year, q.startDate, GETDATE()) < 2 ";
        }
  
        query = "SELECT m.masters_id, m.mastercode, q.startDate, " + 
          "q.PaxName " + 
          "FROM masters m " + 
          "LEFT JOIN Quotations q ON m.mastercode = q.TourCode " + 
          "WHERE q.PaxName like '%" + props.searchText + "%' " +
          periodStr +
          "ORDER BY q.StartDate DESC";      

        compVar.tourCodeField = 'mastercode';
        compVar.tourDateField = 'startDate';
        compVar.paxNameField = 'PaxName';
        compVar.keyExpr = 'masters_id';
    } 

    let queryObj = await dbGetRecordRaw({query: query });
    queryObj = queryObj.map(rec => ({...rec, [compVar.tourDateField]: rec[compVar.tourDateField].replace('T', ' ').replace('Z', '')}) );    

console.log('queryObj',queryObj);    

    compVar.dataSource = queryObj;

    // no records found, then close
    if (queryObj.length === 0) {
      if (props.getSelectedVoucherSearchOption !== undefined) {
        await props.getSelectedVoucherSearchOption({open: false, refresh: false});
      }      
      compVar.focusedRowKey = -1;
    // one record found
    } else if (queryObj.length === 1) {
      const tourCode = queryObj[0][compVar.tourCodeField];
      const tourDate = convert_DbDate_To_DMY(queryObj[0][compVar.tourDateField],1);
      const paxName = queryObj[0][compVar.paxNameField];
      const tourRefObj = await getTourRef (tourCode, tourDate);      
      const tourRef = tourRefObj.tourRef;
      if (props.getSelectedVoucherSearchOption !== undefined) {
        await props.getSelectedVoucherSearchOption({
          open: false, refresh: true, 
          tourCode: tourCode, tourDate: tourDate, pax: paxName,
          tourRef: tourRef, id: queryObj[0][compVar.keyExpr]
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
    if (props.getSelectedVoucherSearchOption !== undefined) {
      await props.getSelectedVoucherSearchOption({open: false, refresh: false});
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
      if (props.searchType === 1) {
        compVar.focusedRowKey = e.row.data.masters_id;
      } else if (props.searchType === 2) {
        compVar.focusedRowKey = e.row.data.Vouchers_id;
      } else {
        compVar.focusedRowKey = e.row.data.masters_id;
      }

      forceRender();

    }

  }

  //**********************************************************/
  const selectVoucher = async () => {     
    
    const selectedVoucher = await getSelectedVoucher();

    /*=== get the tour Reference ===*/
    const tourRefObj = await getTourRef (selectedVoucher.tourCode, selectedVoucher.tourDate);      
    const tourRef = tourRefObj.tourRef;

    if (props.getSelectedVoucherSearchOption !== undefined) {
      await props.getSelectedVoucherSearchOption({
        open: false, refresh: true, 
        tourCode: selectedVoucher.tourCode, 
        tourDate: selectedVoucher.tourDate,
        pax: selectedVoucher.pax,
        tourRef: tourRef
      });
    }    
    
  };  

  //**********************************************************/
  const getSelectedVoucher = async () => {    

    const selectedVoucher = compVar.dataSource.filter(rec => (rec[compVar.keyExpr] === compVar.focusedRowKey));

    let tourCode = '';
    let tourDate = '';
    let pax = '';
    let tourRef = '';
    let tourRefObj = {};

    if (props.searchType === 1) {
      tourCode = selectedVoucher[0].mastercode;
      tourDate = convert_DbDate_To_DMY(selectedVoucher[0].startDate,1);
      pax = selectedVoucher[0].PaxName;
      tourRefObj = await getTourRef (tourCode, tourDate);      
      tourRef = tourRefObj.tourRef;
    } else if (props.searchType === 2) {
      tourCode = selectedVoucher[0].MasterTourCode;
      tourDate = convert_DbDate_To_DMY(selectedVoucher[0].MasterTourDate,1);
      pax = selectedVoucher[0].TourLeader;
      tourRefObj = await getTourRef (tourCode, tourDate);      
      tourRef = tourRefObj.tourRef;
    } else {
      tourCode = selectedVoucher[0].mastercode;
      tourDate = convert_DbDate_To_DMY(selectedVoucher[0].startDate,1);
      pax = selectedVoucher[0].PaxName;
      tourRefObj = await getTourRef (tourCode, tourDate);      
      tourRef = tourRefObj.tourRef;
    }

    compVar.tourRef = tourRef;

    return {tourCode: tourCode, tourDate: tourDate, pax: pax, tourRef: tourRef};

  };  

  //**********************************************************/
  const getTourRef = async (tourCode, tourDate) => {

    const xTourDate = convertDMY_MDY(tourDate);

    const query = "SELECT tourref FROM vouchers " + 
      "WHERE mastertourcode = '" + tourCode + "' " +
      "AND mastertourdate = '" + xTourDate + "' " +
      "AND pax > 0 " +
      "AND COALESCE(tourref,'') > '' " +
      "ORDER BY voucherno";      

    const tourRefObj = {tourRef: ''};

    const tourRef = await dbGetRecordRaw({query: query });
    if (tourRef.length > 0) {
      tourRefObj.tourRef = tourRef[0].tourref;
    }

    return tourRefObj;

  }

  //**********************************************************/
  const getColumns = () => {

    let tableHeaderArray = [];

    if (props.searchType === 1) {
      tableHeaderArray = 
        [ {key: 1, label: "masters_id", field: 'masters_id', width: 60, align: "left", dataType: 'number', visible: false},
          {key: 2, label: "Tour Code", field: 'mastercode', width: 100, align: "center", dataType: 'string', visible: true},  
          {key: 3, label: "Tour Date", field: 'startDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
          {key: 4, label: "Party", field: 'PaxName', width: 250, align: "left", dataType: 'string', visible: true},
        ];
    } else if (props.searchType === 2) {
      tableHeaderArray = 
        [ {key: 1, label: "Vouchers_id", field: 'Vouchers_id', width: 60, align: "left", dataType: 'number', visible: false},
          {key: 2, label: "Tour Code", field: 'MasterTourCode', width: 100, align: "center", dataType: 'string', visible: true},  
          {key: 3, label: "Tour Date", field: 'MasterTourDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
          {key: 4, label: "Party", field: 'TourLeader', width: 250, align: "left", dataType: 'string', visible: true},
        ];
    } else if (props.searchType === 3) {
      tableHeaderArray = 
        [ {key: 1, label: "masters_id", field: 'masters_id', width: 60, align: "left", dataType: 'number', visible: false},
          {key: 2, label: "Tour Code", field: 'mastercode', width: 100, align: "center", dataType: 'string', visible: true},  
          {key: 3, label: "Tour Date", field: 'startDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
          {key: 4, label: "Party", field: 'PaxName', width: 250, align: "left", dataType: 'string', visible: true},
        ];
    };

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
            <Button text="OK" disabled={disabled} type="success" onClick={selectVoucher}/>
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

export default VoucherSearchResults;
