import { CustomerAddress } from "./customer-address";
import { Order } from "./order";
import { UserData } from "./user-data";

export interface Orderfordelivery {
  ordersForDeliveryId: number;

  comment?: string;
  status: string;

  assignedAt: Date;
  deliveredAt?: Date | null;

  order?: Order;
  employee?: UserData;
  deliveryAddress?: CustomerAddress;
}