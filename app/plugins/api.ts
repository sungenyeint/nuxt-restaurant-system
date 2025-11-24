export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const auth = useAuthStore();
      const existing =
        options.headers instanceof Headers
          ? Object.fromEntries(Array.from(options.headers.entries()))
          : ((options.headers as Record<string, string>) || {});
      options.headers = new Headers({
        ...existing,
        ...auth.authHeader(),
      });
    },
  });
  return { provide: { api } };
});
