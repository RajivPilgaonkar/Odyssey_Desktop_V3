import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import Box, {Item} from 'devextreme-react/box';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';
import { dbGetRecord, dbExecuteSp } from '../../../actions';
import DropDownGrid2 from "../../common/DropDownGrid2";
import { convertDMY_MDY } from "../../common/CommonTransactionFunctions";

// some of the devextreme css properties are overridden
import './RouteFinder.css';

import moment from 'moment';

class RouteFinderParams extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = { isDataFetched: null, renderToggle: false};

    this.var = {
      fromCities_id: -1, toCities_id: -1, wef: '01/01/2020', wefTime: '09:00',
      fromCity: '', toCity: '',
      fromCityLookup: [], toCityLookup: [],
      lockTime: false
    }
              
  }

  componentDidMount() {
    this._isMounted = true;

    this.var.fromCities_id = this.props.routeFinderParams.fromCities_id;
    this.var.toCities_id = this.props.routeFinderParams.toCities_id;
    this.var.wef = moment(new Date()).format('DD/MM/YYYY');
    this.var.wefTime = '09:00';

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    // pass these back to the calling form
    // this will cause a render in this form
    await this.getSelectedParams(0);

    const whereStr = "NightHalt = 1 AND city NOT LIKE '%***%'";
    this.var.fromCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities', where: whereStr});   
    this.var.toCityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: 'cities', where: whereStr});   

    if (this._isMounted) {
      this.setState({isDataFetched: true}, async () => {
        if (this.props.onPanelLoad !== undefined) {
          await this.props.onPanelLoad();
        }
      });
    }

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  getSelectedParams = async (mode) => {
  
    const routeFinderObj = {
      fromCities_id: this.var.fromCities_id, 
      toCities_id: this.var.toCities_id,
      wef: this.var.wef,
      wefTime: this.var.wefTime,
      lockTime: this.var.lockTime,
      dataRefreshMode: mode
    };

    if (this.props.getSelectedParams !== undefined) {
      await this.props.getSelectedParams(routeFinderObj);
    }

  }

  //**********************************************************/
  getSelectedFromCity = async (e) => {
    this.var.fromCities_id = e[0].cities_id;
    this.var.fromCity = e[0].city;
    this.setState({renderToggle: this.state.renderToggle});
  }

  //**********************************************************/
  getSelectedToCity = async (e) => {
    this.var.toCities_id = e[0].cities_id;
    this.var.toCity = e[0].city;
    this.setState({renderToggle: this.state.renderToggle});
  }

  //**********************************************************/
  fromDateValueChanged = (e) => {
    this.var.wef = moment(e.value).format('DD/MM/YYYY');
    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  timeValueChanged = (e) => {
    this.var.wefTime = moment(e.value).format('HH:mm');
    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  lockTime = () => {
    this.var.lockTime = !this.var.lockTime;
    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  getEarliestTime = async (e) => {

    let wefTime = '09:00';
  
    let sql = "EXECUTE p_RouteFinder_EarliestPrefTrain " + 
      this.var.fromCities_id.toString() + ", " +
      this.var.toCities_id.toString() + ", '" +
      convertDMY_MDY(this.var.wef) + "'";  
  
    let spData = {sql: sql};
    const timeQry = await dbExecuteSp(spData);
  
    if (timeQry.length > 0 && timeQry[0].EarliestTime !== null) {
      if (timeQry[0].EarliestTime < wefTime) {
        wefTime = timeQry[0].EarliestTime;
      }
    }
  
    this.var.wefTime = wefTime;
    
  }
  

  //**********************************************************/
  refreshRouteFinderData = async (e) => {

    if (!this.var.lockTime) {
      await this.getEarliestTime();
      this.setState({renderToggle: !this.state.renderToggle});  
    }

    await this.getSelectedParams(1);

  }

  //**********************************************************/
  renderContent() {

    const panelHeight = (this.props.height === undefined) ? 60 : this.props.height;

    const panelContainerStyle = {
      minHeight: 50,
      height: panelHeight,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f0'
    };

    const boxStyle = {
      direction: 'row',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      background: '#f5f5f0',
      padding: '0px'
    };

    const itemStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      background: '#f5f5f0',
      padding: '0px',
      flexDirection: 'row'
    };

    const dateBoxStyle = {
      //flex: 4,
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 16,
      color: '#000000',
      padding: '0px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    };


    if (!this.state.isDataFetched) {
      return (
        <div style={panelContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={panelContainerStyle.height-20} />
        </div>
      )
    }

    const wef = moment(this.var.wef,'DD/MM/YYYY').toDate();
    const wefTime = moment(convertDMY_MDY(this.var.wef) + ' ' + this.var.wefTime).toDate();

    const lockColor = (this.var.lockTime) ? '#ffb3b3' : '#d6f5d6';
    const lockHint = (this.var.lockTime) ? 'Unlock Time' : 'Lock Time';
    const lockIcon = (this.var.lockTime) ? "icons/unlock.png" : "icons/lock.png";

    return (
      <div id="roundedbox" style={panelContainerStyle}>
        <Box style={boxStyle}>
          <Item ratio={5} style={itemStyle} >            

            <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>

              <div style={{flex: 2, paddingRight: '10px'}}>
                <DropDownGrid2
                  listArray={this.var.fromCityLookup}
                  fieldList={['city']}
                  valueExpr="cities_id"
                  displayExpr="city"
                  label="From City"
                  placeholder="Select a From City..."
                  getSelectedRecord={this.getSelectedFromCity}
                  style={{width: 100}}
                  showColumnHeaders={false}
                  value={this.var.fromCities_id}
                />
              </div>

              <div style={{flex: 2, paddingRight: '10px'}}>
                <DropDownGrid2
                  listArray={this.var.toCityLookup}
                  fieldList={['city']}
                  valueExpr="cities_id"
                  displayExpr="city"
                  label="To City"
                  placeholder="Select a To City..."
                  getSelectedRecord={this.getSelectedToCity}
                  style={{width: 100}}
                  showColumnHeaders={false}
                  value={this.var.toCities_id}
                />
              </div>


              <div style={{...dateBoxStyle, flex: 1}}>
                <Button
                  width={100}
                  text="Get Route"
                  type="normal"
                  stylingMode="outlined"
                  onClick={this.refreshRouteFinderData}
                />
              </div>

            </div>

          </Item>

          <Item ratio={4}>
            <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
              <div style={{flex: 3, paddingRight: '10px', display: 'flex', flexDirection: 'row'}}>
                <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
                  As On
                </div>
                <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
                  <DateBox 
                    type={"date"}
                    width={180}
                    displayFormat={"dd/MM/yyyy"}
                    value={wef} 
                    onValueChanged={this.fromDateValueChanged}
                    style={{fontSize: 18}}
                    acceptCustomValue={false}
                  />
                </div>
              </div>
              <div style={{flex: 2, paddingRight: '10px', display: 'flex', flexDirection: 'row'}}>
                <div style={{paddingRight: '5px', fontSize: 16, display: 'flex', alignItems: 'center'}}>
                  Time
                </div>
                <div style={{paddingRight: '5px', fontSize: 18, display: 'flex', alignItems: 'center'}}>
                  <DateBox 
                    type={"time"}
                    width={100}
                    displayFormat={"HH:mm"}
                    value={wefTime} 
                    onValueChanged={this.timeValueChanged}
                    style={{fontSize: 18}}
                    acceptCustomValue={false}
                  />
                </div>
                <div style={{display: 'flex', alignItems: 'center', backgroundColor: lockColor}}>
                  <Button
                    width={35}
                    height={35}
                    type="normal"
                    stylingMode="outlined"
                    icon={lockIcon}
                    hint={lockHint}
                    onClick={this.lockTime}
                  />
                </div>
              </div>
              <div style={{flex: 1, paddingRight: '10px'}}>
              </div>
            </div>
          </Item>

        </Box>        

      </div>

    );


  }

  //**********************************************************/
  render() {

    return (
      this.renderContent()
    );
  }

}

const mapStateToProps = (state) => {
  return {
    dbUser: state.dbUser,
    routeFinderParams: state.routeFinderParams
  };
};

const mapDispatchToProps = () => {
  return {
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(RouteFinderParams));

