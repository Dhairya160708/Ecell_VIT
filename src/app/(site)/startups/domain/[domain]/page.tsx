import { Suspense } from "react";
import { connection } from "next/server";
import { StartupsView } from "@/components/startups/StartupsView";
import { getContent } from "@/server/content";

type Params = Promise<{ domain: string }>;

export default function DomainPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-svh max-w-7xl px-5 pt-36">
          <div className="h-28 w-2/3 animate-pulse bg-surface" />
        </div>
      }
    >
      <DomainContent params={params} />
    </Suspense>
  );
}

async function DomainContent({ params }: { params: Params }) {
  await connection();
  const { domain: raw } = await params;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // A category name containing a literal "%" is already decoded by the router.
  }
  const domain = decoded.trim();
  const { startups } = await getContent();
  return <StartupsView startups={startups} initialCategory={domain} domain={domain} />;
}
