"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompressIcon,
  ExpandIcon,
  XIcon,
} from "./Icons";
import { useApp } from "./Providers";
import { fetchJson } from "@/lib/use-api";
import {
  getContinueList,
  pushHistory,
  setContinue,
} from "@/lib/reader-store";
import type { ChapterData } from "@/lib/types";

const WIDTH_CLASS: Record<string, string> = {
  s: "max-w-[420px]",
  m: "max-w-[720px]",
  l: "max-w-[1000px]",
};
const GAP_PX = { none: 0, s: 14, m: 30 } as const;

export default function Reader() {
  const { bab } = useParams<{ bab: string }>();
  const router = useRouter();
  const { settings, updateSettings } = useApp();

  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [controls, setControls] = useState(true);
  const [sheet, setSheet] = useState(false);

  const [progress, setProgress] = useState(0); // vertical 0..1
  const [page, setPage] = useState(0); // paged index
  const [fullscreen, setFullscreen] = useState(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeDone = useRef(false);
  const seq = useRef(0);

  const id = bab;

  /* ---------------------------------------------------------------- */
  /* Muat bab                                                          */
  /* ---------------------------------------------------------------- */
  const load = useCallback(async (chapterId: string) => {
    const s = ++seq.current;
    setLoading(true);
    setError("");
    setPage(0);
    setProgress(0);
    resumeDone.current = false;
    const r = await fetchJson<ChapterData>(`/api/bab/${encodeURIComponent(chapterId)}`);
    if (s !== seq.current) return; // bab berubah di tengah jalan
    setLoading(false);
    if (!r.ok || !r.data) {
      setError(r.error ?? "Bab tidak tersedia.");
      setData(null);
      return;
    }
    setData(r.data);
    pushHistory(chapterId);
  }, []);

  useEffect(() => {
    void load(id);
    window.scrollTo(0, 0);
  }, [id, load]);

  /* ---------------------------------------------------------------- */
  /* Kontrol otomatis sembunyi                                         */
  /* ---------------------------------------------------------------- */
  const showControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (settings.autoHide) {
      hideTimer.current = setTimeout(() => setControls(false), 2800);
    }
  }, [settings.autoHide]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showControls, id]);

  /* ---------------------------------------------------------------- */
  /* Scroll vertikal: progres + lanjutkan                              */
  /* ---------------------------------------------------------------- */
  /** Simpan posisi baca (dipanggil dari scroll / pindah halaman). */
  function saveNow(ratio: number, imageIndex: number) {
    if (!data) return;
    const n = data.images.length || 1;
    const prog = Math.max(0, Math.min(n - 1, imageIndex));
    setContinue({
      slug: data.seriesSlug,
      chapterId: data.id,
      title: data.seriesTitle,
      chapterLabel: `Chapter ${data.chapterNumber}`,
      poster: undefined,
      progress:
        settings.mode === "paged"
          ? `Hal ${prog + 1} dari ${n}`
          : `${Math.round(Math.max(0.01, ratio) * 100)}%`,
      mode: settings.mode,
      updatedAt: Date.now(),
    });
  }

  useEffect(() => {
    function onScroll() {
      const el = document.scrollingElement ?? document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      setProgress(p);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(
        () => saveNow(p, Math.round(p * (data?.images.length ?? 1))),
        800,
      );
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, settings.mode]);

  /* Pulihkan posisi baca pada bab yang sama. */
  useEffect(() => {
    if (!data || resumeDone.current) return;
    if (settings.mode !== "vertical") return;
    const entry = getContinueList().find((e) => e.chapterId === data.id);
    if (!entry || !entry.progress.includes("%")) return;
    const ratio = Number.parseFloat(entry.progress) / 100;
    if (!Number.isFinite(ratio)) return;
    resumeDone.current = true;
    const restore = () => {
      const el = document.scrollingElement ?? document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0) el.scrollTop = ratio * max;
    };
    const t1 = setTimeout(restore, 250);
    const t2 = setTimeout(restore, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ---------------------------------------------------------------- */
  /* Per-halaman                                                       */
  /* ---------------------------------------------------------------- */
  const prevPage = useCallback(() => {
    setPage((p) => {
      const np = p - 1;
      if (np >= 0) return np;
      return p;
    });
  }, []);
  const nextPage = useCallback(() => {
    setPage((p) => {
      if (!data) return p;
      const np = p + 1;
      if (np < data.images.length) return np;
      return p;
    });
  }, [data]);

  useEffect(() => {
    if (settings.mode === "paged" && data) {
      saveNow((page + 1) / data.images.length, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, settings.mode === "paged" ? data : null]);

  /* ---------------------------------------------------------------- */
  /* Navigasi bab                                                      */
  /* ---------------------------------------------------------------- */
  const goTo = useCallback(
    (target: string) => {
      setSheet(false);
      router.replace(`/baca/${target}`);
      window.scrollTo(0, 0);
    },
    [router],
  );

  /* ---------------------------------------------------------------- */
  /* Layar penuh + keyboard                                            */
  /* ---------------------------------------------------------------- */
  function toggleFullscreen() {
    const el = document.documentElement;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      setFullscreen(false);
    } else {
      void el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    }
  }
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (settings.mode !== "paged") return;
      if (e.key === "ArrowRight") {
        if (data && page === data.images.length - 1 && data.nextId) goTo(data.nextId);
        else nextPage();
      } else if (e.key === "ArrowLeft") {
        if (page === 0 && data?.prevId) goTo(data.prevId);
        else prevPage();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settings.mode, page, data, goTo, nextPage, prevPage]);

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  const themeClass =
    settings.theme === "light" ? "reader-light" : settings.theme === "gray" ? "reader-gray" : "reader-dark";

  return (
    <div
      className={`${themeClass} min-h-[100dvh]`}
      style={{ background: `rgb(var(--reader-bg))`, color: `rgb(var(--reader-ink))` }}
      onClickCapture={showControls}
    >
      {/* Bilah atas pembaca */}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex items-center gap-1 border-b border-white/10 px-2 py-2 transition-all duration-300 ${
          controls ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" }}
      >
        <button
          type="button"
          aria-label="Kembali"
          onClick={() => data && router.push(`/komik/${data.seriesSlug}`)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ArrowLeftIcon width={20} height={20} />
        </button>
        <div className="min-w-0 flex-1 px-1">
          {loading ? (
            <p className="truncate text-xs text-white/60">Memuat bab…</p>
          ) : data ? (
            <>
              <p className="truncate text-[13px] font-bold leading-tight text-white">
                {data.seriesTitle}
              </p>
              <p className="truncate text-[11px] text-white/60">
                Chapter {data.chapterNumber}
              </p>
            </>
          ) : (
            <p className="truncate text-xs text-white/60">Bab tidak ditemukan</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Pengaturan baca"
          onClick={() => setSheet(true)}
          className="flex h-10 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .33 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.33 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-1-1.47 1.6 1.6 0 0 0-1.77.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .33-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.09a1.6 1.6 0 0 0 1.47-1 1.6 1.6 0 0 0-.33-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.33h.09a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.09a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.33 1.77v.09a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.47 1Z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Layar penuh"
          onClick={toggleFullscreen}
          className="flex h-10 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          {fullscreen ? <CompressIcon width={20} height={20} /> : <ExpandIcon width={20} height={20} />}
        </button>
      </div>

      {/* Bar progres */}
      <div className="fixed inset-x-0 top-[52px] z-40 h-0.5 bg-white/10">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${Math.round((settings.mode === "paged"
            ? data && data.images.length ? (page + 1) / data.images.length : 0
            : progress) * 100)}%` }}
        />
      </div>

      {/* Konten */}
      <main
        className={`min-h-[100dvh] ${settings.mode === "paged" ? "overflow-hidden" : ""}`}
      >
        {loading && (
          <div className="flex min-h-[100dvh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
          </div>
        )}

        {!loading && error && (
          <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-xs text-sm text-white/70">{error}</p>
            <button type="button" onClick={() => void load(id)} className="rounded-full bg-white/90 px-6 py-2.5 text-sm font-bold text-black">
              Coba lagi
            </button>
            {data?.seriesSlug && (
              <Link href={`/komik/${data.seriesSlug}`} className="text-xs text-white/50 underline">
                Detail komik
              </Link>
            )}
          </div>
        )}

        {!loading && data && (
          <>
            {/* ====== Mode gulir vertikal ====== */}
            {settings.mode === "vertical" && (
              <div
                role="region"
                aria-label="Halaman bab"
                className={`${WIDTH_CLASS[settings.width]} mx-auto`}
                style={{ paddingTop: 72, paddingBottom: 96 }}
              >
                <div
                  className="space-y-0"
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {data.images.map((src, i) => (
                    <div
                      key={`${data.id}-${i}`}
                      className="w-full"
                      style={{
                        paddingTop: i === 0 ? 0 : GAP_PX[settings.gap],
                        background: `rgb(var(--reader-bg))`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`${data.seriesTitle} Chapter ${data.chapterNumber} — ${i + 1}`}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="mx-auto block w-full select-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Akhir bab */}
                <div className="mt-10 space-y-3 text-center">
                  <p className="text-xs text-white/50">
                    Selesai — bab {data.chapterNumber} · {data.images.length} halaman
                  </p>
                  {data.nextId ? (
                    <button type="button" onClick={() => goTo(data.nextId as string)} className="rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white">
                      Bab Berikutnya →
                    </button>
                  ) : (
                    <p className="text-sm font-semibold text-white/70">Sudah bab terbaru ✨</p>
                  )}
                  {data.prevId && (
                    <button type="button" onClick={() => goTo(data.prevId as string)} className="mx-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white">
                      ← Bab Sebelumnya
                    </button>
                  )}
                  {data.seriesSlug && (
                    <a href={`/komik/${data.seriesSlug}`} className="block text-xs text-white/50 underline">
                      Kembali ke daftar bab
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ====== Mode per-halaman ====== */}
            {settings.mode === "paged" && (
              <div className="relative flex h-[100dvh] items-center justify-center" style={{ pointerEvents: controls ? undefined : "auto" }}>
                <div className="flex h-full w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.images[page]}
                    alt={`${data.seriesTitle} Chapter ${data.chapterNumber} — ${page + 1}`}
                    className="max-h-full max-w-full select-none object-contain"
                    draggable={false}
                    onClick={showControls}
                  />
                </div>

                {/* Zona tap kiri/kanan (di bawah toolbar) */}
                <div
                  className="absolute inset-x-0 bottom-0 top-16 z-10"
                  onClickCapture={showControls}
                >
                  <button
                    type="button"
                    aria-label="Halaman sebelumnya"
                    className="absolute inset-y-0 left-0 w-1/3"
                    disabled={page === 0 && !data.prevId}
                    onClick={() => {
                      if (page === 0 && data.prevId) goTo(data.prevId as string);
                      else prevPage();
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Halaman berikutnya"
                    className="absolute inset-y-0 right-0 w-1/3"
                    onClick={() => {
                      if (page === data.images.length - 1 && data.nextId) goTo(data.nextId as string);
                      else nextPage();
                    }}
                  />
                </div>

                {/* Indikator hal */}
                <div
                  className={`absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-bold text-white transition-opacity ${
                    controls ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  {page + 1} / {data.images.length}
                </div>

                {/* Tombol navigasi bab bawah */}
                <div
                  className={`absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 transition-all duration-300 ${
                    controls ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
                  }`}
                >
                  {data.prevId ? (
                    <button type="button" onClick={() => goTo(data.prevId as string)} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur">
                      <ChevronLeftIcon width={15} height={15} /> Prev
                    </button>
                  ) : (
                    <span className="hidden" />
                  )}
                  {data.nextId ? (
                    <button type="button" onClick={() => goTo(data.nextId as string)} className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-white">
                      Next <ChevronRightIcon width={15} height={15} />
                    </button>
                  ) : (
                    <span className="hidden" />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lembar pengaturan */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Pengaturan baca">
          <button type="button" aria-label="Tutup" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSheet(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl p-5 pb-8 text-white" style={{ background: "rgb(var(--reader-raised, 26 26 30))" }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold">Pengaturan Baca</h2>
              <button type="button" aria-label="Tutup" onClick={() => setSheet(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10">
                <XIcon width={16} height={16} />
              </button>
            </div>

            <SettingRow label="Mode">
              <Segmented
                value={settings.mode}
                options={[{ v: "vertical", l: "Gulir" }, { v: "paged", l: "Per-halaman" }]}
                onChange={(v) => updateSettings({ mode: v as "vertical" | "paged" })}
              />
            </SettingRow>

            <SettingRow label="Tema area">
              <Segmented
                value={settings.theme}
                options={[{ v: "dark", l: "Gelap" }, { v: "gray", l: "Abu" }, { v: "light", l: "Terang" }]}
                onChange={(v) => updateSettings({ theme: v as "dark" | "gray" | "light" })}
              />
            </SettingRow>

            <SettingRow label="Lebar lembar">
              <Segmented
                value={settings.width}
                options={[{ v: "s", l: "S" }, { v: "m", l: "M" }, { v: "l", l: "L" }]}
                onChange={(v) => updateSettings({ width: v as "s" | "m" | "l" })}
              />
            </SettingRow>

            <SettingRow label="Jarak antar hal">
              <Segmented
                value={settings.gap}
                options={[{ v: "none", l: "Rapat" }, { v: "s", l: "S" }, { v: "m", l: "M" }]}
                onChange={(v) => updateSettings({ gap: v as "none" | "s" | "m" })}
              />
            </SettingRow>

            <ToggleRow
              label="Sembunyikan kontrol otomatis"
              on={settings.autoHide}
              onToggle={() => updateSettings({ autoHide: !settings.autoHide })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- sub-komponen UI kecil ---------------- */

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold text-white/60">{label}</p>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-white/15 bg-black/20">
      {options.map((o, i) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`flex-1 px-3 py-2.5 text-xs font-bold transition-colors ${i > 0 ? "border-l border-white/10" : ""} ${
            value === o.v ? "bg-accent/85 text-white" : "text-white/70 hover:text-white"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <p className="text-xs font-semibold text-white/70">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-accent" : "bg-white/20"}`}
      >
        <span
          className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white transition-all ${
            on ? "left-6" : "left-1"
          }`}
        >
          {on && <CheckIcon width={12} height={12} className="text-accent" />}
        </span>
      </button>
    </div>
  );
}