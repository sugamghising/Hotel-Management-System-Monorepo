"use client";

import { useEffect, useState } from "react";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useUpdateHotelGeneral, useUpdateHotelAddress } from "@/lib/hooks/useHotelSettings";
import { countryNames } from "@/lib/constants/guests";
import { timezoneOptions } from "@/lib/constants/timezones";
import { Loader2, Check, ChevronDown } from "lucide-react";
import type { Hotel } from "@/lib/api/modules/hotels";

interface ContactTabProps {
  hotel: Hotel;
  canEdit: boolean;
}

const commonCountries = ["US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "AE", "SA", "JP", "CN", "IN", "SG", "BR", "MX"];
const otherCountries = Object.keys(countryNames).filter((c) => !commonCountries.includes(c));

export function ContactTab({ hotel, canEdit }: ContactTabProps) {
  const { mutate: saveContact, isPending: contactPending } = useUpdateHotelGeneral();
  const { mutate: saveAddress, isPending: addressPending } = useUpdateHotelAddress();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fax, setFax] = useState("");
  const [website, setWebsite] = useState("");
  const [contactSaved, setContactSaved] = useState(false);

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("");
  const [locationSaved, setLocationSaved] = useState(false);

  const h = hotel as any;

  useEffect(() => {
    setEmail(hotel.contact?.email ?? "");
    setPhone(hotel.contact?.phone ?? "");
    setFax(h.contact?.fax ?? "");
    setWebsite(hotel.contact?.website ?? "");
  }, [hotel]);

  useEffect(() => {
    setAddressLine1(h.address?.line1 ?? "");
    setAddressLine2(h.address?.line2 ?? "");
    setCity(h.address?.city ?? "");
    setStateProvince(h.address?.stateProvince ?? "");
    setPostalCode(h.address?.postalCode ?? "");
    setCountryCode(hotel.countryCode ?? "");
  }, [hotel, h]);

  useEffect(() => {
    setLatitude(h.location?.latitude != null ? String(h.location.latitude) : "");
    setLongitude(h.location?.longitude != null ? String(h.location.longitude) : "");
    setTimezone(hotel.timezone ?? "UTC");
  }, [hotel, h]);

  const handleSaveContact = () => {
    saveContact(
      { input: { email: email || undefined, phone: phone || undefined, fax: fax || null, website: website || null } },
      { onSuccess: () => { setContactSaved(true); setTimeout(() => setContactSaved(false), 2000); } },
    );
  };

  const handleSaveAddress = () => {
    saveAddress(
      {
        input: {
          addressLine1: addressLine1 || undefined,
          addressLine2: addressLine2 || null,
          city: city || undefined,
          stateProvince: stateProvince || null,
          postalCode: postalCode || undefined,
          countryCode: countryCode || undefined,
        },
      },
      { onSuccess: () => { setAddressSaved(true); setTimeout(() => setAddressSaved(false), 2000); } },
    );
  };

  const handleSaveLocation = () => {
    saveAddress(
      {
        input: {
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          timezone: timezone || undefined,
        },
      },
      { onSuccess: () => { setLocationSaved(true); setTimeout(() => setLocationSaved(false), 2000); } },
    );
  };

  const contactPristine =
    email === (hotel.contact?.email ?? "") &&
    phone === (hotel.contact?.phone ?? "") &&
    fax === (h.contact?.fax ?? "") &&
    website === (hotel.contact?.website ?? "");

  const addressPristine =
    addressLine1 === (h.address?.line1 ?? "") &&
    addressLine2 === (h.address?.line2 ?? "") &&
    city === (h.address?.city ?? "") &&
    stateProvince === (h.address?.stateProvince ?? "") &&
    postalCode === (h.address?.postalCode ?? "") &&
    countryCode === (hotel.countryCode ?? "");

  const locationPristine =
    latitude === (h.location?.latitude != null ? String(h.location.latitude) : "") &&
    longitude === (h.location?.longitude != null ? String(h.location.longitude) : "") &&
    timezone === (hotel.timezone ?? "UTC");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold">Contact Details</h3>
        <p className="text-sm text-muted-foreground">Primary contact information for the hotel.</p>
        <Separator className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">Phone *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">Fax</Label>
            <Input value={fax} onChange={(e) => setFax(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">Website</Label>
            <Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} placeholder="https://" />
          </div>
        </div>
        {canEdit && (
          <div className="flex justify-end mt-4">
            <Button size="sm" disabled={contactPristine || contactPending} onClick={handleSaveContact}>
              {contactPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : contactSaved ? <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</> : "Save Contact"}
            </Button>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold">Address</h3>
        <p className="text-sm text-muted-foreground">Physical location of the property.</p>
        <Separator className="my-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="text-xs font-medium">Address line 1 *</Label>
            <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium">Address line 2</Label>
            <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">City *</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">State / Province</Label>
            <Input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">Postal Code *</Label>
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
          </div>
          <div>
            <Label className="text-xs font-medium">Country *</Label>
            <Select value={countryCode} onValueChange={canEdit ? setCountryCode : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-[11px] text-muted-foreground">Common</SelectLabel>
                  {commonCountries.map((c) => (
                    <SelectItem key={c} value={c}>{countryNames[c]} ({c})</SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-[11px] text-muted-foreground">All countries</SelectLabel>
                  {otherCountries.map((c) => (
                    <SelectItem key={c} value={c}>{countryNames[c]} ({c})</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        {canEdit && (
          <div className="flex justify-end mt-4">
            <Button size="sm" disabled={addressPristine || addressPending} onClick={handleSaveAddress}>
              {addressPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : addressSaved ? <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</> : "Save Address"}
            </Button>
          </div>
        )}
      </div>

      <details className="group">
        <summary className="text-sm font-medium text-muted-foreground cursor-pointer flex items-center gap-1">
          <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180 transition-transform" />
          Location Details
        </summary>
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Latitude</Label>
              <Input type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
            </div>
            <div>
              <Label className="text-xs font-medium">Longitude</Label>
              <Input type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="mt-1 h-8 text-sm" disabled={!canEdit} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Timezone</Label>
            <Select value={timezone} onValueChange={canEdit ? setTimezone : undefined}>
              <SelectTrigger className="mt-1 h-8 text-sm" disabled={!canEdit}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((group) => (
                  <SelectGroup key={group.group}>
                    <SelectLabel className="text-[11px] text-muted-foreground">{group.group}</SelectLabel>
                    {group.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canEdit && (
            <div className="flex justify-end">
              <Button size="sm" disabled={locationPristine || addressPending} onClick={handleSaveLocation}>
                {addressPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</> : locationSaved ? <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</> : "Save Location"}
              </Button>
            </div>
          )}
        </div>
      </details>

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          You have view-only access to these settings.
        </p>
      )}
    </div>
  );
}
