import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "@/lib/content";
import { SiteEditor } from "@/components/admin/SiteEditor";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const { site, stats } = await readContent();
  return <SiteEditor site={site} stats={stats} />;
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
