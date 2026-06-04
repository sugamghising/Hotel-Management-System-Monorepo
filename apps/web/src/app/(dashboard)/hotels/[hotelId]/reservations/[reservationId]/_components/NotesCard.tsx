"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/api/modules/reservations";

interface NotesCardProps {
  notes: Reservation["notes"];
}

export function NotesCard({ notes }: NotesCardProps) {
  const [editing, setEditing] = useState<"guest" | "requests" | "internal" | null>(null);

  const sections = [
    {
      key: "guest" as const,
      title: "Guest Notes",
      value: notes.guestNotes,
      isInternal: false,
    },
    {
      key: "requests" as const,
      title: "Special Requests",
      value: notes.specialRequests,
      isInternal: false,
    },
    {
      key: "internal" as const,
      title: "Internal Notes",
      value: notes.internalNotes,
      isInternal: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <div key={section.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                {section.isInternal && <Lock className="h-3.5 w-3.5" />}
                {section.title}
                {section.isInternal && (
                  <span className="text-xs text-muted-foreground font-normal">(staff only)</span>
                )}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(editing === section.key ? null : section.key)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            {editing === section.key ? (
              <div className="space-y-2">
                <Textarea defaultValue={section.value || ""} className="min-h-[80px]" />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.info("Notes update coming soon");
                      setEditing(null);
                    }}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className={cn(section.isInternal && "bg-amber-50/50 rounded p-2")}>
                {section.value ? (
                  <p className="text-sm">{section.value}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">None</p>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
