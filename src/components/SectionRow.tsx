import type { ReactNode } from "react";
import { ChevronRightIcon } from "./Icons";
import ComicCard from "./ComicCard";
import type { ComicCard as ComicCardModel } from "@/lib/types";

/**
 * Deretan section beranda: judul + "Lihat semua" + gulir horizontal.
 * Di mobile kartu ±34% lebar layar; di layar besar ±180px.
 */
export default function SectionRow({
  title,
  items,
  href,
  icon,
}: {
  title: string;
  items: ComicCardModel[];
  href?: string;
  icon?: ReactNode;
}) {
  if (!items.length) return null;
  return (
    <section className="animate-fade-up">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-6">
        {icon}
        <h2 className="display flex-1 text-[17px] font-bold sm:text-lg">
          {title}
        </h2>
        {href && (
          <a
            href={href}
            className="flex items-center gap-0.5 text-xs font-bold text-accent"
          >
            Lihat semua
            <ChevronRightIcon width={14} height={14} />
          </a>
        )}
      </div>
      <div className="h-scroll flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6">
        {items.map((c) => (
          <ComicCard
            key={c.id}
            comic={c}
            className="w-[34vw] shrink-0 max-w-[168px] sm:w-40"
          />
        ))}
      </div>
    </section>
  );
}