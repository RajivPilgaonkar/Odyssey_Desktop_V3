import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import { HEADER_HEIGHT } from '../../../../../config/paths';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp } from '../../../../../actions';
import { beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, getFieldsArray, getReorderedList, saveReordedListToDB } from "../../../../common/CommonTransactionFunctions";
import { canDelete } from "../../../../common/CommonFunctions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getAgentFromCostServices} from "../../../../common/GetDescFromIds";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetSrvMiscData";
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { formHelp } from './Help';


// some of the devextreme css properties are overridden
import '../../../../common/MasterDataGrid.css';

import moment from 'moment';

class CostSrvMisc extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = { isDataFetched: null,  
      costservices_id: (this.props.costservices_id !== undefined) ? this.props.costservices_id : -1,
      isPopupVisible: false, errorMsg: '',
      toastIsVisible: false, deleteDialogBoxOpen: false, 
      showHint: false, isPopoverVisible: false,
      renderToggle: false
    };

    this.var = { dataGridRef: React.createRef(), 
      mainData: [], tableName: 'costservicesothers', keyField: 'costservicesothers_id',
      currencyLookup: [], residentLookup: [], userLookup: [],
      formData: {}, formOldData: {}, formTitle: 'ABC', formMode: -1,
      deleteRecord: false,deleteRecordId: -1, 
      focusedRowKey: -1, initialFilterValue: -1
    };

  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    this.var.currencyLookup = await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'});   
    this.var.residentLookup = await dbGetRecord({fields: ['residents_id', 'resident'], orders: ['residents_id'], table: 'residents'});           
    this.var.userLookup = await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'});   

    await this.filterData();

    if (this._isMounted) {
      this.setState({isDataFetched: true}, async ()  => {
        await this.props.onCostSrvMiscLoad(true);
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
    if (this.props.costservices_id !== prevProps.costservices_id) {      

      if (this._isMounted) {
        await this.filterData();      
      }

      if (this.props.onCostSrvMiscLoad !== undefined) {
        this.props.onCostSrvMiscLoad(true);
      }

    }
  }  

  //**********************************************************/
  filterData = async () => {

    const fieldArray = getFieldsArray(tableHeaderArray);

    const whereStr = 'costservices_id = ' + this.props.costservices_id;
    this.var.mainData = await dbGetRecord({fields: fieldArray, orders: ["COALESCE(remarks,''),frompax,topax"], table: this.var.tableName, where: whereStr});

    // force render
    this.setState({renderToggle: !this.state.renderToggle});

  }

  //**********************************************************/
  editRow = async (e) => {

    let obj = this.var.mainData.find(o => o[this.var.keyField] === e.row.data[this.var.keyField]);
    const agentObj = await getAgentFromCostServices(this.props.costservices_id);

    this.var.formData = {...obj}; 
    this.var.formOldData = {...obj}; 
    this.var.formMode = 2;
    this.var.formTitle = agentObj.orgService;

    this.setState({errorMsg: ''}, async () => {
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
    defaultObj = {...defaultObj, costservices_id: this.props.costservices_id};

    // get agent info
    const agentObj = await getAgentFromCostServices(this.props.costservices_id);

    this.var.formData = {...defaultObj};
    this.var.formMode = 1;
    this.var.formTitle = 'New misc cost for ' + agentObj.orgService;

    this.setState({errorMsg: ''});

    this.togglePopup();
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
    let condition = "WHERE costservices_id = " + this.var.formData.costservices_id + " " + 
      "AND frompax = " + this.var.formData.frompax + " " + 
      "AND topax = " + this.var.formData.topax + " " + 
      "AND resident = " + this.var.formData.resident + " " +
      "AND COALESCE(remarks,'') = '" + (this.var.formData.remarks ? this.var.formData.remarks : '') + "' " +
      "AND currencies_id = " + this.var.formData.currencies_id;
    condition += (this.var.formMode === 2) ? "AND costservicesothers_id <> " + this.var.formData.costservicesothers_id: "";

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

    this.state.formData = {...saveData.formData}; 
    this.state.formOldData = {...saveData.formData};

    if (this.var.formMode === 1) {
      // move to the page which has inserted record
      //await this.var.dataGridRef.current.instance.navigateToRow(this.var.formData.ContactSubCategories_id);

      // when focusedRowKey is set > 0, the focus shifts to that row
      this.var.focusedRowKey = saveData.formData[this.var.keyField];
      this.setState({renderToggle: !this.state.renderToggle});

      // if not reset, it would remain on that row for any other render function
      this.var.focusedRowKey = -1;
      this.setState({renderToggle: !this.state.renderToggle});

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
  getSelectedCurrency = async(e) => {
    this.setState({formData: {...this.var.formData, currencies_id: e[0].currencies_id}})
  }

  //**********************************************************/
  getSelectedResident = async(e) => {
    this.setState({formData: {...this.var.formData, resident: e[0].residents_id}})
  }

  //**********************************************************/
  getSelectedUser = async(e) => {
    this.setState({formData: {...this.var.formData, ModifiedByUsers_id: e[0].AdmUsers_id}})
  }

  //**********************************************************/
  clearCurrencyLookup = async() => {
    this.setState({formData: {...this.var.formData, currencies_id: null}})
  }

  //**********************************************************/
  clearResidentLookup = async() => {
    this.setState({formData: {...this.var.formData, resident: null}})
  }

  //**********************************************************/
  clearUserLookup = async() => {
    this.setState({formData: {...this.var.formData, ModifiedByUsers_id: null}})
  }

  //**********************************************************/
  onToastHiding = async () => {
    this.setState({toastIsVisible: false});
  }

  //**********************************************************/
  getSelectedOption = async (e) => {
    this.setState({/*deleteRecord: (e === 1) ? true : false,*/ deleteDialogBoxOpen: false});

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
    this.setState({costservicesothers_id: e.row.data.costservicesothers_id});
    if (this.props.onChangeMiscRow !== undefined) {
      await this.props.onChangeMiscRow(e);
    }
  }
  
  //**********************************************************/
  onRowClick = async (e) => {
    //this.setState({ContactCategories_id: e.data.ContactCategories_id});
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

    if (!this.state.isDataFetched || ((this.props.allMasterComponentsLoaded !== undefined) && !this.props.allMasterComponentsLoaded) ||
       (!this.props.displayAllMode && this.var.mainData.length === 0)) {            
      return (
        <div></div>
      )
    }

    /*=== can add only if a proper master key (ContactCategories_id) is sent through props ===*/
    const canAdd = ((this.props.costservices_id !== undefined) && (this.props.costservices_id)) ? true : false;

    /*=== For Master-Detail (in Details) filter the details data based on the master key ===*/
    //gridData = gridData.filter(rec => rec.ContactCategories_id === this.props.ContactCategories_id);

    const dataObj = {
      data: this.var.mainData,
      keyExpr: this.var.keyField,
      gridRef: this.var.dataGridRef,
      dbLookup: [
        {keyField: 'currencies_id', dataSource: this.var.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'residents_id', dataSource: this.var.residentLookup , 
        displayExpr: 'resident', valueExpr: 'residents_id', fieldList: ['resident']},

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
      focusedRowKey: this.state.focusedRowKey,
      customizeText: this.customizeText,
      gridOptionChanged: this.gridOptionChanged,
      //initialFilterValue: this.var.initialFilterValue,
      //searchPanelVisible: false,
      //searchPanelPlaceHolder: "City Alias",
      onFocusedRowChanged: this.onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
    };

    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearResidentLookupValues = {residents_id: null, resident: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, this.var.currencyLookup, 
      ['currencies_id','currencycode'], this.var.formData.currencies_id);

    const initialResidentLookupValues = getLookupValues (
      clearResidentLookupValues, this.var.residentLookup, 
      ['residents_id','resident'], this.var.formData.resident);
  
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
      clearLookup: [this.clearCurrencyLookup , this.clearResidentLookup, this.clearUserLookup],
      getSelectedRecord: [this.getSelectedCurrency , this.getSelectedResident, this.getSelectedUser],
      initialLookupValues: [initialCurrencyLookupValues, initialResidentLookupValues, initialUserLookupValues],
      clearLookupValues: [clearCurrencyLookupValues, clearResidentLookupValues, clearUserLookupValues],
      labelLocation: "left"
    }

    /*=== Reorder by Row Drag & Drop ===*/
    const srvMiscProps = {
      numButtons: 1,
      buttonListObj: [
      {visible: canAdd, options: {icon: "add", onClick: this.addRow, hint: 'Add a new Misc cost'}}
      ],
      height: 40
    };

    return (
      <div style={{width: '100%', height: '100%'}}>
        <ToolbarOptions text={"Misc Costs"} {...srvMiscProps} ></ToolbarOptions>
        {popupTitle(formObj, popupTitleContainerStyle)}        
        <div style={pageContainerStyle}>
          {getDevExtremeTable(dataObj, this.props.dbUser.superuser)}
        </div>
        <div>
          {getDevExtremePopupForm(formObj,dataObj)}
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

const mapDispatchToProps = () => {
  return {
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostSrvMisc));

