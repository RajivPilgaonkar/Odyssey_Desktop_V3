import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../../common/withRouterCompat';
import TextBox from 'devextreme-react/text-box';
import DateBox from 'devextreme-react/date-box';
import Skeleton from '@mui/material/Skeleton';
import SelectBox from 'devextreme-react/select-box';
import { HEADER_HEIGHT } from '../../../../../config/paths';
import { setParamValues, dbGetRecord } from '../../../../../actions';
import DropDownGrid2 from "../../../../common/DropDownGrid2";
import { convertDMY_MDY, getStartDate } from "../../../../common/CommonTransactionFunctions";
import { Button } from 'devextreme-react/button';
import { formHelp } from './Help';

// some of the devextreme css properties are overridden
import './CostAccommodationReports.css';
import { FormControlUnstyledContext } from '@mui/base';

import moment from 'moment';

class CostAccommodationReports extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {isDataFetched: false, message: '',
        renderToggle: false};

    this.var = {
      mealPlans_id: 2, mealPlan: 'CP', 
      currencies_id: 13, currencyCode: 'INR',
      countries_id: 200, country: 'India',
      mealPlanLookup: [], currencyLookup: [], countryLookup: [],
      fromDate: '01/10/2000', defaultReportType: 0
    }

    this.data = 
      [
        {type_id: 0, type: 'Accommodation', boxHeight: 240},
        {type_id: 1, type: 'Sightseeing', boxHeight: 240},
        {type_id: 2, type: 'Transfers', boxHeight: 240},
        {type_id: 3, type: 'Packages', boxHeight: 180},
        {type_id: 4, type: 'Car - Per Km', boxHeight: 180},
        {type_id: 5, type: 'Car - P2P', boxHeight: 180},
        {type_id: 6, type: 'Car - City Groups', boxHeight: 180},
      ];

  }

  //**********************************************************/
  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    this.var.mealPlanLookup = await dbGetRecord({fields: ['mealplans_id', '[plan] AS mp'], orders: ['[plan]'], table: 'mealplans'});   
    this.var.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
    this.var.countryLookup = await dbGetRecord({fields: ['countries_id', 'country'], orders: ['country'], table: 'countries'});   

    this.var.fromDate = getStartDate(2);

    if (this._isMounted)
      await this.setState({isDataFetched: true});   

  }
 
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }
  
  //**********************************************************/
  closePopover = async () => {
    this.setState({isPopoverVisible: false});
  };  
    
  //**********************************************************/
  onHelpClick = async () => {
    this.setState({isPopoverVisible: !this.state.isPopoverVisible});
  };  

  //**********************************************************/
  toggleHint = async () => {
    this.setState({showHint: !this.state.showHint});
  };     
  
  //**********************************************************/
  getSelectedMealPlan = async (e) => {

    this.var.mealPlans_id = e[0].mealplans_id;
    this.var.mealPlan = e[0].mp;

    this.setState({renderToggle: !this.state.renderToggle})
  }
  
  //**********************************************************/
  getSelectedCurrency = async (e) => {

    this.var.currencies_id = e[0].currencies_id;
    this.var.currencyCode = e[0].currencycode;

    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  getSelectedCountry = async (e) => {

    this.var.countries_id = e[0].countries_id;
    this.var.country = e[0].country;

    this.setState({renderToggle: !this.state.renderToggle})
  }
  
  //**********************************************************/
  dateValueChanged = async (e) => {
    this.var.fromDate = moment(e.value).format('DD/MM/YYYY');
    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  addYearDate = async () => {
    let newDate = moment(convertDMY_MDY(this.var.fromDate)).add(1,'Y');
    this.var.fromDate = moment(newDate).format('DD/MM/YYYY');
    this.setState({renderToggle: !this.state.renderToggle})
  }
  
  //**********************************************************/
  subtractYearDate = async () => {
    let newDate = moment(convertDMY_MDY(this.var.fromDate)).add(-1,'Y');
    this.var.fromDate = moment(newDate).format('DD/MM/YYYY');
    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  reportTypeValueChanged = async (e) => {
    this.var.defaultReportType = e.value;
    this.setState({renderToggle: !this.state.renderToggle})
  }

  //**********************************************************/
  renderContent() {

    const boxWidth = 500;

    const fromDate = convertDMY_MDY(this.var.fromDate);
    const numPax = '2';

    const boxHeight = this.data[this.var.defaultReportType].boxHeight;

    // this is to force footer at the bottom in case of less content
    //let categoryHeight = document.body.clientHeight - HEADER_HEIGHT - panelHeight - 6;

    //categoryHeight = 130;

    const pageContainerStyle = {
      //minHeight: categoryHeight,
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      background: '#e6f2ff',
      alignItems: 'centre'
    };

    const reportTypeStyle = {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
    };

    const boxContainerStyle = {
      height: boxHeight+50,
      width: boxWidth,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 10
    };

    const headingStyle = {
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 20,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 20
    };

    const boxStyle = {
      height: boxHeight,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    };

    const labelStyle = {
      flex: 1,
      fontFamily: 'Lato',
      fontStyle: 'normal',
      fontSize: 16,
      color: '#000000',
      padding: '0px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    };

    const dateBoxStyle = {
      flex: 2,
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
        <div style={pageContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={pageContainerStyle.height} />
        </div>
      )
    }

    return (
      <div>

        <div style={headingStyle}>
          Accommodation Cost Reports
        </div>

        <div style={{width: boxWidth, display: 'flex', justifyContent: 'flex-start', paddingLeft: 10}}>
          <div style={reportTypeStyle}>
            <div style={labelStyle}>
              Report Type
            </div>
            <div>
              <SelectBox dataSource={this.data}
                displayExpr="type"
                valueExpr="type_id"
                defaultValue={this.var.defaultReportType} 
                //value={this.state.reportType} 
                width={350}
                onValueChanged={this.reportTypeValueChanged}
              />
            </div>
          </div>
        </div>

        <div style={boxContainerStyle}>
          <div id="roundedbox" style={boxStyle}>

              <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
                <div style={labelStyle}>
                  From Date
                </div>
                <div style={dateBoxStyle}>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <DateBox 
                      type={"date"}
                      width={130}
                      displayFormat={"dd/MM/yyyy"}
                      value={fromDate} 
                      onValueChanged={this.dateValueChanged}
                    />
                    <Button
                      width={35}
                      type="normal"
                      stylingMode="outlined"
                      icon="arrowup"
                      onClick={this.addYearDate}
                    />
                    <Button
                      width={35}
                      type="normal"
                      stylingMode="outlined"
                      icon="arrowdown"
                      onClick={this.subtractYearDate}
                    />
                  </div>
                </div>
              </div>

              {this.var.defaultReportType === 0 &&
              <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
                <div style={labelStyle}>
                    Meal Plan
                </div>
                <div style={{ display: 'flex', flex: 2, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                  
                  <DropDownGrid2
                    listArray={this.var.mealPlanLookup}
                    fieldList={['mp']}
                    valueExpr="mealplans_id"
                    displayExpr="mp"
                    label=""
                    placeholder="Select a meal plan..."
                    getSelectedRecord={this.getSelectedMealPlan}
                    controlsDisabled = {false}                                    
                    columnAutoWidth={false}
                    value={this.var.mealPlan}
                    labelStyle={{paddingRight: 0}}
                    style={{width: 300, paddingLeft: 0}}
                  />
                  
                </div>
              </div>
              }

              <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
                <div style={labelStyle}>
                  Currency
                </div>
                <div style={{ display: 'flex', flex: 2, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <DropDownGrid2
                    listArray={this.var.currencyLookup}
                    fieldList={['currencycode']}
                    valueExpr="currencies_id"
                    displayExpr="currencycode"
                    label=""
                    placeholder="Select a currency..."
                    getSelectedRecord={this.getSelectedCurrency}
                    controlsDisabled = {false}                                    
                    value={this.var.currencyCode}
                    labelStyle={{paddingRight: 0}}
                    style={{width: 300, paddingLeft: 0}}
                  />
                </div>
              </div>

              <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
                <div style={labelStyle}>
                  Country
                </div>
                <div style={{ display: 'flex', flex: 2, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <DropDownGrid2
                    listArray={this.var.countryLookup}
                    fieldList={['country']}
                    valueExpr="countries_id"
                    displayExpr="country"
                    label=""
                    placeholder="Select a country..."
                    getSelectedRecord={this.getSelectedCountry}
                    controlsDisabled = {false}                                    
                    value={this.var.country}
                    labelStyle={{paddingRight: 0}}
                    style={{width: 300, paddingLeft: 0}}
                  />
                </div>
              </div>

              {((this.var.defaultReportType === 1) || (this.var.defaultReportType === 2)) &&
              <div style={{width: '100%', display: 'flex', flex: 1, flexDirection: 'row'}}>
                <div style={labelStyle}>
                  From Pax
                </div>
                <div style={dateBoxStyle}>
                  <TextBox 
                    width={80}
                    value={numPax} 
                  />
                </div>
              </div>
              }

          </div>
        </div>


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
    setParamValues_action: (paramsObj) => {
      dispatch(setParamValues(paramsObj))
    }  
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostAccommodationReports));

