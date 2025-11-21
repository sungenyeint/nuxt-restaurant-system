export const useFileUrl = () => {
  const { public: { apiBase } } = useRuntimeConfig()
  const backendOrigin = (apiBase || '').replace(/\/api\/?$/, '')
  const toUrl = (path?: string) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    return `${backendOrigin}${path}`
  }
  return { toUrl }
}