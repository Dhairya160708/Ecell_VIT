import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { SiteEditor } from "@/components/admin/SiteEditor";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const { content, revisions } = await readContentSnapshot(["site", "stats"]);
  return (
    <SiteEditor
      site={content.site}
      stats={content.stats}
      siteRevision={revisions.site ?? 0}
      statsRevision={revisions.stats ?? 0}
    />
  );
}

export default function Page() {
  return (
    <>
      <PageTitle
        title="Website text"
        description="The words on the home page, plus your contact details. Edit anything, then press “Save changes” at the bottom."
      />
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </>
  );
}
