import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import ScrollView from 'devextreme-react/scroll-view';
import { HEADER_HEIGHT } from '../../../../config/paths';
import {getActivityData /*, gatherData, setAccommodationTimings, arraySort, arrivalDepartureData, setDayHeader, setCarCoverage, setCarReportRelease, setDayAtLeisure*/, colorDriveGroups} from './prestoItineraryManagerHelper';
import { dbGetRecordRaw } from '../../../../actions';
import PrestoDatewiseList from './PrestoDatewiseList';
import PrestoDayActivity from './PrestoDayActivity';
import { checkActivityErrors } from "../../../common/PrestoHelpers";

import moment from 'moment';

class PrestoItineraryManager extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      renderToggle: false
    };

    this.var = {
      activityDate: null, minDate: null, maxDate: null, 
      mainData: [], activityData: [], isDataReady: false
    }

  }

  //**********************************************************/
  async componentDidMount() {

    await this.fetchInitialData();
    
    this._isMounted = true;
  }

  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  fetchInitialData = async () => {
    this.var.mainData = [];

    this.var.activityData = await getActivityData(this.props.quotations_id);
/*    
    await gatherData(this.var.activityData, this.var.mainData);
    await setAccommodationTimings(this.var.activityData, this.var.mainData);
    await arraySort(this.var.mainData);
    await arrivalDepartureData(this.props.quotations_id, this.var.mainData);
    await setDayHeader(this.props.quotations_id, this.props.tourDate, this.var.mainData);
    await setDayAtLeisure(this.var.mainData);  
    await setCarCoverage(this.props.quotations_id, this.var.mainData);
    await setCarReportRelease (this.props.quotations_id, this.var.mainData);
*/

    const mainData2 = await dbGetRecordRaw({query: 'exec [p_CreateActivityData] ' + this.props.quotations_id.toString() + ",1"});
    //this.var.mainData = this.var.mainData.map(obj => ({...obj, carCoverage:[obj.carCoverage1, obj.carCoverage2]}));

      this.var.mainData = mainData2.map(rec => ({
        key:                  rec.key,
        quoCities_id:         rec.quoCities_id,
        quoAccommodation_id:  rec.quoAccommodation_id,
        quoServices_id:       rec.quoServices_id,
        quoTickets_id:        rec.quoTickets_id,
        activityDate:         moment(rec.activityDate.replace('T', ' ').replace('Z', '')).format('DD/MM/YYYY'),
        activityTime:         (rec.activityTime !== null) ? moment(rec.activityTime.replace('T', ' ').replace('Z', '')).format('HH:mm') : null,
        activityType:         rec.activityType,
        activitySubtype:      rec.activitySubtype,
        description:          rec.description,
        city:                 rec.city,
        cities_id:            rec.cities_id,
        activityTimeEnd:      moment(rec.activityTime.replace('T', ' ').replace('Z', '')).format('DD/MM/YYYY'),
        carCoverage:          [rec.carCoverage1, rec.carCoverage2],
        groupNo:              rec.groupNo,
        groupReportDate:      (rec.groupReportDate !== null) ? moment(rec.groupReportDate.replace('T', ' ').replace('Z', '')).format('MM/DD/YYYY HH:mm') : null,
        groupReleaseDate:     (rec.groupReleaseDate !== null) ? moment(rec.groupReleaseDate.replace('T', ' ').replace('Z', '')).format('MM/DD/YYYY HH:mm') : null,
        carReport:            (rec.groupReportDate !== null) ? moment(rec.groupReportDate.replace('T', ' ').replace('Z', '')).format('HH:mm') : null,
        carRelease:           (rec.groupReleaseDate !== null) ? moment(rec.groupReleaseDate.replace('T', ' ').replace('Z', '')).format('HH:mm') : null,
        noAccommodation:      rec.noAccommodation,
        overnight:            (rec.overnight !== null) ? rec.overnight : 0,
        ownArrangements:      (rec.ownArrangements !== null) ? rec.ownArrangements : 0,
        comments:             (rec.comments !== null) ? rec.comments : '',
        servicesComments:     (rec.servicesComments !== null) ? rec.servicesComments : '',
        voucherDescription:   (rec.voucherDescription !== null) ? rec.voucherDescription : '',
      }));
          

    await colorDriveGroups(this.var.mainData);

    this.var.mainData = this.var.mainData.map(obj => ({...obj, ErrorType: 0, ErrorMsg: '', ErrorList: []}));

    this.var.minDate = this.var.mainData[0].activityDate;
    this.var.maxDate = this.var.mainData[this.var.mainData.length-1].activityDate;

    await this.checkAllErrors();

    this.var.isDataReady = true;

    this.setState({renderToggle: !this.state.renderToggle});

  }

  //**********************************************************/
  checkAllErrors = async () => {
    await checkActivityErrors(1, this.var.mainData, this.props.quotations_id, null);
    await checkActivityErrors(2, this.var.mainData, this.props.quotations_id, null);
    await checkActivityErrors(3, this.var.mainData, this.props.quotations_id, null);
    await checkActivityErrors(4, this.var.mainData, this.props.quotations_id, null);
  }

  //**********************************************************/
  getSelectedDate = async (e) => {
    this.var.activityDate = e.data.serviceDate;
    this.var.minDate = e.minDate;
    this.var.maxDate = e.maxDate;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  getActivityDate = async (e) => {
    this.var.activityDate = moment(this.var.activityDate,'DD/MM/YYYY').add(e.increase,'days').format('DD/MM/YYYY');
    if (moment(this.var.activityDate,'DD/MM/YYYY') < moment(this.var.minDate,'DD/MM/YYYY')) {
      this.var.activityDate = this.var.minDate;
    }
    if (moment(this.var.activityDate,'DD/MM/YYYY') > moment(this.var.maxDate,'DD/MM/YYYY')) {
      this.var.activityDate = this.var.maxDate;
    }
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  refreshData = async (e) => {
    this.var.isDataReady = false;
    await this.fetchInitialData();
    this.var.isDataReady = true;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  
  //**********************************************************/
  renderContent() {
    
    const panelHeight = 50;

    // this is to force footer at the bottom in case of less content
    let categoryHeight = document.body.clientHeight - HEADER_HEIGHT - panelHeight;

    if (this.var.mainData.length === 0 || !this.var.isDataReady ) {
      return (
        <div style={{height: categoryHeight, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <LoadIndicator id="large-indicator" height={60} width={60} />
        </div>
      )
    }

    return(
      <div style={{width: '100%', minHeight: categoryHeight, display: 'flex', flexDirection: 'row'}}>

        {this.var.mainData.length > 0 &&
          <div style={{display: 'flex', flex: 1, height: categoryHeight/*, overflowY: 'auto', overflowX: 'hidden'*/}}>
            <ScrollView width='100%' height='100%' /*showScrollbar={showScrollBar}*/ useNative={false}>
            <div>
              <PrestoDatewiseList
                quotations_id={this.props.quotations_id}
                getSelectedDate={this.getSelectedDate}
              />      
              </div>   
            </ScrollView>
          </div>
        }

        {this.var.mainData.length > 0 &&
          <div style={{display: 'flex', flex: 7, flexDirection: 'column', height: categoryHeight/*, overflowY: 'auto', overflowX: 'hidden'*/}}>
              <div>
              <PrestoDayActivity
                quotations_id={this.props.quotations_id}
                tourDate={this.props.tourDate}
                tourCode={this.props.tourCode}
                activityDate={this.var.activityDate}
                mainData={this.var.mainData}
                activityData={this.var.activityData}
                getActivityDate={this.getActivityDate}
                refreshData={this.refreshData}
              />   
              </div>   
          </div>
        }

      </div>

    );

  }

  render() {

    return (
      this.renderContent()
    );
  }

}
  

export default connect()(withRouter(PrestoItineraryManager));



