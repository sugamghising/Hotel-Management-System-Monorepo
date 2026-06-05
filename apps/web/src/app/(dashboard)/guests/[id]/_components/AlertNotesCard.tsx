"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGuest } from "@/lib/hooks/useGuests";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertTriangle, Pencil, Check, X } from "lucide-react";
import type { Guest } from "@/lib/hooks/useGuests";

interface AlertNotesCardProps {
  guest: Guest;
}

export function AlertNotesCard({ guest }: AlertNotesCardProps) {
  const { mutate, isPending } = useUpdateGuest();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(guest.alertNotes ?? "");

  const handleSave = () => {
    mutate(
      { id: guest.id, input: { alertNotes: notes || undefined } },
      {
        onSuccess: () => {
          toast.success("Alert notes updated");
          setEditing(false);
        },
        onError: () => toast.error("Failed to update alert notes"),
      },
    );
  };

  const handleCancel = () => {
    setNotes(guest.alertNotes ?? "");
    setEditing(false);
  };

  if (!guest.alertNotes && !editing) {
    return (
      <Card className="border-dashed border-orange-200">
        <CardContent className="p-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors w-full text-left"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Add alert note</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-orange-300 bg-orange-50 dark:bg-orange-950/20",
        !guest.alertNotes && "border-dashed",
      )}
    >
      <CardContent className="p-4">
        {editing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Alert Notes
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Enter alert notes..."
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleSave}
                disabled={isPending}
              >
                <Check className="h-3 w-3" /> Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1"
                onClick={handleCancel}
              >
                <X className="h-3 w-3" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <p className="text-sm text-orange-800 dark:text-orange-300">
                {guest.alertNotes}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
