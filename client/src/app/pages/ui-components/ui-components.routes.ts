import { Routes } from '@angular/router';
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
import { Profit } from './profit/profit';
import { Myhome } from './myhome/myhome';
import { Homepageinfo } from 'src/app/pages/ui-components/homepageinfo/homepageinfo';


export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
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
      { path: 'homepageinfoEdit', component: Homepageinfo },
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
