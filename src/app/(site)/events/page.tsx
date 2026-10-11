import { EventsView } from "@/components/views/EventsView";
import { getContent } from "@/lib/content";

export default async function Events() {
  const { events } = await getContent();
  return <EventsView events={events} />;
}
