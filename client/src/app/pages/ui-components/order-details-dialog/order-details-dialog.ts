import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Order } from 'src/app/_models/order';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule ,  MatIconModule , TranslateModule],
  templateUrl: './order-details-dialog.html',
  styleUrl: './order-details-dialog.scss',
})
export class OrderDetailsDialog {

  constructor(
    @Inject(MAT_DIALOG_DATA) public order: Order
  ) {}

getStatusStep(): number {

  switch (this.order.orderfordelivery?.status) {

    case 'Pending':
      return 1;

    case 'OutForDelivery':
      return 2;

    case 'Delivered':
      return 3;

    default:
      return 1;
  }
}

isStepActive(step: number): boolean {
  return this.getStatusStep() >= step;
}
}
