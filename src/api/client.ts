import ky, { type Options } from 'ky'

export const historiqueApi = ky.create({
  baseUrl: `${import.meta.env.VITE_HISTORY_API }/api/messages`,
  timeout: 10_000,
  retry: { limit: 2, statusCodes: [408, 500, 502, 503] },
  headers: { Accept: 'application/json' },
} as Options)

export const messageApi = ky.create({
  baseUrl: `${import.meta.env.VITE_DEFAULT_API}/api/messages`,
  timeout: 10_000,
  retry: { limit: 2, statusCodes: [408, 500, 502, 503] },
  headers: { Accept: 'application/json' },
} as Options)
