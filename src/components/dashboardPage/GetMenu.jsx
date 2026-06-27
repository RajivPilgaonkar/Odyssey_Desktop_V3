
export const menuArray = 
  [ {key: 10000, group: 0, subGroup: 0, itemNo: 0, menu: 1, label: "Presto", route: ""},
    {key: 10001, group: 0, subGroup: 0, itemNo: 1, menu: 0, label: "Tours", route: "PrestoList"},
    {key: 10002, group: 0, subGroup: 0, itemNo: 2, menu: 0, label: "Riksja Tour Modules", route: "PrestoModuleList"},
    {key: 10003, group: 0, subGroup: 0, itemNo: 3, menu: 0, label: "Confirmation Status", route: "PrestoConfirmationManager"},

    {key: 10100, group: 0, subGroup: 1, itemNo: 1, menu: 1, label: "Modules", route: "ModuleQuotations"},

    {key: 10201, group: 0, subGroup: 2, itemNo: 1, menu: 1, label: "Route Finder", route: "RouteFinder"},    

    {key: 11000, group: 1, subGroup: 0, itemNo: 1, menu: 1, label: "Bookings", route: "Bookings", moduleNo: 12010},    

    {key: 12000, group: 2, subGroup: 0, itemNo: 0, menu: 1, label: "Vouchers", route: ""},    
    {key: 12001, group: 2, subGroup: 0, itemNo: 1, menu: 0, label: "Voucher Manager", route: "GenVoucher"},    
    {key: 12002, group: 2, subGroup: 0, itemNo: 2, menu: 0, label: "Voucher Listing", route: "ListVoucher"},    
    {key: 12003, group: 2, subGroup: 0, itemNo: 3, menu: 0, label: "Voucher Mail Status", route: "VoucherMailStatus"},    
    {key: 12004, group: 2, subGroup: 0, itemNo: 4, menu: 0, label: "Voucher Bills", route: "VoucherPayments"},    
    {key: 12005, group: 2, subGroup: 0, itemNo: 5, menu: 0, label: "Date Range Listing", route: "VoucherDateRangeListing"},    

    {key: 13000, group: 3, subGroup: 0, itemNo: 0, menu: 1, label: "Auto-Create Tour Invoices", route: ""},    
    {key: 13001, group: 3, subGroup: 0, itemNo: 1, menu: 0, label: "Generate Invoices", route: "Invoices", moduleNo: 12020},    
    {key: 13002, group: 3, subGroup: 0, itemNo: 2, menu: 0, label: "Invoice Exch Rate", route: "InvExchRate", moduleNo: 12020},    
    {key: 13003, group: 3, subGroup: 0, itemNo: 3, menu: 0, label: "Invoice Pymt Beneficiary", route: "InvPymtBeneficiary", moduleNo: 12020},    

    {key: 13100, group: 3, subGroup: 1, itemNo: 0, menu: 1, label: "Invoice Listing", route: ""},    
    {key: 13101, group: 3, subGroup: 1, itemNo: 1, menu: 0, label: "Invoices", route: "InvoiceListing", moduleNo: 12020},    

    {key: 14000, group: 4, subGroup: 0, itemNo: 0, menu: 1, label: "Costings", route: ""},    
    {key: 14001, group: 4, subGroup: 0, itemNo: 1, menu: 0, label: "Accommodation", route: "CostAccommodation", moduleNo: 12030},    
    {key: 14002, group: 4, subGroup: 0, itemNo: 2, menu: 0, label: "Sightseeing", route: "CostServices", moduleNo: 12030},    
    {key: 14003, group: 4, subGroup: 0, itemNo: 3, menu: 0, label: "Transfers", route: "CostTransfers", moduleNo: 12030},    
    //{key: 14004, group: 4, subGroup: 0, itemNo: 4, menu: 0, label: "Packages", route: "CostPackages", moduleNo: 12030},    

    {key: 14100, group: 4, subGroup: 1, itemNo: 0, menu: 1, label: "Ticket Costings", route: ""},    
    {key: 14101, group: 4, subGroup: 1, itemNo: 1, menu: 0, label: "Flights", route: ""},    
    {key: 14102, group: 4, subGroup: 1, itemNo: 2, menu: 0, label: "Trains", route: ""},    
    {key: 14103, group: 4, subGroup: 1, itemNo: 3, menu: 0, label: "Ferries", route: ""},    

    {key: 14200, group: 4, subGroup: 2, itemNo: 0, menu: 1, label: "Car Costings", route: "", moduleNo: 12030},    
    {key: 14201, group: 4, subGroup: 2, itemNo: 1, menu: 0, label: "Per Km", route: "CarPerKm", moduleNo: 12030},    
    {key: 14202, group: 4, subGroup: 2, itemNo: 2, menu: 0, label: "Point To Point", route: "CarP2P", moduleNo: 12030},    
    {key: 14203, group: 4, subGroup: 2, itemNo: 3, menu: 0, label: "City Groups", route: "CarCityGroups", moduleNo: 12030},    

    {key: 14300, group: 4, subGroup: 3, itemNo: 0, menu: 1, label: "General", route: ""},    
    {key: 14301, group: 4, subGroup: 3, itemNo: 1, menu: 0, label: "Reports", route: "CostReports"},    

    {key: 15003, group: 5, subGroup: 0, itemNo: 3, menu: 1, label: "Addressbook", route: "Addressbook", moduleNo: 12000},    
    {key: 15004, group: 5, subGroup: 0, itemNo: 4, menu: 1, label: "Rankings", route: "AddressbookRankings", moduleNo: 12000},    

    {key: 16000, group: 6, subGroup: 0, itemNo: 1, menu: 1, label: "Elements", route: "Elements", moduleNo: 12040},    
    {key: 16001, group: 6, subGroup: 0, itemNo: 2, menu: 1, label: "Trains to Import", route: "TrainElementSectors"},    
    {key: 16002, group: 6, subGroup: 0, itemNo: 3, menu: 1, label: "Principal Agent Networks", route: "PrincipalAgentNetworks"},    
    //{key: 16003, group: 6, subGroup: 0, itemNo: 4, menu: 1, label: "Trial", route: "PrincipalAgents"},    

    {key: 30000, group: 11, subGroup: 0, itemNo: 0, menu: 1, label: "Airlines", route: ""},    
    {key: 30001, group: 11, subGroup: 0, itemNo: 1, menu: 0, label: "Airlines", route: "Airlines", moduleNo: 11000},    
    {key: 30003, group: 11, subGroup: 0, itemNo: 3, menu: 0, label: "Aircraft Types", route: "AircraftTypes", moduleNo: 11005},    

    {key: 30100, group: 11, subGroup: 1, itemNo: 0, menu: 1, label: "Trains", route: ""},    
    {key: 30101, group: 11, subGroup: 1, itemNo: 1, menu: 0, label: "Trains", route: "Trains", moduleNo: 11010},    
    {key: 30103, group: 11, subGroup: 1, itemNo: 3, menu: 0, label: "Categories", route: "TrainCategories", moduleNo: 11015},    
    {key: 30104, group: 11, subGroup: 1, itemNo: 4, menu: 0, label: "Stations", route: "TrainStations", moduleNo: 11020},    
    {key: 30106, group: 11, subGroup: 1, itemNo: 6, menu: 0, label: "Deadline Days", route: "TrainDeadlines", moduleNo: 11025},    

    {key: 30200, group: 11, subGroup: 2, itemNo: 1, menu: 1, label: "Classes", route: "Classes", moduleNo: 11200},    


/*    
    {key: 31000, group: 7, subGroup: 0, itemNo: 0, menu: 1, label: "Charges", route: ""},    
    {key: 31001, group: 7, subGroup: 0, itemNo: 1, menu: 0, label: "Ticket", route: ""},    
    {key: 31002, group: 7, subGroup: 0, itemNo: 2, menu: 0, label: "Supplementary", route: ""},    
    {key: 31003, group: 7, subGroup: 0, itemNo: 3, menu: 0, label: "Cancellation", route: ""},    
    {key: 31004, group: 7, subGroup: 0, itemNo: 4, menu: 0, label: "Extra", route: ""},    
*/

    {key: 32000, group: 13, subGroup: 0, itemNo: 0, menu: 1, label: "Accommodation", route: ""},    
    {key: 32001, group: 13, subGroup: 0, itemNo: 1, menu: 0, label: "Room Types", route: "RoomTypes", moduleNo: 11030},    
    {key: 32002, group: 13, subGroup: 0, itemNo: 2, menu: 0, label: "Meal Plans", route: "MealPlans", moduleNo: 11035},    

    {key: 33100, group: 14, subGroup: 0, itemNo: 0, menu: 1, label: "Services", route: ""},    
    {key: 33101, group: 14, subGroup: 0, itemNo: 1, menu: 0, label: "Sightseeing", route: "Sightseeing", moduleNo: 11040}, 
    {key: 33102, group: 14, subGroup: 0, itemNo: 2, menu: 0, label: "Transfers", route: "Transfers", moduleNo: 11045}, 
    {key: 33103, group: 14, subGroup: 0, itemNo: 3, menu: 0, label: "Transfer City Pairs", route: "TransferCityPairs", moduleNo: 11050}, 

    //{key: 33200, group: 14, subGroup: 1, itemNo: 1, menu: 1, label: "Packages", route: "Packages", moduleNo: 11055},    

    {key: 34000, group: 15, subGroup: 0, itemNo: 1, menu: 1, label: "Vehicles", route: "Vehicles", moduleNo: 11060},

    {key: 34100, group: 15, subGroup: 1, itemNo: 0, menu: 1, label: "Agents", route: ""},    
    {key: 34101, group: 15, subGroup: 1, itemNo: 1, menu: 0, label: "Car Hire", route: "CarHireAgents", moduleNo: 11065},
    {key: 34102, group: 15, subGroup: 1, itemNo: 2, menu: 0, label: "Default (Per Km)", route: "CarHireDefaultPerKmAgents", moduleNo: 11070},

    {key: 34200, group: 15, subGroup: 2, itemNo: 0, menu: 1, label: "Drives", route: ""},    
    {key: 34201, group: 15, subGroup: 2, itemNo: 1, menu: 0, label: "Distances", route: "Distances", moduleNo: 11075},
    {key: 34202, group: 15, subGroup: 2, itemNo: 2, menu: 0, label: "Shortest Drive", route: "ShortestRoute", moduleNo: 11080}, 
    {key: 34203, group: 15, subGroup: 2, itemNo: 3, menu: 0, label: "DriveTypes", route: "DriveTypes", moduleNo: 11085}, 

    {key: 34300, group: 15, subGroup: 3, itemNo: 1, menu: 1, label: "City Groups", route: "CityGroups", moduleNo: 11090},

    {key: 35000, group: 16, subGroup: 0, itemNo: 1, menu: 1, label: "Cities", route: "Cities", moduleNo: 11095},    
    {key: 35001, group: 16, subGroup: 0, itemNo: 2, menu: 1, label: "States", route: "States", moduleNo: 11100},    
    {key: 35002, group: 16, subGroup: 0, itemNo: 3, menu: 1, label: "Countries", route: "Countries", moduleNo: 11105},    
    {key: 35003, group: 16, subGroup: 0, itemNo: 4, menu: 1, label: "Place of Supply", route: "PlaceOfSupply", moduleNo: 11110},    
 
    {key: 35100, group: 16, subGroup: 1, itemNo: 0, menu: 1, label: "Agents", route: ""},    
    {key: 35101, group: 16, subGroup: 1, itemNo: 1, menu: 0, label: "Consultants", route: "Consultants", moduleNo: 11115},    
    {key: 35102, group: 16, subGroup: 1, itemNo: 2, menu: 0, label: "Agent - Cancellation", route: "AgentCancellations", moduleNo: 11120},    
    {key: 35103, group: 16, subGroup: 1, itemNo: 3, menu: 0, label: "Board Captions", route: "BoardCaptions", moduleNo: 11125},    

    {key: 35200, group: 16, subGroup: 2, itemNo: 0, menu: 1, label: "Addressbook", route: ""},    
    {key: 35201, group: 16, subGroup: 2, itemNo: 1, menu: 0, label: "Categories", route: "AddressbookCategories", moduleNo: 11130},    

    {key: 35300, group: 16, subGroup: 3, itemNo: 1, menu: 1, label: "Search Tags", route: "SearchTags", moduleNo: 11135},    

    {key: 35400, group: 16, subGroup: 4, itemNo: 0, menu: 1, label: "Vouchers", route: ""},    
    {key: 35401, group: 16, subGroup: 4, itemNo: 1, menu: 0, label: "Remarks", route: "VoucherRemarks", moduleNo: 11140},    

    {key: 37000, group: 18, subGroup: 0, itemNo: 1, menu: 1, label: "Currencies", route: "Currencies", moduleNo: 11145},    
    {key: 37001, group: 18, subGroup: 0, itemNo: 2, menu: 1, label: "Exch Rates", route: "ExchRates", moduleNo: 11150},    
    {key: 37002, group: 18, subGroup: 0, itemNo: 3, menu: 1, label: "Taxes", route: "Taxes", moduleNo: 11155},    
    {key: 37003, group: 18, subGroup: 0, itemNo: 4, menu: 1, label: "Tax Rates", route: "TaxRates", moduleNo: 11160},    
    {key: 37004, group: 18, subGroup: 0, itemNo: 5, menu: 1, label: "Entry Taxes", route: "EntryTaxes", moduleNo: 11165},    
    {key: 37005, group: 18, subGroup: 0, itemNo: 6, menu: 1, label: "Margins", route: "Margins", moduleNo: 11170},    

    {key: 38000, group: 19, subGroup: 0, itemNo: 1, menu: 1, label: "Presto Exclusions", route: "PrestoExclusions", moduleNo: 11175},    

    {key: 38100, group: 19, subGroup: 1, itemNo: 0, menu: 1, label: "Train Exceptions", route: ""},    
    {key: 38101, group: 19, subGroup: 1, itemNo: 1, menu: 0, label: "Trains", route: "TicketExceptions", moduleNo: 11180},    
    {key: 38102, group: 19, subGroup: 1, itemNo: 2, menu: 0, label: "Train Classes", route: "TicketClassExceptions", moduleNo: 11185},    
    {key: 38103, group: 19, subGroup: 1, itemNo: 3, menu: 0, label: "Preferred Routes", route: "PreferredRoutes", moduleNo: 11190},    

    {key: 38200, group: 19, subGroup: 2, itemNo: 0, menu: 1, label: "Presto", route: ""},    
    {key: 38201, group: 19, subGroup: 2, itemNo: 1, menu: 0, label: "Fixed Itineraries", route: "FixedItineraries", moduleNo: 11195},    

    {key: 70000, group: 20, subGroup: 0, itemNo: 1, menu: 1, label: "Users", route: "AdmUsers", moduleNo: 11205},    
    {key: 70001, group: 20, subGroup: 0, itemNo: 2, menu: 1, label: "Modules", route: "AdmMenuModules", moduleNo: 11210},    
    {key: 70002, group: 20, subGroup: 0, itemNo: 3, menu: 1, label: "Change Password", route: "ChangePassword", moduleNo: 11220},    
    //{key: 70003, group: 20, subGroup: 0, itemNo: 4, menu: 1, label: "Module Quotations (Old)", route: "ModuleList", moduleNo: 11230},    

    {key: 71000, group: 21, subGroup: 0, itemNo: 1, menu: 1, label: "Utilities", route: "Utilities", moduleNo: 11215},    

  ];

  export const cardArray = 
  [ {key: 0, group: 0, itemNo: 0, label: "Tour Mgmt", done: 1},
    {key: 1, group: 0, itemNo: 1, label: "Bookings", done: 1},
    {key: 2, group: 0, itemNo: 2, label: "Vouchers", done: 1},
    {key: 3, group: 0, itemNo: 3, label: "Invoices", done: 1},
    {key: 4, group: 0, itemNo: 4, label: "Costings", done: 1},
    {key: 5, group: 0, itemNo: 5, label: "Addressbook", done: 1},
    {key: 6, group: 0, itemNo: 6, label: "Elements", done: 1},

    {key: 11, group: 1, itemNo: 0, label: "Tickets", done: 1},
    /*{key: 12, group: 1, itemNo: 0, label: "Charges", done: 0},*/
    {key: 13, group: 1, itemNo: 1, label: "Accommodation", done: 1},
    {key: 14, group: 1, itemNo: 2, label: "Services", done: 1},
    {key: 15, group: 1, itemNo: 3, label: "Cars", done: 1},
    {key: 16, group: 1, itemNo: 4, label: "General", done: 1},
    /*{key: 17, group: 1, itemNo: 5, label: "Web", done: 0},*/
    {key: 18, group: 1, itemNo: 6, label: "Finance", done: 1},
    {key: 19, group: 1, itemNo: 7, label: "Tours", done: 1},

    {key: 20, group: 2, itemNo: 0, label: "Admin", done: 1},
    {key: 21, group: 2, itemNo: 1, label: "Utilities", done: 1}
  ];

