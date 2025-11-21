export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.hydrateFromCookie()

  // Allow public routes so the middleware doesn't redirect when already on them
  const publicPaths = ['/login', '/register']
  // If no authenticated user but a token exists, let client-side plugin try to hydrate
  if (!auth.isAuthenticated) {
    if (auth.token) {
      // token present but user not yet loaded -> allow navigation and wait for client plugin
      return
    }
    if (publicPaths.includes(to.path)) return
    return navigateTo('/login')
  }

  // If authenticated and user info is available, prevent visiting auth pages
  if (auth.isAuthenticated && auth.user && publicPaths.includes(to.path)) {
    return navigateTo('/')
  }
})
