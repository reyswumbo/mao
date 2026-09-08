import Link from "next/link";
import { getHome } from "@/lib/komiku";
import Hero from "@/components/Hero";
import ContinueReading from "@/components/ContinueReading";
import SectionRow from "@/components/SectionRow";
import { ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let home;
  try {
    home = await getHome();
  } catch (e) {
    return (
      <ErrorState message={`Beranda belum bisa dimuat: ${(e as Error).message}`}>
        <Link href="/katalog" className="btn-primary">
          Buka Katalog
        </Link>
      </ErrorState>
    );
  }

  const [heroSection, ...rest] = home.sections;

  return (
    <div className="space-y-7 pb-4">
      <Hero items={heroSection?.items ?? []} />
      <ContinueReading />
      {rest.map((s) => (
        <SectionRow key={s.title} title={s.title} items={s.items} />
      ))}
    </div>
  );
}