import { Suspense } from "react";
import { ReservationDetailClient } from "./_components/ReservationDetailClient";

export default async function ReservationDetailPage(props: {
  params: Promise<{ hotelId: string; reservationId: string }>;
}) {
  const params = await props.params;

  return (
    <Suspense fallback={null}>
      <ReservationDetailClient id={params.reservationId} />
    </Suspense>
  );
}
