import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import Footer from '../../../common/Footer';
import { setStateAsync } from "../../../common/CommonTransactionFunctions";
import { HEADER_HEIGHT } from '../../../../config/paths';
import { setParamValues } from '../../../../actions';
import CostAccommodationParams from './CostAccommodationParams';
import CostAccSeasons from './costAccSeasonsPage/CostAccSeasons';
import CostAccRoom from './costAccRoomPage/CostAccRoom';
import CostAccMeal from './costAccMealPage/CostAccMeal';
import CostAccTourLeader from './costAccTourLeaderPage/CostAccTourLeader';
import CostAccCommission from './costAccCommissionPage/CostAccCommission';
import { formHelp } from './Help';

// some of the devextreme css properties are overridden
import './CostAccommodation.css';

import moment from 'moment';

class CostAccommodation extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    // make it a javascript date object
    var wef = new Date('01/01/2000');

    this.state = { 
      isDataFetched: null, seasons_id: -1, 
      isPanelDataReady: false,
      isRoomDataReady: false, isMealDataReady: false, 
      isTourLeaderDataReady: false, isCommissionDataReady: false,
      allMasterComponentsLoaded: false
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
      await this.setState({isDataFetched: true});   

  }
 
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }
  
  //**********************************************************/
  getSelectedParams = async (e) => {

    await this.setState({seasons_id: e.seasons_id, allMasterComponentsLoaded: false});

    // Save to the REDUX store
    // set as parameters for forms called from this form
    await this.props.setParamValues_action({
      hotels_id: e.hotels_id, 
      serviceCities_id: e.cities_id,
      wef: e.wef /*=== save wef as a string in DD/MM/YYYY ===*/,
    });

  }

  //**********************************************************/
  closePopover = async () => {
    await this.setState({isPopoverVisible: false});
  };  
    
  //**********************************************************/
  onHelpClick = async () => {
    await this.setState({isPopoverVisible: !this.state.isPopoverVisible});
  };  

  //**********************************************************/
  toggleHint = async () => {
    await this.setState({showHint: !this.state.showHint});
  };     
  
  //**********************************************************/
  onPanelLoad = async () => {
    await this.setState({isPanelDataReady: true});
  }

  //**********************************************************/
  onCostAccRoomLoad = async (e) => {
    await this.setState({isRoomDataReady: e});
    await this.masterComponentsLoaded();
  }  

  //**********************************************************/
  onCostAccMealLoad = async (e) => {
    await this.setState({isMealDataReady: e});
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  onCostAccTourLeaderLoad = async (e) => {
    await this.setState({isTourLeaderDataReady: e});
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  onCostAccCommissionLoad = async (e) => {
    await this.setState({isCommissionDataReady: e});
    await this.masterComponentsLoaded();
  }

  //**********************************************************/
  masterComponentsLoaded = async () => {
    if (this.state.isRoomDataReady && this.state.isMealDataReady &&
        this.state.isTourLeaderDataReady && this.state.isCommissionDataReady) {
      await this.setState({allMasterComponentsLoaded: true});
    }
  }
  
  //**********************************************************/
  // New season added
  onCostAccSeasonChange = async (e) => {
    const wef = moment(e.wef,'MM/DD/YYYY').format('DD/MM/YYYY');
    await this.setState({seasons_id: e.seasons_id, wef: wef});
  }

  //**********************************************************/
  renderContent() {

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

    return (
      <div>
        <CostAccommodationParams
           height={panelHeight}
           getSelectedParams={this.getSelectedParams}          
           onPanelLoad={this.onPanelLoad}
           wef={this.state.wef}
        />

        {this.state.isPanelDataReady && 
          <div style={pageContainerStyle} >
            <CostAccSeasons 
              seasons_id={this.state.seasons_id} categoryHeight={'100%'}
              onCostAccSeasonChange={this.onCostAccSeasonChange}>                            
            </CostAccSeasons>
          </div>
        }

        {this.state.isPanelDataReady && this.state.seasons_id && 
          <div style={pageContainerStyle}>
            <CostAccRoom 
              seasons_id={this.state.seasons_id} categoryHeight={'100%'} 
              onCostAccRoomLoad={this.onCostAccRoomLoad}              
              allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}>
            </CostAccRoom>
          </div>
        }

        {this.state.isPanelDataReady && this.state.seasons_id && 
          <div style={pageContainerStyle}>
            <CostAccCommission
              seasons_id={this.state.seasons_id} categoryHeight={'100%'} 
              onCostAccCommissionLoad={this.onCostAccCommissionLoad}
              allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}>              
            </CostAccCommission>
          </div>
        }

        {this.state.isPanelDataReady && this.state.seasons_id && 
          <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%'}}>          
            <div style={{pageContainerStyle,...{flex: 1, height: '100%'}}}>
              <CostAccMeal 
                seasons_id={this.state.seasons_id} categoryHeight={'100%'}
                onCostAccMealLoad={this.onCostAccMealLoad}
                allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}>
              </CostAccMeal>
            </div>          
            <div style={{pageContainerStyle,...{flex: 1, height: '100%'}}}>
              <CostAccTourLeader 
                seasons_id={this.state.seasons_id} categoryHeight={'100%'}
                onCostAccTourLeaderLoad={this.onCostAccTourLeaderLoad}
                allMasterComponentsLoaded={this.state.allMasterComponentsLoaded}>
              </CostAccTourLeader>
            </div>   
          </div>
        }

        {(this.state.allMasterComponentsLoaded && this.state.seasons_id && this.state.seasons_id > 0) &&
          <Footer/>
        }

        {(!this.state.allMasterComponentsLoaded && this.state.seasons_id && this.state.seasons_id > 0) &&
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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostAccommodation));

