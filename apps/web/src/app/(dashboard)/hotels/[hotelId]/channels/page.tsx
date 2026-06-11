import { Suspense } from "react";
import ChannelManagerClient from "./_components/ChannelManagerClient";

export default function ChannelManagerPage() {
  return (
    <Suspense fallback={null}>
      <ChannelManagerClient />
    </Suspense>
  );
}
