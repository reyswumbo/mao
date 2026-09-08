"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BookIcon, SearchIcon, XIcon } from "@/components/Icons";
import { CardGridSkeleton } from "@/components/States";
import { fetchJson } from "@/lib/use-api";
import type { ComicCard as ComicCardModel, SearchResult } from "@/lib/types";

export default function CariPage() {
  return (
    <Suspense fallback={null}>
      <CariInner />
    </Suspense>
  );
}

function CariInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [items, setItems] = useState<ComicCardModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function run(query: string) {
    const s = ++seq.current;
    if (!query.trim()) {
      setItems([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    const r = await fetchJson<SearchResult>(`/api/cari?q=${encodeURIComponent(query)}`);
    if (s !== seq.current) return;
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Pencarian gagal.");
      setItems([]);
      return;
    }
    setItems(r.data?.items ?? []);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
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
          placeholder="Judul komik, mis. One Piece"
          aria-label="Cari judul komik"
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
        <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <li key={it.id + String(i)}>
              <Link
                href={`/komik/${it.slug}`}
                className="group flex items-center gap-3 rounded-xl2 border border-line bg-surface p-2.5 pr-3 shadow-card transition-colors hover:border-accent/50"
              >
                <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-raised">
                  <span className="display text-lg font-black text-ink3 group-hover:text-accent">
                    {it.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13.5px] font-bold">
                    {it.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-ink3">
                    {it.type && (
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 font-bold uppercase text-accent">
                        {it.type}
                      </span>
                    )}
                    <span className="line-clamp-1">{it.status ?? "Komik"}</span>
                  </p>
                </div>
                <BookIcon width={16} height={16} className="shrink-0 text-ink3" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-sm text-ink2">
          Ketik judul untuk mulai mencari — hasil diperbarui dengan cepat.
        </p>
      )}
    </div>
  );
}