"use client";

import { useState } from "react";
import type { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateGuest, type GuestListItem, type Guest, type GuestType } from "@/lib/hooks/useGuests";
import { GuestSearchCombobox } from "./GuestSearchCombobox";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const BOOKING_SOURCES = [
  { value: "DIRECT_WEB", label: "Direct Web" },
  { value: "DIRECT_PHONE", label: "Phone" },
  { value: "DIRECT_WALKIN", label: "Walk-in" },
  { value: "BOOKING_COM", label: "Booking.com" },
  { value: "EXPEDIA", label: "Expedia" },
  { value: "AIRBNB", label: "Airbnb" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "TRAVEL_AGENT", label: "Travel Agent" },
];

const GUEST_TYPES = [
  { value: "TRANSIENT", label: "Transient" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "GROUP", label: "Group" },
  { value: "CONTRACTUAL", label: "Contractual" },
  { value: "COMP", label: "Complimentary" },
  { value: "STAFF", label: "Staff" },
  { value: "FAMILY_FRIENDS", label: "Family & Friends" },
];

const NATIONALITIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "AE", label: "UAE" },
  { value: "SG", label: "Singapore" },
  { value: "HK", label: "Hong Kong" },
  { value: "KR", label: "South Korea" },
];

import type { ReservationFormData } from "./types";

interface Step3GuestProps {
  control: Control<ReservationFormData>;
  watch: UseFormWatch<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
  onNext: () => void;
  onBack: () => void;
  onGuestNameChange?: (name: string) => void;
}

export function Step3Guest({
  control,
  watch,
  setValue,
  onNext,
  onBack,
  onGuestNameChange,
}: Step3GuestProps) {
  const guestId = watch("step3.guestId");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [guestType, setGuestType] = useState("TRANSIENT");
  const [companyName, setCompanyName] = useState("");

  const [selectedGuest, setSelectedGuest] = useState<GuestListItem | null>(null);
  const createGuest = useCreateGuest();

  const handleSelectGuest = (guest: GuestListItem) => {
    setSelectedGuest(guest);
    setValue("step3.guestId", guest.id, { shouldValidate: true });
    setShowCreateForm(false);
    onGuestNameChange?.(`${guest.firstName} ${guest.lastName}`);
  };

  const handleClearGuest = () => {
    setSelectedGuest(null);
    setValue("step3.guestId", "", { shouldValidate: true });
  };

  const handleCreateGuest = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    try {
      const result: Guest = await createGuest.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        nationality: nationality || undefined,
        guestType: (guestType || undefined) as GuestType | undefined,
        companyName: companyName.trim() || undefined,
      });
      setSelectedGuest({
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        phone: result.phone,
        guestType: result.guestType,
        vipStatus: result.vipStatus,
        totalStays: result.history.totalStays,
        lastStayDate: result.history.lastStayDate,
        companyName: result.companyName,
      });
      setValue("step3.guestId", result.id, { shouldValidate: true });
      setShowCreateForm(false);
      onGuestNameChange?.(`${result.firstName} ${result.lastName}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create guest");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Find Existing Guest</h3>
        <GuestSearchCombobox
          value={guestId}
          onSelect={handleSelectGuest}
          onClear={handleClearGuest}
          selectedGuest={selectedGuest}
        />
      </div>

      {!selectedGuest && (
        <div>
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCreateForm ? (
              <span className="flex items-center gap-1">
                <ChevronUp className="h-4 w-4" /> Hide create form
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <ChevronDown className="h-4 w-4" /> Can&apos;t find guest? Create
                new profile
              </span>
            )}
          </button>

          {showCreateForm && (
            <div className="mt-3 rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    First name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Last name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nationality</Label>
                  <Select value={nationality} onValueChange={setNationality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Guest type</Label>
                  <Select value={guestType} onValueChange={setGuestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GUEST_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Company name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateGuest}
                  disabled={!firstName.trim() || !lastName.trim() || createGuest.isPending}
                >
                  {createGuest.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create & Select
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Booking Source</h3>
        <FormField
          control={control}
          name="step3.source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BOOKING_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!guestId}>
          Next
        </Button>
      </div>
    </div>
  );
}
