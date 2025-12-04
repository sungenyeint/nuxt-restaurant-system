<!-- components/CartPanel.vue -->
<template>
  <div class="h-full flex flex-col">
    <div class="p-6 border-b">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">Current Order</h2>
        <button class="text-gray-600 hover:text-gray-900" @click="$emit('close')">✕</button>
      </div>

      <!-- Order Info -->
      <div v-if="pos.selectedTable"
        class="mt-3 px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded flex justify-between items-center"
      >
          Table {{ pos.selectedTable.tableNumber }}
        <button
          v-if="pos.selectedTable"
          class="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
          @click="pos.clearCurrentOrder()"
        >
          Clear
        </button>
      </div>
      <div v-if="pos.currentOrder.orderType === 'takeaway'" class="mt-3 px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded flex justify-between items-center">
        Takeaway Order
      </div>
    </div>

    <div
      v-if="pos.currentOrder.items.length === 0 || (!pos.currentOrder.tableId && pos.currentOrder.orderType === 'dine-in')"
      class="mx-6 mt-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-center gap-2"
    >
      <span class="text-red-500">⚠️</span>
      <span>Please select a table for dine-in orders.</span>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="pos.currentOrder.items.length === 0" class="text-center text-gray-500 py-8">
        <div class="w-12 h-12 mx-auto mb-4">🛒</div>
        <p>Your cart is empty</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="(item, index) in pos.currentOrder.items" :key="index"
          class="flex justify-between items-center border-b pb-4">
          <div class="flex-1">
            <h3 class="font-medium">{{ item.name }}</h3>
            <p class="text-sm text-gray-600">${{ Number(item.price).toFixed(2) }}</p>
          </div>

          <div class="flex items-center space-x-3">
            <button class="px-2 py-1 rounded bg-gray-100" @click="pos.updateQuantity(index, item.qty - 1)">-</button>
            <span class="w-8 text-center">{{ item.qty }}</span>
            <button class="px-2 py-1 rounded bg-gray-100" @click="pos.updateQuantity(index, item.qty + 1)">+</button>
            <button class="px-2 py-1 rounded text-red-700" @click="pos.removeFromCart(index)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t p-6 space-y-4">
      <div class="flex justify-between text-lg font-semibold">
        <span>Total:</span>
        <span>${{ pos.cartTotal.toFixed(2) }}</span>
      </div>

      <div class="mt-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
        <textarea v-model="pos.currentOrder.notes" class="w-full border rounded p-2 text-sm" rows="3"
          placeholder="e.g., No onions, extra spicy" />
      </div>

      <button class="w-full py-3 rounded bg-blue-600 text-white disabled:opacity-50"
        :disabled="pos.currentOrder.items.length === 0 || (!pos.currentOrder.tableId && pos.currentOrder.orderType === 'dine-in')"
        @click="$emit('confirm-submit')">
        {{ pos.editingOrderId ? 'Update Order' : 'Place Order' }} - ${{ pos.cartTotal.toFixed(2) }}
      </button>
    </div>
  </div>
</template>

<script setup>
const pos = usePosStore()
defineEmits(['close', 'confirm-submit'])
</script>
