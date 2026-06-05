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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateGuest, type CreateGuestInput } from "@/lib/hooks/useGuests";
import { cn } from "@/lib/utils";
import {
  guestTypeOptions,
  vipOptions,
  languageOptions,
  countryOptions,
} from "@/lib/constants/guests";
import { ChevronDown } from "lucide-react";

const createGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
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
});

type FormValues = z.infer<typeof createGuestSchema>;

interface CreateGuestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (guest: { id: string }) => void;
}

export function CreateGuestDialog({
  open,
  onClose,
  onSuccess,
}: CreateGuestDialogProps) {
  const { mutate, isPending, data } = useCreateGuest();
  const [addressOpen, setAddressOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createGuestSchema),
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
    },
  });

  const watchedGuestType = form.watch("guestType");
  const watchedCompanyName = form.watch("companyName");
  const showCompany = watchedGuestType === "CORPORATE" || watchedGuestType === "GROUP";
  const showTaxId = showCompany && !!watchedCompanyName;

  useEffect(() => {
    if (data) {
      onSuccess(data);
    }
  }, [data, onSuccess]);

  const onSubmit = (values: FormValues) => {
    const input: CreateGuestInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      languageCode: values.languageCode,
      guestType: values.guestType as CreateGuestInput["guestType"],
      vipStatus: values.vipStatus as CreateGuestInput["vipStatus"],
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
    mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Guest</DialogTitle>
          <DialogDescription>
            Create a new guest profile in the CRM.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1 — Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countryOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="languageCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language preference</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languageOptions.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 2 — Classification */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Classification
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="guestType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest type *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guestTypeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vipStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIP status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vipOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {showCompany && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showTaxId && (
                    <FormField
                      control={form.control}
                      name="companyTaxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company tax ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Section 3 — Address */}
            <div>
              <button
                type="button"
                onClick={() => setAddressOpen(!addressOpen)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide w-full text-left"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    addressOpen && "rotate-180",
                  )}
                />
                Address
              </button>
              {addressOpen && (
                <div className="mt-3 space-y-3">
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address line 1</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address line 2</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stateProvince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countryOptions.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4 — Notes */}
            <div>
              <button
                type="button"
                onClick={() => setNotesOpen(!notesOpen)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide w-full text-left"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    notesOpen && "rotate-180",
                  )}
                />
                Notes
              </button>
              {notesOpen && (
                <div className="mt-3 space-y-3">
                  <FormField
                    control={form.control}
                    name="internalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal notes (staff only)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alertNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-600">
                          Alert notes
                        </FormLabel>
                        <p className="text-xs text-muted-foreground -mt-1 mb-1">
                          This will show as popup at check-in.
                        </p>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Guest"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
