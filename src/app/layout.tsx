import { Fraunces, Manrope } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "99app — Baca Komik Nyaman",
    template: "%s · 99app",
  },
  description:
    "Baca komik manga, manhwa, dan manhua dari Komiku dengan nyaman — mobile-first, tema tersendiri, lanjutkan di mana terakhir berhenti.",
  applicationName: "99app",
  keywords: ["komik", "manga", "manhwa", "manhua", "baca komik", "komiku"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#12100d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${manrope.variable} ${fraunces.variable}`} suppressHydrationWarning>
      {/* Script awal tema: cegah FOUC gelap/terang. */}
      <body suppressHydrationWarning>
        <Providers>
          <script
            dangerouslySetInnerHTML={{
              __html: `
try{var t=JSON.parse(localStorage.getItem("99app:site-theme")||"null");
if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}
`,
            }}
          />
          <AppHeader />
          <main className="min-h-[100svh] pb-20 md:pb-10">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}