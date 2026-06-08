import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-dialog',
  imports: [MatDialogModule, MatIconModule, CommonModule , TranslateModule],
  templateUrl: './cart-dialog.html',
  styleUrl: './cart-dialog.scss',
})

export class CartDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public cart: any[]) { }

  getTotal() {
    return this.cart.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }

  removeItem(index: number) {
    this.cart.splice(index, 1);
  }

}
