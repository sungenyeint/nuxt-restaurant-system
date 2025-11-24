<script setup lang="ts">
import ChefOrdersList from "~/components/orders/ChefOrdersList.vue";
import WaiterOrdersList from "~/components/orders/WaiterOrdersList.vue";
import CashierOrdersList from "~/components/orders/CashierOrdersList.vue";
import { all } from "axios";

const { $api } = useNuxtApp();
const active_orders = ref<any[]>([]);
const all_orders = ref<any[]>([]);
const auth = useAuthStore();
const canChef = computed(
  () => auth.user?.role === "chef" || auth.user?.role === "admin"
);
const canWaiter = computed(
  () => auth.user?.role === "waiter" || auth.user?.role === "admin"
);
const canCashier = computed(
  () => auth.user?.role === "cashier" || auth.user?.role === "admin"
);

// View mode: 'chef' | 'waiter' | 'cashier'. Default based on actual role.
const defaultMode = auth.user?.role === 'waiter' ? 'waiter' : auth.user?.role === 'cashier' ? 'cashier' : 'chef'
const viewMode = ref<string>(defaultMode)

const setViewMode = (mode: string) => {
  if (mode === 'chef' && !canChef.value) return
  if (mode === 'waiter' && !canWaiter.value) return
  if (mode === 'cashier' && !canCashier.value) return
  viewMode.value = mode
}

const load = async () => {
  try {
    active_orders.value = await $api("/orders/active");
    all_orders.value = await $api("/orders");
  } catch (e) {
    active_orders.value = [] as any[];
    all_orders.value = [] as any[];
  }
};

const updateStatus = async (
  order: any,
  status: "pending" | "preparing" | "served" | "paid"
) => {
  const id = order._id || order.id;
  if (!id) return;
  await $api(`/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  }).catch(() => { });
  await load();
};
const editPending = (order: any) => {
  const id = order._id || order.id;
  if (!id) return;
  navigateTo(`/?editOrder=${id}`);
};

onMounted(load);

// Payment modal state (for cashier)
const showPaymentModal = ref(false)
const paymentOrder = ref<any | null>(null)
const tendered = ref<number | null>(null)
const paymentLoading = ref(false)
const paymentError = ref<string | null>(null)

const openPaymentModal = (order: any) => {
  paymentOrder.value = order
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
    await load()
    closePaymentModal()
  } catch (e: any) {
    paymentError.value = e?.data?.message || e?.message || 'Payment failed'
  } finally {
    paymentLoading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Order List</h2>

    <!-- Admins can toggle which view they want to use -->
    <div v-if="auth.user?.role === 'admin'" class="mb-4 flex gap-2">
      <button :class="['px-3 py-1 rounded', viewMode === 'chef' ? 'bg-gray-200' : 'bg-white']"
        @click="setViewMode('chef')">
        Chef View
      </button>
      <button :class="['px-3 py-1 rounded', viewMode === 'waiter' ? 'bg-gray-200' : 'bg-white']"
        @click="setViewMode('waiter')">
        Waiter View
      </button>
      <button :class="['px-3 py-1 rounded', viewMode === 'cashier' ? 'bg-gray-200' : 'bg-white']"
        @click="setViewMode('cashier')">
        Cashier View
      </button>
    </div>

    <ChefOrdersList v-if="viewMode === 'chef' && canChef" :orders="active_orders" @update-status="updateStatus" />
    <WaiterOrdersList v-else-if="viewMode === 'waiter' && canWaiter" :orders="active_orders"
      @edit-pending="editPending" />
    <CashierOrdersList v-else-if="viewMode === 'cashier' && canCashier" :orders="all_orders"
      @process-payment="openPaymentModal" />

    <!-- Payment Modal (for cashier) -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="w-full max-w-md bg-white rounded shadow p-6">
        <h3 class="text-lg font-semibold mb-3">Process Payment</h3>
        <div class="mb-2 text-sm text-gray-700">Order #{{ (paymentOrder?._id ||
          paymentOrder?.id)?.toString().slice?.(0,6) }}</div>
        <div class="mb-2">Total: <span class="font-semibold">${{ Number(paymentOrder?.total || 0).toFixed(2) }}</span>
        </div>

        <label class="block text-sm mb-1">Amount Tendered</label>
        <input type="number" step="0.01" min="0" v-model.number="tendered" class="w-full border rounded p-2 mb-2" />

        <div class="mb-3 text-sm">
          Change: <span class="font-semibold">${{ (Number(tendered || 0) - Number(paymentOrder?.total || 0)).toFixed(2)
            }}</span>
        </div>

        <div v-if="paymentError" class="text-red-600 text-sm mb-2">{{ paymentError }}</div>

        <div class="flex justify-end gap-2">
          <button class="px-3 py-1 rounded bg-gray-100" @click="closePaymentModal"
            :disabled="paymentLoading">Cancel</button>
          <button class="px-3 py-1 rounded bg-emerald-600 text-white" @click="confirmPayment"
            :disabled="paymentLoading">{{ paymentLoading ? 'Processing...' : 'Confirm Payment' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
