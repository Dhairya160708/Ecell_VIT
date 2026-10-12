import { StartupsView } from "@/components/startups/StartupsView";
import { getContent } from "@/server/content";

export default async function Startups() {
  const { startups } = await getContent();
  return <StartupsView startups={startups} />;
}
