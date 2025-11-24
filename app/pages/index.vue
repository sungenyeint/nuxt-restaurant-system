<!-- pages/index.vue -->
<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-gradient-to-r from-teal-600 to-indigo-700 text-white shadow-md">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-2xl font-bold">POS Dashboard</h1>
          <!-- Header right controls (hidden for chef) -->
          <div class="flex items-center space-x-4" v-if="canPlaceOrder">
          <!-- Order type toggle -->
            <div class="flex rounded overflow-hidden bg-white/10 p-1">
              <button
                class="px-3 py-1.5 text-sm rounded"
                :class="
                  pos.currentOrder.orderType === 'dine-in'
                    ? 'bg-white text-teal-700 font-semibold'
                    : 'text-white/90'
                "
                @click="pos.setOrderType('dine-in')"
              >
                Dine-in
              </button>
              <button
                class="px-3 py-1.5 text-sm rounded"
                :class="
                  pos.currentOrder.orderType === 'takeaway'
                    ? 'bg-white text-teal-700 font-semibold'
                    : 'text-white/90'
                "
                @click="pos.setOrderType('takeaway')"
              >
                Takeaway
              </button>
            </div>

            <button
              v-if="canPlaceOrder"
              class="px-3 py-1.5 rounded bg-white text-teal-700 font-semibold shadow-md hover:scale-105 transition-transform"
              @click="showCart = true"
            >
              Cart ({{ pos.cartItemCount }})
            </button>

            <button
              v-if="canViewOrders"
              class="px-3 py-1.5 rounded bg-white/20 text-white/95 hover:bg-white/30 transition"
              @click="showOrders = true"
            >
              Active Orders
            </button>
        </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 grid grid-cols-4 gap-6 p-6">
      <!-- Tables Section -->
      <div class="col-span-1">
        <TablesSection v-if="canPlaceOrder" @select-table="pos.setTable" />
        <TablesSection v-else />
      </div>
      <!-- Menu Section -->
      <div class="col-span-3">
        <MenuSection @add-to-cart="onAddToCart" />
      </div>
    </div>

    <!-- Cart Panel (slideover-like) -->
    <div v-if="showCart" class="fixed inset-0 bg-black/40 flex justify-end">
      <div class="w-full max-w-md h-full bg-white shadow-xl">
        <CartPanel
          @close="showCart = false"
          @submit-order="handleSubmitOrder"
        />
      </div>
    </div>

    <!-- Active Orders Panel -->
    <div v-if="showOrders" class="fixed inset-0 bg-black/40 flex justify-end">
      <div class="w-full max-w-md h-full bg-white shadow-xl p-6 flex flex-col">
        <div class="flex justify-between items-center border-b pb-3">
          <h2 class="text-lg font-semibold">Active Orders</h2>
          <button
            class="text-gray-600 hover:text-gray-900"
            @click="showOrders = false"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 overflow-y-auto mt-4 space-y-3">
          <div v-if="pos.activeOrders.length === 0" class="text-gray-500">
            No active orders yet.
          </div>
          <div
            v-for="order in pos.activeOrders"
            :key="order._id || order.id"
            class="border rounded p-3"
          >
            <div class="text-sm text-gray-600">
              #{{
                (order._id || order.id).slice?.(0, 6) || order._id || order.id
              }}
            </div>
            <div class="font-medium">
              {{
                order.orderType === "dine-in"
                  ? "Table : " + order.table?.tableNumber
                  : "takeaway"
              }}
            </div>
            <div class="text-sm">
              Items: {{ order.items?.length || 0 }} • Total: ${{
                Number(order.total || 0).toFixed(2)
              }}
            </div>
            <div class="text-xs text-gray-500 capitalize">
              Status: {{ order.status }}
            </div>
            <div
              class="mt-3 flex items-center justify-between text-sm border-t pt-3"
            >
              <span class="text-gray-600"
                >Items: {{ order.items?.length || 0 }}</span
              >
              <div class="flex items-center gap-2">
                <button
                  v-if="canChef && order.status === 'pending'"
                  class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  @click="updateStatus(order, 'preparing')"
                >
                  Start Preparing
                </button>
                <button
                  v-else-if="canChef && order.status === 'preparing'"
                  class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  @click="updateStatus(order, 'served')"
                >
                  Mark Served
                </button>
                <button
                  v-if="
                    canCashier &&
                    (order.status === 'served' || order.status === 'ready')
                  "
                  class="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  @click="openPaymentModal(order)"
                >
                  Mark Paid
                </button>
                <span class="font-semibold"
                  >${{ Number(order.total || 0).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="w-full max-w-md bg-white rounded shadow p-6">
        <h3 class="text-lg font-semibold mb-3">Process Payment</h3>
        <div class="mb-2 text-sm text-gray-700">Order #{{ (paymentOrder?._id || paymentOrder?.id)?.toString().slice?.(0,6) }}</div>
        <div class="mb-2">Total: <span class="font-semibold">${{ Number(paymentOrder?.total || 0).toFixed(2) }}</span></div>

        <label class="block text-sm mb-1">Amount Tendered</label>
        <input type="number" step="0.01" min="0" v-model.number="tendered" class="w-full border rounded p-2 mb-2" />

        <div class="mb-3 text-sm">
          Change: <span class="font-semibold">${{ (Number(tendered || 0) - Number(paymentOrder?.total || 0)).toFixed(2) }}</span>
        </div>

        <div v-if="paymentError" class="text-red-600 text-sm mb-2">{{ paymentError }}</div>

        <div class="flex justify-end gap-2">
          <button class="px-3 py-1 rounded bg-gray-100" @click="closePaymentModal" :disabled="paymentLoading">Cancel</button>
          <button class="px-3 py-1 rounded bg-emerald-600 text-white" @click="confirmPayment" :disabled="paymentLoading">{{ paymentLoading ? 'Processing...' : 'Confirm Payment' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const pos = usePosStore();
const route = useRoute();
const { $api } = useNuxtApp();
const showCart = ref(false);
const showOrders = ref(false);

// Payment modal state
const showPaymentModal = ref(false)
const paymentOrder = ref<any | null>(null)
const tendered = ref<number | null>(null)
const paymentLoading = ref(false)
const paymentError = ref<string | null>(null)

const openPaymentModal = (order: any) => {
  paymentOrder.value = order
  // Prefill tendered amount with order total
  tendered.value = Number(order.total || 0)
  paymentError.value = null
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  paymentOrder.value = null
  tendered.value = null
  paymentError.value = null
}

const confirmPayment = async () => {
  if (!paymentOrder.value) return
  const id = paymentOrder.value._id || paymentOrder.value.id
  if (!id) return

  const paid = Number(tendered.value || 0)
  if (Number.isNaN(paid) || paid < Number(paymentOrder.value.total || 0)) {
    paymentError.value = 'Amount paid must be a number and at least the total amount.'
    return
  }

  paymentLoading.value = true
  paymentError.value = null
  try {
    await $api(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status: 'paid', amountPaid: paid }
    })
    await pos.fetchActiveOrders?.()
    closePaymentModal()
  } catch (e: any) {
    paymentError.value = e?.data?.message || e?.message || 'Payment failed'
  } finally {
    paymentLoading.value = false
  }
}

const canPlaceOrder = computed(() => {
  const role = auth.user?.role;
  return role === "cashier" || role === "waiter" || role === "admin";
});
const canChef = computed(
  () => auth.user?.role === "chef" || auth.user?.role === "admin"
);
const canCashier = computed(
  () => auth.user?.role === "cashier" || auth.user?.role === "admin"
);
const canViewOrders = computed(() => {
  const role = auth.user?.role;
  return (
    role === "cashier" ||
    role === "waiter" ||
    role === "chef" ||
    role === "admin"
  );
});

// In-page role guard: allow cashier, waiter, admin (chef can view-only)
watchEffect(() => {
  const role = auth.user?.role;
  if (
    role !== "cashier" &&
    role !== "waiter" &&
    role !== "admin" &&
    role !== "chef"
  ) {
    navigateTo("/");
  }
});

onMounted(async () => {
  pos.loadInitialData();
  const editId = route.query.editOrder as string | undefined;
  if (editId) {
    await pos.loadOrder(editId);
    showCart.value = true;
    // Optional: clear the query to avoid re-trigger on back/forward
    // navigateTo('/', { replace: true })
  }
});

const onAddToCart = (item: any) => {
  if (!canPlaceOrder.value) return;
  pos.addToCart(item);
};

const updateStatus = async (
  order: any,
  status: "pending" | "preparing" | "served" | "paid"
) => {
  const id = order._id || order.id;
  if (!id) return;

  // If marking as paid, confirm with the cashier to avoid accidental changes
  if (status === 'paid' && (canCashier.value || (auth.user?.role === 'admin'))) {
    const ok = confirm(`Mark order #${(id + '').slice(0,6)} as paid?`)
    if (!ok) return
  }

  try {
    await $api(`/orders/${id}/status`, { method: "PATCH", body: { status } });
    await pos.fetchActiveOrders?.();
  } catch (e) {
    // noop
  }
};

const handleSubmitOrder = async () => {
  try {
    if (pos.currentOrder.orderType === "dine-in" && !pos.currentOrder.tableId) {
      alert("Please select a table for dine-in orders.");
      return;
    }
    await pos.submitOrder();
    showCart.value = false;
  } catch (error) {
    // handle error
  }
};
</script>
