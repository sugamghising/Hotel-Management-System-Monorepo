import { Suspense } from "react";
import NewReservationClient from "./_components/NewReservationClient";

export default function NewReservationPage() {
  return (
    <Suspense fallback={null}>
      <NewReservationClient />
    </Suspense>
  );
}
