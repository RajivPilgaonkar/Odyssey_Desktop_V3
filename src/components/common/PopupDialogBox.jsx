import React from 'react';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';

function PopupDialogBox (props) {

  //**********************************************************/
  const onHandleConfirm = async () => {
    if (props.getSelectedOption !== undefined) {
      await props.getSelectedOption(1);
    }
  };  

  //**********************************************************/
  const onHandleCancel = async () => {
    if (props.getSelectedOption !== undefined) {
      await props.getSelectedOption(0);
    }
  };  
  
  //**********************************************************/
  const renderContent = () => {

    const open = (props.open === undefined) ? false : props.open;

    const message1 = ((props.message1 !== undefined) && (props.message1 !== null)) ? props.message1 : 'Are you sure you want to delete this data?';

    const message2 = ((props.message2 !== undefined) && (props.message2 !== null)) ? props.message2 : 'It cannot be undone';

    const textArr = (props.textArr !== undefined) ? props.textArr : ['Yes','No'];

    const typeArr = (props.typeArr !== undefined) ? props.typeArr : ['normal','success'];

    const functionInvert = (props.functionInvert !== undefined) ? props.functionInvert : false;


    return (    
      <Popup
        visible={open}
        hideOnOutsideClick={false}
        height={200}
        width={500}
        onHiding={onHandleCancel}
      >

        <div>
          <div style={{fontFamily: 'Lato', fontSize: 20}}>
            {message1}<br></br>{message2}
          </div>
          <p></p>
          <div style={{display: 'flex', flexDirection: 'row' }}>            
            <div style={{display: 'flex', flex: 1, justifyContent: 'flex-start'}}>            
              <Button
                text={textArr[0]} type={typeArr[0]} onClick={!functionInvert ? onHandleConfirm: onHandleCancel}
              />
            </div>            
            <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>            
              <Button
                text={textArr[1]} type={typeArr[1]} onClick={!functionInvert ? onHandleCancel: onHandleConfirm}
              />
            </div>            
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


export default PopupDialogBox;

