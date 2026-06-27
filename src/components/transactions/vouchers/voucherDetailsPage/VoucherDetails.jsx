import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../common/withRouterCompat';
import {Button} from 'devextreme-react/button';
import {Popup} from 'devextreme-react/popup';
import ScrollView from 'devextreme-react/scroll-view';
import {Form, Item, TabbedItem, Tab, TabPanelOptions} from 'devextreme-react/form';
import { dbGetRecordRaw, dbGetRecord, dbExecuteSp } from '../../../../actions';
import DataGrid, { Paging, Pager } from 'devextreme-react/data-grid';
import { Column } from 'devextreme-react/data-grid';
import { convertDMY_MDY, getLookupValues, getDevextremeFormItems, getFieldsArray } from "../../../common/CommonTransactionFunctions";
import {getDevExtremeStandardTable, popupTitle, popupFooter, toast} from "../../../common/HelperComponents";
import {popupTitleContainerStyle, popupFooterButtonContainerStyle, toastContainerStyle} from "../../../common/ComponentStyles";
import { formHelp } from './Help';

// some of the devextreme css properties are overridden
import './VoucherDetails.css';

import moment from 'moment';

export const tableHeaderArray = 
  [ {key: 1, label: "ID", field: 'vouchersaccommodation_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0},
    {key: 2, label: "vouchers_id", field: 'vouchers_id', width: 60, align: "left", dataType: 'number', visible: true, visibleInForm: true, isLookup: false, groupNo: 0},  
  ];


class VoucherDetails extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {message: '', renderToggle: false};

    this.var = {
      searchText: '', searchType: 1, numYears: 0, 
      tourCode: '', tourDate: '01/01/2000', 
      tourCodeField: '', tourDateField: '', pax: '', tourRef: '',
      dataSource: null, keyExpr: '', 
      tableWidth: 450, focusedRowKey: -1, 
      vouchers_id: -1, vouchersAccommodation_id: -1,
      voucherTypes_id: -1
    }

  }

  //**********************************************************/
  componentDidMount() {

console.log('Hello Voucher Details ....', this.props);

    if (this.props.vouchers_id !== undefined) {
      this.var.vouchers_id = this.props.vouchers_id;
    }

    if (this.props.vouchersAccommodation_id !== undefined) {
      this.var.vouchersAccommodation_id = this.props.vouchersAccommodation_id;
    }

    this._isMounted = true;
  }

  //**********************************************************/
  async componentDidUpdate(prevProps) {

    let modified = false;

    if (this.props.vouchers_id !== prevProps.vouchers_id) {
      this.var.vouchers_id = this.props.vouchers_id;
      modified = true;
    }

    if (this.props.vouchersAccommodation_id !== prevProps.vouchersAccommodation_id) {
      this.var.vouchersAccommodation_id = this.props.vouchersAccommodation_id;
      modified = true;
    }
    
    if (modified) {
      await this.getVoucherDetails();
      this.setState({renderToggle: !this.state.renderToggle})

    } 

    this._isMounted = true;
  }
  
  //**********************************************************/
  componentWillUnmount = () => {
    this._isMounted = false;
  }

  //**********************************************************/
  getVoucherDetails = async () => {    

    /*=== Insert a record in case one does not already exist ===*/
    let sql = "EXEC [p_InsertVoucherDetails] " + 
      this.var.vouchers_id.toString();

    const spData = {sql: sql};
    await dbExecuteSp(spData);

    let fieldArray = getFieldsArray(tableHeaderArray);

    const whereStr = "va.vouchers_id = " + this.var.vouchers_id.toString();

    const tableStr = "vouchersaccommodation va ";

    this.var.mainData = await dbGetRecord({fields: fieldArray, orders: ['vouchersaccommodation_id'], table: tableStr, where: whereStr});   

  }
  
  //**********************************************************/
  closePopover = async () => {    

console.log('this.props',this.props);    

    if (this.props.updateDescription !== undefined) {
      this.props.updateDescription({open: false, refresh: false});
    }    
    this.setState({message: ""});
  };  


  //**********************************************************/
  renderContent() {

    const boxWidth = this.var.tableWidth;
    const boxHeight = 400;

    const containerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    };

    const boxContainerStyle = {
      height: boxHeight,
      width: boxWidth,
      display: 'flex',
      justifyContent: 'center',
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
      height: 60,
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

    const dataObj = {
      data: this.var.mainData,
      keyExpr: this.var.keyField,
      gridRef: this.var.dataGridRef,
      dbLookup: [       
         
/*        
        {keyField: 'vouchertypes_id', dataSource: this.var.voucherTypeLookup, 
        displayExpr: 'descr', valueExpr: 'vouchertypes_id', fieldList: ['descr']},

        {keyField: 'Addressbook_id', dataSource: this.var.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'cities_id', dataSource: this.var.cityLookup, 
        displayExpr: 'city', valueExpr: 'cities_id', fieldList: ['city']},

        {keyField: 'Addressbook_id', dataSource: this.var.agentLookup, 
        displayExpr: 'OrgCity', valueExpr: 'Addressbook_id', fieldList: ['OrgCity']},

        {keyField: 'currencies_id', dataSource: this.var.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'AdmUsers_id', dataSource: this.var.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
*/

      ],
      onTabOptionChanged: this.onTabOptionChanged,
      customizeText: this.customizeText,
      onRowPrepared: this.onRowPrepared,
      onContextMenuPreparing: this.onContextMenuPreparing, /*=== Right click menu ===*/
      dialogMessage1: this.state.dialogMessage1,
      dialogMessage2: this.state.dialogMessage2
    };

    // *** CASE SENSITIVE override formData properties
    const clearVoucherTypeLookupValues = {vouchertypes_id: null, descr: ''};
    const clearAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCityLookupValues = {cities_id: null, city: ''};
    const clearBookThroughAgentLookupValues = {Addressbook_id: null, OrgCity: ''};
    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

/*    
    const initialVoucherTypeLookupValues = getLookupValues (
      clearVoucherTypeLookupValues, this.var.voucherTypeLookup, 
       ['vouchertypes_id','descr'], this.var.formData.vouchertypes_id);

    const initialAgentLookupValues = getLookupValues (
      clearAgentLookupValues, this.var.agentLookup, 
      ['Addressbook_id','OrgCity'], this.var.formData.Addressbook_id);

    const initialCityLookupValues = getLookupValues (
      clearCityLookupValues, this.var.cityLookup, 
      ['cities_id','city'], this.var.formData.cities_id);
      
    const initialBookThroughAgentLookupValues = getLookupValues (
      clearBookThroughAgentLookupValues, this.var.agentLookup, 
      ['Addressbook_id','OrgCity'], this.var.formData.through_addressbook_id);
  
    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, this.var.currencyLookup, 
      ['currencies_id','currencycode'], this.var.formData.currencies_id);
    
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,this.var.userLookup, 
      ['AdmUsers_id','uid'], this.var.formData.ModifiedByUsers_id);

*/


    const displayNavigateButtons = (this.var.formMode !== 1);
  
    const formObj = {
      formTitle: this.var.formTitle,
      visible: true,
      tabIndex: this.state.tabIndex,
      tabs: this.state.tabs,
      popoverVisible: this.state.isPopoverVisible,
      onHiding: this.closePopover,
      errorMsg: this.state.errorMsg,
      formData: this.var.formData,
      formOldData: this.var.formOldData,
      formMode: this.var.formMode,
      saveFormData: this.saveFormData,
      toastIsVisible: this.state.toastIsVisible,
      toastMessage: 'Please refresh the Wef data',
      onToastHiding: this.onToastHiding,
      showHint: this.state.showHint,
      showHintData: this.toggleHint,
      showHelpData: this.onHelpClick,
      formHelp: formHelp,
      clearLookup: [/*this.clearVoucherTypeLookup, this.clearAgentLookup, this.clearCityLookup, this.clearBookThroughAgentLookup, this.clearCurrencyLookup, this.clearUserLookup*/],
      getSelectedRecord: [/*this.getSelectedVoucherType, this.getSelectedAgent, this.getSelectedCity, this.getSelectedBookThroughAgent, this.getSelectedCurrency, this.getSelectedUser*/],
      initialLookupValues: [/*initialVoucherTypeLookupValues, initialAgentLookupValues, initialCityLookupValues, initialBookThroughAgentLookupValues, initialCurrencyLookupValues, initialUserLookupValues*/],
      clearLookupValues: [/*clearVoucherTypeLookupValues, clearAgentLookupValues, clearCityLookupValues, clearBookThroughAgentLookupValues, clearCurrencyLookupValues, clearUserLookupValues*/],
      labelLocation: "left",
      formFieldDataChanged: this.formFieldDataChanged
    }

    const popupHeight = (formObj.errorMsg) ? 650+popupTitleContainerStyle.height : 650;
    const showScrollBar = formObj.showHintData ? 'always' : 'never';

    const btnObjArray = [];

    return (

      <React.Fragment>
      <Popup
          ref={formObj.formRef}
          visible={formObj.visible}
          hideOnOutsideClick={false}
          onHiding={formObj.onHiding}
          height={popupHeight}
          width={1200}
          title={formObj.formTitle}
          showTitle={true}          
      >

      <ScrollView width='100%' height='100%' showScrollbar={showScrollBar} useNative={false}>

      {popupTitle(formObj, popupTitleContainerStyle)}

      <Form
        colCount={1}
        id="form"
        formData={formObj.formData}
        onFieldDataChanged={formObj.formFieldDataChanged}
      >
        <TabbedItem colSpan={1}>
          <TabPanelOptions onSelectionChanged={dataObj.onTabOptionChanged} selectedIndex={formObj.tabIndex}/>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[0].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,0,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Remarks" colCount={4}>
              {getDevextremeFormItems(tableHeaderArray,1,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[1].title : ''} >
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,2,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="Voucher Issue Details" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption = "Link to Quotation" colCount={3} >
                {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
            </Item>
          </Tab>
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[2].title : ''} >
            <Item itemType="group" caption="Uncoded Customer Info" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,3,formObj,dataObj)}
            </Item>
            <Item itemType="group" caption="" colCount={3}>
              {getDevextremeFormItems(tableHeaderArray,4,formObj,dataObj)}
            </Item>
          </Tab>

{/*          
          <Tab title={(formObj.tabs !== undefined) ? formObj.tabs[3].title : ''} >
              {<ListInvoiceDetails {...listInvoiceDetailsProps}></ListInvoiceDetails>}
          </Tab>
*/}

        </TabbedItem>

      </Form>

      {popupFooter(formObj, popupFooterButtonContainerStyle, btnObjArray)}

      </ScrollView>

      </Popup>          
      
      {toast(formObj, toastContainerStyle, {})}

    </React.Fragment>


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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(VoucherDetails));

