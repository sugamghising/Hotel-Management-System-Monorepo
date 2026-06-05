import { Suspense } from "react";
import GuestsClient from "./_components/GuestsClient";

export default function GuestsPage() {
  return (
    <Suspense fallback={null}>
      <GuestsClient />
    </Suspense>
  );
}
