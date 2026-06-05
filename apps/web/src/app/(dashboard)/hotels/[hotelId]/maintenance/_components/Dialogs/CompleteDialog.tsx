"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCompleteMaintenance } from "@/lib/hooks/useMaintenanceRequests";
import { CostSummary } from "../Shared/CostSummary";
import { formatCurrency } from "@/lib/utils/formatters";
import { X } from "lucide-react";
import type { MaintenanceRequest, MaintenancePart } from "@/lib/hooks/useMaintenanceRequests";

interface CompleteDialogProps {
  request: MaintenanceRequest;
  open: boolean;
  onClose: () => void;
  currency?: string;
}

export function CompleteDialog({ request, open, onClose, currency = "USD" }: CompleteDialogProps) {
  const { mutate, isPending } = useCompleteMaintenance();

  const [completionNotes, setCompletionNotes] = useState("");
  const [laborHours, setLaborHours] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [parts, setParts] = useState<MaintenancePart[]>([]);

  const partsTotal = useMemo(
    () => parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0),
    [parts],
  );

  useEffect(() => {
    if (partsTotal > 0 && !actualCost) {
      setActualCost(partsTotal.toString());
    }
  }, [partsTotal, actualCost]);

  useEffect(() => {
    if (open) {
      setCompletionNotes("");
      setLaborHours("");
      setActualCost("");
      setParts([]);
    }
  }, [open]);

  const addPart = () => {
    setParts([...parts, { partName: "", quantity: 1, unitCost: 0 }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof MaintenancePart, value: string | number) => {
    const updated = [...parts];
    (updated[index] as any)[field] = value;
    setParts(updated);
  };

  const handleComplete = () => {
    if (!completionNotes.trim()) return;
    mutate(
      {
        id: request.id,
        input: {
          completionNotes: completionNotes.trim(),
          laborHours: laborHours ? Number(laborHours) : undefined,
          actualCost: actualCost ? Number(actualCost) : undefined,
          partsUsed: parts.filter((p) => p.partName.trim()),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Request</DialogTitle>
          <DialogDescription>
            {request.title} \u2014 {request.requestType.replace(/_/g, " ").toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Completion Notes *</Label>
            <Textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe what was done to resolve the issue..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Labor hours</Label>
              <Input
                type="number"
                placeholder="2.5"
                step={0.5}
                min={0}
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Actual cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Parts section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Parts Used</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPart}>
                Add Part
              </Button>
            </div>
            <div className="space-y-2">
              {parts.map((part, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Part name"
                      value={part.partName}
                      onChange={(e) => updatePart(i, "partName", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="w-16 space-y-1">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={part.quantity || ""}
                      onChange={(e) => updatePart(i, "quantity", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        className="h-8 text-sm pl-5"
                        value={part.unitCost || ""}
                        onChange={(e) => updatePart(i, "unitCost", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 mt-0"
                    onClick={() => removePart(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            {parts.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-right">
                Parts total: {formatCurrency(partsTotal, currency)}
              </p>
            )}
          </div>

          {request.estimatedCost != null && (
            <>
              <Separator />
              <CostSummary
                estimatedCost={request.estimatedCost}
                actualCost={actualCost ? Number(actualCost) : null}
                currency={currency}
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleComplete} disabled={!completionNotes.trim() || isPending}>
            {isPending ? "Completing..." : "Complete Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
