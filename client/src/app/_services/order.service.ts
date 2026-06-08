import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { Order } from '../_models/order';
import { Table } from '../_models/table';
import { Orderfordelivery } from '../_models/orderfordelivery';
import { CreateOrderResponse } from '../_models/create-order-response';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  // addOrder(order: Order, orderForDeliveryDTO?: Orderfordelivery) {
  //   return this.http.post(this.baseUrl + 'order', {
  //     order: order,
  //     orderForDeliveryDTO: orderForDeliveryDTO || null
  //   });
  // }

addOrder(order: Order, orderForDeliveryDTO?: Orderfordelivery) {
  return this.http.post<CreateOrderResponse>(
    this.baseUrl + 'order',
    {
      order,
      orderForDeliveryDTO: orderForDeliveryDTO || null
    }
  );
}
  assignDriverForOrder(orderId: number, driverId: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}order/assignDriverForOrder/${orderId}/${driverId}`,
      {} // PUT requires a body; empty object is fine if backend doesn't need one
    );
  }
  closeOrder(orderID: number) {
    return this.http.put(
      `${this.baseUrl}order/closeorder/${orderID}`,
      {}
    );
  }

  // Delete a delivery by ID
  deleteOrderForDelivery(id: number , deleteOrder :boolean): Observable<void> {
    return this.http.delete<void>(this.baseUrl + `order/deleteOrderForDelivery/${id}/${deleteOrder}`);
  }

  getOpenOrderByTable(tableNo: number) {
    return this.http.get<Order>(this.baseUrl + `order/open-for-table/${tableNo}`);
  }

 getBranchProfit(branchId: number, from: string, to: string): Observable<number> {
    let params = new HttpParams()
      .set('branchId', branchId)
      .set('from', from)
      .set('to', to);

          return this.http.get<number>(this.baseUrl + `order/branch-profit`,{ params });
  }

  // 🔵 All branches profit
  getAllBranchesProfit(from: string, to: string): Observable<any[]> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to);

    return this.http.get<any[]>(this.baseUrl + `order/all-branches-profit`,{ params });
  }


  // Get all orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl + 'order/getorders');
  }

  // Get all orders of client
  getOrdersofclient(id: number): Observable<Order[]> {
    return this.http.get<Order[]>(
      this.baseUrl + 'order/getorderofclient/' + id
    );
  }


  getOrdersOfBranch(id: number): Observable<Order[]> {
    return this.http.get<Order[]>(
      this.baseUrl + 'order/getOrdersOfBranch/' + id
    );
  }

  // Get order by ID
  getOrderById(orderID: number): Observable<Order> {
    return this.http.get<Order>(this.baseUrl + 'order/' + orderID);
  }

  getAllOrdersForDeliveryForDriver(driverId: number): Observable<Orderfordelivery[]> {
    return this.http.get<Orderfordelivery[]>(
      `${this.baseUrl}order/getAllOrdersForDeliveryForDriver/${driverId}`
    );
  }

  getAllOrdersForDeliveries(): Observable<Orderfordelivery[]> {
    return this.http.get<Orderfordelivery[]>(this.baseUrl + 'order/getAllOrdersForDeliveries');
  }

  getBranchOrderForDeliveries(id: number): Observable<Orderfordelivery[]> {
    return this.http.get<Orderfordelivery[]>(
      `${this.baseUrl}order/getBranchOrderForDeliveries/${id}`
    );
  }

  markorderAsDelivered(orderId: number) {
    return this.http.put(
      `${this.baseUrl}order/markorderAsDelivered/${orderId}`,
      {}
    );
  }

  orderbefore(id: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}order/getorderofclient/${id}`
    );
  }

  // Delete order
  removeOrder(orderID: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'order/' + orderID);
  }

  // Update existing order
  updateOrder(orderID: number, order: Order, selectedTable: Table): Observable<Order> {

    if (selectedTable) {
      order.tableNo = selectedTable.tableNo; // assign the selected table to the order
    }

    return this.http.put<Order>(this.baseUrl + 'order/' + orderID, order);
  }
}
