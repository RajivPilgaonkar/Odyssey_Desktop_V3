import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import Box, {Item} from 'devextreme-react/box';
import { Switch } from 'devextreme-react/switch';

import {getAgentName, getCityName} from "../../../common/GetDescFromIds";
import DropDownGrid2 from "../../../common/DropDownGrid2";
import { dbGetRecord } from '../../../../actions';

// some of the devextreme css properties are overridden
import './CostAccommodation.css';

import moment from 'moment';

class CostAccommodationParams extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    // in this component wef remains a string
    var wef = '01/01/2020';

    this.state = { isDataFetched: null,  
                   hotels_id: -1, hotel: '',
                   cities_id: -1, city: '',
                   wef: wef,
                   hotelLookup: [], cityLookup: [], wefLookup: [],
                   hotelSwitchValue: false, citySwitchValue: false, wefSwitchValue: false,
                   formTitleOrg: '', formTitleCity: ''};
  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    if ((this.props.params !== undefined) && (this.props.params.hotels_id !== undefined)) {
      const hotelObj = await getAgentName(this.props.params.hotels_id);
      const cityObj = await getCityName(this.props.params.serviceCities_id);

      await this.setState({
        hotels_id: this.props.params.hotels_id,
        hotel: hotelObj.Organisation,
        cities_id: this.props.params.serviceCities_id,
        city: cityObj.City,
        wef: this.props.params.wef /*=== wef in redux saved as string DD/mm/YYYY===*/,
        formTitleOrg: hotelObj.Organisation,
        formTitleCity: cityObj.City
      });
    }    

    await this.getHotelListing();   
    await this.getCitiesListing();
    await this.getWefListing();   

    // pass these back to the calling form
    await this.getSelectedParams();

    if (this._isMounted) {
      await this.setState({isDataFetched: true});   
      if (this.props.onPanelLoad !== undefined) {
        this.props.onPanelLoad();
      }
    }

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  componentDidUpdate = async (prevProps) => {
    // This will happen when you add a new seasons_id
    if (this.props.wef !== prevProps.wef) {
      await this.getWefListing();
      await this.setState({wef: this.props.wef});
      await this.getSelectedParams();
    }
  }

  /*==========================================================*/
  getCitiesListing = async () => {

    let tableStr = 'cities c WHERE c.cities_id IN ' + 
      '(SELECT a.cities_id FROM seasons s LEFT JOIN Addressbook a ON s.addressbook_id = a.addressbook_id )';      

    if (this.state.citySwitchValue) {
      tableStr = 'cities c ';
    }

    await this.setState({cityLookup: await dbGetRecord({fields: ["cities_id, city"], orders: ['city'], table: tableStr}) });   

  }

  /*==========================================================*/
  getHotelListing = async () => {

    let tableStr = "dbo.fn_addressbook(2,'H') WHERE cities_id = " + this.state.cities_id;

    await this.setState({hotelLookup: await dbGetRecord({fields: ["Addressbook_id, Organisation, City, COALESCE(Organisation,'') + ', ' + COALESCE(City,'') AS OrgCity "], orders: ['Organisation'], table: tableStr}) });   

  }

  /*==========================================================*/
  getWefListing = async () => {

    // all wef dates
    let whereStr = ' addressbook_id = ' + this.state.hotels_id;

    // only in the last 3 years
    if (!this.state.wefSwitchValue) {
      whereStr = whereStr + ' AND fromdate > DATEADD(year,-3,GETDATE()) '; 
    }    

    await this.setState({wefLookup: await dbGetRecord({fields: ["DISTINCT fromdate AS wef"], orders: ['fromdate DESC'], table: 'seasons', where: whereStr}) });   

    // change the date format to DD/MM/YYYY and date to string
    await this.setState({wefLookup: this.state.wefLookup.map(rec => ({wef: moment(rec.wef).format('DD/MM/YYYY')}) )});
  }

  //**********************************************************/
  getSelectedCity = async (e) => {

    // do not refresh until all the below statements have completed
    await ({isDataFetched: false});

    await this.setState({
      cities_id: e[0].cities_id, 
      city: e[0].city,
      hotels_id: null,
      hotel: '',
      formTitleCity: e[0].city});
    await this.getHotelListing();
    await this.getWefListing();
    await this.getSelectedParams();

    // now refresh
    await ({isDataFetched: true});

  }
  
  //**********************************************************/
  getSelectedHotel = async (e) => {

    // do not refresh until all the below statements have completed
    await ({isDataFetched: false});

    await this.setState({
      hotels_id: e[0].Addressbook_id, 
      hotel: e[0].Organisation,
      formTitleOrg: e[0].OrgCity});
    await this.getCitiesListing();
    await this.getWefListing();
    await this.getSelectedParams();

    // now refresh
    await ({isDataFetched: true});

  }


  //**********************************************************/
  getSelectedWef = async (e) => {

    // do not refresh until all the below statements have completed
    await ({isDataFetched: false});

    await this.setState({wef: e[0].wef});
    await this.getSelectedParams();

    // now refresh
    await ({isDataFetched: true});

  }

  //**********************************************************/
  getSelectedParams = async () => {

    // This takes the parameters down to the parent form -> CostAccommodation
    
    const whereStr = "addressbook_id = " + this.state.hotels_id + " AND " + 
        "fromdate = '" + moment(this.state.wef,'DD/MM/YYYY').format('MM/DD/YYYY') + "'";
    const seasonsArr = await dbGetRecord({fields: ['seasons_id'], orders: ['seasons_id'], table: 'seasons', where: whereStr});
    const seasons_id = (seasonsArr.length > 0) ? seasonsArr[0].seasons_id : null;

    if (this.props.getSelectedParams === undefined) {
      return;
    }

    await this.props.getSelectedParams(
        { hotels_id: this.state.hotels_id,
          cities_id: this.state.cities_id,
          wef: this.state.wef,
          seasons_id: seasons_id, 
          formTitle: this.state.formTitleOrg + ' [' + this.state.formTitleCity + ']'
        }        
    );

  }


  //**********************************************************/
  hotelSwitchValueChanged = async (e) => {
    await this.setState({hotelSwitchValue: e.value});
    await this.getHotelListing();
  }
  
  //**********************************************************/
  citySwitchValueChanged = async (e) => {
    await this.setState({citySwitchValue: e.value});
    await this.getCitiesListing();
  }

  //**********************************************************/
  wefSwitchValueChanged = async (e) => {
    await this.setState({wefSwitchValue: e.value});
    await this.getWefListing();
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
    let wef = this.state.wef;
    wef = moment(wef,'DD/MM/YYYY').format('DD/MM/YYYY');

    return (
      <div id="roundedbox" style={panelContainerStyle}>
        <Box style={boxStyle}>

        <Item ratio={3}>
            <div style={{...itemStyle, ...{paddingRight: '50px'}}}>
            <DropDownGrid2
               listArray={this.state.cityLookup}
                fieldList={['city']}
                valueExpr="cities_id"
                displayExpr="city"
                label="City"
                placeholder="Select a City..."
                getSelectedRecord={this.getSelectedCity}
                style={{width: 200,flexGrow:1}}
                showColumnHeaders={false}
                value={this.state.city}
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

          <Item ratio={4} style={itemStyle} >            
            <div style={{...itemStyle, ...{paddingRight: '50px'}}}>
              <DropDownGrid2
                  listArray={this.state.hotelLookup}
                  fieldList={['Organisation','City']}
                  valueExpr="Addressbook_id"
                  displayExpr="OrgCity"
                  label="Hotel"
                  placeholder="Select an Hotel..."
                  getSelectedRecord={this.getSelectedHotel}
                  value={this.state.hotel}
              />
              <Switch 
                value={this.state.hotelSwitchValue}
                onValueChanged={this.hotelSwitchValueChanged}
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
               listArray={this.state.wefLookup}
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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostAccommodationParams));

