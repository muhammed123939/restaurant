import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../_services/employee.service';
import { BranchService } from '../../../_services/branch.service';
import { Employee } from '../../../_models/employee';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, JsonPipe } from '@angular/common';
import { AuthService } from 'src/app/_services/auth.service';
import { Idname } from 'src/app/_models/idname';
import { Branch } from 'src/app/_models/branch';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-employeedataedit',
  standalone: true,
  imports: [
    CommonModule,MatIcon , 
    FormsModule,
    JsonPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule ,TranslateModule
  ],
  templateUrl: './employeedataedit.html',
  styleUrl: './employeedataedit.scss',
})

export class Employeedataedit implements OnInit {

  selecteduser?: Employee;
  originalUser?: Employee;
  branches: Branch[] = [];

  errorMessage: string = '';
  successMessage: string = '';
  infoMessage: string = '';

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private branchService: BranchService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      const userId = Number(this.route.snapshot.params['id']);
      this.branchService.getall().subscribe({
        next: branches => this.branches = branches,
        error: err => console.error('Error loading branches', err)
      });
      this.loadUser(userId);
    }
  }

 loadUser(id: number) {
  this.employeeService.getempdatabyid(id).subscribe({
    next: user => {
      // Deep copy to separate nested 'user' object
      this.selecteduser = {
        ...user,
        user: user.user ? { ...user.user } : undefined
      };

      this.originalUser = {
        ...user,
        user: user.user ? { ...user.user } : undefined
      };
    },
    error: err => this.errorMessage = err.error || 'Failed to load user'
  });
}

  edit(form: NgForm) {
    if (!this.selecteduser || !this.originalUser) return;

    if (!this.hasChanges()) {
      this.infoMessage = 'No changes to save.';
      return;
    }

const updatedUser: Employee = {
  employeeID: this.selecteduser.employeeID!,
  position: this.selecteduser.position!,
  salary: this.selecteduser.salary,
  isAvailable: this.selecteduser.isAvailable,
  user: {
    userID: this.selecteduser.user?.userID,
    name: this.selecteduser.user?.name,
    branchID: this.selecteduser.user?.branchID 
  }
};

    this.employeeService.updatedata(updatedUser).subscribe({
      next: _ => {
        this.successMessage = 'User edited successfully';
        this.errorMessage = '';
        this.infoMessage = '';
        form.resetForm(this.selecteduser);
        this.originalUser = { ...updatedUser };
      },
      error: _ => this.errorMessage = 'Update failed'
    });
  }

  hasChanges(): boolean {
    if (!this.selecteduser || !this.originalUser) return false;

    // Check Employee fields
    if (
        this.selecteduser.user?.branchID !== this.originalUser.user?.branchID||
      this.selecteduser.position !== this.originalUser.position ||
      this.selecteduser.salary !== this.originalUser.salary ||
      this.selecteduser.isAvailable !== this.originalUser.isAvailable
    ) {
      return true;
    }


    return false;
  }

}
