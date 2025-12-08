<template>
	<div>
		<div v-if="props.orders.length === 0" class="text-gray-500">No orders.</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div v-for="o in props.orders" :key="o._id || o.id"
				class="p-4 rounded-lg shadow relative transition-all duration-300"
				:class="{ 'flash-card': isFlashing(o) }">
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
import { orderStatusClass, shortId } from '~/constants/utils';
const props = defineProps<{
	orders: any[]
}>();
const auth = useAuthStore()
const notify = useNotifyStore()

const { isFlashing } = useOrderFlash(
	computed(() => props.orders),
	notify,
	auth.user?.role
);
defineEmits(["process-payment"]);

</script>
