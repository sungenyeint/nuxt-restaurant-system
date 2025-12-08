<template>
  <transition name="toast-fade">
    <div
      v-if="toast.visible"
      :class="[
        'fixed top-4 right-4 max-w-sm w-full flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg font-medium text-white z-50 pointer-events-auto',
        toast.type === 'success' ? 'bg-green-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
      ]"
    >
      <!-- Icon -->
      <span v-if="toast.type === 'success'" class="w-5 h-5 flex-shrink-0">✅</span>
      <span v-else-if="toast.type === 'info'" class="w-5 h-5 flex-shrink-0">ℹ️</span>
      <span v-else class="w-5 h-5 flex-shrink-0">⚠️</span>

      <!-- Message -->
      <div class="flex-1 text-sm break-words">{{ toast.message }}</div>

      <!-- Close button -->
      <button @click="toast.visible = false" class="ml-2 text-white hover:opacity-80">✕</button>
    </div>

  </transition>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

const toast = inject<Ref<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>>('toast');
if (!toast) throw new Error('Toast not provided!');
</script>

<style>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
