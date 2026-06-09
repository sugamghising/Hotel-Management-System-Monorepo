import { Suspense } from "react";
import HotelSettingsClient from "./_components/HotelSettingsClient";

export default function HotelSettingsPage() {
  return (
    <Suspense fallback={null}>
      <HotelSettingsClient />
    </Suspense>
  );
}
