"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, organizationId, _hydrated } = useAuthStore();

  useEffect(() => {
    if (!_hydrated) return;
    if (isAuthenticated || organizationId) {
      router.replace("/hotels");
    } else {
      router.replace("/login");
    }
  }, [_hydrated, isAuthenticated, organizationId, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
