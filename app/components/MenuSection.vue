<!-- components/MenuSection.vue -->
<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Categories -->
    <div class="border-b">
      <div class="flex space-x-1 px-4 py-2">
        <div class="flex space-x-1 px-4 py-2">
          <!-- All tab -->
          <button
            class="px-3 py-1 rounded hover:bg-gray-300 text-sm"
            :class="{ 'bg-gray-300': selectedCategory === null }"
            @click="selectCategory(null)"
          >
            All
          </button>

          <!-- Existing category tabs -->
          <button
            v-for="category in pos.categories"
            :key="category._id || category.id"
            class="px-3 py-1 rounded hover:bg-gray-300 text-sm"
            :class="{
              'bg-gray-300': selectedCategory === (category._id || category.id),
            }"
            @click="selectCategory(category._id || category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="p-4">
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="menu in filteredMenus"
          :key="menu._id || menu.id"
          class="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          @click="$emit('add-to-cart', menu)"
        >
          <div class="mb-3">
            <img
              v-if="menu.image"
              :src="toUrl(menu.image)"
              alt=""
              class="w-full h-32 object-cover rounded"
              @error="onImgError"
            />
            <div
              v-else
              class="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs"
            >
              No image
            </div>
          </div>
          <h3 class="font-medium text-gray-900">{{ menu.name }}</h3>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2">
            {{ menu.description }}
          </p>
          <div class="flex justify-between items-center mt-3">
            <span class="font-semibold text-green-600"
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

const onImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  // simple fallback; feel free to replace with your asset
  img.src = 'https://via.placeholder.co/320x180?text=No+Image'
}

const filteredMenus = computed(() => {
  if (!selectedCategory.value) return pos.menus;
  return pos.menus.filter((menu: any) => {
    const cat = menu.category;
    return (
      cat === selectedCategory.value || cat?._id === selectedCategory.value
    );
  });
});

const selectCategory = (categoryId: string | null) => {
  selectedCategory.value = categoryId;
};

defineEmits(["add-to-cart"]);
</script>
