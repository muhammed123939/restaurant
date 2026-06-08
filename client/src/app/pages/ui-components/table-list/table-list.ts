import { Component, OnInit } from '@angular/core';
import { TableService } from '../../../_services/table.service';
import { AuthService } from '../../../_services/auth.service';
import { Router } from '@angular/router';
import { Table } from '../../../_models/table';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BranchService } from '../../../_services/branch.service';
import { Branch } from '../../../_models/branch';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule , TranslateModule
  ],
  templateUrl: './table-list.html',
  styleUrl: './table-list.scss',
})
export class TableList implements OnInit {

  tables: Table[] = [];
  branches: Branch[] = [];

  selectedBranchId: number | null = null;

  displayedColumns: string[] = [
    'tableID',
    'tableNo',
    'capacity',
    'status',
    'actions'
  ];

  constructor(
    private tableService: TableService,
    public authService: AuthService,
    public branchService: BranchService,
    private router: Router
  ) { }

  ngOnInit(): void {

    if (this.authService.isDeveloperLoggedIn || this.authService.isOwnerLoggedIn) {

      // ✅ FIX: subscribe
      this.branchService.getall().subscribe(res => {
        this.branches = res;
      });

    }
  }

  // ✅ FIX name + logic
  loadTables() {
    if (!this.selectedBranchId) return;

    this.tableService.getTablesWithStatus(this.selectedBranchId).subscribe(res => {
      this.tables = res;
    });
  }

  deleteitem(table: Table): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete Table ${table.tableNo}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.tableService.delete(table.tableID).subscribe({
          next: () => {
            this.tables = this.tables.filter(
              t => t.tableID !== table.tableID
            );

            Swal.fire(
              'Deleted!',
              `Table ${table.tableNo} has been deleted.`,
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

  edititem(table: Table): void {
    this.router.navigate(['/ui-components', 'editTable', table.tableID]);
  }

  addTable(branchID:number): void {
    this.router.navigate(['/ui-components', 'tableRegister' , branchID]);
  }
}