<!-- pages/index.vue -->
<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b px-6 py-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">POS Dashboard</h1>
        <!-- Header right controls (hidden for chef) -->
        <div class="flex items-center space-x-4" v-if="canPlaceOrder">
          <!-- Order type toggle -->
          <div class="flex rounded overflow-hidden border">
            <button
              class="px-3 py-2 text-sm"
              :class="
                pos.currentOrder.orderType === 'dine-in'
                  ? 'bg-gray-200 font-medium'
                  : 'bg-white'
              "
              @click="pos.setOrderType('dine-in')"
            >
              Dine-in
            </button>
            <button
              class="px-3 py-2 text-sm"
              :class="
                pos.currentOrder.orderType === 'takeaway'
                  ? 'bg-gray-200 font-medium'
                  : 'bg-white'
              "
              @click="pos.setOrderType('takeaway')"
            >
              Takeaway
            </button>
          </div>

          <button
            v-if="canPlaceOrder"
            class="px-3 py-2 rounded bg-green-600 text-white"
            @click="showCart = true"
          >
            Cart ({{ pos.cartItemCount }})
          </button>

          <button
            v-if="canViewOrders"
            class="px-3 py-2 rounded bg-gray-200"
            @click="showOrders = true"
          >
            Active Orders
          </button>
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
                  @click="updateStatus(order, 'paid')"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const auth = useAuthStore();
const pos = usePosStore();
const route = useRoute();
const { $api } = useNuxtApp();
const showCart = ref(false);
const showOrders = ref(false);

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
