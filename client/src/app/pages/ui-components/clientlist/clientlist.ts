import { Component, inject, OnInit } from '@angular/core';
import { ClientService } from '../../../_services/client.service';
import { Router } from '@angular/router';
import { UserData } from '../../../_models/user-data';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from 'src/app/_services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clientlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule , TranslateModule
  ],
  templateUrl: './clientlist.html',
  styleUrl: './clientlist.scss'
})
export class Clientlist implements OnInit {
employee : any ; 
  clients: UserData[] = [];
  searchTerm = '';
  offer = '';

  errorMessage = '';
  successMessage = '';

  displayedColumns = ['id', 'name', 'email', 'phone' , 'actions'];

  constructor(
    public authService: AuthService,
    private clientservice: ClientService,
    private router: Router
  ) { }


  ngOnInit(): void {

  const employeeData = localStorage.getItem('employeeLoginStorage');
   this.employee = employeeData ? JSON.parse(employeeData) : null;

  // If you really want to keep this, otherwise remove it
  this.displayedColumns = [...this.displayedColumns];

  if (
    this.authService.isAdminwithPermissionLoggedIn ||
    this.authService.isNormalAdminLoggedIn
  ) {

    if (this.employee?.branchID) {
      this.clientservice.getallclientsByBranch(this.employee.branchID)
        .subscribe({
          next: (res) => this.clients = res,
          error: (err) => console.error(err)
        });
    }

  } else if (
    this.authService.isOwnerLoggedIn ||
    this.authService.isDeveloperLoggedIn
  ) {
 this.displayedColumns.splice(4, 0, 'branch');
    this.clientservice.getallclients()
      .subscribe({
        next: (res) => this.clients = res,
        error: (err) => console.error(err)
      });

  }
}

  signUp() {
    this.router.navigate(['/authentication', 'clientRegister']);
  }

  edititem(client: UserData) {
    this.router.navigate([
      '/ui-components',
      'edituser',
      client.userID,
      client.role
    ]);
  }

  deleteitem(client: UserData) {
  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${client.name}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(result => {
    if (result.isConfirmed) {

      this.clientservice.delete(client.userID).subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.userID !== client.userID);

          Swal.fire('Deleted!', 'Client has been deleted.', 'success');
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
  onSearchChange() {
    const term = this.searchTerm.trim();
    if (!term) return;

    this.clientservice.search(term).subscribe(results => {
      this.clients = results;
    });
  }
  
  placeorder(client: UserData) {
     this.router.navigate(['/menuview/Client', client.userID]);
  }

  submitOffer() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.offer.trim()) {
      this.errorMessage = 'Offer cannot be empty.';
      return;
    }

    this.clientservice.offer(this.offer).subscribe({
      next: (res: any) => {
        this.successMessage = res;
        this.offer = '';
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to send offer.';
      }
    });
  }
}
