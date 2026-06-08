import { Routes } from '@angular/router';


import { Registerclients } from './registerclients/registerclients';
import { Registeremployees } from './registeremployees/registeremployees';
import { Loginclient } from './loginclient/loginclient';
import { Loginemployee } from './loginemployee/loginemployee';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'loginClient',
        component: Loginclient,
      },
       {
        path: 'loginEmployee',
        component: Loginemployee,
      },
      {
        path: 'clientRegister',
        component: Registerclients,
      },

       {
        path: 'employeesRegister',
        component: Registeremployees,
      },
    ],
  },
];
