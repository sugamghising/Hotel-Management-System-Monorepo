import { Suspense } from "react";
import POSClient from "./_components/POSClient";

export default function POSPage() {
  return (
    <Suspense fallback={null}>
      <POSClient />
    </Suspense>
  );
}
