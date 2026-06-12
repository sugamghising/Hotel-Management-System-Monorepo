"use client";

import type {
  CommunicationTemplate,
  CommunicationChannel,
} from "@/lib/hooks/useCommunications";
import { useUpdateTemplate } from "@/lib/hooks/useCommunications";
import { usePermission } from "@/lib/hooks/usePermission";
import { formatDate } from "@/lib/utils/formatters";
import { ChannelIcon } from "./ChannelIcon";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Copy, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

const languageFlags: Record<string, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
  ar: "🇸🇦",
  de: "🇩🇪",
  it: "🇮🇹",
  pt: "🇵🇹",
  ja: "🇯🇵",
  "zh-CN": "🇨🇳",
};

interface Props {
  template: CommunicationTemplate;
  isSystem?: boolean;
  onEdit: (t: CommunicationTemplate) => void;
  onDuplicate: (t: CommunicationTemplate) => void;
  onPreview: (t: CommunicationTemplate) => void;
  onDelete: (id: string) => void;
}

export function TemplateCard({
  template,
  isSystem,
  onEdit,
  onDuplicate,
  onPreview,
  onDelete,
}: Props) {
  const canUpdate = usePermission("COMMUNICATION.TEMPLATE.UPDATE");
  const canDelete = usePermission("COMMUNICATION.TEMPLATE.DELETE");
  const updateTemplate = useUpdateTemplate();
  const [showDelete, setShowDelete] = useState(false);

  const bodyPreview = template.body.replace(/\{\{.*?\}\}/g, "").trim().slice(0, 100);

  return (
    <div
      className={`border rounded-lg p-4 transition hover:shadow-md ${
        isSystem ? "bg-muted/30 border-dashed" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold truncate">{template.name}</span>
          <ChannelIcon channel={template.channel as CommunicationChannel} />
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {template.type.replace(/_/g, " ")}
          </span>
          {isSystem && (
            <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
              System
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview(template)}>
              <Eye size={14} className="mr-2" /> Preview
            </DropdownMenuItem>
            {(!isSystem || !template.isSystem) && canUpdate && (
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Edit size={14} className="mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {canUpdate && (
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                <Copy size={14} className="mr-2" /> Duplicate
              </DropdownMenuItem>
            )}
            {(!isSystem || !template.isSystem) && canDelete && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {template.subject && (
        <p className="text-sm italic text-muted-foreground truncate mb-1">
          {template.subject}
        </p>
      )}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {bodyPreview || "(no body)"}
      </p>

      {template.variables.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.variables.map((v) => (
            <span
              key={v}
              className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{languageFlags[template.language] ?? "🌐"} {template.language.toUpperCase()}</span>
          <span>·</span>
          <span>{formatDate(template.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          {isSystem || template.isSystem ? (
            <Tooltip content="System templates are managed automatically">
              <div className="text-xs text-muted-foreground cursor-help">
                System
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Active</span>
              <Switch
                checked={template.isActive}
                disabled={template.isSystem || !canUpdate}
                onCheckedChange={(checked) =>
                  updateTemplate.mutate({
                    templateId: template.id,
                    input: { isActive: checked },
                  })
                }
              />
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{template.name}&rdquo;? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDelete(template.id);
                setShowDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
