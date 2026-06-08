import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { TableService } from '../../../_services/table.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from 'src/app/_models/table';
import { AuthService } from 'src/app/_services/auth.service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-table-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule , TranslateModule
  ],
  templateUrl: './table-dialog.html',
  styleUrl: './table-dialog.scss',
})

export class TableDialog {

  tables: Table[] = [];
  selectedTable: Table | null = null;

  constructor(
    public router: Router,
    private tableService: TableService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<TableDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    
    if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isNormalAdminLoggedIn ||
      this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {

    this.loadTables();
      }
  }

  confirm() {
    if (this.selectedTable) {
      this.dialogRef.close(this.selectedTable);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  loadTables() {
    const dataEmployee = localStorage.getItem('employeeLoginStorage');
const employee = dataEmployee ? JSON.parse(dataEmployee) : null;

    this.tableService.getTablesWithStatus(employee.branchID).subscribe({
      next: (res: Table[]) => this.tables = res
    });
  }

  selectTable(table: Table) {
    console.log('Selected table:', table);

    if (table.status === true) {
      alert('Table is occupied');
      return;
    }

    // ✅ ONLY return the table
    this.dialogRef.close(table);
  }

}