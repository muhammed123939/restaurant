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
import { Order } from 'src/app/_models/order';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-for-delivery-list',
  standalone: true,
  imports: [
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

  searchText: string = '';
  Orderfordelivery: Orderfordelivery[] = []; // should be array
  displayedColumns: string[] = [];

  constructor(
    private authService: AuthService,
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

  get filteredDeliveries(): Orderfordelivery[] {
    if (!this.Orderfordelivery) return [];

    let data = this.Orderfordelivery;

    if (this.searchText) {
      const text = this.searchText.toLowerCase();

      data = data.filter(d => {
        const orderIdMatch = d.order?.orderID?.toString().includes(text);
        const customerMatch = d.order?.customerID?.toString().includes(text);
        const statusMatch = d.status?.toLowerCase().includes(text) || false;

        return orderIdMatch || customerMatch || statusMatch;
      });
    }

    // 🔥 SORT (reverse = newest first)
    return data.sort((a, b) =>
      new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );
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
    });
  }

  loadAllOrdersforDelivery() {
    this.orderService.getAllOrdersForDeliveries().subscribe(res => {
      this.Orderfordelivery = res;
    });
  }

  loadBranchOrdersforDelivery(id: number) {
    this.orderService.getBranchOrderForDeliveries(this.employeeService.currentEmployee()?.branchID!).subscribe(res => {
      this.Orderfordelivery = res;
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

