"use client";

import type {
  CommunicationChannel,
  CommunicationType,
  CommunicationTemplate,
  SendCommunicationInput,
} from "@/lib/hooks/useCommunications";
import {
  useSendCommunication,
  useCommunicationTemplates,
} from "@/lib/hooks/useCommunications";
import { useGuests, type GuestListItem } from "@/lib/hooks/useGuests";
import { useAuthStore } from "@/stores/auth.store";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { ChannelIcon } from "./ChannelIcon";

const TYPES: CommunicationType[] = [
  "RESERVATION_CONFIRMATION",
  "CHECKIN_REMINDER",
  "CHECKOUT_REMINDER",
  "WELCOME",
  "SURVEY",
  "MARKETING",
  "ALERT",
  "CUSTOM",
];

const STEPS = [
  { num: 1, label: "Recipient" },
  { num: 2, label: "Content" },
  { num: 3, label: "Schedule" },
];

export function ComposeForm() {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const organizationId = useAuthStore((s) => s.organizationId);
  const router = useRouter();
  const searchParams = useSearchParams();

  const sendMutation = useSendCommunication();
  const { data: templatesData } = useCommunicationTemplates(organizationId);

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [guestResults, setGuestResults] = useState<GuestListItem[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestListItem | null>(null);
  const [channel, setChannel] = useState<CommunicationChannel>("EMAIL");
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [type, setType] = useState<CommunicationType>("CUSTOM");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: guestListData } = useGuests(
    debouncedSearch.length >= 2 ? { search: debouncedSearch, limit: 10 } : undefined,
  );

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setGuestResults([]);
      return;
    }
    if (guestListData?.guests) {
      setGuestResults(guestListData.guests);
    }
  }, [debouncedSearch, guestListData]);

  useEffect(() => {
    if (selectedGuest) {
      if (selectedGuest.email) setChannel("EMAIL");
      else setChannel("SMS");
    }
  }, [selectedGuest]);

  const filteredTemplates = (templatesData?.templates ?? []).filter(
    (t) => t.channel === channel && t.isActive,
  );

  useEffect(() => {
    if (useTemplate && filteredTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(filteredTemplates[0]);
    }
  }, [useTemplate, filteredTemplates, selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) {
      setType(selectedTemplate.type);
      setSubject(selectedTemplate.subject ?? "");
      setBody(selectedTemplate.body);
    }
  }, [selectedTemplate]);

  const resolvedBody = body.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => {
      const guest = selectedGuest;
      switch (key.trim()) {
        case "guestName": return guest ? `${guest.firstName} ${guest.lastName}` : "{{guestName}}";
        case "guestFirstName": return guest?.firstName ?? "{{guestFirstName}}";
        case "hotelName": return activeHotel?.name ?? "{{hotelName}}";
        default: return `{{${key.trim()}}}`;
      }
    },
  );

  const unresolvedVars = Array.from(body.matchAll(/\{\{(.*?)\}\}/g))
    .map((m) => m[1].trim())
    .filter((v) => !["guestName", "guestFirstName", "hotelName"].includes(v));
  const uniqueUnresolved = [...new Set(unresolvedVars)];
  const [varOverrides, setVarOverrides] = useState<Record<string, string>>({});

  const canProceedStep1 = !!selectedGuest;
  const canProceedStep2 = useTemplate ? !!selectedTemplate : !!body.trim();

  const handleSend = () => {
    if (!selectedGuest) return;
    const input: SendCommunicationInput = {
      guestId: selectedGuest.id,
      channel,
      type,
      subject: subject || undefined,
      content: body,
      templateId: selectedTemplate?.id,
      scheduleAt: scheduleMode === "later" && scheduleDate
        ? new Date(scheduleDate).toISOString()
        : undefined,
      variables:
        Object.keys(varOverrides).length > 0 ? varOverrides : undefined,
    };

    sendMutation.mutate(input, {
      onSuccess: () => {
        setSelectedGuest(null);
        setSearchTerm("");
        setBody("");
        setSubject("");
        setSelectedTemplate(null);
        setStep(1);
        toast.success("Message sent! View it in the Log tab.");
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= s.num
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                step >= s.num ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
        <div className="h-px flex-1 bg-border mx-4 hidden sm:block" />
      </div>

      {/* Step 1 — Recipient */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Find Guest</h3>
          <Input
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {guestResults.length > 0 && !selectedGuest && (
            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
              {guestResults.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between"
                  onClick={() => {
                    setSelectedGuest(g);
                    setSearchTerm("");
                    setGuestResults([]);
                  }}
                >
                  <span>
                    {g.firstName} {g.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{g.email}</span>
                </button>
              ))}
            </div>
          )}

          {selectedGuest && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm">
              <span className="font-medium">
                {selectedGuest.firstName} {selectedGuest.lastName}
              </span>
              <span className="text-xs text-muted-foreground">{selectedGuest.email}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedGuest(null);
                  setSearchTerm("");
                }}
                className="ml-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div>
            <Label>Channel</Label>
            <div className="flex gap-4 mt-1">
              {(["EMAIL", "SMS", "WHATSAPP", "PUSH"] as CommunicationChannel[]).map((c) => {
                const disabled = c === "EMAIL" && !selectedGuest?.email;
                return (
                  <label
                    key={c}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                      channel === c ? "border-primary bg-primary/5" : ""
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={c}
                      checked={channel === c}
                      disabled={disabled}
                      onChange={() => setChannel(c)}
                      className="sr-only"
                    />
                    <ChannelIcon channel={c} />
                    <span>{c}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={!canProceedStep1}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Content */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Message Content</h3>

          {filteredTemplates.length > 0 && (
            <div className="flex items-center gap-3">
              <Label>Use a template</Label>
              <Switch checked={useTemplate} onCheckedChange={setUseTemplate} />
            </div>
          )}

          {useTemplate && filteredTemplates.length > 0 && (
            <div>
              <Label>Template</Label>
              <Select
                value={selectedTemplate?.id ?? ""}
                onValueChange={(id) => {
                  const t = filteredTemplates.find((t) => t.id === id);
                  setSelectedTemplate(t ?? null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!useTemplate && (
            <div>
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v: CommunicationType) => setType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(channel === "EMAIL" || channel === "PUSH") && (
            <div>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
              />
            </div>
          )}

          <div>
            <Label>Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              placeholder="Type your message or select a template…"
            />
            {channel === "SMS" && (
              <p className={`text-xs mt-1 ${body.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                {body.length} / 160 chars
              </p>
            )}
          </div>

          {body.includes("{{") && (
            <div className="flex flex-wrap gap-1 text-xs">
              {Array.from(body.matchAll(/\{\{(.*?)\}\}/g)).map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded bg-blue-100 text-blue-700 px-1 font-mono"
                >
                  {m[1].trim()}
                </span>
              ))}
            </div>
          )}

          {uniqueUnresolved.length > 0 && (
            <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">
                Variable overrides
              </p>
              {uniqueUnresolved.map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <Label className="text-xs w-28 capitalize">{v}</Label>
                  <Input
                    size={1}
                    className="h-8 text-xs"
                    value={varOverrides[v] ?? ""}
                    onChange={(e) =>
                      setVarOverrides((prev) => ({
                        ...prev,
                        [v]: e.target.value,
                      }))
                    }
                    placeholder={`Value for ${v}`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              disabled={!canProceedStep2}
              onClick={() => setStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Schedule */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Schedule</h3>

          <RadioGroup
            value={scheduleMode}
            onValueChange={(v: "now" | "later") => setScheduleMode(v)}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now">Send now</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="later" id="later" />
              <Label htmlFor="later">Schedule for later</Label>
            </div>
          </RadioGroup>

          {scheduleMode === "later" && (
            <Input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={format(new Date(Date.now() + 5 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")}
            />
          )}

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Preview message
          </button>

          {showPreview && (
            <div className="bg-muted rounded p-4 text-sm whitespace-pre-wrap font-mono">
              {resolvedBody}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              {sendMutation.isPending
                ? "Sending…"
                : scheduleMode === "later"
                  ? "Schedule"
                  : "Send Now"}
            </Button>
          </div>

          {sendMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {sendMutation.error?.message ?? "Failed to send message"}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
