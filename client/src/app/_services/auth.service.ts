import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentEmployee: any = null;
  currentClient: any = null;

  isClientLoggedIn = false;
  isOwnerLoggedIn = false;
  isDeveloperLoggedIn = false;
  isAdminwithPermissionLoggedIn = false;
  isNormalAdminLoggedIn = false;
  isDriverLoggedIn = false;

  constructor() {
    this.loadUser();
  }

  loadUser() {
    
    const employeeData = localStorage.getItem('employeeLoginStorage');
    const clientData = localStorage.getItem('clientLoginStorage');

    this.currentEmployee = employeeData ? JSON.parse(employeeData) : null;
    this.currentClient = clientData ? JSON.parse(clientData) : null;

    this.isClientLoggedIn = !!this.currentClient;

    this.isOwnerLoggedIn =
      !!this.currentEmployee && this.currentEmployee.position === 'Owner';

    this.isDeveloperLoggedIn =
      !!this.currentEmployee && this.currentEmployee.position === 'Developer';

    this.isAdminwithPermissionLoggedIn =
      !!this.currentEmployee &&
      this.currentEmployee.position === 'HeadCashier' ;

    this.isNormalAdminLoggedIn =
      !!this.currentEmployee &&
      this.currentEmployee.position === 'Cashier' ;
  
    this.isDriverLoggedIn =
      !!this.currentEmployee && this.currentEmployee.position === 'Driver';
  }
}