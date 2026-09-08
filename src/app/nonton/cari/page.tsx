"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon, XIcon } from "@/components/Icons";
import VideoCard from "@/components/VideoCard";
import { CardGridSkeleton } from "@/components/States";
import { fetchJson } from "@/lib/use-api";
import type { VideoCard as VideoCardModel } from "@/lib/types";

export default function NontonCariPage() {
  return (
    <Suspense fallback={null}>
      <NontonCariInner />
    </Suspense>
  );
}

function NontonCariInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [items, setItems] = useState<VideoCardModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = useCallback(async (query: string) => {
    const s = ++seq.current;
    setError("");
    if (!query.trim()) {
      setItems([]);
      return;
    }
    setLoading(true);
    const r = await fetchJson<{ items: VideoCardModel[] }>(
      `/api/nonton/cari?q=${encodeURIComponent(query)}`,
    );
    if (s !== seq.current) return;
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Pencarian gagal.");
      setItems([]);
      return;
    }
    setItems(r.data?.items ?? []);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
        Nonton Video
      </p>
      <h1 className="display mb-4 mt-1 text-xl font-black sm:text-2xl">Cari Video</h1>

      <form
        role="search"
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-3 shadow-card focus-within:border-accent/60"
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
      >
        <SearchIcon width={18} height={18} className="shrink-0 text-ink3" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Judul anime / donghua…"
          aria-label="Cari judul video"
          className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink3 focus:outline-none"
        />
        {q && (
          <button
            type="button"
            aria-label="Bersihkan"
            onClick={() => {
              setQ("");
              run("");
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink3 hover:bg-raised hover:text-ink"
          >
            <XIcon width={14} height={14} />
          </button>
        )}
      </form>

      {error ? (
        <p className="mt-8 text-center text-sm text-ink3">{error}</p>
      ) : loading ? (
        <div className="mt-8">
          <CardGridSkeleton count={12} />
        </div>
      ) : q && !items.length ? (
        <p className="mt-10 text-center text-sm text-ink3">
          Tidak ada hasil untuk “{q}”.
        </p>
      ) : items.length > 0 ? (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {items.map((it) => (
            <VideoCard key={it.id} item={it} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-ink2">
          Ketik judul untuk mulai mencari — hasil diperbarui dengan cepat.
        </p>
      )}
    </div>
  );
}