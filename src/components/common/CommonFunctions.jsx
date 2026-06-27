import React from 'react';
import { Column, Lookup, RequiredRule, StringLengthRule } from 'devextreme-react/data-grid';
import { SimpleItem } from 'devextreme-react/form';
import { TagBox } from 'devextreme-react/tag-box';
import { dbDoesExist,dbGetRecord } from '../../actions';
import ArrayStore from 'devextreme/data/array_store';
import _ from 'lodash';

const dayStore = new ArrayStore ({
  data: [
    {"key": 0, "dayBit": 1, "Day": 'Su'},
    {"key": 1, "dayBit": 2, "Day": 'Mo'},
    {"key": 2, "dayBit": 4, "Day": 'Tu'},
    {"key": 3, "dayBit": 8, "Day": 'We'},
    {"key": 4, "dayBit": 16, "Day": 'Th'},
    {"key": 5, "dayBit": 32, "Day": 'Fr'},
    {"key": 6, "dayBit": 64, "Day": 'Sa'}
  ],
  key: "key"
});

//**********************************************************/
export const doesRecordExist = async (table, condition)  => {

  const dataObj = {table: table, condition: condition}
  
  const exists = await dbDoesExist(dataObj);

  return (exists > 0) ? true : false;
  
}

//**********************************************************/
export const canDelete = async (conditions)  => {

  for (let i=0; i<conditions.length; i++) {    
    let exists = await doesRecordExist(conditions[i].table,conditions[i].condition);
    if (exists) {
      return ({errorMsg: 'Cannot Delete. Has been referenced in ' + conditions[i].existsIn});
    }
  }

  return ({errorMsg: ''});
  
}



//**********************************************************/
export const getTableWidth = (tableHeaderArray, superuser) => {
  
  const filteredArray = tableHeaderArray.filter(obj => { return obj.visible });

  let width = 0;
  filteredArray.forEach((rec) => {
    width += rec.width;
  });

  //width += (superuser) ? 45 : 80;
  width += (superuser) ? 45 : 45;
  
  return width;

}

//**********************************************************/
export const getHiddenColWidth = (tableHeaderArray, hiddenColsArray) => {

  /*=== filter to only those that match the width ===*/
  let filteredArray = _.intersectionBy(tableHeaderArray, hiddenColsArray, 'field');

  /*=== compute width of only visible ===*/
  let hiddenArray = hiddenColsArray.filter(obj => { return obj.visible });

  let width = 0;
  filteredArray.forEach((rec) => {
    const found = hiddenArray.find(element => element.field === rec.field);
    if (found !== undefined) {
      width += rec.width;
    }
  });

  return width;

}

//**********************************************************/
export const getTableWidthInclHiddenCol = (tableHeaderArray, superuser, hiddenColsArray) => {

  const width = getTableWidth(tableHeaderArray, superuser);
  const hiddenWidth = getHiddenColWidth (tableHeaderArray, hiddenColsArray);

  return width + hiddenWidth;
}

//**********************************************************/
export const arrayBooleanToBit = (objArray)  => {

  // convert Javascript booleans into 0/1 SQL Server bit
  let data = {};
  Object.keys(objArray).forEach((key) => {
    let value = objArray[key];
    data[key] = (typeof value === 'boolean') ? (value ? 1 : 0) : value;
  });

  return (data);

}

//**********************************************************/
export const convertToBitObject = (data)  => {

  // separate columns and values ....
  // ... this perpares data going to nodeJS
  const columns = Object.keys(data);
  const values2 = Object.values(data);

  // convert Javascript bolean values to 0/1 (bit in SQL Server)
  const values = values2.map((rec) => {
    return rec = (typeof rec === 'boolean') ? (rec ? 1 : 0) : rec;
  });
  const dataObj = {columns: columns, values: values};

  return(dataObj)

}

//**********************************************************/
export const isValidTime = (timeField) => {

  let isValid = true;

  if (timeField.length !== 5) {
    isValid = false;
  }

  if ((isValid) && (timeField.charAt(2) !== ':')) {
    isValid = false;
  }

  if ((isValid) && ((timeField.charAt(0) < '0') || (timeField.charAt(0) > '9'))) {
    isValid = false;
  }

  if ((isValid) && ((timeField.charAt(1) < '0') || (timeField.charAt(1) > '9'))) {
    isValid = false;
  }

  if ((isValid) && ((timeField.charAt(4) < '0') || (timeField.charAt(4) > '9'))) {
    isValid = false;
  }

  if ((isValid) && ((timeField.charAt(3) < '0') || (timeField.charAt(3) > '5'))) {
    isValid = false;
  }

  if ((isValid) && (timeField >= '24:00')) {
    isValid = false;
  }

  return isValid;

}


//**********************************************************/
export const getFormColumns = (tableHeaderArray,dataObj) => {

  let lookupIndex = 0;

  return tableHeaderArray.map((rec) => {

    let required = (rec.required) ? <RequiredRule/> : null;
    let dataFormat = (rec.dataType === 'date') ? 'dd/MM/yyyy' : null;
    dataFormat = (rec.dataType === 'time') ? 'HH:mm' : dataFormat;
    if ((rec.dataType === 'number') && (rec.dataFormat !== undefined) && (rec.dataFormat !== '')) {
      dataFormat = rec.dataFormat;
    }
    let field = rec.field.startsWith('[') ? rec.field.replace('[','').replace(']','') : rec.field;

    let stringLength = (rec.dataType === 'string') ? <StringLengthRule max={rec.maxLength} message="max length exceeded" /> : null;

    let allowClear = !rec.required;

    let ref = null;
    if ((rec.ref !== undefined) && (rec.ref !== null)) {
      ref = rec.ref;
    } 

    if (! rec.isLookup) {
  
      return (        
        <Column key={rec.key}
          dataField={field} 
          caption={rec.label} 
          width={rec.width}
          alignment={rec.align}
          allowEditing={rec.allowEdit}
          visible={rec.visible}
          dataType={rec.dataType}
          format={dataFormat}
          allowHeaderFiltering={rec.allowFilter}
          allowFiltering={rec.allowFilter}     
        >
        {required}
        {stringLength}
        </Column>
      )    
    } else {
      lookupIndex++;
      let dataSource = (dataObj[lookupIndex-1].cascadeFn !== undefined) ? dataObj[lookupIndex-1].cascadeFn : dataObj[lookupIndex-1].dataSource;
      let setCellValue = (dataObj[lookupIndex-1].setValueFn !== undefined) ? dataObj[lookupIndex-1].setValueFn : undefined;      
      return (        
        <Column key={rec.key}
          dataField={field} 
          caption={rec.label} 
          width={rec.width}
          alignment={rec.align}
          allowEditing={rec.allowEdit}
          visible={rec.visible}
          dataType={rec.dataType}
          format={dataFormat}
          setCellValue={setCellValue}
        >
        {required}
          <Lookup
            ref={`${ref}`} 
            allowClearing={allowClear}
            dataSource={dataSource}
            displayExpr={dataObj[lookupIndex-1].displayExpr}
            valueExpr={dataObj[lookupIndex-1].valueExpr} 
          />        
        </Column>
      )    
    }

  });

}


//**********************************************************/
export const getFormItems = (tableHeaderArray, group, state, onValueChanged) => {

  const filterArray = tableHeaderArray.filter(obj => { return obj.groupNo === group});

  return filterArray.map((filterRec) => {

    let colSpan = (filterRec.colSpan > 1) ? filterRec.colSpan : null;
    let field = filterRec.field.startsWith('[') ? filterRec.field.replace('[','').replace(']','') : filterRec.field;

    let editorType = (filterRec.editorType > '') ? filterRec.editorType : null;

    let display = (filterRec.visibleInForm !== undefined) ? filterRec.visibleInForm : true;    

    if ((filterRec.tagType !== undefined) && (filterRec.tagType === "daysOfWeek")) {

      let value = '';
      if (state.gridBoxValue.length === 7) {
        value = 'Su,Mo,Tu,We,Th,Fr,Sa';
      } else {
        value = SelectionToStr(state.gridBoxValue);
      }

      let valueArray = [];
      if (value.includes(",")) {
        valueArray = value.split(',');
      } else if (state.gridBoxValue.length === 0) {
        valueArray = [];
      } else {
        valueArray.push(value);
      }

      return (  
        display && 
          <SimpleItem 
            id={filterRec.key}
            key={filterRec.key}
            dataField={field} 
            colSpan={colSpan}
            editorOptions={state.editorOptions}
            //editorType={editorType}
            //value={valueNumber}
            >
              <TagBox
                dataSource={dayStore}
                valueExpr="Day"
                value={valueArray}
                displayExpr="Day"
                showSelectionControls={true}
                onValueChanged={onValueChanged}
                applyValueMode='useButtons'
                acceptCustomValue={true}
              />              
          </SimpleItem>
      )    
    }

    return (  
      display && 
        <SimpleItem 
          id={filterRec.key}
          key={filterRec.key}
          dataField={field} 
          colSpan={colSpan}
          editorType={editorType}
        />
    )  

  });


}

//**********************************************************/
// Square Brackets around SQL keywords for inserts   
export const markSqlKeywords = (tableHeaderArray, array) => {

  // convert Javascript bolean values to 0/1 (bit in SQL Server)
  const arrayNew = array.map((value) => {
    let field = '[' + value + ']';
    let obj = tableHeaderArray.find(o => o.field === field);
    if (obj !== undefined) {
      return field;
    }
    return value;
  });    

  return arrayNew;

}   

//**********************************************************/
// Square Brackets around SQL keywords for Updates
export const markSqlKeywordsObject = (tableHeaderArray, object) => {

  Object.keys(object).forEach((key) => {
    let field = '[' + key + ']';
    let obj = tableHeaderArray.find(o => o.field === field);
    if (obj !== undefined) {
      delete Object.assign(object, {[field]: object[key] })[key];
    }
  });

}   

//**********************************************************/
export const DaysToStr = (daysOfOperation) => {

  let str = '';

  const dayArray = dayStore._array;

  for (let i=0; i<dayArray.length; i++) {
    if ((daysOfOperation & dayArray[i].dayBit) > 0) {
      str += (str === '') ? dayArray[i].Day : ','+dayArray[i].Day;
    }
  }

  return(str);

}

//**********************************************************/
export const StrToDays = (str) => {

  let bit = 0;

  const dayArray = dayStore._array;

  if (str === 'Daily') {
    bit = 127;
  } else {
    for (let i=0; i<dayArray.length; i++) {
      if (str.includes(dayArray[i].Day)) {
        bit = bit | dayArray[i].dayBit;
      }
    }  
  }

  return(bit);

}

//**********************************************************/
export const DaysToSelection = (daysOfOperation) => {

  let daysArray = [];

  const dayArray = dayStore._array;

  if (daysOfOperation === 127) {
    for (let i=0; i<dayArray.length; i++) {
      daysArray.push(dayArray[i].Day);
    }  

  } else {
    for (let i=0; i<dayArray.length; i++) {
      if ((daysOfOperation & dayArray[i].dayBit) > 0) {
        daysArray.push(dayArray[i].Day);
      }
    }  
  }

  return(daysArray);

}

//**********************************************************/
export const SelectionToDays = (selection) => {

  let bit = 0;
  const dayArray = dayStore._array;

  for (let i=0; i<selection.length; i++) {
    let obj = dayArray.find(o => o.Day === selection[i]);
    bit = bit | obj.dayBit;
  }

  return(bit);

}

//**********************************************************/
export const SelectionToStr = (selection) => {

  let str = '';

  str = selection.join();

  return(str);

}


//**********************************************************/
export const getNextSrNo = async (table, field, condition) => {

  const maxOrderObj = await dbGetRecord({fields: ['MAX(COALESCE('+field+',0)) AS OrderNo'], table: table, where: condition });
  
  return maxOrderObj;

}

