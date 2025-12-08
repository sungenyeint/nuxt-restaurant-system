export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "paid";

export interface OrderItem {
  menu?: {
    id: string;
    name: string;
    price: number;
  };
  qty: number;
}

export interface Order {
  id: string;
  table?: Table;     // link to table type
  orderType: "dine-in" | "takeaway";
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}
