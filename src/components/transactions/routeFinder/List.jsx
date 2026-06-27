import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../common/withRouterCompat';
import  ListItem  from './ListItem';
import {Button} from 'devextreme-react/button';

import moment from 'moment';

class List extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      isDataFetched: false,
      renderToggle: false
    };

    this.var = {
      data: [], uniqueOptionsData: [], selectedOptionNo: 1
    }

  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    this.var.data = [...this.props.data];

    this.var.uniqueOptionsData = [...new Set(this.var.data.map(item => item.OptionNo))]; 

    this.setGroupDuration();

console.log('this.var.data', this.var.data);    

    if (this._isMounted) 
      this.setState({isDataFetched: true});   

  }

  //**********************************************************/
  setGroupDuration = async() => {
    this.var.uniqueOptionsData.forEach(rec => {
      const optionData = this.var.data.filter(item => item.OptionNo === rec);
      const departure = optionData[0].Departure;
      const arrival = optionData[optionData.length-1].Arrival;
      const durationMin = moment(arrival).diff(moment(departure), 'minutes');
      const durationHrs = Math.floor(durationMin/60);
      const durationDays = Math.floor(durationHrs/24);

      const hours = durationHrs - (durationDays*24);
      const minutes = durationMin - (durationDays*24*60) - (durationHrs*60);

      let groupDuration = '';
      if (durationDays > 0) {
        groupDuration += (durationDays === 1) ? '1 day ' : durationDays.toString() + ' days ';
      }
      if (hours > 0) {
        groupDuration += (hours === 1) ? '1 hr ' : hours.toString() + ' hrs ';
      }
      if (minutes > 0) {
        groupDuration += (minutes === 1) ? '1 min ' : minutes.toString() + ' min ';
      }
      this.var.data.map(item => {
        if (item.OptionNo === rec) {
          item.GroupDuration = groupDuration.trim();
        }
        return item;
      })
    })
  }

  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  componentDidUpdate(prevProps) {
    if (this.props.reportType !== prevProps.reportType) {
      this.var.data = [...this.props.data];
      this.setState({renderToggle: !this.state.renderToggle}) 
    }
    
  }
  
  //**********************************************************/
  getSelectedItem = async (e) => {

console.log('e',e);    

    this.var.selectedOptionNo = e.optionNo;
    this.setState({renderToggle: !this.state.renderToggle});

/*
    let updatedList = this.var.data.map(item => {
      if (item.key2 === e.key2) {
        return {...item, value: e.value};
      }
      return item;
    });    

    // save the updated data
    this.var.data = [...updatedList];

    this.setState({renderToggle: !this.state.renderToggle}, async () => {
      if (this.props.getSelectedList !== undefined) {
        await this.props.getSelectedList(this.var.data);
      }
    });
*/    

  }
 
 
  //**********************************************************/
  renderContent() {

    const buttonContainerStyle = {
      height: 60,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
    
    return(
      <div>

          {
            this.var.uniqueOptionsData.map((rec) => {
              const data = this.var.data.filter(item => item.OptionNo === rec);
              return (
                <div style={{paddingBottom: 5}}>
                  <ListItem key={rec} data={data} selectedOptionNo={this.var.selectedOptionNo} flexWidth={[1,2]} onClick={this.getSelectedItem} ></ListItem>
                </div>
              )
            })
          }

          { this.props.routeFinderType === 2 &&
            <div style={buttonContainerStyle}>
              <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
                <Button text="Close" type="default" onClick={this.closePopover}/>
              </div>
              <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
                <Button text={"Select"} disabled={false} type="success" onClick={this.sendEmails}/>
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
  

export default connect()(withRouter(List));



