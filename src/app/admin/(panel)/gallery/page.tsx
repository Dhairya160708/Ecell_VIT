import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { GalleryEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ content, revisions }, sp] = await Promise.all([readContentSnapshot(["gallery"]), searchParams]);
  return <GalleryEditor items={content.gallery} revision={revisions.gallery ?? 0} autoNew={sp.new === "1"} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Gallery"
        description="Photos from E-Cell events and initiatives. Each photo appears in the masonry gallery on the home page, in this order. Upload real photos only."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
