import { defineStore } from "pinia";

export const useNotifyStore = defineStore("notify", {
  state: () => ({
    chefNewOrders: 0,
    chefFinishedOrders: 0,
    // whether to show/receive notifications (admin can toggle)
    enabled: true,
  }),
  actions: {
    incChef(n = 1) {
      this.chefNewOrders += n;
    },
    clearChef() {
      this.chefNewOrders = 0;
    },
    incFinished(n = 1) {
      this.chefFinishedOrders += n;
    },
    clearFinished() {
      this.chefFinishedOrders = 0;
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
