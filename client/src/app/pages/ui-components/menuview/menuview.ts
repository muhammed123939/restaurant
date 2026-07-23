import { CartDialogComponent } from '../cart-dialog/cart-dialog';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MenuService } from '../../../_services/menu.service';
import { BranchService } from '../../../_services/branch.service';
import { ClientService } from 'src/app/_services/client.service';
import { Branch } from '../../../_models/branch';
import { Menu } from 'src/app/_models/menu';
import { MatDialog } from '@angular/material/dialog';
import { AddressDialogComponent } from '../address-dialog/address-dialog';
import { AddComment } from '../add-comment/add-comment';
import { TableDialog } from '../table-dialog/table-dialog';
import { OrderService } from 'src/app/_services/order.service';
import { Order } from 'src/app/_models/order';
import { Table } from 'src/app/_models/table';
import { Orderfordelivery } from 'src/app/_models/orderfordelivery';
import { AuthService } from 'src/app/_services/auth.service';
import { TranslateModule } from '@ngx-translate/core';



interface Category {
  id: number;
  name: string;
  menuItems: Menu[];
}

@Component({
  selector: 'app-menuview',
  standalone: true,
  imports: [TranslateModule ,
    RouterModule,
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './menuview.html',
  styleUrls: ['./menuview.scss']
})
export class MenuviewComponent implements OnInit {

  /** ================= TABLE ================= */
  baseColumns: string[] = ['product', 'sell_price', 'actions']; // always visible
  adminColumns: string[] = ['buy_price', 'quantity'];           // only admin
  displayedColumns: string[] = [];
  dataSource: Menu[] = [];

  /** ================= FILTER DATA ================= */
  branches: Branch[] = [];
  branchID!: number;
  categories: Category[] = [];
  selectedCategoryId: number | 'all' = 'all';
  searchText: string = '';
  order: Order;
  orderbyadmin: Order;
  orderforclientid: number;

  /** ================= CART ================= */
  cart: { itemId: number, name: string, price: number, quantity: number }[] = [];
  selectedItem: Menu | null = null;
  selectedQty: number = 1;

  /** ================= EDIT ORDER ================= */
  isEditMode: boolean = false;
  editingOrderId!: number;
  orderId!: number;
  ordercomment: string;
  selectedTable!: Table;
  orderfordelivery!: Orderfordelivery;
   itemSelectedId: number | null = null;

  constructor(
    private menuService: MenuService,
    private branchService: BranchService,
    public authService: AuthService,
    public clientService: ClientService,
    public orderService: OrderService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /** ================= INIT ================= */
  ngOnInit(): void {

 const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.itemSelectedId = +id;
    }

    this.branchService.getall().subscribe({
      next: (data: Branch[]) => {
        this.branches = data;

        if (this.branches.length === 1) {
          const branchId = this.branches[0].branchID;
          // لو عندك متغير branchID في الكومبوننت
          this.branchID = branchId;

          // تحميل المنيو مباشرة
          this.onBranchSelect();
        }
      },
      error: err => console.error('Branches load error:', err)
    });
    
this.route.url.subscribe(segments => {
  if (segments.length >= 3) {
    const type = segments[1].path;
    const id = +segments[2].path;

    if (type === 'Client') {
      this.orderforclientid = id;
    }
  }
});

if (
  (this.authService.isDeveloperLoggedIn || this.authService.isOwnerLoggedIn)
  && !this.orderforclientid
)
{
    this.branchService.getall().subscribe({
      next: (data: Branch[]) => {
        this.branches = data;

        if (this.branches.length === 1) {
          const branchId = this.branches[0].branchID;
          // لو عندك متغير branchID في الكومبوننت
          this.branchID = branchId;

          // تحميل المنيو مباشرة
          this.onBranchSelect();
        }
      },
      error: err => console.error('Branches load error:', err)
    });
    
}
else{
  const dataEmployee = localStorage.getItem('employeeLoginStorage');
  const dataClient = localStorage.getItem('clientLoginStorage');
const client = dataClient ? JSON.parse(dataClient) : null;
const employee = dataEmployee ? JSON.parse(dataEmployee) : null;

if(employee){
 this.branchID = employee?.branchID;
}

else if (employee && this.orderforclientid) {

  this.branchID = employee.branchID;

this.clientService.getuserbyid(this.orderforclientid)
  .subscribe(user => {
    if (user.branchID != null) {
      this.branchID = user.branchID;
    }
  });
}

else if(client){
   this.branchID = client?.branchID;
   
 
   if (this.itemSelectedId) {
  this.menuService.getItembyid(this.itemSelectedId, this.branchID).subscribe({
    next: (item) => {

      this.cart.push({
        itemId: item.menuItemID,
        name : item.name,
        price : item.sell_price,      // or item.sell_price depending on your model
        quantity: 1
      });

    },
    error: (err) => console.error(err)
  });
}

}
           this.onBranchSelect();
           
}
    this.displayedColumns = [...this.baseColumns];

    if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isOwnerLoggedIn || this.authService.isDeveloperLoggedIn) {
      this.displayedColumns.push(...this.adminColumns);
    }

    this.route.url.subscribe(segments => {
      if (segments.length >= 3) {
        const type = segments[1].path;
        const id = +segments[2].path;

        if (type === 'order') {
          this.orderId = id;
          this.isEditMode = true;
          this.editingOrderId = id;
          this.loadOrder(id);
        }

        else if (type === 'Client') {
          this.orderforclientid = id;
           this.orderfordelivery = {
      ordersForDeliveryId: 0,

      comment: '',
      status: 'Pending',

      assignedAt: new Date(),
      deliveredAt: null,

      order: undefined,
      employee: undefined,

      deliveryAddress: {
        addressID:  0,
        street:0 ,
        city: '',
        building: 0,
        floor: 0,
        appartment: 0,
        details: ''
      }
    };

                      this.openAddressDialog();

        }

        else if (type === 'table') {
          const TableNo = id;

          // Call service to check if there is an open order for this table
          this.orderService.getOpenOrderByTable(TableNo).subscribe({
            next: (existingOrder) => {
              if (existingOrder) {
                // Case 1: There is an existing open order → edit it
                this.orderId = existingOrder.orderID;
                this.isEditMode = true;
                this.editingOrderId = existingOrder.orderID;
                this.loadOrder(existingOrder.orderID);
              } else {
                // Case 2: No open order → create a new in-memory order for this table
                this.order = {
                  orderID: 0,
                  orderDate: new Date().toISOString(),
                  tableNo: TableNo,
                  branchID: this.branchID,       // you may set default branch if needed
                  orderPosition: 'in-restaurant',
                  status: 'Open',                // always open when table selected
                  orderDetails: []               // empty cart initially
                };
                this.cart = [];
                this.isEditMode = false;
              }
            },
            error: (err) => console.error('Error checking table orders:', err)
          });
        }
      }
    });
  }

  /** ================= CATEGORY FILTER ================= */
  applyCategoryFilter(): void {
    const filteredCategories =
      this.selectedCategoryId === 'all'
        ? this.categories
        : this.categories.filter(c => c.id === this.selectedCategoryId);

    this.dataSource = filteredCategories.flatMap(category =>
      category.menuItems.filter(item =>
        this.authService.isClientLoggedIn || (item.quantity ?? 0) > 0
      )
    );
  }

  addToCart(): void {
    if (!this.selectedItem || this.selectedQty < 1) return;

    const existingItem = this.cart.find(c => c.itemId === this.selectedItem!.menuItemID);
    if (existingItem) existingItem.quantity += this.selectedQty;
    else this.cart.push({
      itemId: this.selectedItem.menuItemID!,
      name: this.selectedItem.name!,
      price: this.selectedItem.sell_price!,
      quantity: this.selectedQty
    });

    this.selectedItem = null;
    this.selectedQty = 1;
  }

  checkout(): void {
    // 1️⃣ Block only if NOT logged in
    if (!this.authService.isAdminwithPermissionLoggedIn &&
      !this.authService.isNormalAdminLoggedIn &&
      !this.authService.isOwnerLoggedIn &&
      !this.authService.isDeveloperLoggedIn &&
      !this.authService.isClientLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to proceed to checkout.'
      });
      return;
    }


    // 2️⃣ Determine client ID
    const clientId = this.authService.isClientLoggedIn ? this.clientService.currentClient()?.id : this.orderforclientid;

    
    // 3️⃣ If a client ID exists, check address
    if (clientId) {
      this.clientService.getAddressStatus(clientId).subscribe({
        next: (hasAddress: boolean) => {
          if (hasAddress) {
            this.completeCheckout();
          } else {
            this.openAddressDialog(clientId);
          
          }
        },
        error: err => console.error('Error checking address status', err)
      });
    } else {
      // 4️⃣ Admins / owners / developers can proceed directly
      this.completeCheckout();
    }
  }

  private completeCheckout(): void {
    const now = new Date();
    const orderDate =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    // Determine customer ID and address
    if (this.authService.isClientLoggedIn || this.orderforclientid) {
      const client = this.clientService.currentClient();
      if (!client && !this.orderforclientid) return console.error('No logged-in client found');

      if (client) {
        // Get address for clients
        this.clientService.getClientAddressId(client.id).subscribe({
          next: (addressID: number) => {
            this.createOrUpdateOrder(orderDate, addressID, client.id);
          },
          error: err => console.error('Error getting client address ID', err)
        });
      }
      else if (this.orderforclientid) {
        this.clientService.getClientAddressId(this.orderforclientid).subscribe({
          next: (addressID: number) => {
            this.createOrUpdateOrder(orderDate, addressID, this.orderforclientid);
          },
          error: err => console.error('Error getting client address ID', err)
        });
      }
    }
    else if (this.authService.isAdminwithPermissionLoggedIn || this.authService.isNormalAdminLoggedIn ||
      this.authService.isDeveloperLoggedIn || this.authService.isOwnerLoggedIn && !this.orderforclientid) {

      // Admin doesn't need an address
      if (this.orderId) {
        this.createOrUpdateOrder(orderDate, this.orderbyadmin.addressID!, this.orderbyadmin.customerID);
      }

      else if (this.selectedTable) {
        const tableNo = this.selectedTable.tableNo;

        // Create or update order for this table
        this.createOrUpdateOrder(
          orderDate,
          undefined,      // addressID: not needed for in-restaurant
          undefined,      // customerID: not needed, admin order
          tableNo         // tableID: important
        );
      }

      else {
        this.createOrUpdateOrder(orderDate);
      }

    }
  }

  /** Helper function to handle both create and update orders */
  private createOrUpdateOrder(orderDate: string, addressID?: number, customerID?: number, tableNo?: number): void {

    let orderPosition: string = '';


if (addressID) {

  orderPosition = 'Delivery';

  if (!this.orderfordelivery) {
    this.orderfordelivery = {
      ordersForDeliveryId: 0,

      comment: '',
      status: 'Pending',

      assignedAt: new Date(),
      deliveredAt: null,

      order: undefined,
      employee: undefined,

      deliveryAddress: {
        addressID: addressID ?? 0,
        street:0 ,
        city: '',
        building: 0,
        floor: 0,
        appartment: 0,
        details: ''
      }
    };
  }
}

    else if (!addressID && !tableNo) {
      orderPosition = 'take-away';
      // 🔥 مهم جداً
      this.orderfordelivery = null!;
    } else if (tableNo) {
      orderPosition = 'in-restaurant';
      // 🔥 مهم جداً
      this.orderfordelivery = null!;
    }

    this.order = {
      orderID: this.isEditMode ? this.editingOrderId : 0,
      comment: this.ordercomment,
      customerID: customerID,
      tableNo: tableNo,
      status: tableNo ? "open" : null,
      branchID: this.branchID,
      addressID: addressID,
      orderDate: orderDate,
      totalAmount: this.getCartTotal(),
      orderPosition: orderPosition,
      orderDetails: this.cart.map(item => ({
        orderDetailID: 0,
        name: item.name,
        orderID: this.isEditMode ? this.editingOrderId : 0,
        menuItemID: item.itemId.toString(),
        quantity: item.quantity,
        price: item.price
      }))
    };

if (this.isEditMode) {

  this.orderService.updateOrder(
    this.order.orderID,
    this.order,
    this.selectedTable
  ).subscribe({
    next: (res) => {

      const receipt = res; // 👈 backend returns ReceiptDto

      Swal.fire({
        title: 'Order Updated',
        text: 'Do you want to print the receipt?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Yes, Print',
        cancelButtonText: 'No'
      }).then((result) => {

        if (result.isConfirmed) {

          this.router.navigate(['/ui-components', 'receipt'], {
            state: { receipt }
          });

        } else {
          Swal.fire('Saved', 'Order updated without printing', 'success');
          this.router.navigate(['/menuview']);
        }

      });

      this.cart = [];
      this.isEditMode = false;

    },

    error: err => {
      Swal.fire('Error', 'Failed to update order', 'error');
    }
  });

}
    else {


this.orderService.addOrder(this.order, this.orderfordelivery ?? null)
  .subscribe({
    next: (res) => {

      const receipt = res;

      this.cart = [];

      Swal.fire({
        title: 'Order Created',
        text: 'Do you want to print the receipt?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Yes, Print',
        cancelButtonText: 'No'
      }).then((result) => {

        if (result.isConfirmed) {

          this.router.navigate(['/ui-components', 'receipt'], {
            state: { receipt }
          });

        } else {
          Swal.fire('Saved', 'Order saved without printing', 'success');
        }

      });

    },

    error: () => {
      Swal.fire('Error', 'Failed to place order', 'error');
    }
  });

    }

  }
  

  closeOrder() {
    if (!this.order?.orderID) return;

    Swal.fire({
      title: 'Close Order?',
      text: 'Are you sure you want to close this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, close it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {

        this.orderService.closeOrder(this.order.orderID).subscribe({
          next: (res) => {
            // ✅ Update UI
            this.order.status = 'Closed';

            if (this.selectedTable) {
              this.selectedTable.status = false;
            }
            Swal.fire({
              title: 'Closed!',
              text: 'Order closed successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to close order',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  deleteItem(item: Menu): void {
    if (!item.menuItemID) return;
        const hasAccess =
    this.authService.isOwnerLoggedIn ||
    this.authService.isDeveloperLoggedIn;

  if (!hasAccess) return;


    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${item.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.menuService.delete(item.menuItemID!).subscribe({
          next: () => {
            this.dataSource = this.dataSource.filter(i => i.menuItemID !== item.menuItemID);
            Swal.fire('Deleted!', `${item.name} has been deleted.`, 'success');
          },
          error: () => Swal.fire('Error!', `Failed to delete ${item.name}.`, 'error')
        });
      }
    });
  }

  editItem(item: Menu): void {
    if (!item.menuItemID || !item.branchID) return;
        const hasAccess =
    this.authService.isOwnerLoggedIn ||
    this.authService.isDeveloperLoggedIn;

  if (!hasAccess) return;

    this.router.navigate(['/ui-components', 'edititem', item.menuItemID, item.branchID]);
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  }


  getCartCount(): number {
    return this.cart.reduce((sum, c) => sum + c.quantity, 0);
  }

  /** ================= LOAD ORDER ================= */
  loadOrder(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (order: Order) => {
        this.orderbyadmin = order;
        this.order = order;
        this.branchID = order.branchID;
        this.cart = order.orderDetails!.map(d => ({
          itemId: +d.menuItemID,
          name: d.name,
          price: d.price,
          quantity: d.quantity
        }));
        // load menu for this branch
        this.onBranchSelect();
      },
      error: err => console.error('Error loading order:', err)
    });
  }

  /** ================= ADMIN ================= */
  outofstock(): void {
    if (!this.authService.isAdminwithPermissionLoggedIn && !this.authService.isNormalAdminLoggedIn && !this.authService.isOwnerLoggedIn && !this.authService.isDeveloperLoggedIn) return;
    const filteredCategories =
      this.selectedCategoryId === 'all'
        ? this.categories
        : this.categories.filter(c => c.id === this.selectedCategoryId);

    this.dataSource = filteredCategories.flatMap(category =>
      category.menuItems.filter(item => item.quantity !== undefined && item.quantity < 10)
    );
  }

  /** ================= BRANCH ================= */
  onBranchSelect(): void {
    if (!this.branchID) return;

    this.menuService.getMenuByBranch(this.branchID).subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.applyCategoryFilter();
      },
      error: err => console.error('Menu load error:', err)
    });
  }

  openCommentsDialog() {
    const dialogRef = this.dialog.open(AddComment, {
      width: '450px',
      data: {
        orderComment: this.order?.comment,
        deliveryComment: this.orderfordelivery?.comment,
        hasDelivery: !!this.orderforclientid ||this.authService.isClientLoggedIn  // 🔥 key line
      },
              direction: document.documentElement.dir as 'rtl' | 'ltr'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ordercomment = result.orderComment;

        if (this.orderforclientid||this.authService.isClientLoggedIn) {

          this.orderfordelivery.comment = result.deliveryComment;
        }
      }
    });
  }

private openAddressDialog(clientId?: number): void {
  this.dialog.open(AddressDialogComponent, {
    width: '700px',
    maxWidth: '95vw',
    panelClass: 'talabat-dialog-panel',
    data: clientId ?? this.orderforclientid,
    direction: document.documentElement.dir as 'rtl' | 'ltr'
  });
}
  openTableDialog() {

    // ✅ FIX: make sure order exists
    if (!this.order) {
      this.order = {} as any; // or create properly (better below)
    }

    const dialogRef = this.dialog.open(TableDialog, { width: '600px' , direction: document.documentElement.dir as 'rtl' | 'ltr' });

    dialogRef.afterClosed().subscribe(selectedTable => {
      if (selectedTable) {
        // ✅ Store the full table object
        this.selectedTable = selectedTable;

        // ✅ Assign only the ID to the order
        this.order.tableNo = selectedTable.tableNo;

        // ✅ Mark table as occupied for UI
        this.selectedTable.status = true;

        // ✅ Navigate to menu view for this table
        //         this.router.navigate(['/menuview']);
      }
    });
  }

  /** ================= CART ================= */
  openCartMenu(item: Menu): void {
    this.selectedItem = item;
    this.selectedQty = 1;
  }

  openCart() {
    this.dialog.open(CartDialogComponent, {
      width: '500px',
      data: this.cart ,
              direction: document.documentElement.dir as 'rtl' | 'ltr'
    });
  }

  /** ================= SEARCH ================= */
  searchItems(): void {
    if (!this.branchID) return;
    const filteredCategories =
      this.selectedCategoryId === 'all'
        ? this.categories
        : this.categories.filter(c => c.id === this.selectedCategoryId);

    const allItems = filteredCategories.flatMap(c => c.menuItems);

    this.dataSource = allItems.filter(item =>
      item.name?.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.authService.isClientLoggedIn || (item.quantity ?? 0) > 0)
    );
  }

  
}
