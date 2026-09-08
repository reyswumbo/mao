import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, headers?: Record<string, string>): NextResponse {
  return NextResponse.json({ ok: true, data }, { headers });
}

export function jsonError(message: string, status = 500): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Cache-control pendek supaya klien ringan tetapi tetap segar. */
export function cacheHeaders(seconds = 300): Record<string, string> {
  return {
    "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=60`,
  };
}