import { NextRequest } from "next/server";
import { getVideoEpisode } from "@/lib/animexin";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const data = await getVideoEpisode(id);
    if (!data) return jsonError("Episode tidak tersedia", 404);
    return jsonOk(data, cacheHeaders(60));
  } catch (e) {
    return jsonError(`Gagal memuat episode: ${(e as Error).message}`);
  }
}