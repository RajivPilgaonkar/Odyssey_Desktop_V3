import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../common/withRouterCompat';

import moment from 'moment';

class ListItem extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = { 
      switchValue: (this.props.value !== undefined) ? this.props.value: false,
      //text: (this.props.text !== undefined) ? this.props.text : '',
    };

  }

  componentDidMount() {

console.log('in list item', this.props);    

    this._isMounted = true;
  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  switchValueChanged = async (e) => {
    this.setState({switchValue: e.value});
    this.props.onChange({value: e.value, key2: this.props.key2});
  }

  //**********************************************************/
  selectOption = async (e) => {
    await this.props.onClick({optionNo: this.props.data[0].OptionNo});
  }

  //**********************************************************/
  renderContent() {

    const boxStyle = {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      padding: '0px'
    };

    const backgroundColor = (this.props.data[0].OptionNo === this.props.selectedOptionNo) ? '#d6f5d6' : '#f5f5f0';

    return (

      <div id="roundedbox" key={this.props.key} onClick={this.selectOption} style={{...boxStyle, width: 800, paddingTop: 10, paddingBottom: 10, backgroundColor: backgroundColor}}>


        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{fontSize: 18, paddingLeft: 10, fontWeight: 700}}>
            Option {this.props.data[0].OptionNo} 
          </div>
          <div style={{fontSize: 16, paddingLeft: 10}}>
            ({this.props.data[0].GroupDuration})
          </div>
        </div>

        { this.props.data.map((rec) => {

          let timing = moment(rec.Departure).format('HH:mm') + '/' + moment(rec.Arrival).format('HH:mm');


          let color = 'black';
          if (rec.Days > 0) {
            timing += ' (+' + rec.Days.toString() + ')';
            color ='blue';
          }

            return (
            <div style={{display: 'flex', flexDirection: 'row', width: '100%', height: '100%', fontSize: 18, color: color}}>
              <div style={{display: 'flex', flex: 2, paddingLeft: 10}}>
                {rec.FromCity} to {rec.ToCity}
              </div>
              <div style={{display: 'flex', flex: 1, fontSize: 16}}>
                {rec.ModeStr}
              </div>
              <div style={{display: 'flex', flex: 2, fontSize: 16}}>
                {rec.ModeNo}
              </div>
              <div style={{display: 'flex', flex: 1, fontSize: 16}}>
                {timing}
              </div>
            </div>
            )
           
        })
        
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

export default connect()(withRouter(ListItem));



