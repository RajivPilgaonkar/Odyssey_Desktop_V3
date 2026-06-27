import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'devextreme-react/button';
import { Popover } from 'devextreme-react/popover';
import ScrollView from 'devextreme-react/scroll-view';
import {Popup} from 'devextreme-react/popup';
import DropDownButton from 'devextreme-react/drop-down-button';
import TextBox from 'devextreme-react/text-box';
import { setUserValues, generateToken, dbGetRecordRaw } from '../../actions';

import { WEBPAGE_LANDING } from '../../actions/types';
import { WEBPAGE_DASHBOARD } from '../../actions/types';

import './Header.css';

let compVar = {};

function HeaderBar (props) {

  const [renderToggle, setRenderToggle] = useState(false);  
  const [helpPopoverVisible, setHelpPopoverVisible] = useState(false);

  const _g_users_id = useSelector(state => state.dbUser.users_id);
  const _g_userName = useSelector(state => state.dbUser.userName);
  const _g_tokenExpiryDays = useSelector(state => state.dbUser.tokenExpiryDays);

  const _g_webPages_id = useSelector(state => state.webPage.webPages_id);
  const _g_company = useSelector(state => state.company.company);
    
  const _g_navigate = useNavigate();

  // use this to write to the redux store
  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      users_id: _g_users_id, userName: _g_userName,
      tokenExpiryDays: _g_tokenExpiryDays,
      isSignedIn: (_g_users_id < 1) ? false: true,
      errorMsg: '',
      renderToggle: false,
      password: '',
      loginFormOpen: false
    }   

    fetchInitialData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);

  //**********************************************************/
  // This should execute only when the errorMsg changes
  // Ensure that 2nd argument is [errorMsg]
  // After 5 sec, the error message is auto-closed
  useEffect (() => {
    if (compVar.errorMsg > '') {
      setTimeout(() => {
        compVar.errorMsg = '';
        forceRender();
      }, 5000)
    }

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };

  }, [compVar.errorMsg]);

  //**********************************************************/
  const fetchInitialData = () => {

    if (compVar.users_id > 0 && _g_webPages_id === WEBPAGE_LANDING) {
      _g_navigate('/Dashboard', {state: {auth: true}});
    }

    forceRender();

  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});    

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const gotoHomePage = () => {
    if (_g_webPages_id !== WEBPAGE_DASHBOARD) {
      _g_navigate('/Dashboard', {state: {auth: true}});
    }
  }

  //**********************************************************/
  const goBack = () => {
    _g_navigate(-1);
  }

  //**********************************************************/
  const onHelpClick = async () => {
    setHelpPopoverVisible(helpPopoverVisible => {return !helpPopoverVisible});    
  }

  //**********************************************************/
  const logoutClick = async () => {

    dispatch(setUserValues({
      users_id: -1, 
      userName: '', 
      superuser: false
    }));

    _g_navigate('/Home', {state: {auth: true}});

  }

  //**********************************************************/
  const loginClick = async () => {
    compVar.loginFormOpen = true;
    forceRender();
  }

  //**********************************************************/
  const connectClick = async () => {

    const query = `SELECT AdmUsers_id, uid, SuperUser, TokenExpiryDays FROM admusers 
      WHERE uid='${compVar.userName.trim()}'
      AND Pwd = '${compVar.password.trim()}'`;

    const loginArr = await dbGetRecordRaw({query: query });
    if (loginArr.length > 0) {
      compVar.users_id = loginArr[0].AdmUsers_id;
      compVar.userName = loginArr[0].uid;
      compVar.superuser = loginArr[0].SuperUser;
      compVar.tokenExpiryDays = loginArr[0].TokenExpiryDays;
      compVar.errorMsg = '';
    } else {
      compVar.users_id = -1;
      compVar.superuser = false;
      compVar.tokenExpiryDays = 1;
      compVar.errorMsg = 'Invalid Username/Password';
    }

    // Get token expiry days
    const expiryDays = (compVar.tokenExpiryDays === undefined || 
      compVar.tokenExpiryDays === null || compVar.tokenExpiryDays < 0) ? 1 : compVar.tokenExpiryDays;

    // Generate new token
    try {
      const token = await generateToken({userName: compVar.userName, expiryDays: expiryDays});         

      // Save newly generated token to the redux store
      dispatch(setUserValues({
        accessToken: token.accessToken,
        users_id: compVar.users_id,
        userName: compVar.userName,
        superuser: compVar.superuser,
        tokenExpiryDays: compVar.tokenExpiryDays
      }));        
    } catch (err) {
      alert('There was a problem in generating a token');        
    }

    if (compVar.users_id >= 0) {
      compVar.isSignedIn = true;
      compVar.loginFormOpen = false;
      _g_navigate('/Dashboard', {state: {auth: true}});
    } else {
      compVar.isSignedIn = false;
      compVar.loginFormOpen = true;
    }

    forceRender();

  }

  //**********************************************************/
  const cancelClick = () => {
    compVar.loginFormOpen = false;
    forceRender();    
  }

  //**********************************************************/
  const onHiding = () => {
    cancelClick();
  }

  //**********************************************************/
  const onUsernameChange = async (e) => {    
    compVar.userName = e.value;
    forceRender();
  }

  //**********************************************************/
  const onPasswordChange = async (e) => {    
    compVar.password = e.value;
    forceRender();
  }

  //**********************************************************/
  const loginPopupForm = () => {
    return (
      <>
        <Popup
          visible={!compVar.isSignedIn}
          hideOnOutsideClick={false}
          height={300}
          width={350}
          title={'Login'}
          showTitle={true}          
          onHiding={onHiding}
        >
          {loginForm()}
        </Popup>
      </>
    )
  }

  //**********************************************************/
  const loginForm = () => {
    return (
      <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%'}}>
        <div style={{display: 'flex', flexDirection: 'row', flex: 1, width: '100%', color: 'rgb(0,0,0,0.54)', fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.00938em', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'}}>
          Please enter your username & password
        </div>
        <div style={{display: 'flex', flexDirection: 'row', flex: 1, width: '100%', color: 'rgb(0,0,0,0.87)', fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.00938em', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'}}>
          {inputsJsx(0)}
        </div>
        <div style={{display: 'flex', flexDirection: 'row', flex: 1, width: '100%', color: 'rgb(0,0,0,0.87)', fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.00938em', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'}}>
          {inputsJsx(1)}
        </div>

        <div style={{display: 'flex', flex: 1.3, width: '100%', border: 'none', borderBottom: '0.5px solid rgba(0,0,0,0.1)', marginBottom: 20}}>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', flex: 2, justifyContent: 'flex-end', width: '100%' }}>
          {buttonsJsx(5)}
          <div style={{width: 10}}></div>
          {buttonsJsx(4)}
        </div>
        {compVar.errorMsg !== undefined && compVar.errorMsg !== null && compVar.errorMsg.trim().length > 0 &&
          <div style={{display: 'flex', flexDirection: 'row', flex: 0.5, height: '100%', justifyContent: 'flex-start', alignItems: 'center', color: '#ff0000', fontSize: '0.875rem', fontWeight: 500, fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', lineHeight: 1.75, letterSpacing: '0.02857em'}}>
            {compVar.errorMsg}
          </div>
        }
      </div>
    )
  }

  //**********************************************************/
  const inputsJsx = (index) => {

    const labels = ['Username', 'Password'];
    const widths = [200, 200];
    const valueChanges = [onUsernameChange, onPasswordChange];
    const enterClicks = [null, null];
    const maxLengths = [8, 8];
    const heights = [35, 35];
    const values = [compVar.userName, compVar.password];
    const styles = [{fontSize: 18}, {fontSize: 18}];
    const modes = [null, 'password'];
  
    const label = labels[index];
    const width = widths[index];
    const valueChange = valueChanges[index];
    const enterClick = enterClicks[index];
    const maxLength = maxLengths[index];
    const height = heights[index];
    const value = values[index];
    const style = styles[index];
    const mode = modes[index];

    return (
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <div style={{flex: 1, height: '100%', display: 'flex', alignItems: 'center'}}>          
          {label}
        </div>
        <div className="header-input-text" style={{flex: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <TextBox 
            value={value}
            width={width}
            onValueChanged={valueChange}
            onEnterKey={enterClick}
            maxLength={maxLength}
            height={height}
            style={style}
            mode={mode}
          />
        </div>
      </div>
    );
    
  }

  //**********************************************************/
  const buttonsJsx = (index) => {

    const iconHome = (props.backRoute !== undefined && props.backRoute) ? 'back' : 'home';
    const hintHome = (props.backRoute !== undefined && props.backRoute) ? 'Back' : 'Home';
    const clickHome = (props.backRoute !== undefined && props.backRoute) ? goBack : gotoHomePage;

    const loginText = (compVar.users_id !== undefined && compVar.users_id > 0) ? 'LOGOUT' : 'LOGIN';
    const onLoginClick = (compVar.users_id !== undefined && compVar.users_id > 0) ? logoutClick : loginClick;

    const helpVisible = (props.help !== undefined);

    const widths = [35,35,120,35,90,90];
    const heights = [35,35,35,35,35,35];
    const types = ['normal','normal','normal','normal','success','default'];
    const stylingModes = ['outlined','outlined','text','outlined',null,null];
    const texts = [null,null,loginText,null,'LOGIN','CANCEL'];
    const icons = [iconHome,'help',null,'menu',null,null];
    const hints = [hintHome, 'Help', null, null,null,null];
    const clicks = [clickHome, onHelpClick, onLoginClick, null, connectClick, cancelClick];
    const visibles = [true, helpVisible, true, true, true, true];

    const width = widths[index];
    const height = heights[index];
    const type = types[index];
    const stylingMode = stylingModes[index];
    const text = texts[index];
    const icon = icons[index];
    const hint = hints[index];
    const click = clicks[index];
    const visible = visibles[index];

    return (
      <Button
        width={width}
        height={height}
        type={type}
        stylingMode={stylingMode}
        text={text}
        icon={icon}
        hint={hint}
        onClick={click}
        visible={visible}
      />
    );
  }

  //**********************************************************/
  const dropDownButtonJsx = (index) => {

    const texts = [null];
    const icons = ['menu']
    const widths = [50];
    const dropDownOptions = [{width: 200}];
    const items = [null];
    const onItemClicks = [null];

    const text = texts[index];
    const icon = icons[index];
    const width = widths[index];
    const dropDownOption = dropDownOptions[index];
    const item = items[index];
    const onItemClick = onItemClicks[index];
    
    return (
      <DropDownButton
        text={text}
        icon={icon}
        width={width}
        dropDownOptions={dropDownOption}
        items={item}
        keyExpr={"id"}
        displayExpr={"text"}
        onItemClick={onItemClick}
      />
    )

  }


  //**********************************************************/
  const helpPopoverJsx = () => {
    return (
      <Popover      
        target={'#helpButton'}
        position="bottom"
        width={1000}
        visible={helpPopoverVisible}
      >
        <ScrollView width='100%' height='100%' showScrollbar="always" useNative={false}>
          {props.help}
        </ScrollView>
      </Popover>
    ) ;
  }

  
  //**********************************************************/
  const renderContent = () => {

    return (

      <div className="header-outer-container">

        <div className='header-white-icon' style={{flex: 0.5, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {buttonsJsx(0)}
        </div>

        {props.menuRouteItems !== undefined &&
          <div className='header-white-icon' style={{flex: 0.5, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {dropDownButtonJsx(0)}
          </div>
        }

        <div style={{flex: 8, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>          
          <div style={{flex: 1, height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', color: '#ffffff', fontSize: '1.25rem', paddingLeft: 20, fontWeight: 500, fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', lineHeight: 1.6, letterSpacing: '0.0075em'}}> 
            {_g_company}
          </div>
          <div style={{flex: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', fontSize: 18}}>
            {_g_userName}
          </div>
        </div>

        <div className='header-white-icon' id="helpButton" style={{flex: 0.5, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {buttonsJsx(1)}
        </div>

        <div className='header-white-text' style={{flex: 1, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', fontSize: '0.875rem', fontWeight: 500, fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', lineHeight: 1.75, letterSpacing: '0.02857em'}}>
          {buttonsJsx(2)}
        </div>

        {helpPopoverVisible &&
          helpPopoverJsx()
        }

        {compVar.loginFormOpen !== undefined && compVar.loginFormOpen &&
          loginPopupForm()
        }

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default HeaderBar;

