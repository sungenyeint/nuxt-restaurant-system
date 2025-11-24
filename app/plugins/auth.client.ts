// file: frontend/app/plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  console.log("auth.client");
  const auth = useAuthStore();
  auth.hydrateFromCookie();

console.log("user ", auth.user, 'token ', auth.token);
  if (auth.token && !auth.user) {
    try {
      const config = useRuntimeConfig();
      const me = await $fetch(`${config.public.apiBase}/auth/me`, {
        headers: { ...auth.authHeader() },
      });
      auth.user = me;
      auth.isAuthenticated = true;
    } catch {
      auth.logout();
    }
  }
});
