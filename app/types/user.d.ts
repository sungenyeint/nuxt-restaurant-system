export type Role = "admin" | "chef" | "waiter" | "cashier";

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}
