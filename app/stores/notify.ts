import { defineStore } from "pinia";
import waiter from "~/middleware/waiter";

export const useNotifyStore = defineStore("notify", {
  state: () => ({
    // notifications counters per role
    waiterCount: 0,
    chefCount: 0,
    cashierCount: 0,
    adminCount: 0,
    waiterLastId: [] as string[],
    chefLastId: [] as string[],
    cashierLastId: [] as string[],
    adminLastId: [] as string[],
    // whether to show/receive notifications (admin can toggle)
    enabled: true,
  }),
  actions: {
    sendChef(n = 1) {
      this.chefCount += n;
    },
    clearChef() {
      this.chefCount = 0;
    },
    sendWaiter(n = 1) {
      this.waiterCount += n;
    },
    clearWaiter() {
      this.waiterCount = 0;
    },
    sendCashier(n = 1) {
      this.cashierCount += n;
    },
    clearCashier() {
      this.cashierCount = 0;
    },
    sendAdmin(n = 1) {
      this.adminCount += n;
    },
    clearAdmin() {
      this.adminCount = 0;
    },
    setWaiterLastId(id: string) {
      if (!this.waiterLastId.includes(id)) {
        this.waiterLastId.unshift(id);   // push to beginning
        this.waiterLastId = this.waiterLastId.slice(0, 50); // keep last 50
      }
    },
    setChefLastId(id: string) {
      if (!this.chefLastId.includes(id)) {
        this.chefLastId.unshift(id);   // push to beginning
        this.chefLastId = this.chefLastId.slice(0, 50); // keep last 50
      }
    },
    setCashierLastId(id: string) {
      if (!this.cashierLastId.includes(id)) {
        this.cashierLastId.unshift(id);   // push to beginning
        this.cashierLastId = this.cashierLastId.slice(0, 50); // keep last 50
      }
    },
    setAdminLastId(id: string) {
      if (!this.adminLastId.includes(id)) {
        this.adminLastId.unshift(id);   // push to beginning
        this.adminLastId = this.adminLastId.slice(0, 50); // keep last 50
      }
    },
    removeWaiterLastId(id: string) {
      this.waiterLastId = this.waiterLastId.filter((i) => i !== id);
    },
    removeChefLastId(id: string) {
      this.chefLastId = this.chefLastId.filter((i) => i !== id);
    },
    removeCashierLastId(id: string) {
      this.cashierLastId = this.cashierLastId.filter((i) => i !== id);
    },
    removeAdminLastId(id: string) {
      this.adminLastId = this.adminLastId.filter((i) => i !== id);
    },
    setEnabled(val: boolean) {
      this.enabled = !!val;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('notify_enabled', JSON.stringify(this.enabled));
        }
      } catch (e) {
        // ignore
      }
    },
    toggleEnabled() {
      this.setEnabled(!this.enabled);
    },
    loadEnabled() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const v = localStorage.getItem('notify_enabled');
          if (v !== null) this.enabled = JSON.parse(v);
        }
      } catch (e) {
        // ignore
      }
    },
  },
});
