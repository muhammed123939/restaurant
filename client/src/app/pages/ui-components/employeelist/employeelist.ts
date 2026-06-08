import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Employee } from '../../../_models/employee';
import { EmployeeService } from '../../../_services/employee.service';
import { BranchService } from '../../../_services/branch.service';
import { ClientService } from '../../../_services/client.service';
import { AuthService } from 'src/app/_services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-employeelist',
  standalone: true,
  imports: [TranslateModule ,
    CommonModule,
    FormsModule,

    /* ✅ Material */
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './employeelist.html',
  styleUrl: './employeelist.scss',
})
export class Employeelist implements OnInit {

  messageemployee = '';
  employees: Employee[] = [];
  // employeesidname: Idname[] = [];
  // branches: Idname[] = [];

  successMessage = '';
  errorMessage = '';

  /* ✅ Table Columns (IMPORTANT) */
  displayedEmployeeColumns: string[] = [
    'id',
    'name',
    'branch',
    'position',
    'salary',
    'actions'
  ];

  constructor(
    public clientService: ClientService,
    public authService: AuthService,
    public employeeService: EmployeeService,
    public branchService: BranchService,
    private router: Router
  ) { }

  ngOnInit(): void {

    if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {

      this.employeeService.getallemp().subscribe(res => {
        if (this.authService.isDeveloperLoggedIn) {
          // ✅ Developer sees all
          this.employees = res;
        } else {
          // ❌ Others don't see developers
          this.employees = res.filter(e => e.position?.toLowerCase() !== 'Developer');
        }
      });

      // this.employeeService.idname()
      //   .subscribe(res => this.employeesidname = res);

      //   this.branchService.idname()
      //     .subscribe(res => this.branches = res);
    }
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  deleteitem(employee: Employee): void {

  const emp = this.employees.find(x => x.employeeID === employee.employeeID);

  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${emp?.user?.name || 'this employee'}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(result => {

    if (result.isConfirmed) {

      this.employeeService.delete(employee.employeeID).subscribe({
        next: () => {

          this.employees = this.employees.filter(
            e => e.employeeID !== employee.employeeID
          );

          Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
        },

        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.error?.message || err.error || 'Something went wrong'
          });
        }
      });

    }
  });
}

  edititem(employee: Employee): void {
    this.router.navigate([
      '/ui-components',
      'edituser',
      employee.employeeID,
      'Employee'
    ]);
  }

  edititem2(employee: Employee): void {
    this.router.navigate([
      '/ui-components',
      'editdataemployee',
      employee.employeeID
    ]);
  }
  signUp() {
    this.router.navigate(['/authentication', 'employeesRegister']);
  }

  submitMessage(): void {
    this.clearMessages();

    if (!this.messageemployee.trim()) {
      this.errorMessage = 'Message cannot be empty.';
      return;
    }

    this.employeeService.messageemployees(this.messageemployee).subscribe({
      next: (res: any) => {
        this.successMessage = res || 'Message sent successfully.';
        this.messageemployee = '';
      },
      error: err => {
        this.errorMessage = err.error || 'Failed to send message.';
      }
    });
  }

}
