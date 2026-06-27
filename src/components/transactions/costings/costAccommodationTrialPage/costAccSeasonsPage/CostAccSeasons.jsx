import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from '../../../../common/withRouterCompat';
import Skeleton from '@mui/material/Skeleton';
import { HEADER_HEIGHT } from '../../../../../config/paths';
import { dbGetRecord, dbDeleteRecord, dbExecuteSp, setParamValues } from '../../../../../actions';
import { beforeInsert, saveEditedInsertedData, checkNullErrors, getLookupValues, getFieldsArray, getReorderedList, saveReordedListToDB } from "../../../../common/CommonTransactionFunctions";
import { canDelete } from "../../../../common/CommonFunctions";
import { popupTitle } from "../../../../common/HelperComponents";
import {popupTitleContainerStyle} from "../../../../common/ComponentStyles";
import {getHotelFromSeason} from "../../../../common/GetDescFromIds";
import { getDevExtremeTable, getDevExtremePopupForm, tableHeaderArray } from "./GetAccSeasonsData";
import ToolbarOptions from "../../../../common/ToolbarOptions";
import { formHelp } from './Help';
import CopyCostings from '../../copyCostingsPage/CopyCostings';


// some of the devextreme css properties are overridden
import '../../../../common/MasterDataGrid.css';

import moment from 'moment';

class CostAccSeasons extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = { isDataFetched: null, dataGridRef: React.createRef(), 
      mainData: [], clonedMainData: [], tableName: 'seasons', keyField: 'seasons_id',
      /*=== For Master-Detail (in Details) ===*/
      seasons_id: (this.props.seasons_id !== undefined) ? this.props.seasons_id : -1,
      addressbook_id: -1, 
      userLookup: [],
      isPopupVisible: false, errorMsg: '',
      formData: {}, formOldData: {}, formTitle: 'ABC', formMode: -1,
      toastIsVisible: false, deleteDialogBoxOpen: false, deleteRecord: false,
      deleteRecordId: -1, showHint: false, isPopoverVisible: false,
      focusedRowKey: -1, initialFilterValue: -1,
      rowDragging: false, copyCostingPopup: false
    };

  }

  //**********************************************************/
  componentDidMount() {
    this._isMounted = true;

    this.fetchInitialData();

  }

  //**********************************************************/
  fetchInitialData = async() => {

    await this.setState({userLookup: await dbGetRecord({fields: ['AdmUsers_id', 'uid'], orders: ['uid'], table: 'admUsers'}) });   

    await this.filterData();

    if (this._isMounted) {
      await this.setState({isDataFetched: true});   
      if (this.props.onCostAccSeasonsLoad !== undefined) {
        this.props.onCostAccSeasonsLoad();
      }
    }

  }
 
  //**********************************************************/
  componentWillUnmount() {
    this._isMounted = false;
  }

  //**********************************************************/
  componentDidUpdate = async (prevProps, prevState) => {
    // when seasons change, get filtered data for that season again
    if ((this.props.seasons_id !== prevProps.seasons_id) || (this.state.seasons_id !== prevState.seasons_id)) {

      let addressbook_id = this.state.addressbook_id;
      let whereStr = 'seasons_id = ' + ((this.props.seasons_id !== undefined) ? this.props.seasons_id : -1);
      const addressbookArray = await dbGetRecord({fields: ['addressbook_id'], table: 'seasons', where: whereStr });

      if (addressbookArray.length > 0) {
        addressbook_id = addressbookArray[0].addressbook_id;
      }

      await this.setState({seasons_id: this.props.seasons_id, addressbook_id: addressbook_id})
      await this.filterData();      
    }
  }  

  //**********************************************************/
  filterData = async () => {
    const fieldArray = getFieldsArray(tableHeaderArray);

    // Add calculated field
    fieldArray.push("CASE WHEN COALESCE(git,0) = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS fit");
    fieldArray.push("RTRIM(LTRIM(CAST(CAST(fromPax AS INT) AS VARCHAR(2)))) + ' to ' + LTRIM(RTRIM(CAST(CAST(to_pax AS INT) AS VARCHAR(2)))) AS NumPax");

    const whereStr = 'seasons_id = ' + this.state.seasons_id;
    await this.setState({mainData: await dbGetRecord({fields: fieldArray, orders: ['seasons_id'], table: this.state.tableName, where: whereStr}) });   

  }

  //**********************************************************/
  editRow = async (e) => {

    let obj = this.state.mainData.find(o => o[this.state.keyField] === e.row.data[this.state.keyField]);
    const hotelObj = await getHotelFromSeason(this.state.seasons_id);

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
      {table: 'hoteltariffsindia', condition: 'WHERE seasons_id = ' + e.row.data.seasons_id, existsIn: 'Room Tariffs. Delete the room tariffs first'},
      {table: 'mealcostsindia', condition: 'WHERE seasons_id = ' + e.row.data.seasons_id, existsIn: 'Meal Costs. Delete the meal costs first'},
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

    // next order number
    defaultObj = {...defaultObj, seasons_id: this.state.seasons_id, addressbook_id: this.state.addressbook_id};

    // get hotel info
    const hotelObj = await getHotelFromSeason(this.state.seasons_id);

    await this.setState({formData: {...defaultObj}, formMode: 1, errorMsg: '', formTitle: 'New season for ' + hotelObj.orgCity});

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
    
    // override git based on fit 
    let tmpFormData = {...this.state.formData, git: !this.state.formData.fit};
        
    // check duplicate
    let condition = "WHERE addressbook_id = " + this.state.formData.addressbook_id + " " + 
      "AND fromdate = '" + moment(this.state.formData.fromdate).format('MM/DD/YYYY') + "' ";
    condition += (this.state.formMode === 2) ? "AND seasons_id <> " + this.state.formData.seasons_id: "";
    
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

      // callback will change props and relaod parant and child forms with new seasons_id
      // also pass wef as this will be used to reload the wef dropdown in params 
      if (this.props.onCostAccSeasonChange !== undefined) {
        this.props.onCostAccSeasonChange({seasons_id: saveData.formData.seasons_id, wef: saveData.formData.fromdate});
      }

      // set seasons_id for the new row created
      //await this.setState({seasons_id: saveData.formData.seasons_id });

      // when focusedRowKey is set > 0, the focus shifts to that row
      //await this.setState({focusedRowKey: saveData.formData[this.state.keyField] });
      // if not reset, it would remain on that row for any other render function
      //await this.setState({focusedRowKey: -1 });      
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
    if (!formData.addressbook_id || formData.addressbook_id <= 0) {
      return '"Hotel has to be selected"';
    }

    // form validation errors
    if (formData.frompax > formData.to_pax) {
      return '"From Pax" cannot exceed "To Pax"';
    }

    // form validation errors
    if (formData.todate !== null) {
      let wef = moment(formData.fromdate);
      let wet = moment(formData.todate);
      if (wef > wet) {
        return '"Wef" cannot exceed "Wet"';
      }
    }


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
  getSelectedUser = async(e) => {
    this.setState({formData: {...this.state.formData, ModifiedByUsers_id: e[0].AdmUsers_id}})
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
    await this.setState({seasons_id: e.row.data.seasons_id});
    if (this.props.onChangeSeason !== undefined) {
      await this.props.onChangeSeason(e);
    }
  }
  
  //**********************************************************/
  onRowClick = async (e) => {
    //this.setState({ContactCategories_id: e.data.ContactCategories_id});
  }  

  //**********************************************************/
  copyData = async () => {

    const hotelObj = await getHotelFromSeason(this.state.seasons_id);
    const fromDate = moment(hotelObj.wef).format('DD/MM/YYYY');
    const toDate = moment(hotelObj.wef).add(1, 'y').format('DD/MM/YYYY');

    // Save to the REDUX store
    // set as parameters for forms called from this form
    // These will appear in the store in Copy Data
    await this.props.setParamValues_action({
      costService: hotelObj.orgCity,
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

    if (!this.state.isDataFetched) {
      return (
        <div style={pageContainerStyle}>
          <Skeleton variant="rectangular" animation="wave" height={pageContainerStyle.height} />
        </div>
      )
    }

    /*=== can add only if a proper master key (ContactCategories_id) is sent through props ===*/
    //const canAdd = (this.state.mainData.length === 0) ? true : false;
    const canAdd = (this.state.addressbook_id > 0) ? true : false;
    //const canAdd = true;

    /*=== For Master-Detail (in Details) filter the details data based on the master key ===*/
    //gridData = gridData.filter(rec => rec.ContactCategories_id === this.props.ContactCategories_id);

    const dataObj = {
      data: this.state.mainData,
      keyExpr: this.state.keyField,
      gridRef: this.state.dataGridRef,
      gridHeight: 72,
      dbLookup: [

        {keyField: 'AdmUsers_id', dataSource: this.state.userLookup, 
        displayExpr: 'uid', valueExpr: 'AdmUsers_id', fieldList: ['uid']}

      ],
      addRow: this.addRow,
      editRow: this.editRow,
      deleteRow: this.deleteRow,
      canAddRow: false,
      addRowText: 'Add a Season',
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

    const clearUserLookupValues = {AdmUsers_id: null, uid: ''};

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
      clearLookup: [this.clearUserLookup],
      getSelectedRecord: [this.getSelectedUser],
      initialLookupValues: [initialUserLookupValues],
      clearLookupValues: [clearUserLookupValues],
      labelLocation: "left"
    }

    const canCopy = (this.state.seasons_id > 0 && this.state.mainData.length > 0) ? true : false;

    /*=== Reorder by Row Drag & Drop ===*/
    const accSeasonsProps = {
      numButtons: 1,
      buttonListObj: [
        {visible: canAdd, options: {icon: "add", onClick: this.addRow, hint: 'Add a new season'}},
        {visible: canCopy, options: {icon: "copy", onClick: this.copyData, hint: 'Copy Costing to next FY'}},
      ],
      height: 40
    };

    const copyCostings = {
      id: this.state.seasons_id, open: this.state.copyCostingPopup,
      serviceType: 1,
      getSelectedCopyCostingOption: this.getSelectedCopyCostingOption
    }

    return (
      <div style={{width: '100%', height: '100%'}}>
        {(this.state.seasons_id > 0) &&
          <ToolbarOptions text={"Seasons"} {...accSeasonsProps} ></ToolbarOptions>
        }
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

export default connect(mapStateToProps,mapDispatchToProps)(withRouter(CostAccSeasons));

