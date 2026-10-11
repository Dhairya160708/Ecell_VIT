import { StartupsView } from "@/components/views/StartupsView";
import { getContent } from "@/lib/content";

export default async function Startups() {
  const { startups } = await getContent();
  return <StartupsView startups={startups} />;
}
