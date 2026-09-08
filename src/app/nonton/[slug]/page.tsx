import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getVideoSeries } from "@/lib/animexin";
import { ArrowLeftIcon, PlayIcon } from "@/components/Icons";
import { ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await getVideoSeries(slug);
    if (!s) return { title: "Video tidak ditemukan" };
    return {
      title: s.title,
      description: s.description?.slice(0, 180) ?? `Tonton ${s.title} dengan subtitle Indonesia.`,
    };
  } catch {
    return { title: "Video tidak ditemukan" };
  }
}

export default async function VideoSeriesDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let s;
  try {
    s = await getVideoSeries(slug);
  } catch (e) {
    return (
      <ErrorState message={`Detail gagal dimuat: ${(e as Error).message}`}>
        <Link href="/nonton" className="btn-secondary">
          Ke Beranda Video
        </Link>
      </ErrorState>
    );
  }
  if (!s || !s.title) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <nav aria-label="Tautan video" className="mb-3 md:hidden">
        <Link
          href="/nonton"
          className="inline-flex items-center gap-1 text-xs font-bold text-ink3 hover:text-ink"
        >
          <ArrowLeftIcon width={16} height={16} />
          Nonton
        </Link>
      </nav>

      {/* Identitas + aksi */}
      <div className="grid gap-5 md:grid-cols-[minmax(180px,220px)_1fr] md:gap-8">
        <div className="mx-auto w-44 md:mx-0 md:w-full">
          <div className="overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.poster}
              alt={s.title}
              loading="eager"
              decoding="async"
              className="aspect-[2/3] w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="display text-2xl font-black leading-tight md:text-4xl">
            {s.title}
          </h1>
          {s.altTitle && <p className="mt-1 text-sm italic text-ink3">{s.altTitle}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {s.type && <span className="chip uppercase">{s.type}</span>}
            {s.status && (
              <span
                className={`chip ${
                  /ongo/i.test(s.status)
                    ? "border-emerald-400/40 text-emerald-600 dark:text-emerald-400"
                    : ""
                }`}
              >
                {s.status}
              </span>
            )}
            {s.rating && <span className="chip">★ {s.rating}</span>}
          </div>

          <dl className="mt-4 space-y-1.5 text-sm text-ink2">
            {s.studio && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink3">Studio</dt>
                <dd className="font-medium text-ink">{s.studio}</dd>
              </div>
            )}
            {s.network && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink3">Jaringan</dt>
                <dd className="font-medium text-ink">{s.network}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-semibold text-ink3">Total</dt>
              <dd className="font-medium text-ink">
                {s.episodeCount.toLocaleString("id-ID")} episode
              </dd>
            </div>
          </dl>

          {s.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {s.genres.slice(0, 12).map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-raised px-2.5 py-1 text-[11px] font-semibold text-ink2"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            {s.lastEpId && (
              <Link href={`/nonton/t/${s.lastEpId}`} className="btn-primary">
                <PlayIcon width={15} height={15} />
                Tonton Episode Terbaru
              </Link>
            )}
            {s.firstEpId && s.firstEpId !== s.lastEpId && (
              <Link href={`/nonton/t/${s.firstEpId}`} className="btn-secondary">
                Dari Episode 1
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sinopsis */}
      {s.description && (
        <section className="surface-card mt-8 p-5">
          <h2 className="display mb-2 text-base font-bold">Sinopsis</h2>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink2">
            {s.description}
          </p>
        </section>
      )}

      {/* Daftar episode */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="display text-base font-bold">Episode</h2>
          <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-bold text-ink3">
            {s.episodeList.length.toLocaleString("id-ID")}
          </span>
        </div>
        {s.episodeList.length > 0 ? (
          <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
            {s.episodeList.slice(0, 300).map((ep) => (
              <li key={ep.id}>
                <Link
                  href={`/nonton/t/${ep.id}`}
                  className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-raised/60"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-raised font-black text-[11px] text-ink2 transition-colors group-hover:bg-accent group-hover:text-onaccent">
                    {ep.num}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-ink">
                      Episode {ep.num}
                    </span>
                    {ep.date && (
                      <span className="block text-[11px] font-medium text-ink3">
                        {ep.date}
                      </span>
                    )}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink3 transition-colors group-hover:text-accent" aria-hidden>
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl2 border border-line bg-surface p-5 text-sm text-ink3">
            Daftar episode belum tersedia.
          </p>
        )}
      </section>
    </div>
  );
}