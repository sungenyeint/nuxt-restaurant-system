// file: frontend/app/plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  console.log("token ", auth.token);
  auth.hydrateFromCookie();

  if (auth.token && !auth.user) {
    try {
      const config = useRuntimeConfig();
      const me = await $fetch(`${config.public.apiBase}/auth/me`, {
        headers: { ...auth.authHeader() },
      });
      auth.user = me;
      auth.isAuthenticated = true;
      console.log("user ", auth.user);
      console.log("isAuthenticated ", auth.isAuthenticated);
    } catch {
      auth.logout();
    }
  }
});
