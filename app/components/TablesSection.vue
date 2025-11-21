<!-- components/TablesSection.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-lg font-semibold mb-4">Tables</h2>
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="table in pos.tables"
        :key="table._id || table.id"
        class="border rounded-lg p-3 text-center transition-colors select-none"
        :class="[
          (table.status === 'available') ? 'cursor-pointer hover:bg-green-50' : 'cursor-not-allowed opacity-60',
          (table.status === 'available') ? 'bg-green-100 border-green-300' : '',
          (table.status === 'occupied') ? 'bg-red-100 border-red-300' : '',
          (table.status === 'reserved') ? 'bg-yellow-100 border-yellow-300' : '',
          ((pos.selectedTable?._id || pos.selectedTable?.id) === (table._id || table.id)) ? 'ring-2 ring-blue-500' : ''
        ]"
        :aria-disabled="table.status !== 'available'"
        :title="table.status !== 'available' ? 'Not available' : 'Select table'"
        @click="onSelect(table)"
      >
        <div class="font-medium">Table {{ table.tableNumber }}</div>
        <div class="text-sm text-gray-600">Capacity: {{ table.seats }}</div>
        <div class="text-xs capitalize mt-1">{{ table.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const pos = usePosStore()
const emit = defineEmits(['select-table'])

const onSelect = (table) => {
  if (table?.status !== 'available') return
  emit('select-table', table._id || table.id)
}
</script>