<template>
  <div class="min-h-screen">
    <header class="bg-teal-700 text-white shadow-md">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <!-- Sidebar toggle -->
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
              <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18" />
              </svg>
            </div>
            <h1 class="text-xl font-semibold">Restaurant POS</h1>
          </div>

          <div class="flex items-center space-x-4">
            <div class="text-sm text-white/90">
              Welcome, {{ auth.user?.name }}
            </div>

            <!-- Bell notification for chefs -->
            <button
              v-if="auth.user?.role === 'chef' || auth.user?.role === 'admin' || auth.user?.role === 'waiter'"
              class="relative px-2 py-1 rounded hover:bg-white/10"
              @click="goOrders"
              title="New orders"
            >
              <!-- bell icon: normal or crossed when notifications disabled -->
              <svg v-if="notify.enabled" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/95" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                <path d="M7 15a3 3 0 006 0H7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8v4.159c0 .538-.214 1.055-.595 1.436L5 15h6" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
              </svg>
              <span
                v-if="
                  auth.user?.role === 'chef' && notify.chefNewOrders > 0 ||
                  (auth.user?.role === 'admin' && notify.chefNewOrders > 0)
                "
                class="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-semibold w-5 h-5 rounded-full bg-red-500 text-white"
              >
                {{ notify.chefNewOrders }}
              </span>
              <span
                v-if="
                  auth.user?.role === 'waiter' && notify.chefNewOrders > 0 ||
                  (auth.user?.role === 'admin' && notify.chefFinishedOrders > 0)
                "
                class="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-semibold w-5 h-5 rounded-full bg-red-500 text-white"
              >
                {{ notify.chefFinishedOrders }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="flex min-h-[calc(100vh-4rem)]">
        <!-- Sidebar -->
        <aside
          class="bg-teal-600 text-white flex flex-col transition-all duration-200"
          :class="sidebarOpen ? 'w-56 p-4' : 'w-0 p-0 overflow-hidden'
          "
        >
          <nav class="space-y-2">
            <!-- Cashier/Admin -->
            <NuxtLink
              v-if="
                auth.user?.role === 'cashier' ||
                auth.user?.role === 'waiter' ||
                auth.user?.role === 'chef' ||
                auth.user?.role === 'admin'
              "
              to="/"
              :class="[
                'block px-3 py-2 rounded hover:bg-teal-500/80',
                isActive('/')
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/90',
              ]"
            >
              POS Dashboard
            </NuxtLink>

            <!-- Service: Waiter/Chef/Cashier/Admin -->
            <template
              v-if="
                auth.user?.role === 'waiter' ||
                auth.user?.role === 'chef' ||
                auth.user?.role === 'cashier' ||
                auth.user?.role === 'admin'
              "
            >
              <div class="text-xs uppercase text-teal-500 mt-4 mb-2">
                Service
              </div>
              <NuxtLink
                to="/service/orders"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/service/orders')
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Orders
              </NuxtLink>
              <NuxtLink
                v-if="
                  auth.user?.role === 'waiter' || auth.user?.role === 'admin'
                "
                to="/service/tables"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/service/tables')
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Tables
              </NuxtLink>
            </template>

            <!-- Admin -->
            <template v-if="auth.user?.role === 'admin'">
              <div class="text-xs uppercase text-teal-500 mt-4 mb-2">Admin</div>
              <NuxtLink
                to="/admin/analytics"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/admin/analytics', { startsWith: true })
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Analytics
              </NuxtLink>
              <NuxtLink
                to="/admin/menus"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/admin/menus', { startsWith: true })
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Manage Menus
              </NuxtLink>

              <NuxtLink
                to="/admin/categories"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/admin/categories', { startsWith: true })
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Manage Categories
              </NuxtLink>
              <NuxtLink
                to="/admin/tables"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/admin/tables', { startsWith: true })
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Manage Tables
              </NuxtLink>
              <NuxtLink
                to="/admin/users"
                :class="[
                  'block px-3 py-2 rounded hover:bg-teal-500/80',
                  isActive('/admin/users', { startsWith: true })
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90',
                ]"
              >
                Users
              </NuxtLink>
            </template>
          </nav>
          <div class="mt-4 space-y-3">
            <!-- Admin: Notifications toggle -->
            <div v-if="auth.user?.role === 'admin'" class="flex items-center justify-between px-2">
              <div class="text-sm">Notifications</div>
              <button
                @click="notify.toggleEnabled()"
                class="ml-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                :aria-pressed="!notify.enabled"
                :title="notify.enabled ? 'Disable notifications' : 'Enable notifications'"
              >
                <span v-if="notify.enabled">On</span>
                <span v-else>Off</span>
              </button>
            </div>

            <div>
              <button class="w-full px-3 py-2 rounded bg-white text-teal-500 font-medium hover:bg-white/90" @click="handleLogout">Logout</button>
            </div>
          </div>
        </aside>

        <!-- Page content -->
        <section class="flex-1 p-4">
          <slot />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const auth = useAuthStore();
const route = useRoute();
const notify = useNotifyStore();

const sidebarOpen = ref(true)

const goOrders = () => {
  notify.clearChef();
  notify.clearFinished();
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
