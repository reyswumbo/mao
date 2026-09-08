import { SOURCE } from "./config/source";

/**
 * Fetch HTML sumber dengan cache dalam memori (per instance serverless).
 *
 * Tidak memakai Next data cache supaya respons yang “teracuni” (mis. HTML
 * parsial yang pernah tersimpan) tidak pernah bocor ke pengguna. TTL kecil di
 * memori cukup untuk menjaga beban sumber tetap ringan tanpa risiko basi.
 */
const TTL_DEFAULT = 6 * 60 * 1000;

const heap = new Map<string, { exp: number; body: string }>();
let inflight = new Map<string, Promise<string>>();

/** Hapus cache memori (dipakai saat data berubah di sumber). */
export function clearFetchCache(): void {
  heap.clear();
}

export async function fetchHtml(
  url: string,
  { ttl = TTL_DEFAULT }: { ttl?: number } = {},
): Promise<string> {
  const hit = heap.get(url);
  if (hit && hit.exp > Date.now()) return hit.body;

  let promise = inflight.get(url);
  if (!promise) {
    promise = (async () => {
      // Sumber terkadang dihadang DDoS-Guard saat permintaan tidak “seperti
      // browser”. Retry sekali dengan header lengkap biasanya lolos.
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20_000);
        try {
          const res = await fetch(url, {
            headers: {
              "user-agent": SOURCE.userAgent,
              accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "accept-language": "id-ID,id;q=0.9,en;q=0.8",
              "accept-encoding": "gzip, deflate, br",
              "sec-fetch-site": "none",
              "sec-fetch-mode": "navigate",
              "sec-fetch-user": "?1",
              "sec-fetch-dest": "document",
              "upgrade-insecure-requests": "1",
            },
            signal: controller.signal,
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} dari ${url}`);
          }
          const body = await res.text();
          if (isDdosChallenge(body)) {
            throw new Error(
              "DDoS-Guard challenge dari sumber (mencoba ulang pada putaran berikutnya)",
            );
          }
          heap.set(url, { exp: Date.now() + ttl, body });
          return body;
        } catch (e) {
          lastError = e as Error;
          if (lastError.name === "AbortError") throw lastError;
          if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
        } finally {
          clearTimeout(timer);
        }
      }
      throw lastError ?? new Error(`Gagal mengambil ${url}`);
    })();
    inflight.set(url, promise);
    promise.finally(() => inflight.delete(url)).catch(() => {});
  }
  return promise;
}

/** Deteksi halaman tangkap DDoS-Guard (404 buatan + countdown). */
function isDdosChallenge(body: string): boolean {
  return /ddos-guard/i.test(body) && /Halaman tidak ditemukan/i.test(body);
}

/** Dekode entitas HTML sederhana (tanpa dependency). */
export function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .trim();
}

/** Buang semua tag, rapikan spasi. */
export function stripTags(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}