import {
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { ActivatedRoute } from '@angular/router';

import { BranchService } from '../../../_services/branch.service';
import { MenuService } from '../../../_services/menu.service';

import { PhotoeditorComponent } from '../photoeditor/photoeditor.component';
import { Menu } from '../../../_models/menu';
import { Photo } from '../../../_models/photo';
import { AuthService } from 'src/app/_services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edititem',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  PhotoeditorComponent , MatIcon , TranslateModule
],
  templateUrl: './edititem.html',
  styleUrl: './edititem.scss',
})
export class EdititemComponent implements OnInit {
  @ViewChild('editForm') editForm?: NgForm;

  selected?: Menu;
  original?: Menu;

  branches: any[] = [];
  categories: any[] = [];
  myphotos: Photo[] = [];

  errorMessage: string | null = null;
  successMessage: string | null = null;

  @HostListener('window:beforeunload', ['$event'])
  notify($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    public authService: AuthService,
    public menuservice: MenuService,
    public branchservice: BranchService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    // Dynamically add actions column if admin can do actions
    if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {

      // Get both menuItemID and branchID from route
      const itemId = Number(this.route.snapshot.paramMap.get('id'));
      const branchID = Number(this.route.snapshot.paramMap.get('branchID'));


      if (!itemId || !branchID) {
        this.errorMessage = 'Invalid item ID or branch ID.';
        return;
      }

      this.branchservice.idname().subscribe({
        next: (res) => (this.branches = res),
        error: () => (this.errorMessage = 'Failed to load branches.')
      });

      this.load(itemId, branchID); // pass branchId if needed
      this.loadCategories();

    }

  }

  edit() {
            const hasAccess =
    this.authService.isOwnerLoggedIn ||
    this.authService.isDeveloperLoggedIn;

  if (!hasAccess) return;

    this.errorMessage = null;
    this.successMessage = null;

    if (!this.hasChanges()) {
      this.errorMessage = 'No changes to save.';
      return;
    }

    const updated: Menu = {
      menuItemID: this.selected!.menuItemID!,
      branchID: this.selected!.branchID!,
      name: this.selected!.name!,
      categoryID: this.selected!.categoryID!,
      sell_price: this.selected!.sell_price!,
      buy_price: this.selected!.buy_price!,
      quantity: this.selected!.quantity
    };

    this.menuservice.update(updated).subscribe({
      next: () => {
        this.successMessage = 'Item updated successfully.';
        this.editForm?.reset(this.editForm?.value);
        this.original = { ...updated };
      },
      error: () =>
        (this.errorMessage = 'Update failed. Please try again.')
    });
  }

  hasChanges(): boolean {
    if (!this.selected || !this.original) return false;

    const fields: (keyof Menu)[] = [
      'branchID',
      'name',
      'categoryID',
      'sell_price',
      'buy_price',
      'quantity'
    ];

    return fields.some(
      (key) => this.selected![key] !== this.original![key]
    );
  }

  loadCategories() {
    this.branchservice.idnameforcategories().subscribe({
      next: (res) => (this.categories = res),
      error: () =>
        (this.errorMessage = 'Failed to load categories.')
    });
  }

  load(id: number, branchID: number) {
    this.menuservice.getPhoto(id).subscribe({
      next: (photo) =>
        (this.myphotos = photo && photo.url ? [photo] : []),
      error: () => (this.myphotos = [])
    });

    this.menuservice.getItembyid(id, branchID).subscribe({
      next: (res) => {
        this.selected = { ...res };
        this.original = { ...res };
      },
      error: () =>
        (this.errorMessage = 'Failed to load menu item.')
    });
  }

  resetForm(form: NgForm) {
    form.resetForm(this.original);
  }
}

