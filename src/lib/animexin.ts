/**
 * Lapisan data modul video (sumber: animexin.dev).
 *
 * AxHTMLX menyediakan kartu, detail seri, dan opsi server pemutar (embed
 * iframe, sebagian mengandung iklan — diterima sebagai konsekuensi server
 * tujuan). Dipakai oleh halaman /nonton/* dan API internal.
 */
import { SOURCE } from "./config/source";
import { fetchHtml, decodeEntities, stripTags } from "./html";
import type {
  VideoCard,
  VideoEpisode,
  VideoEpisodeData,
  VideoHomeData,
  VideoSeries,
  VideoServer,
} from "./types";

const BASE = SOURCE.videoBaseUrl;

/* ------------------------------------------------------------------ */
/* Kartu                                                               */
/* ------------------------------------------------------------------ */

/** Parser kartu `<article class="bs">`. */
function parseVideoCard(article: string): VideoCard | null {
  const a = article.match(
    /<a\s+href="(https:\/\/animexin\.dev\/[^"]+)"[^>]*title="([^"]+)"[^>]*class="tip"/,
  );
  if (!a) return null;
  const url = a[1];
  const title = decodeEntities(a[2]);
  const slug = url.replace(/^https:\/\/animexin\.dev\/+/, "").replace(/\/+$/, "") || title;
  const img = article.match(/<img[^>]*src="([^"]+)"/);
  const epLabel = article.match(/<span class="epx">([^<]+)<\/span>/)?.[1]?.trim();
  const type = article.match(/<div class="typez ([^"]+)">/)?.[1];
  const status = article.match(/<div class="status ([^"]+)">/)?.[1];
  const isEpisode = /-episode-/i.test(url);
  return {
    id: slug,
    slug,
    title,
    poster: img?.[1] ?? "",
    epLabel,
    type,
    status,
    target: url,
    isEpisode,
  };
}

/** Ambil seluruh kartu dari satu dokumen HTML (semua `.listupd`). */
function parseCards(html: string): VideoCard[] {
  const out: VideoCard[] = [];
  const re = /<article class="bs"[\s\S]*?<\/article>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const c = parseVideoCard(m[0]);
    if (c) out.push(c);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Beranda video                                                        */
/* ------------------------------------------------------------------ */

export async function getVideoHome(): Promise<VideoHomeData> {
  // Catatan: halaman depan (/), wp-json, dan /page/N diblokir challenge
  // Cloudflare dari IP pusat data. Halaman /anime/ tetap terbuka — dipakai
  // untuk "populer" (order=popular) & "rilis terbaru" (order=update).
  const [popHtml, latestHtml] = await Promise.all([
    fetchHtml(`${BASE}/anime/?status=&type=&order=popular`, { ttl: 15 * 60 * 1000 }),
    fetchHtml(`${BASE}/anime/?status=&type=&order=update`, { ttl: 10 * 60 * 1000 }),
  ]);
  const popular = parseCards(popHtml);
  const latest = parseCards(latestHtml);
  return {
    popular: dedupe(popular).slice(0, 12),
    latest: dedupe(latest).slice(0, 60),
  };
}

export interface VideoFeedParams {
  page?: number;
}

/** Halaman berikutnya dari daftar rilis (browse anime urut terbaru). */
export async function getVideoRecent(page = 1): Promise<VideoCard[]> {
  const url =
    page <= 1
      ? `${BASE}/anime/?status=&type=&order=update`
      : `${BASE}/anime/?status=&type=&order=update&page=${page}`;
  const html = await fetchHtml(url, { ttl: 10 * 60 * 1000 });
  return dedupe(parseCards(html)).slice(0, 60);
}

function dedupe<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    if (!seen.has(x.id)) {
      seen.add(x.id);
      out.push(x);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Pencarian (REST WordPress)                                          */
/* ------------------------------------------------------------------ */

/** Film / seri hasil pencarian (jalur /search/ hidup untuk IP pusat data). */
export async function searchVideo(query: string): Promise<VideoCard[]> {
  const q = query.trim();
  if (!q) return [];
  const html = await fetchHtml(
    `${BASE}/search/${encodeURIComponent(q)}/`,
    { ttl: 10 * 60 * 1000 },
  );
  return dedupe(parseCards(html)).slice(0, 24);
}

/** Ambil slug bab dari link nav (prev/next) — urutan atribut boleh beda. */
function navEpisodeId(html: string, label: "prev" | "next"): string | undefined {
  const reAttrFirst = new RegExp(
    `<a[^>]*aria-label="${label}"[^>]*href="[^"]*/([^/"]+)/"`,
    "i",
  );
  const m1 = html.match(reAttrFirst);
  if (m1) return m1[1];
  const reHrefFirst = new RegExp(
    `<a[^>]*href="[^"]*/([^/"]+)/"[^>]*aria-label="${label}"`,
    "i",
  );
  return html.match(reHrefFirst)?.[1];
}

/* ------------------------------------------------------------------ */
/* Detail seri                                                         */
/* ------------------------------------------------------------------ */

export async function getVideoSeries(slug: string): Promise<VideoSeries | null> {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const html = await fetchHtml(`${BASE}/${clean}/`, { ttl: 20 * 60 * 1000 });

  const title =
    html.match(/<h1[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
      ?.trim() ?? "";
  if (!title) return null;

  const cleanedTitle = stripTags(title);
  const thumbTag = html.match(/<div class="thumb"[^>]*>[\s\S]*?<img[^>]*>/i);
  const posterMatch = thumbTag
    ? thumbTag[0].match(/src="([^"]+)"/)
    : html.match(/<img[^>]*itemprop="image"[^>]*src="([^"]+)"/i);
  let poster = posterMatch?.[1] ?? "";
  if (poster.includes("?")) poster = poster.split("?")[0];

  const cover = html.match(/class="bigcover"[\s\S]*?<img[^>]*src="([^"]+)"/)?.[1];

  const altTitle = html.match(/<span class="alter">([^<]+)<\/span>/)?.[1]?.trim();

  const meta: Record<string, string> = {};
  const spe = html.match(/<div class="spe">([\s\S]*?)<\/div>/)?.[1] ?? "";
  for (const span of spe.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)) {
    const mm = span[1].match(/<b>\s*([^<]+?):\s*<\/b>([\s\S]*)/);
    if (mm) meta[mm[1].trim()] = decodeEntities(stripTags(mm[2]));
  }

  const genres: string[] = [];
  const genx = html.match(/<div class="genxed">([\s\S]*?)<\/div>/)?.[1] ?? "";
  for (const g of genx.matchAll(/<a[^>]*>([^<]+)<\/a>/g)) genres.push(g[1]);

  const rating = html.match(/<strong>Rating\s*([\d.]+)<\/strong>/)?.[1];

  const desc = html.match(/<div class="mindesc">([\s\S]*?)<\/div>/i)?.[1]
    ?? html.match(/<div class="desc">([\s\S]*?)<\/div>/i)?.[1] ?? "";

  // Daftar episode (terbatas yang termuat; sumber memuat ~150+ terbaru).
  const epList: VideoEpisode[] = [];
  const ulStart = html.indexOf('class="eplister"');
  const ulSeg = ulStart === -1 ? "" : html.slice(ulStart, html.indexOf("</ul>", ulStart + 9));
  const liRe = /<li data-index="([^"]+)">[\s\S]*?<a href="[^"]*?([^\/"]+)\/">[\s\S]*?<div class="epl-num">([^<]+)<\/div>[\s\S]*?(?:<div class="epl-date">([^<]+)<\/div>)?/g;
  let lm: RegExpExecArray | null;
  while ((lm = liRe.exec(ulSeg))) {
    const id = lm[2].replace(/\/+$/g, "");
    epList.push({
      id,
      num: lm[3].trim(),
      ...(lm[4] ? { date: lm[4].trim() } : {}),
    });
  }

  const episodeCount = Number(meta["Episodes"] ?? epList.length) || epList.length;
  const firstEpId = epList.at(-1)?.id;
  const lastEpId = epList[0]?.id;

  return {
    slug: clean,
    title: cleanedTitle,
    altTitle,
    poster,
    cover,
    status: meta["Status"],
    type: meta["Type"],
    genres,
    studio: meta["Studio"],
    network: meta["Network"],
    rating,
    description: desc ? decodeEntities(stripTags(desc)) : undefined,
    episodeCount,
    episodeList: dedupe(epList),
    firstEpId,
    lastEpId,
  };
}

/* ------------------------------------------------------------------ */
/* Episode + server pemutar                                             */
/* ------------------------------------------------------------------ */

function decodeServerEmbed(value: string): string {
  if (!value) return "";
  try {
    const dec = Buffer.from(value, "base64").toString("utf8");
    return dec.match(/src="([^"]+)"/)?.[1] ?? "";
  } catch {
    return "";
  }
}

export async function getVideoEpisode(
  id: string,
): Promise<VideoEpisodeData | null> {
  const clean = id.replace(/^\/+|\/+$/g, "");
  const html = await fetchHtml(`${BASE}/${clean}/`, { ttl: 5 * 60 * 1000 });

  const embedHolder = html.match(
    /id="embed_holder"[\s\S]*?<iframe[^>]*src="([^"]+)"/i,
  );
  const defaultEmbed = embedHolder?.[1] ?? "";
  if (!defaultEmbed) return null;

  const select = html.match(/<select class="mirror"[^>]*>([\s\S]*?)<\/select>/);
  const servers: VideoServer[] = [];
  if (select) {
    let idx = 0;
    for (const opt of select[1].matchAll(
      /<option value="([^"]*)"\s*data-index="(\d+)"[^>]*>([\s\S]*?)<\/option>/g,
    )) {
      const [, encoded, di, label] = opt;
      const embedUrl = decodeServerEmbed(encoded);
      if (!embedUrl) continue;
      servers.push({
        index: Number(di ?? idx + 1),
        label: stripTags(label).trim(),
        embedUrl,
      });
      idx += 1;
    }
  }

  const seriesLink = html.match(
    /<a[^>]*aria-label='All Episodes'[^>]*href="[^"]*animexin\.dev\/([^\/"]+)\//i,
  )?.[1];
  const seriesSlug = seriesLink ?? clean.replace(/-episode-[\d-]+.*$/i, "");

  const prevId = navEpisodeId(html, "prev");
  const nextId = navEpisodeId(html, "next");

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
  const pageTitle = stripTags(h1);
  const epNumber =
    html.match(/<meta itemprop="episodeNumber" content="([^"]+)"/i)?.[1] ??
    pageTitle.match(/Episode\s*([\d.\[\]]+)/i)?.[1] ??
    clean.match(/-episode-(\d+)/i)?.[1] ??
    "";

  // Judul seri diturunkan dari judul bab (fungsi sumber: teks sebelum "Episode").
  const seriesTitle = pageTitle
    .replace(/\s*(?:-?\s*Episode\s*[^\-\s]*.*)$/i, "")
    .trim();

  return {
    id: clean,
    seriesSlug,
    seriesTitle: decodeEntities(seriesTitle),
    epNumber,
    title: decodeEntities(pageTitle),
    servers,
    defaultEmbed,
    ...(prevId ? { prevId } : {}),
    ...(nextId ? { nextId } : {}),
  };
}