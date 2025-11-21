<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-sm bg-white p-6 rounded shadow">
      <h1 class="text-xl font-semibold mb-4">Login</h1>
      <form @submit.prevent="submit">
        <label class="block mb-2 text-sm">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full border rounded p-2 mb-4"
        />
        <label class="block mb-2 text-sm">Password</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full border rounded p-2 mb-6"
        />
        <button
          class="w-full py-2 rounded bg-green-600 text-white"
          :disabled="loading"
        >
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
        <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
      </form>
      <div class="text-sm text-gray-600 mt-4">
        Don’t have an account?
        <NuxtLink to="/register" class="text-green-700 hover:underline"
          >Create one</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' });
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const auth = useAuthStore();

const submit = async () => {
  loading.value = true;
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    await navigateTo("/");
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>
