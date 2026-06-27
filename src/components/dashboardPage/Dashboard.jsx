import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { HEADER_HEIGHT} from '../../config/paths';
import {menuArray, cardArray} from './GetMenu';
import List from 'devextreme-react/list';
import { Button } from 'devextreme-react/button';
import {getAdmLevelLocation} from "../common/GetDescFromIds";
import {authVerifyToken, setUserValues, setDashboardMenuOptions} from "../../actions";

import './Dashboard.css';

let compVar = {};

function Dashboard () {

  const [renderToggle, setRenderToggle] = useState(false);  

  const groups = [
    {key: 0, groupNo: 0, label: 'TRANSACTIONS'}, 
    {key: 1, groupNo: 1, label: 'MASTERS'}, 
    {key: 2, groupNo: 2, label: 'ADMIN'}
  ];

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);
  const _g_activeMainGroupNo = useSelector(state => state.dashboardMenu.mainMenu.tabGroup);
  const _g_activeCardGroupNo = useSelector(state => state.dashboardMenu.mainMenu.cardGroup);
  const _g_accessToken = useSelector(state => state.dbUser.accessToken);

  const _g_location = useLocation();
  const _g_navigate = useNavigate();

  const dispatch = useDispatch();

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      renderToggle: false,
      activeMainGroupNo: _g_activeMainGroupNo,
      activeCardGroupNo: _g_activeCardGroupNo,
      activeMenu: [],
      admLevel: 0
    }   

    fetchInitialData();

    // This is called once when the component un-mounts (cleanup)
    // Perform any cleanup tasks here, such as clearing timers or subscriptions
    return () => {
    };
  }, []);

  //**********************************************************/
  const fetchInitialData = async () => {

    // Verify Access Token
    try {
      await authVerifyToken({accessToken: _g_accessToken});         
    } catch(err) {
      console.log('Invalid token. Redirecting ...');

      // Reset user values in store
      dispatch(setUserValues({users_id: -1, userName: '', superuser: false}));        

      // Back to login
      _g_navigate('/Home', {state: {auth: true}});

    }


    await setActiveCardAndMenu();
    forceRender();
  }

  //**********************************************************/
  const menuItemJsx = (e) => {

    const color = (e.menu === 1) ? '#000000' : 'rgb(0, 102, 255)';
    const paddingLeft = (e.menu === 1) ? null : 20;
    const className = (e.menu === 1) ? 'dashboard-menu-title' : 'dashboard-menu-subtitle';
    const classClickName = (e.itemNo === 0) ? 'dashboard-menu-non-clickable' : 'dashboard-menu-clickable';

    const combinedClassName = className + ' ' + classClickName;

    return (
      <div key={e.key} onClick={() => onClickMenu(e)} className={combinedClassName} style={{color: color, paddingLeft: paddingLeft, fontSize: 16}}>
        {e.label}
      </div>
    );

  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});    

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const setActiveCardAndMenu = async () => {

    const activeMainGroupNo = (compVar.activeMainGroupNo !== undefined) ? compVar.activeMainGroupNo : 0;
    const activeCardGroupNo = (compVar.activeCardGroupNo !== undefined) ? compVar.activeCardGroupNo : 0;

    // check if both found in array -- mainGroup & cardGoup
    let idx = cardArray.findIndex(rec => rec.group === activeMainGroupNo && rec.key === activeCardGroupNo);
    // if not found, check only mainGroup
    if (idx < 0) {
      idx = cardArray.findIndex(rec => rec.group === activeMainGroupNo);
    }
    
    compVar.activeMainGroupNo = activeMainGroupNo;
    compVar.activeCardGroupNo = cardArray[idx].key;

    await setActiveCardMenu();

  }

  //**********************************************************/
  const setActiveCardMenu = async () => {
    compVar.activeMenu = menuArray.filter(rec => rec.group === compVar.activeCardGroupNo);
  }

  //**********************************************************/
  const onClickGroup = (e) => {
    compVar.activeMainGroupNo = e.groupNo;
    setActiveCardAndMenu();
    dispatch(setDashboardMenuOptions({tabGroup: compVar.activeMainGroupNo, cardGroup: compVar.activeCardGroupNo}));        
    forceRender();
  }

  //**********************************************************/
  const onClickCard = (e) => {
    compVar.activeCardGroupNo = e.key;
    setActiveCardMenu();
    dispatch(setDashboardMenuOptions({tabGroup: compVar.activeMainGroupNo, cardGroup: compVar.activeCardGroupNo}));
    forceRender();
  }

  //**********************************************************/
  const onClickMenu = async (e) => {

    const pathName = (e.route !== undefined && e.route.trim().length > 0) ? e.route : '/Dashboard';
    const menuModuleNo = (e.moduleNo !== undefined && e.moduleNo !== null) ? e.moduleNo : null;

    compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);
    if (compVar.admLevel < 2) {
      alert('Insufficient permissions');
      return;
    }

    // v6's navigate() resolves a relative path (no leading slash) by appending
    // it to the current path, unlike v5's history.push which replaced the last
    // segment - pathName comes from menu data without a leading slash, so force
    // an absolute path here to avoid landing on e.g. /Dashboard/Airlines
    const path = '/' + pathName;
    if (e.route !== undefined && e.route.trim().length > 0) {
      _g_navigate(path, {state: {auth: true, moduleNo: menuModuleNo}});
    }
  }
  
  //**********************************************************/
  const cardsJsx = (cardGroup) => {

    const groupArray = cardArray.filter(rec => rec.group === ((cardGroup === undefined) ? 0 : cardGroup));

    return groupArray.map(rec => {
      const active = (rec.key === compVar.activeCardGroupNo);
      const background = active ? 'rgb(255, 243, 230)' : null;
      return(
        <div key={rec.key} className="dashboard-div-card" style={{background: background}} onClick={() => onClickCard(rec)}>
          {rec.label}
        </div>
      )
    })
  }

  //**********************************************************/
  const buttonsJsx = () => {
    return (      
      groups.map(rec => {
        const activeMainGroupNo = (compVar.activeMainGroupNo !== undefined) ? compVar.activeMainGroupNo : 0;
        const color = (rec.groupNo === activeMainGroupNo) ? 'red' : null;
        return (
          <Button
            key={rec.groupNo}
            width={150}
            text={rec.label}
            type="normal"
            stylingMode="text"
            onClick={() => onClickGroup(rec)}
            style={{background: 'none', color: color, fontWeight: 500}}
          />        
        )
      })
    )    
  }
  
  //**********************************************************/
  const renderContent = () => {

    const containerHeight = window.innerHeight - HEADER_HEIGHT;

    return (

      <div style={{display: 'flex', flexDirection: 'row', width: '100%', height: containerHeight}}>

        <div className="dashboard-menu" style={{flex: 1, height: '100%'}}>
          <List
            dataSource={compVar.activeMenu}    
            keyExpr="key"
            displayExpr="label"
            focusStateEnabled={false}
            itemRender={menuItemJsx}           
            >
          </List>
        </div>

        <div className="dashboard-div-menu" style={{flex: 4}}>
          <div className="dashboard-div-menu-top" style={{flex: 2}}>          
            {buttonsJsx()}
          </div>
          <div className="dashboard-div-menu-bottom" style={{flex: 9}}>          
            <div className="dashboard-div-menu-bottom" style={{height: '80%'}}>
              {cardsJsx(compVar.activeMainGroupNo)}
            </div>
          </div>
        </div>

        <div className="dashboard-div-menu"  style={{flex: 0.3}}>
        </div>

      </div>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )

}


export default Dashboard;

