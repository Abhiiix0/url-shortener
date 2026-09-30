import type { UrlAnalytics } from './types'

export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export const UNREACHABLE = "Couldn't reach the server. Is it running?"

// Resolves to null when the short code doesn't exist.
export async function fetchAnalytics(
  shortCode: string,
  signal: AbortSignal,
): Promise<UrlAnalytics | null> {
  const res = await fetch(`${API_BASE}/api/analytics/${encodeURIComponent(shortCode)}`, {
    signal,
  })
  if (res.status === 404) return null

  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    // 502-504 is what the dev proxy / nginx answer when the backend is down
    const unreachable = res.status >= 502 && res.status <= 504
    throw new Error(unreachable ? UNREACHABLE : (body?.message ?? `Request failed (${res.status})`))
  }
  return body
}
