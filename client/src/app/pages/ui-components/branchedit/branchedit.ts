import {
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, JsonPipe } from '@angular/common';

import { BranchService } from '../../../_services/branch.service';
import { Branch } from '../../../_models/branch';

/* Angular Material */
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from 'src/app/_services/employee.service';
import { AuthService } from 'src/app/_services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-branchedit',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    JsonPipe,
    MatIcon , 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule , TranslateModule
  ],
  templateUrl: './branchedit.html',
  styleUrl: './branchedit.scss',
})
export class Branchedit implements OnInit {

  @ViewChild('editForm') editForm?: NgForm;

  selectedbranch?: Branch;
  originalbranch?: Branch;

  errorMessage = '';
  successMessage = '';

  constructor(
    public employeeService: EmployeeService,
    public authService: AuthService,
    public branchservice: BranchService,
    private route: ActivatedRoute,

  ) { }

  /* Warn on page refresh if form is dirty */
  @HostListener('window:beforeunload', ['$event'])
  notify($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  ngOnInit(): void {
    if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      const branchID = Number(this.route.snapshot.params['id']);
      this.loadbranch(branchID);
    }
  }

  edit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.editForm?.valid) {
      this.errorMessage = 'Please fix validation errors before saving.';
      return;
    }

    if (!this.hasChanges()) {
      this.errorMessage = 'No changes to save.';
      return;
    }

    const updatedbranch: Branch = {
      branchID: this.selectedbranch!.branchID!,
      name: this.selectedbranch!.name!,
      location: this.selectedbranch!.location!,
      phone: this.selectedbranch!.phone
    };

    this.branchservice.update(updatedbranch).subscribe({
      next: () => {
        this.successMessage = 'Branch edited successfully';
        this.editForm?.reset(this.editForm.value);
        this.originalbranch = { ...updatedbranch };
      },
      error: () => {
        this.errorMessage = 'Update failed. Please try again.';
      }
    });
  }

  hasChanges(): boolean {
    if (!this.selectedbranch || !this.originalbranch) return false;

    const keys: (keyof Branch)[] = ['branchID', 'name', 'location', 'phone'];

    return keys.some(
      key => this.selectedbranch![key] !== this.originalbranch![key]
    );
  }
  resetForm(form: NgForm) {
    form.resetForm(this.originalbranch);
  }

  onMemberChange(event: Branch) {
    this.selectedbranch = event;
  }

  loadbranch(id: number): void {
    this.branchservice.getBranchbyid(id).subscribe({
      next: (branch) => {
        this.selectedbranch = { ...branch };
        this.originalbranch = { ...branch };
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to load branch data';
      }
    });
  }
}
