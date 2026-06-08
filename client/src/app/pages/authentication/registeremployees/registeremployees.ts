import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { EmployeeService } from 'src/app/_services/employee.service';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from 'src/app/_services/auth.service';
import { Branch } from 'src/app/_models/branch';
import { BranchService } from 'src/app/_services/branch.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-registeremployees',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule , TranslateModule],
  templateUrl: './registeremployees.html',
  styleUrl: './registeremployees.scss',
})

export class Registeremployees implements OnInit {

  constructor(
    public authService: AuthService,
    private branchService: BranchService,
    private employeeService: EmployeeService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  hidePassword = true;
  hideConfirmPassword = true;
  branches: Branch[] = [];
  registerForm!: FormGroup;
  errorMessage: string = '';

  ngOnInit(): void {
    this.initializeForm();

    if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      this.branchService.getall().subscribe(res => {
        this.branches = res;
        if (this.branches.length === 1) {
          this.registerForm.patchValue({
            branchID: this.branches[0].branchID
          });
        }
      });

    }
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      // ✅ Optional email
      email: ['', [Validators.email, this.validEmailDomainValidator]],
      phone: ['', [Validators.required, this.exactLengthValidator(11)]],
      // ✅ Optional password
      password: ['', [Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [this.matchValues('password')]],
      role: ['employee', Validators.required],
      branchID: ['', Validators.required],
      // Dropdown in HTML
      position: ['', Validators.required],
      // Number field
      salary: [null, [Validators.required, Validators.min(0)]],
    });

    // Update confirm password validation dynamically
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  exactLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return value.toString().length === length
        ? null
        : { exactLength: true };
    };
  }

  onPhoneInput() {
    const control = this.registerForm.get('phone');
    if (!control) return;

    const numbersOnly = (control.value || '').replace(/\D/g, '');
    control.setValue(numbersOnly, { emitEvent: false });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : { isMatching: true };
    };
  }

  validEmailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null; // ✅ important → optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email) ? null : { invalidEmailFormat: true };
  }

  submit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    const data = this.registerForm.value;

    if (!data.password) {
      data.password = 'pa$$w0rd';
    }

    
    this.employeeService.register(data).subscribe({
  next: () => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Employee registered successfully',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
    this.router.navigate(['/authentication', 'employeesRegister']);
    this.initializeForm();
    });
  },

  error: (err) => {
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: err.error?.message || err.error || 'Something went wrong'
    });
  }
});
  }

  get f() {
    return this.registerForm.controls;
  }
}