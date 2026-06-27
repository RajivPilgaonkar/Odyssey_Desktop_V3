import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';

import HeaderBar from '../../../common/HeaderBar';
//import Footer from '../../../common/Footer';
import ListVoucher from './ListVoucher';

import { setWebPage } from '../../../../actions';
import { WEBPAGE_GEN_VOUCHERS } from '../../../../actions/types';
import { mainFormHelp } from './Help';

class ListVoucherPage extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = { isDataFetched: null};
  }

  //**********************************************************/
  componentDidMount() {
    this._isMounted = true;

    // if user enters route, state is undefined
    if ((this.props.location.state === undefined) || (this.props.dbUser.users_id <= 0)) {
      this.props.history.push('/');  
    }

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {
    await this.props.setWebPage_action(WEBPAGE_GEN_VOUCHERS);

    if (this._isMounted)
      this.setState({isDataFetched: true});   
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  renderContent() {

    if (!this._isMounted) {
      return (
        <div>
        </div>
      )
    }

    // no default parameters passed to this page, except through REDUX params
    let backRoute = {};
    if ((this.props.location.state !== undefined) && 
        (this.props.location.state.backRoute !== undefined)) {
      backRoute = {backRoute: this.props.location.state.backRoute};     
    }

    const uncoded = (this.props.location.state.uncoded === undefined || this.props.location.state.uncoded === null) ? false : this.props.location.state.uncoded;

    return (
      <div>
        <HeaderBar help={mainFormHelp} {...backRoute}/>
        <ListVoucher uncoded={uncoded}/>
        {/*<Footer/>*/}
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

  //**********************************************************/
  const mapStateToProps = (state) => {
  return {
    webPage: state.webPage,
    dbUser: state.dbUser
  };
};

//**********************************************************/
const mapDispatchToProps = (dispatch) => {
  return {
    setWebPage_action: async (webPages_id) => {
      await dispatch(setWebPage(webPages_id))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListVoucherPage));
