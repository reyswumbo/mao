"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, HomeIcon, SearchIcon } from "./Icons";
import { useApp } from "./Providers";

const COMIC_NAV = [
  { href: "/", label: "Beranda", Icon: HomeIcon, match: (p: string) => p === "/" },
  { href: "/cari", label: "Cari", Icon: SearchIcon, match: (p: string) => p.startsWith("/cari") },
  { href: "/katalog", label: "Katalog", Icon: GridIcon, match: (p: string) => p.startsWith("/katalog") },
];

const VIDEO_NAV = [
  { href: "/nonton", label: "Beranda", Icon: HomeIcon, match: (p: string) => p === "/nonton" },
  { href: "/nonton/cari", label: "Cari", Icon: SearchIcon, match: (p: string) => p.startsWith("/nonton/cari") },
];

/** Bilah navigasi bawah — mengikuti mode aktif (baca/nonton). */
export default function BottomNav() {
  const { settings } = useApp();
  void settings;
  const path = usePathname();

  if (path.startsWith("/baca") || path.startsWith("/nonton/t")) return null;

  const items = path.startsWith("/nonton") ? VIDEO_NAV : COMIC_NAV;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-lg md:hidden"
    >
      <ul
        className="mx-auto flex max-w-md items-stretch"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
      >
        {items.map(({ href, label, Icon, match }) => {
          const active = match(path);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[52px] flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors ${
                  active ? "text-accent" : "text-ink3 hover:text-ink2"
                }`}
              >
                <Icon width={21} height={21} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}