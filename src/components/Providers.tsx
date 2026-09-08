"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadReaderSettings,
  loadSiteTheme,
  saveReaderSettings,
  saveSiteTheme,
  type ReaderSettings,
} from "@/lib/reader-store";

type Theme = "light" | "dark";

interface ProvidersCtx {
  theme: Theme;
  toggleTheme: () => void;
  settings: ReaderSettings;
  updateSettings: (patch: Partial<ReaderSettings>) => void;
}

const Ctx = createContext<ProvidersCtx | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [settings, setSettings] = useState<ReaderSettings>(() => loadReaderSettings());

  useEffect(() => {
    setTheme(loadSiteTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveSiteTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const updateSettings = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveReaderSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, settings, updateSettings }),
    [theme, toggleTheme, settings, updateSettings],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): ProvidersCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp harus dipakai di dalam <Providers>");
  return ctx;
}