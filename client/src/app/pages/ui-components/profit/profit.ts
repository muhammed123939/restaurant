import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from 'src/app/_models/branch';
import { BranchProfit } from 'src/app/_models/branch-profit';
import { AuthService } from 'src/app/_services/auth.service';
import { BranchService } from 'src/app/_services/branch.service';
import { OrderService } from 'src/app/_services/order.service';
import jsPDF from 'jspdf';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profit',
   imports: [FormsModule, CommonModule  , TranslateModule , MatIconModule , MatButtonModule],
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

  constructor( private translate: TranslateService ,
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

  printProfitReport(): void {

  const doc = new jsPDF('portrait');

  const title = this.translate.instant('PROFIT_DASHBOARD.TITLE');
  const generated = this.translate.instant('REPORT.GENERATED');
  const branchText = this.translate.instant('PROFIT_DASHBOARD.BRANCH');
  const profitText = this.translate.instant('PROFIT_DASHBOARD.TABLE_PROFIT');
  const currency = this.translate.instant('COMMON.CURRENCY');


  let y = 20;


  // Header
  doc.setFontSize(18);
  doc.setTextColor(255, 90, 0);
  doc.text(title, 14, y);


  y += 10;

  doc.setTextColor(0);
  doc.setFontSize(10);


  doc.text(
    `${generated}: ${new Date().toLocaleString()}`,
    14,
    y
  );


  y += 15;


  // Date range
  doc.text(
    `${this.fromDate} - ${this.toDate}`,
    14,
    y
  );


  y += 15;


  // Single branch profit
  if (this.branchProfit > 0) {

    const selectedBranch = this.branches.find(
      x => x.branchID === this.branchID
    );


    doc.setFontSize(12);


    doc.text(
      `${branchText}: ${selectedBranch?.name ?? ''}`,
      14,
      y
    );


    y += 10;


    doc.text(
      `${profitText}: ${this.branchProfit} ${currency}`,
      14,
      y
    );

  }


  // All branches profit
  else if (this.allBranchesProfit.length > 0) {


    doc.setFontSize(12);


    this.allBranchesProfit.forEach(branch => {


      doc.text(
        `${branchText}: ${branch.branchID}`,
        14,
        y
      );


      y += 8;


      doc.text(
        `${profitText}: ${branch.totalProfit} ${currency}`,
        20,
        y
      );


      y += 12;


      if (y > 270) {
        doc.addPage();
        y = 20;
      }


    });

  }
  doc.save('profit-report.pdf');

}
  // 🔵 Get branch profit
  getBranchProfit(): void {
    if (!this.branchID || !this.fromDate || !this.toDate) return;

            const hasAccess =
    this.authService.isOwnerLoggedIn ||
    this.authService.isDeveloperLoggedIn;

  if (!hasAccess) return;


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
        const hasAccess =
    this.authService.isOwnerLoggedIn ||
    this.authService.isDeveloperLoggedIn;

  if (!hasAccess) return;

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