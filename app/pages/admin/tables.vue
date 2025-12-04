<template>
  <div class="p-6">

    <h2 class="text-xl font-semibold mb-4">Manage Tables</h2>

    <form class="grid grid-cols-4 gap-4 mb-4" @submit.prevent="save">
      <input v-model.number="form.tableNumber" type="number" class="border rounded p-2" placeholder="Table #" />
      <input v-model.number="form.seats" type="number" class="border rounded p-2" placeholder="Seats" />
      <select v-model="form.status" class="border rounded p-2">
        <option value="available">available</option>
        <option value="occupied">occupied</option>
        <option value="reserved">reserved</option>
        <option value="cleaning">cleaning</option>
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
          <th class="p-2 border">#</th>
          <th class="p-2 border">Seats</th>
          <th class="p-2 border">Status</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in items" :key="t._id">
          <td class="p-2 border">{{ t.tableNumber }}</td>
          <td class="p-2 border">{{ t.seats }}</td>
          <td class="p-2 border">{{ t.status }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-gray-200 rounded" @click="edit(t)">
              Edit
            </button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(t._id)">
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
const items = ref<any[]>([]);
const form = reactive<any>({
  _id: null,
  tableNumber: null,
  seats: 4,
  status: "available",
});
const { $api } = useNuxtApp();

const load = async () => {
  items.value = await $api("/tables");
};
const reset = () =>
  Object.assign(form, {
    _id: null,
    tableNumber: null,
    seats: 4,
    status: "available",
  });
const edit = (t: any) => Object.assign(form, t);
const save = async () => {
  const payload = {
    tableNumber: Number(form.tableNumber),
    seats: Number(form.seats),
    status: form.status,
  };
  if (form._id) {
    await $api(`/tables/${form._id}`, { method: "PUT", body: payload });
    alert('Table updated successfully');
  } else {
    await $api("/tables", { method: "POST", body: payload });
    alert('Table created successfully');
  }
  reset();
  await load();
};
const remove = async (id: string) => {
  if (!confirm("Are you sure want to delete this table?")) return;
  await $api(`/tables/${id}`, { method: "DELETE" });
  alert('Table deleted successfully');
  await load();
};
onMounted(load);
</script>
