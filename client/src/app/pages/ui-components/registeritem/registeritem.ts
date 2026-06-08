import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

import { MenuService } from '../../../_services/menu.service';
import { BranchService } from '../../../_services/branch.service';
import { Idname } from 'src/app/_models/idname';
import { AuthService } from 'src/app/_services/auth.service';
import { Branch } from 'src/app/_models/branch';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-registeritem',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule  , TranslateModule
  ],
  templateUrl: './registeritem.html',
  styleUrls: ['./registeritem.scss'],
})
export class RegisteritemComponent implements OnInit {

  private fb = inject(FormBuilder);

  registerForm!: FormGroup;
  branches: Branch[] = [];
  categories: Idname[] = [];

  // Inline error message
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private branchService: BranchService
  ) { }

  ngOnInit(): void {
    
    // Check permission
        if (this.authService.isAdminwithPermissionLoggedIn ||
      this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
    this.initializeForm();
    this.loadBranches();
    this.loadCategories();
    }

        else{
      this.errorMessage = ('You are not authorized to register menu items');
      return;

        }
    }

 
  private initializeForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      branchID: ['', Validators.required],
      categoryID: ['', Validators.required],
  quantity: ['', Validators.required]  ,
      sell_price: ['', [Validators.required, Validators.maxLength(5)]],
      buy_price: ['', [Validators.required, Validators.maxLength(5)]],
    });
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    this.menuService.register(this.registerForm.value).subscribe({
      next: () => {
        this.errorMessage = 'Item Added Successively';
      },
      error: (err) => {
        this.errorMessage = err?.error || 'Something went wrong. Please try again.';
      }
    });
  }

  private loadBranches(): void {
   this.branchService.getall().subscribe(res => {
        this.branches = res;
        if (this.branches.length === 1) {
          this.registerForm.patchValue({
            branchID: this.branches[0].branchID
          });
        }
      });

  }

  private loadCategories(): void {
    this.branchService.idnameforcategories().subscribe({
      next: (res) => this.categories = res,
      error: () => this.errorMessage = 'Failed to load categories.'
    });
  }
}
