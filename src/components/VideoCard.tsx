import Link from "next/link";
import type { VideoCard as VideoCardModel } from "@/lib/types";

/** Kartu video — paralel dengan ComicCard, dengan overlay ikon putar + label EP. */
export default function VideoCard({
  item,
  className = "",
}: {
  item: VideoCardModel;
  className?: string;
}) {
  const href = item.isEpisode
    ? `/nonton/t/${item.target.replace(/^https:\/\/animexin\.dev\/+/, "")}`
    : `/nonton/${item.slug}`;
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-xl2 border border-line bg-surface shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lift ${className}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-raised">
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-ink3">
            ▶
          </div>
        )}
        {/* Ikon putar saat hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
          <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
        </div>
        {item.epLabel && (
          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-accent px-2 py-0.5 text-[11px] font-black text-onaccent shadow-md">
            {item.epLabel}
          </span>
        )}
        {!item.epLabel && item.type && (
          <span className="absolute right-1.5 top-1.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {item.type}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-2.5">
        <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-ink">
          {item.title}
        </p>
        {item.type && item.epLabel && (
          <p className="mt-1.5 truncate text-[11px] font-semibold text-ink3">
            {item.type}
          </p>
        )}
      </div>
    </Link>
  );
}