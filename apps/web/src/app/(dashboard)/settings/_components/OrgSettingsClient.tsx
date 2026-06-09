"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { useOrganization } from "@/lib/hooks/useOrgSettings";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgDetailsTab } from "./tabs/OrgDetailsTab";
import { SubscriptionTab } from "./tabs/SubscriptionTab";
import { BrandingTab } from "./tabs/BrandingTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { OrgDangerZoneTab } from "./tabs/OrgDangerZoneTab";

const TABS = [
  { id: "details", label: "Details" },
  { id: "subscription", label: "Subscription" },
  { id: "branding", label: "Branding" },
  { id: "security", label: "Security" },
  { id: "danger", label: "Danger Zone" },
] as const;

export default function OrgSettingsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const organizationId = useAuthStore((s) => s.organizationId);

  const tab = searchParams.get("tab") ?? "details";

  const { data: org, isLoading, isError } = useOrganization(organizationId);

  const canViewSubscription = usePermission("ORGANIZATION.VIEW_SUBSCRIPTION");
  const canUpdate = usePermission("ORGANIZATION.UPDATE");
  const canDelete = usePermission("ORGANIZATION.DELETE");

  const navigate = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTab === "details") params.delete("tab");
      else params.set("tab", newTab);
      router.replace(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  if (!organizationId) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <PageHeader
          title="Organization Settings"
          subtitle="Manage your organization's configuration"
        />
        <p className="text-sm text-muted-foreground mt-4">
          Organization context not available.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <PageHeader
        title="Organization Settings"
        subtitle={org?.name ?? "Manage your organization"}
      />

      {isLoading ? (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : isError || !org ? (
        <p className="text-sm text-muted-foreground mt-6">
          Failed to load organization details.
        </p>
      ) : (
        <Tabs value={tab} onValueChange={navigate} className="mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <TabsList className="flex lg:flex-col gap-1 w-full lg:w-48 h-auto bg-transparent">
              {TABS.map((t) => {
                if (t.id === "danger" && !canDelete) return null;
                if (t.id === "subscription" && !canViewSubscription) return null;
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
              <TabsContent value="details">
                <OrgDetailsTab org={org} canEdit={canUpdate} />
              </TabsContent>
              <TabsContent value="subscription">
                <SubscriptionTab orgId={organizationId} />
              </TabsContent>
              <TabsContent value="branding">
                <BrandingTab org={org} canEdit={canUpdate} />
              </TabsContent>
              <TabsContent value="security">
                <SecurityTab org={org} canEdit={canUpdate} />
              </TabsContent>
              <TabsContent value="danger">
                <OrgDangerZoneTab orgId={organizationId} orgName={org.name} canDelete={canDelete} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      )}
    </div>
  );
}
