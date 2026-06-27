import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../../common/withRouterCompat';

import HeaderBar from '../../../../common/HeaderBar';
import CostSrvEntrance from './CostSrvEntrance';
import Footer from '../../../../common/Footer';

import { setWebPage } from '../../../../../actions';
import { WEBPAGE_COST_SERVICES_ENTRANCE } from '../../../../../actions/types';
import { mainFormHelp } from './Help';

class CostSrvEntrancePage extends Component {
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
    await this.props.setWebPage_action(WEBPAGE_COST_SERVICES_ENTRANCE);

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

    return (
      <div>
        <HeaderBar help={mainFormHelp} />
        <CostSrvEntrance costservices_id={8071} allMasterComponentsLoaded={true}/>
        <Footer/>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CostSrvEntrancePage));
