<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">Tables</h2>

    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="active = tab.key as any"
          class="px-3 py-1 rounded text-sm border"
          :class="active === tab.key ? 'bg-teal-700 text-white' : 'hover:bg-teal-100'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <div>
        <input v-model="q" placeholder="Search tables..." class="border rounded px-3 py-1 text-sm" />
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="t in pos.tables.filter(matchesFilter)"
        :key="t._id"
        class="rounded-lg p-4 border shadow-sm transition"
        :class="tableStatusClass(t.status)"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="font-semibold">Table {{ t.tableNumber }}</div>
            <div class="text-sm text-gray-600">Seats: {{ t.seats }}</div>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full capitalize"
            :class="
              t.status === 'available'
                ? 'bg-green-100 text-green-800'
                : t.status === 'occupied'
                ? 'bg-red-100 text-red-800'
                : t.status === 'reserved'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            "
          >
            {{ t.status }}
          </span>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            class="px-2 py-1 rounded text-sm border"
            :class="t.status === 'available' ? 'bg-white border-green-400 text-green-700 font-medium' : 'bg-white hover:bg-gray-50'"
            @click="setStatus(t, 'available')"
          >
            available
          </button>
          <button
            class="px-2 py-1 rounded text-sm border"
            :class="t.status === 'occupied' ? 'bg-white border-red-400 text-red-700 font-medium' : 'bg-white hover:bg-gray-50'"
            @click="setStatus(t, 'occupied')"
          >
            occupied
          </button>
          <button
            class="px-2 py-1 rounded text-sm border"
            :class="t.status === 'reserved' ? 'bg-white border-yellow-400 text-yellow-700 font-medium' : 'bg-white hover:bg-gray-50'"
            @click="setStatus(t, 'reserved')"
          >
            reserved
          </button>
          <button
            class="px-2 py-1 rounded text-sm border"
            :class="t.status === 'cleaning' ? 'bg-white border-blue-400 text-blue-700 font-medium' : 'bg-white hover:bg-gray-50'"
            @click="setStatus(t, 'cleaning')"
          >
            cleaning
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'waiter' })
const { $api } = useNuxtApp()
import { ref } from 'vue'
import { tableStatusClass } from '~/constants/utils';
const pos = usePosStore();
const tabs = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'cleaning', label: 'Cleaning' },
]
const active = ref<'all'|'available'|'occupied'|'reserved'|'cleaning'>('all')
const q = ref('')

// const load = async () => { tables.value = await $api('/tables') }
const setStatus = async (t:any, status:'available'|'occupied'|'cleaning'|'reserved') => {
  await $api(`/tables/${t._id}/status`, { method: 'PATCH', body: { status : status } });
  await pos.fetchTables();
}

const matchesFilter = (t:any) => {
  if (active.value !== 'all' && t.status !== active.value) return false
  const qv = (q.value || '').toString().trim().toLowerCase()
  if (!qv) return true
  // match table number or seats
  if ((t.tableNumber || '').toString().toLowerCase().includes(qv)) return true
  if ((t.seats || '').toString().toLowerCase().includes(qv)) return true
  return false
}

// const filteredTables = computed(() => pos.tables.filter(matchesFilter))

onMounted(() => pos.fetchTables())
</script>
