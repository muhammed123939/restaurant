import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule , 
    MatIcon , TranslateModule
  ],
  templateUrl: './add-comment.html',
  styleUrl: './add-comment.scss',
})
export class AddComment {

  hasDelivery: boolean = false; // ✅ add this
  orderComment: string = '';
  deliveryComment: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddComment>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.orderComment = data.orderComment || '';
      this.deliveryComment = data.deliveryComment || '';
      this.hasDelivery = data.hasDelivery;
    }

  }
  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({
      orderComment: this.orderComment,
      deliveryComment: this.deliveryComment
    });
  }

}