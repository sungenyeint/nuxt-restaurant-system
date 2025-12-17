import { defineStore } from "pinia";

export const useTableStore = defineStore("table", {
  state: () => ({
    items: [] as any[],
    loading: false, // for fetching menus
    submitting: false, // for create/update
  }),

  actions: {
    async fetch() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        this.items = await $api("/tables");
      } finally {
        this.loading = false;
      }
    },

    async create(fd: any) {
      this.submitting = true;
      try {
        const { $api } = useNuxtApp();
        await $api("/tables", { method: "POST", body: fd });
        await this.fetch();
      } finally {
        this.submitting = false;
      }
    },

    async update(id: string, fd: any) {
      this.submitting = true;
      try {
        const { $api } = useNuxtApp();
        await $api(`/tables/${id}`, { method: "PUT", body: fd });
        await this.fetch();
      } finally {
        this.submitting = false;
      }
    },

    async remove(id: string) {
      const { $api } = useNuxtApp();
      await $api(`/tables/${id}`, { method: "DELETE" });
      await this.fetch();
    },
  },
});
