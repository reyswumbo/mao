"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { fetchJson } from "@/lib/use-api";
import type { VideoEpisodeData } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: VideoEpisodeData };

/** Pemutar video: pilih server, putar, loncat episode sebelumnya/berikutnya. */
export default function NontonPlayer() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ status: "loading" });
  const [serverIdx, setServerIdx] = useState(0);
  const [frameKey, setFrameKey] = useState(0);

  const idStr = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    let on = true;
    setState({ status: "loading" });
    fetchJson<VideoEpisodeData>(`/api/nonton/ep/${encodeURIComponent(idStr)}`)
      .then((r) => {
        if (!on) return;
        if (!r.ok || !r.data) {
          setState({ status: "error", message: r.error ?? "Episode tidak tersedia." });
          return;
        }
        setState({ status: "ready", data: r.data });
        setServerIdx(0);
        setFrameKey((k) => k + 1);
      })
      .catch((e) => on && setState({ status: "error", message: (e as Error).message }));
    return () => {
      on = false;
    };
  }, [idStr]);

  const servers = useMemo(() => {
    if (state.status !== "ready") return [];
    const list = [...state.data.servers];
    if (!list.some((s) => s.embedUrl === state.data.defaultEmbed)) {
      list.unshift({ index: 0, label: "Server utama", embedUrl: state.data.defaultEmbed });
    }
    return list;
  }, [state]);

  const activeEmbed = servers[serverIdx]?.embedUrl ?? (state.status === "ready" ? state.data.defaultEmbed : "");

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex h-[70vh] max-w-6xl items-center justify-center px-4">
        <p className="text-sm text-ink3">Menyiapkan pemutar…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm text-ink3">{state.message}</p>
        <Link href="/nonton" className="btn-secondary mt-4">
          Ke Beranda Video
        </Link>
      </div>
    );
  }

  const d = state.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      {/* Pemutar */}
      <div className="overflow-hidden rounded-xl2 border border-line bg-black shadow-card">
        <div className="relative aspect-video w-full">
          {activeEmbed ? (
            <iframe
              key={`${frameKey}-${serverIdx}`}
              src={activeEmbed}
              title={`${d.title} — server ${serverIdx + 1}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-bold text-white/80">Tidak ada server tersedia</p>
              <p className="text-xs text-white/50">
                Coba pilih rilis dari beranda atau cari judul lain.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigasi atas kembali ke seri */}
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/nonton/${d.seriesSlug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-accent/50"
        >
          <ArrowLeftIcon width={15} height={15} />
          {d.seriesTitle || "Daftar Episode"}
        </Link>
        <Link
          href={`/nonton/${d.seriesSlug}`}
          className="ml-auto rounded-full bg-raised px-3 py-1.5 text-xs font-bold text-ink2 transition-colors hover:text-ink"
        >
          Semua Episode
        </Link>
      </div>

      {/* Judul */}
      <h1 className="display mt-3 text-xl font-black leading-tight sm:text-2xl">
        {d.epNumber ? `Episode ${d.epNumber}` : d.title}
      </h1>
      <p className="mt-0.5 line-clamp-2 text-[13px] text-ink3">{d.title}</p>
      <p className="mt-1 text-[11px] text-ink3">
        Subtitle Indonesia & English. Beberapa server menampilkan iklan singkat
        di awal video.
      </p>

      {/* Navigasi bab */}
      <div className="mt-4 flex gap-2.5">
        {d.prevId ? (
          <Link href={`/nonton/t/${d.prevId}`} className="btn-secondary flex-1">
            <ChevronLeftIcon width={16} height={16} />
            Sebelumnya
          </Link>
        ) : (
          <span className="btn-secondary flex-1 !cursor-not-allowed !opacity-40">Sebelumnya</span>
        )}
        {d.nextId ? (
          <Link href={`/nonton/t/${d.nextId}`} className="btn-primary flex-1">
            Berikutnya
            <ChevronRightIcon width={16} height={16} />
          </Link>
        ) : (
          <span className="btn-primary flex-1 !cursor-not-allowed !opacity-40">Terbaru</span>
        )}
      </div>

      {/* Pilih server */}
      {servers.length > 1 && (
        <section className="mt-6" aria-label="Pilih server pemutar">
          <h2 className="display mb-2 text-base font-bold">Pilih Server</h2>
          <p className="mb-3 text-xs text-ink3">
            Jika salah satu server bermasalah, coba server lain.
          </p>
          <div className="h-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {servers.map((s, i) => (
              <button
                key={`${i}-${s.label}`}
                type="button"
                onClick={() => {
                  setServerIdx(i);
                  setFrameKey((k) => k + 1);
                }}
                aria-pressed={i === serverIdx}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
                  i === serverIdx
                    ? "border-accent bg-accent text-onaccent"
                    : "border-line bg-surface text-ink2 hover:border-accent/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}