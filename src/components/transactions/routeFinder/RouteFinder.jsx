import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import { convertDMY_MDY } from "../../common/CommonTransactionFunctions";
import { dbGetRecordRaw, setRouteFinderParamValues } from '../../../actions';
import { HEADER_HEIGHT } from '../../../config/paths';
import RouteFinderParams from './RouteFinderParams';
import List from './List';
import { LoadIndicator } from 'devextreme-react/load-indicator';
//import { formHelp } from './Help';

// some of the devextreme css properties are overridden
import './RouteFinder.css';

import moment from 'moment';

class RouteFinder extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = { 
      isDataFetched: null,  
      renderToggle: false, 
      isPopoverVisible: false
    };

    this.var = { 
      fromCities_id: -1, toCities_id: -1, wef: '01/01/2020', wefTime: '09:00',
      isRouteFinderDataReady: true, isPanelDataReady: false

    };

  }

  //**********************************************************/
  async componentDidMount() {
    this._isMounted = true;

    this.var.fromCities_id = this.props.routeFinderParams.fromCities_id;
    this.var.toCities_id = this.props.routeFinderParams.toCities_id;
    this.var.wef = this.props.routeFinderParams.wef;
    this.var.wefTime = this.props.routeFinderParams.wefTime;

    await this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    await this.filterData();

    if (this._isMounted)
      this.setState({isDataFetched: true});   

  }
 
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }
  
  //**********************************************************/
  getSelectedParams = async (e) => {

    this.var.fromCities_id = e.fromCities_id;
    this.var.toCities_id = e.toCities_id;
    this.var.wef = e.wef;
    this.var.wefTime = e.wefTime;

    // Save to the REDUX store
    await this.props.setRouteFinderParamValues_action({
      fromCities_id: e.fromCities_id, 
      toCities_id: e.toCities_id, 
      wef: e.wef, 
      wefTime: e.wefTime,
      lockTime: e.lockTime
    });

    // Only when 'Refresh' button is clicked in Params
    if (e.dataRefreshMode === 1) {
      this.var.isRouteFinderDataReady = false; 
      this.setState({renderToggle: !this.state.renderToggle});

      // this will also render
      await this.filterData();

      this.var.isRouteFinderDataReady = true; 
      this.setState({renderToggle: !this.state.renderToggle});
    }
    
  }

  //**********************************************************/
  filterData = async () => {

    const wef = convertDMY_MDY(this.var.wef) + ' ' + this.var.wefTime;
    
    const query = "EXEC [dbo].[p_RouteFinder_x] '" + wef + "'," +
      this.var.fromCities_id.toString() + ","  + 
      this.var.toCities_id.toString() + ","  + 
      "3, 1, null";

    this.var.mainData = await dbGetRecordRaw({query: query});
    this.var.mainData.forEach(rec => {
      rec.Departure = rec.Departure.replace('T', ' ').replace('Z', '');
      rec.Arrival = rec.Arrival.replace('T', ' ').replace('Z', '');
    })

    await this.additionalData();

    // force render
    this.setState({renderToggle: !this.state.renderToggle});

  }

  //**********************************************************/
  additionalData = async () => {
    this.var.mainData.map(rec => {
      rec.Timing = moment(rec.Departure).format('HH:mm') + '/' + moment(rec.Arrival).format('HH:mm');
      return rec;
    });

    const startDate = moment(this.var.wef,'DD/MM/YYYY'); 

    this.var.mainData.map(rec => {
      rec.Days = moment(rec.Arrival).diff(startDate, 'days');
      return rec;
    });



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
  onRowPrepared = async(e) => {    
    if (e.rowType === 'data') {
      if (e.data.manual) {
        e.rowElement.style.color = 'blue'; 
        e.rowElement.title = 'This voucher was prepeared manually';
      }  
    }
  }
  
  //**********************************************************/
  customizeText = (cellInfo) => {
    if (!cellInfo.value) 
      return ''
    else
      return String(cellInfo.valueText);
  }
  
  //**********************************************************/
  onPanelLoad = async () => {
    this.var.isPanelDataReady = true;
    this.setState({renderToggle: !this.state.renderToggle});
  }
  
  //**********************************************************/
  renderContent() {

    const panelHeight = 50;

    // this is to force footer at the bottom in case of less content
    let categoryHeight = document.body.clientHeight - HEADER_HEIGHT - panelHeight;

    if (this.props.categoryHeight !== undefined) {
      categoryHeight = this.props.categoryHeight;
    }

    const pageContainerStyle = {
      minHeight: categoryHeight,
      height: categoryHeight,
      display: 'flex',
      //justifyContent: 'center',
      alignItems: 'center',
      background: '#e6f2ff',
      flexDirection: 'column'
    };

    if (!this.state.isDataFetched) {
      return (
        <div style={pageContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={pageContainerStyle.height-20} />
        </div>
      )
    }

    const routeFinderType = (this.props.routeFinderType === undefined) ? 1 : this.props.routeFinderType;

    return (
      <div>
        { 
          <RouteFinderParams
            height={panelHeight}
            getSelectedParams={this.getSelectedParams}          
            onPanelLoad={this.onPanelLoad}
          />
        }

        {this.var.isPanelDataReady && this.var.isRouteFinderDataReady ?
          <div style={{...pageContainerStyle, paddingTop: 10, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <List
              data={[...this.var.mainData]}
              routeFinderType={routeFinderType}
            >
            </List>
          </div>
           :
          <div style={{...pageContainerStyle, paddingTop: 5, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <LoadIndicator id="large-indicator" height={60} width={60} />
          </div>
        }

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

const mapDispatchToProps = (dispatch) => {
  return {
    setRouteFinderParamValues_action: (routeFinderParamsObj) => {
      dispatch(setRouteFinderParamValues(routeFinderParamsObj))
    }  
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(RouteFinder));

