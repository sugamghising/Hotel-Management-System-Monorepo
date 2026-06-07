"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/lib/utils/formatters";

interface RoomTypeOption {
  id: string;
  code: string;
  name: string;
}

interface CloneRatePlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: {
    newCode: string;
    newName: string;
    roomTypeId?: string;
    adjustRateByPercent?: number;
  }) => void;
  sourcePlan: {
    id: string;
    code: string;
    name: string;
    baseRate: number;
    currencyCode: string;
    roomTypeId: string;
    roomType: { id: string; code: string; name: string };
  } | null;
  roomTypes: RoomTypeOption[];
}

export function CloneRatePlanDialog({
  open,
  onClose,
  onSave,
  sourcePlan,
  roomTypes,
}: CloneRatePlanDialogProps) {
  const { activeHotel } = useAuthStore();
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [targetRoomType, setTargetRoomType] = useState("");
  const [adjustPct, setAdjustPct] = useState(0);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""));
  };

  const adjustedRate = useMemo(() => {
    if (!sourcePlan) return 0;
    return Math.round(sourcePlan.baseRate * (1 + adjustPct / 100) * 100) / 100;
  }, [sourcePlan, adjustPct]);

  const currency = sourcePlan?.currencyCode ?? activeHotel?.currencyCode ?? "USD";

  const handleSave = () => {
    if (!sourcePlan || !newCode || !newName) return;
    onSave({
      newCode,
      newName,
      roomTypeId: targetRoomType || undefined,
      adjustRateByPercent: adjustPct !== 0 ? adjustPct : undefined,
    });
  };

  const isValid = newCode && newName && sourcePlan;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone Rate Plan</DialogTitle>
          {sourcePlan && (
            <DialogDescription>
              Creates a copy of {sourcePlan.name} ({sourcePlan.code})
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">New Code *</Label>
            <Input
              value={newCode}
              onChange={handleCodeChange}
              className="mt-1 h-8 font-mono text-sm uppercase"
              placeholder={sourcePlan ? `${sourcePlan.code}_COPY` : ""}
            />
          </div>

          <div>
            <Label className="text-xs font-medium">New Name *</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder={sourcePlan ? `Copy of ${sourcePlan.name}` : ""}
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Target Room Type</Label>
            <Select value={targetRoomType} onValueChange={setTargetRoomType}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder="Same as source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Same as source ({sourcePlan?.roomType.code})</SelectItem>
                {roomTypes
                  .filter((rt) => rt.id !== sourcePlan?.roomTypeId)
                  .map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name} ({rt.code})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium">
              Rate Adjustment ({adjustPct >= 0 ? "+" : ""}
              {adjustPct}%)
            </Label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="-50"
                max="100"
                value={adjustPct}
                onChange={(e) => setAdjustPct(Number(e.target.value))}
                className="flex-1 h-1.5"
              />
              <Input
                type="number"
                min="-50"
                max="100"
                value={adjustPct}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAdjustPct(Math.max(-50, Math.min(100, v)));
                }}
                className="w-16 h-8 text-sm text-center"
              />
            </div>
            {sourcePlan && (
              <p className="text-xs text-muted-foreground mt-1.5">
                New base rate:{" "}
                <span className="font-semibold tabular-nums">
                  {formatCurrency(adjustedRate, currency)}
                </span>
                <span className="text-[10px] ml-1 text-muted-foreground">
                  (source: {formatCurrency(sourcePlan.baseRate, currency)})
                </span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid} onClick={handleSave}>
            Clone Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
