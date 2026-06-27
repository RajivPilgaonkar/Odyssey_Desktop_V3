import React from 'react';
import {Button} from 'devextreme-react/button';


//**********************************************************/
export const getNavButtonsJsx = (compVar,customObj) => {

  const border = (compVar.formChanged) ? '3px solid green' : null;

  return (
    <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
      <Button {...compVar.navigationButtonList[0]} />
      {compVar.navigationButtonList.length > 1 &&
        <Button {...compVar.navigationButtonList[1]} />
      }
      {compVar.navigationButtonList.length > 2 &&
        <div style={{marginLeft: 20, border: border}}>
          <Button {...compVar.navigationButtonList[2]} />
        </div>
      }
    </div>
  );

}

//**********************************************************/
export const navPrevRecordClick = (compVar, interval) => {

  if (compVar.formChanged) {
    compVar.afterSaveType = -1;
    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = 'Record has changed. Save this?';
    compVar.dialogMessage2 = '';
  } else {
    compVar.formChanged = false;
    compVar.afterSaveType = 0;
    getNextPrevRecord(compVar, interval);
  }

}

//**********************************************************/
export const navNextRecordClick = (compVar, interval) => {

  if (compVar.formChanged) {
    compVar.afterSaveType = 1;
    compVar.popupDialogIndex = 1;
    compVar.dialogMessage1 = 'Record has changed. Save this?';
    compVar.dialogMessage2 = '';
  } else {
    compVar.formChanged = false;
    compVar.afterSaveType = 0;
    getNextPrevRecord(compVar, interval);
  }

}

//**********************************************************/
const getNextPrevRecord = (compVar, interval) => {
  
  const currentIndex = compVar.mainData.findIndex(rec => rec[compVar.keyField] === compVar.formData[compVar.keyField]);

  let obj = {};

  if (currentIndex === -1) {
    obj = compVar.formData;
  } else if (currentIndex+interval >= compVar.mainData.length) {
    obj = compVar.formData;
  } else if (currentIndex+interval < 0) {
    obj = compVar.formData;
  } else {
    obj = compVar.mainData[currentIndex+interval];
  }
    
  compVar.formData = {...obj}; 
  compVar.formOldData = {...obj}; 
  compVar.formMode = 2;
  //compVar.formTitle = '';

}

//**********************************************************/
export const setStopNav  = async (e, compVar, saveFormData) => {

  /*=== Save chosen ===*/
  if (e===1) {

    if (compVar.afterSaveType === 1 || compVar.afterSaveType === -1) {
      compVar.saveLeaveOpen = true;
      await saveFormData();
      if (compVar.afterSaveType === 1) {
        getNextPrevRecord(compVar,1);
      } else if (compVar.afterSaveType === -1) {
        getNextPrevRecord(compVar,-1);
      }   
    } else {
      await saveFormData();
    }
  } else {
    compVar.formChanged = false;
    if (compVar.afterSaveType === 1) {
      getNextPrevRecord(compVar,1);
    } else if (compVar.afterSaveType === -1) {
      getNextPrevRecord(compVar,-1);
    }   
  }

}
