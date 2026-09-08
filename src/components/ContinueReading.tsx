"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClockIcon, XIcon } from "./Icons";
import { getContinueList, clearContinue } from "@/lib/reader-store";
import type { ContinueEntry } from "@/lib/types";

/** Baris “Lanjutkan Membaca” dari localStorage — hanya tampak pada beranda. */
export default function ContinueReading() {
  const [items, setItems] = useState<ContinueEntry[]>([]);

  useEffect(() => {
    setItems(getContinueList());
  }, []);

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-6xl animate-fade-up">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-6">
        <ClockIcon width={17} height={17} className="text-accent" />
        <h2 className="display flex-1 text-[17px] font-bold sm:text-lg">
          Lanjut Membaca
        </h2>
      </div>
      <div className="h-scroll flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6">
        {items.map((e) => (
          <Link
            key={e.chapterId + e.slug}
            href={`/baca/${e.chapterId}`}
            className="relative w-64 shrink-0 overflow-hidden rounded-xl2 border border-line bg-surface shadow-card"
          >
            <div className="flex w-full items-center gap-3 p-2.5 pr-9">
              <div className="h-[72px] w-12 shrink-0 overflow-hidden rounded-lg bg-raised">
                {e.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.poster}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="display flex h-full w-full items-center justify-center text-base font-black text-ink3">
                    {e.title.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[13px] font-bold">{e.title}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-accent">
                  {e.chapterLabel}
                </p>
                <p className="mt-0.5 text-[10.5px] font-medium text-ink3">
                  {e.progress}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Hapus ${e.title} dari lanjut membaca`}
              onClick={(ev) => {
                ev.preventDefault();
                clearContinue(e.slug);
                setItems(getContinueList());
              }}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-ink3 transition-colors hover:bg-raised hover:text-ink"
            >
              <XIcon width={14} height={14} />
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
}