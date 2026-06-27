import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WebFont from 'webfontloader';
//import { Offline, Online } from "react-detect-offline";

import LandingPage from './landingPage/LandingPage';
import DashboardPage from './dashboardPage/DashboardPage';
import CurrenciesPage from './masters/currenciesPage/CurrenciesPage';
import RoomTypesPage from './masters/roomTypesPage/RoomTypesPage';
import MealPlansPage from './masters/mealPlansPage/MealPlansPage';
import TicketExceptionsPage from './masters/ticketExceptionsPage/TicketExceptionsPage';
import TicketClassExceptionsPage from './masters/ticketClassExceptionsPage/TicketClassExceptionsPage';
import PreferredRoutesPage from './masters/preferredRoutesPage/PreferredRoutesPage';
import PrestoExclusionsPage from './masters/prestoExclusionsPage/PrestoExclusionsPage';
import ExchRatesPage from './masters/exchRatesPage/ExchRatesPage';
import InvExchRatePage from './masters/invExchRatesPage/InvExchRatePage';
import TaxesPage from './masters/taxesPage/TaxesPage';
import TaxRatesPage from './masters/taxRatesPage/TaxRatesPage';
import EntryTaxesPage from './masters/entryTaxesPage/EntryTaxesPage';
import MarginsPage from './masters/marginsPage/MarginsPage';
import BoardCaptionsPage from './masters/boardCaptionsPage/BoardCaptionsPage';
import AddressbookCategoriesPage from './masters/addressbookCategoriesPage/AddressbookCategoriesPage';
import SearchTagsPage from './masters/searchTagsPage/SearchTagsPage';
import AgentCancellationsPage from './masters/agentCancellationsPage/AgentCancellationsPage';
import ConsultantsPage from './masters/consultantsPage/ConsultantsPage';
import CountriesPage from './masters/countriesPage/CountriesPage';
import StatesPage from './masters/statesPage/StatesPage';
import CitiesPage from './masters/citiesPage/CitiesPage';
import PlaceOfSupplyPage from './masters/placeOfSupplyPage/PlaceOfSupplyPage';
import VehiclesPage from './masters/vehiclesPage/VehiclesPage';
import CarHireAgentsPage from './masters/carHireAgentsPage/CarHireAgentsPage';
import CarHireDefaultPerKmAgentsPage from './masters/carHireDefaultPerKmAgentsPage/CarHireDefaultPerKmAgentsPage';
import DistancesPage from './masters/distancesPage/DistancesPage';
import ShortestRoutePage from './masters/shortestRoutePage/ShortestRoutePage';
import CityGroupsPage from './masters/cityGroupsPage/CityGroupsPage';
import SightseeingPage from './masters/sightseeingPage/SightseeingPage';
import TransfersPage from './masters/transfersPage/TransfersPage';
import TransferCityPairsPage from './masters/transferCityPairsPage/TransferCityPairsPage';
import AirlinesPage from './masters/airlinesPage/AirlinesPage';
import ClassesPage from './masters/classesPage/ClassesPage';
import AircraftTypesPage from './masters/aircraftTypesPage/AircraftTypesPage';
import TrainCategoriesPage from './masters/trainCategoriesPage/TrainCategoriesPage';
import TrainDeadlinesPage from './masters/trainDeadlinesPage/TrainDeadlinesPage';
import TrainStationsPage from './masters/trainStationsPage/TrainStationsPage';
import FixedItinerariesPage from './masters/fixedItinerariesPage/FixedItinerariesPage';
import TrainsPage from './masters/trainsPage/TrainsPage';
import BookingsPage from './masters/bookingsPage/BookingsPage';
import DriveTypesPage from './masters/driveTypesPage/DriveTypesPage';
import CarPerKmPage from './transactions/costings/carPerKmPage/CarPerKmPage';
import CarP2pPage from './transactions/costings/carP2pPage/CarP2pPage';
import CarCityGroupsPage from './transactions/costings/carCityGroupsPage/CarCityGroupsPage';
import AddressbookPage from './masters/addressbookPage/AddressbookPage';
import AddressbookRankingsPage from './masters/addressbookRankingsPage/AddressbookRankingsPage';
import CostAccommodationPage from './transactions/costings/costAccommodationPage/CostAccommodationPage';
import CostServicesPage from './transactions/costings/costServicesPage/CostServicesPage';
import CopyCostings from './transactions/costings/copyCostingsPage/CopyCostings';
import CostReportsPage from './transactions/costings/costReportsPage/CostReportsPage';
import InvoicePage from './transactions/invoices/invoicesPage/InvoicesPage';
import InvoiceListingPage from './transactions/invoices/listInvoicesPage/InvoiceListingPage';
import InvPymtBeneficiaryPage from './masters/invPymtBeneficiaryPage/InvPymtBeneficiaryPage';
import GenVoucherPage from './transactions/vouchers/generateVouchersPage/GenVoucherPage';
import ListVoucherPage from './transactions/vouchers/listVouchersPage/ListVoucherPage';
import VoucherSelectionPage from './transactions/vouchers/voucherSelectionPage/VoucherSelectionPage';
import VoucherMailingPage from './transactions/vouchers/voucherMailingPage/VoucherMailingPage';
import VoucherMailStatusPage from './transactions/vouchers/voucherMailStatusPage/VoucherMailStatusPage';
import ElementPage from './transactions/elements/elementsPage/ElementsPage';
import TrainElementSectorsPage from './masters/trainElementSectorsPage/TrainElementSectorsPage';
import PrincipalAgentNetworksPage from './masters/principalAgentNetworksPage/PrincipalAgentsPage';
import RouteFinderPage from './transactions/routeFinder/routeFinderPage/RouteFinderPage';
import ModulesPage from './transactions/presto/prestoModulesPage/moduleListPage/ModulesPage';
import PrestoListPage from './transactions/presto/prestoListPage/PrestoListPage';
import PrestoModuleListPage from './transactions/presto/prestoModuleListPage/PrestoModuleListPage';
import PrestoConfirmationManagerPage from './transactions/presto/prestoConfirmationManagerPage/PrestoConfirmationManagerPage';
import VoucherRemarksPage from './masters/voucherRemarksPage/VoucherRemarksPage';
import VoucherPaymentsPage from './transactions/vouchers/voucherPaymentsPage/VoucherPaymentsPage';
import VoucherDateRangeListingPage from './transactions/vouchers/voucherDateWiseListPage/VoucherDateWiseListingPage';
import AdmUsersPage from './masters/admUsersPage/AdmUsersPage';
import AdmMenuModulesPage from './masters/admMenuModulesPage/AdmMenuModulesPage';
import AdmUserPermissionsPage from './masters/admUserPermissionsPage/AdmUserPermissionsPage';
import UtilitiesPage from './masters/utilitiesPage/UtilitiesPage';
import ChangePasswordPage from './masters/changePasswordPage/ChangePasswordPage';

//import { pageStyle} from '../config/paths';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    // load googe font
    WebFont.load({
      google: {
        families: ['Lato']
      }
    });

  }

  // this executes only once, the first time that the app loads
  componentDidMount() {   
  }

  defaultWebPage = () => {
    return (<Route path={"/"} element={<LandingPage/>} />);
  }

  render () {

/*    
    const offlineStyle = {
      height: 40,
      width: '100%',
      backgroundColor: 'red',
      color: '#FFFFFF',
      fontWeight: '600',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    };
*/    

    return (
      <div>
{/*        <Online> */}
        <BrowserRouter>
          <div>
            <Routes>
              <Route path="/Landing" element={<LandingPage/>} />
              <Route path="/Currencies" element={<CurrenciesPage/>} />
              <Route path="/RoomTypes" element={<RoomTypesPage/>} />
              <Route path="/MealPlans" element={<MealPlansPage/>} />
              <Route path="/PrestoExclusions" element={<PrestoExclusionsPage/>} />
              <Route path="/TicketExceptions" element={<TicketExceptionsPage/>} />
              <Route path="/TicketClassExceptions" element={<TicketClassExceptionsPage/>}/>
              <Route path="/PreferredRoutes" element={<PreferredRoutesPage/>}/>
              <Route path="/ExchRates" element={<ExchRatesPage/>}/>
              <Route path="/Taxes" element={<TaxesPage/>}/>
              <Route path="/TaxRates" element={<TaxRatesPage/>}/>
              <Route path="/EntryTaxes" element={<EntryTaxesPage/>}/>
              <Route path="/Margins" element={<MarginsPage/>}/>
              <Route path="/BoardCaptions" element={<BoardCaptionsPage/>}/>
              <Route path="/AddressbookCategories" element={<AddressbookCategoriesPage/>}/>
              <Route path="/SearchTags" element={<SearchTagsPage/>}/>
              <Route path="/AgentCancellations" element={<AgentCancellationsPage/>}/>
              <Route path="/Consultants" element={<ConsultantsPage/>}/>
              <Route path="/Countries" element={<CountriesPage/>}/>
              <Route path="/States" element={<StatesPage/>}/>
              <Route path="/Cities" element={<CitiesPage/>}/>
              <Route path="/PlaceOfSupply" element={<PlaceOfSupplyPage/>}/>
              <Route path="/Vehicles" element={<VehiclesPage/>}/>
              <Route path="/CarHireAgents" element={<CarHireAgentsPage/>}/>
              <Route path="/CarHireDefaultPerKmAgents" element={<CarHireDefaultPerKmAgentsPage/>}/>
              <Route path="/Distances" element={<DistancesPage/>}/>
              <Route path="/ShortestRoute" element={<ShortestRoutePage/>}/>
              <Route path="/CityGroups" element={<CityGroupsPage/>}/>
              <Route path="/Sightseeing" element={<SightseeingPage/>}/>
              <Route path="/Transfers" element={<TransfersPage/>}/>
              <Route path="/TransferCityPairs" element={<TransferCityPairsPage/>}/>
              <Route path="/Airlines" element={<AirlinesPage/>}/>
              <Route path="/Classes" element={<ClassesPage/>}/>
              <Route path="/AircraftTypes" element={<AircraftTypesPage/>}/>
              <Route path="/TrainCategories" element={<TrainCategoriesPage/>}/>
              <Route path="/TrainDeadlines" element={<TrainDeadlinesPage/>}/>
              <Route path="/TrainStations" element={<TrainStationsPage/>}/>
              <Route path="/FixedItineraries" element={<FixedItinerariesPage/>}/>
              <Route path="/Trains" element={<TrainsPage/>}/>
              <Route path="/Bookings" element={<BookingsPage/>}/>
              <Route path="/Dashboard" element={<DashboardPage/>} />
              <Route path="/CarPerKm" element={<CarPerKmPage/>} />
              <Route path="/CarP2P" element={<CarP2pPage/>} />
              <Route path="/CarCityGroups" element={<CarCityGroupsPage/>} />
              <Route path="/DriveTypes" element={<DriveTypesPage/>} />
              <Route path="/Addressbook" element={<AddressbookPage/>} />
              <Route path="/AddressbookRankings" element={<AddressbookRankingsPage/>} />
              <Route path="/CostAccommodation" element={<CostAccommodationPage/>} />
              <Route path="/CostServices" element={<CostServicesPage transfer={false}/>} />
              <Route path="/CostTransfers" element={<CostServicesPage transfer={true}/>} />
              <Route path="/CopyCostings" element={<CopyCostings/>} />              
              <Route path="/CostReports" element={<CostReportsPage/>} />
              <Route path="/Invoices" element={<InvoicePage/>} />
              <Route path="/InvoiceListing" element={<InvoiceListingPage/>} />              
              <Route path="/InvExchRate" element={<InvExchRatePage/>} />
              <Route path="/InvPymtBeneficiary" element={<InvPymtBeneficiaryPage/>} />
              <Route path="/GenVoucher" element={<GenVoucherPage/>} />
              <Route path="/ListVoucher" element={<ListVoucherPage/>} />
              <Route path="/VoucherSelection" element={<VoucherSelectionPage/>} />
              <Route path="/VoucherMailing" element={<VoucherMailingPage/>} />
              <Route path="/VoucherMailStatus" element={<VoucherMailStatusPage/>} />
              <Route path="/AdmUserPermissions" element={<AdmUserPermissionsPage/>} />
              <Route path="/ChangePassword" element={<ChangePasswordPage/>} />
              
              <Route path="/Elements" element={<ElementPage/>} />
              <Route path="/TrainElementSectors" element={<TrainElementSectorsPage/>} />
              <Route path="/PrincipalAgentNetworks" element={<PrincipalAgentNetworksPage/>} />
              <Route path="/RouteFinder" element={<RouteFinderPage/>} />
              <Route path="/ModuleQuotations" element={<ModulesPage/>} />              
              <Route path="/PrestoList" element={<PrestoListPage/>} />              
              <Route path="/PrestoModuleList" element={<PrestoModuleListPage/>} />              
              <Route path="/PrestoConfirmationManager" element={<PrestoConfirmationManagerPage/>} />                            
              <Route path="/VoucherRemarks" element={<VoucherRemarksPage/>} />                            
              <Route path="/VoucherPayments" element={<VoucherPaymentsPage/>} />                                          
              <Route path="/VoucherDateRangeListing" element={<VoucherDateRangeListingPage/>} />                                          
              <Route path="/AdmUsers"  element={<AdmUsersPage/>} />
              <Route path="/AdmMenuModules"  element={<AdmMenuModulesPage/>} />
              <Route path="/Utilities"  element={<UtilitiesPage/>} />
              
              {this.defaultWebPage()}
            </Routes>
          </div>
        </BrowserRouter>
{/*        </Online> */}
{/*        
        <Offline>
          <div style={pageStyle}>
            <div style={offlineStyle} > You are offline </div>
          </div>
        </Offline>
*/}        
      </div>
    );
  }
};

export default connect() (App);

/*
<Route
  path="/"
  component={props => <MyComponent {...props} foo="lol" />}
*/