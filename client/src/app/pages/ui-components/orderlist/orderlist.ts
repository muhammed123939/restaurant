import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClientService } from '../../../_services/client.service';
import { OrderService } from 'src/app/_services/order.service';
import { Order } from 'src/app/_models/order';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderDetailsDialog } from '../order-details-dialog/order-details-dialog';
import { CustomerDetailsDialog } from '../customer-details-dialog/customer-details-dialog';
import { AuthService } from 'src/app/_services/auth.service';
import { EmployeeService } from 'src/app/_services/employee.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-orderlist',
  standalone: true,
  imports: [
    MatSelectModule,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatPaginatorModule,
    TranslateModule
  ],
  templateUrl: './orderlist.html',
  styleUrls: ['./orderlist.scss']
})
export class Orderlist implements OnInit {

  // Date filters

  startDate: string = '';
  endDate: string = '';
  customerIdSearch: number | null = null;

  orderIdSearch: number | null = null;
  orderTypeSearch: string = '';
  // Orders
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  // Pagination
  pageSize = 10;
  currentPage = 0;
  pagedOrders: Order[] = [];

  // Table columns
  displayedColumns: string[] = [];

  constructor(public translate: TranslateService ,
    public authService: AuthService,
    public clientService: ClientService,
    public orderService: OrderService,
    public employeeService: EmployeeService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {

    if (this.authService.isDriverLoggedIn) {
      this.displayedColumns = [
      ];
    }

    else if (this.authService.isNormalAdminLoggedIn) {
      const branchId = this.employeeService.currentEmployee()?.branchID;
      if (!branchId) return;

      this.orderService.getOrdersOfBranch(branchId).subscribe(x => {
        this.orders = x;
        this.updateFilteredOrders();
      });
      this.displayedColumns = [
        'orderNo',
        'orderID',
        'customerID',
        'orderDate',
        'totalAmount',
        'details',
        'orderPosition',
        'tableNo',
        'status',
        'comment'
      ];
    }

    else if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      this.orderService.getOrders().subscribe(x => {
        this.orders = x;
        this.updateFilteredOrders();
      });
      this.displayedColumns = [
        'orderNo',
        'orderID',
        'customerID',
        'orderDate',
        'totalAmount',
        'details',
        'orderPosition',
        'tableNo',
        'status',
        'comment',
        'actions'
      ];
    }

    else if (this.authService.isClientLoggedIn) {
      const clientId = this.clientService.currentClient()?.id;

      if (!clientId) return;
      this.orderService.getOrdersofclient(clientId).subscribe(x => {
        this.orders = x;
        this.updateFilteredOrders();
      });
      this.displayedColumns = [
        'orderNo',
        'orderID',
        'orderDate',
        'totalAmount',
        'details',
        'orderPosition',
      ];

    }
  }

  // Clear search
  clearSearch() {
    this.orderIdSearch = null;
    this.customerIdSearch = null;

    this.filterOrders();
  }

  // Delete order
  deleteOrder(id: number) {
    const hasAccess =
      this.authService.isAdminwithPermissionLoggedIn ||
      this.authService.isNormalAdminLoggedIn ||
      this.authService.isOwnerLoggedIn ||
      this.authService.isDeveloperLoggedIn;

    if (!hasAccess) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete order ID = ${id}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        // Call API to delete order
        this.orderService.removeOrder(id).subscribe({
          next: () => {
            // Remove from local array only after successful deletion
            this.orders = this.orders.filter(o => o.orderID !== id);
            this.updateFilteredOrders();

            Swal.fire(
              'Deleted!',
              `Order with ID = ${id} has been deleted.`,
              'success'
            );
          },
          error: err => {
            Swal.fire(
              'Error!',
              `Failed to delete order with ID = ${id}.`,
              'error'
            );
            console.error('Delete order error:', err);
          }
        });
      }
    });
  }

  
  
  exportOrdersPdf() {

  const doc = new jsPDF('landscape');

  const isArabic =
    this.translate.currentLang === 'ar' ||
    this.translate.getDefaultLang() === 'ar';

    const L = {
  title: this.translate.instant('ORDERS.TITLE'),
  generated: this.translate.instant('REPORT.GENERATED'),

  totalOrders: this.translate.instant('REPORT.TOTAL_RECORDS'),
  grandTotal: this.translate.instant('ORDERS.TOTAL'),

  orderId: this.translate.instant('ORDERS.ORDER_ID'),
  customerId: this.translate.instant('ORDERS.CUSTOMER_ID'),
  orderType: this.translate.instant('ORDERS.ORDER_TYPE'),

  startDate: this.translate.instant('ORDERS.START_DATE'),
  endDate: this.translate.instant('ORDERS.END_DATE'),

  customer: this.translate.instant('ORDERS.CUSTOMER'),
  guest: this.translate.instant('ORDERS.GUEST'),

  type: this.translate.instant('ORDERS.TYPE'),
  status: this.translate.instant('ORDERS.STATUS'),
  table: this.translate.instant('ORDERS.TABLE'),
  date: this.translate.instant('ORDERS.DATE'),
  total: this.translate.instant('ORDERS.TOTAL'),

  page: this.translate.instant('COMMON.PAGE'),
  of: this.translate.currentLang === 'ar' ? 'من' : 'of',

  restaurant: this.translate.instant('ORDERS.RESTAURANT'),
  takeaway: this.translate.instant('ORDERS.TAKEAWAY'),
  delivery: this.translate.instant('ORDERS.DELIVERY'),

  fileName: this.translate.currentLang === 'ar'
    ? 'تقرير_الطلبات'
    : 'Orders_Report'
};
  // ==========================
  // Header
  // ==========================
  doc.setFontSize(18);
  doc.setTextColor(255, 90, 0);
  doc.text(L.title, 14, 18);

  doc.setTextColor(0);
  doc.setFontSize(10);

  doc.text(`${L.generated}: ${new Date().toLocaleString()}`, 14, 26);

  // ==========================
  // Filters
  // ==========================
  let y = 34;

  if (this.orderIdSearch) {
    doc.text(`${L.orderId}: ${this.orderIdSearch}`, 14, y);
    y += 6;
  }

  if (this.customerIdSearch) {
    doc.text(`${L.customerId}: ${this.customerIdSearch}`, 14, y);
    y += 6;
  }

  if (this.orderTypeSearch) {

    let type = this.orderTypeSearch;

    switch (type) {
      case 'Restaurant':
        type = L.restaurant;
        break;

      case 'TakeAway':
      case 'Takeaway':
        type = L.takeaway;
        break;

      case 'Delivery':
        type = L.delivery;
        break;
    }

    doc.text(`${L.orderType}: ${type}`, 14, y);
    y += 6;
  }

  if (this.startDate) {
    doc.text(
      `${L.startDate}: ${new Date(this.startDate).toLocaleDateString()}`,
      14,
      y
    );
    y += 6;
  }

  if (this.endDate) {
    doc.text(
      `${L.endDate}: ${new Date(this.endDate).toLocaleDateString()}`,
      14,
      y
    );
    y += 6;
  }

  // ==========================
  // Statistics
  // ==========================
  const totalAmount = this.filteredOrders.reduce(
    (sum, order) => sum + (order.totalAmount ?? 0),
    0
  );

  doc.setFontSize(11);

  doc.text(
    `${L.totalOrders}: ${this.filteredOrders.length}`,
    170,
    26
  );

  doc.text(
    `${L.grandTotal}: ${totalAmount.toFixed(2)}`,
    170,
    32
  );

  // ==========================
  // Table
  // ==========================
  autoTable(doc, {
    startY: y + 4,

    head: [[
      '#',
      L.orderId,
      L.customer,
      L.type,
      L.status,
      L.table,
      L.date,
      L.total
    ]],

    body: this.filteredOrders.map((o, index) => {

      let type = o.orderPosition ?? '-';

      switch (type) {
        case 'Restaurant':
          type = L.restaurant;
          break;

        case 'TakeAway':
        case 'Takeaway':
          type = L.takeaway;
          break;

        case 'Delivery':
          type = L.delivery;
          break;
      }

      return [
        index + 1,
        o.orderID ?? '-',
        o.customerID ?? L.guest,
        type,
        o.status ?? '-',
        o.tableNo ?? '-',
        new Date(o.orderDate).toLocaleString(),
        (o.totalAmount ?? 0).toFixed(2)
      ];
    }),

    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle'
    },

    headStyles: {
      fillColor: [255, 90, 0],
      textColor: 255,
      fontStyle: 'bold'
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },

    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 24 },
      2: { cellWidth: 26 },
      3: { cellWidth: 28 },
      4: { cellWidth: 24 },
      5: { cellWidth: 18 },
      6: { cellWidth: 48 },
      7: { cellWidth: 24 }
    },

    didDrawPage: () => {

      const pageCount = doc.getNumberOfPages();

      doc.setFontSize(9);

      doc.text(
        `${L.page} ${doc.getCurrentPageInfo().pageNumber} ${L.of} ${pageCount}`,
        doc.internal.pageSize.getWidth() - 45,
        doc.internal.pageSize.getHeight() - 8
      );
    }
  });

  doc.save(`${L.fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
  // Edit order
  editorder(order: Order) {
    if (!order.orderID) return;

    const hasAccess =
      this.authService.isAdminwithPermissionLoggedIn ||
      this.authService.isNormalAdminLoggedIn ||
      this.authService.isOwnerLoggedIn ||
      this.authService.isDeveloperLoggedIn;

    if (!hasAccess) return;
    this.router.navigate(['/menuview/order', order.orderID]);
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {

      const orderDate = new Date(order.orderDate);

      const start = this.startDate
        ? new Date(this.startDate)
        : null;

      const end = this.endDate
        ? new Date(this.endDate)
        : null;

      // include the entire end day
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      const afterStart = start ? orderDate >= start : true;
      const beforeEnd = end ? orderDate <= end : true;

      const matchesOrderId =
        this.orderIdSearch != null
          ? order.orderID === this.orderIdSearch
          : true;

      const matchesCustomerId =
        this.customerIdSearch != null
          ? order.customerID === this.customerIdSearch
          : true;

      const matchesOrderType =
        this.orderTypeSearch
          ? order.orderPosition === this.orderTypeSearch
          : true;

      return (
        afterStart &&
        beforeEnd &&
        matchesOrderId &&
        matchesCustomerId &&
        matchesOrderType
      );
    });

    this.currentPage = 0;
    this.updatePagedOrders();
  }

  // Open order details
  openDetails(order: Order) {
    this.dialog.open(OrderDetailsDialog, {
      width: '600px',
      data: order,
      direction: document.documentElement.dir as 'rtl' | 'ltr'
    });
  }

  // Open customer details
  openCustomerDetails(customerId: number) {
    this.dialog.open(CustomerDetailsDialog, {
      width: '400px',
      data: customerId,
      direction: document.documentElement.dir as 'rtl' | 'ltr'
    });
  }

  // Handle paginator change
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedOrders();
  }

  // Update paged orders based on current page and page size
  updatePagedOrders() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedOrders = this.filteredOrders.slice(start, end);
  }

  // Initial filtered orders
  updateFilteredOrders() {
    this.filteredOrders = [...this.orders];
    this.currentPage = 0;
    this.updatePagedOrders();
  }
  viewComment(comment: string) {
    Swal.fire({
      title: '📝 Order Comment',
      html: `
      <div style="
        text-align:left;
        max-height:350px;
        overflow-y:auto;
        padding:10px;
        border-radius:8px;
        background:#f8f9fa;
      ">
        ${comment || '<i>No comment</i>'}
      </div>
    `,
      width: '650px',
      confirmButtonText: 'Close'
    });
  }

}