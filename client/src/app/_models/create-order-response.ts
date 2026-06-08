export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  orderNumber: string;
  date: string;
  items: ReceiptItem[];
  subTotal: number;
  tax: number;
  total: number;
}

export interface CreateOrderResponse {
  orderId: number;
  receipt: Receipt;
}