import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import { dbGetRecordRaw } from '../../../../actions';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';

// some of the devextreme css properties are overridden
//import './PrestoTrainsList.css';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'Services_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: false, isLookup: false, groupNo: 0},
    {key: 5, label: "Service", field: 'Service', width: 350, align: "left", dataType: 'string', visible: true, visibleInForm: false, isLookup: false, groupNo: 0, editorOptions: {maxLength:100}},    
  ];


class PrestoSightseeingList extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {message: '', renderToggle: false};

    this.var = {
      isServicesDataReady: false,
      services_id: -1, cityText: '',
      keyExpr: 'Services_id', 
      tableWidth: 450, focusedRowKey: -1, 
      dataModified: false, mainData: []
    }

  }

  //**********************************************************/
  async componentDidMount() {

    await this.fetchInitialData();

    this._isMounted = true;
  }
  
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }  

  //**********************************************************/
  async componentDidUpdate() {
    this._isMounted = true;
  }


  //**********************************************************/
  fetchInitialData = async() => {

    await this.filterData();

    if (this._isMounted)
      this.setState({isDataFetched: true});   

  }

  //**********************************************************/
  filterData = async () => {

    const transfer = (this.props.sightseeing === 1) ? 0 : 1;

    let query = "SELECT s.Services_id, s.[description] AS Service " +
      "FROM [Services] s " +
      "WHERE s.cities_id = " + this.props.cities_id.toString() + " " +
      "AND s.Transfer = " + transfer.toString() + " " +
      "AND s.Active = 1 " +
      "ORDER BY s.[description]";

   this.var.mainData = await dbGetRecordRaw({query: query});

    // search for tour code
    if (this.var.mainData.length > 0) {
      this.var.focusedRowKey = this.var.mainData[0].Services_id;
    }

    this.var.isServicesDataReady = true;

    // force render
    this.setState({renderToggle: !this.state.renderToggle});

  }

  

  //**********************************************************/
  closePopover = async () => {    
    
    if (this.props.getSelectedService !== undefined) {
      await this.props.getSelectedService({open: false, refresh: false});
    }    

  };  

  //**********************************************************/
  selectService = async (e) => {     

    if (this.props.getSelectedService !== undefined) {
      const index = this.var.mainData.findIndex(rec => rec.Services_id === this.var.services_id);
      let data = (index > -1) ? this.var.mainData[index] : [];
      await this.props.getSelectedService({open: false, refresh: true, data: data});
    }    

  };  

  //**********************************************************/
  getColumns = () => {

    this.var.tableWidth = tableHeaderArray.reduce((acc, rec) => acc + rec.width, 0);

    /*=== generate the JSX for grid columns ===*/
    return tableHeaderArray.map((rec) => {

      /*==== fields which are kewords in SQL are wrapped in [] ===*/
      let field = rec.field.startsWith('[') ? rec.field.replace('[','').replace(']','') : rec.field;

      /*=== data format ===*/
      let dataFormat = ((rec.editorOptions !== undefined) && (rec.editorOptions.displayFormat !== undefined)) ?
        rec.editorOptions.displayFormat : null;
        
      let allowFiltering = (rec.allowFilter !== undefined) && (rec.allowFilter) ? true : false;

      return (
        <Column key={rec.key}
          dataField={field} 
          caption={rec.label} 
          width={rec.width}
          alignment={rec.align}
          visible={rec.visible}
          dataType={rec.dataType}
          format={dataFormat}
          allowFiltering={allowFiltering}
        >
        </Column>
      );

    });

  }

  //**********************************************************/
  onFocusedRowChanged = async (e) => {
    this.var.focusedRowKey = e.row.data.Services_id;
    this.var.services_id = e.row.data.Services_id;
    this.setState({renderToggle: !this.state.renderToggle});
  }

  //**********************************************************/
  renderContent() {

    const boxWidth = this.var.tableWidth;
    const boxHeight = 420;

    const containerStyle = {      
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      fontSize: 20
    };

    const boxContainerStyle = {
      height: boxHeight,
      //width: boxWidth,
      display: 'flex',
      justifyContent: 'center',
      border: '1px solid #e6e6e6'
      //alignItems: 'center',
    };

    const buttonContainerStyle = {
      height: 60,
      width: boxWidth,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    const messageContainerStyle = {
      height: 40,
      width: boxWidth,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Lato',
      fontStyle: 'italic',
      fontSize: 16,
      color: 'red',
    };

    const open = (this.props.open === undefined) ? true : this.props.open;

    const disabled = false;

    let cityString = (this.props.sightseeing === 1) ? 'Sightseeing in ' : 'Transfers in ';
    cityString += this.props.city;


    return (

      <Popup visible={open} height={640} width={900} onHiding={this.closePopover}>

        <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      
        <div style={containerStyle}>
          {this.var.cityText}
        </div>

        <div style={{fontSize: 16}}>{cityString}</div>

        <div style={{height: 10, width: boxWidth, borderBottom: '1px solid #e6e6e6'}}></div>

        <div style={{...boxContainerStyle, height: boxHeight, width: boxWidth, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
          <DataGrid 
            dataSource={this.var.mainData}
            keyExpr={this.var.keyExpr}
            rowAlternationEnabled={true}
            focusedRowEnabled={true}
            focusedRowKey={this.var.focusedRowKey}
            onFocusedRowChanged={this.onFocusedRowChanged}
          >      
            <Paging 
              enabled={true} 
              defaultPageSize={9} 
            />

            <Pager
              visible={true}
              displayMode='full'
              showPageSizeSelector={false}
              showInfo={true}
              showNavigationButtons={true} 
            />      

            {this.getColumns()}

          </DataGrid>

        </div>

        <div style={{paddingBottom: 5}}></div>

        <div style={buttonContainerStyle}>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Close" type="default" onClick={this.closePopover}/>
          </div>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center'}}>
            <Button text="Select" disabled={disabled} type="success" onClick={this.selectService}/>
          </div>
        </div>

        <div style={messageContainerStyle}>
          {this.state.message}
        </div>

        </div>

      </Popup>
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
    voucherParams: state.voucherParams
  };
};

const mapDispatchToProps = () => {
  return {
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(PrestoSightseeingList));

