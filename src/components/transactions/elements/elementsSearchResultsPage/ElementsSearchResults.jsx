import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {Popup} from 'devextreme-react/popup';
import { dbGetRecord, dbGetRecordRaw, dbExecuteSp } from '../../../../actions';
import {setFocusedRow} from "../../../common/MasterGridHelpers";
import {searchDataGridJsx, searchDataButtonJsx, searchDataGetColumnsJsx, convertDMY_MDY} from "../../../common/CommonTransactionFunctions";
import {getCityName} from "../../../common/GetDescFromIds";
import DropDownGrid from "../../../common/DropDownGrid";
import DropDownButton from 'devextreme-react/drop-down-button';
import { LoadIndicator } from 'devextreme-react/load-indicator';

export const keyExprs = ['FixedItin_id','QuoLines_id','Elements_id'];

export const tableHeaderArray = 
  [ 
    [ {key: 1, label: "ID", field: 'FixedItin_id', width: 60, align: "left", dataType: 'number', visible: true, allowFilter: false},
      {key: 2, label: "Details", field: 'Title', width: 300, align: "left", dataType: 'string', visible: true, allowFilter: true},  
      {key: 3, label: "Code", field: 'QuotationRef', width: 80, align: "center", dataType: 'string', visible: true, allowFilter: true},  
    ],
    [ {key: 1, label: "ID", field: 'QuoLines_id', width: 60, align: "left", dataType: 'number', visible: true, allowFilter: false},
      {key: 2, label: "Date", field: 'QuoDate', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
      {key: 3, label: "Details", field: 'QuoStringPax', width: 300, align: "left", dataType: 'string', visible: true, allowFilter: true},  
      {key: 4, label: "Quote", field: 'QuoteCost', width: 120, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0', format: '#,##0'}, showZeroAsBlanks: true},
    ],
    [ {key: 1, label: "ID", field: 'Elements_id', width: 60, align: "left", dataType: 'number', visible: true},
      {key: 3, label: "Details", field: 'Details', width: 300, align: "left", dataType: 'string', visible: true, allowFilter: true},
      {key: 4, label: "Wef", field: 'Wef', width: 100, align: "center", dataType: 'date', visible: true, editorOptions: {displayFormat: 'dd/MM/yyyy'}},
      {key: 5, label: "Cost Per Pax", field: 'Cost', width: 120, align: "right", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0, editorOptions: {displayFormat: '#,##0.00', format: '#,##0.00'}, showZeroAsBlanks: true},
    ]
  ];

export const elementTypes = 
  [
    {id: 0, type: 0, text: 'Modules', elementField: 'FixedItin_id', index: 0},
    {id: 1, type: 1, text: 'Accommodation', elementField: 'ElemAccommodation_id', index: 2},
    {id: 2, type: 2, text: 'Sightseeing', elementField: 'ElemServices_id', index: 2},
    {id: 3, type: 3, text: 'Transfers', elementField: 'ElemServices_id', index: 2},
    {id: 4, type: 4, text: 'Car Per Km', elementField: 'ElemCars_id', index: 2},
    {id: 5, type: 5, text: 'Car P2P (Intercity)', elementField: 'ElemIntercities_id', index: 2},
    {id: 6, type: 6, text: 'Car City Groups', elementField: 'ElemCityGroups_id', index: 2},
    {id: 7, type: 7, text: 'Trains', elementField: 'ElemTickets_id', index: 2},
    {id: 8, type: 8, text: 'Packages', elementField: 'ElemPackages_id', index: 2},
    {id: 9, type: 9, text: 'Extra Day Car Hire', elementField: 'ElemExtraDayCarHire_id', index: 2},
    {id: 20, type: 20, text: 'Presto', elementField: 'QuoLines_id', index: 1},
  ];

let compVar = {};

function ElementsSearchResults (props) {

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
      mainData: [], allData: [], cityLookup: [],
      elementType: elementTypes[0].id, elementLabel: elementTypes[0].text,
      keyField: 'FixedItin_id',
      keyExpr: keyExprs[0],
      keyIndex: 0, message: '',
      focusedRowKey: -1, cities_id: -1, city: '', dataModified: false,
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

    compVar.cityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities'});   

    try {
      await getElementListing();
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);

  }

  //**********************************************************/
  const getElementListing = async () => {

    let query = '';
        
    if (compVar.elementType === 0) {      
      query = "SELECT FixedItin_id,Title,QuotationRef " + 
        "FROM FixedItin m " + 
        "WHERE Addressbook_id = 2137 " +
        "ORDER BY OrderNo";
    } else if (compVar.elementType === 20) {      
      query = "SELECT QuoLines_id, QuoDate, QuoStringPax, QuoteCost " + 
        "FROM QuoLines " + 
        "WHERE Quotations_id = " + props.quotations_id.toString() + " " +
        "ORDER BY LineNum";
    } else {

      const tourDate = convertDMY_MDY(props.tourDate);

      query = "EXEC [dbo].[p_ElementListing] '" + tourDate + 
        "', " + compVar.elementType.toString() + ", " + 
        props.numPax.toString();
    } 

    compVar.allData = await dbGetRecordRaw({query: query });

    if (compVar.allData.length > 0) {
      compVar.focusedRowKey = compVar.allData[0][compVar.keyExpr];

      if ((compVar.elementType > 0) && (compVar.elementType < 20)) {
        const idx = compVar.allData.findIndex(rec => rec.Cities_id === compVar.cities_id);
        if (idx < 0) {
          compVar.cities_id = compVar.allData[0].Cities_id;
          const cityObj = await getCityName(compVar.cities_id);
          compVar.city = cityObj.City;
        }  
      }

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

    const dataRefresh = (compVar.dataModified) ? true : false;

    if (props.getSelectedElementSearchOption !== undefined) {
      await props.getSelectedElementSearchOption({open: false, refresh: dataRefresh});
    }    

  };  

  //**********************************************************/
  const selectElement = async () => {    

    const selectedElement = compVar.allData.filter(rec => (rec[compVar.keyExpr] === compVar.focusedRowKey));
    
    if (selectedElement.length > 0 && compVar.elementType !== 20) {

      const elementField = compVar.keyExpr;
      const details = (compVar.elementType === 0) ? selectedElement[0].Title : selectedElement[0].Details;

      let sql = "EXEC [p_ImportElementsIntoModules] " + 
        props.quoModules_id.toString() + ", " +
        compVar.elementType.toString() + ", " +
        selectedElement[0][elementField] + ", " +
        props.numPax.toString() + ", '" +
        details + "', " +
        _g_users_id.toString() + "";

      let spData = {sql: sql};
      await dbExecuteSp(spData);

      compVar.dataModified = true;
      compVar.message = details + ' was imported';
      forceRender();

    } else if (selectedElement.length > 0 && compVar.elementType === 20) {

      const details = selectedElement[0].QuoStringPax;
      const quoLines_id = selectedElement[0].QuoLines_id;

      let sql = "EXEC [p_ImportElementsIntoModules_FromQuo] " + 
        props.quoModules_id.toString() + ", " +
        quoLines_id.toString() + ", " +
        props.numPax.toString() + ", " +
        _g_users_id.toString() + "";

      let spData = {sql: sql};
      await dbExecuteSp(spData);

      compVar.dataModified = true;
      compVar.message = details + ' was imported';
      forceRender();
    }

  };  

  //**********************************************************/
  const onFocusedRowChanged = async (e) => {

    if (e.row !== undefined) {

      if (compVar.allData.length > 0) {
        const fieldName = keyExprs[compVar.keyIndex];
        compVar.focusedRowKey = e.row.data[fieldName];

        forceRender();

      }

    }

  }

  //*********************************************************/
  const onElementTypeClick = async(e) => {
    compVar.elementType = e.itemData.type;
    compVar.elementLabel = e.itemData.text;
    compVar.keyIndex = e.itemData.index;
    compVar.keyExpr = keyExprs[compVar.keyIndex];

    setDataFetched(false);
    await getElementListing();
    setDataFetched(true);

    forceRender();
  }

  //*********************************************************/
  const getSelectedCity = (e) => {
    compVar.cities_id = e[0].cities_id;
    compVar.city = e[0].city;
    forceRender();
  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = [compVar.elementLabel];
    const icons = ['exportxlsx']
    const widths = [180];
    const dropDownOptions = [{width: 200}];
    const items = [elementTypes];
    const onItemClicks = [onElementTypeClick];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={"id"}
        displayExpr={"text"}
        onItemClick={onItemClick}
      />
    )

  }

  //**********************************************************/
  const dropDownParamsJsx = (index) => {

    const lookups = [compVar.cityLookup];
    const fieldLists = [['city']];
    const valueExprs = ['cities_id'];
    const displayExprs = ['city'];
    const labels = ['City'];
    const placeholders = ["Select a City..."];
    const getSelectedRecs = [getSelectedCity];
    const values = [compVar.city];
    const componentWidths = [270];
    const dropDownWidths = [500];
    const labelStyles = [{width: 80, flex: 0.15}] 

    const lookup = lookups[index];
    const fieldList = fieldLists[index];
    const valueExpr = valueExprs[index];
    const displayExpr = displayExprs[index];
    const label = labels[index];
    const placeholder = placeholders[index];
    const getSelectedRec = getSelectedRecs[index];
    const value = values[index];
    const componentWidth = componentWidths[index];
    const dropDownWidth = dropDownWidths[index];
    const labelStyle = labelStyles[index]; 
    
    return (
        <DropDownGrid
          listArray={lookup}
          fieldList={fieldList}
          valueExpr={valueExpr}
          displayExpr={displayExpr}
          label={label}
          placeholder={placeholder}
          getSelectedRecord={getSelectedRec}
          showColumnHeaders={false}
          value={value}
          labelStyle={labelStyle}
          dropDownStyle={{width: componentWidth}}
          dropDownOptions={{width: dropDownWidth, flexGrow:1}}
        />  
    );

  }

  //**********************************************************/
  const renderContent = () => {

    const open = (props.open === undefined) ? true : props.open;

    let data = null;

    if (compVar.elementType !== undefined) {

      if (compVar.elementType !== 0 && compVar.elementType < 20) {
        compVar.mainData = compVar.allData.filter(rec => rec.Cities_id === compVar.cities_id);
      } else {
        compVar.mainData = [...compVar.allData];
      }
  
      data = {
        keyExpr: compVar.keyExpr,
        maxPageSize: 9,
        boxWidth: 600,
        boxHeight: 420,
        getColumns: searchDataGetColumnsJsx(tableHeaderArray[compVar.keyIndex],compVar),
        onFocusedRowChanged: onFocusedRowChanged,
        closePopover: closePopover,
        onSelection: selectElement
      }
  
    }

    return (

      <Popup visible={open} height={640} width={900} onHiding={closePopover}>

        <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>

          <div style={{display: 'flex', flexDirection: 'row'}}>
            {compVar.elementType !== undefined &&
              <>
                {dropDownButtonJsx(0)}
                {compVar.elementType !== 0 && compVar.elementType !== 20 &&
                  dropDownParamsJsx(0)
                }
              </>
            }
          </div>

          <div style={{width: '100%', height: 10}}>
          </div>

          {!dataFetched &&
            <div className="master-grid-container" style={{height: 440}}>
              <LoadIndicator id="large-indicator" height={60} width={60} />
            </div>
          }

          {dataFetched &&
            <>
              {searchDataGridJsx(compVar, data)}
              {searchDataButtonJsx(data)}
            </>
          }

          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 10, color: 'red'}}>
            {compVar.message}
          </div>

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


export default ElementsSearchResults;

