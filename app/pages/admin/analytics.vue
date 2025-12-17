<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <h2 class="text-2xl font-semibold">Analytics</h2>

    <!-- Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard label="Revenue" :value="currency(totalRevenue)" :sub="reportLabel" />
      <SummaryCard label="Paid Orders" :value="totalOrders" />
      <SummaryCard label="Top Seller" :value="topSeller?.name || '-'" />
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center justify-start gap-4">
      <div class="flex items-center gap-3">
        <select v-model="timeframe" class="border rounded px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="year">Current Year</option>
          <option value="month">Current Month</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="custom">Custom Date</option>
        </select>

        <input v-if="timeframe === 'custom'" type="date" v-model="customDate"
          class="border rounded px-2 py-1 text-sm" />
      </div>

      <button class="px-3 py-2 rounded bg-teal-500 text-white text-sm" @click="exportCsv">
        Export CSV
      </button>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded shadow p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">Revenue Chart</h3>

        <div class="flex gap-2">
          <button class="px-3 py-1 rounded text-sm"
            :class="chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'" @click="chartType = 'line'">
            Line
          </button>
          <button class="px-3 py-1 rounded text-sm"
            :class="chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200'" @click="chartType = 'bar'">
            Bar
          </button>
        </div>
      </div>

      <div class="relative h-64">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Revenue Table -->
    <div class="bg-white rounded shadow p-4">
      <h3 class="font-semibold mb-3">Revenue Breakdown</h3>

      <table class="w-full text-sm">
        <thead class="text-gray-500 border-b">
          <tr>
            <th class="py-2 text-left">Date</th>
            <th class="py-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in buckets" :key="b.label" class="border-b">
            <td v-if="b.revenue !== 0" class="py-2">{{ b.label }}</td>
            <td v-if="b.revenue !== 0" class="py-2 text-right">{{ currency(b.revenue) }}</td>
          </tr>
          <tr v-if="!buckets.length">
            <td colspan="2" class="py-4 text-center text-gray-400">No data</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Best Sellers -->
    <div class="bg-white rounded shadow p-4">
      <h3 class="font-semibold mb-3">Best Sellers</h3>

      <table class="w-full text-sm">
        <thead class="text-gray-500 border-b">
          <tr>
            <th class="py-2 text-left">Item</th>
            <th class="py-2 text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bestSellers" :key="item.menuId" class="border-b">
            <td class="py-2">{{ item.name || item.menuId }}</td>
            <td class="py-2 text-right">{{ item.qtySold }}</td>
          </tr>
          <tr v-if="!bestSellers.length">
            <td colspan="2" class="py-4 text-center text-gray-400">No data</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import Chart from 'chart.js/auto'

const { $api } = useNuxtApp()

/* =====================
   STATE
===================== */
const totalRevenue = ref(0)
const totalOrders = ref(0)
const buckets = ref<{ label: string; revenue: number }[]>([])
const bestSellers = ref<any[]>([])

const timeframe = ref<'month' | 'today' | 'yesterday' | 'year' | 'custom' | 'all'>('month')
const customDate = ref('')
const reportLabel = ref('Current Month')

/* =====================
   CHART
===================== */
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartType = ref<'line' | 'bar'>('line')
let chart: Chart | null = null

const topSeller = computed(() => bestSellers.value[0])

const fmt = (d: Date) => d.toISOString().slice(0, 10)
const currency = (v: number) => `$${v.toFixed(2)}`

/* =====================
   LOAD DATA
===================== */
async function load(start?: string, end?: string, label = '') {
  reportLabel.value = label

  try {
    const query =
      start && end ? `?start=${start}&end=${end}` : ''
    const res: any = await $api(`/orders/analytics${query}`)

    totalRevenue.value = res.totalRevenue || 0
    totalOrders.value = res.totalOrders || 0
    buckets.value = res.buckets || []
  } catch {
    buckets.value = []
  }
}

/* =====================
   TIMEFRAME HANDLER
===================== */
watch([timeframe, customDate], () => {
  const now = new Date()

  if (timeframe.value === 'today') {
    load(fmt(now), fmt(now), 'Today')
  }

  if (timeframe.value === 'yesterday') {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    load(fmt(d), fmt(d), 'Yesterday')
  }

  if (timeframe.value === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    load(fmt(start), fmt(end), 'Current Month')
  }

  if (timeframe.value === 'year') {
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear(), 11, 31)
    load(fmt(start), fmt(end), 'Current Year')
  }

  if (timeframe.value === 'custom' && customDate.value) {
    load(customDate.value, customDate.value, customDate.value)
  }

  if (timeframe.value === 'all') {
    load(undefined, undefined, 'All Time')
  }
})

function groupByMonth(data: { label: string; revenue: number }[]) {
  const map: Record<string, number> = {}

  data.forEach(b => {
    const d = new Date(b.label)
    const month = d.toLocaleString('en-US', { month: 'short' })
    map[month] = (map[month] || 0) + b.revenue
  })

  return Object.entries(map).map(([label, revenue]) => ({
    label,
    revenue
  }))
}

/* =====================
   CHART RENDER
===================== */
watch([buckets, chartType], async () => {
  await nextTick()
  if (!chartCanvas.value) return

  chart?.destroy()

  const chartBuckets =
    timeframe.value === 'year' || timeframe.value === 'all'
      ? groupByMonth(buckets.value)
      : buckets.value

  chart = new Chart(chartCanvas.value, {
    type: chartType.value,
    data: {
      labels: chartBuckets.map(b => b.label),
      datasets: [{
        data: chartBuckets.map(b => b.revenue),
        label: 'Revenue',
        fill: chartType.value === 'line',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  })
})

/* =====================
   INIT
===================== */
onMounted(async () => {
  const res = await $api('/orders/best-sellers')
  bestSellers.value = res || [];
  const now = new Date()

  if (timeframe.value === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    load(fmt(start), fmt(end), 'Current Month')
  }
})

onUnmounted(() => chart?.destroy())

/* =====================
   EXPORT
===================== */
function exportCsv() {
  let csv = 'Label,Revenue\n'
  buckets.value.forEach(b => (csv += `${b.label},${b.revenue}\n`))
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'analytics.csv'
  a.click()
}
</script>
