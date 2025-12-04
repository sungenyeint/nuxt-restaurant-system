<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">Manage Categories</h2>

    <form class="flex gap-4 mb-4" @submit.prevent="save">
      <input
        v-model="form.name"
        class="border rounded p-2"
        placeholder="Name"
      />
      <input
        v-model="form.description"
        class="border rounded p-2"
        placeholder="Description"
      />
      <button class="px-3 py-2 rounded bg-blue-600 text-white">
        {{ form._id ? "Update" : "Create" }}
      </button>
      <button
        v-if="form._id"
        type="button"
        class="px-3 py-2 rounded bg-gray-200"
        @click="reset"
      >
        Cancel
      </button>
    </form>

    <table class="w-full text-left border">
      <thead>
        <tr>
          <th class="p-2 border">Name</th>
          <th class="p-2 border">Description</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in items" :key="c._id">
          <td class="p-2 border">{{ c.name }}</td>
          <td class="p-2 border">{{ c.description }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-gray-200 rounded" @click="edit(c)">
              Edit
            </button>
            <button
              class="px-2 py-1 bg-red-600 text-white rounded"
              @click="remove(c._id)"
            >
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
const form = reactive<any>({ _id: null, name: "", description: "" });
const { $api } = useNuxtApp();

const load = async () => {
  items.value = await $api("/categories");
};
const reset = () =>
  Object.assign(form, { _id: null, name: "", description: "" });
const edit = (c: any) => Object.assign(form, c);

const save = async () => {
  if (form._id) {
    await $api(`/categories/${form._id}`, { method: "PUT", body: form });
    alert('Category updated successfully');
  } else {
    await $api("/categories", { method: "POST", body: form });
    alert('Category created successfully');
  }
  reset();
  await load();
};

const remove = async (id: string) => {
  if (!confirm("Are you sure want to delete this category?")) return;
  await $api(`/categories/${id}`, { method: "DELETE" });
  alert('Category deleted successfully');
  await load();
};

onMounted(load);
</script>
