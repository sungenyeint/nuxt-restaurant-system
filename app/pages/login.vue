<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md border border-gray-100">

      <h1 class="text-2xl font-bold mb-2 text-center text-teal-600">
        Restaurant POS
      </h1>

      <h3 class="text-lg font-semibold mb-6 text-center text-gray-700">
        Login
      </h3>

      <form @submit.prevent="submit">

        <label class="block mb-1 text-sm font-medium text-gray-600">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full border rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <label class="block mb-1 text-sm font-medium text-gray-600">Password</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full border rounded-lg p-2.5 mb-6 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <button
          class="w-full py-2.5 rounded-lg bg-teal-600 text-white font-medium shadow hover:bg-teal-700 transition"
          :disabled="loading"
        >
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>

        <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
      </form>

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
