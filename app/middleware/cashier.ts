export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.hydrateFromCookie()

  if (!auth.isAuthenticated) {
    if (auth.token) return
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  const role = auth.user?.role
  // Allow cashier and admin
  if (role === 'cashier' || role === 'admin') return

  // Waiter: send to waiter dashboard (avoid self-redirect)
  if (role === 'waiter') {
    if (to.path !== '/waiter/orders') return navigateTo('/waiter/orders')
    return
  }

  // Fallback: go to login (avoid self-redirect)
  if (to.path !== '/login') return navigateTo('/login')
})
