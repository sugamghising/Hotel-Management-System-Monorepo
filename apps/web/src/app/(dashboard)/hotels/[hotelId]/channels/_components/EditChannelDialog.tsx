"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateChannel, type Channel } from "@/lib/hooks/useChannelManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";

const FREQ_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "24 hours" },
];

interface EditChannelDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  channel: Channel;
}

export function EditChannelDialog({ open, onOpenChange, channel }: EditChannelDialogProps) {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";
  const { mutate: update, isPending } = useUpdateChannel();

  const [tab, setTab] = useState("settings");
  const [syncFrequency, setSyncFrequency] = useState(channel.settings.syncFrequencyMinutes);
  const [pushAvailability, setPushAvailability] = useState(channel.settings.pushAvailability);
  const [pushRates, setPushRates] = useState(channel.settings.pushRates);
  const [minAdvance, setMinAdvance] = useState(String(channel.settings.minAdvanceDays));
  const [maxAdvance, setMaxAdvance] = useState(String(channel.settings.maxAdvanceDays));

  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const handleSaveSettings = () => {
    update(
      {
        hotelId,
        channelId: channel.id,
        input: {
          settings: {
            syncFrequencyMinutes: syncFrequency,
            pushAvailability,
            pushRates,
            minAdvanceDays: Number(minAdvance) || 0,
            maxAdvanceDays: Number(maxAdvance) || 0,
          },
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const handleUpdateCredentials = () => {
    update(
      {
        hotelId,
        channelId: channel.id,
        input: { credentials },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{channel.channelName}</DialogTitle>
          <DialogDescription>Edit connection settings and credentials.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b mb-4">
          <button
            onClick={() => setTab("settings")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === "settings" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setTab("credentials")}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === "credentials" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Credentials
          </button>
        </div>

        {tab === "settings" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Sync Frequency</Label>
              <Select value={String(syncFrequency)} onValueChange={(v) => setSyncFrequency(Number(v))}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQ_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium cursor-pointer">Push availability</Label>
              <Switch checked={pushAvailability} onCheckedChange={setPushAvailability} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium cursor-pointer">Push rates</Label>
              <Switch checked={pushRates} onCheckedChange={setPushRates} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Min advance days</Label>
                <Input type="number" min="0" value={minAdvance} onChange={(e) => setMinAdvance(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-medium">Max advance days</Label>
                <Input type="number" min="0" value={maxAdvance} onChange={(e) => setMaxAdvance(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" disabled={isPending} onClick={handleSaveSettings}>
                {isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : "Save Settings"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {tab === "credentials" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-2 rounded bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                Updating credentials will trigger a re-authentication with {channel.channelName}.
              </p>
            </div>
            {Object.keys(channel.credentials).map((key) => (
              <div key={key}>
                <Label className="text-xs font-medium">{key}</Label>
                <Input
                  type={key.toLowerCase().includes("password") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token") || key.toLowerCase().includes("key") ? "password" : "text"}
                  placeholder="••••••••"
                  value={credentials[key] ?? ""}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            ))}
            <DialogFooter>
              <Button size="sm" disabled={isPending || Object.keys(credentials).length === 0} onClick={handleUpdateCredentials}>
                {isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Updating...</> : "Update Credentials"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
