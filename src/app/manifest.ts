import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "99app — Baca Komik Nyaman",
    short_name: "99app",
    description:
      "Baca komik manga, manhwa, dan manhua dari Komiku dengan nyaman — mobile-first.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1e8",
    theme_color: "#f4f1e8",
    orientation: "portrait-primary",
    categories: ["entertainment", "books"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}