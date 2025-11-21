export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  auth.hydrateFromCookie()
  if (!auth.isAuthenticated) {
    if (auth.token) return
    return navigateTo('/login')
  }

  if (auth.user?.role !== 'waiter' && auth.user?.role !== 'admin') return navigateTo('/')
})
