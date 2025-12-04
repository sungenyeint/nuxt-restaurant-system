import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

// stores/pos.ts
export const usePosStore = defineStore("pos", {
  state: () => ({
    currentOrder: {
      tableId: null as string | null,
      orderType: "dine-in" as "dine-in" | "takeaway",
      items: [] as Array<{
        itemId: string;
        name: string;
        price: number;
        qty: number;
      }>,
      notes: "",
    },
    categories: [] as Array<any>,
    menus: [] as Array<any>,
    tables: [] as Array<any>,
    orders: [] as Array<any>,
    activeOrders: [] as Array<any>,
    selectedTable: null as any,
    editingOrderId: null as string | null,
  }),

  getters: {
    cartTotal: (state) => {
      return state.currentOrder.items.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );
    },
    cartItemCount: (state) => {
      return state.currentOrder.items.reduce(
        (count, item) => count + item.qty,
        0
      );
    },
  },

  actions: {
    async loadInitialData() {
      await Promise.all([
        this.fetchCategories(),
        this.fetchMenus(),
        this.fetchTables(),
        this.fetchOrders(),
      ]);
    },

    async fetchCategories() {
      const api = useRuntimeConfig().public.apiBase;
      const data: any = await $fetch(`${api}/categories`);
      this.categories = data;
    },

    async fetchMenus() {
      const api = useRuntimeConfig().public.apiBase;
      const auth = useAuthStore();
      const data: any = await $fetch(`${api}/menus`, {
        headers: { ...auth.authHeader() },
      });
      this.menus = data;
    },

    async fetchTables() {
      const api = useRuntimeConfig().public.apiBase;
      const data: any = await $fetch(`${api}/tables`);
      this.tables = data;
    },

    async fetchOrders() {
      const api = useRuntimeConfig().public.apiBase;
      const auth = useAuthStore();
      const orders: any = await $fetch(`${api}/orders`, {
        headers: { ...auth.authHeader() },
      });
      this.activeOrders = orders.filter((o: any) =>
        o.status !== "paid"
      );
      this.orders = orders;
    },

    setOrderType(type: 'dine-in' | 'takeaway') {
      this.currentOrder.orderType = type
      if (type === 'takeaway') {
        this.currentOrder.tableId = null
        this.selectedTable = null
      }
    },

    addToCart(menuItem: any) {
      const existing = this.currentOrder.items.find(
        (item) => item.itemId === (menuItem._id || menuItem.id)
      );
      if (existing) {
        existing.qty += 1;
      } else {
        this.currentOrder.items.push({
          itemId: menuItem._id || menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
        });
      }
    },

    removeFromCart(index: number) {
      this.currentOrder.items.splice(index, 1);
    },

    updateQuantity(index: number, quantity: number) {
      if (quantity <= 0) this.removeFromCart(index);
      else this.currentOrder.items[index].qty = quantity;
    },

    setTable(tableId: string) {
      this.currentOrder.tableId = tableId;
      this.selectedTable =
        this.tables.find((t) => (t._id || t.id) === tableId) || null;
    },

    clearCurrentOrder() {
      this.currentOrder = {
        tableId: null,
        orderType: "dine-in",
        items: [],
        notes: "",
      };
      this.selectedTable = null;
      this.editingOrderId = null;
    },

    async submitOrder() {
      const api = useRuntimeConfig().public.apiBase;
      const auth = useAuthStore();
      const payload = {
        table: this.currentOrder.tableId,
        orderType: this.currentOrder.orderType,
        items: this.currentOrder.items.map((i) => ({ menu: i.itemId, qty: i.qty })),
        total: this.cartTotal,
        notes: this.currentOrder.notes || "",
      };

      const isEditing = !!this.editingOrderId;
      const url = isEditing ? `${api}/orders/${this.editingOrderId}` : `${api}/orders`;
      const method = isEditing ? "PUT" : "POST";

      const order: any = await $fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...auth.authHeader() },
        body: payload,
      });

      this.clearCurrentOrder();
      await this.fetchOrders();
      return order;
    },
    async loadOrder(orderId: string) {
      this.editingOrderId = orderId;
      // Ensure we have fresh active orders
      if (!this.activeOrders?.length) {
        await this.fetchOrders()
      }
      let order = this.activeOrders.find((o: any) => (o._id || o.id) === orderId)

      // If not found, try refreshing once
      if (!order) {
        await this.fetchOrders()
        order = this.activeOrders.find((o: any) => (o._id || o.id) === orderId)
      }
      if (!order) return

      // Map to currentOrder
      this.currentOrder.orderType = order.orderType === 'dine-in' ? 'dine-in' : 'takeaway'
      this.currentOrder.items = (order.items || []).map((it: any) => ({
        itemId: it.menu?._id || it.menu || it.itemId,
        name: it.menu?.name || it.name,
        price: Number(it.menu?.price ?? it.price ?? 0),
        qty: it.qty ?? 1,
      }))
      this.currentOrder.notes = order.notes || ""

      // Table selection for dine-in
      if (this.currentOrder.orderType === 'dine-in') {
        const tableId = order.table?._id || order.table
        if (tableId) this.setTable(tableId)
      } else {
        this.currentOrder.tableId = null
        this.selectedTable = null
      }
    },
  },
});
