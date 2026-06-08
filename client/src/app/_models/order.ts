
export interface Orderfordelivery {
  status?: string;
}
export interface OrderDetail {
    orderDetailID: number,
    name: string,
    orderID: number,
    menuItemID: string,
    quantity: number;
    price: number

}

export interface Order {
    orderID: number,
    tableNo?: number,
    status?: string | null,
    comment?: string,
    orderPosition: string,
    customerID?: number,
    branchID: number,
    branchName ? :string 
    addressID?: number,
    orderDate: string,
    totalAmount?: number,
    orderDetails?: OrderDetail[]
    orderfordelivery?: Orderfordelivery
}
