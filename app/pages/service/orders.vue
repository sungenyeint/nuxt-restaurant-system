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
const { openPrintWindow } = usePrint();
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

const api = useRuntimeConfig().public.apiBase;
const printReceipt = (orderId: string) => {
  openPrintWindow(`${api}/print/customer/${orderId}`, true);
};

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
    openPrintWindow(`${api}/print/customer/${id}`, true);
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

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 space-y-4">
        <div class="flex justify-between items-center border-b pb-3">
          <h3 class="text-lg font-semibold">Process Payment</h3>
          <button class="text-gray-500 hover:text-gray-800" @click="closePaymentModal">✕</button>
        </div>

        <p class="text-sm text-gray-700">
          Order #{{ (paymentOrder?._id || paymentOrder?.id)?.toString().slice(0, 6) }}
        </p>
        <p>Total: <span class="font-bold text-emerald-600">${{ Number(paymentOrder?.total || 0).toFixed(2) }}</span></p>

        <label class="block text-sm font-medium">Amount Tendered</label>
        <input
          v-model.number="tendered"
          type="number"
          class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
          min="0" step="0.01"
        />

        <p class="text-sm">Change:
          <span class="font-semibold text-blue-600">
            ${{ (Number(tendered || 0) - Number(paymentOrder?.total || 0)).toFixed(2) }}
          </span>
        </p>

        <div v-if="paymentError" class="text-red-600 text-sm">{{ paymentError }}</div>

        <div class="flex justify-end gap-3 pt-3 border-t">
          <button class="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium0"
            @click="confirmPayment"
            :disabled="paymentLoading">
            {{ paymentLoading ? 'Processing...' : 'Confirm' }}
          </button>
          <button class="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
            @click="printReceipt(paymentOrder?._id || paymentOrder?.id)">
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
