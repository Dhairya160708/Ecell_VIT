import { MarketplaceView } from "@/components/views/MarketplaceView";
import { getContent } from "@/lib/content";

export default async function Marketplace() {
  const { listings, startups } = await getContent();
  const names = Object.fromEntries(startups.map((s) => [s.slug, s.name]));
  return <MarketplaceView listings={listings} names={names} />;
}
