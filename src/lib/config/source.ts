/**
 * Konfigurasi sumber data — dipusatkan di satu tempat.
 *
 * Challenge #14: source configuration should be centralized.
 * Seluruh URL & konstanta scraping berasal dari file ini saja.
 */
export const SOURCE = {
  /** Situs sumber tunggal. */
  baseUrl: "https://komiku.org",
  /** CDN thumbnail (poster). */
  thumbnailHost: "thumbnail.komiku.to",
  /** User-Agent agar direspons dengan versi desktop normal. */
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
} as const;

/** Tipe komik yang dikenal sumber. */
export const COMIC_TYPES = ["manga", "manhwa", "manhua"] as const;

/** Kategori status yang dipakai untuk filter katalog. */
export const COMIC_STATUS_FILTERS = [
  { id: "", label: "Semua Status" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Tamat" },
] as const;

/** Urutan alfabet untuk indeks katalog (termasuk karakter khusus komiku). */
export const ALPHABET = [
  "#",
  "+",
  "-",
  ".",
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
] as const;