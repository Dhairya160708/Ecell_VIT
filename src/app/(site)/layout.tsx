import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { getContent } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getContent();
  return (
    <div className="grain">
      <Intro />
      <ScrollProgress />
      <Nav />
      <main>{children}</main>
      <Footer site={site} />
    </div>
  );
}
