import { MASTER_GRID_HEADER_HEIGHT, MASTER_GRID_PAGER_HEIGHT, MASTER_GRID_ROW_HEIGHT,
         HEADER_HEIGHT, MASTER_GRID_TITLE_HEIGHT, MASTER_GRID_ERROR_HEIGHT} from '../../config/paths';

//**********************************************************/
export const getDefaultDataObject = ({compVar, viewHeight, gridRef}) => {

  let defaultPageSize = Math.floor((viewHeight - MASTER_GRID_HEADER_HEIGHT - MASTER_GRID_PAGER_HEIGHT) / MASTER_GRID_ROW_HEIGHT);

  defaultPageSize = compVar.displayGridFilterRow ? defaultPageSize - 1 : defaultPageSize;

  //const gridHeight = (compVar.mainData.length > (MASTER_GRID_NUM_ROWS - (compVar.displayGridFilterRow ? 1 : 0))) ? viewHeight : null;
  const gridHeight = (compVar.rowDragging !== undefined && compVar.mainData.length > defaultPageSize) ? viewHeight : null;

  const rowDragging = (compVar.rowDragging !== undefined && compVar.rowDragging !== null) ? compVar.rowDragging : false;
  const onReorder = (compVar.onReorder !== undefined && compVar.onReorder !== null) ? compVar.onReorder : null;

  const data = (rowDragging) ? compVar.clonedMainData : compVar.mainData;

  return { 
    data: data,
    keyExpr: compVar.keyField,
    gridRef: gridRef,
    dbLookup: [],
    canAddRow: false, // dont display floating add button
    canDeleteRow: compVar.canDeleteRow,
    canModify: compVar.canModify,
    focusedRowKey: compVar.focusedRowKey,
    headerFilterVisible: (compVar.displayHeaderFilter !== undefined) ? compVar.displayHeaderFilter : false,
    gridHeight: gridHeight,
    defaultPageSize: defaultPageSize,
    filterRowVisible: compVar.displayGridFilterRow,
    rowDragging: rowDragging,
    onReorder: onReorder 
  };

}

//**********************************************************/
export const getDefaultFormObject = ({compVar}) => {

  return {
    formTitle: compVar.formTitle,
    tabIndex: 0,
    tabs: compVar.tabs,
    popoverVisible: false,
    errorMsg: compVar.errorMsg,
    formData: compVar.formData,
    formOldData: compVar.formOldData,
    formMode: compVar.formMode,
    labelLocation: "left",
    formHeight: compVar.formHeight,
    toastIsVisible: compVar.toastIsVisible,
    toastMessage: compVar.toastMessage
  }

}

//**********************************************************/
export const setFocusedRow = (compVar) => {

  if (compVar.mainData.length > 0) {
    const searchObj = compVar.mainData.find(o => o[compVar.keyField] === compVar.focusedRowKey);

    if (searchObj === undefined) {
      compVar.focusedRowKey = compVar.mainData[0][compVar.keyField];
    }
  }

}

//**********************************************************/
export const afterEdit = (compVar, e) => {

  let obj = compVar.mainData.find(o => o[compVar.keyField] === e.row.data[compVar.keyField]);

  compVar.formData = {...obj}; 
  compVar.formOldData = {...obj}; 
  compVar.formMode = 2;
  compVar.formTitle = compVar.formData[compVar.masterDescField];
  compVar.isEdited = false;

  compVar.errorMsg = '';

}

//**********************************************************/
export const afterAdd = (compVar, defaultObj) => {

    compVar.formData = {...defaultObj};
    compVar.formMode = 1;
    compVar.formTitle = compVar.title;
    compVar.isEdited = false;
    
    compVar.errorMsg = '';

}

//**********************************************************/
export const getViewContainerHeights = (compVar) => {

  const containerHeight = window.innerHeight - HEADER_HEIGHT;

  // this is to force footer at the bottom in case of less content
  const viewHeight = window.innerHeight - HEADER_HEIGHT - MASTER_GRID_TITLE_HEIGHT 
    - (compVar.errorMsg > '' ? MASTER_GRID_ERROR_HEIGHT : 0);

  return {containerHeight: containerHeight, viewHeight: viewHeight}
}


