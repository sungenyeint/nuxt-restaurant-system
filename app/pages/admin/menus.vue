<template>
  <div class="p-6">

    <h2 class="text-xl font-semibold mb-4">Manage Menus</h2>

    <form class="grid grid-cols-4 gap-4 mb-4" @submit.prevent="save">
      <input v-model="form.name" class="border rounded p-2" placeholder="Name" />
      <select v-model="form.category" class="border rounded p-2">
        <option disabled value="">Select category</option>
        <option v-for="c in categories" :key="c._id" :value="c._id">
          {{ c.name }}
        </option>
      </select>
      <input type="file" accept="image/*" class="border rounded p-2 col-span-1" @change="onPickImage" />
      <input v-model.number="form.price" type="number" class="border rounded p-2" placeholder="Price" />
      <button class="px-3 py-2 rounded bg-blue-600 text-white col-span-1">
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
          <th class="p-2 border">Image</th>
          <th class="p-2 border">Category</th>
          <th class="p-2 border">Price</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in items" :key="m._id">
          <td class="p-2 border">{{ m.name }}</td>
          <td class="p-2 border">
            <img v-if="m.image" :src="toUrl(m.image)" alt="" class="w-24 h-24 object-cover" @error="onImgError" />
            <div v-else class="w-24 h-24  bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
              No image
            </div>
          </td>
          <td class="p-2 border">{{ catName(m.category) }}</td>
          <td class="p-2 border">${{ Number(m.price).toFixed(2) }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-gray-200 rounded" @click="edit(m)">
              Edit
            </button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(m._id)">
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
const { toUrl } = useFileUrl();
const items = ref<any[]>([]);
const categories = ref<any[]>([]);
const form = reactive<any>({ _id: null, name: "", category: "", price: "" });
const { $api } = useNuxtApp();

const imageFile = ref<File | null>(null);

const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  // simple fallback; feel free to replace with your asset
  img.src = 'https://via.placeholder.co/320x180?text=No+Image'
}

const onPickImage = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  imageFile.value = files && files[0] ? files[0] : null;
};

const load = async () => {
  // menus require auth header, $api already attaches it
  items.value = await $api("/menus");
  categories.value = await $api("/categories");
};
const reset = () =>
  Object.assign(form, { _id: null, name: "", category: "", price: "" });
const edit = (m: any) =>
  Object.assign(form, {
    _id: m._id,
    name: m.name,
    category: m.category?._id || m.category,
    price: m.price,
  });
const catName = (idOrObj: any) => {
  const id = idOrObj?._id || idOrObj;
  return categories.value.find((c: any) => c._id === id)?.name || "—";
};
const save = async () => {
  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("category", form.category);
  fd.append("price", String(form.price ?? 0));
  if (imageFile.value) fd.append("image", imageFile.value);
  console.log('form data ', fd);
  if (form._id) {
    await $api(`/menus/${form._id}`, { method: "PUT", body: fd });
    alert('Menu updated successfully');
  } else {
    await $api("/menus", { method: "POST", body: fd });
    alert('Menu created successfully');
  }
  reset();
  imageFile.value = null;
  await load();
};
const remove = async (id: string) => {
  if (!confirm("Are you sure want to delete this menu?")) return;
  await $api(`/menus/${id}`, { method: "DELETE" });
  alert('Menu deleted successfully');
  await load();
};

onMounted(load);
</script>
