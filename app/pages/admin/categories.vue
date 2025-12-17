<template>
  <Toast />
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Manage Categories</h2>
      <button @click="openCreate" class="px-4 py-2 bg-blue-600 text-white rounded">
        + New Category
      </button>
    </div>

    <!-- Table -->
    <table class="w-full text-left border">
      <thead>
        <tr>
          <th class="p-2 border">No.</th>
          <th class="p-2 border">Name</th>
          <th class="p-2 border">Description</th>
          <th class="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="categoryStore.loading">
          <td colspan="6" class="text-center p-4">Loading menus...</td>
        </tr>
        <tr v-else v-for="(c, i) in categoryStore.items" :key="c._id">
          <td class="p-2 border">{{ i + 1 }}</td>
          <td class="p-2 border">{{ c.name }}</td>
          <td class="p-2 border">{{ c.description || '—' }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-blue-600 text-white rounded" @click="openEdit(c)">
              Edit
            </button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(c._id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6">

        <!-- Header -->
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="text-lg font-semibold">
            {{ isEdit ? 'Edit Category' : 'Create Category' }}
          </h3>
          <button @click="closeModal" class="text-2xl text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="onSubmit">

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Name <span class="text-red-500">*</span>
            </label>
            <input v-model="name" class="border rounded p-2 w-full" :class="errors.name && 'border-red-500'" />
            <p v-if="errors.name" class="text-sm text-red-600 mt-1">
              {{ errors.name }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea v-model="description" rows="3" class="border rounded p-2 w-full" />
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 bg-gray-200 rounded" @click="closeModal">Cancel</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center" :disabled="categoryStore.submitting">
              <span v-if="categoryStore.submitting" class="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              {{ isEdit ? 'Update' : 'Create' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '~/stores/category'
import { useToast } from '~/composables/useToast'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { categorySchema } from '~/schemas/category'

definePageMeta({ middleware: 'admin' })

const { showToast } = useToast()
const categoryStore = useCategoryStore()

const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues: { name: '', description: '' },
})

const { value: name } = useField<string>('name')
const { value: description } = useField<string>('description')

const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  resetForm({
    values: { name: '', description: '' },
  })
  showModal.value = true
}

const openEdit = (c: any) => {
  isEdit.value = true
  editingId.value = c._id
  setValues({ name: c.name, description: c.description })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm({
    values: { name: '', description: '' },
  })
}

const onSubmit = handleSubmit(async (values) => {
  if (isEdit.value && editingId.value) {
    await categoryStore.update(editingId.value, values)
    showToast('Category updated', 'success')
  } else {
    await categoryStore.create(values)
    showToast('Category created', 'success')
  }
  closeModal()
})

const remove = async (id: string) => {
  if (!confirm('Delete this category?')) return
  await categoryStore.remove(id)
  showToast('Category deleted', 'success')
}

onMounted(() => categoryStore.fetch())
</script>
