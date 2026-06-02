import ky, { HTTPError } from 'ky'

export const API_BASE_URL =
  import.meta.env.VITE_DEFAULT_API?.replace(/\/$/, '') ??
  (globalThis.window === undefined ? '' : globalThis.location.origin.replace(/\/$/, ''))

export const apiClient = ky.create({
  prefix: `${API_BASE_URL}/api`,
  timeout: 10_000,
  retry: { limit: 2, statusCodes: [408, 500, 502, 503] },
  headers: { Accept: 'application/json' },
  hooks: {
    beforeRequest: [
      (state) => {
        const token = globalThis.localStorage?.getItem('auth_token')
        if (token) state.request.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
  },
})

export const handleHttpError = (err: unknown, context: string): never => {
  if (err instanceof HTTPError) {
    throw new Error(`${context} : ${err.response.status} ${err.response.statusText}`)
  }
  throw err
}
