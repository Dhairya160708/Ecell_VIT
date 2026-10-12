import { Suspense } from "react";
import { MarketplaceView } from "@/components/views/MarketplaceView";
import { getContent } from "@/lib/content";

export default async function Marketplace() {
  const { listings, startups } = await getContent();
  const names = Object.fromEntries(startups.map((s) => [s.slug, s.name]));
  // useSearchParams (for the ?apply= deep link) needs a Suspense boundary.
  return (
    <Suspense>
      <MarketplaceView listings={listings} names={names} />
    </Suspense>
  );
}
