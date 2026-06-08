import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card'; // <-- Add this
import { MatIconModule } from '@angular/material/icon'; // <-- Add this
import { ClientService } from 'src/app/_services/client.service';
import { AuthService } from 'src/app/_services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customer-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule  ,
    TranslateModule
    // ✅ Add this to use mat-card
  ],
  templateUrl: './customer-details-dialog.html',
  styleUrls: ['./customer-details-dialog.scss'],
})
export class CustomerDetailsDialog implements OnInit {

  customer: any;
  addresses: any[] = []; // addresses list

  constructor(
    @Inject(MAT_DIALOG_DATA) public customerId: number,
    private clientService: ClientService , 
    private authService: AuthService 
  ) {}

  ngOnInit(): void {



    // Dynamically add actions column if admin can do actions
    if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isNormalAdminLoggedIn ||
      this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
    
    // Load user info
    this.clientService.getuserbyid(this.customerId)
      .subscribe(c => this.customer = c);

    // Load addresses
    this.clientService.getclientaddress(this.customerId)
      .subscribe(a => this.addresses = a);  
        
    }





    
  }
}
