import React from 'react';
import { useSelector } from 'react-redux';
//import { Icon } from 'antd';

import './Footer.css';

function Footer () {

  const _g_company = useSelector(state => state.company.company);
  const _g_address = useSelector(state => state.company.address);
  const _g_email = useSelector(state => state.company.email);
  const _g_phone = useSelector(state => state.company.phone);  
  const _g_copyright = `2023. ${_g_company}. All rights reserved`;  

  //**********************************************************/
  const companyLine = () => {

    return (
      <div style={{color: 'rgba(255,255,255,1)', fontWeight: '600', fontSize: 24, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
        {_g_company}
      </div>
    )

  }

  //**********************************************************/
  const addressLine = () => {

    return (
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: 'rgba(255,255,255,1)', fontSize: 14, letterSpacing: '0.04em', display: 'flex', flex: 2, justifyContent: 'flex-start', alignItems: 'center'}}>
          {_g_address}
        </div>
        <div style={{color: 'rgba(255,255,255,1)', fontSize: 14, letterSpacing: '0.04em', display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
          {_g_email}
        </div>
      </div>
    )

  }

  //**********************************************************/
  const phoneLine = () => {

    const spaces = '  ';

    return (
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', flex: 2, justifyContent: 'flex-start', alignItems: 'center'}}>
          {spaces}
        </div>
        <div style={{color: 'rgba(255,255,255,1)', fontSize: 14, letterSpacing: '0.04em', display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
          {_g_phone}
        </div>
      </div>
    )

  }

  //**********************************************************/
  const copyrightLine = () => {

    return (
      <div style={{color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: '0.04em', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {_g_copyright}
      </div>
    )

  }
  
  //**********************************************************/
  const renderContent = () => {

    return (

      <div className="footer-outer-container">

        <div style={{flex: 0.5, height: '100%'}}>
        </div>

        <div className="footer-inner-container">
          <div className="footer-text-lines" style={{flex: 7}}>
            {companyLine()}
          </div>
          <div className="footer-text-lines" style={{flex: 4}}>
            {addressLine()}
          </div>
          <div className="footer-text-lines" style={{flex: 4}}>
            {phoneLine()}
          </div>
          <div className="footer-text-lines" style={{flex: 3}}>
            {copyrightLine()}
          </div>
        </div>

        <div style={{flex: 0.5, height: '100%'}}>
        </div>

        {/*1===2 &&
          <Icon></Icon>
    */}

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default Footer;

