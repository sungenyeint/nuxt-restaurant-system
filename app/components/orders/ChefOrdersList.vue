<template>
  <div>
    <div class="mb-3 flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-3 py-1 rounded text-sm border"
        :class="
          tab.key === active ? 'bg-gray-200 font-medium' : 'hover:bg-gray-50'
        "
        @click="active = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="filtered.length === 0" class="text-gray-500">No orders.</div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="o in filtered"
        :key="o._id || o.id"
        class="p-4 rounded-lg bg-white shadow"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="font-mono text-xs">#{{ shortId(o) }}</div>
          <span
            class="text-xs px-2 py-0.5 rounded capitalize"
            :class="statusClass(o.status)"
            >{{ o.status }}</span
          >
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
          <div
            v-for="(it, idx) in o.items"
            :key="idx"
            class="flex justify-between text-sm"
          >
            <div class="truncate">
              {{ idx + 1 }}. {{ it.menu?.name || it.name }}
            </div>
            <div class="font-medium">x{{ it.qty }}</div>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t pt-2">
          <span class="text-sm text-gray-600"
            >Items: {{ o.items?.length || 0 }}</span
          >
          <div class="flex gap-2">
            <button
              v-if="o.status === 'pending'"
              class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              @click="$emit('update-status', o, 'preparing')"
            >
              Start Preparing
            </button>
            <button
              v-else-if="o.status === 'preparing'"
              class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              @click="$emit('update-status', o, 'served')"
            >
              Mark Served
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ orders: any[] }>();
const tabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "served", label: "Served/Ready" },
];
const active = ref<"all" | "pending" | "preparing" | "served">("all");
const filtered = computed(() =>
  active.value === "all"
    ? props.orders
    : props.orders.filter(
        (o) =>
          o.status === active.value ||
          (active.value === "served" && o.status === "ready")
      )
);
const shortId = (o: any) => (o._id || o.id)?.slice?.(0, 6) || o._id || o.id;
const statusClass = (s: string) =>
  s === "pending"
    ? "bg-yellow-100 text-yellow-800"
    : s === "preparing"
    ? "bg-blue-100 text-blue-800"
    : s === "ready"
    ? "bg-purple-100 text-purple-800"
    : s === "served"
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";

defineEmits(["update-status"]);
</script>
