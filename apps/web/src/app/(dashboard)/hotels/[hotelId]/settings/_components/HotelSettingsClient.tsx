"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { useHotelDetail } from "@/lib/hooks/useHotelSettings";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { GeneralTab } from "./tabs/GeneralTab";
import { ContactTab } from "./tabs/ContactTab";
import { OperationsTab } from "./tabs/OperationsTab";
import { AmenitiesTab } from "./tabs/AmenitiesTab";
import { PoliciesTab } from "./tabs/PoliciesTab";
import { DangerZoneTab } from "./tabs/DangerZoneTab";

const TABS = [
  { id: "general", label: "General" },
  { id: "contact", label: "Contact & Address" },
  { id: "operations", label: "Operations" },
  { id: "amenities", label: "Amenities" },
  { id: "policies", label: "Policies" },
  { id: "danger", label: "Danger Zone" },
] as const;

export default function HotelSettingsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeHotel } = useAuthStore();

  const tab = searchParams.get("tab") ?? "general";

  const { data, isLoading, isError } = useHotelDetail(activeHotel?.id);
  const hotel = data?.hotel;

  const canEditHotel = usePermission("HOTEL.UPDATE");
  const canEditSettings = usePermission("HOTEL.SETTINGS_UPDATE");
  const canManageStatus = usePermission("HOTEL.MANAGE_STATUS");
  const canDeleteHotel = usePermission("HOTEL.DELETE");
  const canEdit = canEditHotel || canEditSettings;

  const navigate = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTab === "general") params.delete("tab");
      else params.set("tab", newTab);
      router.replace(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  if (!activeHotel) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <PageHeader title="Hotel Settings" subtitle="Select a hotel to manage its settings" />
        <p className="text-sm text-muted-foreground mt-4">
          Please select a hotel from the sidebar to manage its settings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <PageHeader title="Hotel Settings" subtitle={activeHotel.name} />

      {isLoading ? (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : isError || !hotel ? (
        <p className="text-sm text-muted-foreground mt-6">Failed to load hotel details.</p>
      ) : (
        <Tabs value={tab} onValueChange={navigate} className="mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <TabsList className="flex lg:flex-col gap-1 w-full lg:w-48 h-auto bg-transparent">
              {TABS.map((t) => {
                if (t.id === "danger" && !canManageStatus && !canDeleteHotel) return null;
                return (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="text-left justify-start w-full rounded-md data-[state=active]:bg-muted"
                  >
                    {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="flex-1 min-w-0">
              <TabsContent value="general">
                <GeneralTab hotel={hotel} canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="contact">
                <ContactTab hotel={hotel} canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="operations">
                <OperationsTab hotel={hotel} canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="amenities">
                <AmenitiesTab hotel={hotel} canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="policies">
                <PoliciesTab hotel={hotel} canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="danger">
                <DangerZoneTab
                  hotel={hotel}
                  canManageStatus={canManageStatus}
                  canDeleteHotel={canDeleteHotel}
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      )}
    </div>
  );
}
