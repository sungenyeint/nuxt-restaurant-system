<!-- components/MenuSection.vue -->
<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Categories -->
    <div class="border-b">
      <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center space-x-1">
          <!-- All tab -->
          <button
            class="px-3 py-1 rounded hover:bg-teal-300 text-sm"
            :class="{ 'bg-teal-500 text-white': selectedCategory === null }"
            @click="selectCategory(null)"
          >
            All
        </button>
          <!-- Existing category tabs -->
          <button
            v-for="category in pos.categories"
            :key="category._id || category.id"
            class="px-3 py-1 rounded hover:bg-teal-500 hover:text-white text-sm"
            :class="{
              'bg-teal-500 text-white': selectedCategory === (category._id || category.id),
            }"
            @click="selectCategory(category._id || category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
      <!-- Search input -->
      <div class="m-4">
        <div class="relative">
          <input
            v-model="search"
            placeholder="Search menu..."
            class="border rounded pl-9 pr-8 py-2 text-sm w-64"
          />
          <svg class="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
          </svg>
          <button v-if="search" @click="search = ''" class="absolute right-1 top-1/2 -translate-y-1/2 text-sm text-gray-500 px-2">✕</button>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="p-4">
      <div class="grid grid-cols-4 gap-6">
        <div
          v-for="menu in filteredMenus"
          :key="menu._id || menu.id"
          class="bg-white/80 border rounded-lg p-4 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition relative overflow-hidden"
          @click="$emit('add-to-cart', menu)"
        >
          <div class="mb-3 rounded overflow-hidden">
            <img
              v-if="menu.image"
              :src="toUrl(menu.image)"
              alt=""
              class="w-full h-36 object-cover rounded"
              @error="onImgError"
            />
            <div
              v-else
              class="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center text-gray-500 text-xs"
            >
              No image
            </div>
          </div>
          <h3 class="font-medium text-gray-900">{{ menu.name }}</h3>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2">
            {{ menu.description }}
          </p>
          <div class="flex justify-between items-center mt-3">
            <span class="font-semibold text-teal-600"
              >${{ Number(menu.price).toFixed(2) }}</span
            >
            <span
              v-if="menu.isAvailable === false"
              class="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700"
              >Unavailable</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pos = usePosStore();
const { toUrl } = useFileUrl();
const selectedCategory = ref<string | null>(null);
const search = ref<string>('')

const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  // simple fallback; feel free to replace with your asset
  img.src = 'https://via.placeholder.co/320x180?text=No+Image'
}

const filteredMenus = computed(() => {
  const q = (search.value || '').trim().toLowerCase()
  return pos.menus.filter((menu: any) => {
    // Category filter
    if (selectedCategory.value) {
      const cat = menu.category
      const catId = cat?._id || cat
      if (String(catId) !== String(selectedCategory.value)) return false
    }

    // Search filter: name or description
    if (!q) return true
    const name = String(menu.name || '').toLowerCase()
    const desc = String(menu.description || '').toLowerCase()
    return name.includes(q) || desc.includes(q)
  })
})

const selectCategory = (categoryId: string | null) => {
  selectedCategory.value = categoryId;
};

defineEmits(["add-to-cart"]);
</script>
