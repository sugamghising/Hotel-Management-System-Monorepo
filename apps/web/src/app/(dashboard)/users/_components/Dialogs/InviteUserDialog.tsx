"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useInviteUser } from "@/lib/hooks/useUsers";
import { useRoles } from "@/lib/hooks/useRoles";
import { useHotels } from "@/lib/hooks/useHotels";
import type { InviteUserInput } from "@/lib/hooks/useUsers";

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ open, onClose }: InviteUserDialogProps) {
  const { mutate: inviteUser, isPending } = useInviteUser();
  const { data: rolesData } = useRoles();
  const { data: hotelsData } = useHotels();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [initialRoleId, setInitialRoleId] = useState("");
  const [initialHotelId, setInitialHotelId] = useState("org");

  const handleSave = () => {
    if (!email || !firstName || !lastName) return;
    const input: InviteUserInput = {
      email,
      firstName,
      lastName,
      phone: phone || undefined,
      department: department || undefined,
      jobTitle: jobTitle || undefined,
      employmentType: employmentType || undefined,
      employeeId: employeeId || undefined,
      initialRoleId: initialRoleId || undefined,
      initialHotelId: initialHotelId === "org" ? null : initialHotelId || null,
    };
    inviteUser(input, {
      onSuccess: () => {
        setEmail("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setDepartment("");
        setJobTitle("");
        setEmploymentType("");
        setEmployeeId("");
        setInitialRoleId("");
        setInitialHotelId("org");
        onClose();
      },
    });
  };

  const isValid = email && firstName && lastName;
  const roles = rolesData?.roles ?? [];
  const hotels = hotelsData?.hotels ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-xs text-muted-foreground">
            Send an invitation email to join the organization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Employee ID</Label>
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="mt-1 h-8 text-sm"
                placeholder="EMP-001"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">First Name *</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Last Name *</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Phone</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Job Title</Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Employment Type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="SEASONAL">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs font-medium">Initial Role</Label>
            <p className="text-[10px] text-muted-foreground mb-2">
              Optionally assign a role on invite. Can be changed later.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select value={initialRoleId} onValueChange={setInitialRoleId}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="No role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={initialHotelId} onValueChange={setInitialHotelId}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org">Organization-wide</SelectItem>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSave}>
            {isPending ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
