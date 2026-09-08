import { NextRequest } from "next/server";
import { getCatalog } from "@/lib/komiku";
import { cacheHeaders, jsonError, jsonOk } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const tipe = sp.get("tipe") ?? "";
  const status = sp.get("status") ?? "";
  const huruf = sp.get("huruf") ?? "";
  try {
    const data = await getCatalog({ page, tipe, status, huruf });
    return jsonOk(data, cacheHeaders(300));
  } catch (e) {
    return jsonError(`Gagal memuat katalog: ${(e as Error).message}`);
  }
}