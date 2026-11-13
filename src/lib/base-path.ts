export function normalizeBasePath(value = '/'): string {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

export const publicBasePath = normalizeBasePath(import.meta.env.VITE_BASE_PATH)
