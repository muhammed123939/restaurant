import { Component, Inject, OnInit } from '@angular/core';
import { UserData } from 'src/app/_models/user-data';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';

import { MatSelectionList  } from '@angular/material/list'; // <-- correct module
import { MatListOption  } from '@angular/material/list'; // <-- correct module
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from 'src/app/_services/employee.service';
import { AuthService } from 'src/app/_services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-drivers-dialog',
  standalone : true ,
   imports: [
      CommonModule,
      FormsModule,
      MatSelectionList ,
      MatListOption , MatIcon , MatDialogActions  , MatDialogContent , TranslateModule
    ],
      templateUrl: './drivers-dialog.html',
  styleUrl: './drivers-dialog.scss',
})
export class DriversDialog implements OnInit {
  drivers: UserData[] = [];
  selectedDriverId: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<DriversDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { orderID: number }
  ) { }
  ngOnInit(): void {
 console.log(this.data);
 
    // Dynamically add actions column if admin can do actions
    if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isNormalAdminLoggedIn ||
      this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
     this.loadDrivers();

    }
  }

    assignDriver() {
    if (this.selectedDriverId) {
      this.dialogRef.close(this.selectedDriverId);
    }
  }

  close() {
    this.dialogRef.close();
  }

  loadDrivers() {
    this.employeeService.getAvailableDrivers(this.employeeService.currentEmployee()?.branchID!).subscribe(res => {
      this.drivers = res;
    });
  }

}
