
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../_services/branch.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from 'src/app/_services/auth.service';
import { TableService } from 'src/app/_services/table.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule , TranslateModule
  ],
  templateUrl: './table-register.html',
  styleUrl: './table-register.scss',
})
export class TableRegister implements OnInit {
constructor(
      private tableService: TableService ,
      public authService: AuthService , 
        private route: ActivatedRoute

    ) { }

  private fb = inject(FormBuilder);

  registerForm!: FormGroup;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {

  if (this.authService.isDeveloperLoggedIn || this.authService.isOwnerLoggedIn) {

    this.initializeForm();

    const branchId = Number(this.route.snapshot.paramMap.get('id'));

    if (!branchId) {
      this.errorMessage = 'Invalid branch';
      return;
    }

    // ✅ force set branchID
    this.registerForm.patchValue({
      branchID: branchId
    });

  } else {
    this.errorMessage = 'You do not have permission to add Tables.';
  }
}

initializeForm() {
  this.registerForm = this.fb.group({
    branchID: [0], // will be set from route
    capacity: ['', Validators.required],
    tableNo: ['', Validators.required]
  });
}

  register() {
    if (this.registerForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.tableService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Table added successfully';
      },
      error: err => {
        this.errorMessage = err?.error || 'Failed to register Table';
      }
    });
  }
  
}

