<template>
  <Toast />
  <div class="p-6">

    <h2 class="text-xl font-semibold mb-4">Manage Users</h2>

    <form class="grid grid-cols-4 gap-4 mb-4" @submit.prevent="save">
      <input v-model="form.name" class="border rounded p-2" placeholder="Name" />
      <input v-model="form.email" type="email" class="border rounded p-2" placeholder="Email" />
      <input v-model="form.password" type="password" class="border rounded p-2"
        placeholder="Password (optional on edit)" />
      <select v-model="form.role" class="border rounded p-2">
        <option value="cashier">cashier</option>
        <option value="admin">admin</option>
        <option value="chef">chef</option>
        <option value="waiter">waiter</option>
      </select>
      <button class="px-3 py-2 rounded bg-blue-600 text-white">
        {{ form._id ? "Update" : "Create" }}
      </button>
      <button v-if="form._id" type="button" class="px-3 py-2 rounded bg-gray-200" @click="reset">
        Cancel
      </button>
    </form>

    <table class="w-full text-left border">
      <thead>
        <tr>
          <th class="p-2 border">Name</th>
          <th class="p-2 border">Email</th>
          <th class="p-2 border">Role</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in items" :key="u._id">
          <td class="p-2 border">{{ u.name }}</td>
          <td class="p-2 border">{{ u.email }}</td>
          <td class="p-2 border capitalize">{{ u.role }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-gray-200 rounded" @click="edit(u)">
              Edit
            </button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(u._id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin" });
import Toast from '~/components/Toast.vue';
import { useToast } from '~/composables/useToast';
const { showToast } = useToast();
const items = ref<any[]>([]);
const form = reactive<any>({
  _id: null,
  name: "",
  email: "",
  password: "",
  role: "cashier",
});
const { $api } = useNuxtApp();

const load = async () => {
  items.value = await $api("/users");
};
const reset = () =>
  Object.assign(form, {
    _id: null,
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });
const edit = (u: any) =>
  Object.assign(form, {
    _id: u._id,
    name: u.name,
    email: u.email,
    password: "",
    role: u.role,
  });

const save = async () => {
  const payload: any = { name: form.name, email: form.email, role: form.role };
  if (form.password) payload.password = form.password;
  if (form._id) {
    await $api(`/users/${form._id}`, { method: "PUT", body: payload });
    showToast('User updated successfully', 'success');
  } else {
    await $api("/users", { method: "POST", body: payload });
    showToast('User created successfully', 'success');
  }
  reset();
  await load();
};
const remove = async (id: string) => {
  if (!confirm("Are you sure want to delete this user?")) return;
  await $api(`/users/${id}`, { method: "DELETE" });
  showToast('User deleted successfully', 'success');
  await load();
};
onMounted(load);
</script>
