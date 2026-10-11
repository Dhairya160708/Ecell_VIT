import { ContactView } from "@/components/views/ContactView";
import { getContent } from "@/lib/content";

export default async function Contact() {
  const { site } = await getContent();
  return <ContactView email={site.email} address={site.address} />;
}
