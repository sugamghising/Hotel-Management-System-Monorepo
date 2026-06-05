"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils/formatters";
import { Play, CheckCircle2, Wrench, Clock, Calendar } from "lucide-react";
import { RequestStatusBadge } from "../Shared/RequestStatusBadge";
import { RequestTypeBadge } from "../Shared/RequestTypeBadge";
import { PriorityBadge } from "../Shared/PriorityBadge";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";

interface WorkOrderCardProps {
  request: MaintenanceRequest;
  isPending: boolean;
  onStart: (id: string) => void;
  onComplete: (request: MaintenanceRequest) => void;
  onAddParts: (request: MaintenanceRequest) => void;
}

export function WorkOrderCard({
  request,
  isPending,
  onStart,
  onComplete,
  onAddParts,
}: WorkOrderCardProps) {
  const status = request.status;
  const isEmergency = request.priority === "EMERGENCY";

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        isEmergency && "border-red-400 border-l-[4px] border-l-red-500",
      )}
    >
      {isEmergency && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
      )}
      <CardContent className="p-4 space-y-3">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-2">
          <PriorityBadge priority={request.priority} />
          <RequestStatusBadge status={status} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base leading-snug line-clamp-2">
          {request.title}
        </h3>

        {/* Type + Location */}
        <div className="flex items-center gap-2 flex-wrap">
          <RequestTypeBadge requestType={request.requestType} />
          <span className="text-sm text-muted-foreground">
            {request.room
              ? `Room ${request.room.roomNumber}`
              : request.location ?? "No location"}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {request.scheduledFor ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(request.scheduledFor)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <Calendar className="h-3 w-3" />
              ASAP
            </span>
          )}
          {request.startedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Started {formatDate(request.startedAt)}
            </span>
          )}
          {request.estimatedCost != null && (
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Est. {formatCurrency(request.estimatedCost)}
            </span>
          )}
        </div>

        {/* Parts used */}
        {request.partsUsed.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-2 text-xs space-y-0.5">
            {request.partsUsed.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>{p.partName} \u00D7 {p.quantity}</span>
                <span className="text-muted-foreground">{formatCurrency(p.unitCost * p.quantity)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          {status === "ACKNOWLEDGED" && (
            <>
              <Button
                className="w-full gap-1.5"
                size="default"
                disabled={isPending}
                onClick={() => onStart(request.id)}
              >
                <Play className="h-4 w-4" /> Start Work
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-1.5"
                size="sm"
                disabled={isPending}
                onClick={() => onAddParts(request)}
              >
                <Wrench className="h-4 w-4" /> Add Parts
              </Button>
            </>
          )}
          {status === "IN_PROGRESS" && (
            <>
              <Button
                className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                size="default"
                disabled={isPending}
                onClick={() => onComplete(request)}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark Complete
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-1.5"
                size="sm"
                disabled={isPending}
                onClick={() => onAddParts(request)}
              >
                <Wrench className="h-4 w-4" /> Add Parts
              </Button>
            </>
          )}
          {status === "COMPLETED" && (
            <div className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Completed {"\u2014"} Awaiting verification
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
