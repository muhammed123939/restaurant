import { Component, HostListener, ViewChild, OnInit } from '@angular/core';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserData } from '../../../_models/user-data';
import { ClientService } from '../../../_services/client.service';
import { EmployeeService } from '../../../_services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { AddressDialogComponent } from '../address-dialog/address-dialog';
import { AuthService } from 'src/app/_services/auth.service';
import { Branch } from 'src/app/_models/branch';
import { BranchService } from 'src/app/_services/branch.service';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edituser',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CommonModule , TranslateModule
  ], 
  templateUrl: './edituser.html',
  styleUrl: './edituser.scss'
})
export class Edituser implements OnInit {

  @ViewChild('editForm') editForm?: NgForm;
  selecteduser: UserData = {
  userID: 0,
  name: '',
  email: '',
  phone: '',
  role: '',
  branchID: 0,
  password: ''
};
  confirmPassword: string = '';
  passwordTouched: boolean = false;
  originalUser?: UserData;
  branches: Branch[] = [];
  errorMessage: string = '';
  infoMessage: string = '';
  successMessage: string = '';

  constructor(
    private dialog: MatDialog,
    public authService: AuthService,
    public clientservice: ClientService,
    public employeeservice: EmployeeService,
    public branchService: BranchService,
    private myroute: ActivatedRoute,
  ) { }

  @HostListener('window:beforeunload', ['$event']) notify($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnInit(): void {

      this.branchService.getall().subscribe(res => {
        this.branches = res;

        // ✅ If user has NO branch (rare case)
        if (!this.selecteduser?.branchID && this.branches.length === 1) {
          this.selecteduser!.branchID = this.branches[0].branchID;
        }
      });
 
    // Dynamically add actions column if admin can do actions
    if (this.authService.isAdminwithPermissionLoggedIn ||
      this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {

      const userId = Number(this.myroute.snapshot.params['id']);
      const role = this.myroute.snapshot.params['role'];
      this.loadUser(userId, role);
    }
    if ( this.authService.isNormalAdminLoggedIn  || this.authService.isClientLoggedIn) {
 
  const user = this.getCurrentUser();


       const userId = user.id;
      const role = user.role;
      this.loadUser(userId, role);
 
  }
   }
    getCurrentUser(): any | null {
    const employee = this.employeeservice.currentEmployee();
    if (employee) return employee;
    const client = this.clientservice.currentClient();
    if (client) return client;
     return null;
  }

  editAddress(): void {

    const client = this.clientservice.currentClient();

    // ✅ Client editing his own address
    if (client) {
      this.dialog.open(AddressDialogComponent, {
        width: '600px',
        data: client.id  ,
                direction: document.documentElement.dir as 'rtl' | 'ltr'
      });
      return;
    }

    // ✅ Admin editing selected user
    if (this.selecteduser?.userID) {
      this.dialog.open(AddressDialogComponent, {
        width: '600px',
        data: this.selecteduser.userID ,
                direction: document.documentElement.dir as 'rtl' | 'ltr'
      });
    }
  }

  loadUser(id: number, role: string): void {
    this.errorMessage = '';

    if (role === 'Employee') {
      this.employeeservice.getempbyid(id).subscribe({
        next: (x) => {
          this.selecteduser = { ...x };
          this.originalUser = { ...x }; // store original state for comparison
        },
        error: (err) => this.errorMessage = err.error || 'Failed to load admin',
      });
    }
    else if (role === 'Client') {

      this.clientservice.getuserbyid(id).subscribe({
        next: (x) => {
          this.selecteduser = { ...x };
          this.originalUser = { ...x };
        },
        error: (err) => this.errorMessage = err.error || 'Failed to load client',
      });
    }

    else {
      console.warn('Unknown role:', role);
      this.errorMessage = 'Invalid role type';
    }
  }

  edit() {
    this.errorMessage = '';
    this.infoMessage = '';
    this.successMessage = '';

    if (!this.hasChanges()) {
      this.infoMessage = 'No changes to save.';
      return;
    }

    if (this.selecteduser!.email && !this.validateEmail(this.selecteduser!.email)) {
      this.errorMessage = 'Invalid email address';
      return;
    }
    if (this.passwordTouched && this.selecteduser?.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const updatedUser: UserData = {
      userID: this.selecteduser!.userID!,
      name: this.selecteduser!.name!,
      email: this.selecteduser!.email,
      phone: this.selecteduser!.phone,
      password: this.selecteduser?.password,
      role: this.selecteduser!.role,
      branchID: this.selecteduser!.branchID
    };

    if (
      !this.passwordTouched ||
      !this.selecteduser?.password ||
      this.selecteduser.password.trim().length === 0
    ) {
      delete updatedUser.password;
    }

    if (updatedUser.role == "Employee") {
      this.employeeservice.update(updatedUser as UserData).subscribe({
        next: _ => {
          this.successMessage = 'User edited successfully';
          this.editForm?.reset(this.editForm?.value);
          this.confirmPassword = '';
          this.passwordTouched = false;
          this.originalUser = { ...updatedUser };
        },
error: err => {
  this.errorMessage = err.error.message;
}
      });
    }

    if (updatedUser.role == "Client") {
      this.clientservice.update(updatedUser as UserData).subscribe({
        next: _ => {
          this.successMessage = 'User edited successfully';
          this.editForm?.reset(this.editForm?.value);
          this.confirmPassword = '';
          this.passwordTouched = false;
          this.originalUser = { ...updatedUser };
        },
        error: err => this.errorMessage =err.message
      });
    }
  }

  hasChanges(): boolean {
    if (!this.selecteduser || !this.originalUser) return false;

    const keys: (keyof UserData)[] = ['userID', 'name', 'email', 'phone', 'password', 'role', 'branchID'];

    return keys.some((key) => this.selecteduser![key] !== this.originalUser![key]) ||
      (this.passwordTouched && this.selecteduser?.password?.trim().length > 0);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onMemberChange(event: UserData) {
    this.selecteduser = event;
  }

  resetForm(form: NgForm) {
    form.resetForm(this.originalUser);
  }

  // ------------------------
  // Email validation function
  // ------------------------
  validateEmail(email?: string | null): boolean {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
