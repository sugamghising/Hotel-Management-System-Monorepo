"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCreateMaintenanceRequest, useUpdateMaintenance } from "@/lib/hooks/useMaintenanceRequests";
import { useRoomGrid } from "@/lib/hooks/useRooms";
import { REQUEST_TYPE_OPTIONS } from "../Shared/RequestTypeBadge";
import { PRIORITY_OPTIONS } from "../Shared/PriorityBadge";
import type { MaintenanceRequest } from "@/lib/hooks/useMaintenanceRequests";

const createSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000),
  category: z.string().min(1, "Type is required"),
  priority: z.string().min(1, "Priority is required"),
  roomId: z.string().optional(),
  location: z.string().max(500).optional(),
  estimatedCost: z.string().optional(),
  scheduledFor: z.string().optional(),
});

type FormValues = z.infer<typeof createSchema>;

interface CreateRequestDialogProps {
  open: boolean;
  onClose: () => void;
  editRequest?: MaintenanceRequest | null;
}

export function CreateRequestDialog({ open, onClose, editRequest }: CreateRequestDialogProps) {
  const createMut = useCreateMaintenanceRequest();
  const updateMut = useUpdateMaintenance();
  const { data: roomGrid, isLoading: roomsLoading } = useRoomGrid();
  const isEditing = !!editRequest;

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "",
      roomId: "",
      location: "",
      estimatedCost: "",
      scheduledFor: "",
    },
  });

  useEffect(() => {
    if (open && editRequest) {
      form.reset({
        title: editRequest.title,
        description: editRequest.description,
        category: editRequest.requestType as any,
        priority: editRequest.priority,
        roomId: editRequest.roomId ?? "",
        location: editRequest.location ?? "",
        estimatedCost: editRequest.estimatedCost?.toString() ?? "",
        scheduledFor: editRequest.scheduledFor?.split("T")[0] ?? "",
      });
    } else if (open) {
      form.reset({
        title: "",
        description: "",
      category: "",
        priority: "",
        roomId: "",
        location: "",
        estimatedCost: "",
        scheduledFor: "",
      });
    }
  }, [open, editRequest, form]);

  const flatRooms = roomGrid
    ? roomGrid.floors.flatMap((floor) =>
        floor.rooms.map((r) => ({
          id: r.id,
          label: `${r.roomNumber} \u2014 ${r.roomTypeCode}`,
        })),
      )
    : [];

  const watchedPriority = form.watch("priority");
  const isEmergency = watchedPriority === "EMERGENCY";

  const onSubmit = (values: FormValues) => {
    const input = {
      title: values.title,
      description: values.description,
      category: values.category as any,
      priority: values.priority as any,
      roomId: values.roomId || undefined,
      location: values.location?.trim() || undefined,
      estimatedCost: values.estimatedCost ? Number(values.estimatedCost) : undefined,
      scheduledFor: values.scheduledFor || undefined,
    };

    if (isEditing && editRequest) {
      updateMut.mutate(
        { id: editRequest.id, input },
        { onSuccess: onClose },
      );
    } else {
      createMut.mutate(input, { onSuccess: onClose });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Request" : "New Maintenance Request"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the maintenance request details." : "Create a new maintenance request to track property issues."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Leaking faucet in room 304" maxLength={200} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the issue in detail..." rows={3} maxLength={2000} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REQUEST_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEmergency && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                This will alert management immediately.
              </div>
            )}

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={roomsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={roomsLoading ? "Loading rooms..." : "Not room-specific"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Not room-specific</SelectItem>
                      {flatRooms.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lobby bathroom, Pool area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated cost</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                        <Input type="number" min={0} step="0.01" placeholder="0.00" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled for</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split("T")[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Request" : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
