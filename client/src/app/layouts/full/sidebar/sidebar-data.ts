import { NavService } from 'src/app/_services/nav.service';
import { NavItem } from './nav-item/nav-item';

const dataClient = localStorage.getItem('clientLoginStorage');
const client = dataClient ? JSON.parse(dataClient) : null;

const dataEmployee = localStorage.getItem('employeeLoginStorage');
const employee = dataEmployee ? JSON.parse(dataEmployee) : null;

const role = employee?.role;
const position = employee?.position;

let isOwnerLoggedIn = false;
let isDeveloperLoggedIn = false;
let isAdminwithPermissionLoggedIn = false;
let isAdminLoggedIn = false;
let isNormalAdminLoggedIn = false;
let isDriverLoggedIn = false;

if ((position === "Cashier" || position === "HeadCashier") && role === "Employee") {
  isAdminLoggedIn = true;
}

else if (position == "owner" && role == "Employee") {
  isOwnerLoggedIn = true
}

else if (position == "Developer" && role == "Employee") {
  isDeveloperLoggedIn = true
}

else if (position == "HeadCashier" && role == "Employee") {
  isAdminwithPermissionLoggedIn = true
}

else if (position == "Cashier" && role == "Employee") {
  isNormalAdminLoggedIn = true
}


else if (position == "Driver" && role == "Employee") {
  isDriverLoggedIn = true
}

// Base items visible to all
const commonItems: NavItem[] = [
  {
    displayName: 'MENU2',
    iconName: 'table',
    route: '/menuview',
    bgcolor: 'success',

  }
];

const driverItems: NavItem[] = [
  { navCap: 'Driver Panel' },
  {
    displayName: 'ORDERS FOR DELIVERY',
    iconName: 'table',
    route: '/ui-components/OrdersForDeliveryList',
    bgcolor: 'success',

  }
];

// Admin-only items
const ownerItems: NavItem[] = [
  { navCap: 'Owner Panel' },
  {
    displayName: 'EMPLOYEES',
    iconName: 'table',
    route: '/ui-components/employeelist',
    bgcolor: 'success',

  } ,

   {
    displayName: 'PROFIT',
    iconName: 'table',
    route: '/ui-components/profit',
    bgcolor: 'success',

  } ,

  {
    displayName: 'TABLES2',
    iconName: 'table',
    route: '/ui-components/tableList',
    bgcolor: 'success',

  }
];

// Admin-only items
const adminItems: NavItem[] = [
  { navCap: 'Admin Panel' },
  {
    displayName: 'BRANCHES2',
    iconName: 'table',
    route: '/ui-components/branchlist',
    bgcolor: 'success',

  },
  {
    displayName: 'CLIENTS2',
    iconName: 'table',
    route: '/ui-components/clientlist',
    bgcolor: 'success',

  },
  {
    displayName: 'ORDERS2',
    iconName: 'table',
    route: '/ui-components/orderlist',
    bgcolor: 'success',

  }
  ,
  {
    displayName: 'ORDERS_FOR_DELIVERY',
    iconName: 'table',
    route: '/ui-components/OrdersForDeliveryList',
    bgcolor: 'success',

  }

  // {
  //   displayName: 'Dashboard',
  //   iconName: 'layout-grid-add',
  //   route: '/dashboard',
  //   bgcolor: 'primary',
  // },
  // {
  //   navCap: 'Apps',
  // },

  // {
  //   navCap: 'Ui Components',
  // },
  // {
  //   displayName: 'Badge',
  //   iconName: 'archive',
  //   route: '/ui-components/badge',
  //   bgcolor: 'warning',
  // },
  // {
  //   displayName: 'Chips',
  //   iconName: 'info-circle',
  //   route: '/ui-components/chips',
  //   bgcolor: 'success',
  // },
  // {
  //   displayName: 'Lists',
  //   iconName: 'list-details',
  //   route: '/ui-components/lists',
  //   bgcolor: 'error',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'file-text',
  //   route: '/ui-components/menu',
  //   bgcolor: 'primary',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'file-text-ai',
  //   route: '/ui-components/tooltips',
  //   bgcolor: 'secondary',
  // },
  // {
  //   displayName: 'Forms',
  //   iconName: 'clipboard-text',
  //   route: '/ui-components/forms',
  //   bgcolor: 'warning',
  // },
  // {
  //   displayName: 'Tables',
  //   iconName: 'table',
  //   route: '/ui-components/tables',
  //   bgcolor: 'success',
  // },

  // {
  //   navCap: 'Extra',
  // },
  // {
  //   displayName: 'Icons',
  //   iconName: 'mood-smile',
  //   route: '/extra/icons',
  //   bgcolor: 'error',
  // },
  // {
  //   displayName: 'Sample Page',
  //   iconName: 'brand-dribbble',
  //   route: '/extra/sample-page',
  //   bgcolor: 'primary',
  // }

];

// Client-only items
const clientItems: NavItem[] = [
  { navCap: 'Client Panel' },
  {
    displayName: 'Orders',
    iconName: 'table',
    route: '/ui-components/orderlist',
    bgcolor: 'success',

  }
];

// Build dynamic nav
let dynamicNavItems: NavItem[] = [];
if (isOwnerLoggedIn || isDeveloperLoggedIn) {
  dynamicNavItems.push({ navCap: `Welcome, ${employee?.name || null}` });
  dynamicNavItems = [...dynamicNavItems, ...adminItems, ...ownerItems];
}
// Add user-specific items at the top
else if (isAdminLoggedIn) {

  dynamicNavItems.push({ navCap: `Welcome, ${employee?.name || null}` });
  dynamicNavItems = [...dynamicNavItems, ...adminItems];
}
else if (client) {

  dynamicNavItems.push({ navCap: `Welcome, ${client?.name || 'Client'}` });
  dynamicNavItems = [...dynamicNavItems, ...clientItems];
}

else if(isDriverLoggedIn)
{
  
  dynamicNavItems.push({ navCap: `Welcome, ${employee?.name || 'employee'}` });
  dynamicNavItems = [...dynamicNavItems, ...driverItems];
}
else {
  dynamicNavItems.push({ navCap: `Welcome` });
  dynamicNavItems = [
    {
      displayName: 'LOGIN2',
      iconName: 'login',
      bgcolor: 'secondary',
      route: '/authentication/loginClient'
    },
    {
      displayName: 'REGISTER2',
      iconName: 'user-plus',
      bgcolor: 'warning',
      route: '/authentication/clientRegister'
    }
  ];
}

// Export the final nav
export const navItems: NavItem[] = [...dynamicNavItems, ...commonItems];