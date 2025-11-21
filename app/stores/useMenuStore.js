import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

export const useMenuStore = defineStore("menu", {
  state: () => ({ items: [] }),
  actions: {
    async fetch() {
      const api = useRuntimeConfig().public.apiBase;
      const auth = useAuthStore();
      const data = await $fetch(`${api}/menus`, {
        headers: { ...auth.authHeader() },
      });
      this.items = Array.isArray(data) ? data : [];
    },
  },
});
