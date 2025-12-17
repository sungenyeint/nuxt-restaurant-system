<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="text-sm text-gray-500">
      {{ label }} <span v-if="sub">– {{ sub }}</span>
    </div>
    <div class="text-xl font-bold">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  sub?: string
}>()
</script>
