<template>
  <div class="min-h-screen">
    <header class="bg-teal-700 text-white shadow-md">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 flex items-center justify-center">
              <LucideStore class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-xl font-semibold">Restaurant POS</h1>
          </div>

          <div class="flex items-center space-x-4">
            <div class="text-sm text-white/90">
              Welcome, {{ auth.user?.name }}
            </div>

            <!-- Bell notification for chefs -->
            <button
              v-if="auth.user?.role === 'chef' || auth.user?.role === 'admin' || auth.user?.role === 'waiter' || auth.user?.role === 'cashier'"
              class="relative px-2 py-1 rounded hover:bg-white/10" @click="goOrders(auth.user?.role)"
              title="New orders">
              <!-- bell icon: normal or crossed when notifications disabled -->
              <LucideBell v-if="notify.enabled" class="h-5 w-5 text-white/50" />
              <LucideBellOff v-else class="h-5 w-5 text-white/95" />
              <span v-if="roleCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center
                       text-[10px] font-semibold w-5 h-5 rounded-full bg-red-500 text-white">
                {{ roleCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="h-[calc(100vh-4rem)] flex overflow-hidden">

      <!-- Sidebar -->
      <aside class="bg-teal-600 text-white flex flex-col h-full transition-all duration-300 ease-in-out z-40" :class="[
        isMobile
          ? (sidebarOpen ? 'w-16 p-2' : 'w-16 p-2')
          : (sidebarOpen ? 'w-60 p-4' : 'w-16 p-2')
      ]">
        <nav class="space-y-1 overflow-y-auto">
          <!-- Cashier/Admin -->
          <NuxtLink v-if="
            auth.user?.role === 'cashier' ||
            auth.user?.role === 'waiter' ||
            auth.user?.role === 'chef' ||
            auth.user?.role === 'admin'
          " to="/" class="flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition mb-3"
            :class="isActive('/') ? 'bg-white/30' : 'text-white/90'" @click="sidebarOpen = false" title="POS Dashboard">
            <LucideStore class="w-5 h-5" />
            <!-- Hide text when collapsed (desktop only) -->
            <span v-if="!isMobile && sidebarOpen">POS Dashboard</span>
          </NuxtLink>

          <!-- Service: Waiter/Chef/Cashier/Admin -->
          <template v-if="
            auth.user?.role === 'waiter' ||
            auth.user?.role === 'chef' ||
            auth.user?.role === 'cashier' ||
            auth.user?.role === 'admin'
          ">
            <div class="text-xs uppercase text-teal-500 mt-4 mb-2">
              Service
            </div>
            <NuxtLink to="/service/orders" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/service/orders') ? 'bg-white/30' : 'text-white/90',
            ]" title="Orders">
              <LucideListOrdered class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Orders</span>
            </NuxtLink>
            <NuxtLink v-if="
              auth.user?.role === 'waiter' || auth.user?.role === 'admin'
            " to="/service/tables" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/service/tables') ? 'bg-white/30' : 'text-white/90',
            ]" title="Tables">
              <LucideTable2 class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Tables</span>
            </NuxtLink>
          </template>

          <!-- Admin -->
          <template v-if="auth.user?.role === 'admin'">
            <div class="text-xs uppercase text-teal-500 mt-4 mb-2">Admin</div>
            <NuxtLink to="/admin/analytics" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/admin/analytics', { startsWith: true }) ? 'bg-white/30' : 'text-white/90',
            ]" title="Analytics">
              <LucideChartBar class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Analytics</span>
            </NuxtLink>
            <NuxtLink to="/admin/menus" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/admin/menus', { startsWith: true }) ? 'bg-white/30' : 'text-white/90',
            ]" title="Manage Menus">
              <LucideMenuSquare class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Manage Menus</span>
            </NuxtLink>

            <NuxtLink to="/admin/categories" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/admin/categories', { startsWith: true }) ? 'bg-white/30' : 'text-white/90',
            ]" title="Manage Categories">
              <LucideList class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Manage Categories</span>
            </NuxtLink>
            <NuxtLink to="/admin/tables" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/admin/tables', { startsWith: true }) ? 'bg-white/30' : 'text-white/90',
            ]" title="Manage Tables">
              <LucideTableConfig class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Manage Tables</span>
            </NuxtLink>
            <NuxtLink to="/admin/users" :class="[
              'flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition',
              isActive('/admin/users', { startsWith: true }) ? 'bg-white/30' : 'text-white/90',
            ]" title="Manage Users">
              <LucideUserCircle class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Manage Users</span>
            </NuxtLink>
          </template>
        </nav>
        <div class="mt-4 space-y-3">
          <!-- Admin: Notifications toggle -->
          <div v-if="auth.user?.role === 'admin'" class="flex items-center justify-between px-2"
            :class="!sidebarOpen ? 'p-2 rounded hover:bg-teal-500/80' : ''" title="Toggle Notification">
            <LucideBell v-if="notify.enabled" @click="notify.toggleEnabled()" class="w-5 h-5" />
            <LucideBellOff v-else @click="notify.toggleEnabled()" class="w-5 h-5" />
            <span v-if="!isMobile && sidebarOpen" class="text-sm">Notifications</span>
            <button v-if="!isMobile && sidebarOpen" @click="notify.toggleEnabled()"
              class="ml-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-sm" :aria-pressed="!notify.enabled"
              :title="notify.enabled ? 'Disable notifications' : 'Enable notifications'">
              <span v-if="notify.enabled">On</span>
              <span v-else>Off</span>
            </button>
          </div>

          <div>
            <button class="flex items-center gap-3 px-2 py-2 rounded hover:bg-teal-500/80 transition w-full"
              title="Logout" @click="handleLogout">
              <LucideLogOut class="w-5 h-5" />
              <span v-if="!isMobile && sidebarOpen">Logout</span>
            </button>
          </div>
        </div>
        <!-- Sidebar bottom toggle -->
        <div
          class="mt-auto pt-3 border-t border-white/20 flex justify-center"
        >
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white/10 hover:bg-white/20 transition w-full justify-center"
            :title="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
          >
            <LucideChevronLeft
              v-if="sidebarOpen"
              class="w-5 h-5"
            />
            <LucideChevronRight
              v-else
              class="w-5 h-5"
            />

            <span
              v-if="sidebarOpen && !isMobile"
              class="text-sm"
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      <!-- Page content -->
      <section class="flex-1 p-4 overflow-y-auto">
        <slot />
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { LucideBell, LucideBellOff, LucideChartBar, LucideChevronLeft, LucideChevronRight, LucideList, LucideListOrdered, LucideLogOut, LucideMenu, LucideMenuSquare, LucideSidebarClose, LucideStore, LucideTable2, LucideTableConfig, LucideUserCircle } from 'lucide-vue-next';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
const auth = useAuthStore();
const route = useRoute();
const notify = useNotifyStore();

const sidebarOpen = ref(true)
const isMobile = ref(false)

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth < 1024

    if (isMobile.value) {
      sidebarOpen.value = false // mobile closed
    } else {
      sidebarOpen.value = true // desktop default open
    }
  }

  check()
  window.addEventListener('resize', check)

  // If currently on root POS route, keep sidebar closed for focused POS view
  if (route.path === '/') sidebarOpen.value = false

  // watch route changes to auto-close when entering POS route
  watch(() => route.path, (p) => {
    if (p === '/') sidebarOpen.value = false
  })
})

onBeforeUnmount(() => {
  try {
    window.removeEventListener('resize', () => { })
  } catch (e) { }
})

type Role = 'chef' | 'waiter' | 'cashier' | 'admin';

const roleCount = computed(() => {
  const role = auth.user?.role as Role;
  return notify[`${role}Count`] || 0
})
type NotifyClearFn = `clear${Capitalize<Role>}`;

const goOrders = (role: Role) => {
  const fn: (() => void) | undefined = notify[`clear${role.charAt(0).toUpperCase() + role.slice(1)}` as NotifyClearFn];
  fn?.();  // call if exists
  navigateTo("/service/orders");
};

const isActive = (path: string, opts?: { startsWith?: boolean }) => {
  if (opts?.startsWith) return route.path.startsWith(path);
  return route.path === path;
};

const handleLogout = () => {
  if (!confirm("Are you sure want to logout?")) return

  // Ensure store and cookie cleared
  auth.logout()
  try {
    const tokenCookie = useCookie<string | null>('auth_token')
    tokenCookie.value = null
  } catch (e) {
    // ignore if useCookie not available in this context
  }

  if (typeof window !== 'undefined') {
    window.location.replace('/login')
  } else {
    navigateTo('/login')
  }
}
</script>
