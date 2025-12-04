<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="p-6 border-b bg-white rounded-t-lg shadow">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">Confirm Order</h2>
        <button
          class="text-gray-400 hover:text-gray-700 transition"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Table / Takeaway Info -->
      <div
        class="mt-3 px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded flex justify-between items-center"
      >
        <span>
          {{ pos.selectedTable ? `Table ${pos.selectedTable.tableNumber}` : 'Takeaway Order' }}
        </span>
      </div>
    </div>

    <!-- notes -->
    <div v-if="pos.currentOrder.notes" class="mx-6 mt-3 rounded bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800 flex items-center gap-2">
      <span class="text-yellow-500">📝</span>
      <span>Notes: {{ pos.currentOrder.notes }}</span>
    </div>

    <!-- Items List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div class="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-700 border-b pb-1">
        <div class="col-span-6">Item</div>
        <div class="col-span-2 text-right">Price</div>
        <div class="col-span-1 text-right">Qty</div>
        <div class="col-span-3 text-right">Total</div>
      </div>

      <div
        v-for="(it, idx) in pos.currentOrder.items || []"
        :key="idx"
        class="grid grid-cols-12 gap-2 py-2 items-center bg-white rounded shadow-sm hover:bg-gray-50 transition"
      >
        <div class="col-span-6 text-gray-800 truncate">
          {{ idx + 1 }}. {{ it.name }}
        </div>
        <div class="col-span-2 text-right">${{ Number(it.price ?? 0).toFixed(2) }}</div>
        <div class="col-span-1 text-right">{{ it.qty }}</div>
        <div class="col-span-3 text-right font-medium">
          ${{ Number((it.price ?? 0) * (it.qty ?? 1)).toFixed(2) }}
        </div>
      </div>

      <!-- Total -->
      <div class="text-right text-lg font-bold mt-4 border-t pt-3 text-gray-800">
        Total: <span class="text-blue-600">${{ Number(pos.cartTotal || 0).toFixed(2) }}</span>
      </div>
    </div>

    <!-- Footer / Actions -->
    <div class="border-t p-6 bg-white rounded-b-lg flex flex-col gap-3">
      <button
        class="w-full py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        :disabled="pos.currentOrder.items.length === 0 || (!pos.currentOrder.tableId && pos.currentOrder.orderType === 'dine-in')"
        @click="$emit('submit-order')"
      >
        Confirm Order - ${{ pos.cartTotal.toFixed(2) }}
      </button>
      <button
        class="w-full py-3 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        @click="$emit('back')"
      >
        Back
      </button>
    </div>
  </div>
</template>

<script setup>
const pos = usePosStore()
defineEmits(['close', 'submit-order', 'back'])
</script>
