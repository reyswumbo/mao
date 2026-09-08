import Link from "next/link";
import type { ComicCard as ComicCardModel } from "@/lib/types";
import { BookIcon } from "./Icons";

/**
 * Kartu komik — grid responsif. Poster 2:3, judul 2 baris, badge tipa & status.
 * Menggunakan <img> biasa dengan lazy-loading native untuk performa mobile.
 */
export default function ComicCard({
  comic,
  priority = false,
  className = "",
}: {
  comic: ComicCardModel;
  priority?: boolean;
  className?: string;
}) {
  const href = `/komik/${comic.slug}`;
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-xl2 border border-line bg-surface shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lift ${className}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-raised">
        {comic.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comic.poster}
            alt={comic.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookIcon width={28} height={28} className="text-ink3" />
          </div>
        )}
        {comic.type && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {comic.type}
          </span>
        )}
        {comic.status && /ongo/i.test(comic.status) && (
          <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="hidden">Ongoing</span>
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-2.5">
        <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-ink">
          {comic.title}
        </p>
        {comic.latestChapter && (
          <p className="mt-1.5 truncate text-[11px] font-semibold text-accent">
            #{comic.latestChapter.number}
          </p>
        )}
        {!comic.latestChapter && comic.status && (
          <p className="mt-1.5 truncate text-[11px] font-medium text-ink3">
            {comic.status}
          </p>
        )}
      </div>
    </Link>
  );
}