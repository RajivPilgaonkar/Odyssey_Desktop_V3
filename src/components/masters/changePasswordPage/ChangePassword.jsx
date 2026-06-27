import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { dbGetRecord, dbExecuteSp, setUserValues } from '../../../actions';
import {Button} from 'devextreme-react/button';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {setFocusedRow, getViewContainerHeights} from "../../common/MasterGridHelpers";
import {getAdmLevelLocation} from "../../common/GetDescFromIds";
import TextBox from 'devextreme-react/text-box';

import '../../common/MasterGrid.css'
import '../../common/FormLabelText.css'

let compVar = {};

function ChangePassword() {

  const [initDataFetched, setInitDataFetched] = useState(false);  
  const [dataFetched, setDataFetched] = useState(false);  
  const [renderToggle, setRenderToggle] = useState(false);  

  // get from redux store
  const _g_users_id = useSelector(state => state.dbUser.users_id);

  const _g_location = useLocation();

  const dispatch = useDispatch();

  const _g_navigate = useNavigate();  

  //**********************************************************/
  // This should execute only once and not on every render
  // Ensure that 2nd argument is []
  // This is called once when the component mounts
  useEffect (() => {
    // Object for component variables
    compVar = {
      mainData: [],
      tableName: 'AdmUsers', keyField: 'AdmUsers_id',
      errorMsg: '', 
      admLevel: 1,
      userName: '',
      dbLookup: [       
      ],
      passwordArr: [
        {key: 1, title: 'New Password', pwd: '', onValueChanged: onPwdChange},
        {key: 2, title: 'Confirm Password', pwd: '', onValueChanged: onPwdConfirmChange}
      ]
    }   
        
    fetchInitialData();
    filterData();

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
  const fetchInitialData = async() => {
    try {
      compVar.admLevel = await getAdmLevelLocation (_g_users_id, _g_location);
    } catch(err) {
      alert(err);
    }
  
    setInitDataFetched(true);
  }

  //**********************************************************/
  const filterData = async() => {
    setDataFetched(false);

    let fieldArray = ['AdmUsers_id', 'Uid', 'Pwd', 'UserName'];
    try {
      const whereStr = 'AdmUsers_id = ' + _g_users_id.toString();
      compVar.mainData =  await dbGetRecord({fields: fieldArray, orders: ['AdmUsers_id'], table: 'AdmUsers', where: whereStr, x_uid: _g_users_id, x_module: 'Aircraft Types'});   

      if (compVar.mainData.length > 0) {
        compVar.userName = compVar.mainData[0].UserName;
      }
    } catch(err) {
      alert(err);
    }
    setFocusedRow(compVar);
    setDataFetched(true);
  }

  //**********************************************************/
  const forceRender = () => {
    // Force a render
    setRenderToggle(renderToggle => {return !renderToggle});

    // just a dummy line to get rid of the compiler message
    compVar.renderToggle = renderToggle;
  }

  //**********************************************************/
  const onPwdChange = async (e) => {    
    compVar.passwordArr[0].pwd = e.value;
    forceRender();
  }

  //**********************************************************/
  const onPwdConfirmChange = async (e) => {    
    compVar.passwordArr[1].pwd = e.value;
    forceRender();
  }

  //**********************************************************/
  const cancelChanges = ()  => {
    _g_navigate(-1);
  }

  //**********************************************************/
  const saveChanges = async ()  => {
    const spData = {sql: `UPDATE AdmUsers SET Pwd = '${compVar.passwordArr[0].pwd}' 
       WHERE AdmUsers_id = ${_g_users_id.toString()}`, x_uid: _g_users_id, x_module: 'Change Password'};
    try {
      await dbExecuteSp(spData);  
    } catch (err) {
      alert(err);
    }

    // reset redux store so you are forced to login again
    await dispatch(setUserValues({
      users_id: -1, userName: '', superuser: false }));    

    _g_navigate(-1);
  }

  //**********************************************************/
  const pwdBoxJsx = () => {    

    return compVar.passwordArr.map((rec,index) => {
      return (
        <div key={index} className="formlabeltext-outer-container">

          <div className="formlabeltext-inner-container">

            <div className="formlabeltext-inner-container-label" style={{justifyContent: 'center', flex: 1}}>
              {`${rec.title}`}
            </div>

            <div className="formlabeltext-inner-container-text" style={{justifyContent: 'center', flex: 2.5}}>
              <TextBox
                value={compVar.passwordArr[index].pwd}
                style={{fontSize: 18}}
                onValueChanged={rec.onValueChanged}
                maxLength={8}
              />
            </div>

          </div>

        </div>

      )

    })
  }

  //**********************************************************/
  const renderContent = () => {

    const boxWidth = 500;
    const boxHeight = 150;

    const heights = getViewContainerHeights(compVar);
    const containerHeight = heights.containerHeight;

    // Show spinner if data not yet fetched
    if (!initDataFetched || !dataFetched) {
      return (
        <div className="master-grid-container" style={{height: containerHeight}}>
           <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    // Save button enabled only when both passwords match
    let disabled = true;
    if ((compVar.passwordArr[0].pwd.trim().length > 0) && (compVar.passwordArr[1].pwd.trim().length > 0)) {
      if (compVar.passwordArr[0].pwd.trim() === compVar.passwordArr[1].pwd.trim()) {
        disabled = false;
      }
    }
    
    return (
      <>
        <div className="master-grid-container" style={{height: containerHeight}}>

          <div className="formlabeltext-heading">
            {`${compVar.userName}` }
          </div>

          <div className="formlabeltext-box-container" style={{height: boxHeight, width: boxWidth}}>
            {pwdBoxJsx()}
          </div>

          <div className="formlabeltext-button-container" style={{height: 60, width: boxWidth}}>
            <div className="formlabeltext-button-position">
              <Button text="Cancel" type="default" onClick={cancelChanges}/>
            </div>
            <div className="formlabeltext-button-position">
              <Button text="Save" disabled={disabled} type="success" onClick={saveChanges}/>
            </div>
          </div>

        </div>

      </>

    );

  }

  return (
    <>
      {renderContent()}
    </>
  )


};

export default ChangePassword;
