<template>
  <Toast />
  <div class="p-6">

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Manage Users</h2>
      <button @click="openCreate" class="px-4 py-2 bg-blue-600 text-white rounded">
        + New User
      </button>
    </div>

    <!-- Table -->
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
        <tr v-if="userStore.loading">
          <td colspan="4" class="text-center p-4">Loading users...</td>
        </tr>
        <tr v-else v-for="u in userStore.items" :key="u._id">
          <td class="p-2 border">{{ u.name }}</td>
          <td class="p-2 border">{{ u.email }}</td>
          <td class="p-2 border capitalize">{{ u.role }}</td>
          <td class="p-2 border space-x-2">
            <button class="px-2 py-1 bg-blue-600 text-white rounded" @click="openEdit(u)">Edit</button>
            <button class="px-2 py-1 bg-red-600 text-white rounded" @click="remove(u._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6">

        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="text-lg font-semibold">{{ isEdit ? 'Edit User' : 'Create User' }}</h3>
          <button @click="closeModal" class="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">

          <div>
            <label class="block text-sm font-medium mb-1">Name <span class="text-red-500">*</span></label>
            <input v-model="name" class="border rounded p-2 w-full" :class="errors.name && 'border-red-500'" />
            <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Email <span class="text-red-500">*</span></label>
            <input type="email" v-model="email" class="border rounded p-2 w-full" :class="errors.email && 'border-red-500'" />
            <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Password
              <span v-if="isEdit" class="text-gray-400">(optional)</span>
              <span v-else class="text-red-500">*</span>
            </label>
            <input type="password" v-model="password" class="border rounded p-2 w-full" :class="errors.password && 'border-red-500'" />
            <p v-if="errors.password" class="text-sm text-red-600 mt-1">{{ errors.password }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Role <span class="text-red-500">*</span></label>
            <select v-model="role" class="border rounded p-2 w-full" :class="errors.role && 'border-red-500'">
              <option value="cashier">cashier</option>
              <option value="admin">admin</option>
              <option value="chef">chef</option>
              <option value="waiter">waiter</option>
            </select>
            <p v-if="errors.role" class="text-sm text-red-600 mt-1">{{ errors.role }}</p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 bg-gray-200 rounded" @click="closeModal">Cancel</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center" :disabled="userStore.submitting">
              <span v-if="userStore.submitting" class="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              {{ isEdit ? 'Update' : 'Create' }}
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useToast } from '~/composables/useToast'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { userSchema } from '~/schemas/user'

definePageMeta({ middleware: 'admin' })

const userStore = useUserStore()
const { showToast } = useToast()

const isEdit = ref(false)
const editingId = ref<string | null>(null)
const showModal = ref(false)

// Dynamic validation schema based on edit mode
const validationSchema = computed(() => toTypedSchema(userSchema(isEdit.value)))

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: { name: '', email: '', password: '', role: 'admin' }
})
const { value: name } = useField<string>('name')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const { value: role } = useField<'cashier'|'admin'|'chef'|'waiter'>('role')

// Open modal for create
const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  resetForm({ values: { name:'', email:'', password:'', role:'admin' } })
  showModal.value = true
}

// Open modal for edit
const openEdit = (u: any) => {
  isEdit.value = true
  editingId.value = u._id
  setValues({ name: u.name, email: u.email, password:'', role: u.role })
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// Submit
const onSubmit = handleSubmit(async (values) => {
  const payload: any = { name: values.name, email: values.email, role: values.role }
  if (values.password) payload.password = values.password

  if (isEdit.value && editingId.value) {
    await userStore.update(editingId.value, payload)
    showToast('User updated', 'success')
  } else {
    await userStore.create(payload)
    showToast('User created', 'success')
  }

  closeModal()
})

// Delete user
const remove = async (id: string) => {
  if (!confirm('Delete this user?')) return
  await userStore.remove(id)
  showToast('User deleted', 'success')
}

// Load users on mount
onMounted(() => userStore.fetch())
</script>

