"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MoonIcon, SearchIcon, SunIcon } from "./Icons";
import { useApp } from "./Providers";
import MenuDrawer from "./MenuDrawer";

/** Pita atas: hamburger (pindah mode), logo, pencarian (desktop), toggle tema. */
export default function AppHeader() {
  const { theme, toggleTheme } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/baca") || pathname.startsWith("/nonton/t")) return null;

  const videoMode = pathname.startsWith("/nonton");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/cari?q=${encodeURIComponent(v)}` : "/cari");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Buka menu — pilih mode"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-raised"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link
            href={videoMode ? "/nonton" : "/"}
            className="flex shrink-0 items-center gap-1.5"
            aria-label={videoMode ? "99app beranda video" : "99app beranda"}
          >
            <span className="display text-xl font-black leading-none tracking-tight sm:text-2xl">
              99<span className="text-accent">app</span>
            </span>
            {videoMode && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">
                Video
              </span>
            )}
          </Link>

          {!videoMode && (
            <form
              onSubmit={submit}
              role="search"
              className="ml-auto hidden min-w-0 flex-1 max-w-sm items-center gap-2 rounded-full border border-line bg-raised/70 px-3.5 py-2 transition-colors focus-within:border-accent/60 md:flex"
            >
              <SearchIcon width={15} height={15} className="shrink-0 text-ink3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul komik…"
                aria-label="Cari judul komik"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink3 focus:outline-none"
              />
            </form>
          )}

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {!videoMode && (
              <Link
                href="/cari"
                aria-label="Halaman pencarian komik"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink2 transition-colors hover:bg-raised hover:text-ink md:hidden"
              >
                <SearchIcon width={20} height={20} />
              </Link>
            )}
            {videoMode && (
              <Link
                href="/nonton/cari"
                aria-label="Halaman pencarian video"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink2 transition-colors hover:bg-raised hover:text-ink md:hidden"
              >
                <SearchIcon width={20} height={20} />
              </Link>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Gunakan tema gelap" : "Gunakan tema terang"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink2 transition-colors hover:bg-raised hover:text-ink"
            >
              {theme === "light" ? (
                <MoonIcon width={20} height={20} />
              ) : (
                <SunIcon width={20} height={20} />
              )}
            </button>
          </div>
        </div>
      </header>
      <MenuDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}