import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Ribbons } from "@/components/home/Ribbons";
import { AboutCell } from "@/components/home/AboutCell";
import { Divisions } from "@/components/home/Divisions";
import { EventsRail } from "@/components/home/EventsRail";
import { Ventures } from "@/components/home/Ventures";
import { StartupMarquee } from "@/components/home/StartupMarquee";
import { GalleryMasonry } from "@/components/home/GalleryMasonry";
import { TeamMarquee } from "@/components/home/TeamMarquee";
import { People } from "@/components/home/People";
import { CallToAction } from "@/components/home/CallToAction";
import { getContent } from "@/server/content";

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <Hero tagline={c.site.heroTagline} />
      <Manifesto text={c.site.manifesto} />
      <Ribbons words={c.divisions.map((d) => d.name)} />
      <AboutCell lead={c.site.aboutLead} body={c.site.aboutBody} stats={c.stats} />
      {c.divisions.length > 0 && <Divisions divisions={c.divisions} />}
      <EventsRail events={c.events} />
      {c.startups.length > 0 && <Ventures startups={c.startups} />}
      <StartupMarquee startups={c.startups} />
      <GalleryMasonry photos={c.gallery} />
      <People faculty={c.faculty} team={c.team} />
      <TeamMarquee team={c.team} />
      <CallToAction heading={c.site.ctaHeading} />
    </>
  );
}
