import { getVideoHome } from "@/lib/animexin";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const data = await getVideoHome();
    return jsonOk(data, cacheHeaders(600));
  } catch (e) {
    return jsonError(`Gagal memuat beranda video: ${(e as Error).message}`);
  }
}