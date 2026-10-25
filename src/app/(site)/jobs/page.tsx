import { Suspense } from "react";
import { JobsView } from "@/components/jobs/JobsView";
import { getContent } from "@/server/content";

export default async function Jobs() {
  const { listings, startups } = await getContent();
  const names = Object.fromEntries(startups.map((s) => [s.slug, s.name]));
  // useSearchParams (for the ?apply= deep link) needs a Suspense boundary.
  return (
    <Suspense>
      <JobsView listings={listings} names={names} />
    </Suspense>
  );
}
