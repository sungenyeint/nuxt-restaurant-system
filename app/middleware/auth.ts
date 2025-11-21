export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.hydrateFromCookie()

  // Allow public routes so the middleware doesn't redirect when already on them
  const publicPaths = ['/login', '/register']
  // If no authenticated user but a token exists, allow navigation and let client plugin hydrate
  if (!auth.isAuthenticated) {
    if (auth.token) return
    if (publicPaths.includes(to.path)) return
    return navigateTo('/login')
  }

  // If authenticated and user info is available, prevent visiting auth pages
  if (auth.isAuthenticated && auth.user && publicPaths.includes(to.path)) {
    return navigateTo('/')
  }
})
