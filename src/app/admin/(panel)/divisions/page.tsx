import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { DivisionsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const { content, revisions } = await readContentSnapshot(["divisions"]);
  return <DivisionsEditor items={content.divisions} revision={revisions.divisions ?? 0} />;
}

export default function Page() {
  return (
    <>
      <PageTitle
        title="Divisions"
        description="E-Cell's teams. They scroll across the gold ribbons and fill the expanding panels on the home page."
      />
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </>
  );
}
