"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChannelsTab } from "./tabs/ChannelsTab";
import { MappingsTab } from "./tabs/MappingsTab";
import { PushTab } from "./tabs/PushTab";
import { BookingsTab } from "./tabs/BookingsTab";
import { SyncLogDrawer } from "./SyncLogDrawer";
import { Upload, History } from "lucide-react";

const TABS = [
  { id: "channels", label: "Channels" },
  { id: "mappings", label: "Mappings" },
  { id: "push", label: "Push" },
  { id: "bookings", label: "Bookings" },
] as const;

export default function ChannelManagerClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();

  const tab = searchParams.get("tab") ?? "channels";
  const [syncLogOpen, setSyncLogOpen] = useState(false);

  const canRead = usePermission("CHANNEL.READ");
  const canPush = usePermission("CHANNEL.PUSH");

  const navigate = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTab === "channels") params.delete("tab");
      else params.set("tab", newTab);
      router.replace(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  if (!canRead) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <PageHeader title="Channel Manager" subtitle="Connect OTAs and manage distribution" />
        <p className="text-sm text-muted-foreground mt-4">
          You don&apos;t have access to Channel Manager.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <PageHeader
        title="Channel Manager"
        subtitle="Connect OTAs and manage distribution"
        actions={
          <div className="flex items-center gap-2">
            {canPush && (
              <Button
                size="sm"
                variant="default"
                onClick={() => navigate("push")}
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Push Availability
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSyncLogOpen(true)}
            >
              <History className="h-4 w-4 mr-1.5" />
              View Sync Log
            </Button>
          </div>
        }
      />

      {!activeHotel ? (
        <p className="text-sm text-muted-foreground mt-4">
          Select a hotel to manage its channel connections.
        </p>
      ) : (
        <Tabs value={tab} onValueChange={navigate} className="mt-2">
          <TabsList>
            {TABS.map((t) => {
              if (t.id === "push" && !canPush) return null;
              return (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="channels">
              <ChannelsTab />
            </TabsContent>
            <TabsContent value="mappings">
              <MappingsTab />
            </TabsContent>
            <TabsContent value="push">
              <PushTab />
            </TabsContent>
            <TabsContent value="bookings">
              <BookingsTab />
            </TabsContent>
          </div>
        </Tabs>
      )}

      <SyncLogDrawer open={syncLogOpen} onOpenChange={setSyncLogOpen} />
    </div>
  );
}
