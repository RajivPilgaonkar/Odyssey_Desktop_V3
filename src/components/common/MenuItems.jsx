export const  menuNavItems = [ 
  { pageName: 'CarPerKmPage', 
    menuItems: [{
      id: '1', name: 'Go to', items: [
          {id: '1_1', name: 'Reports', route: ''}, 
          {id: '1_2', name: 'Car Hire Agents', route: '/CarHireAgents'},
      ],
    }],
    displayExpr: 'name'},

    { pageName: 'CarP2pPage', 
    menuItems: [{
      id: '2', name: 'Go to', items: [
          {id: '2_1', name: 'Reports', route: ''}, 
          {id: '2_2', name: 'Car Hire Agents', route: '/CarHireAgents'},
      ],
    }],
    displayExpr: 'name'},

    { pageName: 'CarCityGroupsPage', 
    menuItems: [{
      id: '3', name: 'Go to', items: [
          {id: '3_1', name: 'Reports', route: ''}, 
          {id: '3_2', name: 'Car Hire Agents', route: '/CarHireAgents'},
      ],
    }],
    displayExpr: 'name'},

    { pageName: 'CostAccommodationPage', 
    menuItems: [{
      id: '4', name: 'Go to', items: [
          {id: '4_1', name: 'Reports', route: '/CostReports'}, 
          {id: '4_2', name: 'Room Types', route: '/RoomTypes'},
      ],
    }],
    displayExpr: 'name'},

    { pageName: 'CostSightseeingPage', 
    menuItems: [{
      id: '5', name: 'Options', items: [
          {id: '5_1', name: 'Copy Cost to Next FY', route: ''}, 
          {id: '5_2', name: 'Sightseeing', route: '/Sightseeing'},
      ],
    }],
    displayExpr: 'name'},

    { pageName: 'CostTransferPage', 
    menuItems: [{
      id: '5', name: 'Options', items: [
          {id: '5_1', name: 'Copy Cost to Next FY', route: ''}, 
          {id: '5_2', name: 'Transfers', route: '/Transfers'},
      ],
    }],
    displayExpr: 'name'},
    
    { pageName: 'GenInvoicePage', 
    menuItems: [{
      id: '6', name: 'Options', items: [
          {id: '6_1', name: 'Invoice Listing', route: '/ListInvoice'}, 
          {id: '6_2', name: 'Invoice Exch Rate Master', route: '/InvExchRate'}, 
          {id: '6_3', name: 'Invoice Pymt Beneficiaries', route: '/InvPymtBeneficiary'}, 
      ],
    }],
    displayExpr: 'name'},

    { pageName: 'GenVoucherPage', 
    menuItems: [{
      id: '7', name: 'Options', items: [
          {id: '7_1', name: 'Voucher Selection', route: '/VoucherSelection'}, 
          {id: '7_2', name: 'Voucher Listing', route: '/ListVoucher'}, 
          {id: '7_4', name: 'Email Vouchers', route: '/VoucherMailing'}, 
      ],
    }],
    displayExpr: 'name'},
    
  ];
