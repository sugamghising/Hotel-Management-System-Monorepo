"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Guest } from "@/lib/hooks/useGuests";

interface GuestMarketingCardProps {
  guest: Guest;
}

export function GuestMarketingCard({ guest }: GuestMarketingCardProps) {
  const items = [
    { label: "Marketing consent", value: guest.marketing.consent },
    { label: "Email opt-in", value: guest.marketing.emailOptIn },
    { label: "SMS opt-in", value: guest.marketing.smsOptIn },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Marketing &amp; Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <Badge
              variant="outline"
              className={cn(
                "font-medium text-xs px-2 py-0.5 h-auto gap-1",
                item.value
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200",
              )}
            >
              {item.value ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {item.value ? "Yes" : "No"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
