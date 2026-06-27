import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Footer from '../../../common/Footer';
import { setStateAsync, convertDMY_toDate, convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { HEADER_HEIGHT } from '../../../../config/paths';
import { setParamValues, dbGetRecord } from '../../../../actions';
import CostServicesParams from './CostServicesParams';
import CostSrv from './costSrvPage/CostSrv';
import CostSrvClosed from './costSrvClosedPage/CostSrvClosed';
import CostSrvMisc from './costSrvMiscPage/CostSrvMisc';
import CostSrvGuide from './costSrvGuidePage/CostSrvGuide';
import CostSrvEntrance from './costSrvEntrancePage/CostSrvEntrance';
//import CostAccCommission from './costAccCommissionPage/CostAccCommission';
import { formHelp } from './Help';

// some of the devextreme css properties are overridden
import './CostServices.css';
import CostSrvTransport from './costSrvTransportPage/CostSrvTransport';

import moment from 'moment';

class CostServices extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    // make it a DD/MM/YYYY string
    var wef = '01/01/2000';

    this.state = { 
      isDataFetched: null, costservices_id: -1, 
      isPanelDataReady: false,
      allMasterComponentsLoaded: false, displayAllMode: false,
      renderToggle: false
    };

    this.var = { 
      agents_id: -1, cities_id: -1, wef: wef,
      isServiceDataReady: false, isClosedDataReady: (!this.props.services), 
      isMiscDataReady: false, isGuideDataReady: false,
      isEntranceDataReady: false, isTransportDataReady: false
    };

  }

  //**********************************************************/
  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    if (this._isMounted)
      this.setState({isDataFetched: true});   

  }
 
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }
  
  //**********************************************************/
  getSelectedParams = async (e) => {

    this.var.agents_id = e.agents_id;
    this.var.cities_id = e.cities_id;
    this.var.wef = e.wef;

    this.var.isServiceDataReady = false; 
    this.var.isClosedDataReady = false;
    this.var.isMiscDataReady = false; 
    this.var.isGuideDataReady = false;
    this.var.isEntranceDataReady = false; 
    this.var.isTransportDataReady = false;

    /*=== a new costservices_id is obtained, now update all components ===*/
    // there are multiple cost services for an addressbook/city/wef combo
    this.setState({allMasterComponentsLoaded: false});
    
    // Save to the REDUX store
    // set as parameters for forms called from this form
    await this.props.setParamValues_action({
      agents_id: e.agents_id, 
      serviceCities_id: e.cities_id,
      wef: e.wef /*=== save wef as a string in DD/MM/YYYY ===*/,
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
  toggleHint = async () => {
    this.setState({showHint: !this.state.showHint});
  };     
  
  //**********************************************************/
  onPanelLoad = async () => {
    this.setState({isPanelDataReady: true});
  }

  //**********************************************************/
  onCostSrvLoad = async (e) => {
    this.var.isServiceDataReady = e;
    await this.masterComponentsLoaded();
  }  

  //**********************************************************/
  onCostSrvClosedLoad = async (e) => {
    if ((this.props.services !== undefined) && (this.props.services)) {
      this.var.isClosedDataReady = e;
      await this.masterComponentsLoaded();
    }
  }

  //**********************************************************/
  onCostSrvMiscLoad = async (e) => {
    this.var.isMiscDataReady = e;
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  onCostSrvGuideLoad = async (e) => {
    this.var.isGuideDataReady = e;
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  onCostSrvEntranceLoad = async (e) => {
    this.var.isEntranceDataReady = e;
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  onCostSrvTransportLoad = async (e) => {
    this.var.isTransportDataReady = e;
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  masterComponentsLoaded = async () => {
    if (this.var.isServiceDataReady && this.var.isClosedDataReady &&
        this.var.isMiscDataReady && this.var.isGuideDataReady &&
        this.var.isEntranceDataReady && this.var.isTransportDataReady) {
      this.setState({allMasterComponentsLoaded: true});
    } else {
      // force render
      this.setState({renderToggle: !this.state.renderToggle});
    }
  }
  
  //**********************************************************/
  // New season added
  onChangeServiceRow = async (e) => {

    let wef;

    if (typeof e.wef === 'string') {
      const wefDate = new Date(e.wef);
      wef = moment(wefDate).format('DD/MM/YYYY');
    } else {
      wef = moment(e.wef,'MM/DD/YYYY').format('DD/MM/YYYY');
    }

    // Reset all components except service data
    this.var.isClosedDataReady = false;
    this.var.isMiscDataReady = false; 
    this.var.isGuideDataReady = false;
    this.var.isEntranceDataReady = false; 
    this.var.isTransportDataReady = false;

    this.setState({costservices_id: e.costservices_id, allMasterComponentsLoaded: false});

  }

  //**********************************************************/
  onChangeDisplayMode = async(e) => {
    this.setState({displayAllMode: e});
  }

  getActiveCostService = async(e) => {
    this.setState({costservices_id: e});
  }

  //**********************************************************/
  renderContent() {

console.log('this.state.costservices_id', this.state.costservices_id);    

    const panelHeight = 60;

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

    if (!this.state.isDataFetched) {
      return (
        <div style={pageContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={pageContainerStyle.height} />
        </div>
      )
    }

    const wef = convertDMY_MDY(this.var.wef);
    const services = (this.props.services !== undefined) ? this.props.services: true;

    return (
      <div>
        <CostServicesParams
           height={panelHeight}
           getSelectedParams={this.getSelectedParams}          
           onPanelLoad={this.onPanelLoad}
           //wef={this.var.wef}
           services={services}
        />

        {this.state.isPanelDataReady && 
          <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', background: 'rgb(230, 242, 255)'}}>          
            <div style={{pageContainerStyle,...{flex: 7, height: '100%'}}}>
              <CostSrv
                services={services}
                addressbook_id={this.var.agents_id} 
                cities_id={this.var.cities_id} 
                wef={wef}
                categoryHeight={'100%'}
                onCostSrvLoad={this.onCostSrvLoad}
                onChangeServiceRow={this.onChangeServiceRow}                            
                onChangeDisplayMode={this.onChangeDisplayMode}
                getActiveCostService={this.getActiveCostService}>
             </CostSrv>              
            </div>          
            { services && 
            <div style={{pageContainerStyle,...{flex: 3, height: '100%'}}}>
              {this.var.isServiceDataReady && 
              <CostSrvClosed 
                costservices_id={this.state.costservices_id} 
                categoryHeight={'100%'}
                onCostSrvClosedLoad={this.onCostSrvClosedLoad}
                allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}
                displayAllMode={this.state.displayAllMode}>
              </CostSrvClosed>
              }
            </div>   
            }
          </div>
        }

        {this.state.isPanelDataReady && this.var.isServiceDataReady &&
          this.var.isClosedDataReady && 
          <div style={pageContainerStyle}>
            <CostSrvMisc 
              costservices_id={this.state.costservices_id} 
              categoryHeight={'100%'}
              onCostSrvMiscLoad={this.onCostSrvMiscLoad}
              allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}
              displayAllMode={this.state.displayAllMode}>
            </CostSrvMisc>
          </div>
        }

        {this.state.isPanelDataReady && this.var.isServiceDataReady &&
          this.var.isClosedDataReady && this.var.isMiscDataReady &&
          <div style={pageContainerStyle}>
            <CostSrvGuide 
              costservices_id={this.state.costservices_id} 
              categoryHeight={'100%'}
              onCostSrvGuideLoad={this.onCostSrvGuideLoad}
              allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}
              displayAllMode={this.state.displayAllMode}>
            </CostSrvGuide>
          </div>
        }

        {this.state.isPanelDataReady && this.var.isServiceDataReady &&
          this.var.isClosedDataReady && this.var.isMiscDataReady &&
          this.var.isGuideDataReady && 
          <div style={pageContainerStyle}>
            <CostSrvEntrance 
              costservices_id={this.state.costservices_id} 
              categoryHeight={'100%'}
              onCostSrvEntranceLoad={this.onCostSrvEntranceLoad}
              allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}
              displayAllMode={this.state.displayAllMode}>
            </CostSrvEntrance>
          </div>
        }

        {this.state.isPanelDataReady && this.var.isServiceDataReady &&
          this.var.isClosedDataReady && this.var.isMiscDataReady &&
          this.var.isGuideDataReady && this.var.isEntranceDataReady &&
          <div style={pageContainerStyle}>
            <CostSrvTransport 
              costservices_id={this.state.costservices_id} 
              categoryHeight={'100%'}
              onCostSrvTransportLoad={this.onCostSrvTransportLoad}
              allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}
              displayAllMode={this.state.displayAllMode}>
            </CostSrvTransport>
          </div>
        }

        {(this.state.allMasterComponentsLoaded && this.state.costservices_id && this.state.costservices_id > 0) &&
          <Footer/>
        }

        {(!this.state.allMasterComponentsLoaded && this.state.costservices_id && this.state.costservices_id > 0) &&
          <div style={pageContainerStyle}>
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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostServices));

