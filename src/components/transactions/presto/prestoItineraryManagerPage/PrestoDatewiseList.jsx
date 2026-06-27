import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import Box, {Item} from 'devextreme-react/box';
import List from 'devextreme-react/list';
import { dbGetRecordRaw } from '../../../../actions';
import { HEADER_HEIGHT } from '../../../../config/paths';

import moment from 'moment';

class PrestoDatewiseList extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {message: '', renderToggle: false, 
      isDataFetched: false
    };

    this.var = {
      isDataReady: false, focusedRowKey: -1, 
      mainData: [], groupedData: [],
      minDate: null, maxDate: null
    }

  }

  //**********************************************************/
  async componentDidMount() {

    this._isMounted = true;

    await this.fetchInitialData();

  }
  
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }  

  //**********************************************************/
  fetchInitialData = async() => {

    await this.filterData();

    await this.getInitialRecord();

    if (this._isMounted)
      this.setState({isDataFetched: true});   

  }

  //**********************************************************/
  getInitialRecord = async() => {
    this.var.focusedRowKey = this.var.mainData[0].dayNo;
    this.var.dayNo = this.var.mainData[0].dayNo;

    if (this.props.getSelectedDate !== undefined) {
      let data = this.var.mainData[0];
      await this.props.getSelectedDate({data: data, minDate: this.var.minDate, maxDate: this.var.maxDate});
    }    

  }

  //**********************************************************/
  filterData = async () => {

    let minDate = null;
    let maxDate = null;
        
    /*=== Get Date Range of Tour ===*/
    let query = "SELECT MIN(DateIn) AS MinDate, MAX(DateOut) AS MaxDate " + 
      "FROM QuoCities " +
      "WHERE Quotations_id = " + this.props.quotations_id.toString() + " ";

    let data = await dbGetRecordRaw({query: query});

    if (data.length > 0) {
      minDate = data[0].MinDate;
      minDate = minDate.replace('T', ' ').replace('Z', '');

      maxDate = data[0].MaxDate;
      maxDate = maxDate.replace('T', ' ').replace('Z', '');
    }

    this.var.minDate = moment(minDate).format('DD/MM/YYYY');
    this.var.maxDate = moment(maxDate).format('DD/MM/YYYY');

    let xDate = minDate;
    let dayNo = 1;

    /*=== Create array of dates (for each day sequentially) ===*/
    while (moment(xDate) <= moment(maxDate)) {

      this.var.mainData.push({dayNo: dayNo, serviceDate: moment(xDate).format('DD/MM/YYYY'), type: 2});

      xDate = new Date(moment(xDate).add(1,'day').format('MM/DD/YYYY'));
      dayNo++;
    }

    /*=== Add city details to date array ===*/
    for await (var [index, rec] of this.var.mainData.entries()) {

      const cityObj = await this.getCity(moment(rec.serviceDate,'DD/MM/YYYY').format('MM/DD/YYYY'));
      const city = cityObj.city;
      const cities_id = cityObj.cities_id;
      const quoCities_id = cityObj.quoCities_id;

      this.var.mainData[index] = {...rec, city: city, cities_id: cities_id, displayCities_id: cities_id, quoCities_id: quoCities_id};
    }

    /*=== Manipulate Main Data (if return to same city, append count, ex Delhi(2) ...) ===*/
    await this.uniqueCityData();

    /*=== Add Arrival & Departure outside tour date range ===*/
    await this.arrivalDepartureData();

    /*=== Group Dates by city ===*/
    await this.groupData();

    this.var.isDataReady = true;

    // force render
    this.setState({renderToggle: !this.state.renderToggle});

  }

  //**********************************************************/
  arrivalDepartureData = async () => {

    let eta = this.var.mainData[0].serviceDate;
    let etd = this.var.mainData[this.var.mainData.length-1].serviceDate;

    let arrCity = this.var.mainData[0].city;
    let depCity = this.var.mainData[this.var.mainData.length-1].city;

    let arrCities_id = this.var.mainData[0].cities_id;
    let depCities_id = this.var.mainData[this.var.mainData.length-1].cities_id;

    /*=== Get Date Range of Tour ===*/
    let query = "SELECT q.DateOfArrival, q.DateOfDeparture, q.ETA, q.ETD, c1.City AS ArrCity, c1.City AS DepCity, " + 
      "q.StartCities_id AS ArrCities_id, q.EndCities_id AS DepCities_id " + 
      "FROM Quotations q " + 
      "LEFT JOIN Cities c1 ON q.StartCities_id = c1.Cities_id " +
      "LEFT JOIN Cities c2 ON q.EndCities_id = c2.Cities_id " +
      "WHERE Quotations_id = " + this.props.quotations_id.toString() + " ";

    let data = await dbGetRecordRaw({query: query});

    if (data.length > 0) {

      /*=== Arrival ===*/
      eta = (data[0].DateOfArrival !== null) ? moment(data[0].DateOfArrival).format('DD/MM/YYYY') : eta;      
      arrCity = (data[0].ArrCity !== null) ? data[0].ArrCity : arrCity;      
      arrCities_id = (data[0].ArrCities_id !== null) ? data[0].ArrCities_id : arrCities_id;      

      /*=== Departure ===*/
      etd = (data[0].DateOfDeparture !== null) ? moment(data[0].DateOfDeparture).format('DD/MM/YYYY') : etd;      
      depCity = (data[0].DepCity !== null) ? data[0].DepCity : depCity;      
      depCities_id = (data[0].DepCities_id !== null) ? data[0].DepCities_id : depCities_id;      

    }

    /*=== Add as 1st element to array ===*/
    const arrivalCity = (arrCities_id !== this.var.mainData[0].cities_id) ? 'Arrival in ' + arrCity : 'Arrival';
    if (moment(eta,'DD/MM/YYYY') < moment(this.var.mainData[0].serviceDate,'DD/MM/YYYY')) {
      this.var.mainData.unshift({dayNo: 0, serviceDate: eta, city: arrivalCity, cities_id: arrCities_id, displayCities_id: -1, quoCities_id: null, type: 1});
    }

    /*=== Add as last element to array ===*/
    const departureCity = (depCities_id !== this.var.mainData[this.var.mainData.length-1].cities_id) ? 'Departure from ' + depCity : 'Departure';
    if (moment(etd,'DD/MM/YYYY') > moment(this.var.mainData[this.var.mainData.length-1].serviceDate,'DD/MM/YYYY')) {
      this.var.mainData.push({dayNo: this.var.mainData.length+1, serviceDate: etd, city: departureCity, cities_id: depCities_id, displayCities_id: -2, quoCities_id: null, type: 3});
    }

  }


  //**********************************************************/
  uniqueCityData = async () => {

    for await (var [index,rec] of this.var.mainData.entries()) {

      /*=== Otherwise gives a jslint warning "Don't make functions within a loop" ===*/
      const rec2 = rec;
      const filterData = this.var.mainData.filter(item => item.cities_id === rec2.cities_id && moment(item.serviceDate,'DD/MM/YYYY') < moment(rec2.serviceDate,'DD/MM/YYYY') && item.quoCities_id !== rec2.quoCities_id);

      const data = filterData.map(obj => ({ ...obj, uniqueField: obj.quoCities_id }));

      const uniqueData = [...new Set(data.map(item => item.uniqueField))]; 
    
      if (uniqueData.length > 0) {
        this.var.mainData[index].city = rec.city + ' (' + (uniqueData.length+1).toString() + ')';
      } 

    }

  }

  //**********************************************************/
  groupData = async () => {

    /*=== rememeber arriva/departure displayCities_id is -1/-2 ===*/
    let displayCities_id = -100;
    for (var i=0; i<this.var.mainData.length; i++) {
      if (displayCities_id !== this.var.mainData[i].displayCities_id) {
        this.var.groupedData.push({
          key: this.var.mainData[i].city,
          items: []
        });
      }
      this.var.groupedData[this.var.groupedData.length-1].items.push(this.var.mainData[i].serviceDate);
      displayCities_id = this.var.mainData[i].displayCities_id;
    }

  }

  //**********************************************************/
  getCity = async (xDate) => {

    let cities_id = null;
    let city = '';
    let quoCities_id = -1;
        
    let query = "SELECT c.City, qc.ToCities_id, qc.QuoCities_id " +
      "FROM QuoCities qc " +
      "LEFT JOIN cities c ON qc.ToCities_id = c.cities_id " +
      "WHERE (qc.Quotations_id = " + this.props.quotations_id.toString() + ") " +
      "AND ('" + xDate + "' >= qc.DateIn AND (('" + xDate + "' < qc.DateOut) OR (qc.DateIn = qc.DateOut)))";

    let cityData = await dbGetRecordRaw({query: query });
    if (cityData.length > 0) {
      cities_id = cityData[0].ToCities_id;
      city = cityData[0].City;
      quoCities_id = cityData[0].QuoCities_id;
    /*=== in some situations, for the last record ==*/
    } else if (cityData.length === 0) {
        query = "SELECT c.City, qc.ToCities_id, qc.QuoCities_id " +
          "FROM QuoCities qc " +
          "LEFT JOIN cities c ON qc.ToCities_id = c.cities_id " +
          "WHERE (qc.Quotations_id = " + this.props.quotations_id.toString() + ") " +
          "AND ('" + xDate + "' >= qc.DateIn) AND ('" + xDate + "' <= qc.DateOut) ";

        cityData = await dbGetRecordRaw({query: query });
        if (cityData.length > 0) {
          cities_id = cityData[0].ToCities_id;
          city = cityData[0].City;
          quoCities_id = cityData[0].QuoCities_id;
        }
    }

    return {cities_id: cities_id, city: city, quoCities_id: quoCities_id};

  }

  //**********************************************************/
  selectDay = async (e) => {     

    if (this.props.getSelectedDayNo !== undefined) {
      const index = this.var.mainData.findIndex(rec => rec.dayNo === this.var.dayNo);
      let data = (index > -1) ? this.var.mainData[index] : [];
      await this.props.getSelectedDayNo({open: false, refresh: true, data: data});
    }    

  };  

  //**********************************************************/
  onFocusedRowChanged = async (e) => {
    this.var.focusedRowKey = e.row.data.dayNo;
    this.var.dayNo = e.row.data.dayNo;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  dateClick = async (e) => {

    if (this.props.getSelectedDate !== undefined) {
      const index = this.var.mainData.findIndex(rec => rec.serviceDate === e.itemData.text);
      let data = (index > -1) ? this.var.mainData[index] : [];
      await this.props.getSelectedDate({data: data, minDate: this.var.minDate, maxDate: this.var.maxDate});
    }    

  }


  //**********************************************************/
  renderContent() {

    const panelHeight = 50;

    // this is to force footer at the bottom in case of less content
    let categoryHeight = document.body.clientHeight - HEADER_HEIGHT - panelHeight;

    const panelContainerStyle = {
      minHeight: 50,
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f0',
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
          <Skeleton variant="rectangular" animation="wave" height={categoryHeight} />
        </div>
      )
    }

    return (
      <div style={panelContainerStyle}>
        <Box style={boxStyle}>
          <Item ratio={1} style={itemStyle} >            
            <div style={{...itemStyle}}>
              
              <List
                dataSource={this.var.groupedData}
                keyExpr="city"
                onItemClick={this.dateClick}
                grouped={true}
                collapsibleGroups={true}
              >
              </List>
              
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
    voucherParams: state.voucherParams
  };
};

const mapDispatchToProps = () => {
  return {
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(PrestoDatewiseList));

