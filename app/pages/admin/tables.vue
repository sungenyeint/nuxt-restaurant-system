<template>
  <Toast />
  <div class="p-6">

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Manage Tables</h2>
      <button @click="openCreate" class="px-4 py-2 bg-blue-600 text-white rounded">
        + New Table
      </button>
    </div>

    <!-- Table -->
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
        <tr v-if="tableStore.loading">
          <td colspan="4" class="text-center p-4">Loading tables...</td>
        </tr>
        <tr v-else v-for="(t, i) in tableStore.items" :key="t._id">
          <td class="p-2 border">Table - {{ t.tableNumber }}</td>
          <td class="p-2 border">{{ t.seats }}</td>
          <td class="p-2 border">{{ t.status }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-blue-600 text-white rounded" @click="openEdit(t)">Edit</button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(t._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6">

        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="text-lg font-semibold">{{ isEdit ? 'Edit Table' : 'Create Table' }}</h3>
          <button @click="closeModal" class="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">

          <div>
            <label class="block text-sm font-medium mb-1">Table Number <span class="text-red-500">*</span></label>
            <input type="number" v-model.number="tableNumber" class="border rounded p-2 w-full" :class="errors.tableNumber && 'border-red-500'" />
            <p v-if="errors.tableNumber" class="text-sm text-red-600 mt-1">{{ errors.tableNumber }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Seats <span class="text-red-500">*</span></label>
            <input type="number" v-model.number="seats" class="border rounded p-2 w-full" :class="errors.seats && 'border-red-500'" />
            <p v-if="errors.seats" class="text-sm text-red-600 mt-1">{{ errors.seats }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Status <span class="text-red-500">*</span></label>
            <select v-model="status" class="border rounded p-2 w-full" :class="errors.status && 'border-red-500'">
              <option value="available">available</option>
              <option value="occupied">occupied</option>
              <option value="reserved">reserved</option>
              <option value="cleaning">cleaning</option>
            </select>
            <p v-if="errors.status" class="text-sm text-red-600 mt-1">{{ errors.status }}</p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 bg-gray-200 rounded" @click="closeModal">Cancel</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center" :disabled="tableStore.submitting">
              <span v-if="tableStore.submitting" class="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              {{ isEdit ? 'Update' : 'Create' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTableStore } from '~/stores/table'
import { useToast } from '~/composables/useToast'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { tableSchema } from '~/schemas/table'

definePageMeta({ middleware: 'admin' })

const tableStore = useTableStore()
const { showToast } = useToast()

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(tableSchema),
  initialValues: { tableNumber: 1, seats: 4, status: 'available' },
})

const { value: tableNumber } = useField<number>('tableNumber')
const { value: seats } = useField<number>('seats')
const { value: status } = useField<'available'|'occupied'|'reserved'|'cleaning'>('status')

const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)

const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  resetForm({ values: { tableNumber: 1, seats: 4, status: 'available' } })
  showModal.value = true
}

const openEdit = (t: any) => {
  isEdit.value = true
  editingId.value = t._id
  setValues({ tableNumber: t.tableNumber, seats: t.seats, status: t.status })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const onSubmit = handleSubmit(async (values) => {
  if (isEdit.value && editingId.value) {
    await tableStore.update(editingId.value, values)
    showToast('Table updated', 'success')
  } else {
    await tableStore.create(values)
    showToast('Table created', 'success')
  }
  closeModal()
})

const remove = async (id: string) => {
  if (!confirm('Delete this table?')) return
  await tableStore.remove(id)
  showToast('Table deleted', 'success')
}

onMounted(() => tableStore.fetch())
</script>
