import { Suspense } from "react";
import { connection } from "next/server";
import { listAllFeedback } from "@/server/content";
import { FeedbackView } from "@/components/admin/FeedbackView";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  return <FeedbackView initial={await listAllFeedback()} />;
}

export default function Page() {
  return (
    <>
      <PageTitle
        title="Feedback"
        description="Comments visitors leave on startup pages. They go live straight away. Hide anything inappropriate (you can bring it back), or delete it for good."
      />
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </>
  );
}
