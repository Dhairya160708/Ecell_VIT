import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "@/server/content";
import { DivisionsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const { divisions } = await readContent();
  return <DivisionsEditor items={divisions} />;
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
