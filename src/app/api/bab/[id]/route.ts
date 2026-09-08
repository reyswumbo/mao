import { NextRequest } from "next/server";
import { getChapter } from "@/lib/komiku";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const data = await getChapter(id);
    if (!data) return jsonError("Bab tidak ditemukan", 404);
    return jsonOk(data, cacheHeaders(60));
  } catch (e) {
    return jsonError(`Gagal memuat bab: ${(e as Error).message}`);
  }
}