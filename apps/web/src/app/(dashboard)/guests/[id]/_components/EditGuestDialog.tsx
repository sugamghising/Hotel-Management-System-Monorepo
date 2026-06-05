"use client";

import { useEffect } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateGuest, type Guest, type UpdateGuestInput } from "@/lib/hooks/useGuests";
import {
  guestTypeOptions,
  vipOptions,
  languageOptions,
  countryOptions,
} from "@/lib/constants/guests";

const editGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  mobile: z.string().max(50).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  languageCode: z.string(),
  guestType: z.string(),
  vipStatus: z.string(),
  companyName: z.string().max(255).optional().or(z.literal("")),
  companyTaxId: z.string().max(100).optional().or(z.literal("")),
  addressLine1: z.string().max(255).optional().or(z.literal("")),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  stateProvince: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  countryCode: z.string().optional().or(z.literal("")),
  internalNotes: z.string().max(5000).optional().or(z.literal("")),
  alertNotes: z.string().max(500).optional().or(z.literal("")),
  roomPreferences: z.string().optional().or(z.literal("")),
  dietaryRequirements: z.string().max(500).optional().or(z.literal("")),
  specialNeeds: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof editGuestSchema>;

interface EditGuestDialogProps {
  guest: Guest | null;
  open: boolean;
  onClose: () => void;
}

export function EditGuestDialog({ guest, open, onClose }: EditGuestDialogProps) {
  const { mutate, isPending } = useUpdateGuest();

  const form = useForm<FormValues>({
    resolver: zodResolver(editGuestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      mobile: "",
      dateOfBirth: "",
      nationality: "",
      languageCode: "en",
      guestType: "TRANSIENT",
      vipStatus: "NONE",
      companyName: "",
      companyTaxId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      countryCode: "",
      internalNotes: "",
      alertNotes: "",
      roomPreferences: "",
      dietaryRequirements: "",
      specialNeeds: "",
    },
  });

  useEffect(() => {
    if (guest && open) {
      form.reset({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email ?? "",
        phone: guest.phone ?? "",
        mobile: guest.mobile ?? "",
        dateOfBirth: guest.dateOfBirth
          ? guest.dateOfBirth.slice(0, 10)
          : "",
        nationality: guest.nationality ?? "",
        languageCode: guest.languageCode,
        guestType: guest.guestType,
        vipStatus: guest.vipStatus,
        companyName: guest.companyName ?? "",
        companyTaxId: guest.companyTaxId ?? "",
        addressLine1: guest.address.line1 ?? "",
        addressLine2: guest.address.line2 ?? "",
        city: guest.address.city ?? "",
        stateProvince: guest.address.stateProvince ?? "",
        postalCode: guest.address.postalCode ?? "",
        countryCode: guest.address.countryCode ?? "",
        internalNotes: guest.internalNotes ?? "",
        alertNotes: guest.alertNotes ?? "",
        roomPreferences: guest.roomPreferences
          ? JSON.stringify(guest.roomPreferences)
          : "",
        dietaryRequirements: guest.dietaryRequirements ?? "",
        specialNeeds: guest.specialNeeds ?? "",
      });
    }
  }, [guest, open, form]);

  if (!guest) return null;

  const onSubmit = (values: FormValues) => {
    const input: UpdateGuestInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      languageCode: values.languageCode,
      guestType: values.guestType as UpdateGuestInput["guestType"],
      vipStatus: values.vipStatus as UpdateGuestInput["vipStatus"],
    };
    if (values.email) input.email = values.email;
    if (values.phone) input.phone = values.phone;
    if (values.mobile) input.mobile = values.mobile;
    if (values.dateOfBirth) input.dateOfBirth = values.dateOfBirth;
    if (values.nationality) input.nationality = values.nationality;
    if (values.companyName) input.companyName = values.companyName;
    if (values.companyTaxId) input.companyTaxId = values.companyTaxId;
    if (values.addressLine1) input.addressLine1 = values.addressLine1;
    if (values.addressLine2) input.addressLine2 = values.addressLine2;
    if (values.city) input.city = values.city;
    if (values.stateProvince) input.stateProvince = values.stateProvince;
    if (values.postalCode) input.postalCode = values.postalCode;
    if (values.countryCode) input.countryCode = values.countryCode;
    if (values.internalNotes) input.internalNotes = values.internalNotes;
    if (values.alertNotes) input.alertNotes = values.alertNotes;
    if (values.dietaryRequirements) input.dietaryRequirements = values.dietaryRequirements;
    if (values.specialNeeds) input.specialNeeds = values.specialNeeds;
    if (values.roomPreferences) {
      try {
        input.roomPreferences = JSON.parse(values.roomPreferences) as Record<string, unknown>;
      } catch { /* ignore */ }
    }
    mutate({ id: guest.id, input }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Guest — {guest.firstName} {guest.lastName}</DialogTitle>
          <DialogDescription>
            Update guest profile information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="mobile" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryOptions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="languageCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languageOptions.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Classification
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="guestType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guestTypeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vipStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIP status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vipOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="companyTaxId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company tax ID</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Address
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="addressLine1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 1</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="addressLine2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 2</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stateProvince" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="countryCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countryOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Preferences &amp; Notes
              </h4>
              <FormField control={form.control} name="roomPreferences" render={({ field }) => (
                <FormItem>
                  <FormLabel>Room preferences (JSON)</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dietaryRequirements" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary requirements</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="specialNeeds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Special needs</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="alertNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-600">Alert Notes</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="internalNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal notes (staff only)</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
