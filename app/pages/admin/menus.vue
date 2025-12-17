<template>
  <Toast />
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Manage Menus</h2>
      <button @click="openCreate" class="px-4 py-2 bg-blue-600 text-white rounded">
        + New Menu
      </button>
    </div>

    <!-- Table -->
    <table class="w-full text-left border">
      <thead>
        <tr>
          <th class="p-2 border">No.</th>
          <th class="p-2 border">Name</th>
          <th class="p-2 border">Image</th>
          <th class="p-2 border">Category</th>
          <th class="p-2 border">Price</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="menuStore.loading">
          <td colspan="6" class="text-center p-4">Loading menus...</td>
        </tr>
        <tr v-else v-for="(m, i) in menuStore.items" :key="m._id">
          <td class="p-2 border">{{ i + 1 }}</td>
          <td class="p-2 border">{{ m.name }}</td>
          <td class="p-2 border">
            <img v-if="m.image" :src="toUrl(m.image)" class="w-20 h-20 object-cover rounded" />
            <div v-else class="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs">No image</div>
          </td>
          <td class="p-2 border">{{ categoryName(m.category) }}</td>
          <td class="p-2 border">${{ Number(m.price).toFixed(2) }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-blue-600 text-white rounded" @click="openEdit(m)">Edit</button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(m._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-4 border-b pb-2">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ isEdit ? 'Edit Menu' : 'Create Menu' }}
          </h3>

          <button
            type="button"
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Menu name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="name"
              class="border rounded p-2 w-full"
              :class="errors.name && 'border-red-500'"
              placeholder="Menu name"
            />
            <p v-if="errors.name" class="text-sm text-red-600 mt-1">
              {{ errors.name }}
            </p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="category"
              class="border rounded p-2 w-full"
              :class="errors.category && 'border-red-500'"
            >
              <option value="">Select category</option>
              <option v-for="c in categories" :key="c._id" :value="c._id">
                {{ c.name }}
              </option>
            </select>
            <p v-if="errors.category" class="text-sm text-red-600 mt-1">
              {{ errors.category }}
            </p>
          </div>

          <!-- Price -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Price <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              v-model.number="price"
              class="border rounded p-2 w-full"
              :class="errors.price && 'border-red-500'"
              placeholder="Price"
            />
            <p v-if="errors.price" class="text-sm text-red-600 mt-1">
              {{ errors.price }}
            </p>
          </div>

          <!-- Image (Optional) -->
          <!-- Image -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Image <span class="text-gray-400">(optional)</span>
            </label>

            <!-- Preview -->
            <div
              v-if="previewUrl"
              class="mb-2 w-32 h-32 border rounded overflow-hidden"
            >
              <img
                :src="previewUrl"
                class="w-full h-full object-cover"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              @change="onPickImage"
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 bg-gray-200 rounded" @click="closeModal">Cancel</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center" :disabled="menuStore.submitting">
              <span v-if="menuStore.submitting" class="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              {{ isEdit ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '~/stores/menu'
import { useCategoryStore } from '~/stores/category'
import { useToast } from '~/composables/useToast'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { menuSchema } from '~/schemas/menu'
definePageMeta({ middleware: 'admin' })

const { showToast } = useToast()
const { toUrl } = useFileUrl()

const menuStore = useMenuStore()
const categoryStore = useCategoryStore()

const categories = computed(() => categoryStore.items)

const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const imageFile = ref<File | null>(null)

const previewUrl = ref<string | null>(null)

watch(imageFile, (file) => {
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  }
})

watch(showModal, (open) => {
  if (!open && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
})

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(menuSchema),
  initialValues: {
    name: '',
    category: '',
    price: 0,
  },
})

const { value: name } = useField<string>('name')
const { value: category } = useField<string>('category')
const { value: price } = useField<number>('price')

const openCreate = () => {
  isEdit.value = false
  editingId.value = null

  resetForm({
    values: { name: '', category: '', price: 0 },
  })

  previewUrl.value = null
  imageFile.value = null
  showModal.value = true
}


const openEdit = (m: any) => {
  isEdit.value = true
  editingId.value = m._id

  setValues({
    name: m.name,
    category: m.category?._id || m.category,
    price: m.price,
  })

  previewUrl.value = m.image ? toUrl(m.image) : null
  imageFile.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  imageFile.value = null
}

const onPickImage = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  imageFile.value = files?.[0] || null
}

const categoryName = (idOrObj: any) => {
  const id = idOrObj?._id || idOrObj
  return categories.value.find(c => c._id === id)?.name || '—'
}

const onSubmit = handleSubmit(async (values) => {
  const fd = new FormData()
  fd.append('name', values.name)
  fd.append('category', values.category)
  fd.append('price', String(values.price))
  if (imageFile.value) fd.append('image', imageFile.value)

  if (isEdit.value && editingId.value) {
    await menuStore.update(editingId.value, fd)
    showToast('Menu updated', 'success')
  } else {
    await menuStore.create(fd)
    showToast('Menu created', 'success')
  }

  closeModal()
})

const remove = async (id: string) => {
  if (!confirm('Delete this menu?')) return
  await menuStore.remove(id)
  showToast('Menu deleted', 'success')
}

onMounted(async () => {
  await categoryStore.fetch()
  await menuStore.fetch()
})
</script>
