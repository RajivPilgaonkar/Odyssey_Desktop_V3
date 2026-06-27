import React, { useEffect, useState } from 'react';
import { CheckBox } from 'devextreme-react/check-box';
import List from 'devextreme-react/list';
import {Popup} from 'devextreme-react/popup';
import {Button} from 'devextreme-react/button';

const compVar = {renderToggle: false, days: []};

function DaysOfOperation(props) {

  const [formVisible, setFormVisible] = useState(true);  
  const [renderToggle, setRenderToggle] = useState(false);  

  //**********************************************************/
  useEffect (() => {

    compVar.days = [
      {key: 1, dayBit: 2,  day: 'Mo', fullday: 'Monday', selected: true},
      {key: 2, dayBit: 4,  day: 'Tu', fullday: 'Tuesday', selected: true},
      {key: 3, dayBit: 8,  day: 'We', fullday: 'Wednesday', selected: true},
      {key: 4, dayBit: 16, day: 'Th', fullday: 'Thursday', selected: true},
      {key: 5, dayBit: 32, day: 'Fr', fullday: 'Friday', selected: true},
      {key: 6, dayBit: 64, day: 'Sa', fullday: 'Saturday', selected: true},
      {key: 0, dayBit: 1,  day: 'Su', fullday: 'Sunday', selected: true},
    ];

    compVar.days = compVar.days.map((rec) => {
      return {...rec, selected: (rec.dayBit & props.daysOfOperation) !== 0 }
    })
    
    forceRender();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, []);

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const selectionToDaysBit = () => {

    let bit = 0;

    for (const rec of compVar.days) {
      if (rec.selected) {
        bit = bit | rec.dayBit;
      }
    }        

    return(bit);
  }

  //**********************************************************/
  const daysToStr = () => {

    let str = '';

    const idx = compVar.days.findIndex(rec => rec.selected === false);
    if (idx < 0) {
      return "Daily";
    }

    for (const rec of compVar.days) {
      if (rec.selected) {
        str += (str === '') ? rec.day : '/' + rec.day;
      }
    }        
      
    return(str);
  
  }
   
  
  //**********************************************************/
  const onItemClick = (e) => {
    compVar.days[e.itemIndex].selected = !compVar.days[e.itemIndex].selected;
    forceRender();
  }

  //**********************************************************/
  const onHiding = () => {
    setFormVisible(false);
    if (props.onDaysOfOperationHide !== undefined) {
      props.onDaysOfOperationHide();
    }
  }

  //**********************************************************/
  const getSelectedDaysOfOperation = () => {
    const dayBit = selectionToDaysBit();
    const dayStr = daysToStr();
    setFormVisible(false);    
    if (props.onSelectedDaysOfOperation !== undefined) {
      props.onSelectedDaysOfOperation({dayBit: dayBit, dayStr: dayStr});
    }
  }

  //**********************************************************/
  const itemJsx = (rec) => {

    const divStyle = {
      width: '100%',
      height: 30,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      flexDirection: 'row'
    };

    const checkBoxContainerStyle = {
      flex: 1, 
      display: 'flex', 
      justifyContent: 'flex-end', 
      paddingRight: '15px', 
      paddingTop: '5px', 
      width: '100%'
    }

    const labelStyle = {
      flex: 1, 
      justifyContent: 'flex-start', 
      fontFamily: 'Lato', 
      fontSize: 18
    }

    if (rec.selected === undefined) {
      return (
        <></>
      )
    }

    return (
      <>
        <div style={divStyle}>

          <div style={checkBoxContainerStyle}>
            <CheckBox
              value={rec.selected}
              style={{height: '100%', justifyContent: 'flex-end' }}
            />
          </div>

          <div style={labelStyle}>{rec.fullday}</div>
          </div> 

      </>
    )

  }

  //**********************************************************/
  const renderContent = () => {

    const buttonContainerStyle = {
      height: 60,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <>
        <Popup
          visible={formVisible}
          hideOnOutsideClick={false}
          onHiding={onHiding}
          height={550}
          width={300}
          title={'Select Days of Operation'}
          showTitle={true}          
        >
          <div style={{height: 400}}>
            <List              
              dataSource={compVar.days}    
              keyExpr="key"
              itemRender={itemJsx}           
              focusStateEnabled={true}
              onItemClick={onItemClick}
            >
            </List>        
          </div>

          <div style={buttonContainerStyle}>
            <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
              <Button text="Close" type="default" onClick={onHiding}/>
            </div>
            <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
              <Button text={"Select"} disabled={false} type="success" onClick={getSelectedDaysOfOperation}/>
            </div>
          </div>

        </Popup>          
      </>
    )

  }

  return (
    <>
      {renderContent()}
    </>
  )

}

export default DaysOfOperation;

/*
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

*/
