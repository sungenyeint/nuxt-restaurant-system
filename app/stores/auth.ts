import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,
    token: null as string | null,
    isAuthenticated: false,
  }),

  actions: {
    async login(email: string, password: string) {
      const api = useRuntimeConfig().public.apiBase;
      const data: any = await $fetch(`${api}/auth/login`, {
        method: "POST",
        body: { email, password },
      });
      this.user = data.user;
      this.token = data.token;
      this.isAuthenticated = true;
      const tokenCookie = useCookie<string | null>("auth_token", {
        sameSite: "lax",
      });
      tokenCookie.value = this.token;
    },

    hydrateFromCookie() {
      const tokenCookie = useCookie<string | null>("auth_token");
      this.token = tokenCookie.value;
      this.isAuthenticated = !!this.token;
    },

    authHeader(): Record<string, string> {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },

    logout() {
      this.user = null as any;
      this.token = null;
      this.isAuthenticated = false;
      const tokenCookie = useCookie<string | null>("auth_token");
      tokenCookie.value = null;
    },
  },
});
