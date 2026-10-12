import { ContactView } from "@/components/contact/ContactView";
import { getContent } from "@/server/content";

export default async function Contact() {
  const { site } = await getContent();
  return <ContactView email={site.email} address={site.address} />;
}
