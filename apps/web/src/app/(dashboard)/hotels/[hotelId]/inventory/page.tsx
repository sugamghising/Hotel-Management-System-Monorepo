import { Suspense } from "react";
import InventoryClient from "./_components/InventoryClient";

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryClient />
    </Suspense>
  );
}
