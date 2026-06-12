"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCreateVendor, useUpdateVendor } from "@/lib/hooks/useInventory";
import type { Vendor, CreateVendorInput, UpdateVendorInput } from "@/lib/hooks/useInventory";

interface VendorFormDialogProps {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
}

const PAYMENT_TERMS = ["COD", "NET7", "NET15", "NET30", "NET45", "NET60", "OTHER"];

export function VendorFormDialog({ open, onClose, vendor }: VendorFormDialogProps) {
  const { mutate: create, isPending: creating } = useCreateVendor();
  const { mutate: update, isPending: updating } = useUpdateVendor();
  const isEdit = !!vendor;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postal, setPostal] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxId, setTaxId] = useState("");

  useEffect(() => {
    if (open) {
      if (vendor) {
        setCode(vendor.code);
        setName(vendor.name);
        setContactPerson(vendor.contactPerson ?? "");
        setEmail(vendor.email ?? "");
        setPhone(vendor.phone ?? "");
        setStreet((vendor.address as any)?.street ?? "");
        setCity((vendor.address as any)?.city ?? "");
        setCountry((vendor.address as any)?.country ?? "");
        setPostal((vendor.address as any)?.postal ?? "");
        setPaymentTerms(vendor.paymentTerms ?? "");
        setCurrency(vendor.currencyCode);
        setTaxId(vendor.taxId ?? "");
      } else {
        setCode("");
        setName("");
        setContactPerson("");
        setEmail("");
        setPhone("");
        setStreet("");
        setCity("");
        setCountry("");
        setPostal("");
        setPaymentTerms("");
        setCurrency("USD");
        setTaxId("");
      }
    }
  }, [open, vendor]);

  const handleSubmit = () => {
    if (!code || !name) return;

    const address = street || city || country || postal
      ? { street: street || undefined, city: city || undefined, country: country || undefined, postal: postal || undefined }
      : undefined;

    if (isEdit && vendor) {
      const input: UpdateVendorInput = {
        name,
        contactPerson: contactPerson || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address as Record<string, any> | undefined,
        paymentTerms: paymentTerms || undefined,
      };
      update({ vendorId: vendor.id, input }, { onSuccess: onClose });
    } else {
      const input: CreateVendorInput = {
        code: code.toUpperCase(),
        name,
        contactPerson: contactPerson || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address as Record<string, any> | undefined,
        paymentTerms: paymentTerms || undefined,
        currencyCode: currency,
        taxId: taxId || undefined,
      };
      create(input, { onSuccess: onClose });
    }
  };

  const isValid = !!code && !!name;
  const isPending = creating || updating;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Vendor" : "Create Vendor"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Vendor Code *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1 h-8 font-mono text-xs uppercase"
                disabled={isEdit}
                placeholder="e.g. V-001"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Vendor Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-8"
                placeholder="Vendor name..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Contact Person</Label>
              <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="mt-1 h-8" />
            </div>
            <div>
              <Label className="text-xs font-medium">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-8" />
            </div>
            <div>
              <Label className="text-xs font-medium">Tax ID / VAT</Label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="mt-1 h-8" />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-1">Address</p>
            <div className="grid grid-cols-2 gap-2">
              <Input value={street} onChange={(e) => setStreet(e.target.value)} className="h-8 text-xs" placeholder="Street" />
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-8 text-xs" placeholder="City" />
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className="h-8 text-xs" placeholder="Country" />
              <Input value={postal} onChange={(e) => setPostal(e.target.value)} className="h-8 text-xs" placeholder="Postal code" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "SGD", "THB", "MYR"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Saving..." : isEdit ? "Save" : "Create Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
