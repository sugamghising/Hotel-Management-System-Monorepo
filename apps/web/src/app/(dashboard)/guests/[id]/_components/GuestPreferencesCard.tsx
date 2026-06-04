"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUpdateGuestPreferences } from "@/lib/hooks/useGuests";
import { toast } from "sonner";
import { Pencil, Check, X, Utensils, Accessibility } from "lucide-react";
import type { Guest } from "@/lib/hooks/useGuests";

interface GuestPreferencesCardProps {
  guest: Guest;
}

type EditSection = "room" | "dietary" | "specialNeeds" | null;

export function GuestPreferencesCard({ guest }: GuestPreferencesCardProps) {
  const { mutate, isPending } = useUpdateGuestPreferences();
  const [editing, setEditing] = useState<EditSection>(null);
  const [roomPrefs, setRoomPrefs] = useState(
    guest.roomPreferences
      ? (typeof guest.roomPreferences === "string"
          ? guest.roomPreferences
          : JSON.stringify(guest.roomPreferences, null, 2))
      : "",
  );
  const [dietary, setDietary] = useState(guest.dietaryRequirements ?? "");
  const [specialNeeds, setSpecialNeeds] = useState(guest.specialNeeds ?? "");

  const handleSave = (section: EditSection) => {
    const preferences: Record<string, unknown> = {};
    if (section === "room") {
      try {
        preferences.roomPreferences = roomPrefs
          ? (JSON.parse(roomPrefs) as Record<string, unknown>)
          : null;
      } catch {
        toast.error("Invalid JSON format");
        return;
      }
    }
    if (section === "dietary") {
      preferences.dietaryRequirements = dietary || null;
    }
    if (section === "specialNeeds") {
      preferences.specialNeeds = specialNeeds || null;
    }
    mutate(
      { id: guest.id, preferences },
      {
        onSuccess: () => {
          toast.success("Preferences updated");
          setEditing(null);
        },
        onError: () => toast.error("Failed to update preferences"),
      },
    );
  };

  const handleCancel = () => {
    setRoomPrefs(
      guest.roomPreferences
        ? (typeof guest.roomPreferences === "string"
            ? guest.roomPreferences
            : JSON.stringify(guest.roomPreferences, null, 2))
        : "",
    );
    setDietary(guest.dietaryRequirements ?? "");
    setSpecialNeeds(guest.specialNeeds ?? "");
    setEditing(null);
  };

  const roomPrefsObj = guest.roomPreferences;
  const roomPrefsEntries =
    roomPrefsObj && typeof roomPrefsObj === "object"
      ? Object.entries(roomPrefsObj)
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Preferences &amp; Special Needs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Room Preferences */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Room preferences
            </h5>
            {editing !== "room" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditing("room")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {editing === "room" ? (
            <div className="space-y-2">
              <Textarea
                value={roomPrefs}
                onChange={(e) => setRoomPrefs(e.target.value)}
                rows={4}
                placeholder='e.g. {"floor": "high", "view": "ocean", "bedType": "king"}'
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleSave("room")}
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
          ) : roomPrefsEntries.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {roomPrefsEntries.map(([key, val]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="text-[11px] px-2 py-0.5 h-auto font-normal"
                >
                  {key}: {String(val)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Not specified
            </p>
          )}
        </div>

        <hr className="border-t" />

        {/* Dietary requirements */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              Dietary requirements
            </h5>
            {editing !== "dietary" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditing("dietary")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {editing === "dietary" ? (
            <div className="space-y-2">
              <Textarea
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                rows={3}
                placeholder="e.g. vegetarian, gluten-free, halal"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleSave("dietary")}
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
            <p className="text-sm">
              {guest.dietaryRequirements ?? (
                <span className="text-muted-foreground italic">None specified</span>
              )}
            </p>
          )}
        </div>

        <hr className="border-t" />

        {/* Special needs */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Accessibility className="h-3 w-3" />
              Special needs / accessibility
            </h5>
            {editing !== "specialNeeds" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditing("specialNeeds")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {editing === "specialNeeds" ? (
            <div className="space-y-2">
              <Textarea
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                rows={3}
                placeholder="e.g. wheelchair accessible, hearing impaired"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleSave("specialNeeds")}
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
            <p className="text-sm">
              {guest.specialNeeds ?? (
                <span className="text-muted-foreground italic">None specified</span>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
