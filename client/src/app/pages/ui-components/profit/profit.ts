import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from 'src/app/_models/branch';
import { BranchProfit } from 'src/app/_models/branch-profit';
import { AuthService } from 'src/app/_services/auth.service';
import { BranchService } from 'src/app/_services/branch.service';
import { OrderService } from 'src/app/_services/order.service';

@Component({
  selector: 'app-profit',
   imports: [FormsModule, CommonModule , MatIcon , FormsModule , TranslateModule],
  templateUrl: './profit.html',
  styleUrl: './profit.scss',
})


export class Profit implements OnInit {

  branches: Branch[] = [];

  branchID!: number;

  fromDate!: string;
  toDate!: string;

  branchProfit: number = 0;
  allBranchesProfit: BranchProfit[] = [];

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    if (this.authService.isDeveloperLoggedIn || this.authService.isOwnerLoggedIn) {

      this.branchService.getall().subscribe({
        next: (data: Branch[]) => {
          this.branches = data;

          if (this.branches.length === 1) {
            this.branchID = this.branches[0].branchID;
          }
        },
        error: err => console.error(err)
      });

    }
  }

  // 🔵 Get branch profit
  getBranchProfit(): void {
    if (!this.branchID || !this.fromDate || !this.toDate) return;

    this.orderService.getBranchProfit(
      this.branchID,
      this.fromDate,
      this.toDate
    ).subscribe({
      next: (data: number) => {
        this.branchProfit = data;
      },
      error: err => console.error(err)
    });
  }

  // 🔵 Get all branches profit
  getAllBranchesProfit(): void {
    if (!this.fromDate || !this.toDate) return;

    this.orderService.getAllBranchesProfit(
      this.fromDate,
      this.toDate
    ).subscribe({
      next: (data: BranchProfit[]) => {
        this.allBranchesProfit = data;
      },
      error: err => console.error(err)
    });
  }

}