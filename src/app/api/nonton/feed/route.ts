import { NextRequest } from "next/server";
import { getVideoRecent } from "@/lib/animexin";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1) || 1);
  try {
    const items = await getVideoRecent(page);
    return jsonOk({ items, page }, cacheHeaders(300));
  } catch (e) {
    return jsonError(`Gagal memuat feed: ${(e as Error).message}`);
  }
}