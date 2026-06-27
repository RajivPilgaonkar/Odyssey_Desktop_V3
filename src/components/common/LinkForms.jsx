import React from 'react';
import { useNavigate } from 'react-router-dom';
import DropDownButton from 'devextreme-react/drop-down-button';

function LinkForms (props) {

  const _g_navigate = useNavigate();

  const compVar = { 
    linksData: [
      {id: 1, caption: 'Tours', linkTo: '/PrestoList', backRoute: false},
      {id: 2, caption: 'Modules', linkTo: '/ModuleQuotations', backRoute: false},
      {id: 3, caption: 'Route Finder', linkTo: '/RouteFinder', backRoute: true},
      {id: 4, caption: 'Vouchers', linkTo: '/GenVoucher', backRoute: false},
      {id: 5, caption: 'Addressbook', linkTo: '/Addressbook', backRoute: true},
      {id: 6, caption: 'Invoices', linkTo: '/GenInvoice', backRoute: false},
      {id: 7, caption: 'Elements', linkTo: '/Elements', backRoute: true},
      {id: 8, caption: 'Room Types', linkTo: '/RoomTypes', backRoute: true},
    ]
  };

  //**********************************************************/
  const onReportClick = async (e) => {

    const idx = compVar.linksData.findIndex(rec => rec.id === e.itemData.id);
    if (idx > -1) {
      _g_navigate(compVar.linksData[idx].linkTo,
        {state: {auth: true, backRoute: compVar.linksData[idx].backRoute}});
    }

  }
  
  //**********************************************************/
  const renderContent = () => {

    const linksData = compVar.linksData.filter(e => !props.hideElem.includes(e.id));

    return (    
      <DropDownButton
        icon="link"
        width={50}
        dropDownOptions={{width: 150}}
        items={linksData}
        keyExpr={"id"}
        displayExpr={"caption"}
        onItemClick={onReportClick}
      />                                
    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default LinkForms;

