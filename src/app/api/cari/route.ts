import { NextRequest } from "next/server";
import { search } from "@/lib/komiku";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return jsonOk({ items: [] }, cacheHeaders(60));
  try {
    const items = await search(q);
    return jsonOk({ items }, cacheHeaders(600));
  } catch (e) {
    return jsonError(`Pencarian gagal: ${(e as Error).message}`);
  }
}