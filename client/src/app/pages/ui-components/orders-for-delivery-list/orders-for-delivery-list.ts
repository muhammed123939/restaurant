import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ClientService } from 'src/app/_services/client.service';
import { OrderService } from 'src/app/_services/order.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { EmployeeService } from 'src/app/_services/employee.service';
import { Orderfordelivery } from 'src/app/_models/orderfordelivery';
import { DriversDialog } from '../drivers-dialog/drivers-dialog';
import { NgIf } from '@angular/common';
import { AuthService } from 'src/app/_services/auth.service';
import { CustomerAddress } from 'src/app/_models/customer-address';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-for-delivery-list',
  standalone: true,
  imports: [MatSelectModule , 
     MatDatepickerModule,
  MatNativeDateModule,
  MatPaginatorModule,
    FormsModule, CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatListModule, TranslateModule,
    NgIf
  ], templateUrl: './orders-for-delivery-list.html',
  styleUrl: './orders-for-delivery-list.scss',
})

export class OrdersForDeliveryList implements OnInit {
  statusSearch: string = '';
  filteredDeliveries: Orderfordelivery[] = [];
pageSize = 10;
currentPage = 0;
pagedDeliveries: Orderfordelivery[] = [];
  searchText: string = '';
  Orderfordelivery: Orderfordelivery[] = []; // should be array
  displayedColumns: string[] = [];

  startDate: string = '';
endDate: string = '';

orderIdSearch: number | null = null;
customerIdSearch: number | null = null;

  constructor( public translate: TranslateService ,
    public authService: AuthService,
    public clientService: ClientService,
    private dialog: MatDialog,
    private employeeService: EmployeeService,
    public orderService: OrderService
  ) { }

  ngOnInit(): void {

    this.loadOrdersBasedOnRole();

    if (this.authService.isDriverLoggedIn) {
      this.displayedColumns = [
        'comment',
        'assignedAt',
        'deliveredAt',
        'customer',
        'address',
        'markasdelivered'
      ];
    }

    else if (this.authService.isNormalAdminLoggedIn) {
      this.displayedColumns = [
        'ordersForDeliveryId',
        'orderID',
        'comment',
        'assignedAt',
        'deliveredAt',
        'status',
        'employee',
        'customer',
        'address'
      ];
    }

    else if (this.authService.isAdminwithPermissionLoggedIn) {
      this.displayedColumns = [
        'ordersForDeliveryId',
        'orderID',
        'comment',
        'assignedAt',
        'deliveredAt',
        'status',
        'employee',
        'customer',
        'address',
        'actions'
      ];
    }

    else if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      this.displayedColumns = [
        'ordersForDeliveryId',
        'orderID',
        'comment',
        'branch',
        'assignedAt',
        'deliveredAt',
        'status',
        'employee',
        'customer',
        'address',
        'actions'
      ];
    }
  }

  deleteOrderForDelivery(id: number) {

    Swal.fire({
      title: 'Delete Options',
      text: 'Choose what you want to delete',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,

      confirmButtonText: 'Delete Delivery Only',
      denyButtonText: 'Delete Delivery And Order',

      cancelButtonText: 'Cancel'
    }).then((result) => {

      let deleteOrder = false;

      if (result.isConfirmed) {
        // Delete delivery only
        deleteOrder = false;
      }

      else if (result.isDenied) {
        // Delete delivery + order
        deleteOrder = true;
      }

      else {
        return;
      }

      this.orderService.deleteOrderForDelivery(id, deleteOrder).subscribe({
        next: () => {

          Swal.fire(
            'Deleted!',
            deleteOrder
              ? 'Delivery and Order deleted successfully.'
              : 'Delivery deleted successfully.',
            'success'
          );

          this.loadOrdersBasedOnRole();
        },

        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.error?.message || err.error || 'Something went wrong'
          });

        }
      });

    });

  }
  assignDriver(orderID: number) {
    const dialogRef = this.dialog.open(DriversDialog, {
      width: '400px',
      data: { orderID },
      direction: document.documentElement.dir as 'rtl' | 'ltr'
    });

    dialogRef.afterClosed().subscribe(driverId => {
      if (driverId) {
        this.orderService.assignDriverForOrder(orderID, driverId).subscribe(() => {
          Swal.fire('Success!', 'Driver assigned successfully.', 'success');
          this.loadOrdersBasedOnRole(); // refresh deliveries list
        });
      }
    });
  }

  filterDeliveries(): void {

  this.currentPage = 0;

  this.updatePagedDeliveries();
}



updatePagedDeliveries(): void {

  this.filteredDeliveries = [...this.Orderfordelivery];

  // Search
  if (this.searchText) {
    const text = this.searchText.toLowerCase();

    this.filteredDeliveries = this.filteredDeliveries.filter(d =>
      d.order?.orderID?.toString().includes(text) ||
      d.order?.customerID?.toString().includes(text) ||
      d.status?.toLowerCase().includes(text)
    );
  }

  // Order ID
  if (this.orderIdSearch != null) {
    this.filteredDeliveries = this.filteredDeliveries.filter(
      d => d.order?.orderID === this.orderIdSearch
    );
  }

  // Customer ID
  if (this.customerIdSearch != null) {
    this.filteredDeliveries = this.filteredDeliveries.filter(
      d => d.order?.customerID === this.customerIdSearch
    );
  }

  // Status
  if (this.statusSearch) {
    this.filteredDeliveries = this.filteredDeliveries.filter(
      d => (d.status ?? 'Pending').toLowerCase() === this.statusSearch.toLowerCase()
    );
  }

  // Date Range
  this.filteredDeliveries = this.filteredDeliveries.filter(item => {

    const assignedDate = new Date(item.assignedAt);

    const afterStart = this.startDate
      ? assignedDate >= new Date(this.startDate)
      : true;

    const beforeEnd = this.endDate
      ? assignedDate <= new Date(this.endDate + 'T23:59:59')
      : true;

    return afterStart && beforeEnd;
  });

  // Sort newest first
  this.filteredDeliveries.sort((a, b) =>
    new Date(b.assignedAt).getTime() -
    new Date(a.assignedAt).getTime()
  );

  // Pagination
  const start = this.currentPage * this.pageSize;
  const end = start + this.pageSize;

  this.pagedDeliveries = this.filteredDeliveries.slice(start, end);
}

onPageChange(event: PageEvent): void {

  this.pageSize = event.pageSize;
  this.currentPage = event.pageIndex;

  this.updatePagedDeliveries();
}

  loadOrdersBasedOnRole() {

    if (this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      this.loadAllOrdersforDelivery();
    }
    else if (
      this.authService.isAdminwithPermissionLoggedIn ||
      this.authService.isNormalAdminLoggedIn
    ) {

      this.loadBranchOrdersforDelivery(this.authService.currentEmployee?.branchID);
    }
    else if (this.authService.isDriverLoggedIn) {
      this.loadDriverOrdersforDelivery(this.authService.currentEmployee?.id);
    }
  }
  loadDriverOrdersforDelivery(branchID: number) {
    this.orderService.getAllOrdersForDeliveryForDriver(branchID).subscribe(res => {
      this.Orderfordelivery = res;
      this.currentPage = 0;
this.updatePagedDeliveries();
    });
  }

  loadAllOrdersforDelivery() {
    this.orderService.getAllOrdersForDeliveries().subscribe(res => {
      this.Orderfordelivery = res;
      this.currentPage = 0;
this.updatePagedDeliveries();
    });
  }

  loadBranchOrdersforDelivery(id: number) {
    this.orderService.getBranchOrderForDeliveries(this.employeeService.currentEmployee()?.branchID!).subscribe(res => {
      this.Orderfordelivery = res;
      this.currentPage = 0;
this.updatePagedDeliveries();
    });
  }

  markDelivered(ordersForDeliveryId: number) {
    Swal.fire({
      title: 'Mark as Delivered?',
      text: 'This will complete the delivery.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.orderService.markorderAsDelivered(ordersForDeliveryId).subscribe(() => {
          Swal.fire('Done!', 'Delivery marked as delivered.', 'success');

          this.loadOrdersBasedOnRole();
        });
      }
    });
  }


  swalDriver(orderfordelivery: any) {
    Swal.fire({
      title: '👤 Driver Details',
      html: `
      <div style="
        text-align: left;
        max-height: 350px;
        overflow-y: auto;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        line-height: 1.6;
      ">

        <strong>Name:</strong> ${orderfordelivery?.employee?.name ?? '-'}<br>
        <strong>Phone:</strong> ${orderfordelivery?.employee?.phone ?? '-'}<br>

      </div>
    `,
      width: '650px',
      confirmButtonText: 'Close'
    });
  }



  swalCustomer(orderfordelivery: any) {
    Swal.fire({
      title: '👤 Customer Details',
      html: `
      <div style="
        text-align: left;
        max-height: 350px;
        overflow-y: auto;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        line-height: 1.6;
      ">

        <strong>Name:</strong> ${orderfordelivery?.customer?.name ?? '-'}<br>
        <strong>Phone:</strong> ${orderfordelivery?.customer?.phone ?? '-'}<br>

      </div>
    `,
      width: '650px',
      confirmButtonText: 'Close'
    });
  }

  swalAddress(address: CustomerAddress) {
    Swal.fire({
      title: '📍 Address Details',
      html: `
      <div style="
        text-align: left;
        max-height: 350px;
        overflow-y: auto;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        line-height: 1.6;
      ">

        <strong>Address ID:</strong> ${address.addressID}<br>
        <strong>Street:</strong> ${address.street}<br>
        <strong>City:</strong> ${address.city}<br>
        <strong>Building:</strong> ${address.building}<br>
        <strong>Floor:</strong> ${address.floor}<br>
        <strong>Apartment:</strong> ${address.appartment}<br>
        <strong>Details:</strong> ${address.details ?? '-'}<br>

      </div>
    `,
      width: '650px',
      confirmButtonText: 'Close'
    });
  }

exportDeliveriesPdf() {

  const doc = new jsPDF('landscape');

  const L = {
    title: this.translate.instant('DELIVERIES.TITLE'),
    generated: this.translate.instant('REPORT.GENERATED'),
    totalRecords: this.translate.instant('REPORT.TOTAL_RECORDS'),

    orderId: this.translate.instant('ORDERS.ORDER_ID'),
    customerId: this.translate.instant('ORDERS.CUSTOMER_ID'),
    customer: this.translate.instant('DELIVERIES.CUSTOMER'),
    guest: this.translate.instant('ORDERS.GUEST'),
    driver: this.translate.instant('DELIVERIES.DRIVER'),
    status: this.translate.instant('DELIVERIES.STATUS'),
    date: this.translate.instant('ORDERS.DATE'),
    deliveredAt: this.translate.instant('DELIVERIES.DELIVERED'),
    branch: this.translate.instant('DELIVERIES.BRANCH'),

    startDate: this.translate.instant('ORDERS.START_DATE'),
    endDate: this.translate.instant('ORDERS.END_DATE'),

    pending: this.translate.instant('DELIVERIES.PENDING'),
    outForDelivery: this.translate.instant('DELIVERIES.OutForDelivery'),
    delivered: this.translate.instant('DELIVERIES.DELIVERED'),

    page: this.translate.instant('COMMON.PAGE'),

    fileName: this.translate.currentLang === 'ar'
      ? 'تقرير_طلبات_التوصيل'
      : 'Delivery_Report'
  };


  doc.setFontSize(18);
  doc.setTextColor(255, 90, 0);
  doc.text(L.title, 14, 15);


  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);


  doc.text(
    `${L.generated}: ${new Date().toLocaleString()}`,
    14,
    23
  );


  doc.text(
    `${L.totalRecords}: ${this.filteredDeliveries.length}`,
    14,
    30
  );


  let y = 38;


  if (this.orderIdSearch) {
    doc.text(`${L.orderId}: ${this.orderIdSearch}`, 14, y);
    y += 6;
  }


  if (this.customerIdSearch) {
    doc.text(`${L.customerId}: ${this.customerIdSearch}`, 14, y);
    y += 6;
  }


  if (this.statusSearch) {

    const status =
      this.statusSearch === 'OutForDelivery'
        ? L.outForDelivery
        : this.statusSearch === 'DELIVERED'
        ? L.delivered
        : this.statusSearch === 'PENDING'
        ? L.pending
        : this.statusSearch;


    doc.text(`${L.status}: ${status}`, 14, y);
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


  autoTable(doc, {

    startY: y + 5,

    head: [[
      '#',
      L.orderId,
      L.customer,
      L.driver,
      L.status,
      L.date,
      L.deliveredAt,
      L.branch
    ]],


    body: this.filteredDeliveries.map((d, index) => {

      let status = L.pending;

      switch (d.status) {

        case 'OutForDelivery':
          status = L.outForDelivery;
          break;

        case 'DELIVERED':
        case 'Delivered':
          status = L.delivered;
          break;

        case 'PENDING':
        case 'Pending':
          status = L.pending;
          break;

        default:
          status = d.status ?? '-';
      }


      return [
        index + 1,
        d.order?.orderID ?? '-',
        d.order?.customerID ?? L.guest,
        d.employee?.name ?? '-',
        status,
        d.assignedAt
          ? new Date(d.assignedAt).toLocaleString()
          : '-',
        d.deliveredAt
          ? new Date(d.deliveredAt).toLocaleString()
          : '-',
        d.order?.branchName ?? '-'
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
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },


    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },


    didDrawPage: () => {

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(9);

      doc.text(
        `${L.page} ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth - 30,
        pageHeight - 10
      );

    }

  });


  const today = new Date().toISOString().slice(0, 10);

  doc.save(`${L.fileName}_${today}.pdf`);

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
        b ackground:#f8f9fa;
      ">
        ${comment || '<i>No comment</i>'}
      </div>
    `,
      width: '650px',
      confirmButtonText: 'Close'
    });
  }

}

