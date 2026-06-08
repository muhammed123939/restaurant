import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class authadminGuard implements CanActivate {
  constructor(private router: Router) {}
canActivate(): boolean {
  const employeeStr = localStorage.getItem('employeeLoginStorage');
  const clientStr = localStorage.getItem('clientLoginStorage');

  if (employeeStr || clientStr) {
    return true; // allow navigation
  }

  // redirect to login if nothing found
  this.router.navigate(['/authentication/login']);
  return false;
}

}
