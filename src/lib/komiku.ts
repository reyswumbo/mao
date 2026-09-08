/**
 * Lapisan data (scraper) untuk sumber tunggal komiku.org.
 *
 * Logika bersih: ambil HTML → parse ke model publik (src/lib/types.ts).
 * Konfigurasi URL terpusat pada src/lib/config/source.ts.
 */
import { SOURCE, ALPHABET, COMIC_TYPES } from "./config/source";
import { fetchHtml, decodeEntities, stripTags } from "./html";
import type {
  ChapterData,
  ComicCard,
  HomeData,
  HomeSection,
  ListResult,
  SeriesDetail,
} from "./types";

const BASE = SOURCE.baseUrl;
/** Jumlah kartu per halaman katalog sumber. */
const PAGE_SIZE = 50;

export const COMIC_TYPE_LABELS: Record<string, string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  manhua: "Manhua",
};

/* ------------------------------------------------------------------ */
/* Utilitas kecil                                                      */
/* ------------------------------------------------------------------ */

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Beranda                                                             */
/* ------------------------------------------------------------------ */

/** Kartu beranda: `<article class="ls2">` / `<article class="ls4">`. */
function parseHomeCard(block: string): ComicCard | null {
  const slugMatch = block.match(/href="\/manga\/([^"]+)\/"/);
  if (!slugMatch) return null;
  const slug = slugMatch[1];
  const titleMatch = block.match(/<h[34]>\s*<a[^>]*>\s*([^<]+)/);
  if (!titleMatch) return null;
  const posterMatch =
    block.match(/data-src="([^"]+)"/) ?? block.match(/src="(https:[^"]+)"/);
  const typeMatch = block.match(/data-tipe="([^"]*)"/);
  const chapterMatch = block.match(
    /class="ls2?[24]"\s+href="([^"]+)"\s+title="[^"]*Chapter\s+([^"]+)"/i,
  );
  return {
    id: slug,
    slug,
    title: decodeEntities(titleMatch[1]),
    poster: posterMatch ? posterMatch[1].split("?")[0] : "",
    type: typeMatch?.[1] || undefined,
    ...(chapterMatch
      ? {
          latestChapter: {
            id: chapterMatch[1].replace(/^\/+|\/+$/g, ""),
            number: chapterMatch[2],
            url: `${BASE}${chapterMatch[1]}`,
          },
        }
      : {}),
  };
}

function homeSectionHref(title: string): string | undefined {
  if (/Peringkat|Baru/i.test(title)) return "/katalog";
  if (/^Komik\s+/.test(title)) return "/katalog";
  return "/katalog";
}

export async function getHome(): Promise<HomeData> {
  const html = await fetchHtml(`${BASE}/`, { ttl: 10 * 60 * 1000 });

  const sections: HomeSection[] = [];
  const sectionRe = /<h2\s+class="lsh3"[^>]*>([^<]+)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(html))) {
    const title = decodeEntities(m[1]);
    const next = html.indexOf("<h2", m.index + m[0].length);
    const seg = html.slice(m.index + m[0].length, next === -1 ? html.length : next);
    const items: ComicCard[] = [];
    const cardRe = /<article\s+class="ls(?:2|4)"[\s\S]*?<\/article>/g;
    let cm: RegExpExecArray | null;
    while ((cm = cardRe.exec(seg))) {
      const card = parseHomeCard(cm[0]);
      if (card) items.push(card);
    }
    if (items.length) {
      sections.push({
        id: titleToId(title),
        title,
        href: homeSectionHref(title),
        items,
      });
    }
  }

  // Hero = kartu pertama (Peringkat Komiku) sebanyak 6.
  const first = sections[0]?.items ?? [];
  return {
    hero: first.slice(0, 6),
    sections: sections.slice(0, 7),
  };
}

function titleToId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ */
/* Katalog (/daftar-komik)                                             */
/* ------------------------------------------------------------------ */

interface LetterMeta {
  letter: string;
  pages: number;
}

const letterMetaCache = new Map<string, { at: number; meta: LetterMeta[] }>();
const LETTER_TTL = 30 * 60 * 1000;

function catalogUrl(letter: string, tipe: string, halaman: number): string {
  const q = new URLSearchParams({ huruf: letter });
  if (tipe) q.set("tipe", tipe);
  if (halaman > 1) q.set("halaman", String(halaman));
  return `${BASE}/daftar-komik/?${q.toString()}`;
}

/** Jumlah halaman per huruf untuk satu tipe. */
async function letterPages(tipe: string): Promise<LetterMeta[]> {
  const key = tipe || "all";
  const hit = letterMetaCache.get(key);
  if (hit && Date.now() - hit.at < LETTER_TTL) return hit.meta;

  const meta: LetterMeta[] = [];
  const BATCH = 6;
  for (let i = 0; i < ALPHABET.length; i += BATCH) {
    const batch = ALPHABET.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map(async (letter) => {
        const html = await fetchHtml(catalogUrl(letter, tipe, 1), {
          ttl: LETTER_TTL,
        });
        const hasCards = /<article class="manga-card">/.test(html);
        if (!hasCards) return { letter, pages: 0 } satisfies LetterMeta;
        const pages = Math.max(
          1,
          ...[...html.matchAll(/halaman=(\d+)/g)].map((x) => Number(x[1])),
        );
        return { letter, pages } satisfies LetterMeta;
      }),
    );
    for (const r of settled) if (r.status === "fulfilled") meta.push(r.value);
    await sleep(120);
  }
  meta.sort(
    (a, b) => ALPHABET.indexOf(a.letter) - ALPHABET.indexOf(b.letter),
  );
  const out = meta.filter((x) => x.pages > 0);
  letterMetaCache.set(key, { at: Date.now(), meta: out });
  return out;
}

/** Parse kartu katalog `<article class="manga-card">`. */
function parseCatalogCards(html: string): ComicCard[] {
  const cards: ComicCard[] = [];
  const re = /<article class="manga-card">([\s\S]*?)<\/article>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const block = m[1];
    const slugMatch = block.match(/href="\/manga\/([^"]+)\/"/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    const titleMatch = block.match(/<h4>\s*<a[^>]*>\s*([^<]+)/);
    if (!titleMatch) continue;
    const posterMatch = block.match(/data-src="([^"]+)"/);
    const metaMatch = block.match(/<p class="meta">([\s\S]*?)<\/p>/);
    const meta = metaMatch ? stripTags(metaMatch[1]) : "";
    const statusMatch = block.match(/Status:\s*([^<\n]+)/);
    cards.push({
      id: slug,
      slug,
      title: decodeEntities(titleMatch[1]),
      poster: posterMatch ? posterMatch[1].split("?")[0] : "",
      type: meta.split("•")[0]?.trim() || undefined,
      status: statusMatch ? statusMatch[1].trim() : undefined,
    });
  }
  return cards;
}

function matchesStatus(item: ComicCard, status: string): boolean {
  const st = (item.status ?? "").toLowerCase();
  if (status === "ongoing") return st.includes("ongo");
  if (status === "completed") return /end|selesai|tamat/.test(st);
  return st.includes(status);
}

export interface ListParams {
  page?: number;
  tipe?: string;
  status?: string;
  huruf?: string;
}

export async function getCatalog(params: ListParams): Promise<ListResult> {
  const page = Math.max(1, params.page ?? 1);
  const tipe = COMIC_TYPES.includes(
    (params.tipe ?? "").toLowerCase() as (typeof COMIC_TYPES)[number],
  )
    ? params.tipe!.toLowerCase()
    : "";
  const status = (params.status ?? "").toLowerCase();
  const huruf = params.huruf?.trim().toUpperCase() || "";

  const meta = await letterPages(tipe);
  const letters = huruf
    ? meta.filter((x) => x.letter === huruf)
    : meta;
  if (huruf && !letters.length) {
    return { items: [], page, totalPages: 0, hasMore: false, total: 0 };
  }

  const total = letters.reduce((s, x) => s + x.pages * PAGE_SIZE, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  let items: ComicCard[] = [];
  if (page <= totalPages) {
    let rem = page;
    let letter = letters[0]?.letter ?? "A";
    let halaman = 1;
    for (const x of letters) {
      if (rem <= x.pages) {
        letter = x.letter;
        halaman = rem;
        break;
      }
      rem -= x.pages;
    }
    items = await fetchCatalogPage(letter, tipe, halaman);
    // Jumlah halaman per huruf kerap terkoreksi ke bawah → target bisa kosong.
    if (tipe && !items.length && halaman > 1) {
      items = await fetchCatalogPage(letter, tipe, 1);
    }
    if (tipe) {
      items = items.map((i) =>
        i.type ? i : { ...i, type: COMIC_TYPE_LABELS[tipe] },
      );
    }
  }

  if (status) items = items.filter((i) => matchesStatus(i, status));

  return { items, page, totalPages, hasMore: page < totalPages, total };
}

async function fetchCatalogPage(
  letter: string,
  tipe: string,
  halaman: number,
): Promise<ComicCard[]> {
  const html = await fetchHtml(catalogUrl(letter, tipe, halaman), {
    ttl: 30 * 60 * 1000,
  });
  return parseCatalogCards(html);
}

/* ------------------------------------------------------------------ */
/* Pencarian (REST WordPress)                                          */
/* ------------------------------------------------------------------ */

export async function search(query: string): Promise<ComicCard[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const json = JSON.parse(
      await fetchHtml(
        `${BASE}/wp-json/wp/v2/manga?search=${encodeURIComponent(q)}&per_page=24`,
        { ttl: 10 * 60 * 1000 },
      ),
    ) as { slug?: string; title?: { rendered?: string }; class_list?: string[] }[];
    const out: ComicCard[] = [];
    for (const it of json ?? []) {
      const slug = it?.slug;
      if (!slug) continue;
      const cls = it.class_list ?? [];
      const tipe = cls
        .find((c) => c.startsWith("tipe-"))
        ?.replace("tipe-", "")
        .toLowerCase();
      const status = cls
        .find((c) => c.startsWith("statusmanga-"))
        ?.replace("statusmanga-", "");
      out.push({
        id: slug,
        slug,
        title: decodeEntities(it.title?.rendered ?? slug),
        poster: "",
        type: tipe && COMIC_TYPE_LABELS[tipe],
        status: status ? cap(status) : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Detail komik                                                        */
/* ------------------------------------------------------------------ */

export async function getSeries(slug: string): Promise<SeriesDetail | null> {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const html = await fetchHtml(`${BASE}/manga/${clean}/`, {
    ttl: 20 * 60 * 1000,
  });

  const nameMatch = html.match(/<h1[\s\S]*?itemprop="name"[^>]*>\s*([^<]+)/);
  const title = nameMatch ? decodeEntities(nameMatch[1]) : "";

  const posterTag = html.match(/<img[^>]*\bitemprop="image"[^>]*>/i);
  const posterMatch = posterTag
    ? posterTag[0].match(/src="([^"]+)"/)
    : html.match(/src="([^"]*thumbnail\.komiku\.to[^"]+manga_thumbnail[^"]*)"/);
  let poster = posterMatch?.[1] ?? "";
  if (poster.includes("?")) poster = poster.split("?")[0];

  const genres: string[] = [];
  const gRe = /<li class="genre">[\s\S]*?<a[^>]*>\s*<span>([^<]+)<\/span>/g;
  let gm: RegExpExecArray | null;
  while ((gm = gRe.exec(html))) genres.push(gm[1]);

  // Pasangan metadatum generik dalam tabel: <td>Label:</td><td>nilai</td>
  const meta: { label: string; value: string }[] = [];
  const metaRe =
    /<td>\s*([^<]{1,60}?):\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
  let mm: RegExpExecArray | null;
  while ((mm = metaRe.exec(html))) {
    const value = decodeEntities(stripTags(mm[2]));
    if (value) meta.push({ label: decodeEntities(mm[1].trim()), value });
  }
  const metaVal = (label: string) =>
    meta.find((x) => x.label.toLowerCase() === label.toLowerCase())?.value ?? "";

  if (!genres.length) {
    for (const g of metaVal("Genre").split(",")) {
      const v = g.trim();
      if (v && !genres.includes(v)) genres.push(v);
    }
  }

  let synopsis = "";
  const sIdx = html.indexOf('itemprop="description"');
  if (sIdx !== -1) {
    const start = html.lastIndexOf("<p", sIdx);
    const seg = html.slice(start === -1 ? sIdx : start, sIdx + 4000);
    const p = seg.match(/<p[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/p>/i);
    if (p) synopsis = decodeEntities(stripTags(p[1]));
  }

  // Daftar bab pada tabel #daftarChapter (baris berisi bab + tanggal).
  const chaptersRaw: { id: string; number: string; date?: string }[] = [];
  const tableStart = html.indexOf('id="daftarChapter"');
  const tableHtml = tableStart === -1 ? html : html.slice(tableStart);
  const rowRe = /<tr itemprop="itemListElement"[\s\S]*?<\/tr>/gi;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(tableHtml))) {
    const row = rm[0];
    const href = row.match(/href="\/([^"]+)"/)?.[1];
    const num = row.match(/<b>\s*Chapter\s*([^<]+?)<\/b>/i)?.[1];
    const date = row.match(/<td[^>]*class="tanggalseries"[^>]*>([^<]+)/)?.[1]?.trim();
    if (href && num) {
      chaptersRaw.push({
        id: href.replace(/\/$/g, ""),
        number: decodeEntities(num),
        ...(date ? { date } : {}),
      });
    }
  }

  const uniq = new Map<string, { id: string; number: string; date?: string }>();
  for (const c of chaptersRaw) if (!uniq.has(c.id)) uniq.set(c.id, c);
  const chapters = [...uniq.values()].sort((a, b) => {
    const na = Number.parseInt(a.number, 10);
    const nb = Number.parseInt(b.number, 10);
    if (Number.isNaN(na) || Number.isNaN(nb)) return 0;
    return nb - na;
  });

  if (!title && !chapters.length) return null;

  const first = chapters[chapters.length - 1];
  const last = chapters[0];
  const typeRaw = metaVal("Tipe");
  const statusRaw = metaVal("Status");

  return {
    slug: clean,
    title,
    altTitle: metaVal("Judul Alternatif") || undefined,
    poster,
    type: typeRaw || undefined,
    status: statusRaw || undefined,
    author: metaVal("Pengarang") || metaVal("Author") || undefined,
    artist: metaVal("Ilustrasi") || metaVal("Artist") || undefined,
    genres,
    synopsis: synopsis || undefined,
    firstChapterId: first?.id,
    lastChapterId: last?.id,
    chapters: chapters.map((c) => ({
      id: c.id,
      number: c.number,
      ...(c.date ? { date: c.date } : {}),
    })),
    meta,
  };
}

/* ------------------------------------------------------------------ */
/* Pembaca bab                                                         */
/* ------------------------------------------------------------------ */

export async function getChapter(chapterId: string): Promise<ChapterData | null> {
  const id = chapterId.replace(/^\/+|\/+$/g, "");
  const html = await fetchHtml(`${BASE}/${id}/`, { ttl: 5 * 60 * 1000 });

  const images: string[] = [];
  const imgRe = /<img[^>]*\bklazy\s*ww\b[^>]*>/gi;
  let im: RegExpExecArray | null;
  while ((im = imgRe.exec(html))) {
    const tag = im[0];
    const src =
      tag.match(/data-src="([^"]+)"/)?.[1] ?? tag.match(/src="([^"]+)"/)?.[1];
    if (!src || /asset\/|lazy|^data:/i.test(src)) continue;
    const host = src.split("/")[2] ?? "";
    if (!/(komiku|thumbnail)/i.test(host)) continue;
    images.push(src);
  }
  if (!images.length) return null;

  const dataMatch = html.match(/chapterData\s*=\s*\{([\s\S]*?)\}\s*;/);
  const dataBlock = dataMatch ? dataMatch[1] : "";
  const seriesTitle = decodeEntities(
    dataBlock.match(/series\s*:\s*"([^"]*)"/)?.[1] ?? "",
  );
  let seriesSlug = "";
  const linkSeries = dataBlock.match(/link_series\s*:\s*"([^"]*)"/)?.[1] ?? "";
  const man = linkSeries.replace(/\\\//g, "/").match(/manga\/([^/]+)/);
  if (man) seriesSlug = man[1];
  const chapterNumber =
    dataBlock.match(/chapter\s*:\s*"([^"]*)"/)?.[1] ??
    id.match(/chapter-(\d+)/i)?.[1] ??
    "";

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const pageTitle = h1 ? decodeEntities(stripTags(h1[1])) : id;

  const nav = (label: string): string | undefined => {
    const m = html.match(
      new RegExp(
        `<a[^>]*aria-label="${label}"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*aria-label="${label}"`,
        "i",
      ),
    );
    const raw = m?.[1] ?? m?.[2];
    if (!raw || !raw.includes("-chapter-") || raw.includes("#")) return undefined;
    let path = raw;
    try {
      path = new URL(raw, BASE).pathname;
    } catch {
      /* biarkan raw */
    }
    const c = path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
    return c && c !== id ? c : undefined;
  };

  return {
    id,
    seriesSlug,
    seriesTitle: seriesTitle || pageTitle,
    chapterNumber,
    title: pageTitle,
    images,
    prevId: nav("Prev"),
    nextId: nav("Next"),
  };
}