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
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-branchregister',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIcon ,TranslateModule 
  ],
  templateUrl: './branchregister.html',
  styleUrl: './branchregister.scss',
})
export class Branchregister implements OnInit {

  constructor(
    private branchService: BranchService,
    public authService: AuthService

  ) { }

  private fb = inject(FormBuilder);

  registerForm!: FormGroup;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (this.authService.isDeveloperLoggedIn) {
      this.initializeForm();
    } else {
      this.errorMessage = 'You do not have permission to add branches.';
    }
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    });
  }

  register() {
    if (this.registerForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.branchService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Branch added successfully';
      },
      error: err => {
        this.errorMessage = err?.error || 'Failed to register branch';
      }
    });
  }
}
