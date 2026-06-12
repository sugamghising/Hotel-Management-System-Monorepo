"use client";

import type {
  CommunicationTemplate,
  CommunicationChannel,
  CommunicationType,
} from "@/lib/hooks/useCommunications";
import {
  useCreateTemplate,
  useUpdateTemplate,
} from "@/lib/hooks/useCommunications";
import { useAuthStore } from "@/stores/auth.store";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const CHANNELS: CommunicationChannel[] = ["EMAIL", "SMS", "WHATSAPP", "PUSH"];

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

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
];

const COMMON_VARIABLES = [
  "guestName",
  "guestFirstName",
  "hotelName",
  "checkInDate",
  "checkOutDate",
  "nights",
  "roomNumber",
  "roomType",
  "confirmationNumber",
  "totalAmount",
  "currencyCode",
];

const SAMPLE_VALUES: Record<string, string> = {
  guestName: "Sarah Johnson",
  guestFirstName: "Sarah",
  hotelName: "Grand Horizon Hotel",
  checkInDate: format(addDays(new Date(), 1), "MMM d, yyyy"),
  checkOutDate: format(addDays(new Date(), 3), "MMM d, yyyy"),
  nights: "2",
  roomNumber: "412",
  roomType: "Deluxe King",
  confirmationNumber: "26041234",
  totalAmount: "350.00",
  currencyCode: "USD",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: CommunicationTemplate | null;
  isCreate?: boolean;
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  isCreate,
}: Props) {
  const activeHotel = useAuthStore((s) => s.activeHotel);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CommunicationChannel>("EMAIL");
  const [type, setType] = useState<CommunicationType>("CUSTOM");
  const [language, setLanguage] = useState("en");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setChannel(template.channel);
      setType(template.type);
      setLanguage(template.language);
      setSubject(template.subject ?? "");
      setBody(template.body);
    } else {
      setName("");
      setChannel("EMAIL");
      setType("CUSTOM");
      setLanguage("en");
      setSubject("");
      setBody("");
    }
  }, [template, open]);

  const previewBody = body.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) =>
      `<span class="bg-blue-100 text-blue-700 px-1 rounded text-xs font-mono">${
        SAMPLE_VALUES[key.trim()] ?? `{${key.trim()}}`
      }</span>`,
  );

  const smsCount = channel === "SMS" ? Math.ceil(body.length / 160) : 0;

  const insertVariable = (varName: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = body.slice(0, start) + `{{${varName}}}` + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        start + varName.length + 4;
    }, 0);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Template body is required");
      return;
    }

    if (template && !isCreate) {
      updateTemplate.mutate(
        {
          templateId: template.id,
          input: { name, subject: subject || undefined, body, language },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createTemplate.mutate(
        {
          name,
          channel,
          type,
          subject: subject || undefined,
          body,
          language,
        },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  const formContent = (
    <div className="space-y-4">
      <div>
        <Label>Template name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email" />
      </div>

      {!template && (
        <>
          <div>
            <Label>Channel *</Label>
            <Select value={channel} onValueChange={(v: CommunicationChannel) => setChannel(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div>
        <Label>Type *</Label>
        <Select value={type} onValueChange={(v: CommunicationType) => setType(v)}>
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

      <div>
        <Label>Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(channel === "EMAIL" || channel === "PUSH") && (
        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject line" />
        </div>
      )}

      <div>
        <Label>Body *</Label>
        <Textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="font-mono min-h-[200px]"
          placeholder={`Hi {{guestName}},\n\nWelcome to {{hotelName}}!`}
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">
          Insert variable:
        </Label>
        <div className="flex flex-wrap gap-1">
          {COMMON_VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="inline-flex items-center rounded bg-primary/10 text-primary text-xs font-mono px-1.5 py-0.5 cursor-pointer hover:bg-primary/20 transition"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {channel === "SMS" && (
        <p className={`text-xs ${body.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
          {body.length} / 160 chars — {smsCount} SMS message{smsCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );

  const previewPanel = (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-medium mb-3">Preview</h4>
      <div className="flex-1">
        {channel === "EMAIL" && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 space-y-1 text-xs text-muted-foreground">
              <div>
                <strong>To:</strong> {SAMPLE_VALUES.guestName} &lt;sarah@example.com&gt;
              </div>
              <div>
                <strong>Subject:</strong> {subject || "(no subject)"}
              </div>
            </div>
            <div className="bg-white p-4 text-sm">
              <PreviewBody html={previewBody} />
            </div>
          </div>
        )}

        {channel === "SMS" && (
          <div className="flex justify-center">
            <div className="w-[180px] aspect-[9/16] rounded-[32px] border-4 border-gray-800 bg-gray-900 p-2">
              <div className="h-full bg-gray-100 rounded-[28px] flex flex-col items-start gap-2 p-3">
                <div className="bg-green-500 text-white text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%]">
                  <PreviewBody html={previewBody} />
                </div>
              </div>
            </div>
          </div>
        )}

        {channel === "WHATSAPP" && (
          <div className="flex justify-center">
            <div className="w-[240px] border rounded-lg overflow-hidden">
              <div className="bg-[#075e54] text-white px-3 py-2 text-xs font-semibold">
                WhatsApp
              </div>
              <div className="bg-[#efeae2] p-3 min-h-[200px]">
                <div className="bg-white text-sm rounded-lg rounded-bl-sm p-3 shadow-sm max-w-[85%]">
                  <PreviewBody html={previewBody} />
                </div>
              </div>
            </div>
          </div>
        )}

        {channel === "PUSH" && (
          <div className="border rounded-lg p-4 bg-white">
            <div className="font-semibold text-sm mb-1">{subject || "Push Notification"}</div>
            <div className="text-sm text-muted-foreground">
              <PreviewBody html={previewBody} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template && !isCreate ? "Edit Template" : "Create Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="hidden lg:grid lg:grid-cols-5 gap-6 min-h-[500px]">
          <div className="col-span-2">{formContent}</div>
          <div className="col-span-3 border-l pl-6">{previewPanel}</div>
        </div>

        <div className="lg:hidden">
          <Tabs defaultValue="edit">
            <TabsList className="w-full">
              <TabsTrigger value="edit" className="flex-1">Edit</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">{formContent}</TabsContent>
            <TabsContent value="preview">{previewPanel}</TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? "Saving…"
              : template && !isCreate
                ? "Save Changes"
                : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewBody({ html }: { html: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: html.replace(/\n/g, "<br />"),
      }}
    />
  );
}
