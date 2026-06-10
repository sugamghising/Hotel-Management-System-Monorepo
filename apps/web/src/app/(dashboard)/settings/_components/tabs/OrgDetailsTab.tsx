"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUpdateOrgDetails } from "@/lib/hooks/useOrgSettings";
import { Loader2, Check, Lock } from "lucide-react";

interface OrgDetailsTabProps {
  org: Record<string, any>;
  canEdit: boolean;
}

export function OrgDetailsTab({ org, canEdit }: OrgDetailsTabProps) {
  const { mutate: save, isPending } = useUpdateOrgDetails();
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(org.name ?? "");
    setLegalName(org.legalName ?? "");
    setEmail(org.email ?? "");
    setPhone(org.phone ?? "");
    setWebsite(org.website ?? "");
    setTaxId(org.taxId ?? "");
  }, [org]);

  const isPristine =
    name === (org.name ?? "") &&
    legalName === (org.legalName ?? "") &&
    email === (org.email ?? "") &&
    phone === (org.phone ?? "") &&
    website === (org.website ?? "") &&
    taxId === (org.taxId ?? "");

  const handleSave = () => {
    save(
      {
        input: {
          name: name || undefined,
          legalName: legalName || undefined,
          email: email || undefined,
          phone: phone || null,
          website: website || null,
          taxId: taxId || null,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Organization Details</h3>
        <p className="text-sm text-muted-foreground">
          Core information about your organization.
        </p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium">Organization name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Legal name</Label>
          <Input
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
            placeholder="Registered legal entity name"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Email *</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Phone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Website</Label>
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-1 h-8 text-sm"
            disabled={!canEdit}
            placeholder="https://"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Tax ID / VAT</Label>
          <Input
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="mt-1 h-8 text-sm font-mono"
            disabled={!canEdit}
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-medium">Organization ID</Label>
        <div className="relative mt-1">
          <Input
            value={org.id ?? ""}
            readOnly
            className="h-8 text-sm font-mono bg-muted pr-8"
          />
          <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Internal identifier. Cannot be changed.
        </p>
      </div>

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          You have view-only access to these settings.
        </p>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isPristine || isPending}
            onClick={handleSave}
          >
            {isPending ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</>
            ) : saved ? (
              <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</>
            ) : (
              "Save Details"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
