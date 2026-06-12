import { Suspense } from "react";
import CommunicationsClient from "./_components/CommunicationsClient";

export default function CommunicationsPage() {
  return (
    <Suspense fallback={null}>
      <CommunicationsClient />
    </Suspense>
  );
}
