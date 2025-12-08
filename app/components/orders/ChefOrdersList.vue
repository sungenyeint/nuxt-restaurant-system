<template>
  <div>
    <div v-if="props.orders.length === 0" class="text-gray-500">No orders.</div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="o in props.orders" :key="o._id || o.id" class="p-4 rounded-lg shadow relative transition-all duration-300"
        :class="{ 'flash-card': isFlashing(o) }">
        <div class="flex justify-between items-center mb-2">
          <div class="font-mono text-xs">Order #{{ shortId(o) }}</div>
          <div class="flex items-center gap-2">
            <!-- Status Badge -->
            <span class="text-xs px-2 py-0.5 rounded-full font-medium capitalize" :class="orderStatusClass(o.status)">
              {{ o.status }}
            </span>
          </div>
        </div>
        <div class="text-sm text-gray-700 mb-2">
          {{
            o.orderType === "dine-in"
              ? "Table - " + (o.table?.tableNumber ?? "—")
              : "Takeaway"
          }}
        </div>
        <div v-if="o.notes" class="my-2 p-2 rounded bg-red-100 text-red-800 text-sm">
          notes : {{ o.notes }}
        </div>
        <div class="border-t pt-2 space-y-1">
          <div v-for="(it, idx) in o.items" :key="idx" class="flex justify-between text-sm">
            <div class="truncate">
              {{ idx + 1 }}. {{ it.menu?.name || it.name }}
            </div>
            <div class="font-medium">x{{ it.qty }}</div>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t pt-2">
          <span class="text-sm text-gray-600">Items: {{ o.items?.length || 0 }}</span>
          <div class="flex gap-2">
            <button v-if="o.status === 'pending'" class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              @click="$emit('update-status', o, 'preparing')">
              Start Preparing
            </button>
            <button v-else-if="o.status === 'preparing'"
              class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              @click="$emit('update-status', o, 'ready')">
              Ready to Serve
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { orderStatusClass, tabs, shortId } from '~/constants/utils';
import type { TabKey } from '~/types';
const props = defineProps<{
  orders: any[],
}>();
const auth = useAuthStore();
const notify = useNotifyStore();

const { isFlashing } = useOrderFlash(
  computed(() => props.orders),
  notify,
  auth.user?.role
);

defineEmits(["update-status"]);
</script>
