import { defineStore } from "pinia";

export const useNotifyStore = defineStore("notify", {
  state: () => ({
    chefNewOrders: 0,
    chefFinishedOrders: 0,
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
  },
});
