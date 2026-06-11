"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useConnectChannel, type ChannelCode, type ConnectChannelInput } from "@/lib/hooks/useChannelManager";
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
import { Loader2, Plus, X } from "lucide-react";

interface ConnectChannelDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  channelCode: ChannelCode;
  channelName: string;
}

const FREQ_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "24 hours" },
];

interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "select";
  required: boolean;
  options?: { value: string; label: string }[];
}

function getCredentialFields(code: ChannelCode): CredentialField[] {
  switch (code) {
    case "BOOKING_COM":
      return [
        { key: "apiKey", label: "API Key", type: "password", required: true },
        { key: "hotelId", label: "Hotel ID", type: "text", required: true },
        { key: "extranetUsername", label: "Extranet Username", type: "text", required: false },
        { key: "extranetPassword", label: "Extranet Password", type: "password", required: false },
      ];
    case "EXPEDIA":
      return [
        { key: "apiKey", label: "API Key", type: "password", required: true },
        { key: "hotelId", label: "Hotel ID", type: "text", required: true },
        { key: "username", label: "Username", type: "text", required: false },
        { key: "password", label: "Password", type: "password", required: false },
      ];
    case "AIRBNB":
      return [
        { key: "hostId", label: "Host ID", type: "text", required: true },
        { key: "apiToken", label: "API Token", type: "password", required: true },
      ];
    case "AGODA":
    case "HOTELS_COM":
    case "TRIPADVISOR":
      return [
        { key: "propertyId", label: "Property ID", type: "text", required: true },
        { key: "apiKey", label: "API Key", type: "password", required: true },
      ];
    case "GDS":
      return [
        { key: "chainCode", label: "Chain Code", type: "text", required: true },
        { key: "propertyCode", label: "Property Code", type: "text", required: true },
        {
          key: "gdsSystem",
          label: "GDS System",
          type: "select",
          required: true,
          options: [
            { value: "AMADEUS", label: "Amadeus" },
            { value: "SABRE", label: "Sabre" },
            { value: "GALILEO", label: "Galileo" },
            { value: "WORLDSPAN", label: "WorldSpan" },
          ],
        },
      ];
    case "OTHER":
      return [
        { key: "channelName", label: "Channel Name", type: "text", required: true },
        { key: "apiEndpoint", label: "API Endpoint", type: "url", required: true },
        { key: "apiKey", label: "API Key", type: "password", required: true },
      ];
    default:
      return [];
  }
}

export function ConnectChannelDialog({
  open,
  onOpenChange,
  channelCode,
  channelName,
}: ConnectChannelDialogProps) {
  const { activeHotel } = useAuthStore();
  const hotelId = activeHotel?.id ?? "";
  const { mutate: connect, isPending, error: connectError } = useConnectChannel();

  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [syncFrequency, setSyncFrequency] = useState(60);
  const [pushAvailability, setPushAvailability] = useState(true);
  const [pushRates, setPushRates] = useState(true);
  const [minAdvance, setMinAdvance] = useState("0");
  const [maxAdvance, setMaxAdvance] = useState("365");

  const fields = getCredentialFields(channelCode);

  const handleCredChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const validCredentials = () => {
    if (channelCode === "OTHER") {
      const builtInValid = fields
        .filter((f) => f.required)
        .every((f) => credentials[f.key]?.trim());
      const customValid = customFields.every((cf) => cf.key.trim() && cf.value.trim());
      return builtInValid && customValid;
    }
    return fields
      .filter((f) => f.required)
      .every((f) => credentials[f.key]?.trim());
  };

  const handleConnect = () => {
    const allCredentials = { ...credentials };
    if (channelCode === "OTHER") {
      customFields.forEach((cf) => {
        if (cf.key.trim()) allCredentials[cf.key.trim()] = cf.value;
      });
    }
    const input: ConnectChannelInput = {
      channelCode,
      credentials: allCredentials,
      settings: {
        syncFrequencyMinutes: syncFrequency,
        pushAvailability,
        pushRates,
        minAdvanceDays: Number(minAdvance),
        maxAdvanceDays: Number(maxAdvance),
      },
    };
    connect(
      { hotelId, input },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const addCustomField = () => setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  const removeCustomField = (idx: number) =>
    setCustomFields((prev) => prev.filter((_, i) => i !== idx));
  const updateCustomField = (idx: number, field: "key" | "value", val: string) =>
    setCustomFields((prev) =>
      prev.map((cf, i) => (i === idx ? { ...cf, [field]: val } : cf)),
    );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setStep(1); setCredentials({}); setCustomFields([]); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === 1 ? `Connect ${channelName}` : "Sync Settings"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? `Enter your ${channelName} credentials to connect.`
              : "Configure how data syncs with this channel."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required && " *"}
                </Label>
                {field.type === "select" && field.options ? (
                  <Select
                    value={credentials[field.key] ?? ""}
                    onValueChange={(v) => handleCredChange(field.key, v)}
                  >
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type}
                    value={credentials[field.key] ?? ""}
                    onChange={(e) => handleCredChange(field.key, e.target.value)}
                    className="mt-1 h-8 text-sm"
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}

            {channelCode === "OTHER" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Custom Fields</Label>
                {customFields.map((cf, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Field name"
                      value={cf.key}
                      onChange={(e) => updateCustomField(idx, "key", e.target.value)}
                      className="h-8 text-sm flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={cf.value}
                      onChange={(e) => updateCustomField(idx, "value", e.target.value)}
                      className="h-8 text-sm flex-1"
                    />
                    <button
                      onClick={() => removeCustomField(idx)}
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addCustomField}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add custom field
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Sync Frequency</Label>
              <Select
                value={String(syncFrequency)}
                onValueChange={(v) => setSyncFrequency(Number(v))}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQ_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
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
                <Input
                  type="number"
                  min="0"
                  value={minAdvance}
                  onChange={(e) => setMinAdvance(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Max advance days</Label>
                <Input
                  type="number"
                  min="0"
                  value={maxAdvance}
                  onChange={(e) => setMaxAdvance(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {connectError && (
          <p className="text-xs text-destructive mt-2">
            {(connectError as any)?.message ?? "Failed to connect. Please check your credentials."}
          </p>
        )}

        <DialogFooter>
          {step === 1 && (
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button disabled={!validCredentials()} onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={isPending} onClick={handleConnect}>
                {isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Connecting...</>
                ) : (
                  "Connect Channel"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
