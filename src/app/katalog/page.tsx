"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ComicCard from "@/components/ComicCard";
import { CardGridSkeleton, ErrorState } from "@/components/States";
import { fetchJson } from "@/lib/use-api";
import { COMIC_TYPES } from "@/lib/config/source";
import type { ComicCard as ComicCardModel, ListResult } from "@/lib/types";

const ALPHABET = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "Y", "Z"];

const TIPE_OPTIONS = [{ v: "", label: "Semua" }, ...COMIC_TYPES.map((t) => ({ v: t, label: t }))];
const STATUS_OPTIONS = [
  { v: "", label: "Semua" },
  { v: "ongoing", label: "On Going" },
  { v: "completed", label: "Tamat" },
];

export default function KatalogPage() {
  const [tipe, setTipe] = useState("");
  const [status, setStatus] = useState("");
  const [huruf, setHuruf] = useState("");
  const [items, setItems] = useState<ComicCardModel[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const seq = useRef(0);

  const load = useCallback(
    async (p: number, append: boolean, opts?: { tipe?: string; status?: string; huruf?: string }) => {
      const s = ++seq.current;
      append ? setLoadingMore(true) : setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(p) });
      if (opts?.tipe) params.set("tipe", opts.tipe);
      if (opts?.status) params.set("status", opts.status);
      if (opts?.huruf) params.set("huruf", opts.huruf);
      const r = await fetchJson<ListResult>(`/api/katalog?${params}`);
      if (s !== seq.current) return;
      append ? setLoadingMore(false) : setLoading(false);
      if (!r.ok) return setError(r.error ?? "Terjadi kesalahan.");
      const d = r.data!;
      setItems((prev) => (append ? [...prev, ...d.items] : d.items));
      setTotal(d.total ?? 0);
      setHasMore(d.hasMore);
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    load(1, false, { tipe, status, huruf });
  }, [tipe, status, huruf, load]);

  function change(ch: "tipe" | "status" | "huruf", v: string) {
    if (ch === "tipe") setTipe(v);
    if (ch === "status") setStatus(v);
    if (ch === "huruf") setHuruf(v);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <div className="mb-4">
        <h1 className="display text-2xl font-black">Katalog</h1>
        <p className="text-sm text-ink2">Jelajahi semua komik — urut abjad.</p>
      </div>

      <div className="sticky top-14 z-30 -mx-4 space-y-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          {TIPE_OPTIONS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => change("tipe", o.v)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                tipe === o.v
                  ? "bg-accent text-onaccent"
                  : "border border-line bg-surface text-ink2 hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-ink3">
            {total ? `${total.toLocaleString("id-ID")} judul` : ""}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => change("status", o.v)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                status === o.v
                  ? "bg-ink text-bg"
                  : "border border-line bg-surface text-ink2"
              }`}
            >
              {o.label}
            </button>
          ))}
          <span className="mx-1 hidden w-px bg-line sm:block" />
          <div className="h-scroll flex shrink-0 gap-1 sm:ml-auto">
            {ALPHABET.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => change("huruf", l === "#" ? "" : l)}
                aria-pressed={huruf === l}
                className={`h-8 w-8 shrink-0 rounded-full text-xs font-bold transition-colors ${
                  huruf === l
                    ? "bg-accent text-onaccent"
                    : "border border-line bg-surface text-ink2 hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        {loading ? (
          <CardGridSkeleton count={18} />
        ) : error ? (
          <ErrorState message={error} />
        ) : !items.length ? (
          <ErrorState message="Tidak ada komik yang cocok dengan saringan ini." />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 xl:grid-cols-7">
              {items.map((c) => (
                <ComicCard key={c.id} comic={c} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => {
                    const np = page + 1;
                    setPage(np);
                    load(np, true, { tipe, status, huruf });
                  }}
                  className="btn-secondary"
                >
                  {loadingMore ? "Memuat…" : "Muat Lainnya"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}