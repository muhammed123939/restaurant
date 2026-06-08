import { Component, ComponentFactoryResolver, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ClientService } from 'src/app/_services/client.service';
import { OrderService } from 'src/app/_services/order.service';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule , 
    MatIcon , TranslateModule
  ],
  templateUrl: './address-dialog.html',
  styleUrls: ['./address-dialog.scss']
})
export class AddressDialogComponent implements OnInit {

  address = {
    building: null as number | null,
    floor: null as number | null,
    appartment: null as number | null,
    street: null as number | null,
    city: '',
    details: ''
  };

  isSaving = false;

  constructor(
    private dialogRef: MatDialogRef<AddressDialogComponent>,
    private clientService: ClientService,
    private orderService: OrderService,
    @Inject(MAT_DIALOG_DATA) public clientId: any // Inject client ID
  )  {
  console.log('Received clientId:', this.clientId);
}

  ngOnInit(): void {
    if (!this.clientId) return;

    // Check if client ordered before
    this.orderService.orderbefore(this.clientId).subscribe({
      next: (hasOrdered) => {
        if (hasOrdered) {
          // Load existing address if any
          this.clientService.getclientaddress(this.clientId).subscribe({
            next: (addresses) => {
              if (Array.isArray(addresses) && addresses.length > 0) {
                const addr = addresses[0];
                this.address = {
                  building: addr.building ?? null,
                  floor: addr.floor ?? null,
                  appartment: addr.appartment ?? null,
                  street: addr.street ?? '',
                  city: addr.city ?? '',
                  details: addr.details ?? ''
                };
              } else {
                this.initEmptyAddress();
              }
            },
            error: () => this.initEmptyAddress()
          });
        } else {
          this.initEmptyAddress();
        }
      },
      error: () => this.initEmptyAddress()
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private isValid(): boolean {
    return (
      this.address.building !== null &&
      this.address.floor !== null &&
      this.address.appartment !== null &&
      this.address.street !== null &&
      this.address.city.trim().length > 0 &&
      this.address.details.trim().length > 0
    );
  }

  private initEmptyAddress() {
    this.address = {
      building: null,
      floor: null,
      appartment: null,
      street: null,
      city: '',
      details: ''
    };
  }

  // Save button only triggers API
  saveAddress(): void {
    if (!this.isValid() || !this.clientId) return;

    this.isSaving = true;

    this.clientService.getAddressStatus(this.clientId).subscribe({
      next: (hasAddress) => {
        const apiCall = hasAddress
          ? this.clientService.updateAddress(this.clientId, this.address)
          : this.clientService.saveAddress(this.clientId, this.address);

        apiCall.subscribe({
          next: () => {
            this.isSaving = false;
            this.dialogRef.close(true); // ✅ close dialog after saving
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Save/update failed', err);
          }
        });
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Failed to check address status', err);
      }
    });
  }
}
