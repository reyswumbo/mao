import { getVideoHome } from "@/lib/animexin";
import VideoSectionRow from "@/components/VideoSectionRow";
import VideoFeedGrid from "@/components/VideoFeedGrid";
import { ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata = {
  title: "Nonton Video — 99app",
  description:
    "Koleksi anime & donghua dengan subtitle Indonesia dan Inggris, diperbarui tiap hari.",
};

export default async function NontonHome() {
  let data;
  try {
    data = await getVideoHome();
  } catch {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorState message="Gagal memuat beranda video. Sumber sedang sibuk — coba lagi sebentar lagi." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6">
      <div className="animate-fade-up px-4 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
          Nonton
        </p>
        <h1 className="display mt-1 text-2xl font-black leading-tight sm:text-3xl">
          Video Populer Hari Ini
        </h1>
      </div>

      <VideoSectionRow title="Populer Hari Ini" items={data.popular} />
      <VideoFeedGrid initial={data.latest} />
    </div>
  );
}