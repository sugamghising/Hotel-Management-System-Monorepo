"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUpdateOrgSettings } from "@/lib/hooks/useOrgSettings";
import { Loader2, Check, Shield } from "lucide-react";

interface SecurityTabProps {
  org: Record<string, any>;
  canEdit: boolean;
}

export function SecurityTab({ org, canEdit }: SecurityTabProps) {
  const { mutate: save, isPending } = useUpdateOrgSettings();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [saved, setSaved] = useState(false);

  const settings = org.settings ?? {};

  useEffect(() => {
    const sec = settings.security ?? {};
    setMfaRequired(!!sec.mfaRequired);
    setSessionTimeout(String(sec.sessionTimeoutMinutes ?? "60"));
    setMinPasswordLength(String(sec.passwordPolicy?.minLength ?? "8"));
    setRequireSpecialChar(sec.passwordPolicy?.requireSpecialChar ?? true);
    setRequireNumber(sec.passwordPolicy?.requireNumber ?? true);
    setMaxLoginAttempts(String(sec.maxLoginAttempts ?? "5"));
  }, [settings]);

  const isPristine =
    mfaRequired === (settings.security?.mfaRequired ?? false) &&
    sessionTimeout === String(settings.security?.sessionTimeoutMinutes ?? "60") &&
    minPasswordLength === String(settings.security?.passwordPolicy?.minLength ?? "8") &&
    requireSpecialChar === (settings.security?.passwordPolicy?.requireSpecialChar ?? true) &&
    requireNumber === (settings.security?.passwordPolicy?.requireNumber ?? true) &&
    maxLoginAttempts === String(settings.security?.maxLoginAttempts ?? "5");

  const handleSave = () => {
    save(
      {
        input: {
          settings: {
            ...org.settings,
            security: {
              mfaRequired,
              sessionTimeoutMinutes: Number(sessionTimeout),
              passwordPolicy: {
                minLength: Number(minPasswordLength),
                requireSpecialChar,
                requireNumber,
              },
              maxLoginAttempts: Number(maxLoginAttempts),
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
        <h3 className="text-base font-semibold">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage authentication and access policies for your organization.
        </p>
      </div>
      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-medium cursor-pointer">
              Require Multi-Factor Authentication
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Enforce MFA for all organization users
            </p>
          </div>
          <Switch
            checked={mfaRequired}
            onCheckedChange={canEdit ? setMfaRequired : () => {}}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Session Timeout (minutes)</Label>
          <Select
            value={sessionTimeout}
            onValueChange={canEdit ? setSessionTimeout : undefined}
          >
            <SelectTrigger className="mt-1 h-8 text-sm w-40" disabled={!canEdit}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[15, 30, 60, 120, 240, 480].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m >= 60 ? `${m / 60}h` : `${m}m`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-3">Password Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Minimum Password Length</Label>
            <Input
              type="number"
              min="4"
              max="128"
              value={minPasswordLength}
              onChange={(e) => setMinPasswordLength(e.target.value)}
              className="mt-1 h-8 text-sm w-40"
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Max Login Attempts</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={maxLoginAttempts}
              onChange={(e) => setMaxLoginAttempts(e.target.value)}
              className="mt-1 h-8 text-sm w-40"
              disabled={!canEdit}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium cursor-pointer">
                Require Special Character
              </Label>
              <p className="text-[10px] text-muted-foreground">e.g. !@#$%</p>
            </div>
            <Switch
              checked={requireSpecialChar}
              onCheckedChange={canEdit ? setRequireSpecialChar : () => {}}
              disabled={!canEdit}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-medium cursor-pointer">
                Require Number
              </Label>
              <p className="text-[10px] text-muted-foreground">e.g. 0-9</p>
            </div>
            <Switch
              checked={requireNumber}
              onCheckedChange={canEdit ? setRequireNumber : () => {}}
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">Security recommendations</p>
          <p className="text-xs text-blue-700">
            Enabling MFA and setting a strong password policy helps protect your organization
            from unauthorized access.
          </p>
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
              "Save Security"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
