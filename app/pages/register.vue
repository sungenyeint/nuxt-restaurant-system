<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <h1 class="text-2xl font-semibold mb-1 text-center text-teal-600">Restaurant POS</h1>
      <h2 class="text-lg font-medium mb-6 text-center text-gray-700">Create Account</h2>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm text-gray-600">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm text-gray-600">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm text-gray-600">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm text-gray-600">Role</label>
          <select
            v-model="role"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
            <option value="chef">Chef</option>
            <option value="waiter">Waiter</option>
          </select>
        </div>

        <button
          class="w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>

        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>

        <div class="text-sm text-gray-600 text-center mt-4">
          Already have an account?
          <NuxtLink to="/login" class="text-teal-600 font-medium hover:underline">
            Sign in
          </NuxtLink>
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
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
