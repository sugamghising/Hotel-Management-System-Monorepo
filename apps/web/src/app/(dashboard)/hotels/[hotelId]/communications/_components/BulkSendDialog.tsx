"use client";

import type {
  CommunicationChannel,
  CommunicationTemplate,
} from "@/lib/hooks/useCommunications";
import {
  useBulkSend,
  useCommunicationTemplates,
} from "@/lib/hooks/useCommunications";
import { useGuests, type GuestListItem } from "@/lib/hooks/useGuests";
import { useAuthStore } from "@/stores/auth.store";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChannelIcon } from "./ChannelIcon";
import { Loader2, AlertTriangle } from "lucide-react";

type Segment =
  | "ALL"
  | "CHECKED_IN"
  | "ARRIVING_TODAY"
  | "DEPARTING_TODAY"
  | "VIP"
  | "WITH_EMAIL"
  | "WITH_MOBILE"
  | "CUSTOM";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { num: 1, label: "Audience" },
  { num: 2, label: "Message" },
  { num: 3, label: "Schedule" },
];

export function BulkSendDialog({ open, onOpenChange }: Props) {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const organizationId = useAuthStore((s) => s.organizationId);
  const sendBulk = useBulkSend();

  const { data: allGuests } = useGuests({ limit: 500 });
  const { data: templatesData } = useCommunicationTemplates(organizationId);

  const [step, setStep] = useState(1);
  const [segment, setSegment] = useState<Segment>("ALL");
  const [customGuestIds, setCustomGuestIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [channel, setChannel] = useState<CommunicationChannel>("EMAIL");
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSegment("ALL");
      setCustomGuestIds([]);
      setSelectAll(false);
      setChannel("EMAIL");
      setSelectedTemplate(null);
      setSubject("");
      setScheduleMode("now");
      setScheduleDate("");
      setConfirmed(false);
    }
  }, [open]);

  const audienceGuests = (() => {
    const guests = allGuests?.guests ?? [];
    switch (segment) {
      case "CUSTOM":
        return guests.filter((g) => customGuestIds.includes(g.id));
      case "VIP":
        return guests.filter((g) => g.vipStatus !== "NONE");
      case "WITH_EMAIL":
        return guests.filter((g) => g.email);
      case "WITH_MOBILE":
        return guests.filter((g) => g.phone);
      default:
        return guests;
    }
  })();

  const audienceIds = segment === "CUSTOM" ? customGuestIds : audienceGuests.map((g) => g.id);

  const hasEmail = audienceGuests.filter((g) => g.email).length;
  const hasMobile = audienceGuests.filter((g) => g.phone).length;

  const filteredTemplates = (templatesData?.templates ?? []).filter(
    (t) => t.channel === channel && t.isActive,
  );

  useEffect(() => {
    if (filteredTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(filteredTemplates[0]);
    }
  }, [filteredTemplates, selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject ?? "");
    }
  }, [selectedTemplate]);

  const handleConfirm = () => {
    if (audienceIds.length === 0 || !selectedTemplate) return;
    sendBulk.mutate(
      {
        guestIds: audienceIds,
        channel,
        type: selectedTemplate.type,
        templateId: selectedTemplate.id,
        subject: subject || undefined,
        scheduleAt: scheduleMode === "later" && scheduleDate
          ? new Date(scheduleDate).toISOString()
          : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const channelDisabled =
    (channel === "SMS" || channel === "WHATSAPP") &&
    hasMobile < audienceGuests.length * 0.5;

  const missingContact =
    channel === "SMS" || channel === "WHATSAPP"
      ? audienceGuests.length - hasMobile
      : audienceGuests.length - hasEmail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Send</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-6">
          {STEPS.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-sm ${step >= s.num ? "font-medium" : "text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1 — Audience */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Select Audience</h3>

            <Select value={segment} onValueChange={(v: Segment) => setSegment(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All guests</SelectItem>
                <SelectItem value="CHECKED_IN">Checked in now</SelectItem>
                <SelectItem value="ARRIVING_TODAY">Arriving today</SelectItem>
                <SelectItem value="DEPARTING_TODAY">Departing today</SelectItem>
                <SelectItem value="VIP">VIP guests</SelectItem>
                <SelectItem value="WITH_EMAIL">Guests with email</SelectItem>
                <SelectItem value="WITH_MOBILE">Guests with mobile</SelectItem>
                <SelectItem value="CUSTOM">Custom (select individually)</SelectItem>
              </SelectContent>
            </Select>

            {segment === "CUSTOM" && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                <div className="sticky top-0 bg-background border-b px-3 py-2">
                  <button
                    type="button"
                    className="text-xs text-primary"
                    onClick={() => {
                      if (selectAll) {
                        setCustomGuestIds([]);
                      } else {
                        setCustomGuestIds(
                          allGuests?.guests.map((g) => g.id) ?? [],
                        );
                      }
                      setSelectAll(!selectAll);
                    }}
                  >
                    {selectAll ? "Deselect all" : "Select all"}
                  </button>
                </div>
                {(allGuests?.guests ?? []).map((g) => (
                  <label
                    key={g.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={customGuestIds.includes(g.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCustomGuestIds((prev) => [...prev, g.id]);
                        } else {
                          setCustomGuestIds((prev) =>
                            prev.filter((id) => id !== g.id),
                          );
                        }
                      }}
                    />
                    <span className="flex-1">
                      {g.firstName} {g.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{g.email}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">{audienceIds.length} guests selected</Badge>
              <span className="text-muted-foreground text-xs">
                {hasEmail} have email · {hasMobile} have mobile
              </span>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={audienceIds.length === 0}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Message */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Compose Message</h3>

            <div>
              <Label>Channel</Label>
              <RadioGroup
                value={channel}
                onValueChange={(v: CommunicationChannel) => setChannel(v)}
                className="flex gap-4 mt-1"
              >
                {(["EMAIL", "SMS", "WHATSAPP"] as CommunicationChannel[]).map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={c}
                      id={`bulk-channel-${c}`}
                      disabled={
                        (c === "SMS" || c === "WHATSAPP") &&
                        hasMobile < audienceGuests.length * 0.5
                      }
                    />
                    <Label htmlFor={`bulk-channel-${c}`} className="flex items-center gap-1 cursor-pointer">
                      <ChannelIcon channel={c} />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {missingContact > 0 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {missingContact} guest{missingContact > 1 ? "s" : ""} will not receive this message
                  (no {channel === "EMAIL" ? "email" : "mobile"} contact info)
                </p>
              )}
            </div>

            <div>
              <Label>Template (required for bulk)</Label>
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

            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                disabled={!selectedTemplate}
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
            <h3 className="font-semibold">Schedule</h3>

            <RadioGroup
              value={scheduleMode}
              onValueChange={(v: "now" | "later") => setScheduleMode(v)}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="now" id="bulk-now" />
                <Label htmlFor="bulk-now">Send now</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="later" id="bulk-later" />
                <Label htmlFor="bulk-later">Schedule for later</Label>
              </div>
            </RadioGroup>

            {scheduleMode === "later" && (
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={format(
                  new Date(Date.now() + 5 * 60 * 1000),
                  "yyyy-MM-dd'T'HH:mm",
                )}
              />
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                You are about to send <strong>{audienceIds.length}</strong> messages.
                This action cannot be undone. Please review before continuing.
              </span>
            </div>

            {!confirmed ? (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setConfirmed(true)}>Review Summary</Button>
              </div>
            ) : (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold">Summary</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Channel:</strong> {channel}</p>
                  <p><strong>Audience:</strong> {audienceIds.length} guests</p>
                  <p><strong>Template:</strong> {selectedTemplate?.name}</p>
                  <p>
                    <strong>Scheduled:</strong>{" "}
                    {scheduleMode === "now" ? "Immediately" : format(new Date(scheduleDate), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setConfirmed(false)}>
                    Go back
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleConfirm}
                    disabled={sendBulk.isPending}
                  >
                    {sendBulk.isPending && (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    )}
                    {sendBulk.isPending ? "Sending…" : "Confirm & Send"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!confirmed && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
