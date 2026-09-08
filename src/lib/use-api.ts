"use client";

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Fetch JSON API internal dengan error yang bisa dibaca. */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init?.headers ?? {}) },
  });
  try {
    const body = (await res.json()) as ApiEnvelope<T>;
    if (!res.ok && body && typeof body.error === "string") {
      throw new Error(body.error);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return body;
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Abort-able fetch untuk pencarian (membatalkan hasil lama). */
export function createAbortableSearch<T>(
  url: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<ApiEnvelope<T>> {
  return fetchJson<T>(url, { signal }).catch((e) => ({
    ok: false,
    error: (e as Error).name === "AbortError" ? undefined : String(e),
  }));
}