import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import Box, {Item} from 'devextreme-react/box';
import { Switch } from 'devextreme-react/switch';

import { convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import {getAgentName, getCityName} from "../../../common/GetDescFromIds";
import DropDownGrid2 from "../../../common/DropDownGrid2";
import { dbGetRecord } from '../../../../actions';

// some of the devextreme css properties are overridden
import './CostServices.css';

import moment from 'moment';

class CostServicesParams extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    // in this component wef remains a string
    var wef = '01/01/2020';

    this.state = { isDataFetched: null,  
                   agentSwitchValue: false, citySwitchValue: false, wefSwitchValue: false,
                   renderToggle: false
                  };

    this.var = {
      agents_id: -1, agent: '', cities_id: -1, city: '', wef: wef,
      agentLookup: [], cityLookup: [], wefLookup: [],
      formTitleOrg: '', formTitleCity: ''      
    }
              
  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    if ((this.props.params !== undefined) && (this.props.params.agents_id !== undefined)) {
      const agentObj = await getAgentName(this.props.params.agents_id);
      const cityObj = await getCityName(this.props.params.serviceCities_id);

      this.var = {...this.var, ...{
        agents_id: this.props.params.agents_id,
        agent: agentObj.Organisation,
        cities_id: this.props.params.serviceCities_id,
        city: cityObj.City,
        wef: this.props.params.wef /*=== wef in redux saved as string DD/mm/YYYY===*/,
        formTitleOrg: agentObj.Organisation,
        formTitleCity: cityObj.City
      }}

    }    

    await this.getAgentListing();   
    await this.getCitiesListing();
    await this.getWefListing();   

    // pass these back to the calling form
    // this will cause a render in this form
    await this.getSelectedParams(0);

    if (this._isMounted) {
      this.setState({isDataFetched: true}, async () => {
        await this.props.onPanelLoad();
      });
    }

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  componentDidUpdate = () => {
  }

  /*==========================================================*/
  getAgentListing = async () => {

    const transfer = (this.props.services !== undefined) && (!this.props.services) ? 1 : 0;

    let tableStr = "dbo.fn_addressbook(2,'A')";

    if (!this.state.agentSwitchValue) {
      tableStr = "dbo.fn_addressbook(2,'A') WHERE addressbook_id IN " + 
        "(SELECT cs.addressbook_id FROM costservices cs LEFT JOIN Services s ON cs.services_id = s.services_id WHERE s.transfer = " + transfer.toString() + ") ";
    }

    this.var.agentLookup = await dbGetRecord({fields: ["Addressbook_id, Organisation, City, COALESCE(Organisation,'') + ', ' + COALESCE(City,'') AS OrgCity "], orders: ['Organisation'], table: tableStr, file: 'CostServiceParams'});

  }

  /*==========================================================*/
  getCitiesListing = async () => {

    const transfer = (this.props.services !== undefined) && (!this.props.services) ? 1 : 0;

    let tableStr = 'cities c';

    if (!this.state.citySwitchValue) {
      tableStr = "cities c WHERE c.cities_id IN " + 
        "(SELECT cs.cities_id FROM costservices cs LEFT JOIN Services s ON cs.services_id = s.services_id WHERE cs.addressbook_id = " + this.var.agents_id.toString() + " AND s.transfer = " + transfer.toString() + " )";
    }

    this.var.cityLookup = await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: tableStr, file: 'CostServiceParams'});   

  }

  /*==========================================================*/
  getWefListing = async () => {

    // all wef dates
    let whereStr = ' addressbook_id = ' + this.var.agents_id + ' AND ' + 
      'cities_id = ' + this.var.cities_id;

    // only in the last 3 years
    if (!this.state.wefSwitchValue) {
      whereStr = whereStr + ' AND wef > DATEADD(year,-3,GETDATE()) '; 
    } 

    this.var.wefLookup = await dbGetRecord({fields: ["DISTINCT wef"], orders: ['wef DESC'], table: 'costservices', where: whereStr, file: 'CostServiceParams'});

    // change the date format to DD/MM/YYYY and date to string
    this.var.wefLookup = this.var.wefLookup.map(rec => ({wef: moment(rec.wef).format('DD/MM/YYYY')}));

  }

  //**********************************************************/
  getSelectedAgent = async (e) => {

    // do not refresh until all the below statements have completed

    const tableStr = 'costservices cs LEFT JOIN Addressbook a ON cs.addressbook_id = a.addressbook_id ' + 
      'LEFT JOIN Cities c ON a.cities_id = c.cities_id ';
    const whereStr = 'cs.addressbook_id = ' + e[0].Addressbook_id + ' AND ' +
      'cs.cities_id = a.cities_id';
    const citiesArr = await dbGetRecord({fields: ["c.cities_id, c.city"], orders: ['cs.wef DESC'], table: tableStr, where: whereStr, file: 'CostServiceParams'});
    const cities_id = (citiesArr.length > 0) ? citiesArr[0].cities_id : -1;
    const city = (citiesArr.length > 0) ? citiesArr[0].city : '';

    this.var.agents_id = e[0].Addressbook_id;
    this.var.agent = e[0].OrgCity;
    this.var.cities_id = cities_id;
    this.var.city = city;
    this.var.formTitleOrg = e[0].OrgCity;

    await this.getCitiesListing();
    await this.getWefListing();
    await this.getSelectedParams(1);

  }


  //**********************************************************/
  getSelectedCity = async (e) => {

    this.var.cities_id = e[0].cities_id;
    this.var.city = e[0].city;
    this.var.formTitleCity = e[0].city;

    await this.getWefListing();
    await this.getSelectedParams(1);
  }
  


  //**********************************************************/
  getSelectedWef = async (e) => {
    this.var.wef = e[0].wef;
    await this.getSelectedParams(1);

  }

  //**********************************************************/
  getSelectedParams = async (mode) => {

    // This takes the parameters down to the parent form -> CostAccommodation
  
    if ((mode === 0) ||
        ((this.var.agents_id !== this.props.params.agents_id) ||
         (this.var.cities_id !== this.props.params.cities_id) ||
         (this.var.wef !== this.props.params.wef))) {

      const transfer = (this.props.services !== undefined) && (!this.props.services) ? 1 : 0;

      const tableStr = "costservices cs LEFT JOIN services s ON cs.services_id = s.services_id ";
      const whereStr = "cs.addressbook_id = " + this.var.agents_id + " AND " +
        "cs.cities_id = " + this.var.cities_id + " AND cs.wef = '" + convertDMY_MDY(this.var.wef) + "' AND " + 
        "s.transfer = " + transfer.toString();
      const costServices = await dbGetRecord({fields: ["costservices_id"], orders: ['costservices_id'], table: tableStr, where: whereStr, file: 'CostServicesParams'});
      
      let costServicesObj = {costservices_id: -1};
      if (costServices.length > '') {
        costServicesObj = {costservices_id: costServices[0].costservices_id};
      }

      await this.props.getSelectedParams(
        { agents_id: this.var.agents_id,
          cities_id: this.var.cities_id,
          wef: this.var.wef,
          costservices_id: costServicesObj.costservices_id,
          formTitle: this.var.formTitleOrg + ' [' + this.var.formTitleCity + ']'
        }        
      );

    }

  }


  //**********************************************************/
  agentSwitchValueChanged = async (e) => {
    this.setState({agentSwitchValue: e.value}, async () => {
      await this.getAgentListing();
      this.setState({renderToggle: !this.state.renderToggle });
    });
  }
  
  //**********************************************************/
  citySwitchValueChanged = async (e) => {
    this.setState({citySwitchValue: e.value}, async () => {
      await this.getCitiesListing();
      this.setState({renderToggle: !this.state.renderToggle });
    });
  }

  //**********************************************************/
  wefSwitchValueChanged = async (e) => {
    this.setState({wefSwitchValue: e.value}, async() => {
      await this.getWefListing();
      this.setState({renderToggle: !this.state.renderToggle });
    });
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

    if (!this.state.isDataFetched) {
      return (
        <div style={panelContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={panelContainerStyle.height-20} />
        </div>
      )
    }

    // Be careful with moment (it can change the parameter you pass into it)
    let wef = this.var.wef;
    wef = moment(wef,'DD/MM/YYYY').format('DD/MM/YYYY');

    return (
      <div id="roundedbox" style={panelContainerStyle}>
        <Box style={boxStyle}>
          <Item ratio={4} style={itemStyle} >            
            <div style={{...itemStyle, ...{paddingRight: '50px'}}}>
              <DropDownGrid2
                  listArray={this.var.agentLookup}
                  fieldList={['Organisation','City']}
                  valueExpr="Addressbook_id"
                  displayExpr="OrgCity"
                  label="Agent"
                  placeholder="Select an Agent..."
                  getSelectedRecord={this.getSelectedAgent}
                  value={this.var.agent}
              />
              <Switch 
                value={this.state.agentSwitchValue}
                onValueChanged={this.agentSwitchValueChanged}
                switchedOnText="ALL"
                switchedOffText="FILTER"
                style={{height: '100%'}}
              >
              </Switch>              
            </div>
          </Item>
          <Item ratio={3}>
            <div style={{...itemStyle, ...{paddingRight: '50px'}}}>
            <DropDownGrid2
               listArray={this.var.cityLookup}
                fieldList={['city']}
                valueExpr="cities_id"
                displayExpr="city"
                label="Service City"
                placeholder="Select a Service City..."
                getSelectedRecord={this.getSelectedCity}
                style={{width: 200,flexGrow:1}}
                showColumnHeaders={false}
                value={this.var.city}
            />

              <Switch 
                value={this.state.citySwitchValue}
                onValueChanged={this.citySwitchValueChanged}
                switchedOnText="ALL"
                switchedOffText="FILTER"
                style={{height: '100%'}}
              >
              </Switch>
            </div>

          </Item>
          <Item ratio={2}>
          <div style={{...itemStyle, ...{paddingRight: '50px'}}}>
              <DropDownGrid2
               listArray={this.var.wefLookup}
                fieldList={['wef']}
                valueExpr="wef"
                displayExpr="wef"
                label="Wef"
                getSelectedRecord={this.getSelectedWef}
                style={{width: 50,flexGrow:1}}
                showColumnHeaders={false}
                value={wef}
            />
              <Switch 
                value={this.state.wefSwitchValue}
                onValueChanged={this.wefSwitchValueChanged}
                switchedOnText="ALL"
                switchedOffText="FILTER"
                style={{height: '100%'}}
              >
              </Switch>

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
    params: state.params
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostServicesParams));

