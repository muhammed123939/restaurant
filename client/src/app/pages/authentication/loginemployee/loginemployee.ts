import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { EmployeeService } from 'src/app/_services/employee.service';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loginemployee',
     imports: [RouterModule, MaterialModule, ReactiveFormsModule, NgIf , TranslateModule],
  templateUrl: './loginemployee.html',
  styleUrl: './loginemployee.scss',
})
export class Loginemployee  {

  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  errorMessage = '';
  isLoading = false;
  hidePassword = true;

  form = new FormGroup({
    Name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    Password: new FormControl('', Validators.required),
  });

  submit() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;

    const credentials = {
      name: this.form.value.Name!,
      password: this.form.value.Password!,
    };

    this.employeeService.login(credentials).subscribe({
      next: (res: any) => {

      // ✅ Navigate only (NO reload)
      this.router.navigate(['/dashboard']);
setTimeout(() => window.location.reload(), 100); 
this.isLoading = false;
     
    },

    error: (err) => {

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.error?.message || err.error || 'Invalid username or password'
      });

      this.isLoading = false;
    }
  });
  }

  get f() {
    return this.form.controls;
  }
}