import React, {useState, useEffect, useRef} from 'react';
import DataGrid, { Selection, Paging, FilterRow, Scrolling } from 'devextreme-react/data-grid';
import {DropDownBox} from 'devextreme-react/drop-down-box';

import './DropDownFormGrid.css';

function DropDownFormGrid(props) {

  const [renderToggle, setRenderToggle] = useState(false);
  const [gridOpened, setGridOpened] = useState(false);

  // each DropDownFormGrid instance on a form (one per lookup field) needs its
  // own state - a module-level compVar here would be shared by all of them
  const compVarRef = useRef({});
  const compVar = compVarRef.current;

  useEffect (() => {

    compVarRef.current.gridBoxValue = [];
    compVarRef.current.isGridBoxOpened = false;
    compVarRef.current.renderToggle = false;

    fetchInitialData();
    
    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);

  //**********************************************************/
  const fetchInitialData = () => {
    forceRender();
  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const updateFormValue = async (val) => {

    if (props.getSelectedRecord !== undefined) {
      await props.getSelectedRecord(val);
    }      
    
  }

  //**********************************************************/
  const onValueChanged = async (e) => {

    if (e.value === null) {
      compVar.gridBoxValue = [props.clearLookupValues];
      await updateFormValue([props.clearLookupValues]);
      forceRender();
      return;
    }

    // e.value here is always the scalar valueExpr key (not the full row, unlike
    // the grid's onSelectionChanged). Resolve it to the matching row so
    // gridBoxValue keeps the [{...}] shape the rest of this component expects.
    const matchedRow = (props.listArray || []).find(row => row[props.valueExpr] === e.value);

    if (matchedRow === undefined) {
      return;
    }

    compVar.gridBoxValue = [matchedRow];
    forceRender();

  }

  //**********************************************************/
  const dataGridOnSelectionChanged = async (e) => {

    compVar.gridBoxValue = e.selectedRowKeys;
    setGridOpened(false);

    await updateFormValue(e.selectedRowKeys);

  } 

  //**********************************************************/
  const onGridBoxOpened = (e) =>  {

    if (e.name === 'opened') {
      compVar.isGridBoxOpened = e.value;
      setGridOpened(e.value);
    }

  }

  //**********************************************************/
  const gridBoxDisplayExpr = () => {   

    if (compVar.gridBoxValue.length > 0) {
      return compVar.gridBoxValue[0][props.displayExpr];
    }
  }


  //**********************************************************/
  const dataGridRender = () => {

    const columnMinWidth = (props.columnMinWidth === undefined) ? 50 : props.columnMinWidth;
    const pageSize = (props.pageSize === undefined) ? 10 : props.pageSize;
    const pageEnabled = (props.pageEnabled === undefined) ? false : true;
    const showColumnHeaders = (props.showColumnHeaders === undefined) ? true : false;

    return (
        <DataGrid
          dataSource={props.listArray}
          columns={props.fieldList}
          selectedRows={compVar.gridBoxValue}
          onSelectionChanged={dataGridOnSelectionChanged}        
          height="100%"

          selectByClick={true}
          columnAutoWidth={true}
          columnMinWidth={columnMinWidth}
          showColumnHeaders={showColumnHeaders}
        >
          <Selection mode="single" />
          <Scrolling mode="virtual" />        
          <Paging enabled={pageEnabled} pageSize={pageSize} />
          <FilterRow visible={true} />
        </DataGrid>
    );
  }

  //**********************************************************/
  const renderContent = () => {

    if (compVar.gridBoxValue === undefined) {
      return (<React.Fragment></React.Fragment>)
    }

    let value = (compVar.gridBoxValue.length > 0) ? compVar.gridBoxValue[0][props.displayExpr] : props.initialValue[props.displayExpr];

    value = (compVar.gridBoxValue.length > 0) ? compVar.gridBoxValue[0][props.valueExpr] : props.initialValue[props.valueExpr];

    const divStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      flexDirection: 'row'
    };

    let dropDownStyle = {align: 'left', width: 400, padding: 0, fontSize: 16};
    if (props.style !== undefined) {
      dropDownStyle = {...dropDownStyle, ...props.style}
    }

/*
          displayExpr={gridBoxDisplayExpr}
*/

    return (
      <div style={divStyle}>
        <DropDownBox
          value={value}
          opened={gridOpened}
          valueExpr={props.valueExpr}
          displayExpr={props.displayExpr}
          showClearButton={true}
          dataSource={props.listArray}
          onValueChanged={onValueChanged}
          onOptionChanged={onGridBoxOpened}
          contentRender={dataGridRender}

          placeholder={props.placeholder}
          style={dropDownStyle}
          readOnly={props.readOnly}
        >
        </DropDownBox>
      </div> 

    );

  }

  return (
    renderContent()
  );

}

export default DropDownFormGrid;


