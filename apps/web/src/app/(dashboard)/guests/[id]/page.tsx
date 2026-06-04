import { Suspense } from "react";
import { GuestDetailClient } from "./_components/GuestDetailClient";

export default async function GuestDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  return (
    <Suspense fallback={null}>
      <GuestDetailClient id={params.id} />
    </Suspense>
  );
}
