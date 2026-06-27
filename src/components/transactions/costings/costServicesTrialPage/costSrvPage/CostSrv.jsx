import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../../common/withRouterCompat';
import { HEADER_HEIGHT } from '../../../../../config/paths';
import { dbGetRecord, dbDeleteRecord, setParamValues } from '../../../../../actions';
import { beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, getFieldsArray } from "../../../../common/CommonTransactionFunctions";
import { canDelete } from "../../../../common/CommonFunctions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getAgentName,getServiceName,getAgentFromCostServices} from "../../../../common/GetDescFromIds";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetSrvData";
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { formHelp } from './Help';
import CopyCostings from '../../copyCostingsPage/CopyCostings';

// some of the devextreme css properties are overridden
import '../../../../common/MasterDataGrid.css';

import moment from 'moment';

class CostSrv extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    // make it a javascript date object
    var wef = new Date('01/01/2000');

    this.state = { isDataFetched: null, 
      costservices_id: -1,
      /*=== For Master-Detail (in Details) ===*/
      isPopupVisible: false, errorMsg: '',
      toastIsVisible: false, deleteDialogBoxOpen: false, 
      showHint: false, isPopoverVisible: false,
      displayAllMode: false, copyCostingPopup: false,
      renderToggle: true
    };

    this.var = { dataGridRef: React.createRef(), 
      mainData: [], tableName: 'costservices', keyField: 'costservices_id',
      /*=== For Master-Detail (in Details) ===*/
      addressbook_id: (this.props.addressbook_id !== undefined) ? this.props.addressbook_id : -1,
      cities_id: (this.props.cities_id !== undefined) ? this.props.cities_id : -1,
      wef: (this.props.wef !== undefined) ? this.props.wef : wef,
      serviceLookup: [], userLookup: [],
      formData: {}, formOldData: {}, formTitle: 'ABC', formMode: -1,
      focusedRowKey: -1, initialFilterValue: -1,
      deleteRecord: false, deleteRecordId: -1
    };

  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    const transfer = (this.props.services !== undefined) && (!this.props.services) ? 1 : 0;

    const cities_id = (this.props.cities_id !== undefined) ? this.props.cities_id : -1;
    const whereStr = 'cities_id = ' + cities_id.toString() + ' AND transfer = ' + transfer.toString();
    this.var.serviceLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id'], orders: ['[service]'], table: '[services]', where: whereStr, file: 'CostSrv'});    

    this.var.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers', file: 'CostSrv'});    

    await this.filterData();

    const costservices_id = (this.var.mainData.length > 0) ? this.var.mainData[0].costservices_id : -1;
    await this.props.getActiveCostService(costservices_id);

    if (this._isMounted) {
      this.setState({isDataFetched: true}, async () => {
        await this.props.onCostSrvLoad(true);
      });   
    }

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  componentDidUpdate = async (prevProps) => {

    // when seasons change, get filtered data for that season again
    if ((this.props.addressbook_id !== prevProps.addressbook_id) || 
        (this.props.cities_id !== prevProps.cities_id) ||
        (this.props.wef !== prevProps.wef)) {                

      const transfer = (this.props.services !== undefined) && (!this.props.services) ? 1 : 0;
      const cities_id = (this.props.cities_id !== undefined) ? this.props.cities_id : -1;

      const whereStr = 'cities_id = ' + cities_id.toString() + ' AND transfer = ' + transfer.toString();
      this.var.serviceLookup = await dbGetRecord({fields: ['services_id', '[description] AS service, cities_id'], orders: ['[service]'], table: '[services]', where: whereStr, file: 'CostSrv'});

      await this.filterData();      

      const costservices_id = (this.var.mainData.length > 0) ? this.var.mainData[0].costservices_id : -1;
      await this.props.getActiveCostService(costservices_id);
  
      await this.props.onCostSrvLoad(true);

    }
  }  

  //**********************************************************/
  filterData = async () => {

    let fieldArray = getFieldsArray(tableHeaderArray);

    // this is done since the query to retrive data is a join
    fieldArray = fieldArray.map((rec) => `cs.${rec}`);    

    /*=== Be careful with moment, as it can change the parameter you pass ===*/
    /*=== wef is in the JS date object format ===*/
    //let tmpDate = this.props.wef;
    //let wefStr = moment(tmpDate).format('MM/DD/YYYY');
    let wefStr = this.props.wef;
    const transfer = (this.props.services !== undefined) && (!this.props.services) ? 1 : 0;
    const cities_id = (this.props.cities_id !== undefined) ? this.props.cities_id : -1;
    const addressbook_id = (this.props.addressbook_id !== undefined) ? this.props.addressbook_id : -1;

    let whereStr = "(cs.addressbook_id = " + addressbook_id.toString() + ") " +
      " AND (cs.cities_id = " + cities_id.toString() + ") " + 
      " AND (cs.wef = '" + wefStr + "')";
    whereStr += 'AND cs.services_id IN (SELECT services_id FROM services WHERE transfer = ' + transfer.toString() + ')';
    const tableStr = this.var.tableName + ' cs LEFT JOIN services s ON cs.services_id = s.services_id ';
    this.var.mainData = await dbGetRecord({fields: fieldArray, orders: ['s.[description]'], table: tableStr, where: whereStr, file: 'CostSrv'});
    
    // this is done to focus on a certain row
    if (this.var.mainData.length > 0) {

      //await this.state.dataGridRef.current.instance.navigateToRow(this.var.mainData[0].costservices_id);
      this.var.focusedRowKey = this.var.mainData[0].costservices_id;
      this.var.wef = this.var.mainData[0].wef;
      this.setState({costservices_id: this.var.mainData[0].costservices_id }, async () => {
        //await this.setState({focusedRowKey: -1 });      
        //await this.props.onChangeServiceRow({costservices_id: this.var.mainData[0].costservices_id});
      });        

    } else {
      // force render
      this.setState({renderToggle: !this.state.renderToggle});
    }   

  }

  //**********************************************************/
  editRow = async (e) => {

    let obj = this.var.mainData.find(o => o[this.var.keyField] === e.row.data[this.var.keyField]);
    const agentObj = await getAgentName(e.row.data.addressbook_id);
    const serviceObj = await getServiceName(e.row.data.services_id);

    this.var.formData = {...obj};
    this.var.formOldData = {...obj}; 
    this.var.formMode = 2; 
    this.var.formTitle = serviceObj.service + ', [' + agentObj.Organisation + ']'; 
    
    this.setState({errorMsg: ''}, async() => {
      await this.togglePopup();    
    });
  }
  
  //**********************************************************/
  deleteRow = async (e) => {

    if (this.state.errorMsg > '') {
      this.setState({errorMsg: ''});
      return;
    }

    const error = await canDelete([
      {table: 'costservicesguides', condition: 'WHERE costservices_id = ' + e.row.data.costservices_id, existsIn: 'Guide Costs. Delete the guide costs first'},
      {table: 'costservicesothers', condition: 'WHERE costservices_id = ' + e.row.data.costservices_id, existsIn: 'Misc Costs. Delete the misc costs first'},
      {table: 'costservicesentrancefees', condition: 'WHERE costservices_id = ' + e.row.data.costservices_id, existsIn: 'Entrance Costs. Delete the entrance costs first'},
      {table: 'costservicestransport', condition: 'WHERE costservice_id = ' + e.row.data.costservices_id, existsIn: 'Transport Costs. Delete the transport costs first'},
      {table: 'CostServicesClose', condition: 'WHERE CostServices_id = ' + e.row.data.costservices_id, existsIn: '"Closed On". Delete the "Closed On" records first'},
    ]);    
    if (error.errorMsg === '') {
      this.var.deleteRecordId = e.row.data[this.var.keyField];
      this.setState({deleteDialogBoxOpen: true, errorMsg: ''});
    } else {
      console.log(error.errorMsg);
      this.setState({errorMsg: error.errorMsg});
    }
  }
  
  //**********************************************************/
  closePopup = async () => {
    this.setState({isPopupVisible: false, errorMsg: ''});
  };  

  //**********************************************************/
  closePopover = async () => {
    this.setState({isPopoverVisible: false});
  };  
  
  //**********************************************************/
  onHelpClick = async () => {
    this.setState({isPopoverVisible: !this.state.isPopoverVisible});
  };  
  
  //**********************************************************/
  togglePopup = async () => {
    this.setState({isPopupVisible: !this.state.isPopupVisible});
  };  


  //**********************************************************/
  toggleHint = async () => {
    this.setState({showHint: !this.state.showHint});
  };   

  //**********************************************************/
  addRow = async () => {

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    // next order number
    defaultObj = {...defaultObj, addressbook_id: this.props.addressbook_id, 
       cities_id: this.props.cities_id, wef: this.props.wef};

    // get agent info
    const agentObj = await getAgentName(this.props.addressbook_id);

    this.var.formData = {...defaultObj};
    this.var.formMode = 1;
    this.var.formTitle = 'New costing for ' + agentObj.Organisation;

    this.setState({errorMsg: ''}, () => {
      this.togglePopup();
    });

  }
  
  //**********************************************************/
  saveFormData = async () => {

    // Remove any previous error messages
    this.setState({errorMsg: ''});

    // check for null & data errors in form
    let errorMsg = await this.checkFormErrors(this.var.formData);
    if (errorMsg > '') {
      this.setState({errorMsg: errorMsg});
      return;      
    }
    
    let tmpFormData = {...this.var.formData};

    // check duplicate
    let condition = "WHERE addressbook_id = " + this.var.formData.addressbook_id + " " + 
      "AND cities_id = " + this.var.formData.cities_id + " " + 
      "AND services_id = " + this.var.formData.services_id + " " + 
      "AND wef = '" + moment(this.var.formData.wef).format('MM/DD/YYYY') + "' ";
    condition += (this.var.formMode === 2) ? "AND costservices_id <> " + this.var.formData.costservices_id: "";

    let obj = {
      formMode: this.var.formMode,
      tableName: this.var.tableName,
      keyField: this.var.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: this.props.dbUser.users_id,
        ModifiedOn: moment().format('MM/DD/YYYY'),
      },
      afterPost: this.afterPost
    }

    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, this.var.formOldData, obj);
    if (saveData.errorMsg > '') {
      this.setState({errorMsg: saveData.errorMsg});
      return;      
    }    

    this.var.formData =  {...saveData.formData};
    this.var.formOldData = {...saveData.formData};

    if (this.var.formMode === 1) {
      // move to the page which has inserted record

      // when focusedRowKey is set > 0, the focus shifts to that row
      this.var.focusedRowKey = saveData.formData[this.var.keyField];

      // force render
      this.setState({renderToggle: !this.state.renderToggle });

      // if not reset, it would remain on that row for any other render function
      this.var.focusedRowKey = -1;      

      // force render
      this.setState({renderToggle: !this.state.renderToggle });
      
    }
  
  }

  //**********************************************************/
  checkFormErrors = async (formData) => {

    // required data errors
    const checkNullError = await checkNullErrors(tableHeaderArray, formData);
    if (checkNullError.errorNo === -1) {
      return checkNullError.errorDesc;
    }

    // form validation errors

    return '';
  }

  //**********************************************************/
  afterPost = async() => {

    if (this.var.formMode === 1) {
      this.closePopup();
    }

    // refresh data
    await this.filterData();
    
  }

  //**********************************************************/
  getSelectedService = async(e) => {
    this.var.formData = {...this.var.formData, services_id: e[0].services_id};
  }

  //**********************************************************/
  getSelectedUser = async(e) => {
    this.var.formData = {...this.var.formData, ModifiedByUsers_id: e[0].AdmUsers_id};
  }

  //**********************************************************/
  clearServiceLookup = async() => {
    this.var.formData = {...this.var.formData, services_id: null};
  }

  //**********************************************************/
  clearUserLookup = async() => {
    this.var.formData = {...this.var.formData, ModifiedByUsers_id: null};
  }

  //**********************************************************/
  onToastHiding = async () => {
    this.setState({toastIsVisible: false});
  }

  //**********************************************************/
  getSelectedOption = async (e) => {
    this.setState({deleteDialogBoxOpen: false});

    // If delete option chosen
    if (e === 1) {
      const dataObj = {table: this.var.tableName, keyField: this.var.keyField, keyValue: this.var.deleteRecordId}

      // delete record
      await dbDeleteRecord(dataObj);
  
      await this.filterData();
  
    }

  }

  //**********************************************************/
  customizeText = (cellInfo) => {
    if (!cellInfo.value) 
      return ''
    else
      return String(cellInfo.valueText);
  }

  //**********************************************************/
  gridOptionChanged = async (e) => {

    // to be used only if there is initial filtering on the grid
    // ... which needs to be cleared when changing the filter

    if ((e.name !== undefined) && (e.fullName !== undefined) && 
        (e.name === 'columns') && (e.fullName.includes('filterValue')) && 
        (this.var.initialFilterValue !== null)) {
          this.var.initialFilterValue = null;
          await this.var.dataGridRef.current.instance.clearFilter('filterValue');
        }
        
  }

  //**********************************************************/
  onFocusedRowChanged = async (e) => {
    this.var.focusedRowKey = e.row.data.costservices_id;
    this.setState({costservices_id: e.row.data.costservices_id}, async () => {
      if (this.props.onChangeServiceRow !== undefined) {
        await this.props.onChangeServiceRow(e.row.data);
      }    
    });
  }
  
  //**********************************************************/
  onRowClick = async (e) => {
    //this.setState({ContactCategories_id: e.data.ContactCategories_id});
  }  

  //**********************************************************/
  displayAllBlocks = async () => {
    this.setState({displayAllMode: !this.state.displayAllMode});
    if (this.props.onChangeDisplayMode !== undefined) {
      await this.props.onChangeDisplayMode(this.state.displayAllMode);
    }
  }

  //**********************************************************/
  copyData = async () => {

    const agentObj = await getAgentFromCostServices(this.state.costservices_id);
    const fromDate = moment(agentObj.wef).format('DD/MM/YYYY');
    const toDate = moment(agentObj.wef).add(1, 'y').format('DD/MM/YYYY');

    // Save to the REDUX store
    // set as parameters for forms called from this form
    // These will appear in the store in Copy Data
    await this.props.setParamValues_action({
      costService: agentObj.orgService,
      costFromDate: fromDate,
      costToDate: toDate
    });

    this.setState({copyCostingPopup: true})
  }

  //**********************************************************/
  getSelectedCopyCostingOption = async(e) => {
    this.setState({copyCostingPopup: e.open})
  }
  
  //**********************************************************/
  renderContent() {

    const panelHeight = 0;

    // this is to force footer at the bottom in case of less content
    let categoryHeight = document.body.clientHeight - HEADER_HEIGHT - panelHeight - 50 - 6;

    if (this.props.categoryHeight !== undefined) {
      categoryHeight = this.props.categoryHeight;
    }

    const pageContainerStyle = {
      minHeight: categoryHeight,
      height: categoryHeight,
      display: 'flex',
      //justifyContent: 'center',
      alignItems: 'center',
      background: '#e6f2ff',
      flexDirection: 'column'
    };

    if (!this.state.isDataFetched || ((this.props.allMasterComponentsLoaded !== undefined) && !this.props.allMasterComponentsLoaded)) {            
      return (
        <div></div>
      )
    }

    /*=== can add only if a proper master key (ContactCategories_id) is sent through props ===*/
    const canAdd = ((this.props.addressbook_id !== undefined) && (this.props.addressbook_id > 0) && 
          (this.props.cities_id !== undefined) && (this.props.cities_id > 0)) ? true : false;

    /*=== For Master-Detail (in Details) filter the details data based on the master key ===*/
    //gridData = gridData.filter(rec => rec.ContactCategories_id === this.props.ContactCategories_id);

    const dataObj = {
      data: this.var.mainData,
      keyExpr: this.var.keyField,
      gridRef: this.var.dataGridRef,
      dbLookup: [
        {keyField: 'services_id', dataSource: this.var.serviceLookup, 
        displayExpr: 'service', valueExpr: 'services_id', fieldList: ['service']},

        {keyField: 'AdmUsers_id', dataSource: this.var.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ],
      addRow: this.addRow,
      editRow: this.editRow,
      deleteRow: this.deleteRow,
      canAddRow: false,
      //canDeleteRow: false,
      addRowText: 'Add a Misc Cost',      
      deleteDialogBoxOpen: this.state.deleteDialogBoxOpen,
      getSelectedOption: this.getSelectedOption,
      //headerFilterVisible: true,
      //filterRowVisible: true,
      focusedRowKey: this.var.focusedRowKey,
      customizeText: this.customizeText,
      gridOptionChanged: this.gridOptionChanged,
      //initialFilterValue: this.state.initialFilterValue,
      //searchPanelVisible: false,
      //searchPanelPlaceHolder: "City Alias",
      onFocusedRowChanged: this.onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
    };

    const clearServiceLookupValues = {services_id: null, service: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialServiceLookupValues = getLookupValues (
      clearServiceLookupValues, this.var.serviceLookup, 
      ['services_id','service'], this.var.formData.services_id);
  
    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,this.var.userLookup, 
      ['AdmUsers_id','uid'], this.var.formData.ModifiedByUsers_id);

    const formObj = {
      formTitle: this.var.formTitle,
      visible: this.state.isPopupVisible,
      popoverVisible: this.state.isPopoverVisible,
      onHiding: this.closePopup,
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
      clearLookup: [this.clearServiceLookup, this.clearUserLookup],
      getSelectedRecord: [this.getSelectedService , this.getSelectedUser],
      initialLookupValues: [initialServiceLookupValues, initialUserLookupValues],
      clearLookupValues: [clearServiceLookupValues, clearUserLookupValues],
      labelLocation: "left"
    }

    const icon = (this.state.displayAllMode) ? 'hidepanel' : 'showpanel';
    const hint = (this.state.displayAllMode) ? 'Click to display only blocks with data' : 'Click to display all blocks';

    const canCopy = (this.state.costservices_id > 0 && this.var.mainData.length > 0) ? true : false;

    //const displayBlockVisible = (this.props.services !== undefined) ? this.props.services: true;

    /*=== Reorder by Row Drag & Drop ===*/
    const srvProps = {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: this.addRow, hint: 'Add a new Misc cost'}},
        {visible: true, options: {icon: icon, onClick: this.displayAllBlocks, hint: hint}},
        {visible: canCopy, options: {icon: "copy", onClick: this.copyData, hint: 'Copy Costing to next FY'}},
      ],
      height: 40
    };

    const copyCostings = {
      id: this.state.costservices_id, open: this.state.copyCostingPopup,
      serviceType: 2,
      getSelectedCopyCostingOption: this.getSelectedCopyCostingOption
    }

    return (
      <div style={{width: '100%', height: '100%'}}>
        <ToolbarOptions text={"Services"} {...srvProps} ></ToolbarOptions>
        {popupTitle(formObj, popupTitleContainerStyle)}        
        <div style={pageContainerStyle}>
          {getDevExtremeTable(dataObj, this.props.dbUser.superuser)}
        </div>
        <div>
          {getDevExtremePopupForm(formObj,dataObj)}
        </div>
        <div>
          <CopyCostings {...copyCostings} ></CopyCostings>
        </div>
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
    dbUser: state.dbUser
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setParamValues_action: (paramsObj) => {
      dispatch(setParamValues(paramsObj))
    }  
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostSrv));

