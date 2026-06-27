import React from 'react';
import Toolbar, { Item as ToolbarItem} from 'devextreme-react/toolbar';

import './ToolbarOptions.css';

function ToolbarOptions (props) {

  //**********************************************************/
  const getToolbarButtons = () => {

    return props.buttonListObj.map((rec,index) => {

      // location
      const location = (rec.location !== undefined) ? rec.location : "center";

      // widget
      const widget = (rec.widget !== undefined) ? rec.widget : "dxButton";

      // icon
      const icon = rec.options.icon;              

      // visible
      const visible = (rec.visible !== undefined) ? rec.visible : false;

      // hint
      const hint = (rec.options.hint !== undefined) ? rec.options.hint : null;

      // onClick
      const onClick = rec.options.onClick;              

      return (
        <ToolbarItem 
          key={index}
          location={location}
          widget={widget}
          options={{
            icon: icon,
            onClick: onClick,
            visible: visible,
            hint: hint
          }}
        />            
      );

    });

  }
  
  //**********************************************************/
  const renderContent = () => {

    const panelHeight = (props.height === undefined) ? 50 : props.height;

    const text = (props.text !== undefined) ? props.text : "";

    //const id = (props.id !== undefined) ? props.id : "roundedbox";

/*    
    if (props.boxContainerStyle !== undefined) {      
      boxStyle = {...boxStyle,...props.boxContainerStyle}
      panelContainerStyle = {...panelContainerStyle,...props.boxContainerStyle}
    }
*/

    return (
      <div className="toolbar-options-outer-panel" style={{height: panelHeight}}>
        <Toolbar className="toolbar-options-box">
          <ToolbarItem 
            key={0}
            location={"center"}
            text={text}
          />            
          {getToolbarButtons()}
        </Toolbar>        
      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default ToolbarOptions;

