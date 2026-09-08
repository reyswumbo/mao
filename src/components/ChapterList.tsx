"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRightIcon, SearchIcon, XIcon } from "./Icons";
import { getContinueList } from "@/lib/reader-store";
import type { ChapterStub } from "@/lib/types";

/** Daftar bab dengan pencarian + penanda bab terakhir dibaca. */
export default function ChapterList({
  slug,
  chapters,
}: {
  slug: string;
  chapters: ChapterStub[];
}) {
  const [q, setQ] = useState("");
  const resume = useMemo(
    () => getContinueList().find((e) => e.slug === slug),
    [slug],
  );

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return chapters;
    return chapters.filter((c) => `chapter ${c.number}`.includes(k) || c.id.includes(k));
  }, [q, chapters]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-bold text-ink3">
          {chapters.length.toLocaleString("id-ID")} bab
        </span>
        <div className="ml-auto flex w-full max-w-[200px] items-center gap-1.5 rounded-full border border-line bg-raised/60 px-3 py-1.5 focus-within:border-accent/60">
          <SearchIcon width={13} height={13} className="shrink-0 text-ink3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari bab…"
            aria-label="Cari bab"
            className="w-full bg-transparent text-xs text-ink placeholder:text-ink3 focus:outline-none"
          />
          {q && (
            <button type="button" aria-label="Bersihkan" onClick={() => setQ("")}>
              <XIcon width={12} height={12} className="text-ink3" />
            </button>
          )}
        </div>
      </div>

      {resume && (
        <Link
          href={`/baca/${resume.chapterId}`}
          className="mb-2 flex items-center gap-3 rounded-xl2 border-2 border-accent/50 bg-accent/5 px-4 py-3"
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          <span className="text-[13px] font-bold text-ink">
            Lanjutkan di {resume.chapterLabel}
          </span>
          <span className="ml-auto text-[11px] font-medium text-ink3">
            {resume.progress}
          </span>
          <ChevronRightIcon width={16} height={16} className="text-ink3" />
        </Link>
      )}

      {!filtered.length ? (
        <p className="py-6 text-center text-xs text-ink3">
          Tidak ada bab yang cocok.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface">
          {filtered.slice(0, 200).map((c) => {
            const isCurrent = resume?.chapterId === c.id;
            return (
              <li key={c.id}>
                <Link
                  href={`/baca/${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-raised/60 ${
                    isCurrent ? "bg-accent/5" : ""
                  }`}
                >
                  {isCurrent && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-accent"
                      aria-label="Terakhir dibaca"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">
                    Chapter {c.number}
                  </span>
                  {c.date && (
                    <span className="shrink-0 text-[11px] font-medium text-ink3">
                      {c.date}
                    </span>
                  )}
                  <ChevronRightIcon width={15} height={15} className="shrink-0 text-ink3" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {filtered.length > 200 && (
        <p className="mt-2 text-center text-[11px] text-ink3">
          Menampilkan 200 pertama — gunakan pencarian untuk yang lain.
        </p>
      )}
    </div>
  );
}