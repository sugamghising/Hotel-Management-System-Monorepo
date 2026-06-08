import { Suspense } from "react";
import UsersClient from "./_components/UsersClient";

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersClient />
    </Suspense>
  );
}
