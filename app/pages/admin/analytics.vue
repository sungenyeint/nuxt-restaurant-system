<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Analytics</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-4 bg-white rounded shadow">
        <div class="text-sm text-gray-500">Total Revenue</div>
        <div class="text-xl font-bold">${{ totalRevenue.toFixed(2) }}</div>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <div class="text-sm text-gray-500">Paid Orders</div>
        <div class="text-xl font-bold">{{ totalOrders }}</div>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <div class="text-sm text-gray-500">Top Seller</div>
        <div class="text-xl font-bold">{{ topSeller?.name || '-' }}</div>
      </div>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Timeframe:</label>
        <select v-model="mode" class="border rounded p-1 text-sm">
          <option value="preset">Presets / Range</option>
          <option value="month">Select Month</option>
          <option value="year">Select Year</option>
        </select>
        <template v-if="mode === 'preset'">
          <select v-model="timeframe" class="border rounded p-1 text-sm ml-2">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="365">Last 12 months</option>
          </select>
          <button class="ml-2 px-2 py-1 border rounded text-sm" @click="applyPreset(7)">Last 7</button>
          <button class="ml-1 px-2 py-1 border rounded text-sm" @click="applyPreset(30)">Last 30</button>
          <button class="ml-1 px-2 py-1 border rounded text-sm" @click="applyPreset(365)">Last 12 months</button>
        </template>
        <template v-else-if="mode === 'month'">
          <input type="month" v-model="monthPicker" class="border rounded p-1 text-sm ml-2" />
        </template>
        <template v-else>
          <input type="number" v-model.number="yearPicker" min="2000" max="2099" class="border rounded p-1 text-sm ml-2 w-28" />
        </template>
      </div>
      <div class="text-sm">
        <strong>Compare:</strong>
        <span class="ml-2">Current month: ${{ (compare?.currentMonthRevenue ?? 0).toFixed(2) }}</span>
        <span class="ml-4">Previous month: ${{ (compare?.prevMonthRevenue ?? 0).toFixed(2) }}</span>
        <span class="ml-4 font-medium" :class="{ 'text-green-600': (compare?.currentMonthRevenue||0) >= (compare?.prevMonthRevenue||0), 'text-red-600': (compare?.currentMonthRevenue||0) < (compare?.prevMonthRevenue||0) }">
          {{ ((compare?.currentMonthRevenue||0) - (compare?.prevMonthRevenue||0)) >= 0 ? '+' : '' }}${{ (((compare?.currentMonthRevenue||0) - (compare?.prevMonthRevenue||0))).toFixed(2) }}
        </span>
        <button class="ml-4 px-2 py-1 border rounded text-sm" @click="exportCsv">Export CSV</button>
      </div>
    </div>

    <!-- Chart (Chart.js dynamic import) -->
    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="text-sm text-gray-600 mb-2">Revenue</div>
      <div class="overflow-x-auto">
        <canvas ref="chartCanvas" :width="Math.max(600, (buckets.length * barWidth))" :height="chartHeight"></canvas>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4">
      <h3 class="font-semibold mb-3">Best Sellers</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500">
            <th class="pb-2">Item</th>
            <th class="pb-2 text-right">Qty Sold</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bestSellers" :key="item.menuId" class="border-t">
            <td class="py-2">{{ item.name || item.menuId }}</td>
            <td class="py-2 text-right">{{ item.qtySold }}</td>
          </tr>
          <tr v-if="bestSellers.length === 0">
            <td class="py-2" colspan="2">No data</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const totalRevenue = ref<number>(0)
const totalOrders = ref<number>(0)
const bestSellers = ref<any[]>([])
const topSeller = computed(() => bestSellers.value[0])

// Mode and selectors for analytics
const mode = ref<'preset'|'month'|'year'>('preset')
const timeframe = ref<string>('30') // used for presets (days) when mode==='preset'
const monthPicker = ref<string>(new Date().toISOString().slice(0,7)) // YYYY-MM
const yearPicker = ref<number>(new Date().getFullYear())

const buckets = ref<Array<{ label: string; revenue: number }>>([])
const compare = ref<{ currentMonthRevenue: number; prevMonthRevenue: number } | null>(null)

const { $api } = useNuxtApp()

function formatDate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

async function fetchStatsForRange(start: string, end: string) {
  const stats: any = await $api(`/orders/analytics?start=${start}&end=${end}`)
  totalRevenue.value = stats.totalRevenue || 0
  totalOrders.value = stats.totalOrders || 0
  buckets.value = (stats.buckets || []).map((b: any) => ({ label: b.label, revenue: b.revenue }))
  compare.value = stats.compare || null
}

const load = async () => {
  try {
    if (mode.value === 'preset') {
      const days = parseInt(timeframe.value || '30', 10)
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - (days - 1))
      await fetchStatsForRange(formatDate(start), formatDate(end))
    } else if (mode.value === 'month') {
      // monthPicker is YYYY-MM
      await $api // ensure base url available
      const stats: any = await $api(`/orders/analytics?month=${monthPicker.value}`)
      totalRevenue.value = stats.totalRevenue || 0
      totalOrders.value = stats.totalOrders || 0
      buckets.value = (stats.buckets || []).map((b: any) => ({ label: b.label, revenue: b.revenue }))
      compare.value = stats.compare || null
    } else {
      const stats: any = await $api(`/orders/analytics?year=${yearPicker.value}`)
      totalRevenue.value = stats.totalRevenue || 0
      totalOrders.value = stats.totalOrders || 0
      buckets.value = (stats.buckets || []).map((b: any) => ({ label: b.label, revenue: b.revenue }))
      compare.value = stats.compare || null
    }
  } catch (e) {
    totalRevenue.value = 0
    totalOrders.value = 0
    buckets.value = []
    compare.value = null
  }

  try {
    bestSellers.value = await $api('/orders/best-sellers')
  } catch (e) {
    bestSellers.value = []
  }
}

// Trigger load whenever relevant selectors change
watch([mode, timeframe, monthPicker, yearPicker], load, { immediate: true })

function applyPreset(days: number) {
  timeframe.value = String(days)
  load()
}

function exportCsv() {
  let csv = 'Label,Revenue\n'
  for (const b of buckets.value) {
    csv += `${b.label},${b.revenue}\n`
  }
  csv += '\nItem,QtySold\n'
  for (const s of bestSellers.value) {
    csv += `${s.name || s.menuId},${s.qtySold}\n`
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Simple SVG bar chart helpers
const chartHeight = 220
const maxBucket = computed(() => Math.max(1, ...buckets.value.map(b => b.revenue)))
const barWidth = computed(() => Math.max(6, Math.floor(900 / Math.max(1, buckets.value.length))))

// Chart.js dynamic import + rendering
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

async function ensureChartLib() {
  // Try to dynamic import chart.js (installed locally)
  try {
    const mod = await import('chart.js/auto')
    return (mod && (mod as any).default) ? (mod as any).default : (mod as any)
  } catch (e) {
    // Fallback: load from CDN and use global Chart
    if ((window as any).Chart) return (window as any).Chart
    return await new Promise((resolve, reject) => {
      const src = 'https://cdn.jsdelivr.net/npm/chart.js'
      const s = document.createElement('script')
      s.src = src
      s.onload = () => resolve((window as any).Chart)
      s.onerror = reject
      document.head.appendChild(s)
    })
  }
}

import { nextTick, onUnmounted } from 'vue'

async function createChart() {
  await nextTick()
  const Chart = await ensureChartLib()
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  if (chartInstance) {
    try { chartInstance.destroy() } catch (e) { /* ignore */ }
    chartInstance = null
  }

  const labels = buckets.value.map(b => b.label)
  const data = buckets.value.map(b => b.revenue)

  chartInstance = new (Chart as any)(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          backgroundColor: 'rgba(16,185,129,0.9)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { autoSkip: true } },
        y: { beginAtZero: true }
      }
    }
  })
}

watch(buckets, () => {
  createChart().catch(() => {})
}, { immediate: true })

onUnmounted(() => {
  if (chartInstance) {
    try { chartInstance.destroy() } catch (e) { /* ignore */ }
    chartInstance = null
  }
})
</script>
