import { defineStore } from "pinia";

export const useCategoryStore = defineStore("category", {
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
        this.items = await $api("/categories");
      } finally {
        this.loading = false;
      }
    },

    async create(fd: any) {
      this.submitting = true;
      try {
        const { $api } = useNuxtApp();
        await $api("/categories", { method: "POST", body: fd });
        await this.fetch();
      } finally {
        this.submitting = false;
      }
    },

    async update(id: string, fd: any) {
      this.submitting = true;
      try {
        const { $api } = useNuxtApp();
        await $api(`/categories/${id}`, { method: "PUT", body: fd });
        await this.fetch();
      } finally {
        this.submitting = false;
      }
    },

    async remove(id: string) {
      const { $api } = useNuxtApp();
      await $api(`/categories/${id}`, { method: "DELETE" });
      await this.fetch();
    },
  },
});
