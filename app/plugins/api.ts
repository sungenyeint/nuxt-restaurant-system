export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const auth = useAuthStore();
      options.headers = {
        ...((options.headers as Record<string, string>) || {}),
        ...auth.authHeader(),
      };
    },
  });
  return { provide: { api } };
});
