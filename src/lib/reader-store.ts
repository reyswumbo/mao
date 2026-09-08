import type { ContinueEntry } from "./types";

/* ==================================================================== */
/* Lanjutkan Membaca (localStorage)                                     */
/* ==================================================================== */

const CONTINUE_KEY = "99app:continue";
const HISTORY_KEY = "99app:history";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh / private mode — abaikan */
  }
}

/** Daftar “Lanjutkan Membaca”, diurutkan terbaru dahulu. */
export function getContinueList(): ContinueEntry[] {
  const raw = read<ContinueEntry[]>(CONTINUE_KEY) ?? [];
  return raw
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 12);
}

/** Simpan progres baca terbaru untuk sebuah komik. */
export function setContinue(entry: ContinueEntry): void {
  const list = read<ContinueEntry[]>(CONTINUE_KEY) ?? [];
  const idx = list.findIndex(
    (x) => x.slug === entry.slug || x.chapterId === entry.chapterId,
  );
  if (idx !== -1) list.splice(idx, 1);
  list.unshift({ ...entry, updatedAt: Date.now() });
  write(CONTINUE_KEY, list.slice(0, 12));
}

/** Hapus satu entri (konfirmasi). */
export function clearContinue(slug: string): void {
  const list = read<ContinueEntry[]>(CONTINUE_KEY) ?? [];
  write(
    CONTINUE_KEY,
    list.filter((x) => x.slug !== slug),
  );
}

/** Riwayat bab yang dibuka (untuk indikator kill/tampil cepat). */
export function getHistory(): { chapterId: string; at: number }[] {
  return read<{ chapterId: string; at: number }[]>(HISTORY_KEY) ?? [];
}

export function pushHistory(chapterId: string): void {
  const h = (read<{ chapterId: string; at: number }[]>(HISTORY_KEY) ?? []).filter(
    (x) => x.chapterId !== chapterId,
  );
  h.unshift({ chapterId, at: Date.now() });
  write(HISTORY_KEY, h.slice(0, 200));
}

/* ==================================================================== */
/* Pengaturan baca & tema                                               */
/* ==================================================================== */

export interface ReaderSettings {
  /** Mode baca: gulir vertikal atau per-halaman. */
  mode: "vertical" | "paged";
  /** Lebar lembar baca. */
  width: "s" | "m" | "l";
  /** Tema area pembaca. */
  theme: "dark" | "gray" | "light";
  /** Jarak antar halaman. */
  gap: "none" | "s" | "m";
  /** Sembunyikan kontrol setelah beberapa detik. */
  autoHide: boolean;
  /** Kontrol besar mudah disentuh. */
  largeControls: boolean;
}

export const DEFAULT_READER: ReaderSettings = {
  mode: "vertical",
  width: "m",
  theme: "dark",
  gap: "s",
  autoHide: true,
  largeControls: false,
};

const SETTINGS_KEY = "99app:reader-settings";
const THEME_KEY = "99app:site-theme";

export function loadReaderSettings(): ReaderSettings {
  return { ...DEFAULT_READER, ...(read<Partial<ReaderSettings>>(SETTINGS_KEY) ?? {}) };
}

export function saveReaderSettings(s: ReaderSettings): void {
  write(SETTINGS_KEY, s);
}

/** Tema situs dengan deteksi preferensi sistem sebagai default. */
export function loadSiteTheme(): "light" | "dark" {
  const t = read<"light" | "dark">(THEME_KEY);
  if (t === "light" || t === "dark") return t;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function saveSiteTheme(t: "light" | "dark"): void {
  write(THEME_KEY, t);
}