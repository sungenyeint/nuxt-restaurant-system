<script setup lang="ts">
import ChefOrdersList from "~/components/orders/ChefOrdersList.vue";
import WaiterOrdersList from "~/components/orders/WaiterOrdersList.vue";
import CashierOrdersList from "~/components/orders/CashierOrdersList.vue";
import AdminOrderList from "~/components/orders/AdminOrderList.vue";
import { useToast } from '~/composables/useToast';
import type { TabKey, OrderStatus } from "~/types";
import { tabs } from "~/constants/utils";
import { useFilter } from '~/composables/useFilter';
import dayjs from "dayjs";

const { showToast } = useToast();
const { $api } = useNuxtApp();
const auth = useAuthStore();
const pos = usePosStore();
const notify = useNotifyStore();
const dateFilter = ref<"yesterday"|"today"|"all"|"custom">("today");
const active = ref<TabKey>('all');
const customDate = ref("");

const setTab = (tab: TabKey) => {
  active.value = tab;
}

const dateFilteredOrders = computed(() => {
  if (dateFilter.value !== "custom") {
    customDate.value = "";
  }
  if (dateFilter.value === "all") return pos.orders;

  if (dateFilter.value === "custom") {
    return pos.orders.filter(
      o => dayjs(o.createdAt).format("YYYY-MM-DD") === customDate.value
    );
  }

  return pos.orders.filter(o => {
    const d = dayjs(o.createdAt).format("YYYY-MM-DD");
    const today = dayjs().format("YYYY-MM-DD");

    if (dateFilter.value === "today") return d === today;
    if (dateFilter.value === "yesterday") return d === dayjs().subtract(1, "day").format("YYYY-MM-DD");

    return true;
  });
});

const { filtered } = useFilter(
  dateFilteredOrders,
  active,
  auth.user?.role,
  notify,
);

const canChef = computed(
  () => auth.user?.role === "chef" || auth.user?.role === "admin"
);
const canWaiter = computed(
  () => auth.user?.role === "waiter" || auth.user?.role === "admin"
);
const canCashier = computed(
  () => auth.user?.role === "cashier" || auth.user?.role === "admin"
);

const defaultMode = auth.user?.role === 'waiter'
  ? 'waiter'
  : auth.user?.role === 'chef'
    ? 'chef'
    : auth.user?.role === 'cashier'
      ? 'cashier'
      : 'admin';
const viewMode = ref<string>(defaultMode)

const setViewMode = (mode: string) => {
  if (mode === 'chef' && !canChef.value) return
  if (mode === 'waiter' && !canWaiter.value) return
  if (mode === 'cashier' && !canCashier.value) return
  viewMode.value = mode
}

const updateStatus = async (
  order: any,
  status: OrderStatus
) => {
  const id = order._id || order.id;
  if (!id) return;
  try {
    await $api(`/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
    showToast(`Order status updated to "${status}".`, 'success');
  } catch (e: any) {
    showToast(`Failed to update order status: ${e?.data?.message || e?.message || 'Unknown error'}`, 'error');
    return;
  }
  await pos.fetchOrders();
};
const editPending = (order: any) => {
  const id = order._id || order.id;
  if (!id) return;
  navigateTo(`/?editOrder=${id}`);
};

onMounted(() => {
  pos.fetchOrders();
});

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
    await pos.fetchOrders();
    closePaymentModal()
    showToast('Payment processed successfully.', 'success');
  } catch (e: any) {
    paymentError.value = e?.data?.message || e?.message || 'Payment failed';
    showToast('Failed to process payment. Please try again.', 'error');
  } finally {
    paymentLoading.value = false
  }
}
</script>

<template>
  <Toast />
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">Order List</h2>

    <!-- Admins can toggle which view they want to use -->
    <div v-if="auth.user?.role === 'admin'" class="mb-4 flex gap-2 border-b pb-2">
      <button :class="['px-3 py-1 rounded', viewMode === 'admin' ? 'bg-teal-500 text-white' : 'bg-white']"
        @click="setViewMode('admin')">
        Admin View
      </button>
      <button :class="['px-3 py-1 rounded', viewMode === 'waiter' ? 'bg-teal-500 text-white' : 'bg-white']"
        @click="setViewMode('waiter')">
        Waiter View
      </button>
      <button :class="['px-3 py-1 rounded', viewMode === 'chef' ? 'bg-teal-500 text-white' : 'bg-white']"
        @click="setViewMode('chef')">
        Chef View
      </button>
      <button :class="['px-3 py-1 rounded', viewMode === 'cashier' ? 'bg-teal-500 text-white' : 'bg-white']"
        @click="setViewMode('cashier')">
        Cashier View
      </button>
    </div>

    <div class="mb-4 flex gap-2 border-b pb-2">
      <input type="date" v-model="customDate" @change="dateFilter='custom'" class="px-3 py-1 rounded text-sm border" />
      <button
        v-for="f in [
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'today', label: 'Today' },
          { key: 'all', label: 'All' },
        ]"
        :key="f.key"
        class="px-3 py-1 rounded text-sm border"
        :class="dateFilter === f.key ? 'bg-amber-600 text-white font-medium' : 'bg-white hover:bg-amber-200'"
        @click="dateFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="mb-3 flex gap-2">
      <button v-for="tab in tabs" :key="tab.key" class="px-3 py-1 rounded text-sm border"
        :class="tab.key === active ? 'bg-teal-600 text-white font-medium' : 'hover:bg-teal-600 hover:text-white'"
        @click="setTab(tab.key)">
        {{ tab.label }}
      </button>
    </div>

    <ChefOrdersList v-if="viewMode === 'chef' && canChef" :orders="filtered" @update-status="updateStatus" />
    <WaiterOrdersList v-else-if="viewMode === 'waiter' && canWaiter" :orders="filtered" @edit-pending="editPending"
      @update-status="updateStatus" />
    <CashierOrdersList v-else-if="viewMode === 'cashier' && canCashier" :orders="filtered"
      @process-payment="openPaymentModal" />
    <AdminOrderList v-else-if="auth.user?.role === 'admin'" :orders="filtered" @update-status="updateStatus"
      @edit-pending="editPending" @process-payment="openPaymentModal" />

    <!-- Payment Modal (for cashier) -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="w-full max-w-md bg-white rounded shadow p-6">
        <h3 class="text-lg font-semibold mb-3">Process Payment</h3>
        <div class="mb-2 text-sm text-gray-700">Order #{{ (paymentOrder?._id ||
          paymentOrder?.id)?.toString().slice?.(0, 6) }}</div>
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
