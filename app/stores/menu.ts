import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: [] as any[],
    loading: false,       // for fetching menus
    submitting: false,    // for create/update
  }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        this.items = await $api('/menus')
      } finally {
        this.loading = false
      }
    },

    async create(fd: FormData) {
      this.submitting = true
      try {
        const { $api } = useNuxtApp()
        await $api('/menus', { method: 'POST', body: fd })
        await this.fetch()
      } finally {
        this.submitting = false
      }
    },

    async update(id: string, fd: FormData) {
      this.submitting = true
      try {
        const { $api } = useNuxtApp()
        await $api(`/menus/${id}`, { method: 'PUT', body: fd })
        await this.fetch()
      } finally {
        this.submitting = false
      }
    },

    async remove(id: string) {
      const { $api } = useNuxtApp()
      await $api(`/menus/${id}`, { method: 'DELETE' })
      await this.fetch()
    },
  },
})
