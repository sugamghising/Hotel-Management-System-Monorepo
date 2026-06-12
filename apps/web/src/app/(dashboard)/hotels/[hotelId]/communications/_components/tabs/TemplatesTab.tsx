"use client";

import type {
  CommunicationTemplate,
  CommunicationChannel,
} from "@/lib/hooks/useCommunications";
import {
  useCommunicationTemplates,
  useDeleteTemplate,
} from "@/lib/hooks/useCommunications";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAuthStore } from "@/stores/auth.store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { TemplateCard } from "../TemplateCard";
import { TemplateEditorDialog } from "../TemplateEditorDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ChannelIcon } from "../ChannelIcon";

type Filter = "ALL" | CommunicationChannel;

export function TemplatesTab() {
  const organizationId = useAuthStore((s) => s.organizationId);
  const canCreate = usePermission("COMMUNICATION.TEMPLATE.CREATE");
  const canUpdate = usePermission("COMMUNICATION.TEMPLATE.UPDATE");

  const { data, isLoading } = useCommunicationTemplates(organizationId);
  const deleteTemplate = useDeleteTemplate();

  const [filter, setFilter] = useState<Filter>("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CommunicationTemplate | null>(null);

  const templates = data?.templates ?? [];
  const systemTemplates = templates.filter((t) => t.isSystem);
  const userTemplates = templates.filter((t) => !t.isSystem);

  const filteredUser = filter === "ALL" ? userTemplates : userTemplates.filter((t) => t.channel === filter);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsCreate(true);
    setEditorOpen(true);
  };

  const handleEdit = (t: CommunicationTemplate) => {
    setEditingTemplate(t);
    setIsCreate(false);
    setEditorOpen(true);
  };

  const handleDuplicate = (t: CommunicationTemplate) => {
    setEditingTemplate(t);
    setIsCreate(true);
    setEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTemplate.mutate({ templateId: id });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              filter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {(["EMAIL", "SMS", "WHATSAPP"] as CommunicationChannel[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 text-sm rounded-full transition flex items-center gap-1.5 ${
                filter === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ChannelIcon channel={c} size={12} />
              {c}
            </button>
          ))}
        </div>

        {canCreate && (
          <Button size="sm" onClick={handleCreate}>
            <Plus size={14} className="mr-1.5" />
            New Template
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading templates…</div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
            <Info size={14} />
            Templates are shared across all hotels in your organization.
          </div>

          {filteredUser.length === 0 && systemTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">No templates yet</p>
              {canCreate && (
                <p className="text-sm">Create your first template to get started.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUser.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onPreview={setPreviewTemplate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {systemTemplates.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                System Templates
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                  Read only
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    isSystem
                    onEdit={() => {}}
                    onDuplicate={handleDuplicate}
                    onPreview={setPreviewTemplate}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
        isCreate={isCreate}
      />

      {/* Preview Sheet */}
      <Sheet
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      >
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          {previewTemplate && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <ChannelIcon channel={previewTemplate.channel} showLabel />
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {previewTemplate.type.replace(/_/g, " ")}
                  </span>
                </div>
                <SheetTitle>{previewTemplate.name}</SheetTitle>
              </SheetHeader>

              {previewTemplate.subject && (
                <p className="font-semibold text-sm mb-2 italic">
                  {previewTemplate.subject}
                </p>
              )}

              <div className="bg-muted rounded p-4 text-sm font-mono whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {previewTemplate.body}
              </div>

              {previewTemplate.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {previewTemplate.variables.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center rounded bg-primary/10 text-primary text-xs font-mono px-1.5 py-0.5"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}

              <SheetFooter className="mt-6">
                {canUpdate && !previewTemplate.isSystem && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewTemplate(null);
                      handleEdit(previewTemplate);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
