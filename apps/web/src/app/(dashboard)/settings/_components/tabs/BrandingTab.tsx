"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUpdateOrgSettings } from "@/lib/hooks/useOrgSettings";
import { Loader2, Check, Globe } from "lucide-react";

interface BrandingTabProps {
  org: Record<string, any>;
  canEdit: boolean;
}

export function BrandingTab({ org, canEdit }: BrandingTabProps) {
  const { mutate: save, isPending } = useUpdateOrgSettings();
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [saved, setSaved] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const settings = org.settings ?? {};

  useEffect(() => {
    setLogoUrl(settings.branding?.logoUrl ?? "");
    setFaviconUrl(settings.branding?.faviconUrl ?? "");
    setPrimaryColor(settings.branding?.primaryColor ?? "#2563eb");
    setAccentColor(settings.branding?.accentColor ?? "#f59e0b");
  }, [settings]);

  const isPristine =
    logoUrl === (settings.branding?.logoUrl ?? "") &&
    faviconUrl === (settings.branding?.faviconUrl ?? "") &&
    primaryColor === (settings.branding?.primaryColor ?? "#2563eb") &&
    accentColor === (settings.branding?.accentColor ?? "#f59e0b");

  const handleSave = () => {
    save(
      {
        input: {
          settings: {
            ...org.settings,
            branding: {
              logoUrl: logoUrl || null,
              faviconUrl: faviconUrl || null,
              primaryColor,
              accentColor,
            },
          },
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
        <h3 className="text-base font-semibold">Branding</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your organization&apos;s interface.
        </p>
      </div>
      <Separator />

      <div>
        <Label className="text-xs font-medium">Logo URL</Label>
        <Input
          type="url"
          value={logoUrl}
          onChange={(e) => { setLogoUrl(e.target.value); setPreviewError(false); }}
          className="mt-1 h-8 text-sm"
          disabled={!canEdit}
          placeholder="https://example.com/logo.png"
        />
        {logoUrl && (
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
            </div>
            {previewError && (
              <span className="text-xs text-muted-foreground">
                Image could not be loaded. Check the URL.
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        <Label className="text-xs font-medium">Favicon URL</Label>
        <Input
          type="url"
          value={faviconUrl}
          onChange={(e) => setFaviconUrl(e.target.value)}
          className="mt-1 h-8 text-sm"
          disabled={!canEdit}
          placeholder="https://example.com/favicon.ico"
        />
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-3">Color Scheme</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Primary Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={!canEdit}
                className="h-8 w-10 rounded border cursor-pointer disabled:opacity-50"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-8 text-sm font-mono w-28"
                disabled={!canEdit}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Accent Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                disabled={!canEdit}
                className="h-8 w-10 rounded border cursor-pointer disabled:opacity-50"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 text-sm font-mono w-28"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-2">Preview</h4>
        <div
          className="rounded-lg border p-4 space-y-2"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: primaryColor }} />
            <span className="text-sm font-semibold">{org.name ?? "Organization"}</span>
          </div>
          <div className="flex gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Primary
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: accentColor }}
            >
              Accent
            </span>
          </div>
        </div>
      </div>

      {!canEdit && (
        <p className="text-xs text-muted-foreground italic">
          You have view-only access to these settings.
        </p>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button size="sm" disabled={isPristine || isPending} onClick={handleSave}>
            {isPending ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving...</>
            ) : saved ? (
              <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />Saved</>
            ) : (
              "Save Branding"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
