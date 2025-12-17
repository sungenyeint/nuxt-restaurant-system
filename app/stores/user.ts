import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    items: [] as any[],
    loading: false,
    submitting: false,
  }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        this.items = await $api('/users')
      } finally {
        this.loading = false
      }
    },
    async create(payload: any) {
      this.submitting = true
      try {
        const { $api } = useNuxtApp()
        await $api('/users', { method: 'POST', body: payload })
        await this.fetch()
      } finally {
        this.submitting = false
      }
    },
    async update(id: string, payload: any) {
      this.submitting = true
      try {
        const { $api } = useNuxtApp()
        await $api(`/users/${id}`, { method: 'PUT', body: payload })
        await this.fetch()
      } finally {
        this.submitting = false
      }
    },
    async remove(id: string) {
      const { $api } = useNuxtApp()
      await $api(`/users/${id}`, { method: 'DELETE' })
      await this.fetch()
    },
  },
})
