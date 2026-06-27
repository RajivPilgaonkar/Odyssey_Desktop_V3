import React from 'react';
import { Column, Lookup, Summary, TotalItem } from 'devextreme-react/data-grid';
import {SimpleItem, EmptyItem, RequiredRule, } from 'devextreme-react/form';
import DropDownFormGrid from "./DropDownFormGrid";
import DataGrid, { Paging, Pager, Scrolling } from 'devextreme-react/data-grid';
import {Button} from 'devextreme-react/button';
import { dbGetNextId, dbUpdateRecord, dbInsertRecord } from '../../actions';
import { doesRecordExist } from "./CommonFunctions";
import { menuNavItems } from "./MenuItems";

import './MasterGrid.css';

import moment from 'moment';
import _ from 'lodash';

//**********************************************************/
export const getGridColumns = (tableHeaderArray,dataObjLookup,dataObj) => {

  let lookupIndex = 0;

  const dbFieldArray = tableHeaderArray.filter(obj => { return obj.dataType !== 'emptyItem'  });

  /*=== generate the JSX for grid columns ===*/
  return dbFieldArray.map((rec) => {

    /*==== required ===*/
    //let required = null;
    //if ((rec.required !== undefined) && (rec.required !== null)) {
    //  required = <RequiredRule/>;
    //} 

    /*==== dataFormat for the grid column ===*/
    let dataFormat = null;
    if ((rec.dataFormat !== undefined) && (rec.dataFormat !== null)
          && (rec.dataFormat.trim().length > 0) ) {
      dataFormat = rec.dataFormat;
    } else if ((rec.editorOptions !== undefined) && (rec.editorOptions.displayFormat !== undefined)) {
      dataFormat = rec.editorOptions.displayFormat;
    }

    /*==== fields which are kewords in SQL are wrapped in [] ===*/
    let field = rec.field.startsWith('[') ? rec.field.replace('[','').replace(']','') : rec.field;

    /*==== allow clear of combo value, only for required = false ===*/
    let allowClear = true;
    if (rec.required !== undefined) {
      allowClear = !rec.required
    }

    let trueText = null; 
    let falseText = null;
    /*==== in filter dropDowns, show yes/no instead of true/false ===*/
    if (rec.dataType === 'boolean') {
      trueText = (rec.booleanText !== undefined) ? rec.booleanText[0] : 'Yes';
      falseText = (rec.booleanText !== undefined) ? rec.booleanText[1] : 'No';
    }

    /*==== allow searchPanel search to be restricted to only columns where allowSearch = true ===*/
    let allowSearch = false;
    if (rec.allowSearch !== undefined) {
      allowSearch = rec.allowSearch;
    }

    /*==== component reference ===*/
    let ref = null;
    if ((rec.ref !== undefined) && (rec.ref !== null)) {
      ref = rec.ref;
    } 

    /*==== allow filtering of column ===*/
    let allowFilter = false;
    if (rec.allowFilter !== undefined) {
      allowFilter = rec.allowFilter;
    }

    /*==== allow sorting of column ===*/
    let allowSort = null;
    if (rec.allowSort !== undefined) {
      allowSort = rec.allowSort;
    }

    /*=== allow header filtering of column ===*/
    let allowHeaderFiltering = false;
    if (rec.allowHeaderFiltering !== undefined) {
      allowHeaderFiltering = rec.allowHeaderFiltering;
    }

    let customizeText = null;
    if ((rec.showZeroAsBlanks !== undefined) && (rec.showZeroAsBlanks)) {
      customizeText = dataObj.customizeText;
    }

    /*==== after change made in filter, initialFilterValue set to null ===*/
    /*=== then the filter gets unset ====*/
    let filterValue = ((rec.initialFilter !== undefined) && (dataObj.initialFilterValue !== null)) ? rec.initialFilter : null;
    let selectedFilterOperation = (filterValue !== null) ? '=' : null;

    /*=== calculated field ===*/
    //let calculateDisplayValue=null;
    //if (rec.calculateDisplayValue !== undefined) {
    //  let obj = dataObj.calculateDisplayValue.find(o => o.field === rec.field);
    //  calculateDisplayValue = (obj.fn !== undefined) ? obj.fn : null;
    //}

    /*=== calculated field ===*/
    let calculateCellValue=null;
    if (rec.calculateCellValue !== undefined) {
      let obj = dataObj.calculateCellValue.find(o => o.field === rec.field);
      calculateCellValue = (obj.fn !== undefined) ? obj.fn : null;
      /*=== make column unbound as per docs ===*/
      //field=null;
    }


    /*=== By default, as defined in tableHeaderArray ===*/
    /*=== This can be modified using overrideColumnVisibility as shown later ===*/
    let visible = rec.visible;

    /*=== override column visibility (ex. with show/hide 'active' column toggle) ===*/
    if (dataObj.overrideColumnVisibility !== undefined) {
      let obj = dataObj.overrideColumnVisibility.find(o => o.field === rec.field);
      if (obj !== undefined) {
        visible = obj.visible;
      }
    }

    /*=== if lookup ===*/
    let lookup = null;
    if (rec.isLookup) {      
      lookupIndex++;   
      lookup = 
        <Lookup
          ref={ref === null ? null :`${ref}`} 
          allowClearing={allowClear}
          dataSource={dataObjLookup[lookupIndex-1].dataSource}
          displayExpr={dataObjLookup[lookupIndex-1].displayExpr}
          valueExpr={dataObjLookup[lookupIndex-1].valueExpr} 
        />;
    }
      
    return (
      <Column key={rec.key}
        dataField={field} 
        caption={rec.label} 
        width={rec.width}
        alignment={rec.align}
        visible={visible}
        dataType={rec.dataType}
        format={dataFormat}
        allowHeaderFiltering={allowHeaderFiltering}
        allowFiltering={allowFilter}
        trueText={trueText}     
        falseText={falseText}   
        allowSearch={allowSearch}
        allowSorting={allowSort}
        customizeText={customizeText}
        filterValue={filterValue}
        selectedFilterOperation={selectedFilterOperation}
        //calculateDisplayValue={calculateDisplayValue}
        setCellValue={calculateCellValue}
      >
        {lookup}
      </Column>

    );

  });

}

//**********************************************************/
export const getGridSummary = (tableHeaderArray) => {
  const dbFieldArray = tableHeaderArray.filter(obj => { return obj.summary !== undefined  });

  if (dbFieldArray.length > 0) {
    return (
      <Summary>
          {getGridSummaryItems(tableHeaderArray)}
      </Summary>
    );
  } else {
    return null;
  }

}

//**********************************************************/
export const getGridSummaryItems = (tableHeaderArray) => {

  const dbFieldArray = tableHeaderArray.filter(obj => { return obj.summary !== undefined  });

  /*=== generate the JSX for grid columns ===*/
  return dbFieldArray.map((rec) => {

    /*==== fields which are kewords in SQL are wrapped in [] ===*/
    let field = rec.field.startsWith('[') ? rec.field.replace('[','').replace(']','') : rec.field;

    /*==== field ===*/
    let column = field;

    /*==== summary type ===*/
    let summaryType = "sum";
    if (rec.summary.summaryType !== undefined) {
      summaryType = rec.summary.summaryType;
    }

    /*==== alignment ===*/
    let alignment = "right";
    if (rec.summary.alignment !== undefined) {
      alignment = rec.summary.alignment;
    }

    /*==== format ===*/
    let valueFormat = "#,##0.00";
    if (rec.summary.valueFormat !== undefined) {
      valueFormat = rec.summary.valueFormat;
    }
  
    /*==== display format ===*/
    let displayFormat = "{0}";
    if (rec.summary.displayFormat !== undefined) {
      displayFormat = rec.summary.displayFormat;
    }

    return (
      <TotalItem 
        id={rec.key+"Total"}
        key={rec.key+"Total"}
        column={column} 
        summaryType={summaryType} 
        alignment={alignment}
        valueFormat={valueFormat}
        displayFormat={displayFormat}
      />
    );

  });

}




//**********************************************************/
export const getDevextremeFormItems = (tableHeaderArray, group, formObj, dataObj) => {

  const filterArray = tableHeaderArray.filter(obj => { return obj.groupNo === group});
  const lookupArray = tableHeaderArray.filter(obj => { return obj.isLookup === true});

  return filterArray.map((filterRec) => {

    let field = filterRec.field.startsWith('[') ? filterRec.field.replace('[','').replace(']','') : filterRec.field;
    let colSpan = ((filterRec.colSpan !== undefined) && (filterRec.colSpan > 1)) ? filterRec.colSpan : null;
    let editorType = ((filterRec.editorType !== undefined) && (filterRec.editorType > '')) ? filterRec.editorType : null;
    let editorOptions = (filterRec.editorOptions !== undefined) ? filterRec.editorOptions : null;

    let label = (filterRec.longLabel !== undefined) ? {text: filterRec.longLabel} : {text: filterRec.label};
    let emptyItem = (filterRec.dataType === 'emptyItem' && filterRec.visibleInForm);

    let display = (filterRec.visibleInForm !== undefined) ? filterRec.visibleInForm : true;    

    if ((filterRec.dataType === 'number') && !filterRec.editorType) {
      editorType = 'dxNumberBox';
    } else if ((filterRec.dataType === 'date') && !filterRec.editorType) {
      editorType = 'dxDateBox';
    }  else if ((filterRec.dataType === 'boolean') && !filterRec.editorType) {
      editorType = 'dxCheckBox';
    } 

    let helpText=null;
    if ((formObj.showHint) && (filterRec.hint !== undefined)) {
      helpText = filterRec.hint;
    }

    let readOnly = false;
    if ((filterRec.editorOptions !== undefined) && (filterRec.editorOptions.readOnly !== undefined)) {
      readOnly = filterRec.editorOptions.readOnly;
    }

    let cssClass = null;
    if (filterRec.cssClass !== undefined) {
      cssClass = filterRec.cssClass;
    }

    let required = ((filterRec.required !== undefined) && (filterRec.required)) ? <RequiredRule></RequiredRule> : null;

    let dropDownFormGrid = null;
    if (filterRec.isLookup) {

      const lookupIndex = lookupArray.findIndex(rec => rec.field === filterRec.field);

      let lookupObj = dataObj.dbLookup[lookupIndex];
      let placeholder = (lookupObj.placeholder !== undefined) ? lookupObj.placeholder: null;

      dropDownFormGrid = 
        <DropDownFormGrid
          listArray={lookupObj.dataSource}
          fieldList={lookupObj.fieldList}
          valueExpr={lookupObj.valueExpr}
          displayExpr={lookupObj.displayExpr}
          placeholder={placeholder}
          getSelectedRecord={formObj.getSelectedRecord[lookupIndex]}
          style={{width: 200,flexGrow:1}}
          showColumnHeaders={false}
          initialValue={formObj.initialLookupValues[lookupIndex]}
          clearLookupValues={formObj.clearLookupValues[lookupIndex]}
          clearLookup={formObj.clearLookup[lookupIndex]}          
          readOnly={readOnly}
        >
        </DropDownFormGrid>

    }

    let emptyItemJsx = null;   
    if (emptyItem) {
      emptyItemJsx = 
        <EmptyItem 
          id={filterRec.key+"Empty"}
          key={filterRec.key+"Empty"}
          colSpan={colSpan}
        />
    }

    if (emptyItemJsx !== null) {
      return (emptyItemJsx);
    }

    if ((filterRec.dataType === 'number') || (filterRec.dataType === 'date') ||
        (filterRec.dataType === 'string') || (filterRec.dataType === 'boolean')) {

      return (  
        display &&
          <SimpleItem 
            id={filterRec.key}
            key={filterRec.key}
            dataField={field} 
            colSpan={colSpan}
            label={label}
            editorType={editorType}
            editorOptions={editorOptions}
            helpText={helpText}     
            cssClass={cssClass}       
          >
            {required}
            {dropDownFormGrid}
          </SimpleItem>
      )  
  
    }

    return null;

  });

}


//**********************************************************/
export const convertFormObjectToArrays = (data)  => {


  // separate columns and values ....
  // ... this perpares data going to nodeJS
  const columns = Object.keys(data);
  const values2 = Object.values(data);

  // convert Javascript bolean values to 0/1 (bit in SQL Server)
  // convert Javascript date to MM/DD/YYYY
  const values = values2.map((rec) => {
    if (typeof rec === 'boolean') {
      return (rec ? 1 : 0);
    } else if ((rec!=null) && (typeof rec === 'object')) {
      return moment(rec).format('MM/DD/YYYY');
    } 
    return rec;
  });
  const dataObj = {columns: columns, values: values};

  return(dataObj)

}

//**********************************************************/
export const checkNullErrors = async (headerArray, formData) => {
  let reqdArray = headerArray.filter(obj => {return ((obj.required !== undefined) && obj.required && obj.dataType!=='emptyItem')});
  for (let i = 0; i < reqdArray.length; i++) {
    let field = reqdArray[i].field;
    let label = reqdArray[i].label;
    if (reqdArray[i].longLabel !== undefined) {
      label = reqdArray[i].longLabel;
    }
    if ((formData[field] === null) || (formData[field] === '')) {
      return ({errorNo:-1, errorDesc: label + " is required !"});
    }
  }  
  return ({errorNo:0, errorDesc:''});
}


//**********************************************************/
// Default values   
export const getDefaultValues = (headerArray) => {

  const defaultArray = headerArray.filter(obj => { return (obj.default !== undefined) && (obj.default !== null)});

  return defaultArray.reduce((acc,cur) => ({...acc, [cur.field]: cur.default }), {});
    
}   

//**********************************************************/
export const hasFormDataChanged = (formData,formOldData) => {
  const difference = Object.keys(formData).filter(property => formData[property] !== formOldData[property]);  
  return (difference.length !== 0);
}

//**********************************************************/
export const createBlankObject = (headerArray) => {
  
  const blankObj = headerArray.filter(rec => rec.dataType!=='emptyItem').reduce((acc, cur) => 
    ({...acc, [cur.field]: null}),{});

  return blankObj;
}

//**********************************************************/
export const beforeInsertAsync = async () => {
}

//**********************************************************/
export const beforeInsert = (headerArray) => {

  // create blank object
  let blankObj = createBlankObject(headerArray);

  // get default values
  const defaultFields = getDefaultValues(headerArray);  

  // add key fields & default values
  return {...blankObj, ...defaultFields}

  //await beforeInsertAsync();
}



//**********************************************************/
export const setNullsToDefaults = async (headerArray, formData) => {

  let defaultValues = {};

  let nullValuesArray = headerArray.filter(rec => {return rec.dataType === 'number' && (rec.default !== undefined) && rec.default !== null});

  Object.keys(formData).forEach((e) => {
    let obj = nullValuesArray.find(o => o.field === e);
    if ((obj !== undefined) && (formData[e] === null)) {
      defaultValues = {...defaultValues, [e]: obj.default}
    }
  });

  return defaultValues;

}

//**********************************************************/
export const escapeStringQuotes = async (headerArray, formData) => {

  let strValues = {};

  let strValuesArray = headerArray.filter(rec => {return rec.dataType === 'string'});

  Object.keys(formData).forEach((e) => {
    let obj = strValuesArray.find(o => o.field === e);
    if ((obj !== undefined) && (formData[e] !== null)) {
      let strField = formData[e].replace(/'/g, "''");
      strValues = {...strValues, [e]: strField}
    }
  });

  return strValues;

}

//**********************************************************/
export const isTimeInDate = (fieldRec) => {
  if (fieldRec === undefined) {
    return false;
  }

  /*=== if HH:mm mentioned, assume time field ===*/
  if (fieldRec.hasTime !== undefined && fieldRec.hasTime) {
    return true;
  }

  return false;
}

//**********************************************************/
export const setDatesToMDY = async (headerArray, formData) => {


  let dateValues = {};

  let dateValuesArray = headerArray.filter(rec => {return rec.dataType === 'date'});

  Object.keys(formData).forEach((e) => {
    let obj = dateValuesArray.find(o => o.field === e);
    const isTime = isTimeInDate(obj);
    if ((obj !== undefined) && (formData[e] !== null)) {
      let dateField = null;
      if (typeof formData[e] === 'string') {
         dateField = (!isTime) ? moment(formData[e]).format('MM/DD/YYYY') : moment(formData[e]).format('MM/DD/YYYY HH:mm');
      } else if (typeof formData[e] === 'object') {
        dateField = (!isTime) ? moment(formData[e]).format('MM/DD/YYYY') : moment(formData[e]).format('MM/DD/YYYY HH:mm');
      }
      dateValues = {...dateValues, [e]: dateField}
    }
  });

  return dateValues;

}

//**********************************************************/
// Default values   
export const convertBooleansToSQLType = (headerArray, formData) => {

  let booleanValues = {};

  const booleanValuesArray = headerArray.filter(obj => { return obj.dataType === 'boolean'});

  Object.keys(formData).forEach((e) => {
    let obj = booleanValuesArray.find(o => o.field === e);
    if (obj !== undefined) {
      booleanValues = {...booleanValues, [e]: formData[e] ? 1 : 0}
    }
  });

  return booleanValues;
    
}   


//**********************************************************/
export const getLookupValues = (initialValuesObj, lookupArray, keyFieldArray, keyValue) => {

  let initialValues = {...initialValuesObj};
  const index = lookupArray.findIndex(rec => rec[keyFieldArray[0]] === keyValue);

  if (index >= 0) {
    const value = lookupArray[index][keyFieldArray[1]];
    initialValues = {[keyFieldArray[0]]: keyValue, [keyFieldArray[1]]: value};
  }

  return initialValues;
  
}

//**********************************************************/
export const deleteNonDbFields = (headerArray, formData) => {

  let nonDbFields = headerArray.filter(rec => {return rec.isDbField !== undefined && !rec.isDbField });

  nonDbFields.forEach(rec => delete formData[rec.field])

  return formData;
}


//**********************************************************/
export const saveEditedInsertedData = async (headerArray, tmpFormData, oldFormData, obj) => {


  // check if data has changed in the edit mode
  let hasDataChanged = true;
  if (obj.formMode === 2) {
    hasDataChanged = ! _.isEqual(tmpFormData, oldFormData);
  }

  if (!hasDataChanged) {
    return ({errorMsg: "No data has changed"})
  }

  let recordExist = await doesRecordExist(obj.tableName, obj.condition);
  if (recordExist) {
    return ({errorMsg: "'This record already exists'"})
  }

  // get nulls which are set to defaults
  let nullsToDefaults = await setNullsToDefaults(headerArray, tmpFormData);

  tmpFormData = {...tmpFormData, ...nullsToDefaults}

  // convert from boolean true/false to bit 1/0 for SQL Server
  let booleanData = await convertBooleansToSQLType(headerArray, tmpFormData);
  tmpFormData = {...tmpFormData, ...booleanData}

  // convert dates to MM/DD/YYYY strings for SQL Server
  let dateData = await setDatesToMDY(headerArray, tmpFormData);
  tmpFormData = {...tmpFormData, ...dateData}

  // single Quotes in strings
  //let strData = await escapeStringQuotes(headerArray, tmpFormData);
  //tmpFormData = {...tmpFormData, ...strData}

  // obtain next id in add mode
  if (obj.formMode === 1) {
    const nextId = await dbGetNextId(obj.tableName, obj.keyField);
    tmpFormData = {...tmpFormData, [obj.keyField]: nextId };
  } 

  const preFormData = {...tmpFormData, ...obj.beforeSaveValues };

  /*=== in case of auto-increment fields (which may be deleted in the next step) ===*/
  let keyValue = tmpFormData[obj.keyField];

  /*=== delete non-db fields (or properties in the array) ===*/
  tmpFormData = deleteNonDbFields(headerArray, {...preFormData});

  if (obj.formMode === 1) {
    let dataObj = convertFormObjectToArrays(tmpFormData);
    dataObj.table = obj.tableName;

    // insert new record
    await dbInsertRecord(dataObj);
    
  } else if (obj.formMode === 2) {
      keyValue = (tmpFormData[obj.keyField] !== undefined) ? tmpFormData[obj.keyField] : keyValue;
      const updatedData = {table: obj.tableName, data: tmpFormData, 
          keyField: obj.keyField, keyValue: keyValue/*tmpFormData[obj.keyField]*/};
      await dbUpdateRecord(updatedData);  
  }

  await obj.afterPost();

  /*=== copy non-db fields back into the for object ===*/
  Object.keys(preFormData).forEach(function(k) {
    if (!tmpFormData.hasOwnProperty(k)) tmpFormData[k] = preFormData[k];
  });  

  return ({errorMsg: "", formData: tmpFormData})

}

//**********************************************************/
export const convertDMYtoDate = (dateStr) => {

  let wef = moment(dateStr,'DD/MM/YYYY').toDate();
  return wef;  
}

//**********************************************************/
export const convertDMYtoDateObj = (dateStr) => {

  let wef = new Date(moment(dateStr,'DD/MM/YYYY').format('MM/DD/YYYY'));
  return wef;  
}

//**********************************************************/
export const convertMDY_Hm_toDate = (dateStr) => {

  let wef = moment(dateStr,'MM/DD/YYYY HH:mm').toDate();
  return wef;  
}

//**********************************************************/
export const getMenuItems = (name) => {

  const index = menuNavItems.findIndex(rec => rec.pageName === name);

  if (index >= 0) {
    return ({
      menuItems: menuNavItems[index].menuItems,
      displayExpr: menuNavItems[index].displayExpr
     });
  } else {
    return null;
  }

}

//**********************************************************/
export const getFieldsArray = (headerArray) => {
  /*=== ignore emptyItems and non-dbFields from the headerArray ===*/
  const fieldArray = headerArray.filter(rec => rec.dataType!=='emptyItem' && ((rec.isDbField === undefined) || (rec.isDbField)) ).map(rec => rec.field);
  return fieldArray;
}

//**********************************************************/
export const getReorderedList = (e,mainData,compareField,compareValue) => {
  const visibleRows = e.component.getVisibleRows();
  let reorderedList = [...mainData];
  if (compareField > '') {
    reorderedList = reorderedList.filter(rec => rec[compareField] === compareValue);
  }
  const toIndex = reorderedList.indexOf(visibleRows[e.toIndex].data);
  const fromIndex = reorderedList.indexOf(e.itemData);
  reorderedList.splice(fromIndex,1);
  reorderedList.splice(toIndex,0,e.itemData);

  return reorderedList;
}

//**********************************************************/
export const saveReordedListToDB = async (data, tableName, orderField, keyField) => {

    // save the reordered list back to the database
    //let orderNo = 1;

    for (var i=0; i<data.length; i++) {
      let updatedData = {table: tableName, data: {[orderField]: i+1}, 
        keyField: keyField, keyValue: data[i][keyField]};
      await dbUpdateRecord(updatedData);  

    }

    //data.forEach(async (e) => {
    //  let updatedData = {table: tableName, data: {[orderField]: orderNo++}, 
    //    keyField: keyField, keyValue: e[keyField]};

//console.log('updatedData', updatedData);        
      //await dbUpdateRecord(updatedData);  
    //});

}

//**********************************************************/
export const isArrayEqual = (array1, array2) => {
  if (array1.length !== array2.length) {
    return false;
  }

  const diff = array2.filter(e=> array1.indexOf(e) < 0);

  return (diff.length > 0) ? false : true;

}

//**********************************************************/
export const setStateAsync = (state) => {
  return new Promise((resolve) => {
    this.setState(state, resolve)
  });
}

//**********************************************************/
export const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
}

//**********************************************************/
export const isValidDateString = (dateString) => {
  // Attempt to create a Date object with the given string
  const date = new Date(dateString);
  
  // Check if the created Date object is valid and the input string is a valid date
  // A valid date would be both a valid date object and not "Invalid Date"
  return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date';
}    

//**********************************************************/
export const convertDMY_toDate = (str) => {
  if (typeof str !== 'string') return null;

  const [day, month, year] = str.split('/');
  const newDate = new Date(+year, month - 1, +day);

  return newDate;
}

//**********************************************************/
export const convertMDY_toDate = (str) => {
  if (typeof str !== 'string') return null;

  const [month, day, year] = str.split('/');
  const newDate = new Date(+year, month - 1, +day);

  return newDate;
}

//**********************************************************/
export const convertDMY_MDY = (str) => {
    if (typeof str !== 'string') return null;
  
    const [day, month, year] = str.split('/');
    const newDate = month + '/' + day + '/' + year;
  
    return newDate;
}
  
//**********************************************************/
export const convertMDY_DMY = (str) => {
  if (typeof str !== 'string') return null;

  const [month, day, year] = str.split('/');
  const newDate = day + '/' + month + '/' + year;

  return newDate;
}

//**********************************************************/
export const convertYMD_DMY = (str) => {
  if (typeof str !== 'string') return null;

  const [year, month, day] = str.split('/');
  const newDate = day + '/' + month + '/' + year;

  return newDate;
}

//**********************************************************/
export const getNowDate = (dateFmt) => {

  let nowDate = new Date(); 

  return moment(nowDate).format(dateFmt);
  
}


//**********************************************************/
export const addEditArray = (arrayOfObjects, newObject, fieldName) => {

    let index = arrayOfObjects.findIndex(rec => rec[fieldName] === newObject[fieldName]);

    if (index === -1) {
      arrayOfObjects.push(newObject);
    } else {
      arrayOfObjects[index] = {...newObject};
    }

}  

//**********************************************************/
export const getStartDate = (type) => {

  let nowDate = new Date(); 
  let currentYear = nowDate.getFullYear();
  let currentMonth = nowDate.getMonth()+1;

  let day = '01';
  let month = '10';
  let year = currentYear.toString();
  let startDate = day + '/' + month + '/' + year;
  
  if (type === 1) {
    month = '04';
    year = (currentMonth < 4) ? (currentYear-1).toString() : currentYear.toString();
    startDate = day + '/' + month + '/' + year;
  } else if (type === 2) {
    year = (currentMonth < 4) ? (currentYear-1).toString() : currentYear.toString();
    startDate = day + '/' + month + '/' + year;
  }

  return startDate;  
}

//**********************************************************/
export const getStartOfFinancialYear = (x_date) => {

  let nowDate = x_date; 
  let currentYear = nowDate.getFullYear();  
  let currentMonth = nowDate.getMonth()+1;

  currentYear = (currentMonth < 4) ? currentYear - 1 : currentYear;

  let day = '01';
  let month = '04';
  let year = currentYear.toString();

  let startDate = day + '/' + month + '/' + year;
  
  return startDate;  
}


//**********************************************************/
export const getStartEndOfMonth = (xDate) => {

  let currentYear = xDate.getFullYear();
  let currentMonth = xDate.getMonth()+1;

  let startDay = '01';
  let startDateStr = startDay + '/' + currentMonth.toString() + '/' + currentYear.toString();
  let startDate = convertDMY_toDate(startDateStr);
  let endDate = new Date(currentYear, currentMonth, 0);
  let dateObj = {startDate: startDate, endDate: endDate};
  
  return dateObj;  
}


//**********************************************************/
export const getFirstOfMonth = (xDate, months) => {

  let currentYear = xDate.getFullYear();
  let currentMonth = xDate.getMonth()+1+months;

  let startDay = '01';
  let startDateStr = startDay + '/' + currentMonth.toString() + '/' + currentYear.toString();
  let startDate = convertDMY_toDate(startDateStr);
  
  return startDate;  
}

//**********************************************************/
export const getLastOfMonth = (xDate, months) => {

  let startDate = getFirstOfMonth(xDate, months);
  let endDate = moment(startDate).add(1, 'M').add(-1, 'd');
  
  return endDate;  
}

//**********************************************************/
export const getPrevYear_DMY = (xDate) => {
  let date = moment(xDate,'DD/MM/YYYY').add(-1,'Y');  
  return date.format('DD/MM/YYYY');
}

//**********************************************************/
export const getNextYear_DMY = (xDate) => {
  let date = moment(xDate,'DD/MM/YYYY').add(1,'Y');  
  return date.format('DD/MM/YYYY');
}

//**********************************************************/
export const getFirstOfMonth_DMY = (xDate, months) => {
  const firstDate = getFirstOfMonth(xDate, months);
  return moment(firstDate).format('DD/MM/YYYY');
}

//**********************************************************/
export const getLastOfMonth_DMY = (xDate, months) => {
  const lastDate = getLastOfMonth(xDate, months);
  return lastDate.format('DD/MM/YYYY');
}

//**********************************************************/
export const numberFormat = (num, fixedPlace) => {
  if (num === null) {
    return null;
  }
  return num.toFixed(fixedPlace).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

//**********************************************************/
export const getMonthYear_FromDMY_String = (xDate) => {

  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul",
    "Aug","Sep","Oct","Nov","Dec"];  

  let currentYear = xDate.substr(6,4);
  let currentMonth = xDate.substr(3,2);

  let monthYear = month[parseInt(currentMonth)-1] + '_' + currentYear;

  return monthYear;  
}

//**********************************************************/
export const convert_Date_to_DD_MMM = (xDate, option) => {

  let dateStr = moment(xDate).format('DD-MMM-YYYY');

  if (option === 2) {
    dateStr = dateStr.substring(3,11);
  }

  return dateStr;  
}

//**********************************************************/
export const convert_DbDate_To_DMY = (xDate, option) => {

  let dateStr = (option === 1) ? moment(xDate).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY');

  return dateStr;  
}

//**********************************************************/
export const convert_DbDate_To_DMY_day = (xDate, option) => {

  let dateStr = (option === 1) ? moment(xDate).format('DD/MM/YY, ddd') : moment().format('DD/MM/YY, ddd');

  return dateStr;  
}

//**********************************************************/
export const convert_DbDate_To_MDY = (xDate, option) => {

  let dateStr = (option === 1) ? moment(xDate).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY');

  return dateStr;  
}

//**********************************************************/
export const convert_PrevDbDate_To_MDY = (xDate, option) => {

  let dateStr = (option === 1) ? moment(xDate).format('MM/DD/YYYY') : moment().format('MM/DD/YYYY');

  return dateStr;  
}

//**********************************************************/
export const convert_DbDate_To_HHmm = (xDate, option) => {

  let timeStr = (option === 1) ? moment(xDate.replace('T', ' ').replace('Z', '')).format('HH:mm') : moment().format('HH:mm');

  return timeStr;  
}

//**********************************************************/
export const convert_DateObj_To_HHmm = (xDate, option) => {

  let timeStr = (option === 1) ? moment(xDate).format('HH:mm') : moment().format('HH:mm');

  return timeStr;  
}


//**********************************************************/
export const convertToMoment = (xDate) => {
  if (typeof xDate === 'string') {
    return moment(xDate.replace('T', ' ').replace('Z', ''));  
  } else {
    return moment(xDate);
  }
}

//**********************************************************/
export const convertToMoment_fmt = (xDate,fmt) => {
  if (fmt.trim().length > 0) {
    return moment(xDate,fmt);
  } else {
    return moment(xDate);
  }
}

//**********************************************************/
export const stripTime = (xDate) => {
  const dateWithoutTime = moment(moment(xDate).format('MM/DD/YYYY')).toDate();
  return dateWithoutTime;
}

//**********************************************************/
export const dateDiff = (xDate1, xDate2, type) => {
  
  const diff = moment(xDate1).diff(moment(xDate2), type);

  return diff;  
}

//**********************************************************/
export const dateDiff_DMY = (xDate1, xDate2, type) => {
  
  const diff = moment(xDate1,'DD/MM/YYYY').diff(moment(xDate2,'DD/MM/YYYY'), type);

  return diff;  
}

//**********************************************************/
export const dateDayDiffIgnoreTime = (xDate1, xDate2) => {
  
  const diff = moment(xDate1).startOf('day').diff(moment(xDate2).startOf('day'),'days');

  return diff;  
}

//**********************************************************/
export const dateFormat = (xDate, format, formatOutput) => {
  
  let str = '';

  if (format !== null) {
    str = moment(xDate,format).format(formatOutput);
  } else {
    str = moment(xDate).format(formatOutput);
  }

  return str;  
}


//**********************************************************/
export const getStartEndOfWeek = (xDate) => {

  let day = xDate.getDay();
  let diff = xDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

  let firstDayOfWeek = new Date(xDate.setDate(diff));

  let startDate = firstDayOfWeek;

  let endDate = moment(startDate).add(1, 'w').add(-1, 'd').toDate();
  let dateObj = {startDate: startDate, endDate: endDate};
  
  return dateObj;  
}

//**********************************************************/
export const isValidTime = (timeField) => {
  
  let isValid = true;

  if (timeField.length !== 5) {
    return false;
  }

  if (timeField.charAt(2) !== ':') {
    return false;
  }

  const firstCharArray = ['0','1','2'];
  if (! firstCharArray.includes(timeField.charAt(0))) {
    return false;
  }

  const secondCharArray = ['0','1','2','3','4','5','6','7','8','9'];
  if (! secondCharArray.includes(timeField.charAt(1))) {    
    return false;
  }

  const thirdCharArray = ['0','1','2','3','4','5'];
  if (! thirdCharArray.includes(timeField.charAt(3))) {
    return false;
  }

  const fourthCharArray = ['0','1','2','3','4','5','6','7','8','9'];
  if (! fourthCharArray.includes(timeField.charAt(4))) {
    return false;
  }

  if (timeField >= '24:00') {
    return false;
  }

  return isValid;

}


//**********************************************************/
export const setDateTimeFormat = async (headerArray, mainData) => {

  let dateValuesArray = headerArray.filter(rec => {return rec.dataType === 'date'});

  // convert add elements with hasTime to a javascript date time
  dateValuesArray.forEach(e => {
    mainData.forEach(rec => {
      if (rec[e.field]) {
        rec[e.field] = rec[e.field].replace('T', ' ').replace('Z', '');
      }
    })
  })

}

//**********************************************************/
export const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));


//**********************************************************/
export const searchDataGridJsx = (compVar, data) => {

  const displayPager = (compVar.mainData.length > data.maxPageSize) ? true : false;

  const onRowPrepared = (data.onRowPrepared !== undefined) ? data.onRowPrepared : null;
  const pagination = (data.pagination !== undefined) ? data.pagination : true;

  const height = (data.boxHeight !== undefined) ? data.boxHeight : null;

  return (
    <>
      <div className="search-grid-box-container" style={{/*height: data.boxHeight,*/ width: data.boxWidth}}>

          <DataGrid 
            height={height}
            dataSource={compVar.mainData}
            keyExpr={data.keyExpr}
            rowAlternationEnabled={true}
            focusedRowEnabled={true}
            focusedRowKey={compVar.focusedRowKey}
            onFocusedRowChanged={data.onFocusedRowChanged}
            onRowPrepared={onRowPrepared}
          >      

            {pagination && displayPager && 
              <Paging 
                enabled={pagination} 
                defaultPageSize={data.maxPageSize} 
              />    
            }

            {pagination && displayPager && 
              <Pager
                visible={pagination}
                displayMode='full'
                showPageSizeSelector={false}
                showInfo={true}
                showNavigationButtons={true} 
              />      
            }

            {!pagination && 
              <Scrolling mode="virtual" />            
            }

            {data.getColumns}

          </DataGrid>

      </div>

    </>
  )
}

//**********************************************************/
export const searchDataButtonJsx = (data) => {

  return (
    <>
      <div className="search-grid-button-container" style={{width: data.boxWidth}}>
        <div className="search-grid-single-button-container">
          <Button text="Close" type="default" onClick={data.closePopover}/>
        </div>
        <div className="search-grid-single-button-container">
          <Button text="Select" disabled={false} type="success" onClick={data.onSelection}/>
        </div>
      </div>
    </>
  )
}


//**********************************************************/
export const searchDataGetColumnsJsx = (tableHeaderArray, compVar) => {

    compVar.tableWidth = tableHeaderArray.reduce((acc, rec) => acc + rec.width, 0);

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
export const escapeSingleQuotes = (str) => {
  return(str.replace(/'/g, "''"));
}

//**********************************************************/
export const getBackRoute = (location) => {

  let backRoute = {};
  if ((location.state !== undefined) && 
      (location.state.backRoute !== undefined)) {
    backRoute = {backRoute: location.state.backRoute};     
  }

  return(backRoute);
}

//**********************************************************/
export const addMonth = (xDate, months, returnType) => {

  const newDate = moment(convertDMY_MDY(xDate)).add(months,'M').toDate();

  const returnDate = (returnType === 1) ? moment(newDate).toDate() : moment(newDate).format('DD/MM/YYYY');

  return(returnDate);
}

//**********************************************************/
export const addDay = (xDate, days, returnType) => {

  const newDate = moment(convertDMY_MDY(xDate)).add(days,'days').toDate();

  const returnDate = (returnType === 1) ? newDate : moment(newDate).format('DD/MM/YYYY');

  return(returnDate);
}

//**********************************************************/
export const addMinutes = (xDate, minutes, returnType) => {

  const newDate = moment(convertDMY_MDY(xDate)).add(minutes,'minutes').toDate();

  let returnDate = (returnType === 1) ? newDate : moment(newDate).format('DD/MM/YYYY');

  if (returnType === 3) {
    returnDate = moment(newDate).format('HH:mm')  
  }

  return(returnDate);
}

//**********************************************************/
export const addMinutesToDateTime = (xDate, minutes, returnType) => {

  const newDate = moment(xDate).add(minutes,'minutes').toDate();

  let returnDate = (returnType === 1) ? newDate : moment(newDate).format('DD/MM/YYYY HH:mm');

  if (returnType === 3) {
    returnDate = moment(newDate).format('HH:mm')  
  }

  return(returnDate);
}

//**********************************************************/
export const addWeek = (xDate, months, returnType) => {

  const newDate = moment(convertDMY_MDY(xDate)).add(months,'w').toDate();

  const returnDate = (returnType === 1) ? newDate.toDate() : moment(newDate).format('DD/MM/YYYY');

  return(returnDate);
}

//**********************************************************/
export const getEndOfFinancialYear = (xDate, returnType) => {

  const newDate = moment(xDate,'DD/MM/YYYY').utcOffset(0, true).toDate();
  const month = newDate.getUTCMonth() + 1;
  let year = newDate.getUTCFullYear();

  if (month >= 4) {
    year++;
  }

/*
  const newDate = moment(xDate,'DD/MM/YYYY').toDate();
  const month = newDate.getUTCMonth() + 1;
  let year = newDate.getUTCFullYear();

  if (month > 4) {
    year++;
  }
*/

  const endOfYearStr = '03/31/'+year.toString();
  const endOfYear = moment(endOfYearStr);

  const returnDate = (returnType === 1) ? endOfYear.toDate() : moment(endOfYear).format('DD/MM/YYYY');

  return(returnDate);
}


//**********************************************************/
export const deepClone = (obj) => {
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }

  const clonedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}

//**********************************************************/
export const containsWhitespace = (str) => {
  return /\s/.test(str);
}

