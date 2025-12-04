<template>
	<div>
		<div class="mb-3 flex gap-2">
			<button v-for="tab in tabs" :key="tab.key" class="px-3 py-1 rounded text-sm border"
				:class="tab.key === active ? 'bg-teal-600 text-white font-medium' : 'hover:bg-teal-600 hover:text-white'"
				@click="active = tab.key">
				{{ tab.label }}
			</button>
		</div>

		<div v-if="filtered.length === 0" class="text-gray-500">No orders.</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div v-for="o in filtered" :key="o._id || o.id" class="p-4 rounded-lg shadow relative transition-all duration-300"
				  :class="{ 'flash-card': isFlashing(o) }"
				>
				<div class="flex justify-between items-center mb-2">
					<div class="font-mono text-xs">#{{ shortId(o) }}</div>
					<span class="text-xs px-2 py-0.5 rounded capitalize" :class="orderStatusClass(o.status)">{{ o.status
					}}</span>
				</div>
				<div class="text-sm text-gray-700 mb-2">
					{{
						o.orderType === "dine-in"
							? "Table - " + (o.table?.tableNumber ?? "—")
							: "Takeaway"
					}}
				</div>
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
					<button v-if="o.status === 'served'"
						class="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
						@click="$emit('process-payment', o)">
						Process Payment
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const { orderStatusClass } = await import('@/constants/utils');
const props = defineProps<{ orders: any[] }>()
const auth = useAuthStore()
const notify = useNotifyStore()

type TabKey = 'all' | 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
const tabs: Array<{ key: TabKey; label: string }> = [
	{ key: 'all', label: 'All' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'preparing', label: 'Preparing' },
	{ key: 'ready', label: 'Ready to Serve' },
	{ key: 'served', label: 'Served' },
	{ key: 'paid', label: 'Paid' },
]
const active = ref<TabKey>('all')

const filtered = computed(() =>
	active.value === 'all'
		? props.orders || []
		: (props.orders || []).filter(o =>
			active.value === 'served'
					? o.status === 'served'
					: active.value === 'ready'
						? o.status === 'ready'
						: o.status === active.value
		)
)

const { isFlashing } = useOrderFlash(
  filtered,
  notify,
  auth.user?.role
);

const shortId = (o: any) => (o._id || o.id)?.slice?.(0, 6) || o._id || o.id;
defineEmits(["process-payment"])
</script>
