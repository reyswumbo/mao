"use client";

import { useCallback, useState } from "react";
import { fetchJson } from "@/lib/use-api";
import VideoCard from "./VideoCard";
import type { VideoCard as VideoCardModel } from "@/lib/types";
import { CardGridSkeleton, ErrorState } from "./States";

/** Grid rilis terbaru + tombol "Muat lainnya" (menambah halaman berikutnya). */
export default function VideoFeedGrid({
  initial,
}: {
  initial: VideoCardModel[];
}) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchJson<{ items: VideoCardModel[] }>(
        `/api/nonton/feed?page=${page + 1}`,
      );
      if (!res.ok) throw new Error(res.error ?? "Gagal memuat");
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...(res.data?.items ?? []).filter((item: VideoCardModel) => !seen.has(item.id))];
      });
      setPage((p) => p + 1);
    } catch {
      setError("Gagal memuat episode berikutnya. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  return (
    <section className="max-w-6xl px-4 py-6 sm:px-6" aria-label="Rilis terbaru">
      <h2 className="display mb-3 text-[17px] font-bold sm:text-lg">
        Rilis Terbaru
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {items.map((c) => (
          <VideoCard key={c.id} item={c} />
        ))}
      </div>
      {loading && <CardGridSkeleton count={6} />}
      {error && <ErrorState message={error} />}
      <div className="mt-6 flex justify-center">
        <button type="button" onClick={loadMore} disabled={loading} className="btn-primary">
          {loading ? "Memuat…" : "Muat lainnya"}
        </button>
      </div>
    </section>
  );
}