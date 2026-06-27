import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import DataGrid, { Selection, Paging, FilterRow, Scrolling } from 'devextreme-react/data-grid';
import {DropDownBox, Button as DropDownBoxButton} from 'devextreme-react/drop-down-box';

class DropDownFormGrid extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = { 
      gridBoxValue: [], isGridBoxOpened: false
    };

  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  onSelectionChanged = async (e) => {

    await this.setState({
                          gridBoxValue: e.selectedRowKeys,
                          isGridBoxOpened: false
                        });

    //this.props.test(this.props.id,e.selectedRowKeys[0]);

  }

  //**********************************************************/
  onValueChanged = async (e) => {

    if (e.value === null) {
      await this.setState({
        gridBoxValue: [this.props.clearLookupValues],
        isGridBoxOpened: false,        
      });
      await this.props.clearLookup();
    }
    
  }

  //**********************************************************/
  dataGridOnSelectionChanged = async (e) => {
    await this.setState({
                          gridBoxValue: e.selectedRowKeys,
                          isGridBoxOpened: false,
                        });

    if (this.props.getSelectedRecord !== undefined) {
      await this.props.getSelectedRecord(e.selectedRowKeys);
    }

  } 

  //**********************************************************/
  onGridBoxOpened = (e) =>  {
    if (e.name === 'opened') {
      this.setState({
        isGridBoxOpened: e.value,
      });
    }
  }

  //**********************************************************/
  dataGridRender = () => {

    const columnMinWidth = (this.props.columnMinWidth === undefined) ? 50 : this.props.columnMinWidth;
    const pageSize = (this.props.pageSize === undefined) ? 10 : this.props.pageSize;
    const pageEnabled = (this.props.pageEnabled === undefined) ? false : true;
    const showColumnHeaders = (this.props.showColumnHeaders === undefined) ? true : false;

    return (
      <DataGrid
        dataSource={this.props.listArray}
        columns={this.props.fieldList}
        height="100%"
        selectByClick={true}
        columnAutoWidth={true}
        columnMinWidth={columnMinWidth}
        onSelectionChanged={this.dataGridOnSelectionChanged}        
        showColumnHeaders={showColumnHeaders}
      >
        <Selection mode="single" />
        <Scrolling mode="virtual" />        
        <Paging enabled={pageEnabled} pageSize={pageSize} />
        <FilterRow visible={true} />
      </DataGrid>
    );
  }

  //**********************************************************/
  gridBoxDisplayExpr = () => {   
    if (this.state.gridBoxValue.length > 0) {
      return this.state.gridBoxValue[0][this.props.displayExpr];
    }
  }


  //**********************************************************/
  renderContent() {

    let value = (this.state.gridBoxValue.length > 0) ? this.state.gridBoxValue[0][this.props.displayExpr] : this.props.initialValue[this.props.displayExpr];

    const divStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px',
      flexDirection: 'row'
    };

    let dropDownStyle = {align: 'left', width: 400, padding: 0, fontSize: 16};
    if (this.props.style !== undefined) {
      dropDownStyle = {...dropDownStyle, ...this.props.style}
    }

    return (
      <div style={divStyle}>
      <DropDownBox
        valueExpr={this.props.valueExpr}
        displayExpr={this.gridBoxDisplayExpr}
        placeholder={this.props.placeholder}
        dataSource={this.props.listArray}
        contentRender={this.dataGridRender}
        opened={this.state.isGridBoxOpened}
        onOptionChanged={this.onGridBoxOpened}
        onValueChanged={this.onValueChanged}
        value={value}    
        style={dropDownStyle}
        showClearButton={true}
        readOnly={this.props.readOnly}
      >
        <DropDownBoxButton name="clear" />
        <DropDownBoxButton name="dropDown" />
      </DropDownBox>
      </div> 

    );

  }

  render() {

    return (
      this.renderContent()
    );
  }

}

export default connect()(withRouter(DropDownFormGrid));


