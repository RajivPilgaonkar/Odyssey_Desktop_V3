import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import { HEADER_HEIGHT } from '../../../../../config/paths';
import { dbGetRecord, dbDeleteRecord } from '../../../../../actions';
import { beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, getFieldsArray, setStateAsync } from "../../../../common/CommonTransactionFunctions";
import { canDelete } from "../../../../common/CommonFunctions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getHotelFromSeason} from "../../../../common/GetDescFromIds";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetAccMealData";
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { formHelp } from './Help';


// some of the devextreme css properties are overridden
import '../../../../common/MasterDataGrid.css';

import moment from 'moment';

class CostAccMeal extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = { isDataFetched: null, dataGridRef: React.createRef(), 
      mainData: [], clonedMainData: [], tableName: 'mealcostsindia', keyField: 'mealcosts_id',
      /*=== For Master-Detail (in Details) ===*/
      seasons_id: (this.props.seasons_id !== undefined) ? this.props.seasons_id : -1,
      currencyLookup: [], userLookup: [],
      isPopupVisible: false, errorMsg: '',
      formData: {}, formOldData: {}, formTitle: 'ABC', formMode: -1,
      toastIsVisible: false, deleteDialogBoxOpen: false, deleteRecord: false,
      deleteRecordId: -1, showHint: false, isPopoverVisible: false,
      focusedRowKey: -1, initialFilterValue: -1,
      rowDragging: false
    };

  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    if (this.state.isDataFetched) {
      await this.setState({isDataFetched: false});   
      if (this.props.onCostAccMealLoad !== undefined) {
        this.props.onCostAccMealLoad(false);
      }  
    }
    await this.setState({currencyLookup: await dbGetRecord({fields: ['currencies_id', 'currencycode'], orders: ['currencycode'], table: 'currencies'}) });   
    await this.setState({userLookup: await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'}) });   

    await this.filterData();

    if (this._isMounted) {
      await this.setState({isDataFetched: true});   
      if (this.props.onCostAccMealLoad !== undefined) {
        this.props.onCostAccMealLoad(true);
      }
    }

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  componentDidUpdate = async (prevProps) => {
    // when seasons change, get filtered data for that season again

    if (this.props.onCostAccMealLoad !== undefined) {
      this.props.onCostAccMealLoad(false);
    }

    if (this.props.seasons_id !== prevProps.seasons_id) {
      await this.filterData();      
    }

    if (this.props.onCostAccMealLoad !== undefined) {
      this.props.onCostAccMealLoad(true);
    }

  }  

  //**********************************************************/
  filterData = async () => {
    const fieldArray = getFieldsArray(tableHeaderArray);

    const whereStr = 'seasons_id = ' + this.props.seasons_id;
    await this.setState({mainData: await dbGetRecord({fields: fieldArray, orders: ['mealcosts_id'], table: this.state.tableName, where: whereStr}) });   

  }

  //**********************************************************/
  editRow = async (e) => {

    let obj = this.state.mainData.find(o => o[this.state.keyField] === e.row.data[this.state.keyField]);
    const hotelObj = await getHotelFromSeason(this.props.seasons_id);

    await this.setState({formData: {...obj}, formOldData: {...obj}, formMode: 2, errorMsg: '', formTitle: hotelObj.orgCity});
    await this.togglePopup();    
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
      await this.setState({deleteDialogBoxOpen: true, deleteRecordId: e.row.data[this.state.keyField], errorMsg: ''});
    } else {
      console.log(error.errorMsg);
      this.setState({errorMsg: error.errorMsg});
    }
  }
  
  //**********************************************************/
  closePopup = async () => {
    await this.setState({isPopupVisible: false, errorMsg: ''});
  };  

  //**********************************************************/
  closePopover = async () => {
    await this.setState({isPopoverVisible: false});
  };  
  
  //**********************************************************/
  onHelpClick = async () => {
    await this.setState({isPopoverVisible: !this.state.isPopoverVisible});
  };  
  
  //**********************************************************/
  togglePopup = async () => {
    await this.setState({isPopupVisible: !this.state.isPopupVisible});
  };  


  //**********************************************************/
  toggleHint = async () => {
    await this.setState({showHint: !this.state.showHint});
  };   

  //**********************************************************/
  addRow = async () => {

    // add default values
    let defaultObj = beforeInsert(tableHeaderArray);

    /*=== For Master-Detail (in Details) ===*/
    const whereStr = 'seasons_id = ' + this.props.seasons_id;

    // next order number
    defaultObj = {...defaultObj, seasons_id: this.props.seasons_id};

    // get hotel info
    const hotelObj = await getHotelFromSeason(this.props.seasons_id);

    await this.setState({formData: {...defaultObj}, formMode: 1, errorMsg: '', formTitle: 'New Meal Cost for ' + hotelObj.orgCity});

    this.togglePopup();
  }
  
  //**********************************************************/
  saveFormData = async () => {

    // Remove any previous error messages
    await this.setState({errorMsg: ''});

    // check for null & data errors in form
    let errorMsg = await this.checkFormErrors(this.state.formData);
    if (errorMsg > '') {
      await this.setState({errorMsg: errorMsg});
      return;      
    }
    
    let tmpFormData = {...this.state.formData};

    // check duplicate
    let condition = "WHERE seasons_id = " + this.state.formData.seasons_id + " " + 
      "AND currencies_id = " + this.state.formData.currencies_id + " ";
    condition += (this.state.formMode === 2) ? "AND mealcosts_id <> " + this.state.formData.mealcosts_id: "";

    let obj = {
      formMode: this.state.formMode,
      tableName: this.state.tableName,
      keyField: this.state.keyField,
      condition: condition,
      beforeSaveValues: { 
        ModifiedByUsers_id: this.props.dbUser.users_id,
        ModifiedOn: moment().format('MM/DD/YYYY'),
      },
      afterPost: this.afterPost
    }

    const saveData = await saveEditedInsertedData (tableHeaderArray, tmpFormData, this.state.formOldData, obj);
    if (saveData.errorMsg > '') {
      await this.setState({errorMsg: saveData.errorMsg});
      return;      
    }    

    await this.setState({formData: {...saveData.formData}, formOldData: {...saveData.formData} });

    if (this.state.formMode === 1) {
      // move to the page which has inserted record
      //await this.state.dataGridRef.current.instance.navigateToRow(this.state.formData.ContactSubCategories_id);

      // when focusedRowKey is set > 0, the focus shifts to that row
      await this.setState({focusedRowKey: saveData.formData[this.state.keyField] });
      // if not reset, it would remain on that row for any other render function
      await this.setState({focusedRowKey: -1 });      
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

    if (this.state.formMode === 1) {
      this.closePopup();
    }

    // refresh data
    await this.filterData();
    
  }

  //**********************************************************/
  getSelectedCurrency = async(e) => {
    this.setState({formData: {...this.state.formData, currencies_id: e[0].currencies_id}})
  }

  //**********************************************************/
  getSelectedUser = async(e) => {
    this.setState({formData: {...this.state.formData, ModifiedByUsers_id: e[0].AdmUsers_id}})
  }

  //**********************************************************/
  clearCurrencyLookup = async() => {
    this.setState({formData: {...this.state.formData, currencies_id: null}})
  }

  //**********************************************************/
  clearUserLookup = async() => {
    this.setState({formData: {...this.state.formData, ModifiedByUsers_id: null}})
  }

  //**********************************************************/
  onToastHiding = async () => {
    await this.setState({toastIsVisible: false});
  }

  //**********************************************************/
  getSelectedOption = async (e) => {
    await this.setState({/*deleteRecord: (e === 1) ? true : false,*/ deleteDialogBoxOpen: false});

    // If delete option chosen
    if (e === 1) {
      const dataObj = {table: this.state.tableName, keyField: this.state.keyField, keyValue: this.state.deleteRecordId}

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
        (this.state.initialFilterValue !== null)) {
          await this.setState({initialFilterValue: null});
          await this.state.dataGridRef.current.instance.clearFilter('filterValue');
        }
        
  }

  //**********************************************************/
  onFocusedRowChanged = async (e) => {
    await this.setState({mealcosts_id: e.row.data.mealcosts_id});
    if (this.props.onChangeMealPlan !== undefined) {
      await this.props.onChangeMealPlan(e);
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

    if (!this.state.isDataFetched || ((this.props.allMasterComponentsLoaded !== undefined) && !this.props.allMasterComponentsLoaded)) {            
      return (
        <div></div>
      )
    }

    /*=== can add only if a proper master key (ContactCategories_id) is sent through props ===*/
    const canAdd = ((this.props.seasons_id !== undefined) && (this.props.seasons_id) && (this.state.mainData.length === 0)) ? true : false;

    /*=== For Master-Detail (in Details) filter the details data based on the master key ===*/
    //gridData = gridData.filter(rec => rec.ContactCategories_id === this.props.ContactCategories_id);

    const dataObj = {
      data: this.state.mainData,
      keyExpr: this.state.keyField,
      gridRef: this.state.dataGridRef,
      gridHeight: 72,
      dbLookup: [
        {keyField: 'currencies_id', dataSource: this.state.currencyLookup, 
        displayExpr: 'currencycode', valueExpr: 'currencies_id', fieldList: ['currencycode']},

        {keyField: 'AdmUsers_id', dataSource: this.state.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}
      ],
      addRow: this.addRow,
      editRow: this.editRow,
      deleteRow: this.deleteRow,
      canAddRow: false,
      addRowText: 'Add a Meal Plan',
      deleteDialogBoxOpen: this.state.deleteDialogBoxOpen,
      getSelectedOption: this.getSelectedOption,
      //headerFilterVisible: true,
      //filterRowVisible: true,
      focusedRowKey: this.state.focusedRowKey,
      customizeText: this.customizeText,
      gridOptionChanged: this.gridOptionChanged,
      //initialFilterValue: this.state.initialFilterValue,
      //searchPanelVisible: false,
      //searchPanelPlaceHolder: "City Alias",
      onFocusedRowChanged: this.onFocusedRowChanged, /*=== For Master-Detail (in Master) ===*/
    };

    const clearCurrencyLookupValues = {currencies_id: null, currencycode: ''};
    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

    const initialCurrencyLookupValues = getLookupValues (
      clearCurrencyLookupValues, this.state.currencyLookup, 
      ['currencies_id','currencycode'], this.state.formData.currencies_id);

    const initialUserLookupValues = getLookupValues(
      clearUserLookupValues,this.state.userLookup, 
      ['AdmUsers_id','uid'], this.state.formData.ModifiedByUsers_id);

    const formObj = {
      formRef: this.state.formRef,
      formTitle: this.state.formTitle,
      visible: this.state.isPopupVisible,
      popoverVisible: this.state.isPopoverVisible,
      onHiding: this.closePopup,
      errorMsg: this.state.errorMsg,
      formData: this.state.formData,
      formOldData: this.state.formOldData,
      formMode: this.state.formMode,
      saveFormData: this.saveFormData,
      toastIsVisible: this.state.toastIsVisible,
      toastMessage: 'Please refresh the Wef data',
      onToastHiding: this.onToastHiding,
      showHint: this.state.showHint,
      showHintData: this.toggleHint,
      showHelpData: this.onHelpClick,
      formHelp: formHelp,
      clearLookup: [this.clearCurrencyLookup, this.clearUserLookup],
      getSelectedRecord: [this.getSelectedCurrency, this.getSelectedUser],
      initialLookupValues: [initialCurrencyLookupValues, initialUserLookupValues],
      clearLookupValues: [clearCurrencyLookupValues, clearUserLookupValues],
      labelLocation: "left"
    }

    /*=== Reorder by Row Drag & Drop ===*/
    const accMealProps = {
      numButtons: 1,
      buttonListObj: [
      {visible: canAdd, options: {icon: "add", onClick: this.addRow, hint: 'Add a new meal plan'}}
      ],
      height: 40
    };

    return (
      <div style={{width: '100%'}}>
        <ToolbarOptions text={"Meal Costs"} {...accMealProps} ></ToolbarOptions>
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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostAccMeal));

