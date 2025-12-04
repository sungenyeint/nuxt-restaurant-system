<template>
  <div class="space-y-6">
    <!-- Dine-in grouped by table -->
    <div class="rounded-lg shadow p-4 bg-white">
      <div class="text-md uppercase font-semibold text-gray-500 mb-2 border-b pb-2">Dine-in</div>
      <div v-if="grouped.dine.length === 0" class="text-gray-500">
        No dine-in orders.
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="grp in grouped.dine" :key="grp.tableKey" class="bg-white rounded shadow p-4">
          <div class="font-semibold mb-2">
            Table {{ grp.tableNumber || "—" }}
          </div>
          <div class="space-y-2">
            <div v-for="o in grp.orders" :key="o._id || o.id"
              class="p-4 relative transition-all duration-300"
              :class="{ 'flash-card': isFlashing(o) }">
              <div class="flex justify-between items-center">
                <div class="font-mono text-xs">#{{ shortId(o) }}</div>
                <span class="text-xs px-2 py-0.5 rounded capitalize" :class="orderStatusClass(o.status)">{{ o.status
                }}</span>
              </div>
              <!-- Notes (special instructions) -->
              <div v-if="o.notes" class="mt-2 p-2 rounded bg-red-100 text-red-800 text-xs">
                notes : {{ o.notes }}
              </div>

              <!-- Items details -->
              <div class="mt-2 border-t pt-2">
                <div class="text-sm text-black grid grid-cols-12 gap-2 pb-1">
                  <div class="col-span-6">Item</div>
                  <div class="col-span-2 text-right">Price</div>
                  <div class="col-span-1 text-right">Qty</div>
                  <div class="col-span-3 text-right">Total</div>
                </div>

                <div v-for="(it, idx) in o.items || []" :key="idx" class="grid grid-cols-12 gap-2 py-1 text-xs">
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
                    Number(o.total || 0).toFixed(2)
                  }}
                </div>
                <div class="flex gap-2 float-end mt-4">
                  <button v-if="o.status === 'pending'"
                    class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-emerald-700"
                    @click="$emit('edit-pending', o)">
                    Edit
                  </button>
                  <button v-else-if="o.status === 'ready'"
                    class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    @click="$emit('update-status', o, 'served')">
                    Ready to Serve
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Takeaway -->
    <div class="rounded-lg shadow p-4 bg-white">
      <div class="text-md uppercase font-semibold text-gray-500 mb-2 border-b pb-2">Takeaway</div>
      <div v-if="grouped.takeaway.length === 0" class="text-gray-500">
        No takeaway orders.
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="o in grouped.takeaway" :key="o._id || o.id"
          class="p-4 rounded-lg shadow relative transition-all duration-300" :class="{ 'flash-card': isFlashing(o) }">
          <div class="flex justify-between items-center">
            <div class="font-mono text-xs">#{{ shortId(o) }}</div>
            <span class="text-xs px-2 py-0.5 rounded capitalize" :class="orderStatusClass(o.status)">{{ o.status }}</span>
          </div>
          <!-- Notes (special instructions) -->
          <div v-if="o.notes" class="mt-2 p-2 rounded bg-red-100 text-red-800 text-xs">
            notes : {{ o.notes }}
          </div>

          <!-- Items details -->
          <div class="mt-2 border-t pt-2">
            <div class="text-sm text-black grid grid-cols-12 gap-2 pb-1">
              <div class="col-span-6">Item</div>
              <div class="col-span-2 text-right">Price</div>
              <div class="col-span-1 text-right">Qty</div>
              <div class="col-span-3 text-right">Total</div>
            </div>

            <div v-for="(it, idx) in o.items || []" :key="idx" class="grid grid-cols-12 gap-2 py-1 text-xs">
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
                Number(o.total || 0).toFixed(2)
              }}
            </div>
          </div>
          <div class="flex gap-2 float-end mt-4">
            <button v-if="o.status === 'pending'" class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-emerald-700"
              @click="$emit('edit-pending', o)">
              Edit
            </button>
            <button v-else-if="o.status === 'ready'"
              class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
              @click="$emit('update-status', o, 'served')">
              Ready to Serve
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { orderStatusClass } = await import('@/constants/utils');
const props = defineProps<{ orders: any[] }>();
const auth = useAuthStore();
const notify = useNotifyStore();

const dine = computed(() =>
  props.orders.filter((o) => o.orderType === "dine-in")
);
const takeaway = computed(() =>
  props.orders.filter((o) => o.orderType !== "dine-in")
);
const groupByTable = (arr: any[]) => {
  const map = new Map<string, any[]>();
  for (const o of arr) {
    const key = (o.table?._id || o.table || "none") as string;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  return Array.from(map.entries()).map(([tableKey, orders]) => ({
    tableKey,
    tableNumber: orders[0]?.table?.tableNumber,
    orders,
  }));
};
const grouped = computed(() => ({
  dine: groupByTable(dine.value),
  takeaway: takeaway.value,
}));
const { isFlashing } = useOrderFlash(
  (computed(() => [...dine.value, ...takeaway.value])),
  notify,
  auth.user?.role
);
const shortId = (o: any) => (o._id || o.id)?.slice?.(0, 6) || o._id || o.id;
defineEmits(["edit-pending", "update-status"]);
</script>
