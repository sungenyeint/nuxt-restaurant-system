<script setup lang="ts">
import ChefOrdersList from "~/components/orders/ChefOrdersList.vue";
import WaiterOrdersList from "~/components/orders/WaiterOrdersList.vue";

const { $api } = useNuxtApp();
const orders = ref<any[]>([]);
const auth = useAuthStore();
const canChef = computed(
  () => auth.user?.role === "chef" || auth.user?.role === "admin"
);

const load = async () => {
  orders.value = await $api("/orders/active").catch(() => [] as any[]);
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
  }).catch(() => {});
  await load();
};
const editPending = (order: any) => {
  const id = order._id || order.id;
  if (!id) return;
  navigateTo(`/?editOrder=${id}`);
};

onMounted(load);
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Active Orders</h2>

    <div v-if="orders.length === 0" class="text-gray-500">
      No active orders.
    </div>

    <ChefOrdersList
      v-if="canChef"
      :orders="orders"
      @update-status="updateStatus"
    />
    <WaiterOrdersList v-else :orders="orders" @edit-pending="editPending" />
  </div>
</template>
