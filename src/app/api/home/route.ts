import { getHome } from "@/lib/komiku";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const data = await getHome();
    return jsonOk(data, cacheHeaders(600));
  } catch (e) {
    return jsonError(`Gagal memuat beranda: ${(e as Error).message}`);
  }
}