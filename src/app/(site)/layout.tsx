import { Suspense } from "react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Intro } from "@/components/layout/Intro";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { getContent } from "@/server/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getContent();
  return (
    <div className="grain">
      <Intro />
      <ScrollProgress />
      {/* usePathname() in Nav needs a Suspense boundary on routes with dynamic params */}
      <Suspense fallback={null}>
        <Nav />
      </Suspense>
      <main>{children}</main>
      <Footer site={site} />
    </div>
  );
}
