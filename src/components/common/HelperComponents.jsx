import React from 'react';
import PopupDialogBox from "./PopupDialogBox";
import {DataGrid, SearchPanel, Editing, Paging, Pager, Column, Button, HeaderFilter, FilterRow, RowDragging, Selection} from 'devextreme-react/data-grid';
import { SpeedDialAction } from 'devextreme-react/speed-dial-action';
import { Toast } from 'devextreme-react/toast';
import { Popover } from 'devextreme-react/popover';
import {Button as Btn} from 'devextreme-react/button';
import { getGridColumns, getGridSummary } from "./CommonTransactionFunctions";
import { getTableWidth, getHiddenColWidth } from "./CommonFunctions";
import ScrollView from 'devextreme-react/scroll-view';
import { MASTER_GRID_NUM_ROWS} from '../../config/paths';


//**********************************************************/
export const dataGridEditing = (obj) => {

  const useIcons = (obj.useIcons === undefined) ? true : obj.useIcons;
  const allowUpdating = (obj.allowUpdating === undefined) ? true : obj.allowUpdating;
  const allowDeleting = (obj.allowDeleting === undefined) ? true : obj.allowDeleting;

  return (
    <Editing
      useIcons={useIcons}
      allowUpdating={allowUpdating}
      allowDeleting={allowDeleting}    
    />    
  )

}

//**********************************************************/
export const dataGridPaging = (obj) => {

  const enabled = (obj.enabled === undefined) ? true : obj.enabled;
  const defaultPageSize = (obj.defaultPageSize === undefined) ? MASTER_GRID_NUM_ROWS : obj.defaultPageSize;

  return (
    <Paging
      enabled={enabled}
      defaultPageSize={defaultPageSize}
      pageSize={defaultPageSize}
    />    
  )
  
}

//**********************************************************/
export const dataGridPager = (obj) => {

  const visible = (obj.visible === undefined) ? false : obj.visible;
  const displayMode = (obj.displayMode === undefined) ? 'full' : obj.displayMode;
  const showPageSizeSelector = (obj.showPageSizeSelector === undefined) ? false : obj.showPageSizeSelector;
  const showInfo = (obj.showInfo === undefined) ? false : obj.showInfo;
  const showNavigationButtons = (obj.showNavigationButtons === undefined) ? true : obj.showNavigationButtons;

  return (
    <Pager
      visible={visible}
      displayMode={displayMode}
      showPageSizeSelector={showPageSizeSelector}
      showInfo={showInfo}
      showNavigationButtons={showNavigationButtons}     
    />    
  )
  
}

//**********************************************************/
export const dataGridHederFilter = (obj) => {

  const headerFilterVisible = (obj.headerFilterVisible === undefined) ? false : obj.headerFilterVisible;

  return (
    <HeaderFilter  visible={headerFilterVisible} />
  )
  
}

//**********************************************************/
export const dataGridFilterRow = (obj) => {

  const filterRowVisible = (obj.filterRowVisible === undefined) ? false : obj.filterRowVisible;

  return (
    <FilterRow  visible={filterRowVisible} />
  )
  
}


//**********************************************************/
export const searchPanel = (obj) => {

  const searchPanelVisible = (obj.searchPanelVisible === undefined) ? false : obj.searchPanelVisible;
  const placeHolder = (obj.searchPanelPlaceHolder === undefined) ? "" : obj.searchPanelPlaceHolder;

  return (
    <SearchPanel visible={searchPanelVisible} placeholder={placeHolder}/>      

  )
  
}


//**********************************************************/
export const editDeleteButtons = (dataObj) => {

  const canEdit = ((dataObj.canModify === undefined) || dataObj.canModify);
  if (!canEdit) {
    return null;
  }

  const canDelete = ((dataObj.canDeleteRow === undefined) || dataObj.canDeleteRow);

  const buttonEdit = ((dataObj.canModify === undefined) || (dataObj.canModify === true)) ?
    <Button name="edit" onClick={dataObj.editRow}/> : null;

  const buttonDelete = (canDelete) ?
    <Button name="delete" onClick={dataObj.deleteRow}/> : null;

  return (
    <Column type="buttons" >
      {buttonEdit}
      {buttonDelete}
    </Column>          

  )
  
}

//**********************************************************/
export const speedDialAction = (dataObj, obj) => {

  const icon = (obj.icon === undefined) ? "add" : obj.icon;
  let label = (obj.label === undefined) ? "Add row" : obj.label;
  const index = (obj.index === undefined) ? 1 : obj.index;

  if (dataObj.addRowText !== undefined) {
    label = dataObj.addRowText;
  }

  return (
    <SpeedDialAction
          icon={icon}
          label={label}
          index={index}
          onClick={dataObj.addRow} 
          visible={dataObj.canAddRow} 
    />
  )
  
}

//**********************************************************/
export const gridSelection = (dataObj) => {

  if (dataObj.gridSelectRowKeys === undefined) {
    return null;
  }

  let mode = null;
  if (dataObj.gridSelectRowKeys.mode !== undefined) {
    mode = dataObj.gridSelectRowKeys.mode;
  }

  let selectAllMode = null;
  if (dataObj.gridSelectRowKeys.selectAllMode !== undefined) {
    selectAllMode = dataObj.gridSelectRowKeys.selectAllMode;
  }

  return (
    <Selection
          mode={mode}
          selectAllMode={selectAllMode}
    />
  )
  
}

//**********************************************************/
export function getDevExtremeStandardTable(headerArray, dataObj, superuser) {

  let width = getTableWidth(headerArray, superuser);

  let hiddenColWidth = 0;
  if (dataObj.overrideColumnVisibility !== undefined) {
    hiddenColWidth = getHiddenColWidth(headerArray, dataObj.overrideColumnVisibility);
    width += hiddenColWidth;
  }

  //let allowDelete = superuser;
  let allowUpdate = ((dataObj.canModify === undefined) || dataObj.canModify);
  let allowDelete = ((dataObj.canDeleteRow === undefined) || dataObj.canDeleteRow);
  let defaultPageSize = (dataObj.defaultPageSize !== undefined) ? dataObj.defaultPageSize : (dataObj.displayGridFilterRow ? MASTER_GRID_NUM_ROWS-1 : MASTER_GRID_NUM_ROWS);
  let displayPager = (dataObj.data.length > defaultPageSize) ? true: false;  

  // if in row-dragging mode (for reordering), do not allow edit/delete
  allowUpdate = (allowUpdate && dataObj.rowDragging !== undefined) ? !dataObj.rowDragging: allowUpdate;
  allowDelete = (dataObj.rowDragging !== undefined) ? !dataObj.rowDragging: allowDelete;

  if (!allowUpdate) {
    width -= 40;
  }

  //if (!allowDelete) {
  //  width -= 40;
  //}

  if (dataObj.gridSelectRowKeys !== undefined) {
    width += 80;
  }

  const headerFilterVisible = (dataObj.headerFilterVisible !== undefined) ? dataObj.headerFilterVisible : false;

  //const dialogBoxJsx = dialogBox(dataObj);
  const dataGridEditingJsx = dataGridEditing({allowDeleting: allowDelete, allowUpdating: allowUpdate});
  const dataGridPagingJsx = dataGridPaging({enabled: displayPager, defaultPageSize: defaultPageSize});
  const dataGridPagerJsx = dataGridPager({visible: displayPager, defaultPageSize: defaultPageSize});
  const dataGridHederFilterJsx = dataGridHederFilter({headerFilterVisible: headerFilterVisible });
  const dataGridFilterRowJsx = dataGridFilterRow({filterRowVisible: dataObj.filterRowVisible});
  const editDeleteButtonsJsx = editDeleteButtons(dataObj);
  const speedDialActionJsx = speedDialAction(dataObj,{label: "Add row"})
  const gridSelectionJsx = gridSelection(dataObj);
  const searchPanelJsx = searchPanel(dataObj);
  const dataGridHeight = (dataObj.gridHeight !== undefined) ? dataObj.gridHeight : null;
  
  const focusedRowKey = (dataObj.focusedRowKey > -1) ? {focusedRowKey: dataObj.focusedRowKey} : {};

  //const filterValue = (dataObj.initialFilterValue !== undefined) ? {defaultFilterValue: dataObj.initialFilterValue} : {};
  const gridOptionChanged = (dataObj.gridOptionChanged !== undefined) ? dataObj.gridOptionChanged : null;

  const onFocusedRowChanged = (dataObj.onFocusedRowChanged !== undefined) ? dataObj.onFocusedRowChanged : null;
  const onRowClick = (dataObj.onRowClick !== undefined) ? dataObj.onRowClick : null;
  const onRowPrepared = (dataObj.onRowPrepared !== undefined) ? dataObj.onRowPrepared : null;
  const onCellPrepared = (dataObj.onCellPrepared !== undefined) ? dataObj.onCellPrepared : null;
  const wordWrapEnabled = (dataObj.wordWrapEnabled !== undefined) ? dataObj.wordWrapEnabled : null;

  const focusedRowEnabled = (dataObj.focusedRowEnabled !== undefined) ? dataObj.focusedRowEnabled : true;

  const onCellClick = (dataObj.onCellClick !== undefined) ? dataObj.onCellClick : null;

  const onContextMenuPreparing = (dataObj.onContextMenuPreparing !== undefined) ? dataObj.onContextMenuPreparing : null;

  const selectedRowKeys = (dataObj.gridSelectRowKeys !== undefined && dataObj.gridSelectRowKeys.selectedRowKeys !== undefined) ? dataObj.gridSelectRowKeys.selectedRowKeys : null;

  const rowAlternationEnabled = (dataObj.rowAlternationEnabled !== undefined) ? dataObj.rowAlternationEnabled : true;

  const key = (dataObj.gridId !== undefined) ? "gridContainer"+dataObj.gridId : "gridContainer";

  /*=== rowDragging ===*/
  let rowDraggingJsx = null;
  if ((dataObj.rowDragging !== undefined) && (dataObj.rowDragging)) {
    rowDraggingJsx = 
      <RowDragging
        allowReordering={dataObj.rowDragging}
        onReorder={dataObj.onReorder}
        showDragIcons={true}
        dropFeedbackMode="push"
      />
  }

/*
    {1===2 && dialogBoxJsx}
*/

  return (

    <React.Fragment>

    <DataGrid 
      ref={dataObj.gridRef}
      id={key}
      dataSource={dataObj.data}
      keyExpr={dataObj.keyExpr}
      height={dataGridHeight}
      allowColumnReordering={true}
      allowColumnResizing={true}
      showColumnLines={true}
      showRowLines={true}
      rowAlternationEnabled={rowAlternationEnabled}
      width={width}
      focusedRowEnabled={focusedRowEnabled}      
      selectedRowKeys={selectedRowKeys}
      onOptionChanged={gridOptionChanged}
      //{...filterValue}
      {...focusedRowKey} // this has to be done differently, as if focusRowKey={null} gives problems 
      onRowClick={onRowClick}
      onFocusedRowChanged={onFocusedRowChanged}
      onRowPrepared={onRowPrepared}
      onCellPrepared={onCellPrepared}
      onContextMenuPreparing={onContextMenuPreparing}
      onCellClick={onCellClick}
      wordWrapEnabled={wordWrapEnabled}
    >      

      {rowDraggingJsx}

      {dataGridEditingJsx}

      {dataGridPagingJsx}

      {dataGridPagerJsx}

      {searchPanelJsx}

      {dataGridHederFilterJsx}

      {dataGridFilterRowJsx}

      {gridSelectionJsx}

      {/*<HeaderFilter visible={true} />*/}

      {getGridColumns(headerArray, dataObj.dbLookup, dataObj)}

      {getGridSummary(headerArray)}

      {editDeleteButtonsJsx}

    </DataGrid>

    {speedDialActionJsx}

    </React.Fragment>

  );
}


//**********************************************************/
export const popupTitle = (formObj, popupTitleContainerStyle) => {

  let overrideStyle = {}
  if (!formObj.errorMsg)  {
    overrideStyle={display: 'none'}
  }

  overrideStyle = {...popupTitleContainerStyle, ...overrideStyle};

  return (
      <div style={overrideStyle}>
        {formObj.errorMsg}
      </div>  
  )

}

//**********************************************************/
export const popupFooter = (formObj, popupFooterButtonContainerStyle, obj) => {

  const helpVisible = (formObj.formHelp === null) ? false : true;

  const btnObjArray = [
    {id: "formSaveButton", text: "Save", type: "success", visible: true, onClick: formObj.saveFormData},
    {id: "formHintButton", text: "Hint", type: "normal", visible: true, onClick: formObj.showHintData},
    {id: "formHelpButton", text: "Help", type: "normal", visible: helpVisible, icon: "help", onClick: formObj.showHelpData}
  ];

  let btnArray = [];
  for (let i=0; i<btnObjArray.length; i++) {
    let changedObj = ((obj === undefined) || (obj.length === 0)) ? {} : obj[i];
    btnArray.push({...btnObjArray[i],...changedObj});
  }

  const showNavigation = ((formObj.displayNavigateButtons !== undefined) && (formObj.displayNavigateButtons));
  
  const popover = 
      <Popover      
        target={'#formHelpButton'}
        position="top"
        width={1000}
        visible={formObj.popoverVisible}
      >
        <ScrollView width='100%' height='100%' showScrollbar="always" useNative={false}>
        {formObj.formHelp}
        </ScrollView>
      </Popover>

/*
  <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
  <Btn {...btnArray[3]} />
  <Btn {...btnArray[4]} />
  <div style={{paddingLeft: 20}}>
    <Btn {...btnArray[5]} />
  </div>
</div>
*/

  return (
    <div style={popupFooterButtonContainerStyle}>
      <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start'}}>
        <Btn
          {...btnArray[1]}
        />
        <Btn
          {...btnArray[2]}
        />
          {popover}
      </div>
      { showNavigation &&
        formObj.navigationControlsJsx()
      }
      <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>
        <Btn
          {...btnArray[0]}
        />
      </div>
    </div>        
  )

}


//**********************************************************/
export const toast = (formObj, toastContainerStyle, obj) => {

  const type = (obj.type === undefined) ? "info" : obj.type;
  const displayTime = (obj.displayTime === undefined) ? 3000 : obj.displayTime;
  const maxWidth = (obj.maxWidth === undefined) ? 300 : obj.maxWidth;
  const position = (obj.position === undefined) ? "center" : obj.position;

  if (!formObj.toastIsVisible) return null;

  return (
      <div style={toastContainerStyle}>
        <Toast
          visible={formObj.toastIsVisible}
          message={formObj.toastMessage}
          type={type}
          onHiding={formObj.onToastHiding}
          displayTime={displayTime}
          maxWidth={maxWidth}
          position={position}
        />
       </div>
  )

}

//**********************************************************/
export const popupDialogBox = (obj) => {

  return (
    <PopupDialogBox
      open={true}
      getSelectedOption={obj.getSelectedOption}
      message1={obj.dialogMessage1}
      message2={obj.dialogMessage2}
    />    
  )
      

}
