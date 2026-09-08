import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSeries } from "@/lib/komiku";
import ChapterList from "@/components/ChapterList";
import { ArrowLeftIcon } from "@/components/Icons";
import { ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await getSeries(slug);
    if (!s) return { title: "Komik tidak ditemukan" };
    return {
      title: s.title,
      description: s.synopsis?.slice(0, 180) ?? `Baca komik ${s.title} satu bab demi satu bab.`,
    };
  } catch {
    return { title: "Komik tidak ditemukan" };
  }
}

export default async function KomikDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let s;
  try {
    s = await getSeries(slug);
  } catch (e) {
    return (
      <ErrorState message={`Detail gagal dimuat: ${(e as Error).message}`}>
        <Link href="/katalog" className="btn-secondary">
          Ke Katalog
        </Link>
      </ErrorState>
    );
  }
  if (!s || !s.title) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <nav aria-label="Tautan komik" className="mb-3 md:hidden">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1 text-xs font-bold text-ink3 hover:text-ink"
        >
          <ArrowLeftIcon width={16} height={16} />
          Katalog
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
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="display text-3xl font-black leading-tight md:text-4xl">
            {s.title}
          </h1>
          {s.altTitle && (
            <p className="mt-1 text-sm italic text-ink3">{s.altTitle}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {s.type && (
              <span className="chip uppercase">{s.type}</span>
            )}
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
            {s.lastChapterId && (
              <span className="chip">Terbaru: Chapter {s.chapters[0]?.number}</span>
            )}
          </div>

          <dl className="mt-4 space-y-1.5 text-sm text-ink2">
            {s.author && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink3">Pengarang</dt>
                <dd className="font-medium text-ink">{s.author}</dd>
              </div>
            )}
            {s.artist && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink3">Ilustrasi</dt>
                <dd className="font-medium text-ink">{s.artist}</dd>
              </div>
            )}
            {s.chapters.length > 0 && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink3">Jumlah</dt>
                <dd className="font-medium text-ink">
                  {s.chapters.length.toLocaleString("id-ID")} bab
                </dd>
              </div>
            )}
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
            {s.firstChapterId && (
              <Link href={`/baca/${s.firstChapterId}`} className="btn-primary">
                Baca Bab Pertama
              </Link>
            )}
            {s.lastChapterId && s.firstChapterId !== s.lastChapterId && (
              <Link href={`/baca/${s.lastChapterId}`} className="btn-secondary">
                Bab Terbaru
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sinopsis */}
      {s.synopsis && (
        <section className="surface-card mt-8 p-5">
          <h2 className="display mb-2 text-base font-bold">Sinopsis</h2>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink2">
            {s.synopsis}
          </p>
        </section>
      )}

      {/* Daftar bab */}
      <section className="mt-8">
        <h2 className="display mb-3 flex items-center gap-2 text-base font-bold">
          Chapter
          <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-bold text-ink3">
            {s.chapters.length.toLocaleString("id-ID")}
          </span>
        </h2>
        <ChapterList slug={s.slug} chapters={s.chapters} />
      </section>
    </div>
  );
}