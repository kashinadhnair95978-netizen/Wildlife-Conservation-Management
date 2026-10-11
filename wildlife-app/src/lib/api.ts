/** Thin typed wrapper around the backend REST API (proxied at /api in dev). */

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function errorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as { error?: unknown }).error === 'string'
  ) {
    return (data as { error: string }).error
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the API server. Make sure the backend is running.')
  }

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new ApiError(response.status, `Unexpected response from the server (${response.status}).`)
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(data, `Request failed with status ${response.status}.`))
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  create: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  update: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: <T = { id: string }>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/** Fetch a single record, resolving to `undefined` when the server returns 404. */
export async function getOrUndefined<T>(path: string): Promise<T | undefined> {
  try {
    return await api.get<T>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}