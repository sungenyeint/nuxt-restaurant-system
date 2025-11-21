<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-sm bg-white p-6 rounded shadow">
      <h1 class="text-xl font-semibold mb-4">Register</h1>
      <form @submit.prevent="submit">
        <label class="block mb-2 text-sm">Name</label>
        <input v-model="name" type="text" required class="w-full border rounded p-2 mb-3" />
        <label class="block mb-2 text-sm">Email</label>
        <input v-model="email" type="email" required class="w-full border rounded p-2 mb-3" />
        <label class="block mb-2 text-sm">Password</label>
        <input v-model="password" type="password" required class="w-full border rounded p-2 mb-4" />
        <label class="block mb-2 text-sm">Role</label>
        <select v-model="role" class="w-full border rounded p-2 mb-6">
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
          <option value="chef">Chef</option>
          <option value="waiter">Waiter</option>
        </select>

        <button class="w-full py-2 rounded bg-green-600 text-white" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
        <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>

        <div class="text-sm text-gray-600 mt-4">
          Already have an account?
          <NuxtLink to="/login" class="text-green-700 hover:underline">Sign in</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' });
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<'admin' | 'cashier' | 'chef' | 'waiter'>('cashier')
const loading = ref(false)
const error = ref<string | null>(null)
const auth = useAuthStore()

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value, role: role.value })
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>