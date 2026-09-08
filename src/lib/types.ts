/** Model data bersama untuk seluruh aplikasi (read-only, berasal dari source). */

export interface ComicCard {
  id: string; // slug
  slug: string;
  title: string;
  poster: string;
  type?: string; // Manga | Manhwa | Manhua
  status?: string;
  /** Bab terakhir bila tersedia (opsional, dipakai di kartu beranda). */
  latestChapter?: {
    id: string;
    number: string;
    url: string;
  };
}

export interface HomeSection {
  id: string;
  title: string;
  href?: string;
  items: ComicCard[];
}

export interface HomeData {
  hero: ComicCard[];
  sections: HomeSection[];
}

export interface ChapterStub {
  id: string; // slug bab, contoh: one-piece-chapter-1192
  number: string;
  title?: string;
  date?: string;
}

export interface SeriesDetail {
  slug: string;
  title: string;
  altTitle?: string;
  poster: string;
  type?: string;
  status?: string;
  author?: string;
  artist?: string;
  genres: string[];
  synopsis?: string;
  firstChapterId?: string;
  lastChapterId?: string;
  chapters: ChapterStub[];
  meta: { label: string; value: string }[];
}

export interface ChapterData {
  id: string;
  seriesSlug: string;
  seriesTitle: string;
  chapterNumber: string;
  title: string;
  images: string[];
  prevId?: string;
  nextId?: string;
}

export interface ListResult {
  items: ComicCard[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  total?: number;
}

/**
 * Entri “Lanjutkan Membaca” yang disimpan di localStorage per perangkat.
 * Menyimpan bab terakhir + posisi baca agar bisa melanjutkan membaca.
 */
export interface ContinueEntry {
  slug: string;
  title: string;
  poster?: string;
  chapterId: string;
  /** Label bab yang dibaca, mis. “Chapter 1192”. */
  chapterLabel: string;
  /** Ringkasan posisi, mis. “72%” atau “Hal 3 dari 13”. */
  progress: string;
  /** Mode saat membaca terakhir kali (untuk lanjut yang konsisten). */
  mode?: "vertical" | "paged";
  updatedAt: number;
}

export interface SearchResult {
  items: ComicCard[];
}

/* ==================================================================== */
/* Modul video (animexin.dev)                                            */
/* ==================================================================== */

export interface VideoCard {
  id: string;
  slug: string;
  title: string;
  poster: string;
  /** Label episode, mis. “Ep 157” (ada pada kartu rilis terbaru). */
  epLabel?: string;
  type?: string;
  status?: string;
  /** Url halaman kartu (bab atau seri sesuai sumber). */
  target: string;
  isEpisode: boolean;
}

export interface VideoEpisode {
  id: string;
  num: string;
  title?: string;
  date?: string;
}

export interface VideoSeries {
  slug: string;
  title: string;
  altTitle?: string;
  poster: string;
  cover?: string;
  status?: string;
  type?: string;
  genres: string[];
  studio?: string;
  network?: string;
  rating?: string;
  /** Boilerplate deskripsi dari situs sumber. */
  description?: string;
  episodeCount: number;
  /** Daftar episode termuat di halaman (bisa terbatas karena pagination sumber). */
  episodeList: VideoEpisode[];
  firstEpId?: string;
  lastEpId?: string;
}

/** Server pemutar kedua sumber (embed iframe, bisa mengandung iklan). */
export interface VideoServer {
  index: number;
  label: string;
  /** URL embed (iframe) — iklan mengikuti server tujuan. */
  embedUrl: string;
}

export interface VideoEpisodeData {
  id: string;
  seriesSlug: string;
  seriesTitle: string;
  epNumber: string;
  title: string;
  servers: VideoServer[];
  /** url iframe bawaan halaman (server terpilih default). */
  defaultEmbed: string;
  prevId?: string;
  nextId?: string;
}

export interface VideoHomeData {
  popular: VideoCard[];
  latest: VideoCard[];
}