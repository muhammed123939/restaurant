import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ClientService } from 'src/app/_services/client.service';
import { AuthService } from 'src/app/_services/auth.service';
import { CommonModule } from '@angular/common';
import { Branch } from 'src/app/_models/branch';
import { BranchService } from 'src/app/_services/branch.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-registerclients',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule , TranslateModule],
  templateUrl: './registerclients.html',
  styleUrl: './registerclients.scss',
})
export class Registerclients implements OnInit {

  constructor(
    public authService: AuthService,
    private branchService: BranchService,
    private clientService: ClientService,
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

    this.branchService.getall().subscribe(res => {
      this.branches = res;

      if (this.branches.length === 1) {
        this.registerForm.patchValue({
          branchID: this.branches[0].branchID
        });
      }
    });
  }

  initializeForm() {

    const dataEmployee = localStorage.getItem('employeeLoginStorage');
    const employee = dataEmployee ? JSON.parse(dataEmployee) : null;

    const isOwnerOrDev =
      this.authService.isOwnerLoggedIn ||
      this.authService.isDeveloperLoggedIn;

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, this.validEmailDomainValidator]],
      phone: ['', [Validators.required, this.exactLengthValidator(11)]],
      password: ['', [Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [this.matchValues('password')]],
      role: ['client', Validators.required],

      branchID: [
        isOwnerOrDev ? '' : employee?.branchID,
        Validators.required
      ],
    });

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
    this.clientService.register(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client registered successfully',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/authentication', 'clientRegister']);
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