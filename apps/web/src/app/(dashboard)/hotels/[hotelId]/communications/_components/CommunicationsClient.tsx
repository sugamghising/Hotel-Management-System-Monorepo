"use client";

import { useAuthStore } from "@/stores/auth.store";
import { usePermission } from "@/lib/hooks/usePermission";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, MailPlus } from "lucide-react";
import { StatsBar } from "./StatsBar";
import { LogTab } from "./tabs/LogTab";
import { TemplatesTab } from "./tabs/TemplatesTab";
import { ComposeForm } from "./ComposeForm";
import { BulkSendDialog } from "./BulkSendDialog";
import { useState } from "react";

const TABS = [
  { key: "log", label: "Log", permission: "COMMUNICATION.READ" },
  { key: "templates", label: "Templates", permission: "COMMUNICATION.READ" },
  { key: "compose", label: "Compose", permission: "COMMUNICATION.SEND" },
] as const;

export default function CommunicationsClient() {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const sp = useSearchParams();
  const router = useRouter();

  const canViewLog = usePermission("COMMUNICATION.READ");
  const canSend = usePermission("COMMUNICATION.SEND");
  const canBulkSend = usePermission("COMMUNICATION.BULK_SEND");

  const [bulkOpen, setBulkOpen] = useState(false);

  const currentTab = sp.get("tab") ?? "log";

  const visibleTabs = TABS.filter((t) => {
    if (!canViewLog && t.key !== "compose") return false;
    if (t.key === "compose" && !canSend) return false;
    return true;
  });

  if (!activeHotel) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Select a hotel to manage communications.
      </div>
    );
  }

  if (!canViewLog && !canSend) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <div className="text-center">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Access denied</p>
          <p className="text-sm">
            You do not have permission to view communications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Communications</h1>
          <p className="text-sm text-muted-foreground">
            Guest messages, templates, and delivery tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canBulkSend && (
            <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
              <Send size={14} className="mr-1.5" />
              Bulk Send
            </Button>
          )}
          {canSend && (
            <Button
              size="sm"
              onClick={() => router.replace("?tab=compose", { scroll: false })}
            >
              <MailPlus size={14} className="mr-1.5" />
              Compose
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onValueChange={(v) => router.replace(`?tab=${v}`, { scroll: false })}
      >
        <TabsList>
          {visibleTabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {currentTab === "log" && canViewLog && <LogTab />}
        {currentTab === "templates" && <TemplatesTab />}
        {currentTab === "compose" && canSend && <ComposeForm />}
      </div>

      <BulkSendDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  );
}
