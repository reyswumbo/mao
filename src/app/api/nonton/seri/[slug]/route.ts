import { NextRequest } from "next/server";
import { getVideoSeries } from "@/lib/animexin";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  try {
    const data = await getVideoSeries(slug);
    if (!data) return jsonError("Video tidak ditemukan", 404);
    return jsonOk(data, cacheHeaders(300));
  } catch (e) {
    return jsonError(`Gagal memuat detail: ${(e as Error).message}`);
  }
}