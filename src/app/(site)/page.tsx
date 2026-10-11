import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Ribbons } from "@/components/home/Ribbons";
import { AboutCell } from "@/components/home/AboutCell";
import { Divisions } from "@/components/home/Divisions";
import { EventsRail } from "@/components/home/EventsRail";
import { Ventures } from "@/components/home/Ventures";
import { People } from "@/components/home/People";
import { CallToAction } from "@/components/home/CallToAction";
import { getContent } from "@/lib/content";

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <Hero kicker={c.site.heroKicker} tagline={c.site.heroTagline} />
      <Manifesto text={c.site.manifesto} />
      <Ribbons words={c.divisions.map((d) => d.name)} />
      <AboutCell lead={c.site.aboutLead} body={c.site.aboutBody} stats={c.stats} />
      {c.divisions.length > 0 && <Divisions divisions={c.divisions} />}
      <EventsRail events={c.events} />
      {c.startups.length > 0 && <Ventures startups={c.startups} />}
      <People faculty={c.faculty} team={c.team} />
      <CallToAction heading={c.site.ctaHeading} />
    </>
  );
}
