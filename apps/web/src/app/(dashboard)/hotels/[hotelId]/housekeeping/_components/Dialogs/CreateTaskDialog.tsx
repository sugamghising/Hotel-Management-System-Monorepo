"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateHousekeepingTask } from "@/lib/hooks/useMaintenance";
import { useRoomGrid } from "@/lib/hooks/useRooms";
import { TASK_TYPE_OPTIONS } from "../Shared/TaskTypeBadge";
import { PRIORITY_MAP } from "@/lib/constants/statuses";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTaskDialog({ open, onClose }: CreateTaskDialogProps) {
  const { mutate, isPending } = useCreateHousekeepingTask();
  const { data: roomGrid, isLoading: roomsLoading } = useRoomGrid();

  const [roomId, setRoomId] = useState("");
  const [taskType, setTaskType] = useState("CLEANING_DEPARTURE");
  const [priority, setPriority] = useState("0");
  const [assignedTo, setAssignedTo] = useState("");
  const [scheduledFor, setScheduledFor] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [guestRequests, setGuestRequests] = useState("");

  useEffect(() => {
    if (open) {
      setRoomId("");
      setTaskType("CLEANING_DEPARTURE");
      setPriority("0");
      setAssignedTo("");
      setScheduledFor(new Date().toISOString().split("T")[0]);
      setEstimatedMinutes("");
      setNotes("");
      setGuestRequests("");
    }
  }, [open]);

  const flatRooms = roomGrid
    ? roomGrid.floors.flatMap((floor) =>
        floor.rooms.map((r) => ({
          id: r.id,
          label: r.roomNumber,
        })),
      )
    : [];

  const handleCreate = () => {
    if (!roomId || !taskType || !scheduledFor) return;
    mutate(
      {
        roomId,
        taskType: taskType as any,
        priority: priority !== "" ? Number(priority) : undefined,
        assignedTo: assignedTo.trim() || undefined,
        scheduledFor,
        estimatedMinutes: Number(estimatedMinutes) || undefined,
        notes: notes.trim() || undefined,
        guestRequests: guestRequests.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Create a new housekeeping task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Room *</Label>
            <Select value={roomId} onValueChange={setRoomId} disabled={roomsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={roomsLoading ? "Loading rooms..." : "Select room..."} />
              </SelectTrigger>
              <SelectContent>
                {flatRooms.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Task Type *</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_MAP).map(([value, config]) => (
                    <SelectItem key={value} value={String(Object.keys(PRIORITY_MAP).indexOf(value))}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Scheduled Date *</Label>
              <Input
                type="date"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Est. Minutes</Label>
              <Input
                type="number"
                placeholder="e.g. 30"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign To (User ID)</Label>
            <Input
              placeholder="Optional user ID..."
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Guest Requests</Label>
            <Textarea
              value={guestRequests}
              onChange={(e) => setGuestRequests(e.target.value)}
              placeholder="Optional guest requests..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!roomId || !taskType || !scheduledFor || isPending}
          >
            {isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
