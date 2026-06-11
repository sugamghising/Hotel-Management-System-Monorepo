"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, organizationId } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && organizationId) {
      router.replace("/hotels");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, organizationId, router]);

  return null;
}
