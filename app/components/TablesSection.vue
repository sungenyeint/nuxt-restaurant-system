<!-- components/TablesSection.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-5">
    <h2 class="text-xl font-semibold mb-4">Tables</h2>

    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="table in pos.tables"
        :key="table._id || table.id"
        class="rounded-lg p-4 border shadow-sm transition-all select-none
               flex flex-col items-center justify-center space-y-2"
        :class="[
          tableStatusClass(table.status),
          table.status === 'available'
            ? 'cursor-pointer hover:scale-[1.03]'
            : 'cursor-not-allowed opacity-60',
          isSelected(table) ? 'ring-4 ring-teal-500 scale-[1.03]' : ''
        ]"
        @click="onSelect(table)"
      >
        <!-- Table Number -->
        <div class="text-md font-bold">
          Table {{ table.tableNumber }}
        </div>

        <!-- Capacity -->
        <div class="text-sm text-gray-600">
          Seats: {{ table.seats }}
        </div>

        <!-- Status Badge -->
        <span
          class="px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 capitalize"
        >
          {{ table.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { tableStatusClass } from '~/constants/utils'
const pos = usePosStore()
const emit = defineEmits(['select-table'])

const isSelected = (table) =>
  (pos.selectedTable?._id || pos.selectedTable?.id) === (table._id || table.id)

const onSelect = (table) => {
  if (table.status !== 'available') return
  emit('select-table', table._id || table.id)
}
</script>
