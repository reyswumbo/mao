import Link from "next/link";
import type { ComicCard as ComicCardModel } from "@/lib/types";
import { FlameIcon } from "./Icons";

/**
 * Hero beranda: “Populer” dari peringkat Komiku.
 * Mobile = sorot geser (snap); desktop = item teratas besar + daftar.
 */
export default function Hero({ items }: { items: ComicCardModel[] }) {
  if (!items.length) return null;
  const top = items[0];
  const rest = items.slice(1, 8);

  return (
    <section className="animate-fade-up border-b border-line bg-gradient-to-b from-raised/60 to-transparent pb-2 pt-4 sm:pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-3 flex items-center gap-2">
          <FlameIcon width={18} height={18} className="text-accent" />
          <h1 className="display text-lg font-black sm:text-2xl">Populer</h1>
          <span className="text-xs font-semibold text-ink3">
            lagi dibaca di Komiku
          </span>
        </div>

        {/* Mobile: swipe list */}
        <div className="h-scroll flex snap-x gap-3 overflow-x-auto pb-2 sm:hidden">
          {items.map((c, i) => (
            <Link
              key={c.id}
              href={`/komik/${c.slug}`}
              className="relative w-40 shrink-0 snap-start overflow-hidden rounded-xl2 border border-line bg-surface shadow-card"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.poster}
                  alt={c.title}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="display absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-lg bg-accent px-1 text-sm font-black text-onaccent shadow-md">
                {i + 1}
              </span>
              <div className="p-2.5">
                <p className="line-clamp-2 text-[12.5px] font-bold leading-snug">
                  {c.title}
                </p>
                {c.latestChapter && (
                  <p className="mt-1 text-[11px] font-semibold text-accent">
                    #{c.latestChapter.number}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: featured + list */}
        <div className="hidden gap-4 sm:flex">
          <Link
            href={`/komik/${top.slug}`}
            className="group relative block w-[38%] max-w-sm shrink-0 overflow-hidden rounded-xl2 shadow-card"
          >
            <div className="aspect-[3/4] overflow-hidden bg-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={top.poster}
                alt={top.title}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 pt-14">
              <span className="display text-2xl font-black text-accent">#1</span>
              <p className="display line-clamp-2 text-lg font-bold text-white">
                {top.title}
              </p>
              {top.latestChapter && (
                <p className="mt-1 text-xs font-bold text-accentwarm">
                  Chapter {top.latestChapter.number}
                </p>
              )}
            </div>
          </Link>

          <ul className="flex-1 space-y-2.5">
            {rest.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/komik/${c.slug}`}
                  className="group flex items-center gap-3 rounded-xl2 border border-line bg-surface p-2 pr-3 shadow-sm transition-colors hover:border-accent/50"
                >
                  <span className="display w-7 shrink-0 text-center text-base font-black text-ink3 group-hover:text-accent">
                    {i + 2}
                  </span>
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-raised">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.poster}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13.5px] font-bold">
                      {c.title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-ink3">
                      {c.type ? `${c.type.toUpperCase()} · ` : ""}
                      {c.latestChapter ? `Chapter ${c.latestChapter.number}` : c.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-bold text-accent">
                    {i + 2}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}