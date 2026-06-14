import { Routes } from '@angular/router';
import { AppBadgeComponent } from './badge/badge.component';
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { AppFormsComponent } from './forms/forms.component';
import { EdititemComponent } from './edititem/edititem';
import { RegisteritemComponent } from './registeritem/registeritem';

import { Edituser } from './edituser/edituser';
import { Branchlist } from './branchlist/branchlist';
import { Branchedit } from './branchedit/branchedit';
import { Branchregister } from './branchregister/branchregister';
import { Clientlist } from './clientlist/clientlist';
import { Employeelist } from './employeelist/employeelist';
import { Employeedataedit } from 'src/app/pages/ui-components/employeedataedit/employeedataedit';
import { Orderlist } from './orderlist/orderlist';
import { OrdersForDeliveryList } from './orders-for-delivery-list/orders-for-delivery-list';
import { EditTable } from 'src/app/pages/ui-components/edit-table/edit-table';
import { TableRegister } from 'src/app/pages/ui-components/table-register/table-register';
import { TableList } from 'src/app/pages/ui-components/table-list/table-list';
import { ReceiptPrint } from 'src/app/pages/ui-components/receipt-print/receipt-print';
import { AppProfitExpensesComponent } from 'src/app/components/profit-expenses/profit-expenses.component';
import { Profit } from './profit/profit';
import { Myhome } from './myhome/myhome';


export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'badge',
        component: AppBadgeComponent,
      },
      {
        path: 'chips',
        component: AppChipsComponent,
      },
      {
        path: 'lists',
        component: AppListsComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      {
        path: 'forms',
        component: AppFormsComponent,
      },

      {
        path: 'receipt',
        component: ReceiptPrint,
      },
      {
        path: 'profit',
        component: Profit,
      },

      { path: 'edititem/:id/:branchID', component: EdititemComponent },
      { path: 'edituser/:id/:role', component: Edituser },
      { path: 'editdataemployee/:id', component: Employeedataedit },
      { path: 'editbranch/:id', component: Branchedit },
      { path: 'editTable/:id', component: EditTable },
      { path: 'register-item', component: RegisteritemComponent },
      { path: 'branchregister', component: Branchregister },
      { path: 'tableRegister/:id', component: TableRegister },
      { path: 'branchlist', component: Branchlist },
      { path: 'clientlist', component: Clientlist },
      { path: 'employeelist', component: Employeelist },
      { path: 'orderlist', component: Orderlist },
      { path: 'tableList', component: TableList },
      { path: 'OrdersForDeliveryList', component: OrdersForDeliveryList } ,
      { path: 'myhome', component: Myhome }

    ],
  },
];
