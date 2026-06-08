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

@Component({
  selector: 'app-orderlist',
  standalone: true,
  imports: [
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
    MatPaginatorModule ,
    TranslateModule
  ],
  templateUrl: './orderlist.html',
  styleUrls: ['./orderlist.scss']
})
export class Orderlist implements OnInit {

  // Date filters
  startDate: Date | null = null;
  endDate: Date | null = null;
  customerIdSearch: number | null = null;

  orderIdSearch: number | null = null;

  // Orders
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Pagination
  pageSize = 10;
  currentPage = 0;
  pagedOrders: Order[] = [];

  // Table columns
  displayedColumns: string[] = [];

  constructor(
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

  // Edit order
  editorder(order: Order) {
    if (!order.orderID) return;
    this.router.navigate(['/menuview/order', order.orderID]);
  }

  // Update filterOrders to include orderID search
  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      // Date filter
      const orderDate = new Date(order.orderDate);
      const afterStart = this.startDate ? orderDate >= this.startDate : true;
      const beforeEnd = this.endDate ? orderDate <= this.endDate : true;

      // OrderID search filter
      const matchesOrderId = this.orderIdSearch ? order.orderID === this.orderIdSearch : true;

      const matchesCustomerId =
        this.customerIdSearch != null
          ? order.customerID === this.customerIdSearch
          : true;

      return afterStart &&
        beforeEnd &&
        matchesOrderId &&
        matchesCustomerId;
    });

    this.currentPage = 0;
    this.updatePagedOrders();
  }

  // Open order details
  openDetails(order: Order) {
    this.dialog.open(OrderDetailsDialog, {
      width: '600px',
      data: order ,
        direction: document.documentElement.dir as 'rtl' | 'ltr'
    });
  }

  // Open customer details
  openCustomerDetails(customerId: number) {
    this.dialog.open(CustomerDetailsDialog, {
      width: '400px',
      data: customerId ,
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