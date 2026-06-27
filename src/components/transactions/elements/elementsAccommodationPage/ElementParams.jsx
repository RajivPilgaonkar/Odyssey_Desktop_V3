import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import Box, {Item} from 'devextreme-react/box';
import SelectBox from 'devextreme-react/select-box';
import { Button } from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import Switch from "react-switch";
import {getTourRef} from "../../../common/VoucherHelpers";
import DropDownGrid2 from "../../../common/DropDownGrid2";
import { convertDMY_MDY } from "../../../common/CommonTransactionFunctions";
import { dbGetRecord, setElementParamValues } from '../../../../actions';

// some of the devextreme css properties are overridden
import './ElementsAccommodation';

import moment from 'moment';

class ElementParams extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = { isDataFetched: null, renderToggle: false, 
      wefSwitchValue: false };

    this.var = {
      masters_id: -1,
      tourCode: '', tourDate: '01/01/2000', tourLeader: '', tourRef: '',
      wef: '01/10/2022', 
      searchType: 1, searchText: '', numYears: 2, 
      searchByArray: [{type: 1, text: 'By Tour Code'}, {type: 2, text: 'By Voucher No'}, {type: 3, text: 'By Pax Name'}],
    }
              
  }

  componentDidMount() {
    this._isMounted = true;

    this.var.tourCode = (this.props.voucherParams.tourCode !== undefined && this.props.voucherParams.tourCode) ? this.props.voucherParams.tourCode : '';
    this.var.tourDate = (this.props.voucherParams.tourDate !== undefined && this.props.voucherParams.tourDate) ? this.props.voucherParams.tourDate : '01/01/2000';
    this.var.tourLeader = (this.props.voucherParams.paxName !== undefined && this.props.voucherParams.paxName) ? this.props.voucherParams.paxName : '';
    this.var.tourRef = (this.props.voucherParams.tourRef !== undefined && this.props.voucherParams.tourLeader) ? this.props.voucherParams.tourRef : '';

    this.var.wef = (this.props.elementParams.wef !== undefined && this.props.elementParams.wef) ? this.props.elementParams.wef : this.var.wef;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

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
  componentDidUpdate = (prevProps) => {

    if (this.props.voucherParams.tourCode !== prevProps.tourCode) {
      this.var.tourCode = this.props.voucherParams.tourCode;
    }

    if (this.props.voucherParams.tourDate !== prevProps.tourDate) {
      this.var.tourDate = this.props.voucherParams.tourDate;
    }

    if (this.props.voucherParams.paxName !== prevProps.paxName) {
      this.var.tourLeader = this.props.voucherParams.paxName;
    }

    if (this.props.voucherParams.tourRef !== prevProps.tourRef) {
      this.var.tourRef = this.props.voucherParams.tourRef;
    }
    
  }

  //**********************************************************/
  getSelectedParams = async (mode) => {

    const tourRefObj = await getTourRef (this.var.tourCode, this.var.tourDate);
    const tourRef = tourRefObj.tourRef;
  
    const tourObj = {
      tourCode: this.var.tourCode, 
      tourDate: this.var.tourDate, 
      paxName: this.var.tourLeader,
      tourRef: tourRef,
      dataRefreshMode: mode
    };

    await this.props.getSelectedParams(tourObj);

  }

  //**********************************************************/
  onVoucherSearchTextChange = async (e) => {
    this.var.searchText = e.value;
    this.setState({message: this.state.message+' '});
  }

  //**********************************************************/
  onSearchTypeValueChanged = async (e) => {    
    this.var.searchType = e.value;
    this.setState({message: this.state.message+' '});
  }

  //**********************************************************/
  searchVoucher = async () => {

    if (this.var.searchText.trim() > '') {
      this.setState({voucherSearchResultsPopup: true});
    }

  }
  
  //**********************************************************/
  updateWef = async () => {
    const indexObj = this.var.wefLookup.find(rec => rec.wef === this.var.wef);
    if ((indexObj === undefined) && (this.var.wefLookup.length > 0)) {
      await this.props.setParamValues_action({
        wef: this.var.wefLookup[0].wef
      });
    }

console.log('wef', this.var.wef);    
  }
  
  /*==========================================================*/
  getWefListing = async () => {

    const wef = convertDMY_MDY(this.var.wef);
    
    // all wef dates
    let whereStr = " MONTH(FromDate) = 10 AND DAY(FromDate) = 1 ";

    // only in the last 3 years
    if (!this.state.wefSwitchValue) {
      whereStr = whereStr + ' AND FromDate > DATEADD(year,-3,GETDATE()) '; 
    }    

    //await this.setState({wefLookup: await dbGetRecord({fields: ["DISTINCT wef AS wef"], orders: ['wef DESC'], table: 'CarHireP2P', where: whereStr}) });   
    const wefList = await dbGetRecord({fields: ["DISTINCT FromDate AS wef"], orders: ['wef DESC'], table: 'ElemAccommodation', where: whereStr});

    // change the date format to DD/MM/YYYY
    this.var.wefLookup = wefList.map(rec => ({wef: moment(rec.wef).format('DD/MM/YYYY')}));

    await this.updateWef();
  }


  //**********************************************************/
  onActionDropDownClick = async(e) => {
  }

  //**********************************************************/
  getSelectedWef = async (e) => {

    await this.props.setParamValues_action({
      wef: e[0].wef
    });

    this.var.wef = e[0].wef;

    this.setState({renderToggle: !this.state.renderToggle});

  }

  //**********************************************************/
  wefSwitchValueChanged = async (e) => {

    this.setState({wefSwitchValue: e}, async () => {
      await this.getWefListing();
      this.setState({renderToggle: !this.state.renderToggle});
    });
    
  }  
  
  //*********************************************************/
  getSelectedVoucherSearchOption = async(e) => {    

    if (e.refresh) {  
      this.var.tourCode = e.tourCode;
      this.var.tourDate = e.tourDate;
      this.var.tourLeader = e.pax;
      this.var.tourRef = e.tourRef;
      await this.getSelectedParams(1);
    }

    this.setState({voucherSearchResultsPopup: e.open});
    
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

    const labelStyle = {
      //flex: 1,
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

    // so that the spaces between tourCode and tourDate appear
    const tour = (this.var.tourCode + '   ' + this.var.tourDate).replace(/ /g, "\u00A0");

    return (
      <div id="roundedbox" style={panelContainerStyle}>
        <Box style={boxStyle}>

          <Item ratio={2} style={itemStyle} >            

            <div style={{...itemStyle, ...{paddingRight: '50px'}, width: 300}}>
              <DropDownGrid2
                listArray={this.var.wefLookup}
                fieldList={['wef']}
                valueExpr="wef"
                displayExpr="wef"
                label="Wef"
                getSelectedRecord={this.getSelectedWef}
                style={{width: 50,flexGrow:1}}
                showColumnHeaders={false}
                value={this.var.wef}
              />
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Switch 
                  height={20} 
                  width={40} 
                  onChange={this.wefSwitchValueChanged} 
                  checked={this.state.wefSwitchValue} 
                  uncheckedIcon={false}
                />
              </div>
            </div> 

          </Item>

          <Item ratio={1}>
          </Item>

          <Item ratio={2}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: 10, height: '100%'}}>
              <div style={{...labelStyle, color: '#0066cc', fontWeight: 700, fontSize: 20}}>
                {tour}
              </div>              
            </div>
          </Item>

          <Item ratio={1}>
          </Item>

          <Item ratio={2}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: 10, height: '100%'}}>
              <div style={labelStyle}>
                {this.var.tourLeader}
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
    voucherParams: state.voucherParams,
    elementParams: state.elementParams
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setParamValues_action: (paramsObj) => {
      dispatch(setElementParamValues(paramsObj))
    }  
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(ElementParams));

