<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Restaurant POS</h1>
          </div>

          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-700">
              Welcome, {{ auth.user?.name }}
            </div>

            <!-- Bell notification for chefs -->
            <button
              v-if="auth.user?.role === 'chef' || auth.user?.role === 'admin' || auth.user?.role === 'waiter'"
              class="relative px-2 py-1 rounded hover:bg-gray-100"
              @click="goOrders"
              title="New orders"
            >
              <!-- minimal bell icon -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"
                />
                <path d="M7 15a3 3 0 006 0H7z" />
              </svg>
              <span
                v-if="
                  auth.user?.role === 'chef' ||
                  (auth.user?.role === 'admin' && notify.chefNewOrders > 0)
                "
                class="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-semibold w-5 h-5 rounded-full bg-red-600 text-white"
              >
                {{ notify.chefNewOrders }}
              </span>
              <span
                v-if="
                  auth.user?.role === 'waiter' ||
                  (auth.user?.role === 'admin' && notify.chefFinishedOrders > 0)
                "
                class="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-semibold w-5 h-5 rounded-full bg-red-600 text-white"
              >
                {{ notify.chefFinishedOrders }}
              </span>
            </button>

            <button
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <div class="flex min-h-[calc(100vh-4rem)]">
        <!-- Sidebar -->
        <aside class="w-56 bg-white border-r p-4">
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
                'block px-3 py-2 rounded hover:bg-gray-100',
                isActive('/')
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-700',
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
              <div class="text-xs uppercase text-gray-500 mt-4 mb-2">
                Service
              </div>
              <NuxtLink
                to="/service/orders"
                :class="[
                  'block px-3 py-2 rounded hover:bg-gray-100',
                  isActive('/service/orders')
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-700',
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
                  'block px-3 py-2 rounded hover:bg-gray-100',
                  isActive('/service/tables')
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-700',
                ]"
              >
                Tables
              </NuxtLink>
            </template>

            <!-- Admin -->
            <template v-if="auth.user?.role === 'admin'">
              <div class="text-xs uppercase text-gray-500 mt-4 mb-2">Admin</div>
              <NuxtLink
                to="/admin/menus"
                :class="[
                  'block px-3 py-2 rounded hover:bg-gray-100',
                  isActive('/admin/menus', { startsWith: true })
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-700',
                ]"
              >
                Manage Menus
              </NuxtLink>
              <NuxtLink
                to="/admin/categories"
                :class="[
                  'block px-3 py-2 rounded hover:bg-gray-100',
                  isActive('/admin/categories', { startsWith: true })
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-700',
                ]"
              >
                Manage Categories
              </NuxtLink>
              <NuxtLink
                to="/admin/tables"
                :class="[
                  'block px-3 py-2 rounded hover:bg-gray-100',
                  isActive('/admin/tables', { startsWith: true })
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-700',
                ]"
              >
                Manage Tables
              </NuxtLink>
              <NuxtLink
                to="/admin/users"
                :class="[
                  'block px-3 py-2 rounded hover:bg-gray-100',
                  isActive('/admin/users', { startsWith: true })
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-700',
                ]"
              >
                Users
              </NuxtLink>
            </template>
          </nav>
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
const auth = useAuthStore();
const route = useRoute();
const notify = useNotifyStore();

const goOrders = () => {
  notify.clearChef();
  notify.clearFinished();
  navigateTo("/service/orders");
};

// Simple active checker:
// - Exact match by default
// - For admin sections, pass { startsWith: true } to match any sub-route
const isActive = (path: string, opts?: { startsWith?: boolean }) => {
  if (opts?.startsWith) return route.path.startsWith(path);
  return route.path === path;
};

const handleLogout = () => {
  if (confirm("Are you sure want to logout?")) {
    auth.logout();
    navigateTo("/login");
  }
};
</script>
