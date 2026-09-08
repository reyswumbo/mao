"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MoonIcon, SearchIcon, SunIcon } from "./Icons";
import { useApp } from "./Providers";

/** Pita atas yang ringkas: logo, pencarian (desktop), toggle tema. */
export default function AppHeader() {
  const { theme, toggleTheme } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const pathname = usePathname();

  if (pathname.startsWith("/baca")) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/cari?q=${encodeURIComponent(v)}` : "/cari");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5"
          aria-label="99app beranda"
        >
          <span className="display text-xl font-black leading-none tracking-tight sm:text-2xl">
            99<span className="text-accent">app</span>
          </span>
        </Link>

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

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/cari"
            aria-label="Halaman pencarian"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink2 transition-colors hover:bg-raised hover:text-ink md:hidden"
          >
            <SearchIcon width={20} height={20} />
          </Link>
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
  );
}