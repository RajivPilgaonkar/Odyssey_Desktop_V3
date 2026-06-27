import React, {useState, useEffect} from 'react';
import DataGrid, { Selection, Paging, FilterRow, Scrolling } from 'devextreme-react/data-grid';
import DropDownBox from 'devextreme-react/drop-down-box';

let compVar = {}

function DropDownGrid(props) {

  const [renderToggle, setRenderToggle] = useState(false);  
  const [gridBoxOpened, setGridBoxOpened] = useState(false);  

  //**********************************************************/
  useEffect (() => {

    compVar = {
      renderToggle: false
    }   

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
  const dataGridOnSelectionChanged = async (e) => {

    // close the opened grid
    setGridBoxOpened(false);

    // set the selected record in the calling function ...
    // ... which will change the state and cause a refresh with new values
    if (props.getSelectedRecord !== undefined) {
      await props.getSelectedRecord(e.selectedRowKeys);
    }
                    
  } 

  //**********************************************************/
  const onGridBoxOpened = (e) =>  {
    if (e.name === 'opened') {
      setGridBoxOpened(e.value);
    }
  }

  //**********************************************************/
  const dataGridRender = () => {

    const columnMinWidth = (props.columnMinWidth === undefined) ? 50 : props.columnMinWidth;
    const pageSize = (props.pageSize === undefined) ? 10 : props.pageSize;
    const pageEnabled = (props.pageEnabled === undefined) ? false : true;
    const showColumnHeaders = (props.showColumnHeaders === undefined) ? true : false;

    const columnAutoWidth = (props.columnAutoWidth !== undefined) ? props.columnAutoWidth : true;

    return (
      <DataGrid
        dataSource={props.listArray}
        columns={props.fieldList}
        height="100%"
        selectByClick={true}
        columnAutoWidth={columnAutoWidth}
        columnMinWidth={columnMinWidth}
        onSelectionChanged={dataGridOnSelectionChanged}        
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

    let labelStyle = {align: 'right', paddingRight: 10, fontSize: 16, display: 'flex', flex: 0.5, justifyContent: 'flex-end'};
    if (props.labelStyle !== undefined) {
      labelStyle = {...labelStyle, ...props.labelStyle}
    }
    
    let dropDownStyle = {align: 'left', width: 400, padding: 0, fontSize: 16, flex: 1};
    if (props.dropDownStyle !== undefined) {
      dropDownStyle = {...dropDownStyle, ...props.dropDownStyle}
    }

    let dropDownOptions = null;
    if (props.dropDownOptions !== undefined) {
      dropDownOptions = {...props.dropDownOptions}
    }

    return (
      <>
      <div style={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>

        <div className="dx-field-label" style={labelStyle}>{props.label}</div>
        <div style={{flex: 1, display: 'flex', alignItems: 'center'}}>
          <DropDownBox
            valueExpr={props.valueExpr}
            displayExpr={props.displayExpr}
            placeholder={props.placeholder}
            dataSource={props.listArray}
            contentRender={dataGridRender}
            opened={gridBoxOpened}
            onOptionChanged={onGridBoxOpened}
            value={props.value}    
            style={dropDownStyle}
            dropDownOptions={dropDownOptions}
          />
        </div>

      </div>
      </> 

    );

  }

  return (
    renderContent()
  );

}

export default DropDownGrid;


