import { Suspense } from "react";
import OrgSettingsClient from "./_components/OrgSettingsClient";

export default function OrgSettingsPage() {
  return (
    <Suspense fallback={null}>
      <OrgSettingsClient />
    </Suspense>
  );
}
