<template>
	<div>
		<div class="mb-3 flex gap-2">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				class="px-3 py-1 rounded text-sm border"
				:class="tab.key === active ? 'bg-gray-200 font-medium' : 'hover:bg-gray-50'"
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
					<span class="text-sm text-gray-600">Items: {{ o.items?.length || 0 }}</span>
					<div class="flex gap-2 items-center">
						<div class="text-sm font-semibold mr-2">${{ Number(o.total || 0).toFixed(2) }}</div>
						<button
							v-if="o.status === 'served' || o.status === 'ready'"
							class="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
							@click="$emit('process-payment', o)"
						>
							Process Payment
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{ orders: any[] }>()

type TabKey = 'all' | 'pending' | 'preparing' | 'served' | 'paid';
const tabs: Array<{ key: TabKey; label: string }> = [
	{ key: 'all', label: 'All' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'preparing', label: 'Preparing' },
	{ key: 'served', label: 'Served/Ready' },
    { key: 'paid', label: 'Paid' },
]
const active = ref<TabKey>('all')

const filtered = computed(() =>
	active.value === 'all'
		? props.orders || []
		: (props.orders || []).filter(o =>
				active.value === 'served'
					? (o.status === 'served' || o.status === 'ready')
					: o.status === active.value
			)
)

const shortId = (o: any) => (o._id || o.id)?.slice?.(0, 6) || o._id || o.id
const statusClass = (s: string) =>
	s === "pending"
		? "bg-yellow-100 text-yellow-800"
		: s === "preparing"
		? "bg-blue-100 text-blue-800"
		: s === "ready"
		? "bg-purple-100 text-purple-800"
		: s === "served"
		? "bg-green-100 text-green-800"
		: "bg-gray-100 text-gray-800"

defineEmits(["process-payment"])
</script>

*** End Patch
