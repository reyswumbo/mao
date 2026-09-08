"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XIcon } from "./Icons";
import { useApp } from "./Providers";
import { MODULES } from "@/lib/config/source";

const MODE_LINKS: Record<string, { id: string; links: { label: string; href: string }[] }> = {
  baca: {
    id: "baca",
    links: [
      { label: "Beranda", href: "/" },
      { label: "Katalog", href: "/katalog" },
      { label: "Cari", href: "/cari" },
    ],
  },
  nonton: {
    id: "nonton",
    links: [
      { label: "Rilis Terbaru", href: "/nonton" },
      { label: "Cari Video", href: "/nonton/cari" },
    ],
  },
};

/** Panel samping: berpindah antara mode Baca Komik dan Nonton Video. */
export default function MenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useApp();
  const videoMode = pathname.startsWith("/nonton");

  return (
    <>
      {/* Penutup gelap */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu — pilih mode"
        className={`fixed inset-y-0 left-0 z-[70] flex w-[82%] max-w-sm flex-col overflow-y-auto border-r border-line bg-surface shadow-lift transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <span className="display text-xl font-black">
            99<span className="text-accent">app</span>
          </span>
          <span className="ml-auto rounded-full bg-raised px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink3">
            Pilih mode
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink2 transition-colors hover:bg-raised"
          >
            <XIcon width={18} height={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {MODULES.map((m) => {
            const active = m.id === "baca" ? !videoMode : videoMode;
            const modeLinks = MODE_LINKS[m.id]?.links ?? [];
            return (
              <div key={m.id}>
                <Link
                  href={m.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl2 border-2 px-4 py-3.5 transition-colors ${
                    active
                      ? "border-accent bg-accent/5"
                      : "border-line bg-surface hover:border-accent/40"
                  }`}
                >
                  <span className="text-2xl">{m.mode}</span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-black text-ink">
                      {m.label}
                    </span>
                    <span className="block truncate text-[11px] font-medium text-ink3">
                      {m.baseUrl.replace(/^https?:\/\//, "")}
                    </span>
                  </span>
                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-accent" aria-label="Mode aktif" />
                  )}
                </Link>
                {active && (
                  <ul className="mt-2 space-y-1 pl-4">
                    {modeLinks.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={onClose}
                          className={`block rounded-lg px-3 py-2 text-[13px] font-bold transition-colors ${
                            pathname === l.href
                              ? "text-accent"
                              : "text-ink2 hover:bg-raised hover:text-ink"
                          }`}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-[13px] font-bold text-ink2">
              {theme === "light" ? "Tema terang" : "Tema gelap"}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-secondary !px-4 !py-2 !text-xs"
            >
              Ganti tema
            </button>
          </div>
        </div>

        <p className="mt-auto px-5 pb-5 text-[10px] leading-relaxed text-ink3">
          Baca komik dari Komiku & nonton anime dari AnimeXin — nyaman di HP,
          tablet, laptop, dan desktop.
        </p>
      </aside>
    </>
  );
}