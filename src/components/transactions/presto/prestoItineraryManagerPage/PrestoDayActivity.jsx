import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import {Button} from 'devextreme-react/button';
import Switch from "react-switch";
import DropDownButton from 'devextreme-react/drop-down-button';
import ScrollView from 'devextreme-react/scroll-view';
import { HEADER_HEIGHT } from '../../../../config/paths';
import { dbGetRecordRaw, dbExecuteSp, setPrestoParamValues } from '../../../../actions';
import { Toast } from 'devextreme-react/toast';
import {toastContainerStyle} from "../../../common/ComponentStyles";
import { isValidTime } from "../../../common/CommonTransactionFunctions";
import ToolbarOptions from "../../../common/ToolbarOptions";
import {getQuoCitiesId} from "../../../common/PrestoHelpers";
import PrestoAccommodation from '../prestoDetailsPage/prestoAccommodationPage/PrestoAccommodation'
import PrestoTransfer from '../prestoDetailsPage/prestoTransferPage/PrestoTransfer'
import PrestoSightseeing from '../prestoDetailsPage/prestoSightseeingPage/PrestoSightseeing'
import PrestoTravel from '../prestoDetailsPage/prestoTravelPage/PrestoTravel'
import PrestoSightseeingList from './PrestoSightseeingList';
//import PrestoSightseeingSchedule from '../prestoDetailsPage/prestoSightseeingPage/PrestoSightseeingSchedule';
import PrestoCityHotelList from '../prestoDetailsPage/prestoAccommodationPage/PrestoCityHotelList';
import PrestoCitySightseeingList from '../prestoDetailsPage/prestoSightseeingPage/PrestoCitySightseeingList';

import './PrestoItineraryManager.css';

import moment from 'moment';

class PrestoDayActivity extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {message: '', renderToggle: false, 
      isDataFetched: false, 
      allDataSwitchValue: (this.props.prestoParams.allData !== undefined && this.props.prestoParams.allData !== null) ? this.props.prestoParams.allData : false,
      toastIsVisible: false, voucherDescriptionSwitchValue: false
    };

    this.var = {
      isDataReady: false, focusedRowKey: -1, 
      accData: [], servicesData: [], ticketsData: [], 
      mainData: [], groupedData: [],
      activityDate: null, title: '', activeKey: -1,
      activeQuoCities_id: -1, activeQuoAccommodation_id: -1,
      activeQuoServices_id: -1, sightseeing: -1,      
      activeQuoTickets_id: -1, activeCities_id: -1,
      activeCity: '', activeDate: null, 
      displayDetails: false, displayAccommodationDetails: false, 
      displayAccommodationPopup: false,
      displayTransferDetails: false, displaySightseeingDetails: false,
      displayTicketDetails: false, displayServicesListing: false,
      displaySelectServicesListing: false,
      numServicesSightseeing: false, numServicesTransfer: false,
      refs: [],
      addData:
        [
          {id: 1, text: 'Select Sightseeing', onClick: this.selectSightseeing},
          {id: 10,  template: function() { return "<hr style='margin: unset, height: 5' />"; }, disabled: true },          
          {id: 21, text: 'Add Transfer', onClick: this.addTransfer},
          {id: 22, text: 'Add Sightseeing', onClick: this.addSightseeing},
          {id: 23, text: 'Add Accommodation', onClick: this.addAccommodation},
          //{id: 3, text: 'View Sightseeing Schedule', onClick: this.sightseeingSchedule},
        ],
        addHotelSightseeing:
        [
          {id: 1, text: 'List Hotels', onClick: this.listHotels},
          {id: 2, text: 'List Sightseeings', onClick: this.listSightseeings},
        ],
        toastMessage: '',
        displaySightseeingSchedule: false,
        displayHotelList: false, displaySightseeingList: false,
        hotelCategory: 'Standard',
        open: false, isVoucherCreated: false, isDetailedItinCreated: false,
        detailedItin: []
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
  componentDidUpdate = async (prevProps) => {
    if (this.props.activityDate !== prevProps.activityDate) {
      // Show all data toggle activated
      if (this.state.allDataSwitchValue) {
        /*=== Get activity for selected date, in the middle of the list viewing area ===*/
        const index = this.props.mainData.findIndex(rec => rec.activityDate === this.props.activityDate);        
        if (index !== -1 && this.var.refs.length > index) {
          const ref = this.var.refs[index];
          ref.current.scrollIntoView({behaviour: 'smooth', block: 'nearest', inline: 'start'});
        }
      }
      this.setState({renderToggle: !this.state.renderToggle});
    }
  }  

  //**********************************************************/
  fetchInitialData = async() => {

    const tourCode = (this.props.tourCode !== null) ? this.props.tourCode : '';
    let query = "SELECT COUNT(*) AS x_count FROM Vouchers " + 
      "WHERE MasterTourCode = '" + tourCode + "' AND " +
      "MasterTourDate = '" + moment(this.props.tourDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "'";

    const voucherRec = await dbGetRecordRaw({query: query });
    this.var.isVoucherCreated = (voucherRec[0].x_count > 0)? true : false;

    query = "SELECT qpd.QuoDate, qpd.DaySummaryInfo FROM QuoPrint qp " + 
      "LEFT JOIN QuoPrintDays qpd ON qp.QuoPrint_id = qpd.QuoPrint_id " +
      "WHERE qp.Quotations_id = " + this.props.quotations_id.toString();

    this.var.detailedItin = await dbGetRecordRaw({query: query });
    this.var.isDetailedItinCreated = (this.var.detailedItin.length > 0)? true : false;
  
    if (this._isMounted)
      this.setState({isDataFetched: true});   

  }

  //**********************************************************/
  onFocusedRowChanged = async (e) => {
    this.var.focusedRowKey = e.row.data.dayNo;
    this.var.dayNo = e.row.data.dayNo;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  toggleAccommodationDetails = () => {
    const data = this.props.mainData.filter(rec => rec.key === this.var.activeKey);
    if (data.length > 0) {
      if (data[0].activityType === 1) {
        this.var.displayTicketDetails = !this.var.displayTicketDetails;        
      } else if (data[0].activityType === 2) {
        this.var.displayAccommodationDetails = !this.var.displayAccommodationDetails;        
      } else if (data[0].activityType === 3) {
        this.var.displaySightseeingDetails = !this.var.displaySightseeingDetails;        
      } else if (data[0].activityType === 4) {
        this.var.displayTransferDetails = !this.var.displayTransferDetails;        
      }
    }
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  getSelectedService = async (e) => {
    if (!e.open) {
      this.var.displayServicesListing = false;
      this.var.displaySelectServicesListing = false;
    }

    if (e.refresh) {
      let spData = {sql: "EXEC [p_AddService] " + this.var.activeQuoCities_id.toString() + ", " + 
        e.data.Services_id.toString() + ",'" + moment(this.var.activeDate,'DD/MM/YYYY').format('MM/DD/YYYY') + "'"}

      await dbExecuteSp(spData);

      this.var.toastMessage = "Please click on 'Refresh Data' to see changes";
      this.setState({toastIsVisible: true});  

    } else {
      this.setState({renderToggle: !this.state.renderToggle});
    }


  }

  //**********************************************************/
  activityClick = async (e) => {
    this.var.activeKey = e.key;      
    if (e.quoCities_id !== undefined && e.quoCities_id !== null) {
      this.var.activeQuoCities_id = e.quoCities_id;
      this.var.activeQuoAccommodation_id = e.quoAccommodation_id;
      this.var.activeQuoServices_id = e.quoServices_id;
      this.var.activeQuoTickets_id = e.quoTickets_id;
      this.var.activeCities_id = e.cities_id;
      this.var.activeCity = e.city;
      await this.computeNumServices();
    }
    //this.var.displayTravelDetails = false;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  computeNumServices = async () => {

    if (this.var.activeQuoCities_id === null) {
      return;
    }

    let query = "SELECT COUNT(*) AS x_count " +
      "FROM QuoServices qs " +
      "WHERE qs.QuoCities_id = " + this.var.activeQuoCities_id.toString() + " " +
      "AND qs.Selected = 1 " + 
      "AND qs.Sightseeing = 1 ";

   let sightseeingArr = await dbGetRecordRaw({query: query});
   this.var.numServicesSightseeing = (sightseeingArr.length > 0) ? sightseeingArr[0].x_count : 0;

   query = "SELECT COUNT(*) AS x_count " +
   "FROM QuoServices qs " +
   "WHERE qs.QuoCities_id = " + this.var.activeQuoCities_id.toString() + " " +
   "AND qs.Selected = 1 " + 
   "AND qs.Sightseeing = 0 ";

  let transferArr = await dbGetRecordRaw({query: query});
  this.var.numServicesTransfer = (transferArr.length > 0) ? transferArr[0].x_count : 0;

  }

  //**********************************************************/
  onAddActivityClick = async (e) => {
    await e.itemData.onClick;
  }

  //**********************************************************/
  onListActivityClick = async (e) => {
    await e.itemData.onClick;
  }

  //**********************************************************/
  onAddTransfer = async (e) => {
    //Close transfer form after adding a transfer, through form under activity '...Day Starts in Delhi'
    this.var.displayServicesListing = false;
    this.var.displayTransferDetails = false;
    if (e.save === true) {
      this.var.toastMessage = "Please click on 'Refresh Data' to see changes";
      this.setState({toastIsVisible: true});  
    } else {
      this.setState({renderToggle: !this.state.renderToggle});
    }
  }

  //**********************************************************/
  onAddSightseeing = async (e) => {
    //Close sightseeing form after adding a sightseeing, through form under activity '...Day Starts in Delhi'
    this.var.displayServicesListing = false;
    this.var.displaySightseeingDetails = false;
    if (e.save === true) {
      this.var.toastMessage = "Please click on 'Refresh Data' to see changes";
      this.setState({toastIsVisible: true});
    } else {
      this.setState({renderToggle: !this.state.renderToggle});
    }
  }

  //**********************************************************/
  onAddAccommodation = async (e) => {
    //Close sightseeing form after adding a sightseeing, through form under activity '...Day Starts in Delhi'
    this.var.displayAccommodationPopup = false;
    if (e.save === true) {
      this.var.toastMessage = "Please click on 'Refresh Data' to see changes";
      this.setState({toastIsVisible: true});
    } else {
      this.setState({renderToggle: !this.state.renderToggle});
    }
  }

  //**********************************************************/
  onToastHiding = async () => {
    this.var.toastMessage = '';
    this.setState({toastIsVisible: false});
  }

  //**********************************************************/
  sightseeingSchedule = async () => {
    this.var.displaySightseeingSchedule = true;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  selectSightseeing = async () => {

    this.var.activeQuoCities_id = null;
    this.var.activeCities_id = null;

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);
    if (index !== -1) {
      const activityDate = moment(this.props.mainData[index].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY'); 
      const cities_id = this.props.mainData[index].cities_id;
      const quoCitiesObj = await getQuoCitiesId(this.props.quotations_id, activityDate, cities_id);
      this.var.activeQuoCities_id = quoCitiesObj.quoCities_id;
      this.var.activeCities_id = quoCitiesObj.cities_id;
      this.var.activeCity = this.props.mainData[index].city;
      this.var.activeDate = this.props.mainData[index].activityDate;

      this.var.sightseeing = 1
      this.var.displaySelectServicesListing = true;
  
    }

    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  listHotels = async () => {

    this.var.activeQuoCities_id = null;
    this.var.activeCities_id = null;

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);
  
    if (index !== -1) {
      this.var.activeCities_id = this.props.mainData[index].cities_id;
      this.var.activeCity = this.props.mainData[index].city;
      this.var.activeDate = new Date(moment(this.props.mainData[index].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY'));

      this.var.displayHotelList = true;
      this.var.open = true;
      this.setState({renderToggle: !this.state.renderToggle});    
    
    }

  }

  //**********************************************************/
  listSightseeings = async () => {

    this.var.activeQuoCities_id = null;
    this.var.activeCities_id = null;

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);
  
    if (index !== -1) {
      this.var.activeCities_id = this.props.mainData[index].cities_id;
      this.var.activeCity = this.props.mainData[index].city;
      this.var.activeDate = new Date(moment(this.props.mainData[index].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY'));

      this.var.displaySightseeingList = true;
      this.var.open = true;
      this.setState({renderToggle: !this.state.renderToggle});    
    
    }

  }

  //**********************************************************/
  getSelectedHotelFromList = async (e) => {
    this.var.displayHotelList = false;
    this.var.open = e.open;
    this.setState({renderToggle: !this.state.renderToggle});    
  }

  //**********************************************************/
  getSelectedServiceFromListing = async(e) => {
    this.var.displaySightseeingList = false;
    this.var.open = e.open;
    this.setState({renderToggle: !this.state.renderToggle});    
  }

  //**********************************************************/
  onCloseSchedule = async (e) => {
    this.var.displaySightseeingSchedule = e.open;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  onModifyTravel = async() => {

    /*=== Rearrange QuoCities timings ====*/
    let sql = 'EXEC p_QuoRearrangeCitiesTimings ' + this.props.quotations_id.toString();
    let spData = {sql: sql};
    await dbExecuteSp(spData);  

    /*=== Arrange Car Travel Details (Per Km, P2P, CarGroup) ====*/
    sql = 'EXEC p_QuoTicketsSetChangeCar ' + this.props.quotations_id.toString();
    spData = {sql: sql};
    await dbExecuteSp(spData);  

    /*=== Set car Agent & Vehicle ====*/
    sql = 'EXEC p_QuoSetCarAgent ' + this.props.quotations_id.toString();
    spData = {sql: sql};
    await dbExecuteSp(spData);  

    await this.refreshData();
  }

  //**********************************************************/
  activityDescription = (rec) => {

    let eta = null;
    let line_1a = null;
    let line_1b = null;    
    let line_1c = (rec.comments !== null) ? rec.comments.trim() : '';    
    line_1c += line_1c.length > 0 ? '\n' : '';
    line_1c += (rec.servicesComments !== null) ? rec.servicesComments.trim() : '';    

    const ticketsData = this.props.activityData.ticketsData;
    const accData = this.props.activityData.accommodationData;
    const servicesData = this.props.activityData.servicesData;

    if (rec.activityType === 1) {
      const index = ticketsData.findIndex(elem => elem.QuoTickets_id === rec.quoTickets_id);
      if (index > -1) {
        eta = moment(ticketsData[index].ETA).format('HH:mm');
        if (ticketsData[index].Nights !== null && ticketsData[index].Nights > 0) {
          eta += ' (' + ticketsData[index].Nights.toString() + ')';
        }
        line_1a = '';
        line_1b = '';
        if (ticketsData[index].NoOfTickets > 0 && (ticketsData[index].Tickets_id === 1 || ticketsData[index].Tickets_id === 2)) {
          line_1a += ticketsData[index].NoOfTickets.toString() + ' ticket';
          line_1a += (ticketsData[index].NoOfTickets > 1) ? 's' : '';
          line_1a += ' in ' + ticketsData[index].Class;
        } else if (ticketsData[index].NoOfTickets > 0 && ticketsData[index].Tickets_id === 5) {          
          line_1a += (ticketsData[index].Vehicle) ? ticketsData[index].Vehicle : 'vehicle ??';
          //line_1a = (this.var.ticketsData[index].AC) ? 'A/C ' + line_1a : 'Non A/C' +  + line_1a;
          //if (this.var.ticketsData[index].NoOfTickets > 1) {
          //  line_1a += '(' + this.var.ticketsData[index].NoOfTickets + ' nos.)';
          //}
        }
        line_1b += (ticketsData[index].Agent) ? ticketsData[index].Agent : 'agent ??';
        if (rec.ownArrangements) {
          line_1a = 'Pax make their own arrangements ';
          line_1b = '';
        }
      }
    } else if (rec.activityType === 2) {
      const index = accData.findIndex(elem => elem.QuoAccommodation_id === rec.quoAccommodation_id);      
      if (index > -1) {
        line_1a = '';
        if (!rec.ownArrangements) {
          if (accData[index].NumSingles > 0) {
            line_1a += accData[index].NumSingles.toString() + ' Single';
            line_1a += (accData[index].NumSingles > 1) ? 's' : '';
          }
          if (accData[index].NumDoubles > 0) { 
            line_1a += (line_1a.trim().length > 0) ? ', ' : '';
            line_1a += accData[index].NumDoubles.toString() + ' Double';
            line_1a += (accData[index].NumDoubles > 1) ? 's' : '';
          }
          if (accData[index].NumTwins > 0) { 
            line_1a += (line_1a.trim().length > 0) ? ', ' : '';
            line_1a += accData[index].NumTwins.toString() + ' Twin';
            line_1a += (accData[index].NumTwins > 1) ? 's' : '';
          }
          if (accData[index].NumTriples > 0) { 
            line_1a += (line_1a.trim().length > 0) ? ', ' : '';
            line_1a += accData[index].NumTriples.toString() + ' Triple';
            line_1a += (accData[index].NumTriples > 1) ? 's' : '';
          }  
          line_1a += ' ' +(accData[index].RoomType ? accData[index].RoomType : '??') + ' on ' +
                      accData[index].MealPlan;
        } else {
          line_1a += 'Pax make their own arrangements ';
        }
        line_1a += ' ';
        let nights = accData[index].Nights.toString() + ' Night';
        nights += (accData[index].Nights > 1) ? 's' : '';
        line_1a += ' from ' + 
          moment(accData[index].DateIn).format('DD/MM/YYYY') + ' to ' + 
          moment(accData[index].DateOut).format('DD/MM/YYYY') + ' (' + 
          nights + ')';
        if (accData[index].ReserveHotelOvernight) {
          line_1a += '. (*** Early Checkin).'          
        }
        if (accData[index].LateCheckOut) {
          line_1a += '. (*** Late Checkout).'          
        }
      }
    } else if (rec.activityType === 3 || rec.activityType === 4) {
      
      const index = servicesData.findIndex(elem => elem.QuoServices_id === rec.quoServices_id);
      if (index > -1) {
        line_1a = '';
        let minutes = 0;
        if (servicesData.length > 0 && servicesData[index].Duration !== null && isValidTime(servicesData[index].Duration)) {
          minutes = parseInt(servicesData[index].Duration.substr(0,2))*60 + parseInt(servicesData[index].Duration.substr(3,2));
        }
        let activityDate = moment(rec.activityDate,'DD/MM/YYYY').format('MM/DD/YYYY') + ' ' + rec.activityTime;
        eta = moment(new Date(activityDate)).add(minutes,'minutes').format('HH:mm');

        if (servicesData[index].Transport && servicesData[index].Vehicle !== null) {
          line_1a += servicesData[index].Vehicle;
        }

        //line_1a = servicesData[index].Vehicle;
        line_1b = servicesData[index].Agent;

        if (servicesData[index].Guide !== null && servicesData[index].Guide === true) {
          line_1a += line_1a.trim().length > 0 ? ' (Guide)' : 'Guide'
        }

//        if (servicesData[index].LinkServices_id !== null) {
//          line_1a += ' [**Linked**]';
//        }

        if (rec.ownArrangements) {
          line_1a = 'Pax make their own arrangements ';
          line_1b = '';
        }
      }
    }

    let timing = '';
    let backgroundColor = null;
    let fontWeight = null;
    //let height = 90;
    let minHeight = 90;
    let flex_1b = 1;    
    let paddingTop = 5;
    let colorTop = (rec.carCoverage !== undefined && rec.carCoverage !== null && rec.carCoverage[0] === 1) ? rec.groupColor : null;    
    let colorBottom = (rec.carCoverage !== undefined && rec.carCoverage !== null && rec.carCoverage[1] === 1) ? rec.groupColor : null;

    let carReport = (rec.carReport !== undefined && rec.carReport !== null) ? 'Rpt: ' + rec.carReport : '';
    let carRelease = (rec.carRelease !== undefined && rec.carRelease !== null) ? 'Rel: ' + rec.carRelease : '';

    let carReportColor = null;
    let carReleaseColor = null;

    let dayReportDiff = 0;

    if (rec.groupReportDate !== undefined && rec.groupReportDate !== null) {      
      const serviceDate = new Date(moment(rec.groupReportDate).format('MM/DD/YYYY'));
      dayReportDiff = moment(serviceDate).diff(moment(rec.activityDate,'DD/MM/YYYY'),'days');
      if (dayReportDiff !== 0) {
        carReport += ' (' + dayReportDiff.toString() + ')';
        carReportColor = 'red';
      }
    }
    let dayReleaseDiff = 0;
    if (rec.groupReleaseDate !== undefined && rec.groupReleaseDate !== null) {
      const serviceDate = new Date(moment(rec.groupReleaseDate).format('MM/DD/YYYY'));
      dayReleaseDiff = moment(serviceDate).diff(moment(rec.activityDate,'DD/MM/YYYY'),'days');      
      if (dayReleaseDiff !== 0) {
        carRelease += ' (' + dayReleaseDiff.toString() + ')';
        carReleaseColor = 'red';
      }
    }

    let noAccommodation = '';
    let overnightJourney = '';

    if (rec.activityType > 0) {
      timing = rec.activityTime;
      timing = (eta !== null) ? timing + ' / ' + eta : timing;  
      // For Day At Leisure, show no timing
      if (rec.activityType === 20) {
        timing = '';
        //height = 40;
        minHeight = 40;  
      }
      // Accommodation needs less height
      if (rec.activityType === 2) {
        //height = 60;
        minHeight = 60;  
      }
      // Clients arrive/depart requires less height
      if (rec.activityType === 100) {
        //height = 40;
        minHeight = 40;  
      }
    } else {
      if (rec.activityType === 100) {
        timing = rec.activityTime;
      }
      backgroundColor = (rec.activitySubtype === 1) ? '#ccf2ff' : '#e6eeff';
      if (rec.activitySubtype === 1 && rec.description !== null && rec.description.includes('Day Excursion')) {
        backgroundColor = '#ecc6d9';
      }
      if (rec.activitySubtype === 3) {
        backgroundColor = '#ffe6cc';
      }
      noAccommodation = (rec.noAccommodation) ? 'No Accommodation' : '';
      overnightJourney = (rec.overnight) ? 'Overnight Journey' : '';
      //fontWeight = 600;
      fontWeight = (rec.activitySubtype === 1) ? 600 : 500;
      //height = 30;
      minHeight = 30;
      paddingTop = 0;
    }

    if (rec.activityType === 2) {
      flex_1b = 0;
    }

    const moreLessIcon = (this.var.displayDetails) ? 'chevronup' : 'chevrondown';

    const titleColor = (rec.activitySubtype === 3) ? '#ac00e6' : '#000000';

    //const voucherDescription = rec.voucherDescription.replace(/\n/g,"<br>");

    return (
      <React.Fragment>

        <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%', /*height: height,*/ overflow: 'auto', minHeight: minHeight, fontSize: 18, justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0 }}>
        <div style={{display: 'flex', flexDirection: 'row', width: '100%', height: '100%', /*height: height,*/ overflow: 'auto', minHeight: minHeight, fontSize: 18, justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0, backgroundColor: backgroundColor, fontWeight: fontWeight, borderBottom: '1px solid #ebebe0'}}>
          {rec.activityType !== 0 &&
            <div style={{display: 'flex', flex: 2, height: '100%', justifyContent: 'center', alignItems:'center'}}>
                {timing}
            </div>
          }
          {rec.activityType === 0 && 
            <div style={{display: 'flex', flexDirection: 'row', height: '100%', flex: 2, fontSize: 18, justifyContent: 'center', alignItems: 'center', color: '#000000', overflowX: 'hidden', overflowY: 'hidden'}}>
                <div style={{display: 'flex', justifyContent: 'flex-start', width: '100%', overflowX: 'hidden', overflowY: 'hidden'}}>
                  {rec.activitySubtype === 1 && 
                    <div>
                    <DropDownButton
                      icon="add"
                      hint="Add Activities"
                      dropDownOptions={{width: 200}}
                      items={this.var.addData}
                      keyExpr={"id"}
                      displayExpr={"text"}
                      disabled={false}
                      onItemClick={this.onAddActivityClick}
                    />                                
                    <DropDownButton
                      icon="info"
                      hint="Hotels & Sightseeing"
                      dropDownOptions={{width: 200}}
                      items={this.var.addHotelSightseeing}
                      keyExpr={"id"}
                      displayExpr={"text"}
                      disabled={false}
                      onItemClick={this.onAddActivityClick}
                    />   
                    </div>                             
                  }
                </div>
            </div>
          }
          <div style={{display: 'flex', flexDirection: 'column', height: '100%', flex: 10, fontSize: 18, paddingTop: paddingTop}}>            
            <div style={{display: 'flex', flex: 1, flexDirection: 'row', fontSize: 18, color: titleColor}}>
              {rec.description}
              {noAccommodation > '' &&
                <div style={{paddingLeft: 40, color: 'red'}}>No Accommodation ?</div>
              }
              {overnightJourney > '' &&
                <div style={{paddingLeft: 40, color: '#ac00e6'}}>[Overnight Journey]</div>
              }
            </div>
            <div style={{display: 'flex', flex: 2, flexDirection: 'column', fontSize: 18}}>
              <div style={{display: 'flex', flexDirection: 'column', flex: 1, fontSize: 16, color: (rec.ownArrangements) ? "#008000" : '#666666' }}>
                  {line_1a}
              </div>              
              <div style={{display: 'flex', flexDirection: 'column', flex: flex_1b, fontSize: 16, color: '#666666'}}>
                  {line_1b}
              </div>
              {line_1c > '' &&
                <div style={{display: 'flex', flexDirection: 'column', flex: flex_1b, fontSize: 16, color: '#008000'}}>
                  {line_1c}
                </div>
              }
            </div>
          </div>
          {(rec.activityType !== 0) &&
            <div style={{display: 'flex', flexDirection: 'column', flex: 1.5, fontSize: 18, /*height: '100%',*/ justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0, height: 90, overflow: 'hidden'}}>
              <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', height: '100%', margin: 0, padding: 0}}>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 0}}>
                  <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', background: colorTop, flex: 1, height: 120, overflow: 'hidden' }}>
                    
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', background: colorBottom, flex: 1}}>
                    
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', flex: 5, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 0}}>
                  <div style={{display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, margin: 0, padding: 0, fontSize: 14, color: carReportColor}}>
                    {carReport}
                  </div>
                  <div style={{display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1,  margin: 0, padding: 0, fontSize: 14, color: carReleaseColor}}>
                    {carRelease}
                  </div>
                </div>
              </div>
            </div>
          }

          <div style={{display: 'flex', flex: 0.5, fontSize: 16, justifyContent: 'flex-end'}}>
            {this.var.activeKey === rec.key && (rec.activityType >= 1 && rec.activityType <= 5) &&
              <div>
                <Button
                  width={35}                    
                  type="normal"
                  stylingMode="outlined"
                  icon={moreLessIcon}
                  onClick={() => this.toggleAccommodationDetails()}
                  hint="Travel Details"
                />
              </div>
            }
          </div>

        </div>

        {this.var.isVoucherCreated && this.state.voucherDescriptionSwitchValue &&
          rec.voucherDescription.length > 0 && this.state.allDataSwitchValue === true &&
          <div style={{width: '100%', backgroundColor: '#ffe6cc', fontSize: 16, whiteSpace: 'pre-line'}}>            
            {rec.voucherDescription}
          </div>
        }

        {this.var.activeQuoCities_id === rec.quoCities_id && this.var.displayAccommodationDetails &&
            rec.activityType === 2 && rec.quoAccommodation_id === this.var.activeQuoAccommodation_id &&
            <PrestoAccommodation
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoAccommodation_id = {this.var.activeQuoAccommodation_id}
              cities_id={rec.cities_id}
              activityDate={rec.activityDate}
              city={rec.city}
              accommodationFormType={1}
            >
            </PrestoAccommodation>
          }

          {this.var.displayAccommodationPopup && 
           this.var.activeKey === rec.key && /* if picked from 'Add Accommodation menu from the day activity'*/
            <PrestoAccommodation
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoAccommodation_id = {null}
              cities_id={this.var.activeCities_id}
              activityDate={this.var.activityDate}
              city={this.var.activeCity}
              accommodationFormType={2}
              onAddAccommodation={this.onAddAccommodation}
            >
            </PrestoAccommodation>
          }

          {this.var.activeQuoCities_id === rec.quoCities_id && this.var.displayTransferDetails &&
            rec.activityType === 4 && rec.quoServices_id === this.var.activeQuoServices_id &&
            <PrestoTransfer
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoServices_id = {this.var.activeQuoServices_id}
              cities_id={rec.cities_id}
              activityDate={rec.activityDate}
              city={rec.city}
              transferFormType={1}
            >
            </PrestoTransfer>
          }

          {this.var.activeQuoCities_id === rec.quoCities_id && this.var.displaySightseeingDetails &&
            rec.activityType === 3 && rec.quoServices_id === this.var.activeQuoServices_id &&
            <PrestoSightseeing
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoServices_id = {this.var.activeQuoServices_id}
              cities_id={rec.cities_id}
              activityDate={rec.activityDate}
              city={rec.city}
              sightseeingFormType={1}              
            >
            </PrestoSightseeing>
          }

          {this.var.activeQuoCities_id === rec.quoCities_id && this.var.displayTicketDetails &&
            rec.activityType === 1 && rec.quoTickets_id === this.var.activeQuoTickets_id &&
            <PrestoTravel
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoTickets_id = {this.var.activeQuoTickets_id}
              cities_id={rec.cities_id}
              activityDate={rec.activityDate}
              city={rec.city}
              formMode={1}
              activityDescription={rec.description}
              onModifyTravel={this.onModifyTravel}
            >
            </PrestoTravel>
          }

          {this.var.displaySelectServicesListing && this.var.activeQuoCities_id !== undefined &&
            this.var.activeQuoCities_id > 0 &&
            <PrestoSightseeingList
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              cities_id={this.var.activeCities_id}
              sightseeing={this.var.sightseeing}
              getSelectedService={this.getSelectedService}
              city={this.var.activeCity}
            >
            </PrestoSightseeingList>
          }

          {this.var.displayServicesListing && this.var.activeQuoCities_id !== undefined &&
            this.var.activeQuoCities_id > 0 && this.var.activeDate === rec.activityDate &&
            rec.activityType === 0 && rec.activitySubtype === 1 &&
            this.var.sightseeing === 0 &&
            <PrestoTransfer
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoServices_id = {this.var.activeQuoServices_id}
              cities_id={this.var.activeCities_id}
              activityDate={this.var.activeDate}
              city={this.var.activeCity}
              transferFormType={2}              
              onAddTransfer={this.onAddTransfer}
            >
            </PrestoTransfer>
          }

          {this.var.displayServicesListing && this.var.activeQuoCities_id !== undefined &&
            this.var.activeQuoCities_id > 0 && this.var.activeDate === rec.activityDate &&
            rec.activityType === 0 && rec.activitySubtype === 1 &&
            this.var.sightseeing === 1 &&
            <PrestoSightseeing
              quotations_id={this.props.quotations_id}
              quoCities_id = {this.var.activeQuoCities_id}                          
              quoServices_id = {this.var.activeQuoServices_id}
              cities_id={this.var.activeCities_id}
              activityDate={this.var.activeDate}
              city={this.var.activeCity}
              sightseeingFormType={2}              
              onAddSightseeing={this.onAddSightseeing}
            >
            </PrestoSightseeing>
          }

        </div>
      </React.Fragment>
    );    
  }

  //**********************************************************/
  listErrorMessages = (errorList) => {

    const errorJsx =  errorList.map((rec,i) => {
      return(
        <div key={'error_'+i.toString()} style={{display: 'flex', fontSize: 16, justifyContent: 'center', whiteSpace: 'pre-wrap', color: (rec.errorType === 1 ? 'blue': 'red')}}>
          {rec.errorMsg}
        </div>
      )
    });

    return errorJsx;
  }


  //**********************************************************/
  allActivities = (data) => {

    this.var.refs = [];
    this.var.refs = data.reduce((acc,value,index) => {
      acc[index] = React.createRef();
      return acc;
    }, {});

    /*
      <div style={{display: 'flex', fontSize: 16, justifyContent: 'center', whiteSpace: 'pre-wrap'}}>
        {rec.ErrorMsg}
      </div>
    */


    return data.map((rec, i, a) => {
  
      //let borderStyle = (rec.ErrorType === 1) ? 'solid blue 2px' : 'none';
      let borderStyle = 'none';
      borderStyle = (rec.ErrorType === 1) ? 'dashed blue 1px' : borderStyle;

      borderStyle = (rec.ErrorType === 2) ? 'solid red 2px' : borderStyle;

      return (
        <div key={'outer_'+i.toString()} ref={this.var.refs[i]} onClick={() => this.activityClick(a[i])} style={{border: borderStyle, display: 'flex', flexDirection: 'column' }}>
          {this.activityDescription(rec)}
          {rec.ErrorType > 0 &&
            this.listErrorMessages(rec.ErrorList)
          }

        </div>
      )

    });

  }

  //**********************************************************/
  previousDay = async () => {

    this.var.activeQuoCities_id = -1;    
    if (this.props.getActivityDate !== undefined) {
      await this.props.getActivityDate({increase: -1});
    }        

  }

  //**********************************************************/
  nextDay = async () => {

    this.var.activeQuoCities_id = -1;
    if (this.props.getActivityDate !== undefined) {
      await this.props.getActivityDate({increase: 1});
    }    

  }

  //**********************************************************/
  addSightseeing = async () => {
    this.var.activeQuoCities_id = null;
    this.var.activeCities_id = null;

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);
    if (index !== -1) {
      const activityDate = moment(this.props.mainData[index].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY'); 
      const cities_id = this.props.mainData[index].cities_id;      
      const quoCitiesObj = await getQuoCitiesId(this.props.quotations_id, activityDate, cities_id);

      this.var.activeQuoCities_id = quoCitiesObj.quoCities_id;
      this.var.activeCities_id = quoCitiesObj.cities_id;
      this.var.activeCity = this.props.mainData[index].city;
      this.var.activeDate = this.props.mainData[index].activityDate;
    }

    this.var.displayServicesListing = !this.var.displayServicesListing;
    this.var.sightseeing = 1;
    this.setState({renderToggle: !this.state.renderToggle});

  }

  //**********************************************************/
  addTransfer = async () => {
    this.var.activeQuoCities_id = null;
    this.var.activeCities_id = null;

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);
    if (index !== -1) {
      const activityDate = moment(this.props.mainData[index].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY'); 
      const cities_id = this.props.mainData[index].cities_id;      
      const quoCitiesObj = await getQuoCitiesId(this.props.quotations_id, activityDate, cities_id);
      this.var.activeQuoCities_id = quoCitiesObj.quoCities_id;
      this.var.activeCities_id = quoCitiesObj.cities_id;
      this.var.activeCity = this.props.mainData[index].city;
      this.var.activeDate = this.props.mainData[index].activityDate;
    }

    this.var.displayServicesListing = !this.var.displayServicesListing;
    this.var.sightseeing = 0;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  addAccommodation = async () => {
    this.var.activeQuoCities_id = null;
    this.var.activeCities_id = null;

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);
    if (index !== -1) {
      const activityDate = moment(this.props.mainData[index].activityDate,'DD/MM/YYYY').format('MM/DD/YYYY'); 
      const cities_id = this.props.mainData[index].cities_id;      
      const quoCitiesObj = await getQuoCitiesId(this.props.quotations_id, activityDate, cities_id);
      this.var.activeQuoCities_id = quoCitiesObj.quoCities_id;
      this.var.activeCities_id = quoCitiesObj.cities_id;
      this.var.activeCity = this.props.mainData[index].city;
      this.var.activeDate = this.props.mainData[index].activityDate;
      this.var.activeKey = this.props.mainData[index].key;
    }

    this.var.displayAccommodationPopup = true;
    //this.var.displayServicesListing = !this.var.displayServicesListing;
    //this.var.sightseeing = 1;
    this.setState({renderToggle: !this.state.renderToggle});
  }


  //**********************************************************/
  refreshData = async () => {
    if (this.props.refreshData !== undefined) {
      await this.props.refreshData();      
      this.setState({renderToggle: !this.state.renderToggle});
    }
  }

  //**********************************************************/
  refreshActivityData = async () => {

    const index = this.props.mainData.findIndex(rec => rec.key === this.var.activeKey);        

    if (index !== -1) {
      const ref = this.var.refs[index];
      ref.current.scrollIntoView({behaviour: 'smooth', block: 'nearest', inline: 'start'});
      this.setState({renderToggle: !this.state.renderToggle});
    }

  }

  //**********************************************************/
  allDataSwitchValueChanged = async (e) => {
    // Save switch value to Redux Store
    await this.props.setPrestoParamValues_action({
      allData: e
    });  
    this.setState({allDataSwitchValue: e});

  }

  //**********************************************************/
  voucherDescriptionSwitchValueChanged = async (e) => {
    this.setState({voucherDescriptionSwitchValue: e});
  }

  //**********************************************************/
  autoFillAll = async () => {

    this.setState({isDataFetched: false});

    const sql = 'EXEC p_AutoFillActivities ' + this.props.quotations_id.toString();
    const spData = {sql: sql};
    await dbExecuteSp(spData);  

    await this.refreshData();

    this.setState({isDataFetched: true});

    await this.refreshActivityData();

  }

  //**********************************************************/
  renderContent() {

    const panelHeight = 50;

    // this is to force footer at the bottom in case of less content
    let categoryHeight = document.body.clientHeight - HEADER_HEIGHT - panelHeight - 40;

    const panelContainerStyle = {
      minHeight: 50,
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f0',
    };

    if (!this.state.isDataFetched) {
      return (
        <div style={panelContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={categoryHeight} />
        </div>
      )
    }

    this.var.activityDate = this.props.activityDate;
    //const data = this.props.mainData.filter(rec => rec.activityDate === this.var.activityDate);    
    const data = (this.state.allDataSwitchValue) ? [...this.props.mainData] : [...this.props.mainData.filter(rec => rec.activityDate === this.var.activityDate)];

    /*=== Add row ===*/
    const dayActivityProps = {
      numButtons: 1,
      buttonListObj: [
        {visible: !this.state.allDataSwitchValue, options: {icon: "chevronleft", onClick: this.previousDay, hint: 'Previous Day'}},
        {visible: !this.state.allDataSwitchValue, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Next Day' }},

        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},

        {visible: true, options: {icon: "refresh", onClick: this.refreshData, hint: 'Refresh Data' }},
        {visible: true, options: {icon: "icons/create.png", onClick: this.autoFillAll, hint: 'Auto fill Acc/SS/Trsf' }},
        
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},
        {visible: false, options: {icon: "chevronright", onClick: this.nextDay, hint: 'Dummy for separation'}},

      ],
      height: 40,
      boxContainerStyle: {border: '0px solid black'}
    };

    const idx = this.var.detailedItin.findIndex((elem) => moment(elem.QuoDate).format('DD/MM/YYYY') === this.var.activityDate);
    const detailedItinString = (idx > -1) ? this.var.detailedItin[idx].DaySummaryInfo : '';

    const voucherDescString = (this.state.allDataSwitchValue) ? 'Voucher Description' : 'Itinerary Description';

    if (data.length === 0) {
      return (null)
    }

    return (
      <div style={{height: '100%'}}>
        <div style={{display: 'flex', flexDirection: 'row', height: 40, background: '#f5f5f0'}}>
          <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', background: '#f5f5f0'}}>
            <div style={{fontSize:  16, display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', background: '#f5f5f0', paddingRight: 5}}>
              All data
            </div>
            <Switch 
              height={20} 
              width={40} 
              onChange={this.allDataSwitchValueChanged} 
              checked={this.state.allDataSwitchValue} 
              uncheckedIcon={false}
              >
            </Switch>              
          </div>
          <div style={{width: '100%', height: '100%', display: 'flex', flex: 2, flexDirection: 'row'}}>
            <ToolbarOptions text="" {...dayActivityProps} ></ToolbarOptions>
          </div>
          <div style={{width: '100%', height: '100%', display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', background: '#f5f5f0'}}>
            {this.var.isVoucherCreated && 
              <React.Fragment>
                <div style={{fontSize:  16, display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', background: '#f5f5f0', paddingRight: 5}}>
                  {voucherDescString}
                </div>
                <Switch 
                  height={20} 
                  width={40} 
                  onChange={this.voucherDescriptionSwitchValueChanged} 
                  checked={this.state.voucherDescriptionSwitchValue} 
                  uncheckedIcon={false}
                >
                </Switch>                            
             </React.Fragment>
            }
          </div>
        </div>

        <div style={{height: categoryHeight}}>
          <ScrollView width='100%' height='100%' /*showScrollbar={showScrollBar}*/ useNative={false}>
            <div style={{height: '100%'}}>
              {this.allActivities(data)}  
              {this.var.isDetailedItinCreated && this.state.voucherDescriptionSwitchValue &&
               detailedItinString.length > 0 && this.state.allDataSwitchValue === false &&
                <div id='y123' style={{width: '100%', backgroundColor: '#ffe6cc', fontSize: 16}}>            
                  {detailedItinString}
                </div>
              }
            </div>
          </ScrollView>
        </div>

        {this.var.displayHotelList && this.var.activeCities_id !== null &&
         this.var.activeDate !== null &&
          <div style={{height: 200}}>
            <PrestoCityHotelList
              cities_id={this.var.activeCities_id}
              dateIn={moment(this.var.activeDate).format('DD/MM/YYYY')}
              open={this.var.open}
              getSelectedHotel={this.getSelectedHotelFromList}
              hotelCategory={this.var.hotelCategory}
            >
            </PrestoCityHotelList>
          </div>
        }

        {this.var.displaySightseeingList && this.var.activeCities_id !== null &&
         this.var.activeDate !== null &&
          <div style={{height: 200}}>
            <PrestoCitySightseeingList
              cities_id={this.var.activeCities_id}
              serviceDate={moment(this.var.activeDate).format('DD/MM/YYYY')}
              open={this.var.open}
              getSelectedService={this.getSelectedServiceFromListing}
            >
            </PrestoCitySightseeingList>
          </div>
        }


        {this.state.toastIsVisible &&
          <div style={toastContainerStyle}>
            <Toast
              visible={this.state.toastIsVisible}
              message={this.var.toastMessage}
              type={"info"}
              onHiding={this.onToastHiding}
              displayTime={3000}
              maxWidth={300}
              position={"center"}
            />
          </div>
        }
      </div>
    )

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
    prestoParams: state.prestoParams
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setPrestoParamValues_action: (prestoParamsObj) => {
      dispatch(setPrestoParamValues(prestoParamsObj))
    }  
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(PrestoDayActivity));

