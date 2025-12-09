<!-- pages/index.vue -->
<template>
  <!-- Global Loading Overlay -->
  <div v-if="pos.globalLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="flex flex-col items-center gap-3">
      <div class="animate-spin w-12 h-12 border-4 border-gray-300 border-t-sky-500 rounded-full"></div>
      <div class="text-white text-lg font-medium">Loading...</div>
    </div>
  </div>
  <Toast />
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-2xl font-semibold text-gray-800">POS Dashboard</h1>
          <!-- Header right controls (hidden for chef) -->
          <div class="flex items-center space-x-4" v-if="canPlaceOrder">
            <!-- Order type toggle -->
            <div class="flex rounded overflow-hidden bg-gray-100 p-1">
              <button class="px-3 py-1.5 text-sm rounded" :class="pos.currentOrder.orderType === 'dine-in'
                ? 'bg-white text-sky-700 font-semibold'
                : 'text-gray-700'
                " @click="pos.setOrderType('dine-in')">
                Dine-in
              </button>
              <button class="px-3 py-1.5 text-sm rounded" :class="pos.currentOrder.orderType === 'takeaway'
                ? 'bg-white text-sky-700 font-semibold'
                : 'text-gray-700'
                " @click="pos.setOrderType('takeaway')">
                Takeaway
              </button>
            </div>

            <button v-if="canPlaceOrder"
              class="relative px-3 py-1.5 rounded bg-sky-600 text-white font-semibold transition hover:bg-sky-700"
              :class="{
                'opacity-50 cursor-not-allowed': pos.cartItemCount === 0,
                'animate-heartbeat shadow-xl ring-2 ring-sky-300': pos.cartItemCount > 0
              }" :disabled="pos.cartItemCount === 0" @click="showCart = true">
              Cart

              <span v-if="pos.cartItemCount > 0"
                class="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {{ pos.cartItemCount }}
              </span>
            </button>



            <button v-if="canViewOrders"
              class="px-3 py-1.5 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
              @click="showOrders = true">
              Active Orders
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 grid grid-cols-4 gap-6 p-6 bg-gray-50">
      <!-- Tables Section -->
      <div class="col-span-1">
        <TablesSection v-if="canPlaceOrder && pos.currentOrder.orderType === 'dine-in'" @select-table="pos.setTable" />
        <TablesSection v-else />
      </div>
      <!-- Menu Section -->
      <div class="col-span-3">
        <MenuSection @add-to-cart="onAddToCart" />
      </div>
    </div>

    <!-- Cart Panel (slideover-like) -->
    <div v-if="showCart" class="fixed inset-0 bg-black/40 flex justify-end">
      <div class="w-full max-w-md h-full bg-white">
        <CartPanel @close="showCart = false" @confirm-submit="confirmSubmit" />
      </div>
    </div>

    <!-- Confirm Order -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black/40 flex justify-end">
      <div class="w-full max-w-md h-full bg-white">
        <OrderConfirm @close="showConfirm = false" @submit-order="handleSubmitOrder"
          @back="showConfirm = false; showCart = true;" />
      </div>
    </div>

    <!-- Active Orders Panel -->
    <div v-if="showOrders" class="fixed inset-0 bg-black/40 flex justify-end">
      <div class="w-full max-w-md h-full bg-white p-6 flex flex-col">
        <div class="flex justify-between items-center border-b pb-3">
          <h2 class="text-lg font-semibold">Active Orders</h2>
          <button class="text-gray-600 hover:text-gray-900" @click="showOrders = false">
            ✕
          </button>
        </div>
        <h3 class="text-gray mt-2 font-semibold">{{ new Date().toLocaleDateString('en-GB') }}</h3>
        <div class="flex-1 overflow-y-auto mt-4 space-y-3">
          <div v-if="activeOrders.length === 0" class="text-gray-500">
            No active orders yet.
          </div>
          <div v-for="order in activeOrders" :key="order._id || order.id" class="border rounded p-3">
            <div class="flex justify-between items-center mb-2">
              <div class="font-mono text-xs">#{{
                (order._id || order.id).slice?.(0, 6) || order._id || order.id
              }}</div>
              <div class="flex items-center gap-2">
                <!-- Status Badge -->
                <span class="text-xs px-2 py-0.5 rounded font-medium capitalize"
                  :class="orderStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
            </div>
            <div class="font-medium">
              {{
                order.orderType === "dine-in"
                  ? "Table : " + order.table?.tableNumber
                  : "takeaway"
              }}
            </div>
            <div v-for="(it, idx) in order.items || []" :key="idx" class="grid grid-cols-12 gap-2 py-1 text-xs">
              <div class="col-span-6 text-gray-800 truncate">
                {{ idx + 1 }}. {{ it.menu?.name || it.name }}
              </div>
              <div class="col-span-2 text-right">
                ${{ Number(it.menu?.price ?? it.price ?? 0).toFixed(2) }}
              </div>
              <div class="col-span-1 text-right">
                {{ it.qty }}
              </div>
              <div class="col-span-3 text-right font-medium">
                ${{ Number((it.menu?.price ?? it.price ?? 0) * (it.qty ?? 1)).toFixed(2) }}
              </div>
            </div>
            <div class="text-right text-sm font-medium mt-2 border-t pt-2">
              Total : ${{
                Number(order.total || 0).toFixed(2)
              }}
            </div>
            <div class="mt-3 flex items-center justify-end text-sm border-t pt-3">
              <div class="flex items-center gap-2">
                <button v-if="canChef && order.status === 'pending'"
                  class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  @click="updateStatus(order, 'preparing')">
                  Start Preparing
                </button>
                <button v-else-if="canChef && order.status === 'preparing'"
                  class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  @click="updateStatus(order, 'ready')">
                  Ready to Served
                </button>
                <button v-else-if="canWaiter && order.status === 'ready'"
                  class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  @click="updateStatus(order, 'served')">
                  Make Served
                </button>
                <button v-if="
                  canCashier &&
                  (order.status === 'served')
                " class="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  @click="openPaymentModal(order)">
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { useToast } from '~/composables/useToast';
import { orderStatusClass } from '@/constants/utils';
import dayjs from 'dayjs';
const { openPrintWindow } = usePrint();

const { showToast } = useToast();

const auth = useAuthStore();
const pos = usePosStore();
const route = useRoute();
const { $api } = useNuxtApp();
const showCart = ref(false);
const showOrders = ref(false);
const showConfirm = ref(false);

// Payment modal state
const showPaymentModal = ref(false)
const paymentOrder = ref<any | null>(null)
const tendered = ref<number | null>(null)
const paymentLoading = ref(false)
const paymentError = ref<string | null>(null)
const api = useRuntimeConfig().public.apiBase;

const printReceipt = (orderId: string) => {
  openPrintWindow(`${api}/print/customer/${orderId}`, true);
};

onBeforeRouteLeave((to, from) => {
  if (pos.cartItemCount > 0) {
    const leave = confirm(
      'You have items in your cart. Are you sure you want to leave this page?'
    )
    if (!leave) return false
  }
})

const activeOrders = computed(() => {
  return pos.activeOrders.filter(o => {
    return dayjs(o.createdAt).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
  });
});

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
    await pos.fetchOrders?.()
    closePaymentModal()
    showToast('Payment processed successfully!', 'success');
    openPrintWindow(`${api}/print/customer/${id}`, true);
  } catch (e: any) {
    paymentError.value = e?.data?.message || e?.message || 'Payment failed'
    showToast('Failed to process payment. Please try again.', 'error');
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
const canWaiter = computed(
  () => auth.user?.role === "waiter" || auth.user?.role === "admin"
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
    // Load order into POS
    await pos.loadOrder(editId);
    showCart.value = true;

    // Remove query param from URL
    navigateTo('/', { replace: true });
  } else {
    // No query, ensure current order is cleared
    pos.clearCurrentOrder?.();
  }
});

const onAddToCart = (item: any) => {
  if (!canPlaceOrder.value) return;
  pos.addToCart(item);
};

const updateStatus = async (
  order: any,
  status: "pending" | "preparing" | "ready" | "served" | "paid"
) => {
  const id = order._id || order.id;
  if (!id) return;

  // If marking as paid, confirm with the cashier to avoid accidental changes
  if (status === 'paid' && (canCashier.value || (auth.user?.role === 'admin'))) {
    const ok = confirm(`Mark order #${(id + '').slice(0, 6)} as paid?`)
    if (!ok) return
  }

  try {
    await $api(`/orders/${id}/status`, { method: "PATCH", body: { status } });
    showToast(`Order status updated to "${status}".`, 'success');
    await pos.fetchOrders?.();
  } catch (e) {
    showToast(`Failed to update order status.`, 'error');
  }
};

const confirmSubmit = () => {
  showCart.value = false;
  showConfirm.value = true;
};

const handleSubmitOrder = async () => {
  try {
    if (pos.currentOrder.orderType === "dine-in" && !pos.currentOrder.tableId) {
      alert("Please select a table for dine-in orders.");
      return;
    }

    showConfirm.value = false;
    const order = await pos.submitOrder();

    showToast('Order submitted successfully!', 'success');
    openPrintWindow(`${api}/print/kitchen/${order._id}`, true);
  } catch (error) {
    showToast('Failed to submit order. Please try again.', 'error');
  }
};

</script>
