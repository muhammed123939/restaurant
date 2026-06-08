import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BranchService } from '../../../_services/branch.service';
import { Branch } from '../../../_models/branch';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { EmployeeService } from 'src/app/_services/employee.service';
import { AuthService } from 'src/app/_services/auth.service';
import { MatDividerModule } from '@angular/material/divider'; 
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-branchlist',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CommonModule , 
    MatDividerModule , TranslateModule
  ],
  templateUrl: './branchlist.html',
  styleUrl: './branchlist.scss',
})
export class Branchlist implements OnInit {

  branches: Branch[] = [];

  displayedColumns: string[] = [
    'branchID',
    'name',
    'location',
    'phone'
  ];

  constructor(
    private branchService: BranchService,
    public authService: AuthService,
    private router: Router,
    public employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.branchService.getall().subscribe(res => {
      this.branches = res;

      // Dynamically add actions column if admin can do actions
      if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isNormalAdminLoggedIn) {
        this.displayedColumns = [
          ...this.displayedColumns
        ];
      }

      else if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
        this.displayedColumns = [
          ...this.displayedColumns,
          'actions'
        ];
      }
    });
  }

  deleteitem(branch: Branch): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${branch.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.branchService.delete(branch.branchID).subscribe({
          next: () => {
            this.branches = this.branches.filter(
              b => b.branchID !== branch.branchID
            );

            Swal.fire(
              'Deleted!',
              `${branch.name} has been deleted.`,
              'success'
            );
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

  edititem(branch: Branch): void {
    this.router.navigate(['/ui-components', 'editbranch', branch.branchID]);
  }

  signup(): void {
    this.router.navigate(['/ui-components', 'branchregister']);
  }

}
