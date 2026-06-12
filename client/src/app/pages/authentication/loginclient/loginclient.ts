import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ClientService } from 'src/app/_services/client.service';
import { NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loginclient',
  imports: [RouterModule, MaterialModule, ReactiveFormsModule, NgIf , TranslateModule],
  templateUrl: './loginclient.html',
  styleUrl: './loginclient.scss',
})
export class Loginclient {

  private clientService = inject(ClientService);
  private router = inject(Router);

  errorMessage = '';
  isLoading = false;
  hidePassword = true;

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    password: new FormControl('', Validators.required),
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
    name: this.form.value.name!,
    password: this.form.value.password!,
  };

  this.clientService.login(credentials).subscribe({
    next: (res: any) => {

      // ✅ Navigate only (NO reload)
      this.router.navigate(['']);
setTimeout(() => window.location.reload(), 200); 
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
