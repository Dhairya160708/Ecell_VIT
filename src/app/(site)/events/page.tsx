import { EventsView } from "@/components/views/EventsView";
import { getContent } from "@/server/content";

export default async function Events() {
  const { events } = await getContent();
  return <EventsView events={events} />;
}
